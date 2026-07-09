import type { PhotoSealExportAuditSummary } from "../receipt/exportAuditTypes";

export type PhotoSealE2ESmokeStatus = "PASS" | "FAIL" | "NOT_RUN";

export type PhotoSealE2ESmokeStage =
  | "static-contract"
  | "integration-assembly"
  | "browser-runtime-e2e";

export type PhotoSealE2ESmokeReason =
  | "OK"
  | "NO_BROWSER_WEBGPU"
  | "NO_WASM_MODULE"
  | "NO_WORKER_RUNTIME"
  | "NO_BROWSER_RUNNER"
  | "VITE_RUNTIME_UNAVAILABLE"
  | "RESIZE_FAILED"
  | "READBACK_FAILED"
  | "BRIDGE_FAILED"
  | "WASM_ENCODE_FAILED"
  | "JPEG_AUDIT_FAILED"
  | "SRGB_RECEIPT_MISMATCH"
  | "AUDIT_SUMMARY_BLOCKED"
  | "UI_RENDER_FAILED";

export type PhotoSealE2ESmokeReceipt = {
  patchId: "TDT-PHOTOSEAL-07";
  stage: "end-to-end-export-smoke-resize-bridge-wasm-ui-receipt-integration";

  staticContractSmoke: PhotoSealE2ESmokeStatus;
  integrationAssemblySmoke: PhotoSealE2ESmokeStatus;
  browserRuntimeE2ESmoke: PhotoSealE2ESmokeStatus;
  browserRuntimeE2EReason: PhotoSealE2ESmokeReason;

  runtimePassClaimed: boolean;
  runtimeActuallyExecuted: boolean;

  mockReceiptUsedForRuntimePass: false;
  staticSmokeUsedAsRuntimePass: false;
  integrationSmokeUsedAsRuntimePass: false;

  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;

  targetBytes: number;
  outputBytes?: number;
  reachedTarget?: boolean;

  resizeReceiptPresent: boolean;
  bridgeReceiptPresent: boolean;
  wasmReceiptPresent: boolean;
  auditSummaryPresent: boolean;
  uiSurfaceRendered: boolean;

  resizeProfile: "export-ewa";
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

  defaultProfileChanged: false;
  promotedToDefault: false;

  receiptWritten: true;
};

export type PhotoSealE2ESmokeResult = {
  jpg?: Uint8Array;
  auditSummary?: PhotoSealExportAuditSummary;
  resizeReceipt?: unknown;
  bridgeReceipt?: unknown;
  wasmReceipt?: unknown;
  e2eReceipt: PhotoSealE2ESmokeReceipt;
};

export function makePhotoSealE2ENotRunReceipt(args: {
  reason: PhotoSealE2ESmokeReason;
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  targetBytes: number;
}): PhotoSealE2ESmokeReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-07",
    stage: "end-to-end-export-smoke-resize-bridge-wasm-ui-receipt-integration",
    staticContractSmoke: "PASS",
    integrationAssemblySmoke: "PASS",
    browserRuntimeE2ESmoke: "NOT_RUN",
    browserRuntimeE2EReason: args.reason,
    runtimePassClaimed: false,
    runtimeActuallyExecuted: false,
    mockReceiptUsedForRuntimePass: false,
    staticSmokeUsedAsRuntimePass: false,
    integrationSmokeUsedAsRuntimePass: false,
    inputWidth: args.inputWidth,
    inputHeight: args.inputHeight,
    outputWidth: args.outputWidth,
    outputHeight: args.outputHeight,
    targetBytes: args.targetBytes,
    resizeReceiptPresent: false,
    bridgeReceiptPresent: false,
    wasmReceiptPresent: false,
    auditSummaryPresent: false,
    uiSurfaceRendered: false,
    resizeProfile: "export-ewa",
    inputColorSpace: "srgb",
    resizeOutputColorSpace: "srgb",
    wasmInputColorSpace: "srgb",
    jpegColorSpace: "srgb",
    jpegSubsampling: "444",
    doubleGammaDetected: false,
    hiddenGammaTransformUsed: false,
    workerColorTransformUsed: false,
    paddedBufferTransferred: false,
    defaultProfileChanged: false,
    promotedToDefault: false,
    receiptWritten: true,
  };
}

export const TDT_PHOTOSEAL_07_NO_SILENT_RUNTIME_PASS_SEAL =
  "No Silent Runtime Pass: Static PASS is not runtime PASS. Integration PASS is not runtime PASS. NOT_RUN is not PASS.";
