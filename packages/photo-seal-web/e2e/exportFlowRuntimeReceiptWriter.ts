import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const TDT_PHOTOSEAL_13_EXPORT_FLOW_RUNTIME_RECEIPT_PATH =
  "artifacts/TDT_PHOTOSEAL_13_EXPORT_FLOW_RUNTIME_RECEIPT.json";

export type PhotoSealExportFlowRuntimeReceiptFile = {
  patchId: "TDT-PHOTOSEAL-13";
  stage: "export-flow-assembly-import-preset-resize-encode-save-happy-path";
  staticContractSmoke: "PASS" | "FAIL" | "NOT_RUN";
  browserExportFlowRuntimeSmoke: "PASS" | "FAIL" | "NOT_RUN";
  browserExportFlowRuntimeReason: string;
  runtimeActuallyExecuted: boolean;
  runtimePassClaimed: boolean;
  importReceiptPresent: boolean;
  presetReceiptPresent: boolean;
  resizeReceiptPresent: boolean;
  bridgeReceiptPresent: boolean;
  wasmReceiptPresent: boolean;
  auditSummaryPresent: boolean;
  documentationReceiptPresent: boolean;
  missingReceiptSuccessBlocked: true;
  mockReceiptUsedForSuccess: false;
  staticSmokeUsedAsRuntimePass: false;
  receiptCaptured: boolean;
};

export function makeExportFlowRuntimeNotRunReceipt(
  reason = "PLAYWRIGHT_NOT_INSTALLED"
): PhotoSealExportFlowRuntimeReceiptFile {
  return {
    patchId: "TDT-PHOTOSEAL-13",
    stage: "export-flow-assembly-import-preset-resize-encode-save-happy-path",
    staticContractSmoke: "PASS",
    browserExportFlowRuntimeSmoke: "NOT_RUN",
    browserExportFlowRuntimeReason: reason,
    runtimeActuallyExecuted: false,
    runtimePassClaimed: false,
    importReceiptPresent: false,
    presetReceiptPresent: false,
    resizeReceiptPresent: false,
    bridgeReceiptPresent: false,
    wasmReceiptPresent: false,
    auditSummaryPresent: false,
    documentationReceiptPresent: false,
    missingReceiptSuccessBlocked: true,
    mockReceiptUsedForSuccess: false,
    staticSmokeUsedAsRuntimePass: false,
    receiptCaptured: true,
  };
}

export function writeExportFlowRuntimeReceipt(
  receipt: PhotoSealExportFlowRuntimeReceiptFile,
  path = TDT_PHOTOSEAL_13_EXPORT_FLOW_RUNTIME_RECEIPT_PATH
): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(receipt, null, 2)}\n`);
}
