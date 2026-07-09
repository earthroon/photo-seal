import { PhotoSealExportPresetError } from "./exportPresetError";
import type { PhotoSealExportPresetReceipt } from "./exportPresetReceipt";

export function verifyPresetRuntimePolicy(args: {
  presetReceipt: PhotoSealExportPresetReceipt;
  resizeWidth: number;
  resizeHeight: number;
  targetBytes: number;
  resizeProfile: string;
}): PhotoSealExportPresetReceipt {
  const nextReceipt: PhotoSealExportPresetReceipt = {
    ...args.presetReceipt,
    runtimeResizeWidthMatchesPreset: args.resizeWidth === args.presetReceipt.width,
    runtimeResizeHeightMatchesPreset: args.resizeHeight === args.presetReceipt.height,
    runtimeTargetBytesMatchesPreset: args.targetBytes === args.presetReceipt.targetBytes,
    runtimeResizeProfileMatchesPreset: args.resizeProfile === args.presetReceipt.resizeProfile,
  };

  if (
    !nextReceipt.runtimeResizeWidthMatchesPreset ||
    !nextReceipt.runtimeResizeHeightMatchesPreset ||
    !nextReceipt.runtimeTargetBytesMatchesPreset ||
    !nextReceipt.runtimeResizeProfileMatchesPreset
  ) {
    throw new PhotoSealExportPresetError("RUNTIME_PRESET_MISMATCH", "Runtime export policy does not match the selected preset receipt.");
  }

  return nextReceipt;
}

export const PRESET_RUNTIME_MISMATCH_IS_BLOCKER =
  "preset runtime mismatch is a blocker, not a warning-only condition.";
