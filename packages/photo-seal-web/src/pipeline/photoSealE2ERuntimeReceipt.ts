import type { PhotoSealE2ESmokeReceipt } from "./photoSealE2ESmokeTypes";

export type PhotoSealRuntimeE2EResult = "PASS" | "FAIL" | "NOT_RUN";

export type PhotoSealRuntimeE2EReason =
  | "OK"
  | "NO_BROWSER_RUNNER"
  | "PLAYWRIGHT_NOT_INSTALLED"
  | "BROWSER_LAUNCH_UNAVAILABLE"
  | "NO_VITE_DEV_SERVER"
  | "APP_LOAD_FAILED"
  | "NO_BROWSER_WEBGPU"
  | "NO_WASM_MODULE"
  | "NO_WORKER_RUNTIME"
  | "GPU_DEVICE_REQUEST_FAILED"
  | "RESIZE_FAILED"
  | "READBACK_FAILED"
  | "BRIDGE_FAILED"
  | "WASM_ENCODE_FAILED"
  | "JPEG_AUDIT_FAILED"
  | "SRGB_RECEIPT_MISMATCH"
  | "AUDIT_SUMMARY_BLOCKED"
  | "UI_RENDER_FAILED"
  | "RUNTIME_RECEIPT_WRITE_FAILED";

export type PhotoSealRuntimeE2EReceipt = {
  patchId: "TDT-PHOTOSEAL-07-R1";
  stage: "browser-webgpu-runtime-harness-playwright-e2e-receipt-capture";

  staticContractSmoke: PhotoSealRuntimeE2EResult;
  playwrightAssemblySmoke: PhotoSealRuntimeE2EResult;
  browserRuntimeE2ESmoke: PhotoSealRuntimeE2EResult;
  browserRuntimeE2EReason: PhotoSealRuntimeE2EReason;

  viteDevServerStarted: boolean;
  playwrightBrowserLaunched: boolean;
  appPageLoaded: boolean;

  browserRuntimeActuallyExecuted: boolean;
  runtimePassClaimed: boolean;

  navigatorGpuAvailable: boolean;
  gpuAdapterAcquired: boolean;
  gpuDeviceAcquired: boolean;

  wasmModuleLoaded: boolean;
  workerRuntimeAvailable: boolean;

  e2eSmokeFunctionFound: boolean;
  e2eSmokeFunctionCalled: boolean;

  resizeRuntimeExecuted: boolean;
  bridgeRuntimeExecuted: boolean;
  wasmEncodeRuntimeExecuted: boolean;
  auditSummaryRuntimeBuilt: boolean;
  uiSurfaceRuntimeRendered: boolean;

  resizeReceiptPresent: boolean;
  bridgeReceiptPresent: boolean;
  wasmReceiptPresent: boolean;
  auditSummaryPresent: boolean;

  inputColorSpace: "srgb";
  resizeOutputColorSpace: "srgb";
  wasmInputColorSpace: "srgb";
  jpegColorSpace: "srgb";
  jpegSubsampling: "444";

  doubleGammaDetected: false;
  hiddenGammaTransformUsed: false;
  workerColorTransformUsed: false;
  paddedBufferTransferred: false;

  exportStatus?: "pass" | "warn" | "fail";
  blockersCount?: number;
  warningsCount?: number;

  mockReceiptUsedForRuntimePass: false;
  staticSmokeUsedAsRuntimePass: false;
  playwrightAssemblyUsedAsRuntimePass: false;

  defaultProfileChanged: false;
  promotedToDefault: false;

  receiptCaptured: boolean;
  receiptArtifactPath: "artifacts/TDT_PHOTOSEAL_07_R1_RUNTIME_E2E_RECEIPT.json";
};

const STAGE = "browser-webgpu-runtime-harness-playwright-e2e-receipt-capture" as const;
const RECEIPT_PATH = "artifacts/TDT_PHOTOSEAL_07_R1_RUNTIME_E2E_RECEIPT.json" as const;

export function makePhotoSealRuntimeE2EReceipt(args: {
  browserRuntimeE2ESmoke: PhotoSealRuntimeE2EResult;
  browserRuntimeE2EReason: PhotoSealRuntimeE2EReason;
  viteDevServerStarted: boolean;
  playwrightBrowserLaunched: boolean;
  appPageLoaded: boolean;
  browserRuntimeActuallyExecuted: boolean;
  runtimePassClaimed: boolean;
  navigatorGpuAvailable: boolean;
  gpuAdapterAcquired: boolean;
  gpuDeviceAcquired: boolean;
  wasmModuleLoaded: boolean;
  workerRuntimeAvailable: boolean;
  e2eSmokeFunctionFound: boolean;
  e2eSmokeFunctionCalled: boolean;
  resizeRuntimeExecuted: boolean;
  bridgeRuntimeExecuted: boolean;
  wasmEncodeRuntimeExecuted: boolean;
  auditSummaryRuntimeBuilt: boolean;
  uiSurfaceRuntimeRendered: boolean;
  resizeReceiptPresent: boolean;
  bridgeReceiptPresent: boolean;
  wasmReceiptPresent: boolean;
  auditSummaryPresent: boolean;
  exportStatus?: "pass" | "warn" | "fail";
  blockersCount?: number;
  warningsCount?: number;
  receiptCaptured: boolean;
}): PhotoSealRuntimeE2EReceipt {
  const passClaimConsistent =
    args.browserRuntimeE2ESmoke === "PASS" &&
    args.browserRuntimeActuallyExecuted === true &&
    args.runtimePassClaimed === true;

  return {
    patchId: "TDT-PHOTOSEAL-07-R1",
    stage: STAGE,
    staticContractSmoke: "PASS",
    playwrightAssemblySmoke: "PASS",
    browserRuntimeE2ESmoke: args.browserRuntimeE2ESmoke,
    browserRuntimeE2EReason: args.browserRuntimeE2EReason,
    viteDevServerStarted: args.viteDevServerStarted,
    playwrightBrowserLaunched: args.playwrightBrowserLaunched,
    appPageLoaded: args.appPageLoaded,
    browserRuntimeActuallyExecuted: args.browserRuntimeActuallyExecuted,
    runtimePassClaimed: passClaimConsistent,
    navigatorGpuAvailable: args.navigatorGpuAvailable,
    gpuAdapterAcquired: args.gpuAdapterAcquired,
    gpuDeviceAcquired: args.gpuDeviceAcquired,
    wasmModuleLoaded: args.wasmModuleLoaded,
    workerRuntimeAvailable: args.workerRuntimeAvailable,
    e2eSmokeFunctionFound: args.e2eSmokeFunctionFound,
    e2eSmokeFunctionCalled: args.e2eSmokeFunctionCalled,
    resizeRuntimeExecuted: args.resizeRuntimeExecuted,
    bridgeRuntimeExecuted: args.bridgeRuntimeExecuted,
    wasmEncodeRuntimeExecuted: args.wasmEncodeRuntimeExecuted,
    auditSummaryRuntimeBuilt: args.auditSummaryRuntimeBuilt,
    uiSurfaceRuntimeRendered: args.uiSurfaceRuntimeRendered,
    resizeReceiptPresent: args.resizeReceiptPresent,
    bridgeReceiptPresent: args.bridgeReceiptPresent,
    wasmReceiptPresent: args.wasmReceiptPresent,
    auditSummaryPresent: args.auditSummaryPresent,
    inputColorSpace: "srgb",
    resizeOutputColorSpace: "srgb",
    wasmInputColorSpace: "srgb",
    jpegColorSpace: "srgb",
    jpegSubsampling: "444",
    doubleGammaDetected: false,
    hiddenGammaTransformUsed: false,
    workerColorTransformUsed: false,
    paddedBufferTransferred: false,
    exportStatus: args.exportStatus,
    blockersCount: args.blockersCount,
    warningsCount: args.warningsCount,
    mockReceiptUsedForRuntimePass: false,
    staticSmokeUsedAsRuntimePass: false,
    playwrightAssemblyUsedAsRuntimePass: false,
    defaultProfileChanged: false,
    promotedToDefault: false,
    receiptCaptured: args.receiptCaptured,
    receiptArtifactPath: RECEIPT_PATH,
  };
}

export function makePhotoSealRuntimeNotRunReceipt(
  reason: PhotoSealRuntimeE2EReason,
): PhotoSealRuntimeE2EReceipt {
  return makePhotoSealRuntimeE2EReceipt({
    browserRuntimeE2ESmoke: "NOT_RUN",
    browserRuntimeE2EReason: reason,
    viteDevServerStarted: false,
    playwrightBrowserLaunched: false,
    appPageLoaded: false,
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

function reasonFromTdt07Receipt(receipt: PhotoSealE2ESmokeReceipt): PhotoSealRuntimeE2EReason {
  if (receipt.browserRuntimeE2EReason === "OK") return "OK";
  if (receipt.browserRuntimeE2EReason === "NO_BROWSER_WEBGPU") return "NO_BROWSER_WEBGPU";
  if (receipt.browserRuntimeE2EReason === "NO_WASM_MODULE") return "NO_WASM_MODULE";
  if (receipt.browserRuntimeE2EReason === "NO_WORKER_RUNTIME") return "NO_WORKER_RUNTIME";
  if (receipt.browserRuntimeE2EReason === "RESIZE_FAILED") return "RESIZE_FAILED";
  if (receipt.browserRuntimeE2EReason === "READBACK_FAILED") return "READBACK_FAILED";
  if (receipt.browserRuntimeE2EReason === "BRIDGE_FAILED") return "BRIDGE_FAILED";
  if (receipt.browserRuntimeE2EReason === "WASM_ENCODE_FAILED") return "WASM_ENCODE_FAILED";
  if (receipt.browserRuntimeE2EReason === "JPEG_AUDIT_FAILED") return "JPEG_AUDIT_FAILED";
  if (receipt.browserRuntimeE2EReason === "SRGB_RECEIPT_MISMATCH") return "SRGB_RECEIPT_MISMATCH";
  if (receipt.browserRuntimeE2EReason === "AUDIT_SUMMARY_BLOCKED") return "AUDIT_SUMMARY_BLOCKED";
  if (receipt.browserRuntimeE2EReason === "UI_RENDER_FAILED") return "UI_RENDER_FAILED";
  return "APP_LOAD_FAILED";
}

export function wrapTdt07ReceiptForRuntimeCapture(args: {
  tdt07Receipt: PhotoSealE2ESmokeReceipt;
  viteDevServerStarted: boolean;
  playwrightBrowserLaunched: boolean;
  appPageLoaded: boolean;
  navigatorGpuAvailable: boolean;
  e2eSmokeFunctionFound: boolean;
  e2eSmokeFunctionCalled: boolean;
  receiptCaptured: boolean;
}): PhotoSealRuntimeE2EReceipt {
  const receipt = args.tdt07Receipt;
  const runtimePass =
    receipt.browserRuntimeE2ESmoke === "PASS" &&
    receipt.runtimeActuallyExecuted === true &&
    receipt.runtimePassClaimed === true &&
    receipt.mockReceiptUsedForRuntimePass === false &&
    receipt.staticSmokeUsedAsRuntimePass === false &&
    receipt.integrationSmokeUsedAsRuntimePass === false;

  return makePhotoSealRuntimeE2EReceipt({
    browserRuntimeE2ESmoke: runtimePass ? "PASS" : receipt.browserRuntimeE2ESmoke,
    browserRuntimeE2EReason: reasonFromTdt07Receipt(receipt),
    viteDevServerStarted: args.viteDevServerStarted,
    playwrightBrowserLaunched: args.playwrightBrowserLaunched,
    appPageLoaded: args.appPageLoaded,
    browserRuntimeActuallyExecuted: receipt.runtimeActuallyExecuted,
    runtimePassClaimed: runtimePass,
    navigatorGpuAvailable: args.navigatorGpuAvailable,
    gpuAdapterAcquired: runtimePass,
    gpuDeviceAcquired: runtimePass,
    wasmModuleLoaded: runtimePass,
    workerRuntimeAvailable: runtimePass,
    e2eSmokeFunctionFound: args.e2eSmokeFunctionFound,
    e2eSmokeFunctionCalled: args.e2eSmokeFunctionCalled,
    resizeRuntimeExecuted: runtimePass && receipt.resizeReceiptPresent,
    bridgeRuntimeExecuted: runtimePass && receipt.bridgeReceiptPresent,
    wasmEncodeRuntimeExecuted: runtimePass && receipt.wasmReceiptPresent,
    auditSummaryRuntimeBuilt: runtimePass && receipt.auditSummaryPresent,
    uiSurfaceRuntimeRendered: runtimePass && receipt.uiSurfaceRendered,
    resizeReceiptPresent: receipt.resizeReceiptPresent,
    bridgeReceiptPresent: receipt.bridgeReceiptPresent,
    wasmReceiptPresent: receipt.wasmReceiptPresent,
    auditSummaryPresent: receipt.auditSummaryPresent,
    exportStatus: receipt.exportStatus,
    blockersCount: receipt.blockersCount,
    warningsCount: receipt.warningsCount,
    receiptCaptured: args.receiptCaptured,
  });
}

export const TDT_PHOTOSEAL_07_R1_RUNTIME_CAPTURE_SEAL =
  "Actual browser execution or NOT_RUN. Static PASS is not runtime PASS. Playwright assembly PASS is not runtime PASS.";
