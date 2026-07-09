import type { GPUHarnessReceipt } from "../gpu/gpuReceipt";
import type { DadumAdaptiveQmapTilemaskParams } from "./dadumAdaptiveQmapTilemaskParams";

export type DadumAdaptiveQmapTilemaskReceipt = {
  patchId: "TDT-PHOTOSEAL-03-R1";
  stage: "dadum-adaptive-qmap-tilemask-full-chain-candidate";
  profile: "dadum-adaptive-qmap-tilemask";
  defaultProfileChanged: false;
  promotedToDefault: false;
  sourceProject: "DadumDadum";
  sourceRole: "reference-only";
  simplifiedAdaptiveEwaAliasUsed: false;
  fullChainCandidate: true;
  qmapPresent: true;
  tileMaskPresent: true;
  adaptiveEwaPresent: true;
  qmapBoundToAdaptivePass: true;
  tileMaskBoundToAdaptivePass: true;
  fastPassPresent: boolean;
  anisoPassPresent: boolean;
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
  oklabMetricLocalOnly: true;
  persistentOklabOutputUsed: false;
  gpuFallbackUsed: false;
  canvasFallbackUsed: false;
  cpuColorCorrectionUsed: false;
  paddedBufferReturned: false;
  params: DadumAdaptiveQmapTilemaskParams;
  gpuHarness: GPUHarnessReceipt;
  shaders: {
    qmapPreprocess: "dadumQmapPreprocess.wgsl";
    qmapLodMeanMaxMix: "dadumQmapLodMeanMaxMix.wgsl";
    tileMaskFromQmap: "dadumTileMaskFromQmap.wgsl";
    fastDownscale: "dadumBoxBilinearDownscaleRgba16f.wgsl";
    adaptiveEwa: "dadumAdaptiveEwaDownscaleRgba16f.wgsl";
    anisoEwa?: "dadumEwaAnisoDownscaleRgba16f.wgsl";
    finalCopy: "dadumRgba16fToRgba8SrgbCopy.wgsl";
  };
};

export function createDadumAdaptiveQmapTilemaskReceipt(args: {
  inputWidth: number;
  inputHeight: number;
  inputBytes: number;
  outputWidth: number;
  outputHeight: number;
  outputBytes: number;
  params: DadumAdaptiveQmapTilemaskParams;
  gpuHarness: GPUHarnessReceipt;
}): DadumAdaptiveQmapTilemaskReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-03-R1",
    stage: "dadum-adaptive-qmap-tilemask-full-chain-candidate",
    profile: "dadum-adaptive-qmap-tilemask",
    defaultProfileChanged: false,
    promotedToDefault: false,
    sourceProject: "DadumDadum",
    sourceRole: "reference-only",
    simplifiedAdaptiveEwaAliasUsed: false,
    fullChainCandidate: true,
    qmapPresent: true,
    tileMaskPresent: true,
    adaptiveEwaPresent: true,
    qmapBoundToAdaptivePass: true,
    tileMaskBoundToAdaptivePass: true,
    fastPassPresent: args.params.fastPassEnabled,
    anisoPassPresent: args.params.anisoEnabled,
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
    oklabMetricLocalOnly: true,
    persistentOklabOutputUsed: false,
    gpuFallbackUsed: false,
    canvasFallbackUsed: false,
    cpuColorCorrectionUsed: false,
    paddedBufferReturned: false,
    params: args.params,
    gpuHarness: args.gpuHarness,
    shaders: {
      qmapPreprocess: "dadumQmapPreprocess.wgsl",
      qmapLodMeanMaxMix: "dadumQmapLodMeanMaxMix.wgsl",
      tileMaskFromQmap: "dadumTileMaskFromQmap.wgsl",
      fastDownscale: "dadumBoxBilinearDownscaleRgba16f.wgsl",
      adaptiveEwa: "dadumAdaptiveEwaDownscaleRgba16f.wgsl",
      ...(args.params.anisoEnabled ? { anisoEwa: "dadumEwaAnisoDownscaleRgba16f.wgsl" as const } : {}),
      finalCopy: "dadumRgba16fToRgba8SrgbCopy.wgsl",
    },
  };
}
