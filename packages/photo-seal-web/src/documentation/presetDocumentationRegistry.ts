import type { PhotoSealExportPreset } from "../preset/exportPresetTypes";
import type { PhotoSealPresetDocumentationEntry } from "./presetDocumentationTypes";
import { buildInstitutionNoteCopyText } from "./institutionNoteCopy";

const SAFE_DISCLAIMER_TEXT = '이 프리셋은 PhotoSeal 내부 export 정책입니다.\n기관의 공식 규격 보장이 아닙니다.\n제출 전 해당 기관의 최신 요구사항을 직접 확인해 주세요.';

function buildSummaryText(preset: PhotoSealExportPreset): string {
  return `PhotoSeal preset ${preset.label}: ${preset.width}x${preset.height}, targetBytes=${preset.targetBytes}, sRGB, JPEG 4:4:4, resizeProfile=${preset.resizeProfile}. Reference-only internal export policy.`;
}

export function getPresetDocumentationEntry(
  preset: PhotoSealExportPreset,
): PhotoSealPresetDocumentationEntry {
  const base: PhotoSealPresetDocumentationEntry = {
    patchId: "TDT-PHOTOSEAL-12",
    kind: "preset-summary",
    presetId: preset.id,
    presetLabel: preset.label,
    width: preset.width,
    height: preset.height,
    targetBytes: preset.targetBytes,
    resizeProfile: "export-ewa",
    jpegSubsampling: "444",
    colorSpace: "srgb",
    cropRequired: preset.cropRequired,
    cropReceiptRequiredWhenCropRequired: true,
    complianceClaimLevel: "reference-only",
    officialComplianceGuaranteed: false,
    institutionUploadGuaranteed: false,
    legalRequirementVerified: false,
    userMustCheckInstitutionRequirements: true,
    summaryText: buildSummaryText(preset),
    institutionNoteText: "",
    disclaimerText: SAFE_DISCLAIMER_TEXT,
    documentationVersion: 1,
  };
  return {
    ...base,
    institutionNoteText: buildInstitutionNoteCopyText(base),
  };
}
