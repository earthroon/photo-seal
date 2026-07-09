import type { PhotoSealExportPreset } from "./exportPresetTypes";

const COMMON_PRESET_POLICY = {
  resizeProfile: "export-ewa",
  jpegSubsampling: "444",
  colorSpace: "srgb",
  fitPolicy: "exact-dimensions-requires-user-crop",
  cropRequired: true,
  encoderSideResizeAllowed: false,
  encoderSideCropAllowed: false,
  compressionSearchStrategy: "quality-binary",
  visibleToUser: true,
  presetVersion: 1,
} as const;

export const RESUME_PHOTO_PRESETS: readonly PhotoSealExportPreset[] = [
  {
    id: "resume-photo-300x400",
    kind: "resume-photo",
    label: "이력서 사진 300×400",
    description: "이력서 사진용 내부 출력 프리셋입니다. 제출 전 기관 요구사항을 별도로 확인하세요.",
    width: 300,
    height: 400,
    targetBytes: 307200,
    ...COMMON_PRESET_POLICY,
  },
  {
    id: "resume-photo-354x472",
    kind: "resume-photo",
    label: "이력서 사진 354×472",
    description: "3:4에 가까운 세로형 출력용 내부 프리셋입니다.",
    width: 354,
    height: 472,
    targetBytes: 307200,
    ...COMMON_PRESET_POLICY,
  },
  {
    id: "resume-photo-413x531",
    kind: "resume-photo",
    label: "이력서 사진 413×531",
    description: "작은 업로드 목표에 맞춘 세로형 내부 프리셋입니다.",
    width: 413,
    height: 531,
    targetBytes: 512000,
    ...COMMON_PRESET_POLICY,
  },
  {
    id: "resume-photo-600x800",
    kind: "resume-photo",
    label: "이력서 사진 600×800",
    description: "고해상도 이력서 사진 출력용 내부 프리셋입니다.",
    width: 600,
    height: 800,
    targetBytes: 1048576,
    ...COMMON_PRESET_POLICY,
  },
];

export const CUSTOM_EXPORT_PRESET_TEMPLATE: PhotoSealExportPreset = {
  id: "custom",
  kind: "custom",
  label: "사용자 지정",
  description: "사용자가 직접 지정한 출력 크기와 목표 용량입니다.",
  width: 300,
  height: 400,
  targetBytes: 307200,
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

export const ALL_PHOTOSEAL_EXPORT_PRESETS: readonly PhotoSealExportPreset[] = [
  ...RESUME_PHOTO_PRESETS,
  CUSTOM_EXPORT_PRESET_TEMPLATE,
];
