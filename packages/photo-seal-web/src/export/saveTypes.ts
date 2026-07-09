export type PhotoSealSaveTarget = "jpeg" | "audit-bundle-json";

export type PhotoSealSaveStatus = "idle" | "saving" | "saved" | "failed" | "unsupported";

export type PhotoSealSaveReason =
  | "OK"
  | "NO_JPEG_BYTES"
  | "INVALID_JPEG_BYTES"
  | "BLOB_UNAVAILABLE"
  | "OBJECT_URL_UNAVAILABLE"
  | "DOWNLOAD_TRIGGER_FAILED"
  | "OBJECT_URL_REVOKE_FAILED"
  | "AUDIT_BUNDLE_MISSING"
  | "USER_ACTION_REQUIRED"
  | "UNKNOWN_ERROR";

export type PhotoSealSafeFileName = {
  baseName: string;
  extension: "jpg" | "json";
  fileName: string;
  sanitized: boolean;
};

export type PhotoSealSaveUiState = {
  target: PhotoSealSaveTarget | null;
  status: PhotoSealSaveStatus;
  reason: PhotoSealSaveReason | null;
  message: string | null;
};

export const PHOTOSEAL_SAVE_PRIMARY_SEAL = "JPEG save is primary";
export const PHOTOSEAL_AUDIT_BUNDLE_OPTIONAL_SEAL = "Audit bundle save is optional";
