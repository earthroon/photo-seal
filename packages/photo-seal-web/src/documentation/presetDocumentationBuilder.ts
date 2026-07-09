import type { PhotoSealExportPreset } from "../preset/exportPresetTypes";
import type { PhotoSealComplianceOverclaimScanResult } from "./complianceOverclaimGuard";
import type { PhotoSealInstitutionNoteCopy } from "./institutionNoteCopy";
import type { PhotoSealPresetDocumentationEntry } from "./presetDocumentationTypes";
import type { PhotoSealPresetDocumentationReceipt } from "./presetDocumentationReceipt";

export function buildPresetDocumentationReceipt(args: {
  preset: PhotoSealExportPreset;
  documentation: PhotoSealPresetDocumentationEntry;
  noteCopy: PhotoSealInstitutionNoteCopy;
  scan: PhotoSealComplianceOverclaimScanResult;
}): PhotoSealPresetDocumentationReceipt {
  const includesWidthHeight =
    args.documentation.width === args.preset.width && args.documentation.height === args.preset.height;
  return {
    patchId: "TDT-PHOTOSEAL-12",
    stage: "export-preset-documentation-institution-note-no-compliance-overclaim",
    presetId: args.preset.id,
    presetLabel: args.preset.label,
    documentationEntryCreated: true,
    institutionNoteCopyCreated: args.noteCopy.copyText.length > 0,
    disclaimerVisible: args.documentation.disclaimerText.length > 0,
    includesWidthHeight,
    includesTargetBytes: args.documentation.targetBytes === args.preset.targetBytes,
    includesResizeProfile: args.documentation.resizeProfile === "export-ewa",
    includesJpeg444: args.documentation.jpegSubsampling === "444",
    includesSrgb: args.documentation.colorSpace === "srgb",
    includesCropRequired: typeof args.documentation.cropRequired === "boolean",
    officialComplianceGuaranteed: false,
    institutionUploadGuaranteed: false,
    legalRequirementVerified: false,
    userMustCheckInstitutionRequirements: true,
    overclaimScanPassed: args.scan.overclaimDetected === false,
    overclaimDetected: false,
    noComplianceOverclaimSeal: true,
    receiptVersion: 1,
  };
}
