import type { PhotoSealSaveReason } from "./saveTypes";

export class PhotoSealSaveError extends Error {
  readonly code: PhotoSealSaveReason;

  constructor(code: PhotoSealSaveReason, message: string) {
    super(message);
    this.name = "PhotoSealSaveError";
    this.code = code;
  }
}

export function getPhotoSealSaveErrorCode(error: unknown): PhotoSealSaveReason {
  if (error instanceof PhotoSealSaveError) {
    return error.code;
  }
  return "UNKNOWN_ERROR";
}
