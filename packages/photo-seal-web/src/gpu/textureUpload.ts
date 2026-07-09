import { PhotoSealWebGPUError } from "./gpuError";
import { createPhotoSealTexture } from "./gpuTextureFactory";
import { validateGpuDimension } from "./webgpuSupport";

export type UploadRgba8TextureRequest = {
  device: GPUDevice;
  rgba: Uint8Array;
  width: number;
  height: number;
  label?: string;
};

export type UploadRgba8TextureResult = {
  texture: GPUTexture;
  width: number;
  height: number;
  format: "rgba8unorm";
  bytes: number;
};

export function uploadRgba8Texture(
  request: UploadRgba8TextureRequest
): UploadRgba8TextureResult {
  const width = validateGpuDimension("width", request.width);
  const height = validateGpuDimension("height", request.height);

  if (!(request.rgba instanceof Uint8Array)) {
    throw new PhotoSealWebGPUError(
      "INVALID_RGBA_LENGTH",
      "RGBA source must be a Uint8Array."
    );
  }

  const expected = width * height * 4;
  if (request.rgba.length !== expected) {
    throw new PhotoSealWebGPUError(
      "INVALID_RGBA_LENGTH",
      `RGBA source length mismatch. expected=${expected} actual=${request.rgba.length}`
    );
  }

  const texture = createPhotoSealTexture({
    device: request.device,
    width,
    height,
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.COPY_SRC,
    label: request.label ?? "photoseal-rgba8-upload-texture",
  });

  request.device.queue.writeTexture(
    { texture },
    request.rgba,
    { bytesPerRow: width * 4, rowsPerImage: height },
    { width, height, depthOrArrayLayers: 1 }
  );

  return { texture, width, height, format: "rgba8unorm", bytes: request.rgba.length };
}
