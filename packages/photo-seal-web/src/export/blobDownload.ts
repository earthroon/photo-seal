import { PhotoSealSaveError } from "./saveError";

export type PhotoSealBlobDownloadResult = {
  objectUrlCreated: boolean;
  objectUrlRevoked: boolean;
  objectUrlRevokeScheduled: boolean;
  anchorDownloadUsed: boolean;
};

const OBJECT_URL_REVOKE_DELAY_MS = 60_000;

function byteLengthOf(input: Uint8Array | ArrayBuffer): number {
  return input.byteLength;
}

function copyBytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copied = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copied).set(bytes);
  return copied;
}

export function createJpegBlob(args: { jpg: Uint8Array | ArrayBuffer }): Blob {
  if (typeof Blob === "undefined") {
    throw new PhotoSealSaveError("BLOB_UNAVAILABLE", "Blob API is unavailable in this runtime.");
  }

  const byteLength = byteLengthOf(args.jpg);
  if (byteLength <= 0) {
    throw new PhotoSealSaveError("NO_JPEG_BYTES", "JPEG bytes are missing.");
  }

  const bytes = args.jpg instanceof Uint8Array ? args.jpg : new Uint8Array(args.jpg);
  return new Blob([copyBytesToArrayBuffer(bytes)], { type: "image/jpeg" });
}

export function createJsonBlob(jsonText: string): Blob {
  if (typeof Blob === "undefined") {
    throw new PhotoSealSaveError("BLOB_UNAVAILABLE", "Blob API is unavailable in this runtime.");
  }

  if (jsonText.trim().length === 0) {
    throw new PhotoSealSaveError("AUDIT_BUNDLE_MISSING", "Audit bundle JSON is empty.");
  }

  return new Blob([jsonText], { type: "application/json" });
}

export function downloadBlobWithAnchor(args: {
  blob: Blob;
  fileName: string;
  userActionObserved: boolean;
}): PhotoSealBlobDownloadResult {
  if (!args.userActionObserved) {
    throw new PhotoSealSaveError("USER_ACTION_REQUIRED", "Download must be triggered by an explicit user action.");
  }

  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    throw new PhotoSealSaveError("OBJECT_URL_UNAVAILABLE", "Object URL API is unavailable.");
  }

  if (typeof document === "undefined" || typeof document.createElement !== "function") {
    throw new PhotoSealSaveError("DOWNLOAD_TRIGGER_FAILED", "Anchor download is unavailable in this runtime.");
  }

  if (typeof window === "undefined" || typeof window.setTimeout !== "function") {
    throw new PhotoSealSaveError("DOWNLOAD_TRIGGER_FAILED", "Timer API is unavailable in this runtime.");
  }

  let objectUrlCreated = false;
  let anchorDownloadUsed = false;
  let objectUrlRevokeScheduled = false;

  try {
    const objectUrl = URL.createObjectURL(args.blob);
    objectUrlCreated = true;

    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = args.fileName;
    anchor.rel = "noopener";

    // Do not use display:none here.
    // Some mobile browsers are less reliable when clicking a hidden download anchor.
    anchor.style.position = "fixed";
    anchor.style.left = "-9999px";
    anchor.style.top = "0";
    anchor.style.width = "1px";
    anchor.style.height = "1px";
    anchor.style.opacity = "0";
    anchor.style.pointerEvents = "none";

    document.body.appendChild(anchor);
    anchor.click();
    anchorDownloadUsed = true;

    window.setTimeout(() => {
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    }, OBJECT_URL_REVOKE_DELAY_MS);

    objectUrlRevokeScheduled = true;
  } catch (error) {
    throw new PhotoSealSaveError(
      "DOWNLOAD_TRIGGER_FAILED",
      error instanceof Error ? error.message : "Download trigger failed.",
    );
  }

  return {
    objectUrlCreated,
    objectUrlRevoked: false,
    objectUrlRevokeScheduled,
    anchorDownloadUsed,
  };
}