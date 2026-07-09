import { PhotoSealWebGPUError } from "./gpuError";
import type { GPUDeviceReceipt } from "./gpuReceipt";
import { assertWebGPUSupported } from "./webgpuSupport";

export type PhotoSealGPUDeviceContext = {
  adapter: GPUAdapter;
  device: GPUDevice;
  receipt: GPUDeviceReceipt;
};

let cachedContext: PhotoSealGPUDeviceContext | null = null;

export async function requestPhotoSealGPUDevice(): Promise<PhotoSealGPUDeviceContext> {
  assertWebGPUSupported();

  if (cachedContext) return cachedContext;

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new PhotoSealWebGPUError(
      "ADAPTER_UNAVAILABLE",
      "WebGPU adapter is unavailable for PhotoSeal."
    );
  }

  let device: GPUDevice;
  try {
    device = await adapter.requestDevice();
  } catch (error) {
    throw new PhotoSealWebGPUError(
      "DEVICE_UNAVAILABLE",
      "WebGPU device request failed for PhotoSeal.",
      error
    );
  }

  device.addEventListener("uncapturederror", (event) => {
    console.error(
      new PhotoSealWebGPUError(
        "UNCAUGHT_GPU_ERROR",
        "PhotoSeal WebGPU uncaptured error.",
        event.error
      )
    );
  });

  device.lost.catch((error) => {
    console.error(
      new PhotoSealWebGPUError(
        "DEVICE_LOST",
        "PhotoSeal WebGPU device lost.",
        error
      )
    );
    cachedContext = null;
  });

  cachedContext = {
    adapter,
    device,
    receipt: {
      patchId: "TDT-PHOTOSEAL-02",
      stage: "webgpu-device-request",
      requested: true,
      acquired: true,
    },
  };

  return cachedContext;
}
