import fs from "node:fs";
import path from "node:path";

export const TDT_PHOTOSEAL_09_R1_SAVE_RUNTIME_RECEIPT_ARTIFACT =
  "artifacts/TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_RECEIPT.json";

export function makeTdtPhotoSeal09R1SaveRuntimeReceipt(overrides = {}) {
  return {
    patchId: "TDT-PHOTOSEAL-09-R1",
    stage: "browser-jpeg-save-runtime-smoke-blob-url-revoke-no-auto-download",
    staticContractSmoke: "PASS",
    browserJpegSaveRuntimeSmoke: "NOT_RUN",
    browserJpegSaveRuntimeReason: "PLAYWRIGHT_NOT_INSTALLED",
    browserRuntimeActuallyExecuted: false,
    runtimePassClaimed: false,
    appPageLoaded: false,
    saveSmokeHookFound: false,
    saveSmokeHookCalled: false,
    blobRuntimeAvailable: false,
    objectUrlRuntimeAvailable: false,
    anchorDownloadRuntimeAvailable: false,
    syntheticJpegBytesCreated: false,
    jpegByteLength: 0,
    jpegBlobCreated: false,
    jpegBlobMimeType: "image/jpeg",
    objectUrlCreateObserved: false,
    objectUrlRevokeObserved: false,
    objectUrlCreated: false,
    objectUrlRevoked: false,
    anchorCreated: false,
    anchorDownloadSet: false,
    anchorClickObserved: false,
    anchorDownloadUsed: false,
    userActionRequired: true,
    userActionObserved: false,
    autoDownloadDetected: false,
    saveReceiptPresent: false,
    rawAuditBundleSavedByDefault: false,
    auditBundleOptional: true,
    auditBundleAutosaveDetected: false,
    staticSmokeUsedAsRuntimePass: false,
    mockSaveReceiptUsedForRuntimePass: false,
    defaultProfileChanged: false,
    promotedToDefault: false,
    receiptCaptured: true,
    receiptArtifactPath: TDT_PHOTOSEAL_09_R1_SAVE_RUNTIME_RECEIPT_ARTIFACT,
    ...overrides,
  };
}

export function writeTdtPhotoSeal09R1SaveRuntimeReceipt(receipt, rootDir = process.cwd()) {
  const targetPath = path.join(rootDir, TDT_PHOTOSEAL_09_R1_SAVE_RUNTIME_RECEIPT_ARTIFACT);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  return targetPath;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const receipt = makeTdtPhotoSeal09R1SaveRuntimeReceipt();
  writeTdtPhotoSeal09R1SaveRuntimeReceipt(receipt);
  console.log("NOT_RUN_TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_SMOKE");
}
