import type {
  PhotoSealExportPresetId,
  PhotoSealExportPresetKind,
  PhotoSealResizeFitPolicy,
} from "./exportPresetTypes";

export type PhotoSealExportPresetReceipt = {
  patchId: "TDT-PHOTOSEAL-11";
  stage: "export-preset-profiles-resume-photo-no-hidden-resize-policy";
  presetId: PhotoSealExportPresetId;
  presetKind: PhotoSealExportPresetKind;
  presetLabel: string;
  presetVersion: 1;
  selectedByUser: boolean;
  selectedAt: string;
  width: number;
  height: number;
  targetBytes: number;
  resizeProfile: "export-ewa";
  jpegSubsampling: "444";
  colorSpace: "srgb";
  fitPolicy: PhotoSealResizeFitPolicy;
  cropRequired: boolean;
  cropReceiptPresent: boolean;
  encoderSideResizeAllowed: false;
  encoderSideCropAllowed: false;
  hiddenResizePolicyUsed: false;
  hiddenTargetBytesPolicyUsed: false;
  hiddenAspectPolicyUsed: false;
  hiddenPaddingPolicyUsed: false;
  runtimeResizeWidthMatchesPreset: boolean;
  runtimeResizeHeightMatchesPreset: boolean;
  runtimeTargetBytesMatchesPreset: boolean;
  runtimeResizeProfileMatchesPreset: boolean;
  presetReceiptVersion: 1;
};

export const PHOTOSEAL_EXPORT_PRESET_RECEIPT_STAGE =
  "export-preset-profiles-resume-photo-no-hidden-resize-policy";
