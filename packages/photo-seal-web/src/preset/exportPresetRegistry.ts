import { ALL_PHOTOSEAL_EXPORT_PRESETS, CUSTOM_EXPORT_PRESET_TEMPLATE, RESUME_PHOTO_PRESETS } from "./resumePhotoPresets";
import type { PhotoSealExportPreset, PhotoSealExportPresetId } from "./exportPresetTypes";

export const PHOTOSEAL_EXPORT_PRESET_REGISTRY: ReadonlyMap<PhotoSealExportPresetId, PhotoSealExportPreset> =
  new Map(ALL_PHOTOSEAL_EXPORT_PRESETS.map((preset) => [preset.id, preset] as const));

export const DEFAULT_PHOTOSEAL_EXPORT_PRESET_ID: PhotoSealExportPresetId = "resume-photo-300x400";

export function listPhotoSealExportPresets(): readonly PhotoSealExportPreset[] {
  return ALL_PHOTOSEAL_EXPORT_PRESETS;
}

export function listResumePhotoPresets(): readonly PhotoSealExportPreset[] {
  return RESUME_PHOTO_PRESETS;
}

export function getCustomPresetTemplate(): PhotoSealExportPreset {
  return CUSTOM_EXPORT_PRESET_TEMPLATE;
}

export const PHOTOSEAL_PRESET_REGISTRY_SSOT =
  "Preset is the export policy SSOT. No hidden resize policy. No hidden target bytes policy.";
