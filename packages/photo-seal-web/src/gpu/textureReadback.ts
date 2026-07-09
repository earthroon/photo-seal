import { PhotoSealWebGPUError } from "./gpuError";
import { createGPUHarnessReceipt, type GPUHarnessReceipt } from "./gpuReceipt";
import { getPaddedBytesPerRow, stripPaddedRows } from "./readbackRows";
import { validateGpuDimension } from "./webgpuSupport";

export type ReadbackTextureRgba8Request = {
  device: GPUDevice;
  texture: GPUTexture;
  width: number;
  height: number;
  label?: string;
};

export type ReadbackTextureRgba8Result = {
  rgba: Uint8Array;
  width: number;
  height: number;
  format: "rgba8unorm";
  unpaddedBytesPerRow: number;
  paddedBytesPerRow: number;
  receipt: GPUHarnessReceipt;
};

export async function readbackRgba8Texture(
  request: ReadbackTextureRgba8Request
): Promise<ReadbackTextureRgba8Result> {
  const width = validateGpuDimension("width", request.width);
  const height = validateGpuDimension("height", request.height);
  const unpaddedBytesPerRow = width * 4;
  const paddedBytesPerRow = getPaddedBytesPerRow(width, 4);
  const readbackSize = paddedBytesPerRow * height;

  const readback = request.device.createBuffer({
    label: request.label ?? "photoseal-rgba8-readback-buffer",
    size: readbackSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  const commandEncoder = request.device.createCommandEncoder({
    label: `${request.label ?? "photoseal-rgba8-readback"}-encoder`,
  });

  commandEncoder.copyTextureToBuffer(
    { texture: request.texture },
    { buffer: readback, bytesPerRow: paddedBytesPerRow, rowsPerImage: height },
    { width, height, depthOrArrayLayers: 1 }
  );

  request.device.queue.submit([commandEncoder.finish()]);

  try {
    await readback.mapAsync(GPUMapMode.READ);
  } catch (error) {
    readback.destroy();
    throw new PhotoSealWebGPUError(
      "BUFFER_MAP_FAILED",
      "RGBA8 texture readback buffer mapping failed.",
      error
    );
  }

  const mapped = new Uint8Array(readback.getMappedRange());
  const rgba = stripPaddedRows({
    padded: mapped,
    width,
    height,
    bytesPerPixel: 4,
    paddedBytesPerRow,
  });
  readback.unmap();
  readback.destroy();

  const expected = width * height * 4;
  if (rgba.length !== expected) {
    throw new PhotoSealWebGPUError(
      "READBACK_SIZE_MISMATCH",
      `RGBA readback length mismatch. expected=${expected} actual=${rgba.length}`
    );
  }

  return {
    rgba,
    width,
    height,
    format: "rgba8unorm",
    unpaddedBytesPerRow,
    paddedBytesPerRow,
    receipt: createGPUHarnessReceipt({
      deviceAcquired: true,
      readback: {
        width,
        height,
        format: "rgba8unorm",
        unpaddedBytesPerRow,
        paddedBytesPerRow,
        outputBytes: rgba.length,
      },
    }),
  };
}
