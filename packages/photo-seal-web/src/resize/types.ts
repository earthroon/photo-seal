import type { GPUHarnessReceipt } from "../gpu/gpuReceipt";
import type { AdaptiveEwaParams } from "./adaptiveEwaParams";
import type { AdaptiveEwaReceipt } from "./adaptiveEwaReceipt";
import type { DeltaEGateParams } from "./deltaEGateParams";
import type { DeltaEGateResizeReceipt, OklabMetricLocalSeal } from "./deltaEGateReceipt";
import type { DadumAdaptiveQmapTilemaskParams } from "./dadumAdaptiveQmapTilemaskParams";
import type { DadumAdaptiveQmapTilemaskReceipt } from "./dadumAdaptiveQmapTilemaskReceipt";
import type { PhotoSealExportResizePolicy } from "../export/exportResizePolicy";
import type { DeltaKTangentInterpolationPolicy } from "../export/deltaKTangentPolicy";
import type { PhotoSealResizeSamplingDomain, SourcePixelRect } from "../crop/cropBoxTypes";

export type LegacyResizeProfile = "adaptive-ewa";

export type ResizeProfile =
  | "export-ewa"
  | "adaptive-ewa"
  | "adaptive-ewa-lite"
  | "adaptive-ewa-deltae"
  | "dadum-adaptive-qmap-tilemask";

export type WebGPUExportDownscaleRequest = {
  rgba: Uint8Array;
  srcWidth: number;
  srcHeight: number;
  dstWidth: number;
  dstHeight: number;
  profile: "export-ewa";
  policy?: PhotoSealExportResizePolicy;
  samplingDomain?: PhotoSealResizeSamplingDomain;
};

export type WebGPUExportDownscaleResult = {
  rgba: Uint8Array;
  width: number;
  height: number;
  profile: "export-ewa";
  receipt: ExportEwaResizeReceipt;
};

export type ExportEwaResizeReceipt = {
  patchId: "TDT-PHOTOSEAL-01-R1";
  stage: "export-ewa-resize-srgb-receipt-color-seal";
  profile: "export-ewa";
  defaultProfile: "export-ewa";
  defaultProfileChanged: false;
  promotedToDefault: false;
  sourceProject: "DadumDadum";
  sourceRole: "reference-only";
  sourceChain: "export-wgsl-downscale";
  input: {
    width: number;
    height: number;
    bytes: number;
    format: "rgba8";
  };
  output: {
    width: number;
    height: number;
    bytes: number;
    format: "rgba8";
  };
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  inputFormat: "rgba8";
  outputFormat: "rgba8";
  inputColorSpace: "srgb";
  outputColorSpace: "srgb";
  browserDecodedInputAssumed: true;
  decodedColorSpace: "srgb";
  hiddenGammaTransformUsed: false;
  doubleGammaDetected: false;
  implicitColorTransformUsed: false;
  shaderLocalLinearizationUsed: false;
  oklabUsed: false;
  oklabMetricLocalOnly: false;
  paddedBufferReturned: false;
  paddingStrippedReadback: true;
  gpu: {
    backend: "webgpu";
    fallbackUsed: false;
  };
  gpuHarness: GPUHarnessReceipt;
  gpuFallbackUsed: false;
  canvasFallbackUsed: false;
  cpuColorCorrectionUsed: false;
  dadumFullAdaptiveChainUsed: false;
  qmapUsed: false;
  tileMaskUsed: false;
  shaders: {
    lowpass: "exportEwaLowpass.wgsl";
    recompose: "exportEwaRecompose.wgsl";
    deltaKStructureTensor: "deltaKStructureTensor.wgsl";
    deltaKTangentInterpolate: "deltaKTangentInterpolate.wgsl";
    deltaKNormalOvershootClamp: "deltaKNormalOvershootClamp.wgsl";
  };
  resamplePolicy: {
    ringingSuppressionProfile: "export-ewa-lowpass-no-sharpen" | "strict-lowpass-authority";
    residualSharpeningUsed: false;
    edgeBoostUsed: false;
    browserResizeUsed: false;
    wasmResizeUsed: false;
  };
  h3r6Policy: PhotoSealExportResizePolicy;
  deltaKTangentPolicy: DeltaKTangentInterpolationPolicy;
  h3r7Policy: DeltaKTangentInterpolationPolicy;
  h3r8SamplingDomain: PhotoSealResizeSamplingDomain;
  cropBoxSourcePixels?: SourcePixelRect;
  cropDomainUsed: boolean;
  resizedRgbaOnlyToWasm: true;
  encoderSideCropUsed: false;
  resizeSideSilentCropUsed: false;
  hiddenCenterCropUsed: false;
  deltaKEnabled: boolean;
  structureTensorEnabled: boolean;
  tangentInterpolationEnabled: boolean;
  normalOvershootRecoveryAllowed: false;
  normalResidualStrength: 0;
  tangentDetailStrength: number;
  tangentDetailMaxStrength: number;
  haloClampMode: DeltaKTangentInterpolationPolicy["haloClampMode"];
  outputClampMode: DeltaKTangentInterpolationPolicy["outputClampMode"];
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
  scaleRatioX: number;
  scaleRatioY: number;
  severeDownscale: boolean;
  presetKind: PhotoSealExportResizePolicy["presetKind"];
  antiRingingMode: PhotoSealExportResizePolicy["antiRingingMode"];
  resizeAuthority: PhotoSealExportResizePolicy["resizeAuthority"];
  recomposeEnabled: boolean;
  recomposeStrength: number;
  residualClampMode: PhotoSealExportResizePolicy["residualClampMode"];
  kernelProfile: PhotoSealExportResizePolicy["kernelProfile"];
  filterRadiusScale: number;
  receiptVersion: 1;
};

export type ResizeReceipt = ExportEwaResizeReceipt;

export type AdaptiveEwaDownscaleRequest = {
  rgba: Uint8Array;
  srcWidth: number;
  srcHeight: number;
  dstWidth: number;
  dstHeight: number;
  profile: "adaptive-ewa";
  params?: Partial<AdaptiveEwaParams>;
};

export type AdaptiveEwaDownscaleResult = {
  rgba: Uint8Array;
  width: number;
  height: number;
  profile: "adaptive-ewa";
  receipt: AdaptiveEwaReceipt;
};


export type AdaptiveEwaDeltaEGateRequest = {
  rgba: Uint8Array;
  srcWidth: number;
  srcHeight: number;
  dstWidth: number;
  dstHeight: number;
  profile: "adaptive-ewa-deltae";
  inputColorSpace?: "srgb";
  outputColorSpace?: "srgb";
  adaptiveParams?: Partial<AdaptiveEwaParams>;
  deltaEGate?: Partial<DeltaEGateParams>;
};

export type AdaptiveEwaDeltaEGateResult = {
  rgba: Uint8Array;
  width: number;
  height: number;
  profile: "adaptive-ewa-deltae";
  receipt: DeltaEGateResizeReceipt;
};

export type DadumAdaptiveQmapTilemaskRequest = {
  rgba: Uint8Array;
  srcWidth: number;
  srcHeight: number;
  dstWidth: number;
  dstHeight: number;
  profile: "dadum-adaptive-qmap-tilemask";
  params?: Partial<DadumAdaptiveQmapTilemaskParams>;
};

export type DadumAdaptiveQmapTilemaskResult = {
  rgba: Uint8Array;
  width: number;
  height: number;
  profile: "dadum-adaptive-qmap-tilemask";
  receipt: DadumAdaptiveQmapTilemaskReceipt;
};

export type AnyPhotoSealResizeResult =
  | WebGPUExportDownscaleResult
  | AdaptiveEwaDownscaleResult
  | AdaptiveEwaDeltaEGateResult
  | DadumAdaptiveQmapTilemaskResult;

export type { DownscaleComparisonProfile, DownscaleParityGateParams } from "./dadumAdaptiveQmapTilemaskParityPolicy";
export type { DownscaleParityGateResult } from "./dadumAdaptiveQmapTilemaskParityGate";
export type {
  DownscaleParityGateReceipt,
  ExportEwaComparisonReceipt,
  DadumCandidateComparisonReceipt,
} from "./dadumAdaptiveQmapTilemaskParityReceipt";

export type { OklabMetricLocalSeal } from "./deltaEGateReceipt";
