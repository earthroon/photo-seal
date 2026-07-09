export type PhotoSealExportPresetErrorCode =
  | "PRESET_NOT_FOUND"
  | "INVALID_PRESET_DIMENSIONS"
  | "INVALID_PRESET_TARGET_BYTES"
  | "INVALID_CUSTOM_PRESET"
  | "PRESET_RECEIPT_MISSING"
  | "HIDDEN_RESIZE_POLICY_DETECTED"
  | "HIDDEN_TARGET_BYTES_POLICY_DETECTED"
  | "CROP_REQUIRED_BUT_MISSING"
  | "RUNTIME_PRESET_MISMATCH";

export class PhotoSealExportPresetError extends Error {
  readonly code: PhotoSealExportPresetErrorCode;

  constructor(code: PhotoSealExportPresetErrorCode, message: string) {
    super(message);
    this.name = "PhotoSealExportPresetError";
    this.code = code;
  }
}
