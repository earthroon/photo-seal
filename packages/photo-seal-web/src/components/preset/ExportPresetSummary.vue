<script setup lang="ts">
import type { PhotoSealExportPreset } from "../../preset/exportPresetTypes";
import { PHOTO_SEAL_KO_COPY, getPhotoSealPresetDisplayTitle } from "../../ui/photoSealKoCopy";

const props = defineProps<{
  preset: PhotoSealExportPreset;
}>();
</script>

<template>
  <section class="export-preset-summary export-preset-summary--compact" aria-label="선택한 프리셋 상세">
    <div class="summary-copy">
      <p class="panel-kicker">{{ PHOTO_SEAL_KO_COPY.selectedPresetInfo }}</p>
      <h3>{{ getPhotoSealPresetDisplayTitle({ kind: props.preset.kind, label: props.preset.label }) }} {{ props.preset.width }}×{{ props.preset.height }}</h3>
    </div>
    <dl class="summary-grid summary-grid--inline summary-grid--compact-preset">
      <div>
        <dt>출력 크기</dt>
        <dd>{{ props.preset.width }} × {{ props.preset.height }} px</dd>
      </div>
      <div>
        <dt>{{ PHOTO_SEAL_KO_COPY.cropState }}</dt>
        <dd>{{ props.preset.cropRequired ? PHOTO_SEAL_KO_COPY.cropRequired : PHOTO_SEAL_KO_COPY.cropNotRequired }}</dd>
      </div>
    </dl>
  </section>
</template>
