import { PhotoSealWebGPUError } from "./gpuError";

export function assertWebGPUSupported(): void {
  if (!globalThis.navigator?.gpu) {
    throw new PhotoSealWebGPUError(
      "WEBGPU_UNAVAILABLE",
      "WebGPU is unavailable for PhotoSeal."
    );
  }
}

export function validateGpuDimension(name: string, value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new PhotoSealWebGPUError(
      "INVALID_DIMENSION",
      `${name} must be a positive integer.`
    );
  }
  return value >>> 0;
}
