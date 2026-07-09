import type { PhotoSealExportAuditSummary } from "../receipt/exportAuditTypes";
import type { PhotoSealExportFlowStatus } from "./exportFlowAssemblyTypes";
import type { PhotoSealExportFlowAssemblyReceipt } from "./exportFlowAssemblyReceipt";

export type PhotoSealExportFlowAssemblyResult = {
  status: PhotoSealExportFlowStatus;
  jpg?: Uint8Array;
  auditSummary?: PhotoSealExportAuditSummary;
  importReceipt?: unknown;
  presetReceipt?: unknown;
  resizeReceipt?: unknown;
  resizeTargetGuardReceipt?: unknown;
  bridgeReceipt?: unknown;
  wasmReceipt?: unknown;
  documentationReceipt?: unknown;
  cropReceipt?: unknown;
  saveReceipt?: unknown;
  assemblyReceipt: PhotoSealExportFlowAssemblyReceipt;
};
