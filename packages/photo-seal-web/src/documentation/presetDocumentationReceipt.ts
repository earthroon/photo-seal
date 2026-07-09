import type { PhotoSealExportPresetId } from "../preset/exportPresetTypes";

export type PhotoSealPresetDocumentationReceipt = {
  patchId: "TDT-PHOTOSEAL-12";
  stage: "export-preset-documentation-institution-note-no-compliance-overclaim";
  presetId: PhotoSealExportPresetId;
  presetLabel: string;
  documentationEntryCreated: boolean;
  institutionNoteCopyCreated: boolean;
  disclaimerVisible: boolean;
  includesWidthHeight: boolean;
  includesTargetBytes: boolean;
  includesResizeProfile: boolean;
  includesJpeg444: boolean;
  includesSrgb: boolean;
  includesCropRequired: boolean;
  officialComplianceGuaranteed: false;
  institutionUploadGuaranteed: false;
  legalRequirementVerified: false;
  userMustCheckInstitutionRequirements: true;
  overclaimScanPassed: boolean;
  overclaimDetected: false;
  noComplianceOverclaimSeal: true;
  receiptVersion: 1;
};
