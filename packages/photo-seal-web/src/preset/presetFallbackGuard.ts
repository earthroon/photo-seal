import { PhotoSealExportPresetError } from "./exportPresetError";
import { getPhotoSealExportPreset } from "./exportPresetResolver";
import type { PhotoSealExportPresetId } from "./exportPresetTypes";

export type PhotoSealNoPresetFallbackProbe = {
  invalidPresetRejected: boolean;
  silentPresetFallbackDetected: false;
};

function isKnownPresetId(value: string): value is PhotoSealExportPresetId {
  return (
    value === "resume-photo-300x400" ||
    value === "resume-photo-354x472" ||
    value === "resume-photo-413x531" ||
    value === "resume-photo-600x800" ||
    value === "custom"
  );
}

export function assertNoSilentPresetFallback(args: {
  requestedPresetId: string;
}): PhotoSealNoPresetFallbackProbe {
  if (!isKnownPresetId(args.requestedPresetId)) {
    try {
      getPhotoSealExportPreset(args.requestedPresetId as PhotoSealExportPresetId);
    } catch (error) {
      if (error instanceof PhotoSealExportPresetError && error.code === "PRESET_NOT_FOUND") {
        return { invalidPresetRejected: true, silentPresetFallbackDetected: false };
      }
      return { invalidPresetRejected: true, silentPresetFallbackDetected: false };
    }
    throw new PhotoSealExportPresetError(
      "RUNTIME_PRESET_MISMATCH",
      "Unknown preset unexpectedly resolved instead of rejecting."
    );
  }
  return { invalidPresetRejected: false, silentPresetFallbackDetected: false };
}

export const NO_SILENT_PRESET_FALLBACK_SEAL =
  "No Silent Preset Fallback Seal: invalid preset ids must reject rather than resolve to a different preset.";
