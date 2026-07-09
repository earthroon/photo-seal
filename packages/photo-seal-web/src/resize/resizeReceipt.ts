import type { GPUHarnessReceipt } from "../gpu/gpuReceipt";
import type { ExportEwaResizeReceipt } from "./types";
import type { PhotoSealResizeSamplingDomain } from "../crop/cropBoxTypes";
import { createDefaultPhotoSealExportResizePolicy } from "../export/exportResizePolicy";
import type { PhotoSealExportResizePolicy } from "../export/exportResizePolicy";
import { resolveDeltaKTangentInterpolationPolicyFromR6 } from "../export/deltaKTangentPolicy";
import type { DeltaKTangentInterpolationPolicy } from "../export/deltaKTangentPolicy";

export function makeExportEwaResizeReceipt(args: {
  inputWidth: number;
  inputHeight: number;
  inputBytes: number;
  outputWidth: number;
  outputHeight: number;
  outputBytes: number;
  gpuHarness: GPUHarnessReceipt;
  policy?: PhotoSealExportResizePolicy;
  deltaKTangentPolicy?: DeltaKTangentInterpolationPolicy;
  samplingDomain?: PhotoSealResizeSamplingDomain;
}): ExportEwaResizeReceipt {
  const policy = args.policy ?? createDefaultPhotoSealExportResizePolicy({
    sourceWidth: args.inputWidth,
    sourceHeight: args.inputHeight,
    targetWidth: args.outputWidth,
    targetHeight: args.outputHeight,
  });
  const deltaKTangentPolicy = args.deltaKTangentPolicy ?? resolveDeltaKTangentInterpolationPolicyFromR6(policy);
  const samplingDomain = args.samplingDomain ?? { kind: "full-source" as const };
  return {
    patchId: "TDT-PHOTOSEAL-01-R1",
    stage: "export-ewa-resize-srgb-receipt-color-seal",
    profile: "export-ewa",
    defaultProfile: "export-ewa",
    defaultProfileChanged: false,
    promotedToDefault: false,
    sourceProject: "DadumDadum",
    sourceRole: "reference-only",
    sourceChain: "export-wgsl-downscale",
    input: {
      width: args.inputWidth,
      height: args.inputHeight,
      bytes: args.inputBytes,
      format: "rgba8",
    },
    output: {
      width: args.outputWidth,
      height: args.outputHeight,
      bytes: args.outputBytes,
      format: "rgba8",
    },
    inputWidth: args.inputWidth,
    inputHeight: args.inputHeight,
    outputWidth: args.outputWidth,
    outputHeight: args.outputHeight,
    inputFormat: "rgba8",
    outputFormat: "rgba8",
    inputColorSpace: "srgb",
    outputColorSpace: "srgb",
    browserDecodedInputAssumed: true,
    decodedColorSpace: "srgb",
    hiddenGammaTransformUsed: false,
    doubleGammaDetected: false,
    implicitColorTransformUsed: false,
    shaderLocalLinearizationUsed: false,
    oklabUsed: false,
    oklabMetricLocalOnly: false,
    paddedBufferReturned: false,
    paddingStrippedReadback: true,
    gpu: {
      backend: "webgpu",
      fallbackUsed: false,
    },
    gpuHarness: args.gpuHarness,
    gpuFallbackUsed: false,
    canvasFallbackUsed: false,
    cpuColorCorrectionUsed: false,
    dadumFullAdaptiveChainUsed: false,
    qmapUsed: false,
    tileMaskUsed: false,
    shaders: {
      lowpass: "exportEwaLowpass.wgsl",
      recompose: "exportEwaRecompose.wgsl",
      deltaKStructureTensor: "deltaKStructureTensor.wgsl",
      deltaKTangentInterpolate: "deltaKTangentInterpolate.wgsl",
      deltaKNormalOvershootClamp: "deltaKNormalOvershootClamp.wgsl",
    },
    resamplePolicy: {
      ringingSuppressionProfile: policy.antiRingingMode === "strict-lowpass-authority" ? "strict-lowpass-authority" : "export-ewa-lowpass-no-sharpen",
      residualSharpeningUsed: false,
      edgeBoostUsed: false,
      browserResizeUsed: false,
      wasmResizeUsed: false,
    },
    h3r6Policy: policy,
    deltaKTangentPolicy,
    h3r7Policy: deltaKTangentPolicy,
    h3r8SamplingDomain: samplingDomain,
    cropBoxSourcePixels: samplingDomain.kind === "crop-box" ? samplingDomain.cropBox : undefined,
    cropDomainUsed: samplingDomain.kind === "crop-box",
    resizedRgbaOnlyToWasm: true,
    encoderSideCropUsed: false,
    resizeSideSilentCropUsed: false,
    hiddenCenterCropUsed: false,
    deltaKEnabled: deltaKTangentPolicy.deltaKEnabled,
    structureTensorEnabled: deltaKTangentPolicy.structureTensorEnabled,
    tangentInterpolationEnabled: deltaKTangentPolicy.tangentInterpolationEnabled,
    normalOvershootRecoveryAllowed: deltaKTangentPolicy.normalOvershootRecoveryAllowed,
    normalResidualStrength: deltaKTangentPolicy.normalResidualStrength,
    tangentDetailStrength: deltaKTangentPolicy.tangentDetailStrength,
    tangentDetailMaxStrength: deltaKTangentPolicy.tangentDetailMaxStrength,
    haloClampMode: deltaKTangentPolicy.haloClampMode,
    outputClampMode: deltaKTangentPolicy.outputClampMode,
    sourceWidth: policy.sourceWidth,
    sourceHeight: policy.sourceHeight,
    targetWidth: policy.targetWidth,
    targetHeight: policy.targetHeight,
    scaleRatioX: policy.scaleRatioX,
    scaleRatioY: policy.scaleRatioY,
    severeDownscale: policy.severeDownscale,
    presetKind: policy.presetKind,
    antiRingingMode: policy.antiRingingMode,
    resizeAuthority: policy.resizeAuthority,
    recomposeEnabled: policy.recomposeEnabled,
    recomposeStrength: policy.recomposeStrength,
    residualClampMode: policy.residualClampMode,
    kernelProfile: policy.kernelProfile,
    filterRadiusScale: policy.filterRadiusScale,
    receiptVersion: 1,
  };
}

export const createExportEwaResizeReceipt = (args: {
  srcWidth: number;
  srcHeight: number;
  srcBytes: number;
  dstWidth: number;
  dstHeight: number;
  dstBytes: number;
  gpuHarness: GPUHarnessReceipt;
  policy?: PhotoSealExportResizePolicy;
  deltaKTangentPolicy?: DeltaKTangentInterpolationPolicy;
  samplingDomain?: PhotoSealResizeSamplingDomain;
}): ExportEwaResizeReceipt =>
  makeExportEwaResizeReceipt({
    inputWidth: args.srcWidth,
    inputHeight: args.srcHeight,
    inputBytes: args.srcBytes,
    outputWidth: args.dstWidth,
    outputHeight: args.dstHeight,
    outputBytes: args.dstBytes,
    gpuHarness: args.gpuHarness,
    policy: args.policy,
    deltaKTangentPolicy: args.deltaKTangentPolicy,
    samplingDomain: args.samplingDomain,
  });

export function validateExportEwaSrgbResizeReceipt(
  receipt: ExportEwaResizeReceipt
): void {
  const invalid =
    receipt.patchId !== "TDT-PHOTOSEAL-01-R1" ||
    receipt.stage !== "export-ewa-resize-srgb-receipt-color-seal" ||
    receipt.profile !== "export-ewa" ||
    receipt.inputColorSpace !== "srgb" ||
    receipt.outputColorSpace !== "srgb" ||
    receipt.decodedColorSpace !== "srgb" ||
    receipt.hiddenGammaTransformUsed !== false ||
    receipt.doubleGammaDetected !== false ||
    receipt.implicitColorTransformUsed !== false ||
    receipt.paddedBufferReturned !== false ||
    receipt.paddingStrippedReadback !== true ||
    receipt.defaultProfileChanged !== false ||
    receipt.promotedToDefault !== false ||
    receipt.dadumFullAdaptiveChainUsed !== false ||
    receipt.qmapUsed !== false ||
    receipt.tileMaskUsed !== false ||
    receipt.canvasFallbackUsed !== false ||
    receipt.cpuColorCorrectionUsed !== false ||
    receipt.resamplePolicy?.residualSharpeningUsed !== false ||
    receipt.resamplePolicy?.edgeBoostUsed !== false ||
    receipt.resamplePolicy?.browserResizeUsed !== false ||
    receipt.resamplePolicy?.wasmResizeUsed !== false ||
    receipt.h3r6Policy?.hiddenSharpeningAllowed !== false ||
    receipt.h3r6Policy?.silentPolicyFallbackAllowed !== false ||
    receipt.deltaKTangentPolicy?.normalOvershootRecoveryAllowed !== false ||
    receipt.deltaKTangentPolicy?.normalResidualStrength !== 0 ||
    receipt.encoderSideCropUsed !== false ||
    receipt.resizeSideSilentCropUsed !== false ||
    receipt.hiddenCenterCropUsed !== false ||
    receipt.resizedRgbaOnlyToWasm !== true;

  if (invalid) {
    throw new Error("FAIL_TDT_PHOTOSEAL_01_R1_RESIZE_RECEIPT_SRGB_REBIND_EXPORT_EWA_COLOR_SEAL");
  }
}
