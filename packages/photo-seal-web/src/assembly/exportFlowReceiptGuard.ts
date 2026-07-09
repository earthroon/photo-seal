import type { PhotoSealExportAuditSummary } from "../receipt/exportAuditTypes";
import type { PhotoSealExportFlowBlockerCode, PhotoSealExportFlowWarningCode } from "./exportFlowAssemblyTypes";

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord | undefined {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : undefined;
}

function hasAuditBlockers(summary: PhotoSealExportAuditSummary | undefined): boolean {
  return Array.isArray(summary?.blockers) && summary.blockers.length > 0;
}

function cropRequiredWithoutReceipt(presetReceipt: unknown): boolean {
  const receipt = asRecord(presetReceipt);
  return receipt?.cropRequired === true && receipt.cropReceiptPresent !== true;
}

function saveStatusNotSaved(saveReceipt: unknown): boolean {
  const receipt = asRecord(saveReceipt);
  return !!receipt && receipt.saveStatus !== "saved";
}

function objectUrlNotRevoked(saveReceipt: unknown): boolean {
  const receipt = asRecord(saveReceipt);
  return !!receipt && receipt.objectUrlRevoked !== true;
}

export function validateExportFlowReceipts(args: {
  importReceipt?: unknown;
  presetReceipt?: unknown;
  resizeReceipt?: unknown;
  bridgeReceipt?: unknown;
  wasmReceipt?: unknown;
  auditSummary?: PhotoSealExportAuditSummary;
  documentationReceipt?: unknown;
  saveReceipt?: unknown;
  requireSaveReceipt?: boolean;
}): {
  blockers: PhotoSealExportFlowBlockerCode[];
  warnings: PhotoSealExportFlowWarningCode[];
} {
  const blockers: PhotoSealExportFlowBlockerCode[] = [];
  const warnings: PhotoSealExportFlowWarningCode[] = [];

  if (!args.importReceipt) blockers.push("MISSING_IMPORT_RECEIPT");
  if (!args.presetReceipt) blockers.push("MISSING_PRESET_RECEIPT");
  if (!args.resizeReceipt) blockers.push("MISSING_RESIZE_RECEIPT");
  if (!args.bridgeReceipt) blockers.push("MISSING_BRIDGE_RECEIPT");
  if (!args.wasmReceipt) blockers.push("MISSING_WASM_RECEIPT");
  if (!args.auditSummary) blockers.push("MISSING_AUDIT_SUMMARY");
  if (!args.documentationReceipt) blockers.push("MISSING_DOCUMENTATION_RECEIPT");
  if (hasAuditBlockers(args.auditSummary)) blockers.push("AUDIT_SUMMARY_BLOCKED");
  if (cropRequiredWithoutReceipt(args.presetReceipt)) blockers.push("CROP_REQUIRED_BUT_MISSING");

  if (args.requireSaveReceipt === true) {
    if (!args.saveReceipt) blockers.push("SAVE_RECEIPT_MISSING");
    if (saveStatusNotSaved(args.saveReceipt)) blockers.push("SAVE_STATUS_NOT_SAVED");
    if (objectUrlNotRevoked(args.saveReceipt)) blockers.push("OBJECT_URL_NOT_REVOKED");
  } else if (!args.saveReceipt) {
    warnings.push("SAVE_NOT_ATTEMPTED");
  }

  warnings.push("DOCUMENTATION_REFERENCE_ONLY");
  warnings.push("INSTITUTION_REQUIREMENT_USER_CHECK_REQUIRED");

  return { blockers: [...new Set(blockers)], warnings: [...new Set(warnings)] };
}

export function assertNoMissingReceiptSuccess(args: {
  exportSuccessClaimed: boolean;
  blockers: PhotoSealExportFlowBlockerCode[];
}): void {
  if (args.exportSuccessClaimed && args.blockers.length > 0) {
    throw new Error("No Missing Receipt Success Seal violation");
  }
}
