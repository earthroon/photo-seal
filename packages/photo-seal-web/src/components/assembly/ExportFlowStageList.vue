<script setup lang="ts">
import type { PhotoSealExportFlowStageState } from "../../assembly/exportFlowAssemblyTypes";
import ExportFlowReceiptBadge from "./ExportFlowReceiptBadge.vue";

defineProps<{
  stages: PhotoSealExportFlowStageState[];
}>();
</script>

<template>
  <ol class="export-flow-stage-list" aria-label="Export flow stage list">
    <li v-for="stage in stages" :key="stage.id" :data-stage-status="stage.status">
      <strong>{{ stage.label }}</strong>
      <span>{{ stage.status }}</span>
      <ExportFlowReceiptBadge :label="stage.label" :present="stage.receiptPresent" />
    </li>
  </ol>
</template>
