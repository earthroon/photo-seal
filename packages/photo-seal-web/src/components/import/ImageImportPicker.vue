<script setup lang="ts">
defineOptions({ name: "ImageImportPicker" });
import { computed, ref } from "vue";
import ImageImportPreviewCanvas from "./ImageImportPreviewCanvas.vue";
import { PHOTO_SEAL_KO_COPY } from "../../ui/photoSealKoCopy";
import { importPhotoSealImageFromFile } from "../../import/browserImageImport";
import type { PhotoSealImportedImageSource } from "../../import/imageImportTypes";
import type { PhotoSealCropReceipt } from "../../crop/cropReceipt";

const props = defineProps<{
  importedImage: PhotoSealImportedImageSource | null;
  cropRequired: boolean;
  cropReceipt: PhotoSealCropReceipt | null;
  selectedPresetLabel: string;
}>();

const emit = defineEmits<{
  imported: [source: PhotoSealImportedImageSource, file: File];
  failed: [message: string];
  "open-crop": [];
}>();

const busy = ref(false);
const errorMessage = ref<string | null>(null);
const dragActive = ref(false);

const importLayoutState = computed(() => props.importedImage ? "preview-ready" : "dropzone-ready");
const cropActionLabel = computed(() => props.cropReceipt ? "크롭 다시 조정" : "크롭 조정");
const previewCropBadgeLabel = computed(() => {
  if (!props.cropRequired) {
    return null;
  }
  return props.cropReceipt ? "크롭 완료" : "크롭 필요";
});

async function importFile(file: File | undefined): Promise<void> {
  errorMessage.value = null;
  if (!file) {
    return;
  }
  busy.value = true;
  try {
    const imported = await importPhotoSealImageFromFile({ file });
    emit("imported", imported, file);
  } catch (error) {
    const message = error instanceof Error ? error.message : PHOTO_SEAL_KO_COPY.imageImportFailed;
    errorMessage.value = message;
    emit("failed", message);
  } finally {
    busy.value = false;
    dragActive.value = false;
  }
}

function handleFileChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  void importFile(input.files?.[0]);
  input.value = "";
}

function handleDrop(event: DragEvent): void {
  event.preventDefault();
  void importFile(event.dataTransfer?.files?.[0]);
}
</script>

<template>
  <section
    class="image-import-picker-shell"
    :data-layout-state="importLayoutState"
    data-layout-owner="vue3-import-picker-r4"
  >
    <section
      v-if="props.importedImage"
      class="image-import-preview-flow"
      data-layout-section="import-webgpu-preview-flow"
      data-preview-containment="vue3-source-aspect-contain"
    >
      <ImageImportPreviewCanvas
        :image-source="props.importedImage"
        :crop-badge-label="previewCropBadgeLabel"
      />

      <div class="image-import-preview-actions" data-layout-owner="vue3-preview-action-row">
        <button type="button" class="secondary-action image-import-crop-button" @click="emit('open-crop')">
          {{ cropActionLabel }}
        </button>

        <label
          class="image-import-replace-picker"
          :class="{ 'image-import-replace-picker--active': dragActive }"
          @dragenter.prevent="dragActive = true"
          @dragover.prevent="dragActive = true"
          @dragleave.prevent="dragActive = false"
          @drop="handleDrop"
        >
          <span>파일 다시 선택</span>
          <input
            class="image-import-picker__input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            :disabled="busy"
            @change="handleFileChange"
          />
        </label>
      </div>

    </section>

    <label
      v-else
      class="image-import-picker"
      :class="{ 'image-import-picker--active': dragActive }"
      @dragenter.prevent="dragActive = true"
      @dragover.prevent="dragActive = true"
      @dragleave.prevent="dragActive = false"
      @drop="handleDrop"
    >
      <span class="image-import-picker__icon" aria-hidden="true">⇧</span>
      <span class="image-import-picker__button">{{ PHOTO_SEAL_KO_COPY.chooseFile }}</span>
      <span class="image-import-picker__hint">{{ PHOTO_SEAL_KO_COPY.dragFile }}</span>
      <input
        class="image-import-picker__input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        :disabled="busy"
        @change="handleFileChange"
      />
    </label>
  </section>

  <p v-if="busy" class="image-import-picker__status">{{ PHOTO_SEAL_KO_COPY.imageDecodeBusy }}</p>
  <p v-if="errorMessage" class="image-import-picker__error">{{ errorMessage }}</p>
</template>
