import type { PhotoSealExportPresetId } from "./exportPresetTypes";
import type { PhotoSealPresetRuntimeSmokeReason, PhotoSealPresetRuntimeSmokeStatus } from "./presetRuntimeSmokeTypes";

export type PhotoSealPresetSelectorRuntimeSmokeReceipt = {
  patchId: "TDT-PHOTOSEAL-11-R1";
  stage: "preset-selector-ui-runtime-smoke-preset-receipt-to-resize-request-verification";

  staticContractSmoke: PhotoSealPresetRuntimeSmokeStatus;
  browserPresetSelectorRuntimeSmoke: PhotoSealPresetRuntimeSmokeStatus;
  browserPresetSelectorRuntimeReason: PhotoSealPresetRuntimeSmokeReason;

  browserRuntimeActuallyExecuted: boolean;
  runtimePassClaimed: boolean;

  appPageLoaded: boolean;
  presetSelectorHookFound: boolean;
  presetSelectorHookCalled: boolean;
  presetSelectorRendered: boolean;

  selectedPresetId: PhotoSealExportPresetId | null;
  selectedPresetVisibleToUser: boolean;

  presetReceiptPresent: boolean;
  presetReceiptPatchId?: "TDT-PHOTOSEAL-11";
  presetReceiptMatchesSelection: boolean;

  presetWidth?: number;
  presetHeight?: number;
  presetTargetBytes?: number;
  presetResizeProfile?: "export-ewa";

  resizeRequestBuilt: boolean;
  resizeRequestWidth?: number;
  resizeRequestHeight?: number;
  resizeRequestTargetBytes?: number;
  resizeRequestProfile?: "export-ewa";

  runtimeResizeWidthMatchesPreset: boolean;
  runtimeResizeHeightMatchesPreset: boolean;
  runtimeTargetBytesMatchesPreset: boolean;
  runtimeResizeProfileMatchesPreset: boolean;

  invalidPresetRejected: boolean;
  silentPresetFallbackDetected: false;

  invalidCustomPresetRejected: boolean;
  invalidCustomPresetClamped: false;

  cropRequiredPresetSelected: boolean;
  cropReceiptPresent: boolean;
  cropRequiredBlockerPresent: boolean;

  hiddenResizePolicyUsed: false;
  hiddenTargetBytesPolicyUsed: false;
  hiddenAspectPolicyUsed: false;
  hiddenPaddingPolicyUsed: false;

  encoderSideResizeAllowed: false;
  encoderSideCropAllowed: false;

  mockPresetReceiptUsedForRuntimePass: false;
  staticSmokeUsedAsRuntimePass: false;

  defaultProfileChanged: false;
  promotedToDefault: false;

  receiptCaptured: boolean;
  receiptArtifactPath: "artifacts/TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_RUNTIME_RECEIPT.json";
};

export function makeNotRunPresetSelectorRuntimeReceipt(
  reason: PhotoSealPresetRuntimeSmokeReason
): PhotoSealPresetSelectorRuntimeSmokeReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-11-R1",
    stage: "preset-selector-ui-runtime-smoke-preset-receipt-to-resize-request-verification",
    staticContractSmoke: "PASS",
    browserPresetSelectorRuntimeSmoke: "NOT_RUN",
    browserPresetSelectorRuntimeReason: reason,
    browserRuntimeActuallyExecuted: false,
    runtimePassClaimed: false,
    appPageLoaded: false,
    presetSelectorHookFound: false,
    presetSelectorHookCalled: false,
    presetSelectorRendered: false,
    selectedPresetId: null,
    selectedPresetVisibleToUser: false,
    presetReceiptPresent: false,
    presetReceiptMatchesSelection: false,
    resizeRequestBuilt: false,
    runtimeResizeWidthMatchesPreset: false,
    runtimeResizeHeightMatchesPreset: false,
    runtimeTargetBytesMatchesPreset: false,
    runtimeResizeProfileMatchesPreset: false,
    invalidPresetRejected: false,
    silentPresetFallbackDetected: false,
    invalidCustomPresetRejected: false,
    invalidCustomPresetClamped: false,
    cropRequiredPresetSelected: false,
    cropReceiptPresent: false,
    cropRequiredBlockerPresent: false,
    hiddenResizePolicyUsed: false,
    hiddenTargetBytesPolicyUsed: false,
    hiddenAspectPolicyUsed: false,
    hiddenPaddingPolicyUsed: false,
    encoderSideResizeAllowed: false,
    encoderSideCropAllowed: false,
    mockPresetReceiptUsedForRuntimePass: false,
    staticSmokeUsedAsRuntimePass: false,
    defaultProfileChanged: false,
    promotedToDefault: false,
    receiptCaptured: true,
    receiptArtifactPath: "artifacts/TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_RUNTIME_RECEIPT.json",
  };
}
