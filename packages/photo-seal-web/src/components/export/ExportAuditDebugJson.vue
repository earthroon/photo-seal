<script setup lang="ts">
import { computed } from "vue";
import type { ExportAuditCopyStatus } from "../../receipt/exportAuditInteractionTypes";
import { buildDebugReceiptJsonText } from "../../receipt/exportAuditCopy";
import type { PhotoSealDebugReceiptBundle } from "../../receipt/exportAuditTypes";
import ExportAuditCopyButton from "./ExportAuditCopyButton.vue";

const props = defineProps<{
  bundle: PhotoSealDebugReceiptBundle;
  open: boolean;
  copyStatus?: ExportAuditCopyStatus;
}>();

const emit = defineEmits<{
  copyDebug: [];
}>();

const debugJsonText = computed(() => buildDebugReceiptJsonText(props.bundle));
</script>

<template>
  <div class="export-audit-debug-json" data-raw-json-policy="raw JSON is opt-in">
    <div class="export-audit-debug-json__toolbar">
      <p class="export-audit-muted">Debug receipt JSON은 사용자가 펼쳤을 때만 표시됩니다.</p>
      <ExportAuditCopyButton
        target="debug-receipt-json"
        label="Copy debug receipt JSON"
        :status="props.copyStatus"
        :disabled="props.open !== true"
        @copy="emit('copyDebug')"
      />
    </div>
    <pre v-if="props.open === true" class="export-audit-debug-json__pre">{{ debugJsonText }}</pre>
  </div>
</template>
