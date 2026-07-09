import { PHOTOSEAL_EXPORT_PRESET_REGISTRY } from "./exportPresetRegistry";
import { PhotoSealExportPresetError } from "./exportPresetError";
import type { PhotoSealExportPreset, PhotoSealExportPresetId, PhotoSealCustomExportPresetInput } from "./exportPresetTypes";
import type { PhotoSealExportPresetReceipt } from "./exportPresetReceipt";

const MIN_DIMENSION = 64;
const MAX_DIMENSION = 4096;
const MIN_TARGET_BYTES = 10240;
const MAX_TARGET_BYTES = 10485760;

function assertPresetDimensions(width: number, height: number): void {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < MIN_DIMENSION || height < MIN_DIMENSION || width > MAX_DIMENSION || height > MAX_DIMENSION) {
    throw new PhotoSealExportPresetError("INVALID_PRESET_DIMENSIONS", "Invalid PhotoSeal export preset dimensions.");
  }
}

function assertTargetBytes(targetBytes: number): void {
  if (!Number.isInteger(targetBytes) || targetBytes < MIN_TARGET_BYTES || targetBytes > MAX_TARGET_BYTES) {
    throw new PhotoSealExportPresetError("INVALID_PRESET_TARGET_BYTES", "Invalid PhotoSeal export preset targetBytes.");
  }
}

export function getPhotoSealExportPreset(presetId: PhotoSealExportPresetId): PhotoSealExportPreset {
  const preset = PHOTOSEAL_EXPORT_PRESET_REGISTRY.get(presetId);
  if (!preset) {
    throw new PhotoSealExportPresetError("PRESET_NOT_FOUND", `PhotoSeal export preset not found: ${presetId}`);
  }
  return preset;
}

export function createCustomPhotoSealExportPreset(input: PhotoSealCustomExportPresetInput): PhotoSealExportPreset {
  assertPresetDimensions(input.width, input.height);
  assertTargetBytes(input.targetBytes);
  return {
    id: "custom",
    kind: "custom",
    label: input.label?.trim() || `사용자 지정 ${input.width}×${input.height}`,
    description: "사용자가 직접 지정한 출력 크기와 목표 용량입니다.",
    width: input.width,
    height: input.height,
    targetBytes: input.targetBytes,
    resizeProfile: "export-ewa",
    jpegSubsampling: "444",
    colorSpace: "srgb",
    fitPolicy: "fit-inside-no-crop",
    cropRequired: false,
    encoderSideResizeAllowed: false,
    encoderSideCropAllowed: false,
    compressionSearchStrategy: "quality-binary",
    visibleToUser: true,
    presetVersion: 1,
  };
}

export function createPhotoSealExportPresetReceipt(args: {
  preset: PhotoSealExportPreset;
  selectedByUser: boolean;
  cropReceiptPresent?: boolean;
}): PhotoSealExportPresetReceipt {
  const { preset } = args;
  assertPresetDimensions(preset.width, preset.height);
  assertTargetBytes(preset.targetBytes);

  return {
    patchId: "TDT-PHOTOSEAL-11",
    stage: "export-preset-profiles-resume-photo-no-hidden-resize-policy",
    presetId: preset.id,
    presetKind: preset.kind,
    presetLabel: preset.label,
    presetVersion: 1,
    selectedByUser: args.selectedByUser,
    selectedAt: new Date().toISOString(),
    width: preset.width,
    height: preset.height,
    targetBytes: preset.targetBytes,
    resizeProfile: "export-ewa",
    jpegSubsampling: "444",
    colorSpace: "srgb",
    fitPolicy: preset.fitPolicy,
    cropRequired: preset.cropRequired,
    cropReceiptPresent: args.cropReceiptPresent === true,
    encoderSideResizeAllowed: false,
    encoderSideCropAllowed: false,
    hiddenResizePolicyUsed: false,
    hiddenTargetBytesPolicyUsed: false,
    hiddenAspectPolicyUsed: false,
    hiddenPaddingPolicyUsed: false,
    runtimeResizeWidthMatchesPreset: true,
    runtimeResizeHeightMatchesPreset: true,
    runtimeTargetBytesMatchesPreset: true,
    runtimeResizeProfileMatchesPreset: true,
    presetReceiptVersion: 1,
  };
}

export const NO_SILENT_PRESET_FALLBACK_SEAL =
  "Preset not found and invalid custom preset are errors, not silent fallback or silent clamp cases.";
