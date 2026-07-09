import type { GPUHarnessReceipt } from "../gpu/gpuReceipt";
import type { AdaptiveEwaParams } from "./adaptiveEwaParams";
import type { DeltaEGateParams } from "./deltaEGateParams";

export type OklabMetricLocalSeal = {
  oklabUsed: true;
  oklabUseScope: "metric-local";
  deltaEUsed: true;
  deltaEUseScope: "soft-clamp-weight";
  persistentOklabOutputUsed: false;
  persistentLinearOutputUsed: false;
  oklabOutputHandedToEncoder: false;
  linearOutputHandedToEncoder: false;
  inputColorSpace: "srgb";
  outputColorSpace: "srgb";
  hiddenGammaTransformUsed: false;
  doubleGammaDetected: false;
};

export const OKLAB_METRIC_LOCAL_SEAL: OklabMetricLocalSeal = {
  oklabUsed: true,
  oklabUseScope: "metric-local",
  deltaEUsed: true,
  deltaEUseScope: "soft-clamp-weight",
  persistentOklabOutputUsed: false,
  persistentLinearOutputUsed: false,
  oklabOutputHandedToEncoder: false,
  linearOutputHandedToEncoder: false,
  inputColorSpace: "srgb",
  outputColorSpace: "srgb",
  hiddenGammaTransformUsed: false,
  doubleGammaDetected: false,
};

export function validateOklabMetricLocalSeal(seal: OklabMetricLocalSeal): void {
  if (seal.oklabUsed !== true) throw new Error("OKLab metric seal requires oklabUsed=true.");
  if (seal.oklabUseScope !== "metric-local") throw new Error("OKLab scope must be metric-local.");
  if (seal.deltaEUsed !== true) throw new Error("DeltaE metric seal requires deltaEUsed=true.");
  if (seal.deltaEUseScope !== "soft-clamp-weight") throw new Error("DeltaE scope must be soft-clamp-weight.");
  if (seal.persistentOklabOutputUsed !== false) throw new Error("Persistent OKLab output is forbidden.");
  if (seal.persistentLinearOutputUsed !== false) throw new Error("Persistent linear output is forbidden.");
  if (seal.oklabOutputHandedToEncoder !== false) throw new Error("OKLab output must not be handed to encoder.");
  if (seal.linearOutputHandedToEncoder !== false) throw new Error("Linear output must not be handed to encoder.");
  if (seal.inputColorSpace !== "srgb") throw new Error("OKLab metric input color space must be srgb.");
  if (seal.outputColorSpace !== "srgb") throw new Error("OKLab metric output color space must be srgb.");
  if (seal.hiddenGammaTransformUsed !== false) throw new Error("Hidden gamma transform must remain false.");
  if (seal.doubleGammaDetected !== false) throw new Error("Double gamma detection must remain false.");
}

export type DeltaEGateResizeReceipt = {
  patchId: "TDT-PHOTOSEAL-04-R1";
  stage: "oklab-deltae-metric-local-soft-clamp-srgb-rebind";
  profile: "adaptive-ewa-deltae";
  input: {
    width: number;
    height: number;
    bytes: number;
    format: "rgba8";
    colorSpace: "srgb";
  };
  output: {
    width: number;
    height: number;
    bytes: number;
    format: "rgba8";
    colorSpace: "srgb";
  };
  inputColorSpace: "srgb";
  outputColorSpace: "srgb";
  adaptiveParams: AdaptiveEwaParams;
  deltaEGate: DeltaEGateParams;
  oklabMetricLocalSeal: OklabMetricLocalSeal;
  oklabUsed: true;
  oklabMetricLocalOnly: true;
  deltaEUsed: true;
  deltaEUsedForSoftClampWeight: true;
  persistentOklabOutputUsed: false;
  persistentLinearOutputUsed: false;
  oklabOutputHandedToEncoder: false;
  linearOutputHandedToEncoder: false;
  hiddenGammaTransformUsed: false;
  doubleGammaDetected: false;
  gpu: {
    backend: "webgpu";
    fallbackUsed: false;
  };
  gpuHarness: GPUHarnessReceipt;
  candidate: {
    defaultProfileChanged: false;
    promotedToDefault: false;
    exportEwaUnchanged: true;
    adaptiveEwaUnchanged: true;
    dadumFullChainCandidateUnchanged: true;
  };
  defaultProfileChanged: false;
  promotedToDefault: false;
  gpuFallbackUsed: false;
  canvasFallbackUsed: false;
  cpuColorCorrectionUsed: false;
  paddedBufferReturned: false;
  shaders: {
    deltae: "adaptiveEwaDeltaEGate.wgsl";
  };
};

export function createDeltaEGateResizeReceipt(args: {
  srcWidth: number;
  srcHeight: number;
  srcBytes: number;
  dstWidth: number;
  dstHeight: number;
  dstBytes: number;
  adaptiveParams: AdaptiveEwaParams;
  deltaEGate: DeltaEGateParams;
  gpuHarness: GPUHarnessReceipt;
}): DeltaEGateResizeReceipt {
  validateOklabMetricLocalSeal(OKLAB_METRIC_LOCAL_SEAL);

  return {
    patchId: "TDT-PHOTOSEAL-04-R1",
    stage: "oklab-deltae-metric-local-soft-clamp-srgb-rebind",
    profile: "adaptive-ewa-deltae",
    input: {
      width: args.srcWidth,
      height: args.srcHeight,
      bytes: args.srcBytes,
      format: "rgba8",
      colorSpace: "srgb",
    },
    output: {
      width: args.dstWidth,
      height: args.dstHeight,
      bytes: args.dstBytes,
      format: "rgba8",
      colorSpace: "srgb",
    },
    inputColorSpace: "srgb",
    outputColorSpace: "srgb",
    adaptiveParams: args.adaptiveParams,
    deltaEGate: args.deltaEGate,
    oklabMetricLocalSeal: OKLAB_METRIC_LOCAL_SEAL,
    oklabUsed: true,
    oklabMetricLocalOnly: true,
    deltaEUsed: true,
    deltaEUsedForSoftClampWeight: true,
    persistentOklabOutputUsed: false,
    persistentLinearOutputUsed: false,
    oklabOutputHandedToEncoder: false,
    linearOutputHandedToEncoder: false,
    hiddenGammaTransformUsed: false,
    doubleGammaDetected: false,
    gpu: {
      backend: "webgpu",
      fallbackUsed: false,
    },
    gpuHarness: args.gpuHarness,
    candidate: {
      defaultProfileChanged: false,
      promotedToDefault: false,
      exportEwaUnchanged: true,
      adaptiveEwaUnchanged: true,
      dadumFullChainCandidateUnchanged: true,
    },
    defaultProfileChanged: false,
    promotedToDefault: false,
    gpuFallbackUsed: false,
    canvasFallbackUsed: false,
    cpuColorCorrectionUsed: false,
    paddedBufferReturned: false,
    shaders: {
      deltae: "adaptiveEwaDeltaEGate.wgsl",
    },
  };
}
