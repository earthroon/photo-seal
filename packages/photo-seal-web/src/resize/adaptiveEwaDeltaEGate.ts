import { requestPhotoSealGPUDevice } from "../gpu/device";
import { PhotoSealWebGPUError } from "../gpu/gpuError";
import { createPhotoSealTexture } from "../gpu/gpuTextureFactory";
import { readbackRgba8Texture } from "../gpu/textureReadback";
import { uploadRgba8Texture } from "../gpu/textureUpload";
import { validateGpuDimension } from "../gpu/webgpuSupport";
import {
  normalizeAdaptiveEwaParams,
  validateAdaptiveEwaParams,
  type AdaptiveEwaParams,
} from "./adaptiveEwaParams";
import {
  createDeltaEGateResizeReceipt,
  type DeltaEGateResizeReceipt,
} from "./deltaEGateReceipt";
import {
  deltaEReferenceModeToUniform,
  normalizeDeltaEGateParams,
  validateDeltaEGateParams,
  type DeltaEGateParams,
} from "./deltaEGateParams";
import adaptiveEwaDeltaEGateWGSL from "./shaders/adaptiveEwaDeltaEGate.wgsl?raw";

const WORKGROUP_SIZE = 8;
const UNIFORM_BYTES = 96;

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

type DeltaEGateState = {
  device: GPUDevice;
  pipeline: GPUComputePipeline;
  sampler: GPUSampler;
  uniform: GPUBuffer;
};

let deltaEGateState: DeltaEGateState | null = null;

function validateRequest(request: AdaptiveEwaDeltaEGateRequest): {
  srcWidth: number;
  srcHeight: number;
  dstWidth: number;
  dstHeight: number;
  adaptiveParams: AdaptiveEwaParams;
  deltaEGate: DeltaEGateParams;
} {
  const srcWidth = validateGpuDimension("srcWidth", request.srcWidth);
  const srcHeight = validateGpuDimension("srcHeight", request.srcHeight);
  const dstWidth = validateGpuDimension("dstWidth", request.dstWidth);
  const dstHeight = validateGpuDimension("dstHeight", request.dstHeight);

  if (request.inputColorSpace && request.inputColorSpace !== "srgb") {
    throw new PhotoSealWebGPUError(
      "INVALID_DIMENSION",
      "TDT-PHOTOSEAL-04-R1 requires inputColorSpace=srgb for OKLab metric-local resize."
    );
  }

  if (request.outputColorSpace && request.outputColorSpace !== "srgb") {
    throw new PhotoSealWebGPUError(
      "INVALID_DIMENSION",
      "TDT-PHOTOSEAL-04-R1 requires outputColorSpace=srgb after metric-local OKLab."
    );
  }

  if (request.profile !== "adaptive-ewa-deltae") {
    throw new PhotoSealWebGPUError(
      "INVALID_DIMENSION",
      "TDT-PHOTOSEAL-04 soft clamp requires profile=adaptive-ewa-deltae."
    );
  }

  if (!(request.rgba instanceof Uint8Array)) {
    throw new PhotoSealWebGPUError(
      "INVALID_RGBA_LENGTH",
      "DeltaE gate source must be a Uint8Array."
    );
  }

  const expected = srcWidth * srcHeight * 4;
  if (request.rgba.length !== expected) {
    throw new PhotoSealWebGPUError(
      "INVALID_RGBA_LENGTH",
      `DeltaE gate RGBA source length mismatch. expected=${expected} actual=${request.rgba.length}`
    );
  }

  const adaptiveParams = normalizeAdaptiveEwaParams(request.adaptiveParams);
  const deltaEGate = normalizeDeltaEGateParams(request.deltaEGate);

  try {
    validateAdaptiveEwaParams(adaptiveParams);
    validateDeltaEGateParams(deltaEGate);
  } catch (error) {
    throw new PhotoSealWebGPUError(
      "UNCAUGHT_GPU_ERROR",
      "INVALID_DELTAE_GATE_PARAMS",
      error
    );
  }

  return { srcWidth, srcHeight, dstWidth, dstHeight, adaptiveParams, deltaEGate };
}

async function ensureDeltaEGateState(): Promise<DeltaEGateState> {
  if (deltaEGateState?.device) return deltaEGateState;

  const { device } = await requestPhotoSealGPUDevice();
  let module: GPUShaderModule;
  try {
    module = device.createShaderModule({
      label: "photoseal-adaptive-ewa-deltae-module",
      code: adaptiveEwaDeltaEGateWGSL,
    });
  } catch (error) {
    throw new PhotoSealWebGPUError(
      "UNCAUGHT_GPU_ERROR",
      "DELTAE_SHADER_CREATE_FAILED",
      error
    );
  }

  let pipeline: GPUComputePipeline;
  try {
    pipeline = device.createComputePipeline({
      label: "photoseal-adaptive-ewa-deltae-pipeline",
      layout: "auto",
      compute: { module, entryPoint: "main" },
    });
  } catch (error) {
    throw new PhotoSealWebGPUError(
      "UNCAUGHT_GPU_ERROR",
      "DELTAE_PIPELINE_CREATE_FAILED",
      error
    );
  }

  const sampler = device.createSampler({
    label: "photoseal-adaptive-ewa-deltae-sampler",
    minFilter: "linear",
    magFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
  });

  const uniform = device.createBuffer({
    label: "photoseal-adaptive-ewa-deltae-uniform",
    size: UNIFORM_BYTES,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  deltaEGateState = { device, pipeline, sampler, uniform };
  return deltaEGateState;
}

function makeDeltaEGateUniform(
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number,
  adaptiveParams: AdaptiveEwaParams,
  deltaEGate: DeltaEGateParams
): ArrayBuffer {
  const buffer = new ArrayBuffer(UNIFORM_BYTES);
  const u32 = new Uint32Array(buffer);
  const f32 = new Float32Array(buffer);

  u32[0] = srcWidth >>> 0;
  u32[1] = srcHeight >>> 0;
  u32[2] = dstWidth >>> 0;
  u32[3] = dstHeight >>> 0;

  f32[4] = srcWidth / Math.max(1, dstWidth);
  f32[5] = srcHeight / Math.max(1, dstHeight);
  f32[6] = adaptiveParams.tileSize;
  f32[7] = adaptiveParams.maxKernelRadius;
  f32[8] = adaptiveParams.level0ScaleThreshold;
  f32[9] = adaptiveParams.level1ScaleThreshold;
  f32[10] = adaptiveParams.edgeSensitivity;
  f32[11] = adaptiveParams.detailBoost;
  f32[12] = deltaEGate.threshold;
  f32[13] = deltaEGate.softness;
  f32[14] = deltaEGate.strength;
  u32[15] = deltaEGate.enabled ? 1 : 0;
  u32[16] = deltaEReferenceModeToUniform(deltaEGate.referenceMode);

  return buffer;
}

export async function downscaleRgbaWithAdaptiveEwaDeltaEGate(
  request: AdaptiveEwaDeltaEGateRequest
): Promise<AdaptiveEwaDeltaEGateResult> {
  const { srcWidth, srcHeight, dstWidth, dstHeight, adaptiveParams, deltaEGate } =
    validateRequest(request);
  const { device, pipeline, sampler, uniform } = await ensureDeltaEGateState();

  const sourceUpload = uploadRgba8Texture({
    device,
    rgba: request.rgba,
    width: srcWidth,
    height: srcHeight,
    label: "photoseal-adaptive-ewa-deltae-source-rgba8unorm",
  });

  const outputTexture = createPhotoSealTexture({
    device,
    width: dstWidth,
    height: dstHeight,
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.STORAGE_BINDING |
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.COPY_DST,
    label: "photoseal-adaptive-ewa-deltae-output-rgba8unorm",
  });
  const workingFormatSeal = "rgba16float";
  void workingFormatSeal;

  device.queue.writeBuffer(
    uniform,
    0,
    makeDeltaEGateUniform(srcWidth, srcHeight, dstWidth, dstHeight, adaptiveParams, deltaEGate)
  );

  const bindGroup = device.createBindGroup({
    label: "photoseal-adaptive-ewa-deltae-bindgroup",
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: sourceUpload.texture.createView() },
      { binding: 1, resource: sampler },
      { binding: 2, resource: outputTexture.createView() },
      { binding: 3, resource: { buffer: uniform } },
    ],
  });

  const commandEncoder = device.createCommandEncoder({
    label: "photoseal-adaptive-ewa-deltae-command-encoder",
  });

  const pass = commandEncoder.beginComputePass({ label: "photoseal-adaptive-ewa-deltae-pass" });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(Math.ceil(dstWidth / WORKGROUP_SIZE), Math.ceil(dstHeight / WORKGROUP_SIZE), 1);
  pass.end();

  device.queue.submit([commandEncoder.finish()]);

  const readback = await readbackRgba8Texture({
    device,
    texture: outputTexture,
    width: dstWidth,
    height: dstHeight,
    label: "photoseal-adaptive-ewa-deltae-readback",
  });

  try {
    sourceUpload.texture.destroy();
    outputTexture.destroy();
  } catch {
    // Destruction is best-effort only; no fallback path is used.
  }

  const expectedOutputBytes = dstWidth * dstHeight * 4;
  if (readback.rgba.length !== expectedOutputBytes) {
    throw new PhotoSealWebGPUError(
      "READBACK_SIZE_MISMATCH",
      `DeltaE gate readback length mismatch. expected=${expectedOutputBytes} actual=${readback.rgba.length}`
    );
  }

  return {
    rgba: readback.rgba,
    width: dstWidth,
    height: dstHeight,
    profile: "adaptive-ewa-deltae",
    receipt: createDeltaEGateResizeReceipt({
      srcWidth,
      srcHeight,
      srcBytes: request.rgba.length,
      dstWidth,
      dstHeight,
      dstBytes: readback.rgba.length,
      adaptiveParams,
      deltaEGate,
      gpuHarness: readback.receipt,
    }),
  };
}
