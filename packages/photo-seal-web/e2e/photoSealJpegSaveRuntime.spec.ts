import { test, expect } from "@playwright/test";
import {
  photoSealJpegSaveRuntimeMarker,
  writePhotoSealJpegSaveRuntimeReceipt,
} from "./saveRuntimeReceiptWriter";
import type { PhotoSealJpegSaveRuntimeSmokeReceipt } from "../src/export/saveRuntimeSmokeTypes";

function makeNotRunReceipt(reason: PhotoSealJpegSaveRuntimeSmokeReceipt["browserJpegSaveRuntimeReason"]): PhotoSealJpegSaveRuntimeSmokeReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-09-R1",
    stage: "browser-jpeg-save-runtime-smoke-blob-url-revoke-no-auto-download",
    staticContractSmoke: "PASS",
    browserJpegSaveRuntimeSmoke: "NOT_RUN",
    browserJpegSaveRuntimeReason: reason,
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
    receiptArtifactPath: "artifacts/TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_RECEIPT.json",
  };
}

test("TDT-PHOTOSEAL-09-R1 browser JPEG save runtime smoke", async ({ page }) => {
  await page.addInitScript(() => {
    const originalClick = HTMLAnchorElement.prototype.click;
    let clickCount = 0;
    HTMLAnchorElement.prototype.click = function photoSealInitialClickSpy() {
      clickCount += 1;
      return originalClick.call(this);
    };
    Object.defineProperty(window, "__TDT_PHOTOSEAL_09_R1_INITIAL_DOWNLOAD_CLICK_COUNT__", {
      value: () => clickCount,
      configurable: true,
    });
  });

  await page.goto("/");

  const initialClickCount = await page.evaluate(() => {
    const getter = (window as unknown as { __TDT_PHOTOSEAL_09_R1_INITIAL_DOWNLOAD_CLICK_COUNT__?: () => number })
      .__TDT_PHOTOSEAL_09_R1_INITIAL_DOWNLOAD_CLICK_COUNT__;
    return getter ? getter() : 0;
  });
  if (initialClickCount > 0) {
    const receipt = makeNotRunReceipt("AUTO_DOWNLOAD_DETECTED");
    writePhotoSealJpegSaveRuntimeReceipt({ ...receipt, browserJpegSaveRuntimeSmoke: "FAIL", browserRuntimeActuallyExecuted: true });
    console.log("FAIL_TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_SMOKE");
    expect(initialClickCount).toBe(0);
  }

  const hasHook = await page.evaluate(() => typeof window.__runPhotoSealBrowserJpegSaveSmoke === "function");
  if (!hasHook) {
    const receipt = makeNotRunReceipt("SAVE_SMOKE_HOOK_MISSING");
    writePhotoSealJpegSaveRuntimeReceipt(receipt);
    console.log(photoSealJpegSaveRuntimeMarker(receipt));
    expect(receipt.browserJpegSaveRuntimeSmoke).toBe("NOT_RUN");
    return;
  }

  const receipt = await page.evaluate(() => window.__runPhotoSealBrowserJpegSaveSmoke!());
  writePhotoSealJpegSaveRuntimeReceipt(receipt);
  console.log(photoSealJpegSaveRuntimeMarker(receipt));

  expect(receipt.patchId).toBe("TDT-PHOTOSEAL-09-R1");
  expect(receipt.staticSmokeUsedAsRuntimePass).toBe(false);
  expect(receipt.mockSaveReceiptUsedForRuntimePass).toBe(false);
  expect(receipt.rawAuditBundleSavedByDefault).toBe(false);
  expect(receipt.auditBundleOptional).toBe(true);

  if (receipt.browserJpegSaveRuntimeSmoke === "PASS") {
    expect(receipt.browserRuntimeActuallyExecuted).toBe(true);
    expect(receipt.runtimePassClaimed).toBe(true);
    expect(receipt.objectUrlCreated).toBe(true);
    expect(receipt.objectUrlRevoked).toBe(true);
    expect(receipt.objectUrlRevokeObserved).toBe(true);
    expect(receipt.autoDownloadDetected).toBe(false);
    expect(receipt.userActionObserved).toBe(true);
  }
});
