<script setup lang="ts">
import { ref } from "vue";
import { savePhotoSealAuditBundleJson, type PhotoSealSaveableAuditBundle } from "../../export/saveAuditBundle";
import { savePhotoSealJpeg } from "../../export/saveJpeg";
import type { PhotoSealAuditBundleSaveReceipt, PhotoSealJpegSaveReceipt } from "../../export/saveReceipt";
import type { PhotoSealSaveReason, PhotoSealSaveStatus, PhotoSealSaveTarget } from "../../export/saveTypes";
import type { PhotoSealExportAuditSummary } from "../../receipt/exportAuditTypes";
import ExportSaveReceiptBadge from "./ExportSaveReceiptBadge.vue";
import ExportSaveStatus from "./ExportSaveStatus.vue";

const props = defineProps<{
  jpg?: Uint8Array | ArrayBuffer;
  auditSummary?: PhotoSealExportAuditSummary;
  auditBundle?: PhotoSealSaveableAuditBundle;
  sourceFileName?: string;
}>();

const status = ref<PhotoSealSaveStatus>("idle");
const reason = ref<PhotoSealSaveReason | null>(null);
const target = ref<PhotoSealSaveTarget | null>(null);
const message = ref<string | null>(null);
const jpegReceipt = ref<PhotoSealJpegSaveReceipt | null>(null);
const auditBundleReceipt = ref<PhotoSealAuditBundleSaveReceipt | null>(null);

async function onDownloadJpeg() {
  target.value = "jpeg";
  status.value = "saving";
  reason.value = null;
  message.value = null;
  if (!props.jpg || !props.auditSummary) {
    status.value = "failed";
    reason.value = !props.jpg ? "NO_JPEG_BYTES" : "AUDIT_BUNDLE_MISSING";
    message.value = "JPEG bytes and audit summary are required before saving.";
    return;
  }
  const receipt = await savePhotoSealJpeg({
    jpg: props.jpg,
    auditSummary: props.auditSummary,
    sourceFileName: props.sourceFileName,
    userActionObserved: true,
  });
  jpegReceipt.value = receipt;
  status.value = receipt.saveStatus;
  reason.value = receipt.saveReason;
  message.value = receipt.saveStatus === "saved" ? "JPEG download was triggered." : "JPEG save did not complete.";
}

async function onSaveAuditBundle() {
  target.value = "audit-bundle-json";
  status.value = "saving";
  reason.value = null;
  message.value = null;
  if (!props.auditBundle) {
    status.value = "failed";
    reason.value = "AUDIT_BUNDLE_MISSING";
    message.value = "Audit bundle is not available.";
    return;
  }
  const receipt = await savePhotoSealAuditBundleJson({
    bundle: props.auditBundle,
    sourceFileName: props.sourceFileName,
    userActionObserved: true,
  });
  auditBundleReceipt.value = receipt;
  status.value = receipt.saveStatus;
  reason.value = receipt.saveReason;
  message.value = receipt.saveStatus === "saved" ? "Audit bundle download was triggered." : "Audit bundle save did not complete.";
}
</script>

<template>
  <section class="export-save-actions" aria-label="PhotoSeal export save actions">
    <div class="export-save-actions__buttons">
      <button type="button" :disabled="!jpg || !auditSummary" @click="onDownloadJpeg">
        Download JPEG
      </button>
      <button type="button" :disabled="!auditBundle" @click="onSaveAuditBundle">
        Save audit bundle
      </button>
    </div>
    <ExportSaveStatus :target="target" :status="status" :reason="reason" :message="message" />
    <ExportSaveReceiptBadge :jpeg-receipt="jpegReceipt" :audit-bundle-receipt="auditBundleReceipt" />
  </section>
</template>
