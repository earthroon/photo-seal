export type PhotoSealExportPresetKind = "resume-photo" | "custom";

export type PhotoSealExportPresetId =
  | "resume-photo-300x400"
  | "resume-photo-354x472"
  | "resume-photo-413x531"
  | "resume-photo-600x800"
  | "custom";

export type PhotoSealResizeFitPolicy =
  | "exact-dimensions-requires-user-crop"
  | "fit-inside-no-crop"
  | "stretch-forbidden";

export type PhotoSealCompressionSearchStrategy = "quality-binary" | "quality-ladder";

export type PhotoSealExportPreset = {
  id: PhotoSealExportPresetId;
  kind: PhotoSealExportPresetKind;
  label: string;
  description: string;
  width: number;
  height: number;
  targetBytes: number;
  resizeProfile: "export-ewa";
  jpegSubsampling: "444";
  colorSpace: "srgb";
  fitPolicy: PhotoSealResizeFitPolicy;
  cropRequired: boolean;
  encoderSideResizeAllowed: false;
  encoderSideCropAllowed: false;
  compressionSearchStrategy: PhotoSealCompressionSearchStrategy;
  visibleToUser: true;
  presetVersion: 1;
};

export type PhotoSealCustomExportPresetInput = {
  width: number;
  height: number;
  targetBytes: number;
  label?: string;
};

export const TDT_PHOTOSEAL_11_PRESET_POLICY_SEAL =
  "No Hidden Resize Policy Seal: preset registry owns width, height, targetBytes, resizeProfile, JPEG 444, and srgb policy.";
