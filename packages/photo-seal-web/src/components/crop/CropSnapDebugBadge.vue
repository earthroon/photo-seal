<script setup lang="ts">
import type { CropSnapResult } from "../../crop/cropSnapTypes";

const props = defineProps<{
  snapResult: CropSnapResult | null;
}>();
</script>

<template>
  <p class="crop-snap-badge" aria-live="polite">
    <template v-if="props.snapResult?.snapped">
      스냅 적용 · {{ props.snapResult.snapMode }} · {{ props.snapResult.snapAnchor }}
    </template>
    <template v-else-if="props.snapResult?.snapOverrideUsed">
      Alt override · snap assist off
    </template>
    <template v-else>
      가상 그리드 스냅 대기
    </template>
  </p>
</template>
