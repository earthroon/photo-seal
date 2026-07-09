<script setup lang="ts">
defineOptions({ name: "ImageImportReceiptBadge" });
import type { PhotoSealImageImportReceipt } from "../../import/imageImportReceipt";
import { PHOTO_SEAL_KO_COPY } from "../../ui/photoSealKoCopy";

defineProps<{
  receipt?: PhotoSealImageImportReceipt;
}>();
</script>

<template>
  <section class="image-import-receipt-badge" :data-status="receipt ? 'pass' : 'idle'">
    <strong>{{ PHOTO_SEAL_KO_COPY.receiptSummary }}</strong>
    <template v-if="receipt">
      <span>{{ PHOTO_SEAL_KO_COPY.decodeOwner }}: {{ PHOTO_SEAL_KO_COPY.browserDecoder }}</span>
      <span>{{ PHOTO_SEAL_KO_COPY.colorSpace }}: sRGB</span>
      <span>{{ PHOTO_SEAL_KO_COPY.canvasCorrection }}: {{ PHOTO_SEAL_KO_COPY.none }}</span>
      <span>decode: {{ receipt.decodeMethod }}</span>
    </template>
    <template v-else>
      <span>{{ PHOTO_SEAL_KO_COPY.receiptWaiting }}</span>
    </template>
  </section>
</template>
