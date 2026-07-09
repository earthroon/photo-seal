import type { PhotoSealExportAuditSummary } from "../receipt/exportAuditTypes";
import { createJpegBlob, downloadBlobWithAnchor } from "./blobDownload";
import { getPhotoSealSaveErrorCode } from "./saveError";
import { sanitizePhotoSealFileName } from "./saveFileName";
import { makePhotoSealJpegSaveReceipt, type PhotoSealJpegSaveReceipt } from "./saveReceipt";
import type { PhotoSealSaveReason } from "./saveTypes";

function byteLengthOf(input: Uint8Array | ArrayBuffer): number {
  return input instanceof Uint8Array ? input.byteLength : input.byteLength;
}

function statusForReason(reason: PhotoSealSaveReason): "failed" | "unsupported" {
  return reason === "BLOB_UNAVAILABLE" || reason === "OBJECT_URL_UNAVAILABLE" ? "unsupported" : "failed";
}

export async function savePhotoSealJpeg(args: {
  jpg: Uint8Array | ArrayBuffer;
  auditSummary: PhotoSealExportAuditSummary;
  sourceFileName?: string;
  userActionObserved: boolean;
}): Promise<PhotoSealJpegSaveReceipt> {
  const fallbackName = "photoseal-export";
  const fileName = sanitizePhotoSealFileName({
    inputName: args.sourceFileName,
    fallbackBaseName: fallbackName,
    extension: "jpg",
  }).fileName;
  const jpegByteLength = byteLengthOf(args.jpg);

  if (!args.userActionObserved) {
    return makePhotoSealJpegSaveReceipt({
      saveStatus: "failed",
      saveReason: "USER_ACTION_REQUIRED",
      userActionObserved: false,
      jpegByteLength,
      blobCreated: false,
      blobByteLength: 0,
      objectUrlCreated: false,
      objectUrlRevoked: false,
      anchorDownloadUsed: false,
      fileName,
      auditSummary: args.auditSummary,
    });
  }

  if (jpegByteLength <= 0) {
    return makePhotoSealJpegSaveReceipt({
      saveStatus: "failed",
      saveReason: "NO_JPEG_BYTES",
      userActionObserved: true,
      jpegByteLength,
      blobCreated: false,
      blobByteLength: 0,
      objectUrlCreated: false,
      objectUrlRevoked: false,
      anchorDownloadUsed: false,
      fileName,
      auditSummary: args.auditSummary,
    });
  }

  try {
    const blob = createJpegBlob({ jpg: args.jpg });
    const download = downloadBlobWithAnchor({
      blob,
      fileName,
      userActionObserved: true,
    });
    const saved = download.objectUrlCreated && download.objectUrlRevoked && download.anchorDownloadUsed;
    return makePhotoSealJpegSaveReceipt({
      saveStatus: saved ? "saved" : "failed",
      saveReason: saved ? "OK" : "DOWNLOAD_TRIGGER_FAILED",
      userActionObserved: true,
      jpegByteLength,
      blobCreated: true,
      blobByteLength: blob.size,
      objectUrlCreated: download.objectUrlCreated,
      objectUrlRevoked: download.objectUrlRevoked,
      anchorDownloadUsed: download.anchorDownloadUsed,
      fileName,
      auditSummary: args.auditSummary,
    });
  } catch (error) {
    const reason = getPhotoSealSaveErrorCode(error);
    return makePhotoSealJpegSaveReceipt({
      saveStatus: statusForReason(reason),
      saveReason: reason,
      userActionObserved: true,
      jpegByteLength,
      blobCreated: false,
      blobByteLength: 0,
      objectUrlCreated: false,
      objectUrlRevoked: false,
      anchorDownloadUsed: false,
      fileName,
      auditSummary: args.auditSummary,
    });
  }
}
