import type { PhotoSealExportAuditSummary } from "../receipt/exportAuditTypes";
import { savePhotoSealJpeg } from "./saveJpeg";
import { createPhotoSealSyntheticJpegBytes } from "./saveRuntimeSyntheticJpeg";
import {
  makePhotoSealSaveRuntimeSmokeReceipt,
  type PhotoSealJpegSaveRuntimeSmokeReceipt,
} from "./saveRuntimeSmokeTypes";

function makeRuntimeSmokeAuditSummary(): PhotoSealExportAuditSummary {
  return {
    patchId: "TDT-PHOTOSEAL-06",
    stage: "export-receipt-surface-user-visible-quality-audit",
    exportStatus: "pass",
    exportStatusLabel: "검증 완료",
    width: 1,
    height: 1,
    targetBytes: 1024,
    outputBytes: 22,
    reachedTarget: true,
    resizeProfile: "export-ewa",
    resizeProfileLabel: "export-ewa baseline",
    defaultProfileUsed: true,
    candidateProfileUsed: false,
    colorPipeline: {
      decodedColorSpace: "srgb",
      resizeInputColorSpace: "srgb",
      resizeOutputColorSpace: "srgb",
      wasmInputColorSpace: "srgb",
      jpegColorSpace: "srgb",
      hiddenGammaTransformUsed: false,
      doubleGammaDetected: false,
      implicitColorTransformUsed: false,
      status: "pass",
      label: "sRGB maintained",
    },
    jpeg: {
      encodedColorSpace: "srgb",
      subsampling: "444",
      targetBytesUsed: true,
      qualitySearchUsed: true,
      compressionHandleSearchUsed: true,
      attemptsCount: 1,
      jpegMagicValid: true,
      samplingAuditIs444: true,
      resizedInsideEncoder: false,
      cropInsideEncoder: false,
      fallbackUsed: false,
      status: "pass",
      label: "JPEG sRGB / 4:4:4",
    },
    bridge: {
      workerUsed: true,
      workerSingleThread: true,
      workerPoolUsed: false,
      nestedWorkerUsed: false,
      arrayBufferTransferUsed: true,
      paddedBufferTransferred: false,
      wasmSimdRequired: true,
      wasmSingleThread: true,
      wasmPthreadUsed: false,
      sharedArrayBufferRequired: false,
      workerColorTransformUsed: false,
      workerGammaTransformUsed: false,
      workerHiddenLinearizationUsed: false,
      workerDoubleGammaDetected: false,
      status: "pass",
      label: "Worker bridge sealed",
    },
    quality: {
      resizeProfile: "export-ewa",
      defaultProfileChanged: false,
      promotedToDefault: false,
      qmapUsed: false,
      tileMaskUsed: false,
      oklabUsed: false,
      parityGateAvailable: true,
      status: "pass",
      label: "export-ewa baseline",
    },
    warnings: [],
    blockers: [],
    receiptAvailable: true,
  };
}

function runtimeCapabilityReceipt(reason: PhotoSealJpegSaveRuntimeSmokeReceipt["browserJpegSaveRuntimeReason"]): PhotoSealJpegSaveRuntimeSmokeReceipt {
  return makePhotoSealSaveRuntimeSmokeReceipt({
    status: "NOT_RUN",
    reason,
    browserRuntimeActuallyExecuted: false,
    runtimePassClaimed: false,
    appPageLoaded: typeof document !== "undefined",
    blobRuntimeAvailable: typeof Blob !== "undefined",
    objectUrlRuntimeAvailable: typeof URL !== "undefined" && typeof URL.createObjectURL === "function" && typeof URL.revokeObjectURL === "function",
    anchorDownloadRuntimeAvailable: typeof HTMLAnchorElement !== "undefined",
  });
}

export async function runPhotoSealBrowserJpegSaveSmoke(args?: {
  sourceFileName?: string;
  userActionObserved?: boolean;
}): Promise<PhotoSealJpegSaveRuntimeSmokeReceipt> {
  if (typeof Blob === "undefined") {
    return runtimeCapabilityReceipt("NO_BLOB_RUNTIME");
  }
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function" || typeof URL.revokeObjectURL !== "function") {
    return runtimeCapabilityReceipt("NO_OBJECT_URL_RUNTIME");
  }
  if (typeof document === "undefined" || typeof HTMLAnchorElement === "undefined") {
    return runtimeCapabilityReceipt("NO_ANCHOR_DOWNLOAD_RUNTIME");
  }

  const sourceJpeg = createPhotoSealSyntheticJpegBytes();
  if (sourceJpeg.byteLength <= 0) {
    return makePhotoSealSaveRuntimeSmokeReceipt({
      status: "FAIL",
      reason: "JPEG_BYTES_MISSING",
      browserRuntimeActuallyExecuted: true,
      runtimePassClaimed: false,
      appPageLoaded: true,
      syntheticJpegBytesCreated: false,
    });
  }

  const originalCreateObjectURL = URL.createObjectURL.bind(URL);
  const originalRevokeObjectURL = URL.revokeObjectURL.bind(URL);
  const originalClick = HTMLAnchorElement.prototype.click;

  let objectUrlCreateObserved = false;
  let objectUrlRevokeObserved = false;
  let anchorCreated = false;
  let anchorDownloadSet = false;
  let anchorClickObserved = false;

  URL.createObjectURL = ((object: Blob | MediaSource) => {
    objectUrlCreateObserved = true;
    return originalCreateObjectURL(object);
  }) as typeof URL.createObjectURL;

  URL.revokeObjectURL = ((url: string) => {
    objectUrlRevokeObserved = true;
    return originalRevokeObjectURL(url);
  }) as typeof URL.revokeObjectURL;

  HTMLAnchorElement.prototype.click = function clickWithPhotoSealJpegSaveSmokeSpy() {
    anchorCreated = true;
    anchorDownloadSet = typeof this.download === "string" && this.download.length > 0;
    anchorClickObserved = true;
    return originalClick.call(this);
  };

  try {
    const userActionObserved = args?.userActionObserved ?? true;
    const saveReceipt = await savePhotoSealJpeg({
      jpg: sourceJpeg,
      auditSummary: makeRuntimeSmokeAuditSummary(),
      sourceFileName: args?.sourceFileName ?? "photoseal-save-smoke.jpg",
      userActionObserved,
    });

    const isSaved = saveReceipt.saveStatus === "saved";
    const revokeValid = saveReceipt.objectUrlRevoked && objectUrlRevokeObserved;
    const urlValid = saveReceipt.objectUrlCreated && objectUrlCreateObserved;
    const anchorValid = saveReceipt.anchorDownloadUsed && anchorClickObserved && anchorDownloadSet;
    const userActionValid = userActionObserved && saveReceipt.userActionObserved;
    const pass = isSaved && urlValid && revokeValid && anchorValid && userActionValid;

    return makePhotoSealSaveRuntimeSmokeReceipt({
      status: pass ? "PASS" : "FAIL",
      reason: pass
        ? "OK"
        : !userActionValid
          ? "USER_ACTION_REQUIRED_BYPASSED"
          : !urlValid
            ? "OBJECT_URL_CREATE_FAILED"
            : !anchorValid
              ? "ANCHOR_DOWNLOAD_FAILED"
              : !revokeValid
                ? "OBJECT_URL_REVOKE_FAILED"
                : "SAVE_RECEIPT_STATUS_MISMATCH",
      browserRuntimeActuallyExecuted: true,
      runtimePassClaimed: pass,
      appPageLoaded: true,
      saveSmokeHookFound: true,
      saveSmokeHookCalled: true,
      blobRuntimeAvailable: true,
      objectUrlRuntimeAvailable: true,
      anchorDownloadRuntimeAvailable: true,
      syntheticJpegBytesCreated: true,
      jpegByteLength: sourceJpeg.byteLength,
      jpegBlobCreated: saveReceipt.blobCreated,
      objectUrlCreateObserved,
      objectUrlRevokeObserved,
      objectUrlCreated: saveReceipt.objectUrlCreated,
      objectUrlRevoked: saveReceipt.objectUrlRevoked,
      anchorCreated,
      anchorDownloadSet,
      anchorClickObserved,
      anchorDownloadUsed: saveReceipt.anchorDownloadUsed,
      userActionObserved: saveReceipt.userActionObserved,
      saveReceiptPresent: true,
      saveStatus: saveReceipt.saveStatus,
      saveReason: saveReceipt.saveReason,
    });
  } catch (error) {
    return makePhotoSealSaveRuntimeSmokeReceipt({
      status: "FAIL",
      reason: "SAVE_RECEIPT_STATUS_MISMATCH",
      browserRuntimeActuallyExecuted: true,
      runtimePassClaimed: false,
      appPageLoaded: true,
      syntheticJpegBytesCreated: true,
      jpegByteLength: sourceJpeg.byteLength,
      objectUrlCreateObserved,
      objectUrlRevokeObserved,
      saveReason: error instanceof Error ? error.message : "unknown save runtime smoke failure",
    });
  } finally {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    HTMLAnchorElement.prototype.click = originalClick;
  }
}

export const TDT_PHOTOSEAL_09_R1_BROWSER_SAVE_SMOKE_POLICY =
  "Browser JPEG save smoke observes Blob, object URL create/revoke, anchor download, and explicit user action only.";
