export type PhotoSealCustomPresetFieldId = "width" | "height" | "targetBytes" | "label";

export type PhotoSealCustomPresetValidationStatus = "valid" | "invalid" | "empty" | "pending";

export type PhotoSealCustomPresetValidationCode =
  | "WIDTH_REQUIRED"
  | "WIDTH_NOT_INTEGER"
  | "WIDTH_TOO_SMALL"
  | "WIDTH_TOO_LARGE"
  | "HEIGHT_REQUIRED"
  | "HEIGHT_NOT_INTEGER"
  | "HEIGHT_TOO_SMALL"
  | "HEIGHT_TOO_LARGE"
  | "TARGET_BYTES_REQUIRED"
  | "TARGET_BYTES_NOT_INTEGER"
  | "TARGET_BYTES_TOO_SMALL"
  | "TARGET_BYTES_TOO_LARGE"
  | "LABEL_TOO_LONG";

export type PhotoSealCustomPresetFieldValidation = {
  fieldId: PhotoSealCustomPresetFieldId;
  status: PhotoSealCustomPresetValidationStatus;
  code?: PhotoSealCustomPresetValidationCode;
  message: string;
  originalInput: string;
  parsedValue?: number | string;
  clamped: false;
};

export type PhotoSealCustomPresetValidationResult = {
  patchId: "TDT-PHOTOSEAL-11-R2";
  stage: "custom-preset-validation-ux-no-clamp-feedback-ambiguity";
  status: "valid" | "invalid";
  originalWidthInput: string;
  originalHeightInput: string;
  originalTargetBytesInput: string;
  originalLabelInput?: string;
  width?: number;
  height?: number;
  targetBytes?: number;
  label?: string;
  fields: PhotoSealCustomPresetFieldValidation[];
  clampApplied: false;
  fallbackPresetUsed: false;
  silentCorrectionUsed: false;
  canApply: boolean;
};

export const TDT_PHOTOSEAL_11_R2_NO_CLAMP_FEEDBACK_AMBIGUITY_SEAL =
  "No Clamp Feedback Ambiguity Seal: invalid custom preset values stay visible, are not clamped, are not silently corrected, and cannot create preset receipts.";
