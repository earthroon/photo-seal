<script setup lang="ts">
import type { PhotoSealAuditStatus } from "../../receipt/exportAuditTypes";

const props = defineProps<{
  status: PhotoSealAuditStatus;
  label: string;
}>();
</script>

<template>
  <span class="export-audit-badge" :data-status="props.status">
    {{ props.label }}
  </span>
</template>
