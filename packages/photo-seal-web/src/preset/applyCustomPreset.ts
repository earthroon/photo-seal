import { createCustomPhotoSealExportPreset, createPhotoSealExportPresetReceipt } from "./exportPresetResolver";
import type { PhotoSealExportPreset } from "./exportPresetTypes";
import type { PhotoSealExportPresetReceipt } from "./exportPresetReceipt";
import type { PhotoSealCustomPresetValidationReceipt } from "./customPresetValidationReceipt";
import type { PhotoSealCustomPresetValidationResult } from "./customPresetValidationTypes";
import { getCustomPresetValidationCodes } from "./customPresetValidation";

function fieldIsValid(validation: PhotoSealCustomPresetValidationResult, fieldId: string): boolean {
  return validation.fields.some((field) => field.fieldId === fieldId && field.status === "valid");
}

function makeValidationReceipt(args: {
  validation: PhotoSealCustomPresetValidationResult;
  applyAttempted: boolean;
  applyAccepted: boolean;
  customPresetReceiptCreated: boolean;
}): PhotoSealCustomPresetValidationReceipt {
  const { validation } = args;
  return {
    patchId: "TDT-PHOTOSEAL-11-R2",
    stage: "preset-ui-polish-custom-validation-no-clamp-feedback",
    validationStatus: validation.status,
    originalWidthInput: validation.originalWidthInput,
    originalHeightInput: validation.originalHeightInput,
    originalTargetBytesInput: validation.originalTargetBytesInput,
    originalLabelInput: validation.originalLabelInput,
    parsedWidth: validation.width,
    parsedHeight: validation.height,
    parsedTargetBytes: validation.targetBytes,
    parsedLabel: validation.label,
    widthValid: fieldIsValid(validation, "width"),
    heightValid: fieldIsValid(validation, "height"),
    targetBytesValid: fieldIsValid(validation, "targetBytes"),
    labelValid: fieldIsValid(validation, "label"),
    validationCodes: getCustomPresetValidationCodes(validation),
    applyButtonEnabled: validation.canApply,
    applyAttempted: args.applyAttempted,
    applyAccepted: args.applyAccepted,
    clampApplied: false,
    fallbackPresetUsed: false,
    silentCorrectionUsed: false,
    customPresetReceiptCreated: args.customPresetReceiptCreated,
    noClampFeedbackAmbiguitySeal: true,
    receiptVersion: 1,
  };
}

export function applyCustomPresetFromValidation(args: {
  validation: PhotoSealCustomPresetValidationResult;
  userActionObserved: boolean;
}): {
  preset?: PhotoSealExportPreset;
  presetReceipt?: PhotoSealExportPresetReceipt;
  validationReceipt: PhotoSealCustomPresetValidationReceipt;
} {
  const applyAttempted = args.userActionObserved;
  if (args.validation.status !== "valid" || args.validation.width === undefined || args.validation.height === undefined || args.validation.targetBytes === undefined) {
    return {
      validationReceipt: makeValidationReceipt({
        validation: args.validation,
        applyAttempted,
        applyAccepted: false,
        customPresetReceiptCreated: false,
      }),
    };
  }
  if (!args.userActionObserved) {
    return {
      validationReceipt: makeValidationReceipt({
        validation: args.validation,
        applyAttempted: false,
        applyAccepted: false,
        customPresetReceiptCreated: false,
      }),
    };
  }
  const preset = createCustomPhotoSealExportPreset({
    width: args.validation.width,
    height: args.validation.height,
    targetBytes: args.validation.targetBytes,
    label: args.validation.label,
  });
  const presetReceipt = createPhotoSealExportPresetReceipt({ preset, selectedByUser: true });
  return {
    preset,
    presetReceipt,
    validationReceipt: makeValidationReceipt({
      validation: args.validation,
      applyAttempted: true,
      applyAccepted: true,
      customPresetReceiptCreated: true,
    }),
  };
}
