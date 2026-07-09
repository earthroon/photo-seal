import type { GPUHarnessReceipt } from "../gpu/gpuReceipt";
import type { AdaptiveEwaParams } from "./adaptiveEwaParams";

export type AdaptiveEwaReceipt = {
  patchId: "TDT-PHOTOSEAL-03";
  stage: "adaptive-ewa-candidate-resize";
  profile: "adaptive-ewa";
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
  params: AdaptiveEwaParams;
  gpu: {
    backend: "webgpu";
    fallbackUsed: false;
  };
  gpuHarness: GPUHarnessReceipt;
  candidate: {
    defaultProfileChanged: false;
    promotedToDefault: false;
  };
  shaders: {
    adaptive: "adaptiveEwaDownscale.wgsl";
  };
};

export function createAdaptiveEwaReceipt(args: {
  srcWidth: number;
  srcHeight: number;
  srcBytes: number;
  dstWidth: number;
  dstHeight: number;
  dstBytes: number;
  params: AdaptiveEwaParams;
  gpuHarness: GPUHarnessReceipt;
}): AdaptiveEwaReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-03",
    stage: "adaptive-ewa-candidate-resize",
    profile: "adaptive-ewa",
    input: {
      width: args.srcWidth,
      height: args.srcHeight,
      bytes: args.srcBytes,
      format: "rgba8",
    },
    output: {
      width: args.dstWidth,
      height: args.dstHeight,
      bytes: args.dstBytes,
      format: "rgba8",
    },
    params: args.params,
    gpu: {
      backend: "webgpu",
      fallbackUsed: false,
    },
    gpuHarness: args.gpuHarness,
    candidate: {
      defaultProfileChanged: false,
      promotedToDefault: false,
    },
    shaders: {
      adaptive: "adaptiveEwaDownscale.wgsl",
    },
  };
}
