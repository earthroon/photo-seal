<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import PortraitCropStage from "./PortraitCropStage.vue";
import CropConfirmBar from "./CropConfirmBar.vue";
import CropSnapDebugBadge from "./CropSnapDebugBadge.vue";
import { createInitialPortraitCropBox, reaspectCropBoxToTarget } from "../../crop/cropBoxResolver";
import { assertCropAspectGuard } from "../../crop/cropAspectGuard";
import { assertCropBoundsGuard } from "../../crop/cropBoundsGuard";
import { buildPhotoSealCropReceipt, type PhotoSealCropReceipt } from "../../crop/cropReceipt";
import { PHOTO_SEAL_QUARTER_VIRTUAL_GRID } from "../../crop/cropVirtualGrid";
import { DEFAULT_CROP_SNAP_POLICY } from "../../crop/cropSnapTypes";
import type { CropSnapResult } from "../../crop/cropSnapTypes";
import type { PhotoSealDraftCropBox, SourceImageSize } from "../../crop/cropBoxTypes";
import type { PhotoSealImportedImageSource } from "../../import/imageImportTypes";
import type { PhotoSealExportPreset } from "../../preset/exportPresetTypes";

type PhotoSealViewportLayout = "mobile" | "tablet" | "desktop-1080-fit" | "desktop-relaxed";
type PhotoSealDesktopFit = "1920x1080" | "off";

const props = defineProps<{
  open: boolean;
  imageSource: PhotoSealImportedImageSource | null;
  imageFile: File | null;
  selectedPreset: PhotoSealExportPreset;
  initialCropReceipt: PhotoSealCropReceipt | null;
  viewportLayout: PhotoSealViewportLayout;
  desktopFit: PhotoSealDesktopFit;
}>();

const emit = defineEmits<{
  close: [];
  "crop-confirmed": [receipt: PhotoSealCropReceipt];
  "crop-reset": [];
}>();

const draftCropBox = ref<PhotoSealDraftCropBox | null>(null);
const lastSnapResult = ref<CropSnapResult | null>(null);
const cropError = ref<string | null>(null);
const snapEnabled = ref(true);
const objectUrl = ref<string | null>(null);

const sourceImageSize = computed<SourceImageSize | null>(() => {
  if (!props.imageSource) return null;
  return { widthPx: props.imageSource.width, heightPx: props.imageSource.height };
});

function revokeObjectUrl(): void {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = null;
  }
}

function resetDraft(): void {
  if (!sourceImageSize.value) return;
  const base = createInitialPortraitCropBox({
    sourceImageSize: sourceImageSize.value,
    targetOutputSize: { widthPx: props.selectedPreset.width, heightPx: props.selectedPreset.height },
  });
  draftCropBox.value = props.initialCropReceipt
    ? reaspectCropBoxToTarget({ cropBox: { ...base, rect: props.initialCropReceipt.cropRectNormalized }, targetOutputSize: { widthPx: props.selectedPreset.width, heightPx: props.selectedPreset.height } })
    : base;
  lastSnapResult.value = null;
  cropError.value = null;
}

watch(
  () => [props.open, props.imageFile, props.selectedPreset.id] as const,
  () => {
    if (!props.open) return;
    revokeObjectUrl();
    if (props.imageFile) objectUrl.value = URL.createObjectURL(props.imageFile);
    resetDraft();
  },
  { immediate: true }
);

onBeforeUnmount(revokeObjectUrl);

const aspectGuardPassed = computed(() => {
  if (!draftCropBox.value) return false;
  return assertCropAspectGuard({ cropBox: draftCropBox.value, targetWidth: props.selectedPreset.width, targetHeight: props.selectedPreset.height }).ok;
});

const boundsGuardPassed = computed(() => {
  if (!draftCropBox.value) return false;
  return assertCropBoundsGuard(draftCropBox.value).ok;
});

const canConfirm = computed(() => Boolean(draftCropBox.value && aspectGuardPassed.value && boundsGuardPassed.value));

function onDraftChange(payload: { cropBox: PhotoSealDraftCropBox; snapResult: CropSnapResult | null }): void {
  draftCropBox.value = payload.cropBox;
  lastSnapResult.value = payload.snapResult;
  cropError.value = null;
}

function confirmCrop(): void {
  if (!draftCropBox.value) return;
  try {
    const receipt = buildPhotoSealCropReceipt({
      cropBox: { ...draftCropBox.value, cropOwner: "user", cropConfirmed: true },
      cropRequired: props.selectedPreset.cropRequired,
      snapResult: lastSnapResult.value,
      snapEnabled: snapEnabled.value,
      snapThresholdScreenPx: DEFAULT_CROP_SNAP_POLICY.snapScreenPx,
    });
    emit("crop-confirmed", receipt);
    emit("close");
  } catch (error) {
    cropError.value = error instanceof Error ? error.message : "크롭 적용에 실패했습니다.";
  }
}

function resetCrop(): void {
  resetDraft();
  emit("crop-reset");
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.open"
      class="portrait-crop-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="portrait-crop-title"
      :data-viewport-layout="props.viewportLayout"
      :data-desktop-fit="props.desktopFit"
    >
      <div class="portrait-crop-modal__backdrop" @click="emit('close')" />
      <section class="portrait-crop-modal__panel">
        <header class="portrait-crop-modal__header">
          <div>
            <p class="step-label">TDT-PHOTOSEAL-13-H3-R8</p>
            <h2 id="portrait-crop-title">크롭 조정</h2>
            <p>이미지에 매핑된 가상 사분 그리드에 맞춰 크롭 박스를 조정하세요. 제출 전 기관 요구사항은 별도로 확인하세요.</p>
          </div>
          <button type="button" class="secondary-action" @click="emit('close')">닫기</button>
        </header>

        <PortraitCropStage
          v-if="draftCropBox && objectUrl && sourceImageSize"
          :image-url="objectUrl"
          :source-image-size="sourceImageSize"
          :draft-crop-box="draftCropBox"
          :virtual-grid="PHOTO_SEAL_QUARTER_VIRTUAL_GRID"
          :snap-policy="{ ...DEFAULT_CROP_SNAP_POLICY, enabled: snapEnabled }"
          :last-snap-result="lastSnapResult"
          @draft-change="onDraftChange"
        />
        <p v-else class="workspace-error">크롭할 이미지를 먼저 불러오세요.</p>

        <div class="portrait-crop-modal__footer-stack">
          <CropSnapDebugBadge :snap-result="lastSnapResult" />
          <p v-if="cropError" class="workspace-error" role="alert">{{ cropError }}</p>

          <CropConfirmBar
            :can-confirm="canConfirm"
            :aspect-guard-passed="aspectGuardPassed"
            :bounds-guard-passed="boundsGuardPassed"
            :snap-enabled="snapEnabled"
            @toggle-snap="snapEnabled = $event"
            @reset="resetCrop"
            @cancel="emit('close')"
            @confirm="confirmCrop"
          />
        </div>
      </section>
    </div>
  </Teleport>
</template>
