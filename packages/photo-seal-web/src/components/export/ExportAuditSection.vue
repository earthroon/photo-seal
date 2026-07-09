<script setup lang="ts">
import type { ExportAuditSectionId } from "../../receipt/exportAuditInteractionTypes";
import type { PhotoSealAuditStatus } from "../../receipt/exportAuditTypes";

const props = defineProps<{
  sectionId: ExportAuditSectionId;
  title: string;
  open: boolean;
  status?: PhotoSealAuditStatus;
  badge?: string;
}>();

const emit = defineEmits<{
  toggle: [sectionId: ExportAuditSectionId];
}>();

const panelId = `export-audit-panel-${props.sectionId}`;
const buttonId = `export-audit-button-${props.sectionId}`;

function toggle(): void {
  emit("toggle", props.sectionId);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggle();
  }
}
</script>

<template>
  <section class="export-audit-section" :data-status="props.status ?? 'pass'">
    <button
      :id="buttonId"
      type="button"
      class="export-audit-section__header export-audit-section__button"
      :aria-expanded="props.open"
      :aria-controls="panelId"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span class="export-audit-section__title">{{ props.title }}</span>
      <span class="export-audit-section__meta">
        <span v-if="props.badge" class="export-audit-section__badge">{{ props.badge }}</span>
        <span v-if="props.status" class="export-audit-section__status">{{ props.status }}</span>
      </span>
    </button>
    <div
      v-show="props.open"
      :id="panelId"
      class="export-audit-section__body"
      role="region"
      :aria-labelledby="buttonId"
    >
      <slot />
    </div>
  </section>
</template>
