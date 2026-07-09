<script setup lang="ts">
import type { PhotoSealExportFlowAssemblyReceipt } from "../../assembly/exportFlowAssemblyReceipt";
import type { PhotoSealExportFlowStageState } from "../../assembly/exportFlowAssemblyTypes";
import ExportFlowActions from "./ExportFlowActions.vue";
import ExportFlowBlockers from "./ExportFlowBlockers.vue";
import ExportFlowStageList from "./ExportFlowStageList.vue";

const props = defineProps<{
  receipt: PhotoSealExportFlowAssemblyReceipt;
}>();

const stages: PhotoSealExportFlowStageState[] = [
  {
    id: "import",
    label: "Import",
    status: props.receipt.importReceiptPresent ? "pass" : "blocked",
    receiptPresent: props.receipt.importReceiptPresent,
    blockerCodes: props.receipt.importReceiptPresent ? [] : ["MISSING_IMPORT_RECEIPT"],
    warningCodes: [],
  },
  {
    id: "preset",
    label: "Preset",
    status: props.receipt.presetReceiptPresent ? "pass" : "blocked",
    receiptPresent: props.receipt.presetReceiptPresent,
    blockerCodes: props.receipt.presetReceiptPresent ? [] : ["MISSING_PRESET_RECEIPT"],
    warningCodes: [],
  },
  {
    id: "resize",
    label: "Resize",
    status: props.receipt.resizeReceiptPresent ? "pass" : "blocked",
    receiptPresent: props.receipt.resizeReceiptPresent,
    blockerCodes: props.receipt.resizeReceiptPresent ? [] : ["MISSING_RESIZE_RECEIPT"],
    warningCodes: [],
  },
  {
    id: "wasm-encode",
    label: "Encode",
    status: props.receipt.wasmReceiptPresent ? "pass" : "blocked",
    receiptPresent: props.receipt.wasmReceiptPresent,
    blockerCodes: props.receipt.wasmReceiptPresent ? [] : ["MISSING_WASM_RECEIPT"],
    warningCodes: [],
  },
  {
    id: "audit",
    label: "Audit",
    status: props.receipt.auditSummaryPresent ? "pass" : "blocked",
    receiptPresent: props.receipt.auditSummaryPresent,
    blockerCodes: props.receipt.auditSummaryPresent ? [] : ["MISSING_AUDIT_SUMMARY"],
    warningCodes: [],
  },
  {
    id: "documentation",
    label: "Documentation",
    status: props.receipt.documentationReceiptPresent ? "pass" : "blocked",
    receiptPresent: props.receipt.documentationReceiptPresent,
    blockerCodes: props.receipt.documentationReceiptPresent ? [] : ["MISSING_DOCUMENTATION_RECEIPT"],
    warningCodes: ["DOCUMENTATION_REFERENCE_ONLY"],
  },
  {
    id: "save",
    label: "Save",
    status: props.receipt.saveReceiptPresent ? "pass" : "warn",
    receiptPresent: props.receipt.saveReceiptPresent,
    blockerCodes: [],
    warningCodes: props.receipt.saveReceiptPresent ? [] : ["SAVE_NOT_ATTEMPTED"],
  },
];
</script>

<template>
  <section class="export-flow-panel" aria-label="PhotoSeal export flow assembly">
    <header>
      <h3>Export flow assembly</h3>
      <p>Flow status: {{ receipt.flowStatus }}</p>
      <p>No Missing Receipt Success Seal: {{ receipt.missingReceiptSuccessBlocked ? "sealed" : "broken" }}</p>
    </header>

    <ExportFlowStageList :stages="stages" />
    <ExportFlowBlockers :blockers="receipt.flowBlockers" :warnings="receipt.flowWarnings" />
    <ExportFlowActions
      :can-run-export="true"
      :can-download-jpeg="receipt.exportSuccessClaimed"
    />
  </section>
</template>
