<script setup lang="ts">
import type { PhotoSealAuditBlocker, PhotoSealAuditWarning } from "../../receipt/exportAuditTypes";

const props = defineProps<{
  warnings: PhotoSealAuditWarning[];
  blockers: PhotoSealAuditBlocker[];
}>();
</script>

<template>
  <section class="export-audit-warnings" aria-labelledby="export-audit-warnings-title">
    <h3 id="export-audit-warnings-title">Warnings / Blockers</h3>

    <p v-if="props.warnings.length === 0 && props.blockers.length === 0" class="export-audit-muted">
      주의 사항이나 차단 항목이 없습니다.
    </p>

    <div v-if="props.blockers.length > 0" class="export-audit-list export-audit-list--blocker">
      <h4>Blockers</h4>
      <ul>
        <li v-for="blocker in props.blockers" :key="blocker.code">
          <strong>{{ blocker.code }}</strong>
          <span>{{ blocker.message }}</span>
        </li>
      </ul>
    </div>

    <div v-if="props.warnings.length > 0" class="export-audit-list export-audit-list--warning">
      <h4>Warnings</h4>
      <ul>
        <li v-for="warning in props.warnings" :key="warning.code">
          <strong>{{ warning.code }}</strong>
          <span>{{ warning.message }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
