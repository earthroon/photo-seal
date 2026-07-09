<script setup lang="ts">
import { computed, ref } from "vue";
import ExportPresetCard from "./ExportPresetCard.vue";
import CustomPresetFields from "./CustomPresetFields.vue";
import PresetReceiptBadge from "./PresetReceiptBadge.vue";
import { listPhotoSealExportPresets } from "../../preset/exportPresetRegistry";
import { createCustomPhotoSealExportPreset, createPhotoSealExportPresetReceipt } from "../../preset/exportPresetResolver";
import { PHOTO_SEAL_KO_COPY } from "../../ui/photoSealKoCopy";
import type { PhotoSealCustomExportPresetInput, PhotoSealExportPreset } from "../../preset/exportPresetTypes";
import type { PhotoSealExportPresetReceipt } from "../../preset/exportPresetReceipt";
import type { PhotoSealCustomPresetValidationResult } from "../../preset/customPresetValidationTypes";
import type { PhotoSealCustomPresetValidationReceipt } from "../../preset/customPresetValidationReceipt";

const emit = defineEmits<{
  selected: [payload: { preset: PhotoSealExportPreset; receipt: PhotoSealExportPresetReceipt }];
  customValidated: [payload: PhotoSealCustomPresetValidationResult];
  customApplied: [payload: PhotoSealCustomPresetValidationReceipt];
}>();

const presets = listPhotoSealExportPresets();
const selectedPresetId = ref("custom");
const customInput = ref<PhotoSealCustomExportPresetInput>({ width: 300, height: 400, targetBytes: 307200 });
const customValidation = ref<PhotoSealCustomPresetValidationResult | null>(null);
const detailsOpen = ref(false);

const customFieldsVisible = computed(() => selectedPresetId.value === "custom");
const selectorLayoutState = computed(() => customFieldsVisible.value ? "custom-open" : "preset-only");
const presetCards = computed<readonly PhotoSealExportPreset[]>(() =>
  presets.map((preset) =>
    preset.id === "custom"
      ? createCustomPhotoSealExportPreset(customInput.value)
      : preset
  )
);

const selectedPreset = computed(() => {
  if (selectedPresetId.value === "custom") {
    return createCustomPhotoSealExportPreset(customInput.value);
  }
  const found = presets.find((preset) => preset.id === selectedPresetId.value);
  if (!found) {
    throw new Error("Preset not found in selector state.");
  }
  return found;
});

const receipt = computed(() =>
  createPhotoSealExportPresetReceipt({ preset: selectedPreset.value, selectedByUser: true })
);

function selectPreset(preset: PhotoSealExportPreset): void {
  selectedPresetId.value = preset.id;
  emit("selected", { preset: selectedPreset.value, receipt: receipt.value });
}

function onCustomValidated(payload: PhotoSealCustomPresetValidationResult): void {
  customValidation.value = payload;
  emit("customValidated", payload);
}

function onCustomApplied(payload: { input: PhotoSealCustomExportPresetInput; receipt: PhotoSealCustomPresetValidationReceipt }): void {
  customInput.value = payload.input;
  selectedPresetId.value = "custom";
  emit("customApplied", payload.receipt);
  emit("selected", { preset: selectedPreset.value, receipt: receipt.value });
}

function onDetailsToggle(event: Event): void {
  detailsOpen.value = (event.target as HTMLDetailsElement).open;
}
</script>

<template>
  <section
    class="export-preset-selector"
    :data-layout-state="selectorLayoutState"
    data-layout-owner="vue3-preset-selector"
    aria-label="출력 프리셋 선택"
  >
    <div class="export-preset-selector__header" data-layout-section="preset-header">
      <div class="section-heading section-heading--inline">
        <span class="section-icon" aria-hidden="true">▦</span>
        <div>
          <p class="step-label">{{ PHOTO_SEAL_KO_COPY.stepPreset }}</p>
          <h2 id="preset-title">{{ PHOTO_SEAL_KO_COPY.presetTitle }}</h2>
        </div>
      </div>
      <p class="section-description">{{ PHOTO_SEAL_KO_COPY.presetDescription }}</p>
    </div>

    <section
      class="export-preset-selector__section export-preset-selector__section--preset-list"
      data-layout-section="preset-card-flow"
      data-mobile-grid-contract="three-columns-two-rows"
      aria-label="출력 프리셋 목록"
    >
      <div class="export-preset-selector__grid">
        <ExportPresetCard
          v-for="preset in presetCards"
          :key="preset.id"
          :preset="preset"
          :selected="preset.id === selectedPresetId"
          @select="selectPreset"
        />
      </div>
    </section>

    <section
      v-if="customFieldsVisible"
      class="export-preset-selector__section export-preset-selector__section--custom"
      data-layout-section="custom-preset-fields-flow"
      aria-label="사용자 지정 출력 크기"
    >
      <CustomPresetFields
        v-model="customInput"
        @validated="onCustomValidated"
        @applied="onCustomApplied"
      />

      <p v-if="customValidation && !customValidation.canApply" class="custom-validation-summary" aria-live="polite">
        {{ PHOTO_SEAL_KO_COPY.customValidationFailed }}
      </p>
    </section>


    <details
      class="technical-details technical-details--compact export-preset-selector__details"
      data-layout-section="preset-receipt-flow"
      @toggle="onDetailsToggle"
    >
      <summary>{{ detailsOpen ? PHOTO_SEAL_KO_COPY.hideDetails : PHOTO_SEAL_KO_COPY.showDetails }} · {{ PHOTO_SEAL_KO_COPY.technicalDetails }}</summary>
      <PresetReceiptBadge :receipt="receipt" />
    </details>
  </section>
</template>
