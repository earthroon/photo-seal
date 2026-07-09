<script setup lang="ts">
import { PHOTO_SEAL_KO_COPY } from "../../ui/photoSealKoCopy";

defineProps<{
  canRunExport: boolean;
  canDownloadJpeg: boolean;
}>();

const emit = defineEmits<{
  runExport: [];
  downloadJpeg: [];
}>();
</script>

<template>
  <div class="export-flow-actions" aria-label="내보내기 작업">
    <button class="primary-action" type="button" :disabled="!canRunExport" @click="emit('runExport')">
      {{ PHOTO_SEAL_KO_COPY.runExport }}
    </button>
    <div v-if="canDownloadJpeg" class="secondary-actions">
      <button type="button" @click="emit('downloadJpeg')">
        <span aria-hidden="true">⇩</span>
        {{ PHOTO_SEAL_KO_COPY.downloadJpeg }}
      </button>
    </div>
  </div>
</template>
