<script setup lang="ts">
import type { PhotoSealExportPresetReceipt } from "../../preset/exportPresetReceipt";
import { PHOTO_SEAL_KO_COPY, formatPhotoSealBytes } from "../../ui/photoSealKoCopy";

const props = defineProps<{
  receipt?: PhotoSealExportPresetReceipt;
}>();
</script>

<template>
  <aside class="preset-receipt-badge" aria-label="프리셋 검증 기록">
    <template v-if="props.receipt">
      <strong>{{ PHOTO_SEAL_KO_COPY.receiptSummary }} · {{ props.receipt.presetLabel }}</strong>
      <span>출력 크기: {{ props.receipt.width }} × {{ props.receipt.height }} px</span>
      <span>{{ PHOTO_SEAL_KO_COPY.targetBytes }}: {{ formatPhotoSealBytes(props.receipt.targetBytes) }}</span>
      <span>{{ PHOTO_SEAL_KO_COPY.resizeProfile }}: {{ props.receipt.resizeProfile }}</span>
      <span>숨은 리사이즈 정책: 없음</span>
      <span>숨은 목표 용량 정책: 없음</span>
      <span>인코더 쪽 리사이즈/크롭: 금지</span>
      <span v-if="props.receipt.cropRequired && !props.receipt.cropReceiptPresent">크롭 정보가 필요합니다.</span>
    </template>
    <template v-else>
      <strong>프리셋 검증 기록 대기 중</strong>
    </template>
  </aside>
</template>
