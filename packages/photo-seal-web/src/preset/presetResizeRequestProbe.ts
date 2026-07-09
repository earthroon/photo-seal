import { PhotoSealExportPresetError } from "./exportPresetError";
import type { PhotoSealExportPresetReceipt } from "./exportPresetReceipt";
import type { PhotoSealExportPresetId } from "./exportPresetTypes";
import type { PhotoSealPresetResizePolicy } from "./presetToResizePolicy";

export type PhotoSealPresetResizeRequestProbe = {
  presetId: PhotoSealExportPresetId;

  presetWidth: number;
  presetHeight: number;
  presetTargetBytes: number;
  presetResizeProfile: "export-ewa";

  resizeRequestWidth: number;
  resizeRequestHeight: number;
  resizeRequestTargetBytes: number;
  resizeRequestProfile: "export-ewa";

  runtimeResizeWidthMatchesPreset: boolean;
  runtimeResizeHeightMatchesPreset: boolean;
  runtimeTargetBytesMatchesPreset: boolean;
  runtimeResizeProfileMatchesPreset: boolean;
};

export function buildPresetResizeRequestProbe(args: {
  presetReceipt: PhotoSealExportPresetReceipt;
  resizePolicy: PhotoSealPresetResizePolicy;
}): PhotoSealPresetResizeRequestProbe {
  const probe: PhotoSealPresetResizeRequestProbe = {
    presetId: args.presetReceipt.presetId,
    presetWidth: args.presetReceipt.width,
    presetHeight: args.presetReceipt.height,
    presetTargetBytes: args.presetReceipt.targetBytes,
    presetResizeProfile: args.presetReceipt.resizeProfile,
    resizeRequestWidth: args.resizePolicy.width,
    resizeRequestHeight: args.resizePolicy.height,
    resizeRequestTargetBytes: args.resizePolicy.targetBytes,
    resizeRequestProfile: args.resizePolicy.resizeProfile,
    runtimeResizeWidthMatchesPreset: args.resizePolicy.width === args.presetReceipt.width,
    runtimeResizeHeightMatchesPreset: args.resizePolicy.height === args.presetReceipt.height,
    runtimeTargetBytesMatchesPreset: args.resizePolicy.targetBytes === args.presetReceipt.targetBytes,
    runtimeResizeProfileMatchesPreset: args.resizePolicy.resizeProfile === args.presetReceipt.resizeProfile,
  };

  if (
    !probe.runtimeResizeWidthMatchesPreset ||
    !probe.runtimeResizeHeightMatchesPreset ||
    !probe.runtimeTargetBytesMatchesPreset ||
    !probe.runtimeResizeProfileMatchesPreset
  ) {
    throw new PhotoSealExportPresetError(
      "RUNTIME_PRESET_MISMATCH",
      "Resize request does not match the selected preset receipt."
    );
  }

  return probe;
}
