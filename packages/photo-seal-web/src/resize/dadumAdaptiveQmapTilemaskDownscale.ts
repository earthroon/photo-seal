import { requestPhotoSealGPUDevice } from "../gpu/device";
import { PhotoSealWebGPUError } from "../gpu/gpuError";
import { createPhotoSealTexture } from "../gpu/gpuTextureFactory";
import { readbackRgba8Texture } from "../gpu/textureReadback";
import { uploadRgba8Texture } from "../gpu/textureUpload";
import { validateGpuDimension } from "../gpu/webgpuSupport";
import {
  createDadumAdaptiveQmapTilemaskReceipt,
  type DadumAdaptiveQmapTilemaskReceipt,
} from "./dadumAdaptiveQmapTilemaskReceipt";
import {
  normalizeDadumAdaptiveQmapTilemaskParams,
  validateDadumAdaptiveQmapTilemaskParams,
  type DadumAdaptiveQmapTilemaskParams,
} from "./dadumAdaptiveQmapTilemaskParams";
import qmapWGSL from "./shaders/dadumQmapPreprocess.wgsl?raw";
import qmapLodWGSL from "./shaders/dadumQmapLodMeanMaxMix.wgsl?raw";
import tileMaskWGSL from "./shaders/dadumTileMaskFromQmap.wgsl?raw";
import fastDownscaleWGSL from "./shaders/dadumBoxBilinearDownscaleRgba16f.wgsl?raw";
import adaptiveEwaWGSL from "./shaders/dadumAdaptiveEwaDownscaleRgba16f.wgsl?raw";
import anisoEwaWGSL from "./shaders/dadumEwaAnisoDownscaleRgba16f.wgsl?raw";
import finalCopyWGSL from "./shaders/dadumRgba16fToRgba8SrgbCopy.wgsl?raw";

const WORKGROUP_SIZE = 8;

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

type TextureResource = {
  texture: GPUTexture;
  view: GPUTextureView;
  width: number;
  height: number;
  format: GPUTextureFormat;
  label: string;
};

type PipelineSet = {
  qmap: GPUComputePipeline;
  qmapLod: GPUComputePipeline;
  tileMask: GPUComputePipeline;
  fastDownscale: GPUComputePipeline;
  adaptiveEwa: GPUComputePipeline;
  anisoEwa: GPUComputePipeline;
  finalCopy: GPUComputePipeline;
};

let cachedDevice: GPUDevice | null = null;
let cachedPipelines: PipelineSet | null = null;
let cachedSampler: GPUSampler | null = null;

function createStorageTexture(
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat,
  label: string
): TextureResource {
  const texture = createPhotoSealTexture({
    device,
    width,
    height,
    format,
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.STORAGE_BINDING |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.COPY_DST,
    label,
  });
  return { texture, view: texture.createView(), width, height, format, label };
}

function createTileMaskTexture(
  device: GPUDevice,
  width: number,
  height: number
): TextureResource {
  const texture = device.createTexture({
    label: "photoseal-dadum-tilemask-r8uint",
    size: { width, height, depthOrArrayLayers: 1 },
    format: "r8uint",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.STORAGE_BINDING |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.COPY_DST,
  });
  return {
    texture,
    view: texture.createView(),
    width,
    height,
    format: "r8uint",
    label: "photoseal-dadum-tilemask-r8uint",
  };
}

function makeUniformBuffer(device: GPUDevice, size: number, label: string): GPUBuffer {
  return device.createBuffer({
    label,
    size,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
}

function packQmapParams(width: number, height: number, params: DadumAdaptiveQmapTilemaskParams): ArrayBuffer {
  const buffer = new ArrayBuffer(32);
  const u32 = new Uint32Array(buffer);
  const f32 = new Float32Array(buffer);
  u32[0] = width >>> 0;
  u32[1] = height >>> 0;
  f32[2] = params.qmapK0;
  f32[3] = params.qmapK1;
  f32[4] = params.qmapGammaK;
  f32[5] = 0.2126;
  f32[6] = 0.7152;
  f32[7] = 0.0722;
  return buffer;
}

function packQmapLodParams(
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number,
  params: DadumAdaptiveQmapTilemaskParams
): ArrayBuffer {
  const buffer = new ArrayBuffer(64);
  const u32 = new Uint32Array(buffer);
  const f32 = new Float32Array(buffer);
  u32[0] = srcWidth >>> 0;
  u32[1] = srcHeight >>> 0;
  u32[2] = dstWidth >>> 0;
  u32[3] = dstHeight >>> 0;
  u32[4] = Math.max(1, params.tilePx | 0) >>> 0;
  f32[6] = Math.max(0, Math.min(1, params.qmapLodMaxMix));
  return buffer;
}

function packTileMaskParams(tilesW: number, tilesH: number, params: DadumAdaptiveQmapTilemaskParams): ArrayBuffer {
  const buffer = new ArrayBuffer(32);
  const u32 = new Uint32Array(buffer);
  const f32 = new Float32Array(buffer);
  u32[0] = tilesW >>> 0;
  u32[1] = tilesH >>> 0;
  const hi = Math.max(0, Math.min(1, params.tileMaskThresholdHi));
  const lo = Math.max(0, Math.min(hi, params.tileMaskThresholdLo));
  f32[4] = lo;
  f32[5] = hi;
  return buffer;
}

function packFastParams(
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number,
  params: DadumAdaptiveQmapTilemaskParams
): ArrayBuffer {
  const buffer = new ArrayBuffer(32);
  const u32 = new Uint32Array(buffer);
  u32[0] = srcWidth >>> 0;
  u32[1] = srcHeight >>> 0;
  u32[2] = dstWidth >>> 0;
  u32[3] = dstHeight >>> 0;
  u32[4] = params.fastMode === "box" ? 1 : 0;
  return buffer;
}

function packAdaptiveParams(
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number,
  tilesW: number,
  tilesH: number,
  params: DadumAdaptiveQmapTilemaskParams
): ArrayBuffer {
  const buffer = new ArrayBuffer(80);
  const u32 = new Uint32Array(buffer);
  const f32 = new Float32Array(buffer);
  u32[0] = srcWidth >>> 0;
  u32[1] = srcHeight >>> 0;
  u32[2] = dstWidth >>> 0;
  u32[3] = dstHeight >>> 0;
  f32[4] = srcWidth / Math.max(1, dstWidth);
  f32[5] = srcHeight / Math.max(1, dstHeight);
  f32[6] = params.radiusMul;
  f32[7] = params.sigma;
  f32[8] = params.anisoAngle;
  f32[9] = Math.max(1.0, params.anisoAspect);
  f32[10] = params.deThresh;
  f32[11] = Math.max(0.0, params.deSoft);
  f32[12] = Math.max(0.0, Math.min(1.0, params.deK));
  u32[13] = Math.max(1, params.tilePx | 0) >>> 0;
  u32[14] = tilesW >>> 0;
  u32[15] = tilesH >>> 0;
  f32[16] = Math.max(0.0, Math.min(1.0, params.deK1Scale));
  f32[17] = params.deThresh1Add;
  f32[18] = Math.max(0.0, params.deSoft1Mul);
  f32[19] = 0.0;
  return buffer;
}

function packAnisoParams(
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number,
  params: DadumAdaptiveQmapTilemaskParams
): ArrayBuffer {
  const buffer = new ArrayBuffer(64);
  const u32 = new Uint32Array(buffer);
  const f32 = new Float32Array(buffer);
  u32[0] = srcWidth >>> 0;
  u32[1] = srcHeight >>> 0;
  u32[2] = dstWidth >>> 0;
  u32[3] = dstHeight >>> 0;
  f32[4] = srcWidth / Math.max(1, dstWidth);
  f32[5] = srcHeight / Math.max(1, dstHeight);
  f32[6] = params.radiusMul;
  f32[7] = params.sigma;
  f32[8] = params.anisoAngle;
  f32[9] = Math.max(1.0, params.anisoAspect);
  f32[10] = params.deThresh;
  f32[11] = Math.max(0.0, params.deSoft);
  f32[12] = Math.max(0.0, Math.min(1.0, params.deK));
  return buffer;
}

function packFinalCopyParams(width: number, height: number): ArrayBuffer {
  const buffer = new ArrayBuffer(16);
  const u32 = new Uint32Array(buffer);
  u32[0] = width >>> 0;
  u32[1] = height >>> 0;
  return buffer;
}

async function ensurePipelines(device: GPUDevice): Promise<PipelineSet> {
  if (cachedDevice === device && cachedPipelines) return cachedPipelines;

  const qmap = device.createComputePipeline({
    label: "photoseal-dadum-qmap-preprocess-pipeline",
    layout: "auto",
    compute: { module: device.createShaderModule({ label: "dadumQmapPreprocess.wgsl", code: qmapWGSL }), entryPoint: "main" },
  });
  const qmapLod = device.createComputePipeline({
    label: "photoseal-dadum-qmap-lod-meanmax-mix-pipeline",
    layout: "auto",
    compute: { module: device.createShaderModule({ label: "dadumQmapLodMeanMaxMix.wgsl", code: qmapLodWGSL }), entryPoint: "main" },
  });
  const tileMask = device.createComputePipeline({
    label: "photoseal-dadum-tilemask-from-qmap-pipeline",
    layout: "auto",
    compute: { module: device.createShaderModule({ label: "dadumTileMaskFromQmap.wgsl", code: tileMaskWGSL }), entryPoint: "main" },
  });
  const fastDownscale = device.createComputePipeline({
    label: "photoseal-dadum-fast-box-bilinear-pipeline",
    layout: "auto",
    compute: { module: device.createShaderModule({ label: "dadumBoxBilinearDownscaleRgba16f.wgsl", code: fastDownscaleWGSL }), entryPoint: "main" },
  });
  const adaptiveEwa = device.createComputePipeline({
    label: "photoseal-dadum-adaptive-ewa-pipeline",
    layout: "auto",
    compute: { module: device.createShaderModule({ label: "dadumAdaptiveEwaDownscaleRgba16f.wgsl", code: adaptiveEwaWGSL }), entryPoint: "main" },
  });
  const anisoEwa = device.createComputePipeline({
    label: "photoseal-dadum-optional-aniso-ewa-pipeline",
    layout: "auto",
    compute: { module: device.createShaderModule({ label: "dadumEwaAnisoDownscaleRgba16f.wgsl", code: anisoEwaWGSL }), entryPoint: "main" },
  });
  const finalCopy = device.createComputePipeline({
    label: "photoseal-dadum-rgba16f-to-rgba8-srgb-copy-pipeline",
    layout: "auto",
    compute: { module: device.createShaderModule({ label: "dadumRgba16fToRgba8SrgbCopy.wgsl", code: finalCopyWGSL }), entryPoint: "main" },
  });

  cachedDevice = device;
  cachedPipelines = { qmap, qmapLod, tileMask, fastDownscale, adaptiveEwa, anisoEwa, finalCopy };
  cachedSampler = device.createSampler({
    label: "photoseal-dadum-adaptive-qmap-tilemask-sampler",
    magFilter: "linear",
    minFilter: "linear",
    mipmapFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
  });
  return cachedPipelines;
}

function ensureSampler(device: GPUDevice): GPUSampler {
  if (!cachedSampler || cachedDevice !== device) {
    cachedSampler = device.createSampler({
      label: "photoseal-dadum-adaptive-qmap-tilemask-sampler",
      magFilter: "linear",
      minFilter: "linear",
      mipmapFilter: "linear",
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
    });
  }
  return cachedSampler;
}

function validateRequest(request: DadumAdaptiveQmapTilemaskRequest): {
  srcWidth: number;
  srcHeight: number;
  dstWidth: number;
  dstHeight: number;
  params: DadumAdaptiveQmapTilemaskParams;
} {
  const srcWidth = validateGpuDimension("srcWidth", request.srcWidth);
  const srcHeight = validateGpuDimension("srcHeight", request.srcHeight);
  const dstWidth = validateGpuDimension("dstWidth", request.dstWidth);
  const dstHeight = validateGpuDimension("dstHeight", request.dstHeight);
  if (request.profile !== "dadum-adaptive-qmap-tilemask") {
    throw new PhotoSealWebGPUError(
      "INVALID_DIMENSION",
      "TDT-PHOTOSEAL-03-R1 requires profile=dadum-adaptive-qmap-tilemask. simplified adaptive-ewa is not the DadumDadum full chain."
    );
  }
  if (!(request.rgba instanceof Uint8Array)) {
    throw new PhotoSealWebGPUError("INVALID_RGBA_LENGTH", "Dadum full-chain candidate source must be Uint8Array RGBA8.");
  }
  const expected = srcWidth * srcHeight * 4;
  if (request.rgba.length !== expected) {
    throw new PhotoSealWebGPUError(
      "INVALID_RGBA_LENGTH",
      `Dadum full-chain candidate RGBA source length mismatch. expected=${expected} actual=${request.rgba.length}`
    );
  }
  const params = normalizeDadumAdaptiveQmapTilemaskParams(request.params);
  validateDadumAdaptiveQmapTilemaskParams(params);
  return { srcWidth, srcHeight, dstWidth, dstHeight, params };
}

export async function downscaleRgbaWithDadumAdaptiveQmapTilemask(
  request: DadumAdaptiveQmapTilemaskRequest
): Promise<DadumAdaptiveQmapTilemaskResult> {
  const { srcWidth, srcHeight, dstWidth, dstHeight, params } = validateRequest(request);
  const { device } = await requestPhotoSealGPUDevice();
  const pipelines = await ensurePipelines(device);
  const sampler = ensureSampler(device);

  const source = uploadRgba8Texture({
    device,
    rgba: request.rgba,
    width: srcWidth,
    height: srcHeight,
    label: "photoseal-dadum-source-srgb-rgba8",
  });
  const sourceView = source.texture.createView();

  const qmapTex = createStorageTexture(device, srcWidth, srcHeight, "rgba16float", "photoseal-dadum-qmap-rgba16f");
  const tilePx = Math.max(1, params.tilePx | 0);
  const tilesW = Math.max(1, Math.ceil(srcWidth / tilePx));
  const tilesH = Math.max(1, Math.ceil(srcHeight / tilePx));
  const qmapLodTex = createStorageTexture(device, tilesW, tilesH, "rgba16float", "photoseal-dadum-qmap-lod-rgba16f");
  const tileMaskTex = createTileMaskTexture(device, tilesW, tilesH);
  const fastTex = createStorageTexture(device, dstWidth, dstHeight, "rgba16float", "photoseal-dadum-fast-rgba16f");
  const adaptiveTex = createStorageTexture(device, dstWidth, dstHeight, "rgba16float", "photoseal-dadum-adaptive-rgba16f");
  const anisoTex = params.anisoEnabled
    ? createStorageTexture(device, dstWidth, dstHeight, "rgba16float", "photoseal-dadum-aniso-rgba16f")
    : null;
  const finalRgba8Tex = createStorageTexture(device, dstWidth, dstHeight, "rgba8unorm", "photoseal-dadum-final-srgb-rgba8");

  const qmapUniform = makeUniformBuffer(device, 32, "photoseal-dadum-qmap-uniform");
  const qmapLodUniform = makeUniformBuffer(device, 64, "photoseal-dadum-qmap-lod-uniform");
  const tileMaskUniform = makeUniformBuffer(device, 32, "photoseal-dadum-tilemask-uniform");
  const fastUniform = makeUniformBuffer(device, 32, "photoseal-dadum-fast-downscale-uniform");
  const adaptiveUniform = makeUniformBuffer(device, 80, "photoseal-dadum-adaptive-ewa-uniform");
  const anisoUniform = params.anisoEnabled ? makeUniformBuffer(device, 64, "photoseal-dadum-aniso-ewa-uniform") : null;
  const finalCopyUniform = makeUniformBuffer(device, 16, "photoseal-dadum-final-copy-uniform");

  device.queue.writeBuffer(qmapUniform, 0, packQmapParams(srcWidth, srcHeight, params));
  device.queue.writeBuffer(qmapLodUniform, 0, packQmapLodParams(srcWidth, srcHeight, tilesW, tilesH, params));
  device.queue.writeBuffer(tileMaskUniform, 0, packTileMaskParams(tilesW, tilesH, params));
  device.queue.writeBuffer(fastUniform, 0, packFastParams(srcWidth, srcHeight, dstWidth, dstHeight, params));
  device.queue.writeBuffer(adaptiveUniform, 0, packAdaptiveParams(srcWidth, srcHeight, dstWidth, dstHeight, tilesW, tilesH, params));
  if (anisoUniform) {
    device.queue.writeBuffer(anisoUniform, 0, packAnisoParams(dstWidth, dstHeight, dstWidth, dstHeight, params));
  }
  device.queue.writeBuffer(finalCopyUniform, 0, packFinalCopyParams(dstWidth, dstHeight));

  const encoder = device.createCommandEncoder({ label: "photoseal-dadum-adaptive-qmap-tilemask-encoder" });

  const qmapBindGroup = device.createBindGroup({
    label: "photoseal-dadum-qmap-bindgroup",
    layout: pipelines.qmap.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: sampler },
      { binding: 1, resource: sourceView },
      { binding: 2, resource: qmapTex.view },
      { binding: 3, resource: { buffer: qmapUniform } },
    ],
  });
  {
    const pass = encoder.beginComputePass({ label: "photoseal-dadum-qmap-preprocess-pass" });
    pass.setPipeline(pipelines.qmap);
    pass.setBindGroup(0, qmapBindGroup);
    pass.dispatchWorkgroups(Math.ceil(srcWidth / WORKGROUP_SIZE), Math.ceil(srcHeight / WORKGROUP_SIZE));
    pass.end();
  }

  const qmapLodBindGroup = device.createBindGroup({
    label: "photoseal-dadum-qmap-lod-bindgroup",
    layout: pipelines.qmapLod.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: qmapTex.view },
      { binding: 1, resource: qmapLodTex.view },
      { binding: 2, resource: { buffer: qmapLodUniform } },
    ],
  });
  {
    const pass = encoder.beginComputePass({ label: "photoseal-dadum-qmap-lod-meanmax-mix-pass" });
    pass.setPipeline(pipelines.qmapLod);
    pass.setBindGroup(0, qmapLodBindGroup);
    pass.dispatchWorkgroups(Math.ceil(tilesW / WORKGROUP_SIZE), Math.ceil(tilesH / WORKGROUP_SIZE));
    pass.end();
  }

  const tileMaskBindGroup = device.createBindGroup({
    label: "photoseal-dadum-tilemask-bindgroup",
    layout: pipelines.tileMask.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: qmapLodTex.view },
      { binding: 1, resource: tileMaskTex.view },
      { binding: 2, resource: { buffer: tileMaskUniform } },
    ],
  });
  {
    const pass = encoder.beginComputePass({ label: "photoseal-dadum-tilemask-from-qmap-pass" });
    pass.setPipeline(pipelines.tileMask);
    pass.setBindGroup(0, tileMaskBindGroup);
    pass.dispatchWorkgroups(Math.ceil(tilesW / WORKGROUP_SIZE), Math.ceil(tilesH / WORKGROUP_SIZE));
    pass.end();
  }

  const fastBindGroup = device.createBindGroup({
    label: "photoseal-dadum-fast-downscale-bindgroup",
    layout: pipelines.fastDownscale.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: sourceView },
      { binding: 1, resource: sampler },
      { binding: 2, resource: fastTex.view },
      { binding: 3, resource: { buffer: fastUniform } },
    ],
  });
  {
    const pass = encoder.beginComputePass({ label: "photoseal-dadum-fast-downscale-pass" });
    pass.setPipeline(pipelines.fastDownscale);
    pass.setBindGroup(0, fastBindGroup);
    pass.dispatchWorkgroups(Math.ceil(dstWidth / WORKGROUP_SIZE), Math.ceil(dstHeight / WORKGROUP_SIZE));
    pass.end();
  }

  const adaptiveBindGroup = device.createBindGroup({
    label: "photoseal-dadum-adaptive-ewa-bindgroup-qmap-tilemask-bound",
    layout: pipelines.adaptiveEwa.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: sourceView },
      { binding: 1, resource: sampler },
      { binding: 2, resource: fastTex.view },
      { binding: 3, resource: tileMaskTex.view },
      { binding: 4, resource: adaptiveTex.view },
      { binding: 5, resource: { buffer: adaptiveUniform } },
    ],
  });
  {
    const pass = encoder.beginComputePass({ label: "photoseal-dadum-adaptive-ewa-pass-qmapBoundToAdaptivePass-tileMaskBoundToAdaptivePass" });
    pass.setPipeline(pipelines.adaptiveEwa);
    pass.setBindGroup(0, adaptiveBindGroup);
    pass.dispatchWorkgroups(Math.ceil(dstWidth / WORKGROUP_SIZE), Math.ceil(dstHeight / WORKGROUP_SIZE));
    pass.end();
  }

  const finalSource = anisoTex ?? adaptiveTex;
  if (anisoTex && anisoUniform) {
    const anisoBindGroup = device.createBindGroup({
      label: "photoseal-dadum-optional-aniso-ewa-bindgroup",
      layout: pipelines.anisoEwa.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: adaptiveTex.view },
        { binding: 1, resource: sampler },
        { binding: 2, resource: anisoTex.view },
        { binding: 3, resource: { buffer: anisoUniform } },
      ],
    });
    const pass = encoder.beginComputePass({ label: "photoseal-dadum-optional-aniso-ewa-pass" });
    pass.setPipeline(pipelines.anisoEwa);
    pass.setBindGroup(0, anisoBindGroup);
    pass.dispatchWorkgroups(Math.ceil(dstWidth / WORKGROUP_SIZE), Math.ceil(dstHeight / WORKGROUP_SIZE));
    pass.end();
  }

  const finalCopyBindGroup = device.createBindGroup({
    label: "photoseal-dadum-final-srgb-rgba8-copy-bindgroup",
    layout: pipelines.finalCopy.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: finalSource.view },
      { binding: 1, resource: finalRgba8Tex.view },
      { binding: 2, resource: { buffer: finalCopyUniform } },
    ],
  });
  {
    const pass = encoder.beginComputePass({ label: "photoseal-dadum-final-srgb-rgba8-copy-pass" });
    pass.setPipeline(pipelines.finalCopy);
    pass.setBindGroup(0, finalCopyBindGroup);
    pass.dispatchWorkgroups(Math.ceil(dstWidth / WORKGROUP_SIZE), Math.ceil(dstHeight / WORKGROUP_SIZE));
    pass.end();
  }

  device.queue.submit([encoder.finish()]);
  await device.queue.onSubmittedWorkDone();

  const readback = await readbackRgba8Texture({
    device,
    texture: finalRgba8Tex.texture,
    width: dstWidth,
    height: dstHeight,
    label: "photoseal-dadum-full-chain-srgb-rgba8-readback",
  });

  const receipt = createDadumAdaptiveQmapTilemaskReceipt({
    inputWidth: srcWidth,
    inputHeight: srcHeight,
    inputBytes: request.rgba.length,
    outputWidth: dstWidth,
    outputHeight: dstHeight,
    outputBytes: readback.rgba.length,
    params,
    gpuHarness: readback.receipt,
  });

  return {
    rgba: readback.rgba,
    width: dstWidth,
    height: dstHeight,
    profile: "dadum-adaptive-qmap-tilemask",
    receipt,
  };
}
