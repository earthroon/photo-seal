import type { PhotoSealExportPresetId } from "./exportPresetTypes";

export type PhotoSealPresetRuntimeSmokeStatus = "PASS" | "FAIL" | "NOT_RUN";

export type PhotoSealPresetRuntimeSmokeReason =
  | "OK"
  | "NO_BROWSER_RUNNER"
  | "PLAYWRIGHT_NOT_INSTALLED"
  | "BROWSER_LAUNCH_UNAVAILABLE"
  | "NO_VITE_DEV_SERVER"
  | "APP_LOAD_FAILED"
  | "PRESET_SELECTOR_HOOK_MISSING"
  | "PRESET_SELECTOR_COMPONENT_UNAVAILABLE"
  | "PRESET_SELECTOR_RENDER_FAILED"
  | "PRESET_SELECTION_FAILED"
  | "PRESET_RECEIPT_MISSING"
  | "PRESET_RECEIPT_MISMATCH"
  | "RESIZE_REQUEST_MISSING"
  | "RESIZE_REQUEST_MISMATCH"
  | "SILENT_PRESET_FALLBACK_DETECTED"
  | "INVALID_CUSTOM_PRESET_CLAMPED"
  | "CROP_REQUIRED_BLOCKER_MISSING"
  | "HIDDEN_RESIZE_POLICY_DETECTED"
  | "HIDDEN_TARGET_BYTES_POLICY_DETECTED";

export type PhotoSealPresetRuntimeSelection = {
  selectedPresetId: PhotoSealExportPresetId | null;
  selectedPresetVisibleToUser: boolean;
};

export const TDT_PHOTOSEAL_11_R1_PRESET_RUNTIME_SMOKE_SEAL =
  "No Silent Preset Fallback Seal: selected preset must drive preset receipt and preset receipt must drive resize request.";
