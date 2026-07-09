<script setup lang="ts">
import type { PhotoSealSaveReason, PhotoSealSaveStatus, PhotoSealSaveTarget } from "../../export/saveTypes";

const props = defineProps<{
  target: PhotoSealSaveTarget | null;
  status: PhotoSealSaveStatus;
  reason: PhotoSealSaveReason | null;
  message?: string | null;
}>();

function statusLabel(): string {
  if (props.status === "saved") return "저장 완료";
  if (props.status === "failed") return "저장 실패";
  if (props.status === "unsupported") return "저장 미지원";
  if (props.status === "saving") return "저장 중";
  return "저장 대기";
}
</script>

<template>
  <p class="export-save-status" aria-live="polite">
    <strong>{{ statusLabel() }}</strong>
    <span v-if="target"> · {{ target }}</span>
    <span v-if="reason"> · {{ reason }}</span>
    <span v-if="message"> · {{ message }}</span>
  </p>
</template>
