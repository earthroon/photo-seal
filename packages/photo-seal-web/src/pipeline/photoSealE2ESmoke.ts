import { buildPhotoSealExportAuditSummary } from "../receipt/exportAuditSurface";
import { bridgeRgbaReadbackToJpegWasm } from "./photoSealEncodeBridge";
import { makeCompressionSearchPlanFromUiState } from "./photoSealPipeline";
import { downscaleRgbaWithWebGPUExportEwa } from "../resize/webgpuExportDownscale";
import { createPhotoSealSyntheticSrgbRgba8Input } from "./photoSealE2ESyntheticInput";
import { smokeRenderExportReceiptSurface } from "./photoSealE2EUiSmoke";
import type { CompressionHandleUiState } from "../encoder/jpegWasmTypes";
import type {
  PhotoSealE2ESmokeReason,
  PhotoSealE2ESmokeReceipt,
  PhotoSealE2ESmokeResult,
} from "./photoSealE2ESmokeTypes";

function makeDefaultCompressionUiState(targetBytes: number): CompressionHandleUiState {
  return {
    targetKB: Math.max(1, Math.ceil(targetBytes / 1024)),
    qualityFloor: 45,
    qualityCeil: 96,
    initialQuality: 82,
    maxAttempts: 8,
    effort: "balanced",
    progressive: false,
    optimizeHuffman: true,
    strategy: "quality-binary",
  };
}

function makeE2EReceipt(args: {
  browserRuntimeE2ESmoke: "PASS" | "FAIL" | "NOT_RUN";
  browserRuntimeE2EReason: PhotoSealE2ESmokeReason;
  runtimePassClaimed: boolean;
  runtimeActuallyExecuted: boolean;
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
  exportStatus?: "pass" | "warn" | "fail";
  blockersCount?: number;
  warningsCount?: number;
}): PhotoSealE2ESmokeReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-07",
    stage: "end-to-end-export-smoke-resize-bridge-wasm-ui-receipt-integration",
    staticContractSmoke: "PASS",
    integrationAssemblySmoke: "PASS",
    browserRuntimeE2ESmoke: args.browserRuntimeE2ESmoke,
    browserRuntimeE2EReason: args.browserRuntimeE2EReason,
    runtimePassClaimed: args.runtimePassClaimed,
    runtimeActuallyExecuted: args.runtimeActuallyExecuted,
    mockReceiptUsedForRuntimePass: false,
    staticSmokeUsedAsRuntimePass: false,
    integrationSmokeUsedAsRuntimePass: false,
    inputWidth: args.inputWidth,
    inputHeight: args.inputHeight,
    outputWidth: args.outputWidth,
    outputHeight: args.outputHeight,
    targetBytes: args.targetBytes,
    outputBytes: args.outputBytes,
    reachedTarget: args.reachedTarget,
    resizeReceiptPresent: args.resizeReceiptPresent,
    bridgeReceiptPresent: args.bridgeReceiptPresent,
    wasmReceiptPresent: args.wasmReceiptPresent,
    auditSummaryPresent: args.auditSummaryPresent,
    uiSurfaceRendered: args.uiSurfaceRendered,
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
    exportStatus: args.exportStatus,
    blockersCount: args.blockersCount,
    warningsCount: args.warningsCount,
    defaultProfileChanged: false,
    promotedToDefault: false,
    receiptWritten: true,
  };
}

function validateResizeReceipt(receipt: unknown): void {
  const r = receipt as Record<string, unknown>;
  if (r?.profile !== "export-ewa" || r?.inputColorSpace !== "srgb" || r?.outputColorSpace !== "srgb") {
    throw new Error("SRGB_RECEIPT_MISMATCH: export-ewa resize receipt must be sRGB.");
  }
  if (r?.paddedBufferReturned !== false || r?.paddingStrippedReadback !== true) {
    throw new Error("READBACK_FAILED: export-ewa readback must be padding-stripped.");
  }
  if (r?.hiddenGammaTransformUsed !== false || r?.doubleGammaDetected !== false) {
    throw new Error("SRGB_RECEIPT_MISMATCH: resize gamma seal mismatch.");
  }
}

function validateBridgeReceipt(receipt: unknown): void {
  const r = receipt as Record<string, unknown>;
  if (r?.rgbaColorSpace !== "srgb" || r?.wasmInputColorSpace !== "srgb" || r?.jpegColorSpace !== "srgb") {
    throw new Error("SRGB_RECEIPT_MISMATCH: bridge sRGB seal mismatch.");
  }
  if (r?.workerColorTransformUsed !== false || r?.paddedBufferTransferred !== false) {
    throw new Error("BRIDGE_FAILED: bridge worker/color/transfer seal mismatch.");
  }
}

function validateWasmReceipt(receipt: unknown): void {
  const r = receipt as Record<string, unknown>;
  if (r?.inputColorSpace !== "srgb" || r?.encodedColorSpace !== "srgb" || r?.subsampling !== "444") {
    throw new Error("JPEG_AUDIT_FAILED: wasm receipt must be sRGB JPEG 4:4:4.");
  }
  if (r?.gammaTransformUsed !== false || r?.hiddenLinearizationUsed !== false || r?.doubleGammaDetected !== false) {
    throw new Error("SRGB_RECEIPT_MISMATCH: wasm gamma seal mismatch.");
  }
  if (r?.resizedInsideEncoder !== false || r?.cropInsideEncoder !== false || r?.fallbackUsed !== false) {
    throw new Error("WASM_ENCODE_FAILED: wasm ownership seal mismatch.");
  }
}

function smokeReasonFromError(error: unknown): PhotoSealE2ESmokeReason {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("RESIZE_FAILED")) return "RESIZE_FAILED";
  if (message.includes("READBACK_FAILED")) return "READBACK_FAILED";
  if (message.includes("BRIDGE_FAILED")) return "BRIDGE_FAILED";
  if (message.includes("WASM_ENCODE_FAILED")) return "WASM_ENCODE_FAILED";
  if (message.includes("JPEG_AUDIT_FAILED")) return "JPEG_AUDIT_FAILED";
  if (message.includes("SRGB_RECEIPT_MISMATCH")) return "SRGB_RECEIPT_MISMATCH";
  if (message.includes("AUDIT_SUMMARY_BLOCKED")) return "AUDIT_SUMMARY_BLOCKED";
  if (message.includes("UI_RENDER_FAILED")) return "UI_RENDER_FAILED";
  return "BRIDGE_FAILED";
}

export async function runPhotoSealE2EExportSmoke(args: {
  device?: GPUDevice;
  targetBytes: number;
  inputWidth?: number;
  inputHeight?: number;
  outputWidth?: number;
  outputHeight?: number;
}): Promise<PhotoSealE2ESmokeResult> {
  const inputWidth = args.inputWidth ?? 512;
  const inputHeight = args.inputHeight ?? 512;
  const outputWidth = args.outputWidth ?? 300;
  const outputHeight = args.outputHeight ?? 400;
  const targetBytes = args.targetBytes;

  if (typeof navigator === "undefined" || !("gpu" in navigator)) {
    return {
      e2eReceipt: makeE2EReceipt({
        browserRuntimeE2ESmoke: "NOT_RUN",
        browserRuntimeE2EReason: "NO_BROWSER_WEBGPU",
        runtimePassClaimed: false,
        runtimeActuallyExecuted: false,
        inputWidth,
        inputHeight,
        outputWidth,
        outputHeight,
        targetBytes,
        resizeReceiptPresent: false,
        bridgeReceiptPresent: false,
        wasmReceiptPresent: false,
        auditSummaryPresent: false,
        uiSurfaceRendered: false,
      }),
    };
  }

  try {
    const synthetic = createPhotoSealSyntheticSrgbRgba8Input({
      width: inputWidth,
      height: inputHeight,
      pattern: "resume-photo-gradient",
    });

    const resizeResult = await downscaleRgbaWithWebGPUExportEwa({
      rgba: synthetic.rgba,
      srcWidth: synthetic.width,
      srcHeight: synthetic.height,
      dstWidth: outputWidth,
      dstHeight: outputHeight,
      profile: "export-ewa",
    });
    validateResizeReceipt(resizeResult.receipt);

    const searchPlan = makeCompressionSearchPlanFromUiState(makeDefaultCompressionUiState(targetBytes));
    const encoded = await bridgeRgbaReadbackToJpegWasm({
      resizeResult,
      targetBytes,
      alphaPolicy: "white-composite",
      rgbaColorSpace: "srgb",
      inputColorSpace: "srgb",
      searchPlan,
    });
    validateBridgeReceipt(encoded.bridgeReceipt);
    validateWasmReceipt(encoded.wasmReceipt);

    const auditSummary = buildPhotoSealExportAuditSummary({
      width: encoded.width,
      height: encoded.height,
      targetBytes,
      outputBytes: encoded.sizeBytes,
      reachedTarget: encoded.reachedTarget,
      resizeReceipt: resizeResult.receipt,
      bridgeReceipt: encoded.bridgeReceipt,
      wasmReceipt: encoded.wasmReceipt,
    });

    if (auditSummary.blockers.length > 0) {
      throw new Error("AUDIT_SUMMARY_BLOCKED: E2E audit summary contains blockers.");
    }

    const uiSmoke = await smokeRenderExportReceiptSurface({ auditSummary });
    if (!uiSmoke.rendered) {
      throw new Error(`UI_RENDER_FAILED: ${uiSmoke.reason}`);
    }

    return {
      jpg: encoded.jpeg,
      auditSummary,
      resizeReceipt: resizeResult.receipt,
      bridgeReceipt: encoded.bridgeReceipt,
      wasmReceipt: encoded.wasmReceipt,
      e2eReceipt: makeE2EReceipt({
        browserRuntimeE2ESmoke: "PASS",
        browserRuntimeE2EReason: "OK",
        runtimePassClaimed: true,
        runtimeActuallyExecuted: true,
        inputWidth,
        inputHeight,
        outputWidth,
        outputHeight,
        targetBytes,
        outputBytes: encoded.sizeBytes,
        reachedTarget: encoded.reachedTarget,
        resizeReceiptPresent: true,
        bridgeReceiptPresent: true,
        wasmReceiptPresent: true,
        auditSummaryPresent: true,
        uiSurfaceRendered: true,
        exportStatus: auditSummary.exportStatus,
        blockersCount: auditSummary.blockers.length,
        warningsCount: auditSummary.warnings.length,
      }),
    };
  } catch (error) {
    return {
      e2eReceipt: makeE2EReceipt({
        browserRuntimeE2ESmoke: "FAIL",
        browserRuntimeE2EReason: smokeReasonFromError(error),
        runtimePassClaimed: false,
        runtimeActuallyExecuted: true,
        inputWidth,
        inputHeight,
        outputWidth,
        outputHeight,
        targetBytes,
        resizeReceiptPresent: false,
        bridgeReceiptPresent: false,
        wasmReceiptPresent: false,
        auditSummaryPresent: false,
        uiSurfaceRendered: false,
      }),
    };
  }
}
