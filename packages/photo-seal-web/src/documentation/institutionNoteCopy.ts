import type { PhotoSealExportPresetId } from "../preset/exportPresetTypes";
import type { PhotoSealPresetDocumentationEntry } from "./presetDocumentationTypes";

export type PhotoSealInstitutionNoteCopy = {
  patchId: "TDT-PHOTOSEAL-12";
  stage: "institution-note-copy-no-compliance-overclaim";
  presetId: PhotoSealExportPresetId;
  presetLabel: string;
  copyText: string;
  includesPresetSize: boolean;
  includesTargetBytes: boolean;
  includesSrgb: boolean;
  includesJpeg444: boolean;
  includesCropRequiredNotice: boolean;
  includesUserCheckNotice: boolean;
  includesNoGuaranteeNotice: boolean;
  officialComplianceGuaranteed: false;
  institutionUploadGuaranteed: false;
  legalRequirementVerified: false;
  copyReceiptVersion: 1;
};

export function buildInstitutionNoteCopyText(
  documentation: Pick<PhotoSealPresetDocumentationEntry, "presetLabel" | "width" | "height" | "targetBytes" | "cropRequired">,
): string {
  const cropNotice = documentation.cropRequired
    ? "Crop receipt may be required before exact-size export."
    : "No crop receipt is required by this preset.";
  return [
    'PhotoSeal 내보내기 참고:',
    `이 파일은 내부 프리셋으로 내보냈습니다: ${documentation.presetLabel}.`,
    `픽셀 크기: ${documentation.width}x${documentation.height}.`,
    `목표 파일 크기: ${documentation.targetBytes} bytes.`,
    `색공간: sRGB.`,
    'JPEG: 4:4:4.',
    cropNotice,
    '이 프리셋은 도구 내부 정책이며, 기관의 공식 규격 보장이 아닙니다.',
    '제출 전 해당 기관의 최신 요구사항을 직접 확인해 주세요.',
  ].join("\n");
}

export function buildInstitutionNoteCopy(args: {
  documentation: PhotoSealPresetDocumentationEntry;
}): PhotoSealInstitutionNoteCopy {
  const copyText = buildInstitutionNoteCopyText(args.documentation);
  return {
    patchId: "TDT-PHOTOSEAL-12",
    stage: "institution-note-copy-no-compliance-overclaim",
    presetId: args.documentation.presetId,
    presetLabel: args.documentation.presetLabel,
    copyText,
    includesPresetSize: copyText.includes(`${args.documentation.width}x${args.documentation.height}`),
    includesTargetBytes: copyText.includes(String(args.documentation.targetBytes)),
    includesSrgb: copyText.includes("sRGB"),
    includesJpeg444: copyText.includes("4:4:4"),
    includesCropRequiredNotice: copyText.includes("Crop receipt"),
    includesUserCheckNotice: copyText.includes('제출 전 해당 기관의 최신 요구사항을 직접 확인해 주세요.'),
    includesNoGuaranteeNotice: copyText.includes('이 프리셋은 도구 내부 정책이며, 기관의 공식 규격 보장이 아닙니다.'),
    officialComplianceGuaranteed: false,
    institutionUploadGuaranteed: false,
    legalRequirementVerified: false,
    copyReceiptVersion: 1,
  };
}
