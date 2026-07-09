import type { ResizeReceipt } from "./types";
import type { DadumAdaptiveQmapTilemaskReceipt } from "./dadumAdaptiveQmapTilemaskReceipt";
import type { DownscaleComparisonMetric } from "./dadumAdaptiveQmapTilemaskParityMetrics";

export type ExportEwaComparisonReceipt = {
  patchId: "TDT-PHOTOSEAL-03-R2";
  stage: "export-ewa-baseline-comparison";
  profile: "export-ewa";
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  inputFormat: "rgba8";
  outputFormat: "rgba8";
  inputColorSpace: "srgb";
  outputColorSpace: "srgb";
  hiddenGammaTransformUsed: false;
  doubleGammaDetected: false;
  baselineReceiptPatchId: string;
  baselineReceiptStage: string;
  paddedBufferReturned: false;
  gpuFallbackUsed: false;
  canvasFallbackUsed: false;
};

export type DadumCandidateComparisonReceipt = {
  patchId: "TDT-PHOTOSEAL-03-R2";
  stage: "dadum-adaptive-qmap-tilemask-candidate-comparison";
  profile: "dadum-adaptive-qmap-tilemask";
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  inputFormat: "rgba8";
  outputFormat: "rgba8";
  inputColorSpace: "srgb";
  outputColorSpace: "srgb";
  qmapPresent: true;
  tileMaskPresent: true;
  adaptiveEwaPresent: true;
  qmapBoundToAdaptivePass: true;
  tileMaskBoundToAdaptivePass: true;
  fullChainCandidate: true;
  simplifiedAdaptiveEwaAliasUsed: false;
  hiddenGammaTransformUsed: false;
  doubleGammaDetected: false;
  candidateReceiptPatchId: "TDT-PHOTOSEAL-03-R1";
  candidateReceiptStage: "dadum-adaptive-qmap-tilemask-full-chain-candidate";
  paddedBufferReturned: false;
  gpuFallbackUsed: false;
  canvasFallbackUsed: false;
};

export type RuntimeWebGpuSmokeStatus = "PASS" | "FAIL" | "NOT_RUN";

export type DownscaleParityGateReceipt = {
  patchId: "TDT-PHOTOSEAL-03-R2";
  stage: "dadum-adaptive-qmap-tilemask-parity-gate";
  baselineProfile: "export-ewa";
  candidateProfile: "dadum-adaptive-qmap-tilemask";
  defaultProfileBefore: "export-ewa";
  defaultProfileAfter: "export-ewa";
  defaultProfileChanged: false;
  promotedToDefault: false;
  silentPromotionUsed: false;
  autoPromotionUsed: false;
  promotionRequiresExplicitPatch: true;
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  inputColorSpace: "srgb";
  baselineOutputColorSpace: "srgb";
  candidateOutputColorSpace: "srgb";
  hiddenGammaTransformUsed: false;
  doubleGammaDetected: false;
  baselineReceipt: ExportEwaComparisonReceipt;
  candidateReceipt: DadumCandidateComparisonReceipt;
  metrics: DownscaleComparisonMetric[];
  qmapParityRequired: true;
  tileMaskParityRequired: true;
  adaptiveEwaParityRequired: true;
  qmapPresent: true;
  tileMaskPresent: true;
  adaptiveEwaPresent: true;
  qmapBoundToAdaptivePass: true;
  tileMaskBoundToAdaptivePass: true;
  runtimeWebGpuSmoke: RuntimeWebGpuSmokeStatus;
  runtimeWebGpuSmokeReason?: string;
  comparisonCompleted: boolean;
  comparisonReceiptWritten: true;
};

export function createExportEwaComparisonReceipt(args: {
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  baselineReceipt: ResizeReceipt;
}): ExportEwaComparisonReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-03-R2",
    stage: "export-ewa-baseline-comparison",
    profile: "export-ewa",
    inputWidth: args.inputWidth,
    inputHeight: args.inputHeight,
    outputWidth: args.outputWidth,
    outputHeight: args.outputHeight,
    inputFormat: "rgba8",
    outputFormat: "rgba8",
    inputColorSpace: "srgb",
    outputColorSpace: "srgb",
    hiddenGammaTransformUsed: false,
    doubleGammaDetected: false,
    baselineReceiptPatchId: args.baselineReceipt.patchId,
    baselineReceiptStage: args.baselineReceipt.stage,
    paddedBufferReturned: false,
    gpuFallbackUsed: false,
    canvasFallbackUsed: false,
  };
}

export function createDadumCandidateComparisonReceipt(args: {
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  candidateReceipt: DadumAdaptiveQmapTilemaskReceipt;
}): DadumCandidateComparisonReceipt {
  if (!args.candidateReceipt.qmapPresent || !args.candidateReceipt.tileMaskPresent || !args.candidateReceipt.adaptiveEwaPresent) {
    throw new Error("TDT-PHOTOSEAL-03-R2 requires qmap/tileMask/adaptive EWA evidence from TDT-PHOTOSEAL-03-R1.");
  }
  if (!args.candidateReceipt.qmapBoundToAdaptivePass || !args.candidateReceipt.tileMaskBoundToAdaptivePass) {
    throw new Error("TDT-PHOTOSEAL-03-R2 requires qmap and tileMask binding evidence from TDT-PHOTOSEAL-03-R1.");
  }
  return {
    patchId: "TDT-PHOTOSEAL-03-R2",
    stage: "dadum-adaptive-qmap-tilemask-candidate-comparison",
    profile: "dadum-adaptive-qmap-tilemask",
    inputWidth: args.inputWidth,
    inputHeight: args.inputHeight,
    outputWidth: args.outputWidth,
    outputHeight: args.outputHeight,
    inputFormat: "rgba8",
    outputFormat: "rgba8",
    inputColorSpace: "srgb",
    outputColorSpace: "srgb",
    qmapPresent: true,
    tileMaskPresent: true,
    adaptiveEwaPresent: true,
    qmapBoundToAdaptivePass: true,
    tileMaskBoundToAdaptivePass: true,
    fullChainCandidate: true,
    simplifiedAdaptiveEwaAliasUsed: false,
    hiddenGammaTransformUsed: false,
    doubleGammaDetected: false,
    candidateReceiptPatchId: "TDT-PHOTOSEAL-03-R1",
    candidateReceiptStage: "dadum-adaptive-qmap-tilemask-full-chain-candidate",
    paddedBufferReturned: false,
    gpuFallbackUsed: false,
    canvasFallbackUsed: false,
  };
}

export function createDownscaleParityGateReceipt(args: {
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  baselineReceipt: ExportEwaComparisonReceipt;
  candidateReceipt: DadumCandidateComparisonReceipt;
  metrics: DownscaleComparisonMetric[];
  runtimeWebGpuSmoke: RuntimeWebGpuSmokeStatus;
  runtimeWebGpuSmokeReason?: string;
  comparisonCompleted: boolean;
}): DownscaleParityGateReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-03-R2",
    stage: "dadum-adaptive-qmap-tilemask-parity-gate",
    baselineProfile: "export-ewa",
    candidateProfile: "dadum-adaptive-qmap-tilemask",
    defaultProfileBefore: "export-ewa",
    defaultProfileAfter: "export-ewa",
    defaultProfileChanged: false,
    promotedToDefault: false,
    silentPromotionUsed: false,
    autoPromotionUsed: false,
    promotionRequiresExplicitPatch: true,
    inputWidth: args.inputWidth,
    inputHeight: args.inputHeight,
    outputWidth: args.outputWidth,
    outputHeight: args.outputHeight,
    inputColorSpace: "srgb",
    baselineOutputColorSpace: "srgb",
    candidateOutputColorSpace: "srgb",
    hiddenGammaTransformUsed: false,
    doubleGammaDetected: false,
    baselineReceipt: args.baselineReceipt,
    candidateReceipt: args.candidateReceipt,
    metrics: args.metrics,
    qmapParityRequired: true,
    tileMaskParityRequired: true,
    adaptiveEwaParityRequired: true,
    qmapPresent: true,
    tileMaskPresent: true,
    adaptiveEwaPresent: true,
    qmapBoundToAdaptivePass: true,
    tileMaskBoundToAdaptivePass: true,
    runtimeWebGpuSmoke: args.runtimeWebGpuSmoke,
    ...(args.runtimeWebGpuSmokeReason ? { runtimeWebGpuSmokeReason: args.runtimeWebGpuSmokeReason } : {}),
    comparisonCompleted: args.comparisonCompleted,
    comparisonReceiptWritten: true,
  };
}
