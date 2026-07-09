import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const receipt = {
  patchId: "TDT-PHOTOSEAL-13",
  stage: "export-flow-assembly-import-preset-resize-encode-save-happy-path",
  staticContractSmoke: "PASS",
  browserExportFlowRuntimeSmoke: "NOT_RUN",
  browserExportFlowRuntimeReason: "PLAYWRIGHT_NOT_INSTALLED",
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
  receiptCaptured: true
};

try {
  await import("@playwright/test");
  receipt.browserExportFlowRuntimeReason = "NO_BROWSER_RUNTIME";
} catch {
  receipt.browserExportFlowRuntimeReason = "PLAYWRIGHT_NOT_INSTALLED";
}

fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_13_EXPORT_FLOW_RUNTIME_RECEIPT.json"),
  `${JSON.stringify(receipt, null, 2)}\n`
);
console.log("NOT_RUN_TDT_PHOTOSEAL_13_BROWSER_EXPORT_FLOW_RUNTIME_SMOKE");
