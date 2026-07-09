<script setup lang="ts">
import { computed, ref, watch } from "vue";
import CustomPresetValidationMessage from "./CustomPresetValidationMessage.vue";
import { PHOTO_SEAL_KO_COPY } from "../../ui/photoSealKoCopy";
import { applyCustomPresetFromValidation } from "../../preset/applyCustomPreset";
import { validateCustomPresetInput } from "../../preset/customPresetValidation";
import type { PhotoSealCustomExportPresetInput } from "../../preset/exportPresetTypes";
import type { PhotoSealCustomPresetValidationReceipt } from "../../preset/customPresetValidationReceipt";
import type { PhotoSealCustomPresetValidationResult } from "../../preset/customPresetValidationTypes";

const props = defineProps<{
  modelValue: PhotoSealCustomExportPresetInput;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: PhotoSealCustomExportPresetInput];
  validated: [value: PhotoSealCustomPresetValidationResult];
  applied: [value: { input: PhotoSealCustomExportPresetInput; receipt: PhotoSealCustomPresetValidationReceipt }];
}>();

const TDT_PHOTOSEAL_CUSTOM_PRESET_HEIGHT_RATIO = 4 / 3;
const TDT_PHOTOSEAL_CUSTOM_TARGET_BYTES_PER_PIXEL = 307200 / (300 * 400);
const TDT_PHOTOSEAL_CUSTOM_TARGET_BYTES_MIN = 10240;
const TDT_PHOTOSEAL_CUSTOM_TARGET_BYTES_MAX = 10485760;

const widthInput = ref(String(props.modelValue.width));

watch(
  () => props.modelValue,
  (next) => {
    widthInput.value = String(next.width);
  }
);

const parsedWidth = computed(() => {
  const normalized = widthInput.value.trim();
  if (!/^[-+]?\d+$/u.test(normalized)) {
    return undefined;
  }
  const value = Number(normalized);
  return Number.isSafeInteger(value) ? value : undefined;
});

const autoHeight = computed(() => {
  if (parsedWidth.value === undefined) {
    return undefined;
  }
  return Math.max(1, Math.round(parsedWidth.value * TDT_PHOTOSEAL_CUSTOM_PRESET_HEIGHT_RATIO));
});

const heightInput = computed(() => (autoHeight.value === undefined ? "" : String(autoHeight.value)));

const targetBytesInput = computed(() => {
  if (parsedWidth.value === undefined || autoHeight.value === undefined) {
    return String(props.modelValue.targetBytes || 307200);
  }
  const estimated = Math.round(parsedWidth.value * autoHeight.value * TDT_PHOTOSEAL_CUSTOM_TARGET_BYTES_PER_PIXEL);
  return String(Math.min(TDT_PHOTOSEAL_CUSTOM_TARGET_BYTES_MAX, Math.max(TDT_PHOTOSEAL_CUSTOM_TARGET_BYTES_MIN, estimated)));
});

const validation = computed(() =>
  validateCustomPresetInput({
    widthInput: widthInput.value,
    heightInput: heightInput.value,
    targetBytesInput: targetBytesInput.value,
    labelInput: "",
  })
);

const widthField = computed(() => validation.value.fields.find((field) => field.fieldId === "width"));
const heightField = computed(() => validation.value.fields.find((field) => field.fieldId === "height"));

const inlineSizeLabel = computed(() => (validation.value.canApply ? `${validation.value.width} × ${validation.value.height} px` : "크기 확인 필요"));

watch(validation, (next) => emit("validated", next), { immediate: true });

function applyCustomPreset(): void {
  const applied = applyCustomPresetFromValidation({ validation: validation.value, userActionObserved: true });
  if (applied.validationReceipt.applyAccepted && validation.value.width !== undefined && validation.value.height !== undefined && validation.value.targetBytes !== undefined) {
    const next = {
      width: validation.value.width,
      height: validation.value.height,
      targetBytes: validation.value.targetBytes,
      label: undefined,
    };
    emit("update:modelValue", next);
    emit("applied", { input: next, receipt: applied.validationReceipt });
  }
}

function resetFields(): void {
  widthInput.value = "300";
}
</script>

<template>
  <fieldset
    class="custom-preset-fields custom-preset-fields--inline-size custom-preset-fields--auto-height"
    aria-describedby="custom-preset-validation-summary"
    data-layout-contract="mobile-two-row-width-driven-auto-height"
    data-auto-height-contract="single-line-width-driven-auto-height"
  >
    <legend>{{ PHOTO_SEAL_KO_COPY.customPreset }}</legend>

    <div class="custom-preset-fields__stack" data-mobile-form-contract="input-result-action-notice-stack">
      <div class="custom-preset-fields__size-row">
        <label class="custom-preset-fields__dimension-field">
          <span>{{ PHOTO_SEAL_KO_COPY.width }}</span>
          <input
            v-model="widthInput"
            type="text"
            inputmode="numeric"
            aria-describedby="custom-preset-width-message"
            :aria-invalid="widthField?.status === 'valid' ? 'false' : 'true'"
          />
        </label>

        <span class="custom-preset-fields__multiply" aria-hidden="true">&times;</span>

        <label class="custom-preset-fields__dimension-field custom-preset-fields__dimension-field--readonly">
          <span>{{ PHOTO_SEAL_KO_COPY.height }}</span>
          <output class="custom-preset-fields__auto-height-output" aria-live="polite">
            {{ heightInput || "-" }}
          </output>
        </label>
      </div>

      <div class="custom-preset-fields__status-row" aria-live="polite">
        {{ inlineSizeLabel }}
      </div>

      <div class="custom-preset-fields__action-row">
        <button type="button" :disabled="!validation.canApply" @click="applyCustomPreset">
          {{ PHOTO_SEAL_KO_COPY.applyCustomPreset }}
        </button>
        <button type="button" @click="resetFields">{{ PHOTO_SEAL_KO_COPY.resetFields }}</button>
      </div>

      <p id="custom-preset-validation-summary" class="custom-preset-fields__compact-notice" aria-live="polite">
        &#45320;&#48708;&#47484; &#51077;&#47141;&#54616;&#47732; 3:4 &#48708;&#50984;&#50640; &#47582;&#52656; &#45458;&#51060;&#44032; &#51088;&#46041; &#44228;&#49328;&#46121;&#45768;&#45796;.
      </p>

      <div class="custom-preset-fields__validation-line">
        <span id="custom-preset-width-message">
          <CustomPresetValidationMessage v-if="widthField && widthField.status !== 'valid'" :field="widthField" />
        </span>
        <span id="custom-preset-height-message">
          <CustomPresetValidationMessage v-if="heightField && heightField.status !== 'valid'" :field="heightField" />
        </span>
      </div>
    </div>
  </fieldset>
</template>
