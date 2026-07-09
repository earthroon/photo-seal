<script setup lang="ts">
import type { PhotoSealAuditBundleSaveReceipt, PhotoSealJpegSaveReceipt } from "../../export/saveReceipt";

defineProps<{
  jpegReceipt?: PhotoSealJpegSaveReceipt | null;
  auditBundleReceipt?: PhotoSealAuditBundleSaveReceipt | null;
}>();
</script>

<template>
  <div class="export-save-receipt-badge" aria-label="Export save receipt summary">
    <p>
      <strong>JPEG Blob</strong>:
      <span>{{ jpegReceipt?.blobCreated ? "ready" : "not saved" }}</span>
    </p>
    <p>
      <strong>Download</strong>:
      <span>{{ jpegReceipt?.saveStatus ?? "idle" }}</span>
    </p>
    <p>
      <strong>Blob URL</strong>:
      <span>{{ jpegReceipt?.objectUrlRevoked ? "revoked" : "not active" }}</span>
    </p>
    <p>
      <strong>Audit bundle</strong>:
      <span>{{ auditBundleReceipt?.saveStatus ?? "optional" }}</span>
    </p>
  </div>
</template>
