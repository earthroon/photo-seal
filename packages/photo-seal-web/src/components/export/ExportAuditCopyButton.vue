<script setup lang="ts">
import type { ExportAuditCopyTarget, ExportAuditCopyStatus } from "../../receipt/exportAuditInteractionTypes";

const props = defineProps<{
  target: ExportAuditCopyTarget;
  label: string;
  status?: ExportAuditCopyStatus;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  copy: [target: ExportAuditCopyTarget];
}>();

function onCopy(): void {
  if (props.disabled === true) {
    return;
  }
  emit("copy", props.target);
}
</script>

<template>
  <button
    type="button"
    class="export-audit-copy"
    :data-target="props.target"
    :disabled="props.disabled === true"
    :aria-label="props.label"
    @click="onCopy"
  >
    {{ props.label }}
  </button>
</template>
