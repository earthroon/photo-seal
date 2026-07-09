import type { PhotoSealCustomPresetValidationCode } from "./customPresetValidationTypes";

export type PhotoSealCustomPresetValidationReceipt = {
  patchId: "TDT-PHOTOSEAL-11-R2";
  stage: "preset-ui-polish-custom-validation-no-clamp-feedback";
  validationStatus: "valid" | "invalid";
  originalWidthInput: string;
  originalHeightInput: string;
  originalTargetBytesInput: string;
  originalLabelInput?: string;
  parsedWidth?: number;
  parsedHeight?: number;
  parsedTargetBytes?: number;
  parsedLabel?: string;
  widthValid: boolean;
  heightValid: boolean;
  targetBytesValid: boolean;
  labelValid: boolean;
  validationCodes: PhotoSealCustomPresetValidationCode[];
  applyButtonEnabled: boolean;
  applyAttempted: boolean;
  applyAccepted: boolean;
  clampApplied: false;
  fallbackPresetUsed: false;
  silentCorrectionUsed: false;
  customPresetReceiptCreated: boolean;
  noClampFeedbackAmbiguitySeal: true;
  receiptVersion: 1;
};
