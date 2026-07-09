import type { PhotoSealExportPreset, PhotoSealExportPresetId } from "../preset/exportPresetTypes";

export type PhotoSealPresetDocumentationKind =
  | "preset-summary"
  | "institution-note"
  | "compliance-disclaimer";

export type PhotoSealComplianceClaimLevel =
  | "internal-export-policy"
  | "reference-only"
  | "official-guarantee-forbidden";

export type PhotoSealPresetDocumentationEntry = {
  patchId: "TDT-PHOTOSEAL-12";
  kind: PhotoSealPresetDocumentationKind;
  presetId: PhotoSealExportPresetId;
  presetLabel: string;
  width: number;
  height: number;
  targetBytes: number;
  resizeProfile: "export-ewa";
  jpegSubsampling: "444";
  colorSpace: "srgb";
  cropRequired: boolean;
  cropReceiptRequiredWhenCropRequired: true;
  complianceClaimLevel: PhotoSealComplianceClaimLevel;
  officialComplianceGuaranteed: false;
  institutionUploadGuaranteed: false;
  legalRequirementVerified: false;
  userMustCheckInstitutionRequirements: true;
  summaryText: string;
  institutionNoteText: string;
  disclaimerText: string;
  documentationVersion: 1;
};

export type PhotoSealPresetDocumentationSource = Pick<
  PhotoSealExportPreset,
  | "id"
  | "label"
  | "width"
  | "height"
  | "targetBytes"
  | "resizeProfile"
  | "jpegSubsampling"
  | "colorSpace"
  | "cropRequired"
>;

export const TDT_PHOTOSEAL_12_DOCUMENTATION_SEAL =
  "No Compliance Overclaim Seal: preset documentation is reference-only and user must check institution requirements.";
