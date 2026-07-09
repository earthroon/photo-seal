<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import CropBoxOverlay from "./CropBoxOverlay.vue";
import CropGuideOverlay from "./CropGuideOverlay.vue";
import CropImageViewport from "./CropImageViewport.vue";
import { clampNormalizedRect } from "../../crop/cropBoxResolver";
import { resolveCropSnap } from "../../crop/cropSnapResolver";
import type { PhotoSealDraftCropBox, NormalizedRect, SourceImageSize } from "../../crop/cropBoxTypes";
import type { CropSnapPolicy, CropSnapResult } from "../../crop/cropSnapTypes";
import type { CropVirtualGrid } from "../../crop/cropVirtualGrid";

const props = defineProps<{
  imageUrl: string;
  sourceImageSize: SourceImageSize;
  draftCropBox: PhotoSealDraftCropBox;
  virtualGrid: CropVirtualGrid;
  snapPolicy: CropSnapPolicy;
  lastSnapResult: CropSnapResult | null;
}>();

const emit = defineEmits<{
  "draft-change": [payload: { cropBox: PhotoSealDraftCropBox; snapResult: CropSnapResult | null }];
  "interaction-start": [];
  "interaction-end": [];
}>();

const stageEl = ref<HTMLElement | null>(null);
const frameEl = ref<HTMLElement | null>(null);
const stageSize = ref({ width: 0, height: 0 });
let stageResizeObserver: ResizeObserver | null = null;
const dragging = ref<null | {
  mode: "move" | "resize-nw" | "resize-ne" | "resize-sw" | "resize-se";
  startX: number;
  startY: number;
  startRect: NormalizedRect;
}>(null);

const targetAspectForNormalizedImage = computed(() => {
  const imageAspect = props.sourceImageSize.widthPx / props.sourceImageSize.heightPx;
  return props.draftCropBox.targetAspectRatio / imageAspect;
});

const sourceAspect = computed(() => props.sourceImageSize.widthPx / props.sourceImageSize.heightPx);

const frameFitStyle = computed(() => {
  const aspect = sourceAspect.value;
  const width = stageSize.value.width;
  const height = stageSize.value.height;
  if (width <= 0 || height <= 0) {
    return {
      aspectRatio: `${props.sourceImageSize.widthPx} / ${props.sourceImageSize.heightPx}`,
      width: "100%",
      height: "auto",
      "--source-aspect": String(aspect),
    };
  }
  const fitWidth = Math.min(width, height * aspect);
  const fitHeight = fitWidth / aspect;
  return {
    aspectRatio: `${props.sourceImageSize.widthPx} / ${props.sourceImageSize.heightPx}`,
    width: `${Math.max(1, Math.floor(fitWidth))}px`,
    height: `${Math.max(1, Math.floor(fitHeight))}px`,
    "--source-aspect": String(aspect),
  };
});

function refreshStageSize(): void {
  const rect = stageEl.value?.getBoundingClientRect();
  if (!rect) return;
  stageSize.value = { width: rect.width, height: rect.height };
}

onMounted(() => {
  void nextTick(() => {
    refreshStageSize();
    if (!stageEl.value) return;
    stageResizeObserver = new ResizeObserver(() => refreshStageSize());
    stageResizeObserver.observe(stageEl.value);
  });
});

onBeforeUnmount(() => {
  stageResizeObserver?.disconnect();
  stageResizeObserver = null;
});

watch(() => props.sourceImageSize, () => refreshStageSize(), { deep: true });

function getImageDisplayRect(): { x: number; y: number; width: number; height: number } {
  const rect = frameEl.value?.getBoundingClientRect() ?? stageEl.value?.getBoundingClientRect();
  if (!rect) return { x: 0, y: 0, width: 1, height: 1 };
  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
}

function toNormalizedDelta(event: PointerEvent): { dx: number; dy: number } {
  const imageRect = getImageDisplayRect();
  const state = dragging.value;
  if (!state) return { dx: 0, dy: 0 };
  return {
    dx: (event.clientX - state.startX) / Math.max(1, imageRect.width),
    dy: (event.clientY - state.startY) / Math.max(1, imageRect.height),
  };
}

function makeDraft(rect: NormalizedRect): PhotoSealDraftCropBox {
  return {
    ...props.draftCropBox,
    rect: clampNormalizedRect(rect),
    cropOwner: "user",
    cropConfirmed: false,
  };
}

function applyMove(event: PointerEvent): void {
  const state = dragging.value;
  if (!state) return;
  const { dx, dy } = toNormalizedDelta(event);
  let next = makeDraft({ ...state.startRect, x: state.startRect.x + dx, y: state.startRect.y + dy });
  const snapResult = resolveCropSnap({
    draftCropBox: next,
    virtualGrid: props.virtualGrid,
    viewportSize: { widthPx: window.innerWidth, heightPx: window.innerHeight },
    imageDisplayRect: getImageDisplayRect(),
    modifierState: { altKey: event.altKey, shiftKey: event.shiftKey },
    policy: props.snapPolicy,
  });
  next = { ...snapResult.nextCropBox, cropConfirmed: false } as PhotoSealDraftCropBox;
  emit("draft-change", { cropBox: next, snapResult });
}

function applyResize(event: PointerEvent): void {
  const state = dragging.value;
  if (!state) return;
  const { dx, dy } = toNormalizedDelta(event);
  const aspect = targetAspectForNormalizedImage.value;
  let left = state.startRect.x;
  let right = state.startRect.x + state.startRect.width;
  let top = state.startRect.y;
  let bottom = state.startRect.y + state.startRect.height;
  if (state.mode.includes("e")) right = Math.max(left + 0.04, right + dx);
  if (state.mode.includes("w")) left = Math.min(right - 0.04, left + dx);
  if (state.mode.includes("s")) bottom = Math.max(top + 0.04, bottom + dy);
  if (state.mode.includes("n")) top = Math.min(bottom - 0.04, top + dy);
  let width = right - left;
  let height = width / aspect;
  if (state.mode.includes("n")) top = bottom - height;
  else bottom = top + height;
  if (top < 0) {
    top = 0;
    bottom = height;
  }
  if (bottom > 1) {
    bottom = 1;
    top = bottom - height;
  }
  if (left < 0) {
    left = 0;
    right = width;
  }
  if (right > 1) {
    right = 1;
    left = right - width;
  }
  const next = makeDraft({ x: left, y: top, width: Math.max(0.04, right - left), height: Math.max(0.04, bottom - top) });
  emit("draft-change", { cropBox: next, snapResult: null });
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value) return;
  if (dragging.value.mode === "move") applyMove(event);
  else applyResize(event);
}

function onPointerUp(): void {
  if (!dragging.value) return;
  dragging.value = null;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  emit("interaction-end");
}

function beginDrag(mode: "move" | "resize-nw" | "resize-ne" | "resize-sw" | "resize-se", event: PointerEvent): void {
  (event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
  dragging.value = { mode, startX: event.clientX, startY: event.clientY, startRect: { ...props.draftCropBox.rect } };
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  emit("interaction-start");
}


function onResizeStart(payload: { handle: "nw" | "ne" | "sw" | "se"; event: PointerEvent }): void {
  beginDrag(`resize-${payload.handle}` as "resize-nw" | "resize-ne" | "resize-sw" | "resize-se", payload.event);
}

function onKeyboardNudge(payload: { dx: number; dy: number; resize: boolean; shift: boolean; alt: boolean }): void {
  const imageRect = getImageDisplayRect();
  const dx = payload.dx / Math.max(1, imageRect.width);
  const dy = payload.dy / Math.max(1, imageRect.height);
  if (payload.resize) {
    const aspect = targetAspectForNormalizedImage.value;
    const nextWidth = Math.max(0.04, props.draftCropBox.rect.width + dx);
    const nextHeight = nextWidth / aspect;
    emit("draft-change", { cropBox: makeDraft({ ...props.draftCropBox.rect, width: nextWidth, height: nextHeight }), snapResult: null });
    return;
  }
  const next = makeDraft({ ...props.draftCropBox.rect, x: props.draftCropBox.rect.x + dx, y: props.draftCropBox.rect.y + dy });
  emit("draft-change", { cropBox: next, snapResult: null });
}
</script>

<template>
  <div ref="stageEl" class="portrait-crop-stage">
    <div
      ref="frameEl"
      class="portrait-crop-image-frame"
      data-crop-frame-contract="resize-observer-contain-preserve-aspect"
      :style="frameFitStyle"
    >
      <CropImageViewport :image-url="props.imageUrl" />
      <CropGuideOverlay :virtual-grid="props.virtualGrid" :last-snap-result="props.lastSnapResult" :visible="true" />
      <CropBoxOverlay
        :draft-crop-box="props.draftCropBox"
        :active="Boolean(dragging)"
        @move-start="beginDrag('move', $event)"
        @resize-start="onResizeStart"
        @keyboard-nudge="onKeyboardNudge"
      />
    </div>
  </div>
</template>
