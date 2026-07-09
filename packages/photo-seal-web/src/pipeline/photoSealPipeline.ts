import {
  type CompressionHandleUiState,
  type CompressionSearchPlan,
} from "../encoder/jpegWasmTypes";
import { downscaleRgbaWithAdaptiveEwaDeltaEGate } from "../resize/adaptiveEwaDeltaEGate";
import { downscaleRgbaWithAdaptiveEwa } from "../resize/adaptiveEwaDownscale";
import { downscaleRgbaWithDadumAdaptiveQmapTilemask } from "../resize/dadumAdaptiveQmapTilemaskDownscale";
import { downscaleRgbaWithWebGPUExportEwa } from "../resize/webgpuExportDownscale";
import type { AnyPhotoSealResizeResult, ResizeProfile } from "../resize/types";
import { assertResizeResultMatchesTarget, type PhotoSealResizeTargetGuardReceipt } from "../resize/resizeTargetGuard";
import { bridgeRgbaReadbackToJpegWasm } from "./photoSealEncodeBridge";
import type {
  Jpeg444TargetBytesWasmReceipt,
  JpegCompressionControl,
} from "../encoder/jpegWasmTypes";
import type { PhotoSealJpegEncoderAuthoritySeal } from "../encoder/wasmEncoderAuthority";
import type { PhotoSealBridgeReceipt } from "../receipt/photoSealBridgeReceipt";
import { buildPhotoSealExportAuditSummary } from "../receipt/exportAuditSurface";
import type { PhotoSealExportAuditSummary } from "../receipt/exportAuditTypes";
import type { PhotoSealImageImportReceipt } from "../import/imageImportReceipt";
import type { PhotoSealImportedImageGpuUploadReceipt } from "../import/importedImageToGpuTexture";
import type { PhotoSealAuditBundleSaveReceipt, PhotoSealJpegSaveReceipt } from "../export/saveReceipt";
import type { PhotoSealCustomExportPresetInput, PhotoSealExportPreset, PhotoSealExportPresetId } from "../preset/exportPresetTypes";
import type { PhotoSealExportPresetReceipt } from "../preset/exportPresetReceipt";
import type { PhotoSealPresetResizePolicy } from "../preset/presetToResizePolicy";
import { mapPresetToResizePolicy } from "../preset/presetToResizePolicy";
import { verifyPresetRuntimePolicy } from "../preset/presetRuntimeVerification";
import { resolvePhotoSealExportResizePolicy, assertNoSilentPhotoSealResizePolicyFallback } from "../export/exportResizePolicy";
import type { PhotoSealExportResizePolicy } from "../export/exportResizePolicy";
import type { DeltaKTangentInterpolationPolicy } from "../export/deltaKTangentPolicy";
import type { PhotoSealCropReceipt } from "../crop/cropReceipt";


export type PhotoSealPresetExportRequest = {
  presetId: PhotoSealExportPresetId;
  customPreset?: PhotoSealCustomExportPresetInput;
};

export type PhotoSealPresetStage = {
  preset: PhotoSealExportPreset;
  presetReceipt: PhotoSealExportPresetReceipt;
  resizePolicy: PhotoSealPresetResizePolicy;
};

export type PhotoSealPipelineImportStage = {
  importReceipt: PhotoSealImageImportReceipt;
  gpuUploadReceipt?: PhotoSealImportedImageGpuUploadReceipt;
  decodedColorSpace: "srgb";
  importedWidth: number;
  importedHeight: number;
  canvasColorCorrectionUsed: false;
};

export type PhotoSealExportSaveStage = {
  jpg: Uint8Array;
  auditSummary: PhotoSealExportAuditSummary;
  saveReceipt?: PhotoSealJpegSaveReceipt;
  auditBundleSaveReceipt?: PhotoSealAuditBundleSaveReceipt;
};

export type PhotoSealPipelineRequest = {
  sourceRgba: Uint8Array;
  sourceWidth: number;
  sourceHeight: number;
  sourceColorSpace: "srgb";
  importStage?: PhotoSealPipelineImportStage;
  presetStage?: PhotoSealPresetStage;
  targetWidth: number;
  targetHeight: number;
  resizeProfile: ResizeProfile;
  targetBytes: number;
  alphaPolicy: "white-composite" | "discard";
  compressionUiState: CompressionHandleUiState;
  cropReceipt?: PhotoSealCropReceipt | null;
};

export type PhotoSealPipelineResult = {
  jpeg: Uint8Array;
  width: number;
  height: number;
  sizeBytes: number;
  reachedTarget: boolean;
  resizeProfile: ResizeProfile;
  selectedControl: JpegCompressionControl;
  wasmReceipt: Jpeg444TargetBytesWasmReceipt;
  encoderAuthority: PhotoSealJpegEncoderAuthoritySeal;
  encoderOwner: "wasm-tdt-jpeg";
  browserJpegEncodeUsed: false;
  browserJpegEncodeFallbackUsed: false;
  bridgeReceipt: PhotoSealBridgeReceipt;
  resizeReceipt: AnyPhotoSealResizeResult["receipt"];
  resizeTargetGuardReceipt: PhotoSealResizeTargetGuardReceipt;
  receipt: PhotoSealBridgeReceipt;
  auditSummary: PhotoSealExportAuditSummary;
  presetStage?: PhotoSealPresetStage;
  h3r6ResizePolicy: PhotoSealExportResizePolicy;
  h3r7DeltaKTangentPolicy?: DeltaKTangentInterpolationPolicy;
  cropReceipt?: PhotoSealCropReceipt | null;
  colorPipeline: {
    decodedColorSpace: "srgb";
    resizeOutputColorSpace: "srgb";
    bridgeRgbaColorSpace: "srgb";
    wasmInputColorSpace: "srgb";
    jpegColorSpace: "srgb";
    doubleGammaDetected: false;
  };
};

export function makeCompressionSearchPlanFromUiState(
  state: CompressionHandleUiState
): CompressionSearchPlan {
  const plan: CompressionSearchPlan = {
    strategy: state.strategy,
    minQuality: state.qualityFloor,
    maxQuality: state.qualityCeil,
    initialQuality: state.initialQuality,
    maxAttempts: state.maxAttempts,
    effort: state.effort,
    progressiveAllowed: state.progressive,
    optimizeHuffmanAllowed: state.optimizeHuffman,
    subsampling: "444",
    suppliedHandles: state.suppliedHandles,
  };

  if (plan.minQuality < 1 || plan.maxQuality > 100 || plan.minQuality > plan.maxQuality) {
    throw new Error("Invalid PhotoSeal compression quality range.");
  }
  if (plan.initialQuality < plan.minQuality || plan.initialQuality > plan.maxQuality) {
    throw new Error("Invalid PhotoSeal initial compression quality.");
  }
  if (plan.maxAttempts <= 0 || plan.maxAttempts > 16) {
    throw new Error("Invalid PhotoSeal compression maxAttempts.");
  }
  return plan;
}

async function resizeForPipeline(
  request: PhotoSealPipelineRequest,
  exportResizePolicy: PhotoSealExportResizePolicy
): Promise<AnyPhotoSealResizeResult> {
  if (request.sourceColorSpace !== "srgb") {
    throw new Error("TDT-PHOTOSEAL-05-R1 requires sourceColorSpace: srgb.");
  }

  if (request.resizeProfile === "export-ewa") {
    return await downscaleRgbaWithWebGPUExportEwa({
      rgba: request.sourceRgba,
      srcWidth: request.sourceWidth,
      srcHeight: request.sourceHeight,
      dstWidth: request.targetWidth,
      dstHeight: request.targetHeight,
      profile: "export-ewa",
      policy: exportResizePolicy,
      samplingDomain: request.cropReceipt?.cropConfirmed
        ? { kind: "crop-box", cropBox: request.cropReceipt.cropRectSourcePixels, cropReceiptPatchId: "TDT-PHOTOSEAL-13-H3-R8" }
        : { kind: "full-source" },
    });
  }

  if (request.resizeProfile === "adaptive-ewa" || request.resizeProfile === "adaptive-ewa-lite") {
    return await downscaleRgbaWithAdaptiveEwa({
      rgba: request.sourceRgba,
      srcWidth: request.sourceWidth,
      srcHeight: request.sourceHeight,
      dstWidth: request.targetWidth,
      dstHeight: request.targetHeight,
      profile: "adaptive-ewa",
    });
  }

  if (request.resizeProfile === "dadum-adaptive-qmap-tilemask") {
    return await downscaleRgbaWithDadumAdaptiveQmapTilemask({
      rgba: request.sourceRgba,
      srcWidth: request.sourceWidth,
      srcHeight: request.sourceHeight,
      dstWidth: request.targetWidth,
      dstHeight: request.targetHeight,
      profile: "dadum-adaptive-qmap-tilemask",
    });
  }

  return await downscaleRgbaWithAdaptiveEwaDeltaEGate({
    rgba: request.sourceRgba,
    srcWidth: request.sourceWidth,
    srcHeight: request.sourceHeight,
    dstWidth: request.targetWidth,
    dstHeight: request.targetHeight,
    profile: "adaptive-ewa-deltae",
  });
}

export async function runPhotoSealPipeline(
  request: PhotoSealPipelineRequest
): Promise<PhotoSealPipelineResult> {
  let presetStage = request.presetStage;
  if (presetStage) {
    const policy = mapPresetToResizePolicy(presetStage.presetReceipt);
    const verifiedPresetReceipt = verifyPresetRuntimePolicy({
      presetReceipt: presetStage.presetReceipt,
      resizeWidth: request.targetWidth,
      resizeHeight: request.targetHeight,
      targetBytes: request.targetBytes,
      resizeProfile: request.resizeProfile,
    });
    presetStage = { ...presetStage, presetReceipt: verifiedPresetReceipt, resizePolicy: policy };
  }
  const cropReceipt = request.cropReceipt ?? null;
  if (presetStage?.preset.cropRequired && !cropReceipt?.cropConfirmed) {
    throw new Error("CROP_REQUIRED_BUT_MISSING");
  }
  const resizeSourceWidth = cropReceipt?.cropRectSourcePixels.sourceWidth ?? request.sourceWidth;
  const resizeSourceHeight = cropReceipt?.cropRectSourcePixels.sourceHeight ?? request.sourceHeight;

  const exportResizePolicy = resolvePhotoSealExportResizePolicy({
    sourceWidth: resizeSourceWidth,
    sourceHeight: resizeSourceHeight,
    targetWidth: request.targetWidth,
    targetHeight: request.targetHeight,
    preset: presetStage?.preset,
  });
  assertNoSilentPhotoSealResizePolicyFallback(exportResizePolicy);

  const resizeResult = await resizeForPipeline(request, exportResizePolicy);
  const resizeTargetGuardReceipt = assertResizeResultMatchesTarget({
    resizeResult,
    sourceWidth: resizeSourceWidth,
    sourceHeight: resizeSourceHeight,
    sourceBytes: cropReceipt?.cropRectSourcePixels ? cropReceipt.cropRectSourcePixels.sourceWidth * cropReceipt.cropRectSourcePixels.sourceHeight * 4 : request.sourceRgba.byteLength,
    targetWidth: request.targetWidth,
    targetHeight: request.targetHeight,
  });
  const searchPlan = makeCompressionSearchPlanFromUiState(request.compressionUiState);
  const encodeResult = await bridgeRgbaReadbackToJpegWasm({
    resizeResult,
    targetBytes: request.targetBytes,
    alphaPolicy: request.alphaPolicy,
    rgbaColorSpace: "srgb",
    inputColorSpace: "srgb",
    searchPlan,
  });

  const auditSummary = buildPhotoSealExportAuditSummary({
    width: encodeResult.width,
    height: encodeResult.height,
    targetBytes: request.targetBytes,
    outputBytes: encodeResult.sizeBytes,
    reachedTarget: encodeResult.reachedTarget,
    resizeReceipt: resizeResult.receipt,
    bridgeReceipt: encodeResult.bridgeReceipt,
    wasmReceipt: encodeResult.wasmReceipt,
    importReceipt: request.importStage?.importReceipt,
    importRequired: !!request.importStage,
    presetReceipt: presetStage?.presetReceipt,
    presetRequired: !!presetStage,
  });

  return {
    jpeg: encodeResult.jpeg,
    width: encodeResult.width,
    height: encodeResult.height,
    sizeBytes: encodeResult.sizeBytes,
    reachedTarget: encodeResult.reachedTarget,
    resizeProfile: request.resizeProfile,
    selectedControl: encodeResult.selectedControl,
    wasmReceipt: encodeResult.wasmReceipt,
    encoderAuthority: encodeResult.encoderAuthority,
    encoderOwner: encodeResult.encoderOwner,
    browserJpegEncodeUsed: encodeResult.browserJpegEncodeUsed,
    browserJpegEncodeFallbackUsed: encodeResult.browserJpegEncodeFallbackUsed,
    bridgeReceipt: encodeResult.bridgeReceipt,
    resizeReceipt: resizeResult.receipt,
    resizeTargetGuardReceipt,
    receipt: encodeResult.receipt,
    auditSummary,
    presetStage,
    h3r6ResizePolicy: exportResizePolicy,
    h3r7DeltaKTangentPolicy: (resizeResult.receipt as any).deltaKTangentPolicy,
    cropReceipt,
    colorPipeline: {
      decodedColorSpace: "srgb",
      resizeOutputColorSpace: "srgb",
      bridgeRgbaColorSpace: "srgb",
      wasmInputColorSpace: "srgb",
      jpegColorSpace: "srgb",
      doubleGammaDetected: false,
    },
  };
}

