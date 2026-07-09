<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { buildDebugReceiptJsonText, buildExportAuditSummaryText, copyTextToClipboard } from "../../receipt/exportAuditCopy";
import {
  createDefaultExportAuditAccordionState,
  isDebugJsonVisible,
  toggleExportAuditSection,
} from "../../receipt/exportAuditInteraction";
import type { ExportAuditAccordionState, ExportAuditCopyStatus, ExportAuditCopyTarget, ExportAuditSectionId } from "../../receipt/exportAuditInteractionTypes";
import type { PhotoSealDebugReceiptBundle, PhotoSealExportAuditSummary } from "../../receipt/exportAuditTypes";
import ExportAuditBadge from "./ExportAuditBadge.vue";
import ExportAuditCopyButton from "./ExportAuditCopyButton.vue";
import ExportAuditDebugJson from "./ExportAuditDebugJson.vue";
import ExportAuditSection from "./ExportAuditSection.vue";
import ExportAuditWarnings from "./ExportAuditWarnings.vue";

const props = defineProps<{
  audit: PhotoSealExportAuditSummary;
  debugBundle?: PhotoSealDebugReceiptBundle;
  showDebugJson?: boolean;
}>();

const accordion = ref<ExportAuditAccordionState>(
  createDefaultExportAuditAccordionState(props.audit.exportStatus),
);
const lastCopyTarget = ref<ExportAuditCopyTarget | null>(null);
const copyStatus = ref<ExportAuditCopyStatus>("idle");
const copyMessage = ref<string | null>(null);

watch(
  () => props.audit.exportStatus,
  (status) => {
    accordion.value = createDefaultExportAuditAccordionState(status);
    copyStatus.value = "idle";
    copyMessage.value = null;
    lastCopyTarget.value = null;
  },
);

const debugJsonVisible = computed(() => isDebugJsonVisible(accordion.value));
const summaryCopyText = computed(() => buildExportAuditSummaryText(props.audit));
const debugCopyText = computed(() =>
  props.debugBundle ? buildDebugReceiptJsonText(props.debugBundle) : "",
);
const warningsBadge = computed(() => {
  if (props.audit.blockers.length > 0) {
    return `차단 ${props.audit.blockers.length}`;
  }
  if (props.audit.warnings.length > 0) {
    return `주의 ${props.audit.warnings.length}`;
  }
  return "문제 없음";
});

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

function toggle(sectionId: ExportAuditSectionId): void {
  accordion.value = toggleExportAuditSection(accordion.value, sectionId);
}

function setCopyFeedback(target: ExportAuditCopyTarget, status: ExportAuditCopyStatus): void {
  lastCopyTarget.value = target;
  copyStatus.value = status;
  if (status === "copied") {
    copyMessage.value = target === "summary" ? "Audit summary copied." : "Debug receipt JSON copied.";
    return;
  }
  if (status === "unsupported") {
    copyMessage.value = "Clipboard API is not supported in this context.";
    return;
  }
  if (status === "failed") {
    copyMessage.value = "Copy failed. Please try again.";
    return;
  }
  copyMessage.value = null;
}

async function copySummary(): Promise<void> {
  const status = await copyTextToClipboard(summaryCopyText.value);
  setCopyFeedback("summary", status);
}

async function copyDebugReceipt(): Promise<void> {
  if (!props.debugBundle || debugJsonVisible.value !== true) {
    setCopyFeedback("debug-receipt-json", "failed");
    return;
  }
  const status = await copyTextToClipboard(debugCopyText.value);
  setCopyFeedback("debug-receipt-json", status);
}
</script>

<template>
  <article class="export-receipt-surface" :data-status="props.audit.exportStatus">
    <header class="export-receipt-surface__header">
      <div>
        <p class="eyebrow">TDT-PHOTOSEAL-06-R1</p>
        <h2>Export Audit Surface</h2>
        <p class="export-audit-muted">
          No receipt, no export trust. No raw JSON default flood.
        </p>
      </div>
      <div class="export-receipt-surface__actions">
        <ExportAuditBadge :status="props.audit.exportStatus" :label="props.audit.exportStatusLabel" />
        <ExportAuditCopyButton
          target="summary"
          label="Copy summary"
          :status="lastCopyTarget === 'summary' ? copyStatus : 'idle'"
          @copy="copySummary"
        />
      </div>
    </header>

    <p class="export-audit-copy__status" aria-live="polite">
      {{ copyMessage ?? "복사 버튼을 눌러 감사 요약을 클립보드에 저장할 수 있습니다." }}
    </p>

    <div class="export-audit-grid">
      <ExportAuditSection
        section-id="status"
        title="Export Status"
        :open="accordion.status"
        :status="props.audit.exportStatus"
        @toggle="toggle"
      >
        <dl class="export-audit-kv">
          <div>
            <dt>Output</dt>
            <dd>{{ props.audit.width }} × {{ props.audit.height }}</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>{{ formatBytes(props.audit.outputBytes) }} / target {{ formatBytes(props.audit.targetBytes) }}</dd>
          </div>
          <div>
            <dt>Reached target</dt>
            <dd>{{ props.audit.reachedTarget ? "yes" : "no" }}</dd>
          </div>
        </dl>
      </ExportAuditSection>

      <ExportAuditSection
        section-id="size"
        title="Size / Target"
        :open="accordion.size"
        :status="props.audit.reachedTarget ? 'pass' : 'warn'"
        @toggle="toggle"
      >
        <dl class="export-audit-kv">
          <div><dt>Target bytes</dt><dd>{{ formatBytes(props.audit.targetBytes) }}</dd></div>
          <div><dt>Output bytes</dt><dd>{{ formatBytes(props.audit.outputBytes) }}</dd></div>
          <div><dt>Target reached</dt><dd>{{ props.audit.reachedTarget ? "yes" : "no" }}</dd></div>
        </dl>
      </ExportAuditSection>

      <ExportAuditSection
        section-id="color"
        title="Color Pipeline"
        :open="accordion.color"
        :status="props.audit.colorPipeline.status"
        @toggle="toggle"
      >
        <p>{{ props.audit.colorPipeline.label }}</p>
        <dl class="export-audit-kv">
          <div><dt>Decoded</dt><dd>{{ props.audit.colorPipeline.decodedColorSpace }}</dd></div>
          <div><dt>Resize output</dt><dd>{{ props.audit.colorPipeline.resizeOutputColorSpace }}</dd></div>
          <div><dt>JPEG</dt><dd>{{ props.audit.colorPipeline.jpegColorSpace }}</dd></div>
          <div><dt>Double gamma</dt><dd>{{ props.audit.colorPipeline.doubleGammaDetected ? "detected" : "none" }}</dd></div>
        </dl>
      </ExportAuditSection>

      <ExportAuditSection
        section-id="jpeg"
        title="JPEG Encode"
        :open="accordion.jpeg"
        :status="props.audit.jpeg.status"
        @toggle="toggle"
      >
        <p>{{ props.audit.jpeg.label }}</p>
        <dl class="export-audit-kv">
          <div><dt>Subsampling</dt><dd>{{ props.audit.jpeg.subsampling }}</dd></div>
          <div><dt>Target search</dt><dd>{{ props.audit.jpeg.targetBytesUsed ? "used" : "not used" }}</dd></div>
          <div><dt>Attempts</dt><dd>{{ props.audit.jpeg.attemptsCount }}</dd></div>
          <div><dt>Encoder resize</dt><dd>{{ props.audit.jpeg.resizedInsideEncoder ? "used" : "none" }}</dd></div>
        </dl>
      </ExportAuditSection>

      <ExportAuditSection
        section-id="resize"
        title="Resize"
        :open="accordion.resize"
        :status="props.audit.quality.status"
        @toggle="toggle"
      >
        <p>{{ props.audit.resizeProfileLabel }}</p>
        <dl class="export-audit-kv">
          <div><dt>Default profile used</dt><dd>{{ props.audit.defaultProfileUsed ? "yes" : "no" }}</dd></div>
          <div><dt>Candidate profile used</dt><dd>{{ props.audit.candidateProfileUsed ? "yes" : "no" }}</dd></div>
          <div><dt>QMap / TileMask</dt><dd>{{ props.audit.quality.qmapUsed ? "used" : "not used" }} / {{ props.audit.quality.tileMaskUsed ? "used" : "not used" }}</dd></div>
        </dl>
      </ExportAuditSection>

      <ExportAuditSection
        section-id="bridge"
        title="Worker / WASM"
        :open="accordion.bridge"
        :status="props.audit.bridge.status"
        @toggle="toggle"
      >
        <p>{{ props.audit.bridge.label }}</p>
        <dl class="export-audit-kv">
          <div><dt>Worker</dt><dd>{{ props.audit.bridge.workerSingleThread ? "single-thread" : "check required" }}</dd></div>
          <div><dt>Transfer</dt><dd>{{ props.audit.bridge.arrayBufferTransferUsed ? "ArrayBuffer" : "check required" }}</dd></div>
          <div><dt>SIMD</dt><dd>{{ props.audit.bridge.wasmSimdRequired ? "required" : "check required" }}</dd></div>
          <div><dt>SharedArrayBuffer</dt><dd>{{ props.audit.bridge.sharedArrayBufferRequired ? "required" : "not required" }}</dd></div>
        </dl>
      </ExportAuditSection>

      <ExportAuditSection
        section-id="quality"
        title="Quality Evidence"
        :open="accordion.quality"
        :status="props.audit.quality.status"
        @toggle="toggle"
      >
        <p>{{ props.audit.quality.label }}</p>
        <dl class="export-audit-kv">
          <div><dt>OKLab</dt><dd>{{ props.audit.quality.oklabUsed ? "metric-local" : "not used" }}</dd></div>
          <div><dt>Parity gate</dt><dd>{{ props.audit.quality.parityGateAvailable ? "available" : "not available" }}</dd></div>
          <div><dt>Runtime smoke</dt><dd>{{ props.audit.quality.parityRuntimeWebGpuSmoke ?? "NOT_RUN" }}</dd></div>
        </dl>
      </ExportAuditSection>

      <ExportAuditSection
        section-id="warnings"
        title="Warnings / Blockers"
        :open="accordion.warnings"
        :status="props.audit.blockers.length > 0 ? 'fail' : props.audit.warnings.length > 0 ? 'warn' : 'pass'"
        :badge="warningsBadge"
        @toggle="toggle"
      >
        <ExportAuditWarnings :warnings="props.audit.warnings" :blockers="props.audit.blockers" />
      </ExportAuditSection>

      <ExportAuditSection
        v-if="props.debugBundle && props.showDebugJson === true"
        section-id="debug"
        title="Debug Receipt JSON"
        :open="accordion.debug"
        status="warn"
        badge="opt-in"
        @toggle="toggle"
      >
        <ExportAuditDebugJson
          :bundle="props.debugBundle"
          :open="debugJsonVisible"
          :copy-status="lastCopyTarget === 'debug-receipt-json' ? copyStatus : 'idle'"
          @copy-debug="copyDebugReceipt"
        />
      </ExportAuditSection>
    </div>
  </article>
</template>
