import type { PhotoSealExportFlowBlockerCode, PhotoSealExportFlowStatus, PhotoSealExportFlowWarningCode } from "../assembly/exportFlowAssemblyTypes";
import type { Jpeg444TargetBytesWasmReceipt } from "../encoder/jpegWasmTypes";
import type { PhotoSealBridgeReceipt } from "./photoSealBridgeReceipt";
import type { PhotoSealExportPresetId } from "../preset/exportPresetTypes";
import type { PhotoSealCustomPresetValidationCode } from "../preset/customPresetValidationTypes";

export type PhotoSealAuditStatus = "pass" | "warn" | "fail";

export type UserVisibleImportAudit = {
  decodeOwner: "browser-decoder";
  decodeMethod: "create-image-bitmap" | "image-decoder";
  decodedColorSpace: "srgb";
  importOutputColorSpace: "srgb";
  canvasUsedForDecode: false;
  canvasUsedForPixelExtraction: false;
  canvasColorCorrectionUsed: false;
  orientationPolicy: "browser-from-image" | "none";
  orientationAppliedByBrowserDecoder: boolean;
  status: "pass" | "fail";
  label: string;
};


export type UserVisiblePresetAudit = {
  presetId: PhotoSealExportPresetId;
  presetLabel: string;
  width: number;
  height: number;
  targetBytes: number;
  resizeProfile: "export-ewa";
  jpegSubsampling: "444";
  colorSpace: "srgb";
  cropRequired: boolean;
  cropReceiptPresent: boolean;
  hiddenResizePolicyUsed: false;
  hiddenTargetBytesPolicyUsed: false;
  hiddenAspectPolicyUsed: false;
  hiddenPaddingPolicyUsed: false;
  runtimePolicyMatchesPreset: boolean;
  status: "pass" | "warn" | "fail";
  label: string;
};

export type UserVisibleColorAudit = {
  decodedColorSpace: "srgb";
  resizeInputColorSpace: "srgb";
  resizeOutputColorSpace: "srgb";
  wasmInputColorSpace: "srgb";
  jpegColorSpace: "srgb";
  hiddenGammaTransformUsed: false;
  doubleGammaDetected: false;
  implicitColorTransformUsed: false;
  status: "pass" | "fail";
  label: string;
};

export type UserVisibleJpegAudit = {
  encodedColorSpace: "srgb";
  subsampling: "444";
  targetBytesUsed: true;
  qualitySearchUsed: true;
  compressionHandleSearchUsed: true;
  selectedQuality?: number;
  attemptsCount: number;
  jpegMagicValid: boolean;
  samplingAuditIs444: boolean;
  resizedInsideEncoder: false;
  cropInsideEncoder: false;
  fallbackUsed: false;
  status: PhotoSealAuditStatus;
  label: string;
};

export type UserVisibleBridgeAudit = {
  workerUsed: true;
  workerSingleThread: true;
  workerPoolUsed: false;
  nestedWorkerUsed: false;
  arrayBufferTransferUsed: true;
  paddedBufferTransferred: false;
  wasmSimdRequired: true;
  wasmSingleThread: true;
  wasmPthreadUsed: false;
  sharedArrayBufferRequired: false;
  workerColorTransformUsed: false;
  workerGammaTransformUsed: false;
  workerHiddenLinearizationUsed: false;
  workerDoubleGammaDetected: false;
  status: "pass" | "fail";
  label: string;
};


export type UserVisibleSaveAudit = {
  jpegBlobCreated: boolean;
  jpegBlobMimeType: "image/jpeg";
  objectUrlCreated: boolean;
  objectUrlRevoked: boolean;
  jpegDownloadStatus?: "saved" | "failed" | "unsupported";
  auditBundleOptional: true;
  auditBundleSavedByDefault: false;
  status: "pass" | "warn" | "fail";
  label: string;
};

export type UserVisibleCustomPresetValidationAudit = {
  validationStatus: "valid" | "invalid";
  widthValid: boolean;
  heightValid: boolean;
  targetBytesValid: boolean;
  validationCodes: PhotoSealCustomPresetValidationCode[];
  clampApplied: false;
  fallbackPresetUsed: false;
  silentCorrectionUsed: false;
  applyButtonEnabled: boolean;
  customPresetReceiptCreated: boolean;
  status: "pass" | "warn" | "fail";
  label: string;
};

export type UserVisibleQualityAudit = {
  resizeProfile: "export-ewa" | "adaptive-ewa" | "adaptive-ewa-lite" | "adaptive-ewa-deltae" | "dadum-adaptive-qmap-tilemask";
  defaultProfileChanged: false;
  promotedToDefault: false;
  qmapUsed: boolean;
  tileMaskUsed: boolean;
  qmapBoundToAdaptivePass?: boolean;
  tileMaskBoundToAdaptivePass?: boolean;
  oklabUsed: boolean;
  oklabMetricLocalOnly?: boolean;
  persistentOklabOutputUsed?: false;
  persistentLinearOutputUsed?: false;
  parityGateAvailable: boolean;
  parityRuntimeWebGpuSmoke?: "PASS" | "FAIL" | "NOT_RUN";
  status: PhotoSealAuditStatus;
  label: string;
};


export type UserVisiblePresetDocumentationAudit = {
  documentationEntryCreated: boolean;
  institutionNoteCopyCreated: boolean;
  disclaimerVisible: boolean;
  officialComplianceGuaranteed: false;
  institutionUploadGuaranteed: false;
  legalRequirementVerified: false;
  userMustCheckInstitutionRequirements: true;
  overclaimScanPassed: boolean;
  overclaimDetected: false;
  status: "pass" | "warn" | "fail";
  label: string;
};


export type UserVisibleExportFlowAudit = {
  flowStatus: PhotoSealExportFlowStatus;
  importReceiptPresent: boolean;
  presetReceiptPresent: boolean;
  resizeReceiptPresent: boolean;
  bridgeReceiptPresent: boolean;
  wasmReceiptPresent: boolean;
  auditSummaryPresent: boolean;
  documentationReceiptPresent: boolean;
  saveReceiptPresent: boolean;
  missingReceiptSuccessBlocked: true;
  flowBlockers: PhotoSealExportFlowBlockerCode[];
  flowWarnings: PhotoSealExportFlowWarningCode[];
  exportSuccessClaimed: boolean;
  saveSuccessClaimed: boolean;
  status: "pass" | "warn" | "fail";
  label: string;
};

export type PhotoSealAuditWarningCode =
  | "TARGET_BYTES_NOT_REACHED"
  | "RUNTIME_WEBGPU_SMOKE_NOT_RUN"
  | "CANDIDATE_PROFILE_USED"
  | "PARITY_GATE_NOT_RUNTIME_VERIFIED"
  | "IMPORT_ORIENTATION_NOT_CONFIRMED"
  | "IMAGE_DECODER_FALLBACK_TO_CREATE_IMAGE_BITMAP"
  | "OBJECT_URL_REVOKE_WARNING"
  | "JPEG_SAVE_NOT_ATTEMPTED"
  | "AUDIT_BUNDLE_NOT_SAVED"
  | "CUSTOM_PRESET_USED"
  | "CROP_REQUIRED_PRESET_SELECTED"
  | "CUSTOM_PRESET_INVALID"
  | "CUSTOM_PRESET_NOT_APPLIED"
  | "INSTITUTION_REQUIREMENT_USER_CHECK_REQUIRED"
  | "PRESET_DOCUMENTATION_REFERENCE_ONLY"
  | "EXPORT_FLOW_SAVE_NOT_ATTEMPTED"
  | "EXPORT_FLOW_BROWSER_RUNTIME_NOT_RUN";

export type PhotoSealAuditBlockerCode =
  | "MISSING_RESIZE_RECEIPT"
  | "MISSING_BRIDGE_RECEIPT"
  | "MISSING_WASM_RECEIPT"
  | "COLOR_SPACE_NOT_SRGB"
  | "DOUBLE_GAMMA_DETECTED"
  | "JPEG_NOT_444"
  | "ENCODER_FALLBACK_USED"
  | "PADDED_BUFFER_TRANSFERRED"
  | "WORKER_COLOR_TRANSFORM_USED"
  | "MISSING_IMPORT_RECEIPT"
  | "IMPORT_COLOR_SPACE_NOT_SRGB"
  | "CANVAS_COLOR_CORRECTION_USED"
  | "BROWSER_DECODE_FAILED"
  | "UNSUPPORTED_MIME_TYPE"
  | "CANVAS_PIXEL_EXTRACTION_USED"
  | "MISSING_PRESET_RECEIPT"
  | "HIDDEN_RESIZE_POLICY_USED"
  | "HIDDEN_TARGET_BYTES_POLICY_USED"
  | "PRESET_RUNTIME_MISMATCH"
  | "CROP_REQUIRED_BUT_MISSING"
  | "JPEG_BYTES_MISSING"
  | "JPEG_BLOB_CREATE_FAILED"
  | "DOWNLOAD_TRIGGER_FAILED"
  | "OBJECT_URL_REVOKE_FAILED"
  | "AUDIT_BUNDLE_MISSING"
  | "CUSTOM_PRESET_CLAMPED"
  | "CUSTOM_PRESET_FALLBACK_USED"
  | "CUSTOM_PRESET_SILENT_CORRECTION_USED"
  | "PRESET_DOCUMENTATION_MISSING"
  | "COMPLIANCE_OVERCLAIM_DETECTED"
  | "DISCLAIMER_NOT_VISIBLE"
  | "INSTITUTION_NOTE_COPY_MISSING"
  | "EXPORT_FLOW_MISSING_IMPORT_RECEIPT"
  | "EXPORT_FLOW_MISSING_PRESET_RECEIPT"
  | "EXPORT_FLOW_MISSING_RESIZE_RECEIPT"
  | "EXPORT_FLOW_MISSING_BRIDGE_RECEIPT"
  | "EXPORT_FLOW_MISSING_WASM_RECEIPT"
  | "EXPORT_FLOW_MISSING_AUDIT_SUMMARY"
  | "EXPORT_FLOW_MISSING_DOCUMENTATION_RECEIPT"
  | "EXPORT_FLOW_MISSING_RECEIPT_SUCCESS_BLOCKED";

export type PhotoSealAuditWarning = {
  code: PhotoSealAuditWarningCode;
  severity: "warning";
  message: string;
};

export type PhotoSealAuditBlocker = {
  code: PhotoSealAuditBlockerCode;
  severity: "blocker";
  message: string;
};

export type PhotoSealExportAuditSummary = {
  patchId: "TDT-PHOTOSEAL-06";
  stage: "export-receipt-surface-user-visible-quality-audit";
  exportStatus: PhotoSealAuditStatus;
  exportStatusLabel: string;
  fileName?: string;
  width: number;
  height: number;
  targetBytes: number;
  outputBytes: number;
  reachedTarget: boolean;
  resizeProfile: string;
  resizeProfileLabel: string;
  defaultProfileUsed: boolean;
  candidateProfileUsed: boolean;
  colorPipeline: UserVisibleColorAudit;
  jpeg: UserVisibleJpegAudit;
  bridge: UserVisibleBridgeAudit;
  quality: UserVisibleQualityAudit;
  import?: UserVisibleImportAudit;
  save?: UserVisibleSaveAudit;
  preset?: UserVisiblePresetAudit;
  customPresetValidation?: UserVisibleCustomPresetValidationAudit;
  presetDocumentation?: UserVisiblePresetDocumentationAudit;
  exportFlow?: UserVisibleExportFlowAudit;
  warnings: PhotoSealAuditWarning[];
  blockers: PhotoSealAuditBlocker[];
  receiptAvailable: true;
};

export type PhotoSealDebugReceiptBundle = {
  auditSummary: PhotoSealExportAuditSummary;
  resizeReceipt: unknown;
  bridgeReceipt: PhotoSealBridgeReceipt | unknown;
  wasmReceipt: Jpeg444TargetBytesWasmReceipt | unknown;
  parityReceipt?: unknown;
  oklabReceipt?: unknown;
  importReceipt?: unknown;
  saveReceipt?: unknown;
  auditBundleSaveReceipt?: unknown;
  presetReceipt?: unknown;
  customPresetValidationReceipt?: unknown;
  presetDocumentationReceipt?: unknown;
  institutionNoteCopy?: unknown;
  complianceOverclaimScan?: unknown;
  exportFlowAssemblyReceipt?: unknown;
};
