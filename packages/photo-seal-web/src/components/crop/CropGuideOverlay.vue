<script setup lang="ts">
import type { CropSnapResult } from "../../crop/cropSnapTypes";
import type { CropVirtualGrid } from "../../crop/cropVirtualGrid";

const props = defineProps<{
  virtualGrid: CropVirtualGrid;
  lastSnapResult: CropSnapResult | null;
  visible: boolean;
}>();
</script>

<template>
  <div v-if="props.visible" class="crop-guide-overlay" aria-hidden="true">
    <span
      v-for="xGuide in props.virtualGrid.xGuides"
      :key="`x-${xGuide}`"
      class="crop-guide-line crop-guide-line--x"
      :class="{ 'is-active': props.lastSnapResult?.snapTarget?.x === xGuide }"
      :style="{ left: `${xGuide * 100}%` }"
    />
    <span
      v-for="yGuide in props.virtualGrid.yGuides"
      :key="`y-${yGuide}`"
      class="crop-guide-line crop-guide-line--y"
      :class="{ 'is-active': props.lastSnapResult?.snapTarget?.y === yGuide }"
      :style="{ top: `${yGuide * 100}%` }"
    />
  </div>
</template>
