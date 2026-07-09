export type PhotoSealExportFlowStatus =
  | "idle"
  | "ready"
  | "running"
  | "blocked"
  | "exported"
  | "saved"
  | "failed";

export type PhotoSealExportFlowStageId =
  | "import"
  | "preset"
  | "resize"
  | "bridge"
  | "wasm-encode"
  | "audit"
  | "documentation"
  | "save";

export type PhotoSealExportFlowStageStatus =
  | "ready"
  | "running"
  | "pass"
  | "warn"
  | "blocked"
  | "fail"
  | "not-run";

export type PhotoSealExportFlowBlockerCode =
  | "MISSING_IMPORT_RECEIPT"
  | "MISSING_PRESET_RECEIPT"
  | "MISSING_RESIZE_RECEIPT"
  | "MISSING_BRIDGE_RECEIPT"
  | "MISSING_WASM_RECEIPT"
  | "MISSING_AUDIT_SUMMARY"
  | "MISSING_DOCUMENTATION_RECEIPT"
  | "AUDIT_SUMMARY_BLOCKED"
  | "CROP_REQUIRED_BUT_MISSING"
  | "SAVE_RECEIPT_MISSING"
  | "SAVE_STATUS_NOT_SAVED"
  | "OBJECT_URL_NOT_REVOKED"
  | "STATIC_SMOKE_USED_AS_RUNTIME_PASS";

export type PhotoSealExportFlowWarningCode =
  | "SAVE_NOT_ATTEMPTED"
  | "AUDIT_BUNDLE_NOT_SAVED"
  | "BROWSER_RUNTIME_NOT_RUN"
  | "DOCUMENTATION_REFERENCE_ONLY"
  | "INSTITUTION_REQUIREMENT_USER_CHECK_REQUIRED";

export type PhotoSealExportFlowStageState = {
  id: PhotoSealExportFlowStageId;
  label: string;
  status: PhotoSealExportFlowStageStatus;
  receiptPresent: boolean;
  blockerCodes: PhotoSealExportFlowBlockerCode[];
  warningCodes: PhotoSealExportFlowWarningCode[];
};
