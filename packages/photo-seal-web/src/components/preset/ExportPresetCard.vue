<script setup lang="ts">
import { computed } from "vue";
import type { PhotoSealExportPreset } from "../../preset/exportPresetTypes";
import { getPhotoSealPresetDisplayTitle } from "../../ui/photoSealKoCopy";

const props = defineProps<{
  preset: PhotoSealExportPreset;
  selected?: boolean;
}>();

const emit = defineEmits<{
  select: [preset: PhotoSealExportPreset];
}>();

const displayTitle = computed(() =>
  getPhotoSealPresetDisplayTitle({ kind: props.preset.kind, label: props.preset.label })
);
</script>

<template>
  <button
    class="export-preset-card"
    :class="{ 'export-preset-card--selected': props.selected }"
    type="button"
    :aria-pressed="props.selected ? 'true' : 'false'"
    data-card-density="mobile-tile"
    @click="emit('select', props.preset)"
  >
    <span v-if="props.selected" class="export-preset-card__check" aria-hidden="true">✓</span>
    <span class="export-preset-card__line export-preset-card__line--main">
      <strong class="export-preset-card__title">{{ displayTitle }}</strong>
      <span class="export-preset-card__size">{{ props.preset.width }}×{{ props.preset.height }}</span>
    </span>
  </button>
</template>
