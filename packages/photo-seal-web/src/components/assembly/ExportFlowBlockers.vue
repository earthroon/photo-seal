<script setup lang="ts">
import type { PhotoSealExportFlowBlockerCode, PhotoSealExportFlowWarningCode } from "../../assembly/exportFlowAssemblyTypes";

defineProps<{
  blockers: PhotoSealExportFlowBlockerCode[];
  warnings: PhotoSealExportFlowWarningCode[];
}>();
</script>

<template>
  <section class="export-flow-blockers" aria-label="Export flow blockers and warnings">
    <h4>Flow blockers</h4>
    <p v-if="blockers.length === 0">No missing receipt blockers.</p>
    <ul v-else>
      <li v-for="blocker in blockers" :key="blocker">{{ blocker }}</li>
    </ul>

    <h4>Flow warnings</h4>
    <p v-if="warnings.length === 0">No warnings.</p>
    <ul v-else>
      <li v-for="warning in warnings" :key="warning">{{ warning }}</li>
    </ul>
  </section>
</template>
