export const TDT_PHOTOSEAL_02_PATCH_ID = "TDT-PHOTOSEAL-02" as const;

export type PhotoSealWebGPUErrorCode =
  | "WEBGPU_UNAVAILABLE"
  | "ADAPTER_UNAVAILABLE"
  | "DEVICE_UNAVAILABLE"
  | "INVALID_DIMENSION"
  | "INVALID_RGBA_LENGTH"
  | "INVALID_TEXTURE_FORMAT"
  | "INVALID_READBACK_LAYOUT"
  | "READBACK_SIZE_MISMATCH"
  | "BUFFER_MAP_FAILED"
  | "DEVICE_LOST"
  | "UNCAUGHT_GPU_ERROR";

export class PhotoSealWebGPUError extends Error {
  readonly patchId = TDT_PHOTOSEAL_02_PATCH_ID;
  readonly code: PhotoSealWebGPUErrorCode;
  readonly detail?: unknown;

  constructor(code: PhotoSealWebGPUErrorCode, message: string, detail?: unknown) {
    super(message);
    this.name = "PhotoSealWebGPUError";
    this.code = code;
    this.detail = detail;
  }
}
