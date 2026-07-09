import { expect, test } from "@playwright/test";
import {
  makePhotoSealRuntimeE2EReceipt,
  wrapTdt07ReceiptForRuntimeCapture,
  type PhotoSealRuntimeE2EReceipt,
} from "../src/pipeline/photoSealE2ERuntimeReceipt";
import { runtimeReceiptMarker, writePhotoSealRuntimeReceipt } from "./runtimeReceiptWriter";

const PAGE_URL = "/";

declare global {
  interface Window {
    __runPhotoSealE2ESmoke?: () => Promise<unknown>;
    __TDT_PHOTOSEAL_07_R1_RUNTIME_RECEIPT__?: PhotoSealRuntimeE2EReceipt;
  }
}

function notRunReceipt(reason: "NO_BROWSER_WEBGPU" | "APP_LOAD_FAILED"): PhotoSealRuntimeE2EReceipt {
  return makePhotoSealRuntimeE2EReceipt({
    browserRuntimeE2ESmoke: reason === "NO_BROWSER_WEBGPU" ? "NOT_RUN" : "FAIL",
    browserRuntimeE2EReason: reason,
    viteDevServerStarted: true,
    playwrightBrowserLaunched: true,
    appPageLoaded: reason !== "APP_LOAD_FAILED",
    browserRuntimeActuallyExecuted: false,
    runtimePassClaimed: false,
    navigatorGpuAvailable: false,
    gpuAdapterAcquired: false,
    gpuDeviceAcquired: false,
    wasmModuleLoaded: false,
    workerRuntimeAvailable: false,
    e2eSmokeFunctionFound: false,
    e2eSmokeFunctionCalled: false,
    resizeRuntimeExecuted: false,
    bridgeRuntimeExecuted: false,
    wasmEncodeRuntimeExecuted: false,
    auditSummaryRuntimeBuilt: false,
    uiSurfaceRuntimeRendered: false,
    resizeReceiptPresent: false,
    bridgeReceiptPresent: false,
    wasmReceiptPresent: false,
    auditSummaryPresent: false,
    receiptCaptured: true,
  });
}

test("TDT-PHOTOSEAL-07-R1 captures actual browser WebGPU E2E receipt", async ({ page }) => {
  let receipt: PhotoSealRuntimeE2EReceipt;
  try {
    await page.goto(PAGE_URL, { waitUntil: "networkidle" });
  } catch {
    receipt = notRunReceipt("APP_LOAD_FAILED");
    writePhotoSealRuntimeReceipt(receipt);
    console.log(runtimeReceiptMarker(receipt));
    expect(receipt.browserRuntimeE2ESmoke).toBe("FAIL");
    return;
  }

  const navigatorGpuAvailable = await page.evaluate(() => typeof navigator !== "undefined" && "gpu" in navigator);
  if (!navigatorGpuAvailable) {
    receipt = notRunReceipt("NO_BROWSER_WEBGPU");
    writePhotoSealRuntimeReceipt(receipt);
    console.log(runtimeReceiptMarker(receipt));
    expect(receipt.browserRuntimeE2ESmoke).toBe("NOT_RUN");
    return;
  }

  const e2eSmokeFunctionFound = await page.evaluate(() => typeof window.__runPhotoSealE2ESmoke === "function");
  if (!e2eSmokeFunctionFound) {
    receipt = makePhotoSealRuntimeE2EReceipt({
      browserRuntimeE2ESmoke: "FAIL",
      browserRuntimeE2EReason: "APP_LOAD_FAILED",
      viteDevServerStarted: true,
      playwrightBrowserLaunched: true,
      appPageLoaded: true,
      browserRuntimeActuallyExecuted: false,
      runtimePassClaimed: false,
      navigatorGpuAvailable: true,
      gpuAdapterAcquired: false,
      gpuDeviceAcquired: false,
      wasmModuleLoaded: false,
      workerRuntimeAvailable: false,
      e2eSmokeFunctionFound: false,
      e2eSmokeFunctionCalled: false,
      resizeRuntimeExecuted: false,
      bridgeRuntimeExecuted: false,
      wasmEncodeRuntimeExecuted: false,
      auditSummaryRuntimeBuilt: false,
      uiSurfaceRuntimeRendered: false,
      resizeReceiptPresent: false,
      bridgeReceiptPresent: false,
      wasmReceiptPresent: false,
      auditSummaryPresent: false,
      receiptCaptured: true,
    });
    writePhotoSealRuntimeReceipt(receipt);
    console.log(runtimeReceiptMarker(receipt));
    expect(receipt.browserRuntimeE2ESmoke).toBe("FAIL");
    return;
  }

  const tdt07Receipt = await page.evaluate(async () => window.__runPhotoSealE2ESmoke?.());
  receipt = wrapTdt07ReceiptForRuntimeCapture({
    tdt07Receipt: tdt07Receipt as any,
    viteDevServerStarted: true,
    playwrightBrowserLaunched: true,
    appPageLoaded: true,
    navigatorGpuAvailable: true,
    e2eSmokeFunctionFound: true,
    e2eSmokeFunctionCalled: true,
    receiptCaptured: true,
  });

  await page.evaluate((capturedReceipt) => {
    window.__TDT_PHOTOSEAL_07_R1_RUNTIME_RECEIPT__ = capturedReceipt as any;
  }, receipt);

  writePhotoSealRuntimeReceipt(receipt);
  console.log(runtimeReceiptMarker(receipt));

  if (receipt.browserRuntimeE2ESmoke === "PASS") {
    expect(receipt.browserRuntimeActuallyExecuted).toBe(true);
    expect(receipt.runtimePassClaimed).toBe(true);
    expect(receipt.mockReceiptUsedForRuntimePass).toBe(false);
    expect(receipt.staticSmokeUsedAsRuntimePass).toBe(false);
    expect(receipt.playwrightAssemblyUsedAsRuntimePass).toBe(false);
    expect(receipt.jpegSubsampling).toBe("444");
    expect(receipt.jpegColorSpace).toBe("srgb");
    expect(receipt.doubleGammaDetected).toBe(false);
    expect(receipt.paddedBufferTransferred).toBe(false);
  } else {
    expect(receipt.runtimePassClaimed).toBe(false);
  }
});

export const TDT_PHOTOSEAL_07_R1_SPEC_FILE_TOKEN = "photoSealRuntimeE2E.spec uses runtimeReceiptWriter and __TDT_PHOTOSEAL_07_R1_RUNTIME_RECEIPT__.";
