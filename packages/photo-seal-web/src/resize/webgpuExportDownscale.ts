import { requestPhotoSealGPUDevice } from "../gpu/device";
import { PhotoSealWebGPUError } from "../gpu/gpuError";
import { createPhotoSealTexture } from "../gpu/gpuTextureFactory";
import { readbackRgba8Texture } from "../gpu/textureReadback";
import { uploadRgba8Texture } from "../gpu/textureUpload";
import { validateGpuDimension } from "../gpu/webgpuSupport";
import { assertNoSilentPhotoSealResizePolicyFallback, createDefaultPhotoSealExportResizePolicy } from "../export/exportResizePolicy";
import type { PhotoSealExportResizePolicy } from "../export/exportResizePolicy";
import { assertDeltaKTangentPolicySeal, resolveDeltaKTangentInterpolationPolicyFromR6 } from "../export/deltaKTangentPolicy";
import type { DeltaKTangentInterpolationPolicy } from "../export/deltaKTangentPolicy";
import type { PhotoSealResizeSamplingDomain } from "../crop/cropBoxTypes";
import exportEwaLowpassWGSL from "./shaders/exportEwaLowpass.wgsl?raw";
import exportEwaRecomposeWGSL from "./shaders/exportEwaRecompose.wgsl?raw";
import deltaKStructureTensorWGSL from "./shaders/deltaKStructureTensor.wgsl?raw";
import deltaKTangentInterpolateWGSL from "./shaders/deltaKTangentInterpolate.wgsl?raw";
import deltaKNormalOvershootClampWGSL from "./shaders/deltaKNormalOvershootClamp.wgsl?raw";
import { createExportEwaResizeReceipt } from "./resizeReceipt";
import type {
  WebGPUExportDownscaleRequest,
  WebGPUExportDownscaleResult,
} from "./types";

const WORKGROUP_SIZE = 8;
const UNIFORM_BYTES = 80;

type ExportEwaState = {
  device: GPUDevice;
  lowPipeline: GPUComputePipeline;
  recomposePipeline: GPUComputePipeline;
  tensorPipeline: GPUComputePipeline;
  tangentPipeline: GPUComputePipeline;
  clampPipeline: GPUComputePipeline;
  sampler: GPUSampler;
  uniform: GPUBuffer;
};

let exportEwaState: ExportEwaState | null = null;

function validateRequest(request: WebGPUExportDownscaleRequest): {
  srcWidth: number;
  srcHeight: number;
  dstWidth: number;
  dstHeight: number;
} {
  const srcWidth = validateGpuDimension("srcWidth", request.srcWidth);
  const srcHeight = validateGpuDimension("srcHeight", request.srcHeight);
  const dstWidth = validateGpuDimension("dstWidth", request.dstWidth);
  const dstHeight = validateGpuDimension("dstHeight", request.dstHeight);

  if (!(request.rgba instanceof Uint8Array)) {
    throw new PhotoSealWebGPUError(
      "INVALID_RGBA_LENGTH",
      "RGBA source must be a Uint8Array."
    );
  }

  const expected = srcWidth * srcHeight * 4;
  if (request.rgba.length !== expected) {
    throw new PhotoSealWebGPUError(
      "INVALID_RGBA_LENGTH",
      `RGBA source length mismatch. expected=${expected} actual=${request.rgba.length}`
    );
  }

  if (request.profile !== "export-ewa") {
    throw new PhotoSealWebGPUError(
      "INVALID_DIMENSION",
      "TDT-PHOTOSEAL-02 keeps the 01 resize profile sealed as export-ewa."
    );
  }

  return { srcWidth, srcHeight, dstWidth, dstHeight };
}

async function ensureExportEwaState(): Promise<ExportEwaState> {
  if (exportEwaState?.device) return exportEwaState;

  const { device } = await requestPhotoSealGPUDevice();

  let lowModule: GPUShaderModule;
  let recomposeModule: GPUShaderModule;
  let tensorModule: GPUShaderModule;
  let tangentModule: GPUShaderModule;
  let clampModule: GPUShaderModule;
  try {
    lowModule = device.createShaderModule({
      label: "photoseal-export-ewa-lowpass-module",
      code: exportEwaLowpassWGSL,
    });
    recomposeModule = device.createShaderModule({
      label: "photoseal-export-ewa-recompose-module",
      code: exportEwaRecomposeWGSL,
    });
    tensorModule = device.createShaderModule({
      label: "photoseal-deltak-structure-tensor-module",
      code: deltaKStructureTensorWGSL,
    });
    tangentModule = device.createShaderModule({
      label: "photoseal-deltak-tangent-interpolate-module",
      code: deltaKTangentInterpolateWGSL,
    });
    clampModule = device.createShaderModule({
      label: "photoseal-deltak-normal-overshoot-clamp-module",
      code: deltaKNormalOvershootClampWGSL,
    });
  } catch (error) {
    throw new PhotoSealWebGPUError(
      "UNCAUGHT_GPU_ERROR",
      "WebGPU shader module creation failed for export EWA.",
      error
    );
  }

  let lowPipeline: GPUComputePipeline;
  let recomposePipeline: GPUComputePipeline;
  let tensorPipeline: GPUComputePipeline;
  let tangentPipeline: GPUComputePipeline;
  let clampPipeline: GPUComputePipeline;
  try {
    lowPipeline = device.createComputePipeline({
      label: "photoseal-export-ewa-lowpass-pipeline",
      layout: "auto",
      compute: { module: lowModule, entryPoint: "main" },
    });
    recomposePipeline = device.createComputePipeline({
      label: "photoseal-export-ewa-recompose-pipeline",
      layout: "auto",
      compute: { module: recomposeModule, entryPoint: "main" },
    });
    tensorPipeline = device.createComputePipeline({
      label: "photoseal-deltak-structure-tensor-pipeline",
      layout: "auto",
      compute: { module: tensorModule, entryPoint: "main" },
    });
    tangentPipeline = device.createComputePipeline({
      label: "photoseal-deltak-tangent-interpolate-pipeline",
      layout: "auto",
      compute: { module: tangentModule, entryPoint: "main" },
    });
    clampPipeline = device.createComputePipeline({
      label: "photoseal-deltak-normal-overshoot-clamp-pipeline",
      layout: "auto",
      compute: { module: clampModule, entryPoint: "main" },
    });
  } catch (error) {
    throw new PhotoSealWebGPUError(
      "UNCAUGHT_GPU_ERROR",
      "WebGPU compute pipeline creation failed for export EWA.",
      error
    );
  }

  const sampler = device.createSampler({
    label: "photoseal-export-ewa-sampler",
    minFilter: "linear",
    magFilter: "linear",
    mipmapFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
  });

  const uniform = device.createBuffer({
    label: "photoseal-export-ewa-uniform",
    size: UNIFORM_BYTES,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  exportEwaState = { device, lowPipeline, recomposePipeline, tensorPipeline, tangentPipeline, clampPipeline, sampler, uniform };
  return exportEwaState;
}

function makeUniform(
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number,
  policy: PhotoSealExportResizePolicy,
  deltaKTangentPolicy: DeltaKTangentInterpolationPolicy,
  samplingDomain: PhotoSealResizeSamplingDomain
): ArrayBuffer {
  const buffer = new ArrayBuffer(UNIFORM_BYTES);
  const u32 = new Uint32Array(buffer);
  const f32 = new Float32Array(buffer);

  u32[0] = srcWidth >>> 0;
  u32[1] = srcHeight >>> 0;
  u32[2] = dstWidth >>> 0;
  u32[3] = dstHeight >>> 0;
  const cropBox = samplingDomain.kind === "crop-box"
    ? samplingDomain.cropBox
    : { sourceX: 0, sourceY: 0, sourceWidth: srcWidth, sourceHeight: srcHeight };
  f32[4] = cropBox.sourceWidth / Math.max(1, dstWidth);
  f32[5] = cropBox.sourceHeight / Math.max(1, dstHeight);
  // TDT-PHOTOSEAL-13-H3-R6:
  // Severe portrait downscale uses lowpass authority. These controls are
  // recorded in the resize receipt and must not silently re-enable sharpen.
  f32[6] = policy.filterRadiusScale;
  f32[7] = policy.severeDownscale ? Math.max(1.12, policy.filterRadiusScale) : 1.0;
  // TDT-PHOTOSEAL-13-H3-R7:
  // Lowpass remains authority, but the optional DeltaK tangent pass can
  // recover weak tangent-only detail. Normal residual remains sealed at 0.
  f32[8] = deltaKTangentPolicy.tangentDetailStrength;
  f32[9] = deltaKTangentPolicy.enabled ? 1.0 : 0.0;
  f32[10] = policy.resizeAuthority === "lowpass" ? 1.0 : 1.1;
  f32[11] = policy.residualClampMode === "portrait-strict" ? 0.95 : 0.75;
  f32[12] = deltaKTangentPolicy.anisotropyThreshold;
  f32[13] = deltaKTangentPolicy.deltaKThreshold;
  f32[14] = deltaKTangentPolicy.normalClampTolerance;
  f32[15] = deltaKTangentPolicy.presetKind === "portrait_resume_photo" ? 1.0 : 0.0;
  // TDT-PHOTOSEAL-13-H3-R8: crop sampling domain in source pixels.
  // full-source = 0,0,srcWidth,srcHeight; crop-box = visible user crop only.
  f32[16] = cropBox.sourceX;
  f32[17] = cropBox.sourceY;
  f32[18] = cropBox.sourceWidth;
  f32[19] = cropBox.sourceHeight;

  return buffer;
}

export async function downscaleRgbaWithWebGPUExportEwa(
  request: WebGPUExportDownscaleRequest
): Promise<WebGPUExportDownscaleResult> {
  const { srcWidth, srcHeight, dstWidth, dstHeight } = validateRequest(request);
  const samplingDomain = request.samplingDomain ?? { kind: "full-source" as const };
  const policy = request.policy ?? createDefaultPhotoSealExportResizePolicy({
    sourceWidth: srcWidth,
    sourceHeight: srcHeight,
    targetWidth: dstWidth,
    targetHeight: dstHeight,
  });
  assertNoSilentPhotoSealResizePolicyFallback(policy);
  const deltaKTangentPolicy = resolveDeltaKTangentInterpolationPolicyFromR6(policy);
  assertDeltaKTangentPolicySeal(deltaKTangentPolicy);
  const { device, lowPipeline, recomposePipeline, tensorPipeline, tangentPipeline, clampPipeline, sampler, uniform } = await ensureExportEwaState();

  const sourceUpload = uploadRgba8Texture({
    device,
    rgba: request.rgba,
    width: srcWidth,
    height: srcHeight,
    label: "photoseal-export-ewa-source-rgba8unorm",
  });

  const lowTexture = createPhotoSealTexture({
    device,
    width: dstWidth,
    height: dstHeight,
    format: "rgba16float",
    usage:
      GPUTextureUsage.STORAGE_BINDING |
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.COPY_DST,
    label: "photoseal-export-ewa-low-rgba16float",
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
    label: "photoseal-export-ewa-output-rgba8unorm",
  });

  const tensorTexture = createPhotoSealTexture({
    device,
    width: dstWidth,
    height: dstHeight,
    format: "rgba16float",
    usage:
      GPUTextureUsage.STORAGE_BINDING |
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.COPY_DST,
    label: "photoseal-deltak-structure-tensor-rgba16float",
  });

  const tangentCandidateTexture = createPhotoSealTexture({
    device,
    width: dstWidth,
    height: dstHeight,
    format: "rgba16float",
    usage:
      GPUTextureUsage.STORAGE_BINDING |
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.COPY_DST,
    label: "photoseal-deltak-tangent-candidate-rgba16float",
  });

  device.queue.writeBuffer(uniform, 0, makeUniform(srcWidth, srcHeight, dstWidth, dstHeight, policy, deltaKTangentPolicy, samplingDomain));

  const lowBindGroup = device.createBindGroup({
    label: "photoseal-export-ewa-lowpass-bindgroup",
    layout: lowPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: sourceUpload.texture.createView() },
      { binding: 1, resource: sampler },
      { binding: 2, resource: lowTexture.createView() },
      { binding: 3, resource: { buffer: uniform } },
    ],
  });

  const recomposeBindGroup = device.createBindGroup({
    label: "photoseal-export-ewa-recompose-bindgroup",
    layout: recomposePipeline.getBindGroupLayout(0),
    entries: [
      // TDT-PHOTOSEAL-13-H3-R5:
      // H3-R4 disabled residual sharpening in exportEwaRecompose.wgsl,
      // so the source texture at binding 0 is intentionally not part of
      // the auto-derived recompose layout. Keep this bind group aligned
      // with the shader's active bindings only: 1, 2, 3, 4.
      { binding: 1, resource: lowTexture.createView() },
      { binding: 2, resource: sampler },
      { binding: 3, resource: outputTexture.createView() },
      { binding: 4, resource: { buffer: uniform } },
    ],
  });

  const tensorBindGroup = device.createBindGroup({
    label: "photoseal-deltak-structure-tensor-bindgroup",
    layout: tensorPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: lowTexture.createView() },
      { binding: 1, resource: sampler },
      { binding: 2, resource: tensorTexture.createView() },
      { binding: 3, resource: { buffer: uniform } },
    ],
  });

  const tangentBindGroup = device.createBindGroup({
    label: "photoseal-deltak-tangent-interpolate-bindgroup",
    layout: tangentPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: lowTexture.createView() },
      { binding: 1, resource: sourceUpload.texture.createView() },
      { binding: 2, resource: tensorTexture.createView() },
      { binding: 3, resource: sampler },
      { binding: 4, resource: tangentCandidateTexture.createView() },
      { binding: 5, resource: { buffer: uniform } },
    ],
  });

  const clampBindGroup = device.createBindGroup({
    label: "photoseal-deltak-normal-overshoot-clamp-bindgroup",
    layout: clampPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: tangentCandidateTexture.createView() },
      { binding: 1, resource: lowTexture.createView() },
      { binding: 2, resource: tensorTexture.createView() },
      { binding: 3, resource: sampler },
      { binding: 4, resource: outputTexture.createView() },
      { binding: 5, resource: { buffer: uniform } },
    ],
  });

  const commandEncoder = device.createCommandEncoder({ label: "photoseal-export-ewa-command-encoder" });

  const lowPass = commandEncoder.beginComputePass({ label: "photoseal-export-ewa-lowpass" });
  lowPass.setPipeline(lowPipeline);
  lowPass.setBindGroup(0, lowBindGroup);
  lowPass.dispatchWorkgroups(Math.ceil(dstWidth / WORKGROUP_SIZE), Math.ceil(dstHeight / WORKGROUP_SIZE), 1);
  lowPass.end();

  if (deltaKTangentPolicy.enabled) {
    const tensorPass = commandEncoder.beginComputePass({ label: "photoseal-deltak-structure-tensor" });
    tensorPass.setPipeline(tensorPipeline);
    tensorPass.setBindGroup(0, tensorBindGroup);
    tensorPass.dispatchWorkgroups(Math.ceil(dstWidth / WORKGROUP_SIZE), Math.ceil(dstHeight / WORKGROUP_SIZE), 1);
    tensorPass.end();

    const tangentPass = commandEncoder.beginComputePass({ label: "photoseal-deltak-tangent-interpolate" });
    tangentPass.setPipeline(tangentPipeline);
    tangentPass.setBindGroup(0, tangentBindGroup);
    tangentPass.dispatchWorkgroups(Math.ceil(dstWidth / WORKGROUP_SIZE), Math.ceil(dstHeight / WORKGROUP_SIZE), 1);
    tangentPass.end();

    const clampPass = commandEncoder.beginComputePass({ label: "photoseal-deltak-normal-overshoot-clamp" });
    clampPass.setPipeline(clampPipeline);
    clampPass.setBindGroup(0, clampBindGroup);
    clampPass.dispatchWorkgroups(Math.ceil(dstWidth / WORKGROUP_SIZE), Math.ceil(dstHeight / WORKGROUP_SIZE), 1);
    clampPass.end();
  } else {
    const recomposePass = commandEncoder.beginComputePass({ label: "photoseal-export-ewa-recompose-r6-fallback" });
    recomposePass.setPipeline(recomposePipeline);
    recomposePass.setBindGroup(0, recomposeBindGroup);
    recomposePass.dispatchWorkgroups(Math.ceil(dstWidth / WORKGROUP_SIZE), Math.ceil(dstHeight / WORKGROUP_SIZE), 1);
    recomposePass.end();
  }

  device.queue.submit([commandEncoder.finish()]);

  const readback = await readbackRgba8Texture({
    device,
    texture: outputTexture,
    width: dstWidth,
    height: dstHeight,
    label: "photoseal-export-ewa-readback",
  });

  try {
    sourceUpload.texture.destroy();
    lowTexture.destroy();
    outputTexture.destroy();
    tensorTexture.destroy();
    tangentCandidateTexture.destroy();
  } catch {
    // Destruction is best-effort only; no alternate processing path is used.
  }

  const expectedOutputBytes = dstWidth * dstHeight * 4;
  if (readback.rgba.length !== expectedOutputBytes) {
    throw new PhotoSealWebGPUError(
      "READBACK_SIZE_MISMATCH",
      `RGBA readback length mismatch. expected=${expectedOutputBytes} actual=${readback.rgba.length}`
    );
  }

  return {
    rgba: readback.rgba,
    width: dstWidth,
    height: dstHeight,
    profile: "export-ewa",
    receipt: createExportEwaResizeReceipt({
      srcWidth,
      srcHeight,
      srcBytes: request.rgba.length,
      dstWidth,
      dstHeight,
      dstBytes: readback.rgba.length,
      gpuHarness: readback.receipt,
      policy,
      deltaKTangentPolicy,
      samplingDomain,
    }),
  };
}
