<script setup lang="ts">
import type { PhotoSealDraftCropBox } from "../../crop/cropBoxTypes";

const props = defineProps<{
  draftCropBox: PhotoSealDraftCropBox;
  active: boolean;
}>();

const emit = defineEmits<{
  "move-start": [event: PointerEvent];
  "resize-start": [payload: { handle: "nw" | "ne" | "sw" | "se"; event: PointerEvent }];
  "keyboard-nudge": [payload: { dx: number; dy: number; resize: boolean; shift: boolean; alt: boolean }];
}>();

function onKeydown(event: KeyboardEvent): void {
  const step = event.shiftKey ? 10 : 1;
  let dx = 0;
  let dy = 0;
  if (event.key === "ArrowLeft") dx = -step;
  if (event.key === "ArrowRight") dx = step;
  if (event.key === "ArrowUp") dy = -step;
  if (event.key === "ArrowDown") dy = step;
  if (dx !== 0 || dy !== 0) {
    event.preventDefault();
    emit("keyboard-nudge", { dx, dy, resize: event.altKey, shift: event.shiftKey, alt: event.altKey });
  }
}
</script>

<template>
  <div
    class="crop-box-overlay"
    :class="{ 'is-active': props.active }"
    tabindex="0"
    role="application"
    aria-label="크롭 박스. 방향키로 이동하고 Alt 방향키로 크기를 조정합니다."
    :style="{
      left: `${props.draftCropBox.rect.x * 100}%`,
      top: `${props.draftCropBox.rect.y * 100}%`,
      width: `${props.draftCropBox.rect.width * 100}%`,
      height: `${props.draftCropBox.rect.height * 100}%`,
    }"
    @pointerdown.stop="emit('move-start', $event)"
    @keydown="onKeydown"
  >
    <span class="crop-box-center" aria-hidden="true" />
    <button type="button" class="crop-handle crop-handle--nw" aria-label="크롭 좌상단 크기 조절" @pointerdown.stop="emit('resize-start', { handle: 'nw', event: $event })" />
    <button type="button" class="crop-handle crop-handle--ne" aria-label="크롭 우상단 크기 조절" @pointerdown.stop="emit('resize-start', { handle: 'ne', event: $event })" />
    <button type="button" class="crop-handle crop-handle--sw" aria-label="크롭 좌하단 크기 조절" @pointerdown.stop="emit('resize-start', { handle: 'sw', event: $event })" />
    <button type="button" class="crop-handle crop-handle--se" aria-label="크롭 우하단 크기 조절" @pointerdown.stop="emit('resize-start', { handle: 'se', event: $event })" />
  </div>
</template>
