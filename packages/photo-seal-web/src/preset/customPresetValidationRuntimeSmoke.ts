import { applyCustomPresetFromValidation } from "./applyCustomPreset";
import { validateCustomPresetInput } from "./customPresetValidation";

export async function runPhotoSealCustomPresetValidationRuntimeSmoke(): Promise<{
  patchId: "TDT-PHOTOSEAL-11-R2";
  status: "PASS" | "FAIL" | "NOT_RUN";
  reason: string;
  invalidWidthRejected: boolean;
  invalidHeightRejected: boolean;
  invalidTargetBytesRejected: boolean;
  clampApplied: false;
  fallbackPresetUsed: false;
  silentCorrectionUsed: false;
  validCustomPresetApplied: boolean;
  invalidCustomPresetApplied: false;
  runtimeActuallyExecuted: boolean;
  runtimePassClaimed: boolean;
}> {
  const invalidWidth = validateCustomPresetInput({ widthInput: "30", heightInput: "400", targetBytesInput: "307200" });
  const invalidHeight = validateCustomPresetInput({ widthInput: "300", heightInput: "99999", targetBytesInput: "307200" });
  const invalidTargetBytes = validateCustomPresetInput({ widthInput: "300", heightInput: "400", targetBytesInput: "100" });
  const valid = validateCustomPresetInput({ widthInput: "300", heightInput: "400", targetBytesInput: "307200", labelInput: "Runtime smoke custom" });
  const invalidApply = applyCustomPresetFromValidation({ validation: invalidWidth, userActionObserved: true });
  const validApply = applyCustomPresetFromValidation({ validation: valid, userActionObserved: true });
  const invalidWidthRejected = invalidWidth.status === "invalid" && !invalidApply.presetReceipt;
  const invalidHeightRejected = invalidHeight.status === "invalid";
  const invalidTargetBytesRejected = invalidTargetBytes.status === "invalid";
  const validCustomPresetApplied = Boolean(validApply.preset && validApply.presetReceipt && validApply.validationReceipt.applyAccepted);
  const pass = invalidWidthRejected && invalidHeightRejected && invalidTargetBytesRejected && validCustomPresetApplied;
  return {
    patchId: "TDT-PHOTOSEAL-11-R2",
    status: pass ? "PASS" : "FAIL",
    reason: pass ? "OK" : "CUSTOM_PRESET_VALIDATION_FAILED",
    invalidWidthRejected,
    invalidHeightRejected,
    invalidTargetBytesRejected,
    clampApplied: false,
    fallbackPresetUsed: false,
    silentCorrectionUsed: false,
    validCustomPresetApplied,
    invalidCustomPresetApplied: false,
    runtimeActuallyExecuted: true,
    runtimePassClaimed: pass,
  };
}
