import { requestPhotoSealGPUDevice } from "../gpu/device";
import { PhotoSealWebGPUError } from "../gpu/gpuError";
import { createPhotoSealTexture } from "../gpu/gpuTextureFactory";
import { readbackRgba8Texture } from "../gpu/textureReadback";
import { uploadRgba8Texture } from "../gpu/textureUpload";
import { validateGpuDimension } from "../gpu/webgpuSupport";
import adaptiveEwaWGSL from "./shaders/adaptiveEwaDownscale.wgsl?raw";
import {
  normalizeAdaptiveEwaParams,
  validateAdaptiveEwaParams,
  type AdaptiveEwaParams,
} from "./adaptiveEwaParams";
import { createAdaptiveEwaReceipt, type AdaptiveEwaReceipt } from "./adaptiveEwaReceipt";

const WORKGROUP_SIZE = 8;
const UNIFORM_BYTES = 64;

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

type AdaptiveEwaState = {
  device: GPUDevice;
  pipeline: GPUComputePipeline;
  sampler: GPUSampler;
  uniform: GPUBuffer;
};

let adaptiveEwaState: AdaptiveEwaState | null = null;

function validateRequest(request: AdaptiveEwaDownscaleRequest): {
  srcWidth: number;
  srcHeight: number;
  dstWidth: number;
  dstHeight: number;
  params: AdaptiveEwaParams;
} {
  const srcWidth = validateGpuDimension("srcWidth", request.srcWidth);
  const srcHeight = validateGpuDimension("srcHeight", request.srcHeight);
  const dstWidth = validateGpuDimension("dstWidth", request.dstWidth);
  const dstHeight = validateGpuDimension("dstHeight", request.dstHeight);

  if (request.profile !== "adaptive-ewa") {
    throw new PhotoSealWebGPUError(
      "INVALID_DIMENSION",
      "TDT-PHOTOSEAL-03 adaptive candidate requires profile=adaptive-ewa."
    );
  }

  if (!(request.rgba instanceof Uint8Array)) {
    throw new PhotoSealWebGPUError(
      "INVALID_RGBA_LENGTH",
      "Adaptive EWA source must be a Uint8Array."
    );
  }

  const expected = srcWidth * srcHeight * 4;
  if (request.rgba.length !== expected) {
    throw new PhotoSealWebGPUError(
      "INVALID_RGBA_LENGTH",
      `Adaptive EWA RGBA source length mismatch. expected=${expected} actual=${request.rgba.length}`
    );
  }

  const params = normalizeAdaptiveEwaParams(request.params);
  try {
    validateAdaptiveEwaParams(params);
  } catch (error) {
    throw new PhotoSealWebGPUError(
      "UNCAUGHT_GPU_ERROR",
      "INVALID_ADAPTIVE_EWA_PARAMS",
      error
    );
  }

  return { srcWidth, srcHeight, dstWidth, dstHeight, params };
}

async function ensureAdaptiveEwaState(): Promise<AdaptiveEwaState> {
  if (adaptiveEwaState?.device) return adaptiveEwaState;

  const { device } = await requestPhotoSealGPUDevice();
  let module: GPUShaderModule;
  try {
    module = device.createShaderModule({
      label: "photoseal-adaptive-ewa-module",
      code: adaptiveEwaWGSL,
    });
  } catch (error) {
    throw new PhotoSealWebGPUError(
      "UNCAUGHT_GPU_ERROR",
      "ADAPTIVE_EWA_SHADER_CREATE_FAILED",
      error
    );
  }

  let pipeline: GPUComputePipeline;
  try {
    pipeline = device.createComputePipeline({
      label: "photoseal-adaptive-ewa-pipeline",
      layout: "auto",
      compute: { module, entryPoint: "main" },
    });
  } catch (error) {
    throw new PhotoSealWebGPUError(
      "UNCAUGHT_GPU_ERROR",
      "ADAPTIVE_EWA_PIPELINE_CREATE_FAILED",
      error
    );
  }

  const sampler = device.createSampler({
    label: "photoseal-adaptive-ewa-sampler",
    minFilter: "linear",
    magFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
  });

  const uniform = device.createBuffer({
    label: "photoseal-adaptive-ewa-uniform",
    size: UNIFORM_BYTES,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  adaptiveEwaState = { device, pipeline, sampler, uniform };
  return adaptiveEwaState;
}

function makeAdaptiveUniform(
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number,
  params: AdaptiveEwaParams
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
  f32[6] = params.tileSize;
  f32[7] = params.maxKernelRadius;
  f32[8] = params.level0ScaleThreshold;
  f32[9] = params.level1ScaleThreshold;
  f32[10] = params.edgeSensitivity;
  f32[11] = params.detailBoost;

  return buffer;
}

export async function downscaleRgbaWithAdaptiveEwa(
  request: AdaptiveEwaDownscaleRequest
): Promise<AdaptiveEwaDownscaleResult> {
  const { srcWidth, srcHeight, dstWidth, dstHeight, params } = validateRequest(request);
  const { device, pipeline, sampler, uniform } = await ensureAdaptiveEwaState();

  const sourceUpload = uploadRgba8Texture({
    device,
    rgba: request.rgba,
    width: srcWidth,
    height: srcHeight,
    label: "photoseal-adaptive-ewa-source-rgba8unorm",
  });

  // Candidate note: rgba16float remains the preferred high precision working format
  // for future split passes. This pass writes final rgba8unorm directly and does not
  // promote itself to the default resize path.
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
    label: "photoseal-adaptive-ewa-output-rgba8unorm",
  });
  const workingFormatSeal = "rgba16float";
  void workingFormatSeal;

  device.queue.writeBuffer(
    uniform,
    0,
    makeAdaptiveUniform(srcWidth, srcHeight, dstWidth, dstHeight, params)
  );

  const bindGroup = device.createBindGroup({
    label: "photoseal-adaptive-ewa-bindgroup",
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: sourceUpload.texture.createView() },
      { binding: 1, resource: sampler },
      { binding: 2, resource: outputTexture.createView() },
      { binding: 3, resource: { buffer: uniform } },
    ],
  });

  const commandEncoder = device.createCommandEncoder({
    label: "photoseal-adaptive-ewa-command-encoder",
  });

  const pass = commandEncoder.beginComputePass({ label: "photoseal-adaptive-ewa-pass" });
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
    label: "photoseal-adaptive-ewa-readback",
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
      `Adaptive EWA readback length mismatch. expected=${expectedOutputBytes} actual=${readback.rgba.length}`
    );
  }

  return {
    rgba: readback.rgba,
    width: dstWidth,
    height: dstHeight,
    profile: "adaptive-ewa",
    receipt: createAdaptiveEwaReceipt({
      srcWidth,
      srcHeight,
      srcBytes: request.rgba.length,
      dstWidth,
      dstHeight,
      dstBytes: readback.rgba.length,
      params,
      gpuHarness: readback.receipt,
    }),
  };
}
