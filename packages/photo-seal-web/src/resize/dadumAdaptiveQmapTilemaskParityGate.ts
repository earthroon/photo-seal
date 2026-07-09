import { downscaleRgbaWithDadumAdaptiveQmapTilemask } from "./dadumAdaptiveQmapTilemaskDownscale";
import { computeDownscaleComparisonMetrics } from "./dadumAdaptiveQmapTilemaskParityMetrics";
import {
  createDadumCandidateComparisonReceipt,
  createDownscaleParityGateReceipt,
  createExportEwaComparisonReceipt,
  type DadumCandidateComparisonReceipt,
  type DownscaleParityGateReceipt,
  type ExportEwaComparisonReceipt,
} from "./dadumAdaptiveQmapTilemaskParityReceipt";
import {
  DADUM_ADAPTIVE_QMAP_TILEMASK_CANDIDATE_PROFILE,
  DEFAULT_DOWNSCALE_PARITY_GATE_PARAMS,
  EXPORT_EWA_BASELINE_PROFILE,
  validateDownscaleParityGateParams,
  type DownscaleParityGateParams,
} from "./dadumAdaptiveQmapTilemaskParityPolicy";
import { downscaleRgbaWithWebGPUExportEwa } from "./webgpuExportDownscale";

export type DownscaleParityGateResult = {
  baseline: {
    rgba: Uint8Array;
    width: number;
    height: number;
    receipt: ExportEwaComparisonReceipt;
  };
  candidate: {
    rgba: Uint8Array;
    width: number;
    height: number;
    receipt: DadumCandidateComparisonReceipt;
  };
  receipt: DownscaleParityGateReceipt;
};

export async function compareDadumAdaptiveQmapTilemaskAgainstExportEwa(
  params: DownscaleParityGateParams,
): Promise<DownscaleParityGateResult> {
  validateDownscaleParityGateParams(params);

  const baseline = await downscaleRgbaWithWebGPUExportEwa({
    rgba: params.input,
    srcWidth: params.inputWidth,
    srcHeight: params.inputHeight,
    dstWidth: params.outputWidth,
    dstHeight: params.outputHeight,
    profile: EXPORT_EWA_BASELINE_PROFILE,
  });

  const candidate = await downscaleRgbaWithDadumAdaptiveQmapTilemask({
    rgba: params.input,
    srcWidth: params.inputWidth,
    srcHeight: params.inputHeight,
    dstWidth: params.outputWidth,
    dstHeight: params.outputHeight,
    profile: DADUM_ADAPTIVE_QMAP_TILEMASK_CANDIDATE_PROFILE,
  });

  if (baseline.width !== candidate.width || baseline.height !== candidate.height) {
    throw new Error("TDT-PHOTOSEAL-03-R2 parity gate requires identical baseline/candidate output dimensions.");
  }
  if (baseline.rgba.length !== candidate.rgba.length) {
    throw new Error("TDT-PHOTOSEAL-03-R2 parity gate requires identical baseline/candidate output byte lengths.");
  }
  if (candidate.receipt.outputColorSpace !== "srgb" || candidate.receipt.hiddenGammaTransformUsed !== false) {
    throw new Error("TDT-PHOTOSEAL-03-R2 candidate receipt must preserve sRGB output without hidden gamma transform.");
  }

  const baselineReceipt = createExportEwaComparisonReceipt({
    inputWidth: params.inputWidth,
    inputHeight: params.inputHeight,
    outputWidth: params.outputWidth,
    outputHeight: params.outputHeight,
    baselineReceipt: baseline.receipt,
  });

  const candidateReceipt = createDadumCandidateComparisonReceipt({
    inputWidth: params.inputWidth,
    inputHeight: params.inputHeight,
    outputWidth: params.outputWidth,
    outputHeight: params.outputHeight,
    candidateReceipt: candidate.receipt,
  });

  const metrics = computeDownscaleComparisonMetrics({
    baseline: baseline.rgba,
    candidate: candidate.rgba,
    width: params.outputWidth,
    height: params.outputHeight,
    compareDeltaE: params.compareDeltaE,
    compareEdgeProxy: params.compareEdgeProxy,
    compareDetailProxy: params.compareDetailProxy,
    compareByteStats: params.compareByteStats,
  });

  const receipt = createDownscaleParityGateReceipt({
    inputWidth: params.inputWidth,
    inputHeight: params.inputHeight,
    outputWidth: params.outputWidth,
    outputHeight: params.outputHeight,
    baselineReceipt,
    candidateReceipt,
    metrics,
    runtimeWebGpuSmoke: "PASS",
    comparisonCompleted: true,
  });

  return {
    baseline: {
      rgba: baseline.rgba,
      width: baseline.width,
      height: baseline.height,
      receipt: baselineReceipt,
    },
    candidate: {
      rgba: candidate.rgba,
      width: candidate.width,
      height: candidate.height,
      receipt: candidateReceipt,
    },
    receipt,
  };
}

export function makeNotRunDownscaleParityGateReceipt(args: {
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  reason?: string;
}): DownscaleParityGateReceipt {
  const baselineReceipt: ExportEwaComparisonReceipt = {
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
    baselineReceiptPatchId: "TDT-PHOTOSEAL-01",
    baselineReceiptStage: "webgpu-export-downscale",
    paddedBufferReturned: false,
    gpuFallbackUsed: false,
    canvasFallbackUsed: false,
  };
  const candidateReceipt: DadumCandidateComparisonReceipt = {
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
  return createDownscaleParityGateReceipt({
    inputWidth: args.inputWidth,
    inputHeight: args.inputHeight,
    outputWidth: args.outputWidth,
    outputHeight: args.outputHeight,
    baselineReceipt,
    candidateReceipt,
    metrics: [],
    runtimeWebGpuSmoke: "NOT_RUN",
    runtimeWebGpuSmokeReason: args.reason ?? "NO_BROWSER_WEBGPU",
    comparisonCompleted: false,
  });
}

export { DEFAULT_DOWNSCALE_PARITY_GATE_PARAMS };
export type { DownscaleParityGateParams };
