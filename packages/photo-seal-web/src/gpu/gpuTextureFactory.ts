import { PhotoSealWebGPUError } from "./gpuError";
import { validateGpuDimension } from "./webgpuSupport";

const ALLOWED_FORMATS = new Set<GPUTextureFormat>(["rgba8unorm", "rgba16float"]);

export type CreateGpuTextureRequest = {
  device: GPUDevice;
  width: number;
  height: number;
  format: GPUTextureFormat;
  usage: GPUTextureUsageFlags;
  label?: string;
};

export function createPhotoSealTexture(request: CreateGpuTextureRequest): GPUTexture {
  const width = validateGpuDimension("width", request.width);
  const height = validateGpuDimension("height", request.height);

  if (!ALLOWED_FORMATS.has(request.format)) {
    throw new PhotoSealWebGPUError(
      "INVALID_TEXTURE_FORMAT",
      `Unsupported PhotoSeal texture format: ${request.format}`
    );
  }

  return request.device.createTexture({
    label: request.label,
    size: { width, height, depthOrArrayLayers: 1 },
    format: request.format,
    usage: request.usage,
  });
}
