<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import ImageImportPicker from "./components/import/ImageImportPicker.vue";
import ImageImportReceiptBadge from "./components/import/ImageImportReceiptBadge.vue";
import ExportPresetSelector from "./components/preset/ExportPresetSelector.vue";
import ExportFlowActions from "./components/assembly/ExportFlowActions.vue";
import PortraitCropModal from "./components/crop/PortraitCropModal.vue";
import { getPhotoSealExportPreset, createPhotoSealExportPresetReceipt } from "./preset/exportPresetResolver";
import { savePhotoSealJpeg } from "./export/saveJpeg";
import { runPhotoSealExportHappyPath } from "./assembly/photoSealExportFlow";
import { getPhotoSealExportReadiness } from "./ui/exportReadiness";
import { PHOTO_SEAL_KO_COPY, PHOTO_SEAL_LAYOUT_SSOT, formatPhotoSealBytes } from "./ui/photoSealKoCopy";
import type { PhotoSealImportedImageSource } from "./import/imageImportTypes";
import type { PhotoSealExportPreset } from "./preset/exportPresetTypes";
import type { PhotoSealExportPresetReceipt } from "./preset/exportPresetReceipt";
import type { PhotoSealExportFlowAssemblyResult } from "./assembly/exportFlowAssemblyResult";
import type { PhotoSealCropReceipt } from "./crop/cropReceipt";

const importedImage = shallowRef<PhotoSealImportedImageSource | null>(null);
const selectedFile = shallowRef<File | null>(null);
const importErrorMessage = ref<string | null>(null);
const selectedPreset = shallowRef<PhotoSealExportPreset>(getPhotoSealExportPreset("custom"));
const presetReceipt = shallowRef<PhotoSealExportPresetReceipt>(
  createPhotoSealExportPresetReceipt({ preset: selectedPreset.value, selectedByUser: true })
);

const exportRunning = ref(false);
const exportResult = shallowRef<PhotoSealExportFlowAssemblyResult | null>(null);
const exportErrorMessage = ref<string | null>(null);
const cropReceipt = shallowRef<PhotoSealCropReceipt | null>(null);
const cropModalOpen = ref(false);

const layoutSsotWidth = PHOTO_SEAL_LAYOUT_SSOT.layoutSsotWidth;
const layoutSsotHeight = PHOTO_SEAL_LAYOUT_SSOT.layoutSsotHeight;

type PhotoSealViewportLayout = "mobile" | "tablet" | "desktop-1080-fit" | "desktop-relaxed";

const viewportSize = ref({
  width: typeof window === "undefined" ? 1920 : window.innerWidth,
  height: typeof window === "undefined" ? 1080 : window.innerHeight,
});

function syncViewportSize(): void {
  if (typeof window === "undefined") {
    return;
  }
  viewportSize.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

onMounted(() => {
  syncViewportSize();
  window.addEventListener("resize", syncViewportSize, { passive: true });
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", syncViewportSize);
  }
});

const viewportLayout = computed<PhotoSealViewportLayout>(() => {
  const { width, height } = viewportSize.value;

  if (width < 768) {
    return "mobile";
  }

  if (width < 1280) {
    return "tablet";
  }

  if (width >= 1280 && height <= 1120) {
    return "desktop-1080-fit";
  }

  return "desktop-relaxed";
});

const isDesktop1080Fit = computed(() => viewportLayout.value === "desktop-1080-fit");

const importStatusLabel = computed(() => {
  if (importErrorMessage.value) {
    return PHOTO_SEAL_KO_COPY.imageImportFailed;
  }
  if (importedImage.value) {
    return PHOTO_SEAL_KO_COPY.imageImported;
  }
  return PHOTO_SEAL_KO_COPY.imageNotImported;
});

const readiness = computed(() =>
  getPhotoSealExportReadiness({
    importReceiptPresent: Boolean(importedImage.value?.receipt),
    presetReceiptPresent: Boolean(presetReceipt.value),
    cropRequired: presetReceipt.value?.cropRequired === true,
    cropReceiptPresent: Boolean(cropReceipt.value?.cropConfirmed),
    exportRunning: exportRunning.value,
    exported: exportResult.value?.status === "exported",
    failed: Boolean(exportErrorMessage.value),
  })
);


const resizePolicyInfo = computed(() => {
  const receipt = exportResult.value?.resizeReceipt as any;
  if (!receipt?.h3r6Policy) {
    return null;
  }
  const deltaKTangentPolicy = receipt.deltaKTangentPolicy ?? receipt.h3r7Policy ?? null;
  return {
    mode: receipt.h3r6Policy.antiRingingMode === "strict-lowpass-authority"
      ? "고배율 축소 안전 모드"
      : receipt.h3r6Policy.antiRingingMode === "strict"
        ? "인물 사진 안전 모드"
        : "일반 축소 모드",
    authority: receipt.h3r6Policy.resizeAuthority === "lowpass" ? "lowpass authority" : "recompose",
    antiRinging: receipt.h3r6Policy.antiRingingMode,
    recompose: receipt.h3r6Policy.recomposeEnabled ? "사용" : "사용 안 함",
    deltaKTangent: deltaKTangentPolicy?.enabled ? "사용" : "조건 미달로 사용 안 함",
    normalRecovery: deltaKTangentPolicy?.normalOvershootRecoveryAllowed === false ? "차단" : "차단 필요",
    tangentDetail: deltaKTangentPolicy?.enabled ? `약함 ${Number(deltaKTangentPolicy.tangentDetailStrength ?? 0).toFixed(2)}` : "없음",
    haloClamp: deltaKTangentPolicy?.haloClampMode ?? "disabled",
    filterRadiusScale: Number(receipt.h3r6Policy.filterRadiusScale ?? 1).toFixed(2),
    scaleRatio: `${Number(receipt.h3r6Policy.scaleRatioX ?? 1).toFixed(2)} × ${Number(receipt.h3r6Policy.scaleRatioY ?? 1).toFixed(2)}`,
  };
});

const exportSummary = computed(() => {
  const result = exportResult.value;
  if (!result) {
    return PHOTO_SEAL_KO_COPY.noResultYet;
  }
  if (result.status === "exported") {
    return PHOTO_SEAL_KO_COPY.exportCompleted;
  }
  return PHOTO_SEAL_KO_COPY.exportBlockedByAssembly;
});

const cropStatusLabel = computed(() => {
  if (!selectedPreset.value.cropRequired) {
    return PHOTO_SEAL_KO_COPY.cropNotRequired;
  }
  if (cropReceipt.value?.cropConfirmed) {
    return "크롭 적용됨";
  }
  return "크롭 확인 필요";
});

function openCropModal(): void {
  if (!importedImage.value || !selectedFile.value) {
    exportErrorMessage.value = "크롭을 조정하려면 이미지를 먼저 불러오세요.";
    return;
  }
  cropModalOpen.value = true;
}

function handleCropConfirmed(receipt: PhotoSealCropReceipt): void {
  cropReceipt.value = receipt;
  presetReceipt.value = createPhotoSealExportPresetReceipt({
    preset: selectedPreset.value,
    selectedByUser: true,
    cropReceiptPresent: true,
  });
  exportErrorMessage.value = null;
  exportResult.value = null;
}

function handleImported(source: PhotoSealImportedImageSource, file: File): void {
  importedImage.value = source;
  selectedFile.value = file;
  importErrorMessage.value = null;
  exportErrorMessage.value = null;
  exportResult.value = null;
  cropReceipt.value = null;
  cropModalOpen.value = false;
}

function handleImportFailed(message: string): void {
  importErrorMessage.value = message;
  importedImage.value = null;
  selectedFile.value = null;
  cropReceipt.value = null;
  cropModalOpen.value = false;
}

function handlePresetSelected(payload: {
  preset: PhotoSealExportPreset;
  receipt: PhotoSealExportPresetReceipt;
}): void {
  selectedPreset.value = payload.preset;
  cropReceipt.value = null;
  presetReceipt.value = createPhotoSealExportPresetReceipt({ preset: payload.preset, selectedByUser: true, cropReceiptPresent: false });
  exportErrorMessage.value = null;
  exportResult.value = null;
  cropModalOpen.value = false;
}

async function handleRunExport(): Promise<void> {
  if (!readiness.value.canRunExport || !selectedFile.value) {
    exportErrorMessage.value = readiness.value.message;
    return;
  }
  if (!navigator.gpu) {
    exportErrorMessage.value = "이 브라우저에서 WebGPU를 사용할 수 없습니다.";
    return;
  }
  exportRunning.value = true;
  exportErrorMessage.value = null;
  try {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!device) {
      exportErrorMessage.value = "WebGPU 장치를 열지 못했습니다.";
      return;
    }
    const result = await runPhotoSealExportHappyPath({
      file: selectedFile.value,
      presetId: selectedPreset.value.id,
      customPreset: selectedPreset.value.kind === "custom"
        ? {
            width: selectedPreset.value.width,
            height: selectedPreset.value.height,
            targetBytes: selectedPreset.value.targetBytes,
            label: selectedPreset.value.label,
          }
        : undefined,
      device,
      cropReceipt: cropReceipt.value,
      saveAfterExport: false,
      userActionObservedForSave: false,
    });
    exportResult.value = result;
    if (result.status !== "exported") {
      exportErrorMessage.value = PHOTO_SEAL_KO_COPY.exportBlockedByAssembly;
    }
  } catch (error) {
    exportErrorMessage.value = error instanceof Error ? error.message : PHOTO_SEAL_KO_COPY.exportFailed;
  } finally {
    exportRunning.value = false;
  }
}

async function handleDownloadJpeg(): Promise<void> {
  const result = exportResult.value;
  if (!result?.jpg || !result.auditSummary) {
    exportErrorMessage.value = "다운로드 가능한 JPEG 결과가 없습니다. 먼저 JPEG 내보내기를 실행하세요.";
    return;
  }

  const saveReceipt = await savePhotoSealJpeg({
    jpg: result.jpg,
    auditSummary: result.auditSummary,
    sourceFileName: selectedFile.value?.name,
    userActionObserved: true,
  });
  exportResult.value = { ...result, saveReceipt };
  exportErrorMessage.value = saveReceipt.saveStatus === "saved"
    ? null
    : `JPEG 다운로드 실패: ${saveReceipt.saveReason}`;
}


</script>

<template>
  <main
    class="photo-seal-shell"
    :data-layout-width="layoutSsotWidth"
    :data-layout-height="layoutSsotHeight"
    :data-viewport-layout="viewportLayout"
    :data-desktop-fit="isDesktop1080Fit ? '1920x1080' : 'off'"
  >
    <header class="photo-seal-header" aria-labelledby="photo-seal-title">
      <div class="brand-lockup" aria-hidden="true">
        <span class="brand-mark">▣</span>
      </div>
      <div class="brand-copy">
        <div class="brand-title-row">
          <h1 id="photo-seal-title">{{ PHOTO_SEAL_KO_COPY.appTitle }}</h1>
        </div>
        <p>{{ PHOTO_SEAL_KO_COPY.appSubtitle }}</p>
      </div>
    </header>

    <section class="photo-seal-workspace" aria-label="PhotoSeal 작업 화면">
      <section class="workspace-card primary-flow-panel" aria-label="이미지 불러오기 및 출력 프리셋" data-layout-owner="vue3-two-column-primary-r8-r8">
        <section class="embedded-step-panel image-input-panel" aria-labelledby="image-input-title">
        <div class="section-heading section-heading--inline">
          <span class="section-icon" aria-hidden="true">▧</span>
          <div>
            <p class="step-label">{{ PHOTO_SEAL_KO_COPY.stepImageInput }}</p>
            <h2 id="image-input-title">{{ PHOTO_SEAL_KO_COPY.imageInputTitle }}</h2>
          </div>
        </div>
        <ImageImportPicker
          :imported-image="importedImage"
          :crop-required="selectedPreset.cropRequired"
          :crop-receipt="cropReceipt"
          :selected-preset-label="selectedPreset.label"
          @imported="handleImported"
          @failed="handleImportFailed"
          @open-crop="openCropModal"
        />

        <p
          v-if="!importedImage || importErrorMessage"
          class="workspace-status"
          :data-status="importedImage ? 'pass' : importErrorMessage ? 'fail' : 'idle'"
          aria-live="polite"
        >
          {{ importStatusLabel }}
        </p>

        <details
          v-if="importedImage"
          class="image-import-compact-details"
          data-layout-owner="vue3-import-meta-collapsed-r4"
        >
          <summary>
            <span>{{ importStatusLabel }}</span>
            <strong>{{ importedImage.width }} × {{ importedImage.height }} px</strong>
          </summary>
          <dl class="info-grid image-meta-grid image-meta-grid--compact">
            <div>
              <dt>{{ PHOTO_SEAL_KO_COPY.fileName }}</dt>
              <dd>{{ importedImage.fileName ?? 'Blob source' }}</dd>
            </div>
            <div>
              <dt>{{ PHOTO_SEAL_KO_COPY.fileType }}</dt>
              <dd>{{ importedImage.mimeType }}</dd>
            </div>
            <div>
              <dt>{{ PHOTO_SEAL_KO_COPY.decodedSize }}</dt>
              <dd>{{ importedImage.width }} × {{ importedImage.height }}</dd>
            </div>
            <div>
              <dt>{{ PHOTO_SEAL_KO_COPY.colorSpace }}</dt>
              <dd>sRGB</dd>
            </div>
          </dl>
          <ImageImportReceiptBadge :receipt="importedImage?.receipt" />
        </details>

        <p v-if="importErrorMessage" class="workspace-error" role="alert">
          {{ importErrorMessage }}
        </p>
        </section>


        <section class="embedded-step-panel preset-panel" aria-labelledby="preset-title" data-layout-owner="vue3-preset-panel">
        <ExportPresetSelector id="preset-title" @selected="handlePresetSelected" />
        </section>


      </section>

      <aside class="workspace-card export-panel" aria-labelledby="export-title" data-layout-owner="vue3-two-column-export-r8-r8">
        <div class="section-heading section-heading--inline">
          <span class="section-icon" aria-hidden="true">⇩</span>
          <div>
            <p class="step-label">{{ PHOTO_SEAL_KO_COPY.stepExport }}</p>
            <h2 id="export-title">{{ PHOTO_SEAL_KO_COPY.exportTitle }}</h2>
          </div>
        </div>
        <section class="readiness-card" :data-status="readiness.status" aria-live="polite">
          <strong>{{ readiness.title }}</strong>
          <ul v-if="readiness.blockers.length > 0">
            <li v-for="blocker in readiness.blockers" :key="blocker">{{ blocker }}</li>
          </ul>
          <p v-else>{{ PHOTO_SEAL_KO_COPY.exportReadyMessage }}</p>
        </section>

        <dl class="export-summary-list">
          <div>
            <dt>{{ PHOTO_SEAL_KO_COPY.selectedPreset }}</dt>
            <dd>{{ selectedPreset.label }}</dd>
          </div>
          <div>
            <dt>출력 크기</dt>
            <dd>{{ selectedPreset.width }} × {{ selectedPreset.height }} px</dd>
          </div>
          <div>
            <dt>{{ PHOTO_SEAL_KO_COPY.targetBytes }}</dt>
            <dd>{{ formatPhotoSealBytes(selectedPreset.targetBytes) }}</dd>
          </div>
          <div>
            <dt>{{ PHOTO_SEAL_KO_COPY.cropState }}</dt>
            <dd>{{ cropStatusLabel }}</dd>
          </div>
        </dl>


        <ExportFlowActions
          :can-run-export="readiness.canRunExport"
          :can-download-jpeg="Boolean(exportResult?.jpg)"
          @run-export="handleRunExport"
          @download-jpeg="handleDownloadJpeg"
        />

        <section class="result-panel" aria-label="출력 결과">
          <h3>{{ PHOTO_SEAL_KO_COPY.resultTitle }}</h3>
          <p>{{ exportSummary }}</p>
          <dl v-if="exportResult?.assemblyReceipt" class="result-metrics">
            <div>
              <dt>{{ PHOTO_SEAL_KO_COPY.outputResolution }}</dt>
              <dd>{{ exportResult.assemblyReceipt.resizeWidth }} × {{ exportResult.assemblyReceipt.resizeHeight }} px</dd>
            </div>
            <div>
              <dt>{{ PHOTO_SEAL_KO_COPY.outputSize }}</dt>
              <dd>{{ exportResult.assemblyReceipt.outputBytes ? formatPhotoSealBytes(exportResult.assemblyReceipt.outputBytes) : '-' }}</dd>
            </div>
          </dl>
          <dl v-if="resizePolicyInfo && !isDesktop1080Fit" class="result-metrics resize-policy-metrics">
            <div>
              <dt>축소 정책</dt>
              <dd>{{ resizePolicyInfo.mode }}</dd>
            </div>
            <div>
              <dt>출력 권한</dt>
              <dd>{{ resizePolicyInfo.authority }}</dd>
            </div>
            <div>
              <dt>anti-ringing</dt>
              <dd>{{ resizePolicyInfo.antiRinging }}</dd>
            </div>
            <div>
              <dt>선명도 복원</dt>
              <dd>{{ resizePolicyInfo.recompose }}</dd>
            </div>
            <div>
              <dt>ΔK 탄젠트 보간</dt>
              <dd>{{ resizePolicyInfo.deltaKTangent }}</dd>
            </div>
            <div>
              <dt>normal 방향 복구</dt>
              <dd>{{ resizePolicyInfo.normalRecovery }}</dd>
            </div>
            <div>
              <dt>tangent 디테일 복구</dt>
              <dd>{{ resizePolicyInfo.tangentDetail }}</dd>
            </div>
            <div>
              <dt>halo clamp</dt>
              <dd>{{ resizePolicyInfo.haloClamp }}</dd>
            </div>
          </dl>
          <details
            v-if="resizePolicyInfo && isDesktop1080Fit"
            class="resize-policy-details"
            data-layout-contract="desktop-1080-fit-collapsed-resize-policy"
          >
            <summary>축소 정책 세부 정보</summary>
            <dl class="result-metrics resize-policy-metrics resize-policy-metrics--collapsed">
              <div>
                <dt>축소 정책</dt>
                <dd>{{ resizePolicyInfo.mode }}</dd>
              </div>
              <div>
                <dt>출력 권한</dt>
                <dd>{{ resizePolicyInfo.authority }}</dd>
              </div>
              <div>
                <dt>anti-ringing</dt>
                <dd>{{ resizePolicyInfo.antiRinging }}</dd>
              </div>
              <div>
                <dt>선명도 복원</dt>
                <dd>{{ resizePolicyInfo.recompose }}</dd>
              </div>
              <div>
                <dt>ΔK 탄젠트 보간</dt>
                <dd>{{ resizePolicyInfo.deltaKTangent }}</dd>
              </div>
              <div>
                <dt>normal 방향 복구</dt>
                <dd>{{ resizePolicyInfo.normalRecovery }}</dd>
              </div>
              <div>
                <dt>tangent 디테일 복구</dt>
                <dd>{{ resizePolicyInfo.tangentDetail }}</dd>
              </div>
              <div>
                <dt>halo clamp</dt>
                <dd>{{ resizePolicyInfo.haloClamp }}</dd>
              </div>
            </dl>
          </details>
          <p v-if="exportErrorMessage" class="workspace-error" role="alert">{{ exportErrorMessage }}</p>
        </section>


      </aside>
    </section>

    <PortraitCropModal
      :open="cropModalOpen"
      :image-source="importedImage"
      :image-file="selectedFile"
      :selected-preset="selectedPreset"
      :initial-crop-receipt="cropReceipt"
      :viewport-layout="viewportLayout"
      :desktop-fit="isDesktop1080Fit ? '1920x1080' : 'off'"
      @close="cropModalOpen = false"
      @crop-confirmed="handleCropConfirmed"
      @crop-reset="cropReceipt = null"
    />

    <footer class="photo-seal-footer">© TDT PhotoSeal. All rights reserved.</footer>
  </main>
</template>
