<script setup lang="ts">
import type { PhotoSealCustomPresetFieldValidation } from "../../preset/customPresetValidationTypes";

const props = defineProps<{
  field: PhotoSealCustomPresetFieldValidation;
}>();
</script>

<template>
  <p
    class="custom-preset-validation-message"
    :class="`custom-preset-validation-message--${props.field.status}`"
    role="alert"
  >
    {{ props.field.message }}
  </p>
</template>
