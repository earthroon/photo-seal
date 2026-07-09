<template>
  <div class="preset-documentation-receipt-badge" role="status">
    <span>Documentation: {{ receipt.documentationEntryCreated ? "available" : "missing" }}</span>
    <span>Overclaim scan: {{ receipt.overclaimScanPassed ? "pass" : "fail" }}</span>
    <span>Disclaimer: {{ receipt.disclaimerVisible ? "visible" : "missing" }}</span>
  </div>
</template>

<script setup lang="ts">
import type { PhotoSealPresetDocumentationReceipt } from "../../documentation/presetDocumentationReceipt";

defineOptions({ name: "PresetDocumentationReceiptBadge" });
defineProps<{ receipt: PhotoSealPresetDocumentationReceipt }>();
</script>
