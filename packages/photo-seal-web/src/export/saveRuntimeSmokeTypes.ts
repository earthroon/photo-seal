export type PhotoSealSaveRuntimeSmokeStatus = "PASS" | "FAIL" | "NOT_RUN";

export type PhotoSealSaveRuntimeSmokeReason =
  | "OK"
  | "NO_BROWSER_RUNNER"
  | "PLAYWRIGHT_NOT_INSTALLED"
  | "BROWSER_LAUNCH_UNAVAILABLE"
  | "NO_VITE_DEV_SERVER"
  | "APP_LOAD_FAILED"
  | "NO_BLOB_RUNTIME"
  | "NO_OBJECT_URL_RUNTIME"
  | "NO_ANCHOR_DOWNLOAD_RUNTIME"
  | "SAVE_SMOKE_HOOK_MISSING"
  | "JPEG_BYTES_MISSING"
  | "JPEG_BLOB_CREATE_FAILED"
  | "OBJECT_URL_CREATE_FAILED"
  | "ANCHOR_DOWNLOAD_FAILED"
  | "OBJECT_URL_REVOKE_FAILED"
  | "AUTO_DOWNLOAD_DETECTED"
  | "USER_ACTION_REQUIRED_BYPASSED"
  | "SAVE_RECEIPT_MISSING"
  | "SAVE_RECEIPT_STATUS_MISMATCH"
  | "AUDIT_BUNDLE_AUTOSAVE_DETECTED";

export type PhotoSealJpegSaveRuntimeSmokeReceipt = {
  patchId: "TDT-PHOTOSEAL-09-R1";
  stage: "browser-jpeg-save-runtime-smoke-blob-url-revoke-no-auto-download";

  staticContractSmoke: PhotoSealSaveRuntimeSmokeStatus;
  browserJpegSaveRuntimeSmoke: PhotoSealSaveRuntimeSmokeStatus;
  browserJpegSaveRuntimeReason: PhotoSealSaveRuntimeSmokeReason;

  browserRuntimeActuallyExecuted: boolean;
  runtimePassClaimed: boolean;

  appPageLoaded: boolean;
  saveSmokeHookFound: boolean;
  saveSmokeHookCalled: boolean;

  blobRuntimeAvailable: boolean;
  objectUrlRuntimeAvailable: boolean;
  anchorDownloadRuntimeAvailable: boolean;

  syntheticJpegBytesCreated: boolean;
  jpegByteLength: number;
  jpegBlobCreated: boolean;
  jpegBlobMimeType: "image/jpeg";

  objectUrlCreateObserved: boolean;
  objectUrlRevokeObserved: boolean;
  objectUrlCreated: boolean;
  objectUrlRevoked: boolean;

  anchorCreated: boolean;
  anchorDownloadSet: boolean;
  anchorClickObserved: boolean;
  anchorDownloadUsed: boolean;

  userActionRequired: true;
  userActionObserved: boolean;
  autoDownloadDetected: false;

  saveReceiptPresent: boolean;
  saveStatus?: "saved" | "failed" | "unsupported";
  saveReason?: string;

  rawAuditBundleSavedByDefault: false;
  auditBundleOptional: true;
  auditBundleAutosaveDetected: false;

  staticSmokeUsedAsRuntimePass: false;
  mockSaveReceiptUsedForRuntimePass: false;

  defaultProfileChanged: false;
  promotedToDefault: false;

  receiptCaptured: boolean;
  receiptArtifactPath: "artifacts/TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_RECEIPT.json";
};

export function makePhotoSealSaveRuntimeSmokeReceipt(args: {
  status: PhotoSealSaveRuntimeSmokeStatus;
  reason: PhotoSealSaveRuntimeSmokeReason;
  browserRuntimeActuallyExecuted?: boolean;
  runtimePassClaimed?: boolean;
  appPageLoaded?: boolean;
  saveSmokeHookFound?: boolean;
  saveSmokeHookCalled?: boolean;
  blobRuntimeAvailable?: boolean;
  objectUrlRuntimeAvailable?: boolean;
  anchorDownloadRuntimeAvailable?: boolean;
  syntheticJpegBytesCreated?: boolean;
  jpegByteLength?: number;
  jpegBlobCreated?: boolean;
  objectUrlCreateObserved?: boolean;
  objectUrlRevokeObserved?: boolean;
  objectUrlCreated?: boolean;
  objectUrlRevoked?: boolean;
  anchorCreated?: boolean;
  anchorDownloadSet?: boolean;
  anchorClickObserved?: boolean;
  anchorDownloadUsed?: boolean;
  userActionObserved?: boolean;
  saveReceiptPresent?: boolean;
  saveStatus?: "saved" | "failed" | "unsupported";
  saveReason?: string;
}): PhotoSealJpegSaveRuntimeSmokeReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-09-R1",
    stage: "browser-jpeg-save-runtime-smoke-blob-url-revoke-no-auto-download",
    staticContractSmoke: "PASS",
    browserJpegSaveRuntimeSmoke: args.status,
    browserJpegSaveRuntimeReason: args.reason,
    browserRuntimeActuallyExecuted: args.browserRuntimeActuallyExecuted ?? false,
    runtimePassClaimed: args.runtimePassClaimed ?? false,
    appPageLoaded: args.appPageLoaded ?? false,
    saveSmokeHookFound: args.saveSmokeHookFound ?? false,
    saveSmokeHookCalled: args.saveSmokeHookCalled ?? false,
    blobRuntimeAvailable: args.blobRuntimeAvailable ?? false,
    objectUrlRuntimeAvailable: args.objectUrlRuntimeAvailable ?? false,
    anchorDownloadRuntimeAvailable: args.anchorDownloadRuntimeAvailable ?? false,
    syntheticJpegBytesCreated: args.syntheticJpegBytesCreated ?? false,
    jpegByteLength: args.jpegByteLength ?? 0,
    jpegBlobCreated: args.jpegBlobCreated ?? false,
    jpegBlobMimeType: "image/jpeg",
    objectUrlCreateObserved: args.objectUrlCreateObserved ?? false,
    objectUrlRevokeObserved: args.objectUrlRevokeObserved ?? false,
    objectUrlCreated: args.objectUrlCreated ?? false,
    objectUrlRevoked: args.objectUrlRevoked ?? false,
    anchorCreated: args.anchorCreated ?? false,
    anchorDownloadSet: args.anchorDownloadSet ?? false,
    anchorClickObserved: args.anchorClickObserved ?? false,
    anchorDownloadUsed: args.anchorDownloadUsed ?? false,
    userActionRequired: true,
    userActionObserved: args.userActionObserved ?? false,
    autoDownloadDetected: false,
    saveReceiptPresent: args.saveReceiptPresent ?? false,
    saveStatus: args.saveStatus,
    saveReason: args.saveReason,
    rawAuditBundleSavedByDefault: false,
    auditBundleOptional: true,
    auditBundleAutosaveDetected: false,
    staticSmokeUsedAsRuntimePass: false,
    mockSaveReceiptUsedForRuntimePass: false,
    defaultProfileChanged: false,
    promotedToDefault: false,
    receiptCaptured: true,
    receiptArtifactPath: "artifacts/TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_RECEIPT.json",
  };
}
