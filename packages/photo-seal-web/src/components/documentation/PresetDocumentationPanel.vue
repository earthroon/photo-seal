<template>
  <section class="preset-documentation-panel" aria-labelledby="preset-documentation-title">
    <h2 id="preset-documentation-title">Preset documentation</h2>
    <p>{ documentation.summaryText }</p>
    <dl>
      <div><dt>Preset</dt><dd>{ documentation.presetLabel }</dd></div>
      <div><dt>Size</dt><dd>{ documentation.width } x { documentation.height }</dd></div>
      <div><dt>Target bytes</dt><dd>{ documentation.targetBytes }</dd></div>
      <div><dt>Resize profile</dt><dd>{ documentation.resizeProfile }</dd></div>
      <div><dt>JPEG</dt><dd>4:4:4</dd></div>
      <div><dt>Color</dt><dd>sRGB</dd></div>
      <div><dt>Crop required</dt><dd>{ documentation.cropRequired ? "yes" : "no" }</dd></div>
    </dl>
    <ComplianceDisclaimerBadge />
    <p class="preset-documentation-panel__disclaimer">이 프리셋은 PhotoSeal 내부 export 정책입니다.
기관의 공식 규격 보장이 아닙니다.
제출 전 해당 기관의 최신 요구사항을 직접 확인해 주세요.</p>
  </section>
</template>

<script setup lang="ts">
import type { PhotoSealPresetDocumentationEntry } from "../../documentation/presetDocumentationTypes";
import ComplianceDisclaimerBadge from "./ComplianceDisclaimerBadge.vue";

defineOptions({ name: "PresetDocumentationPanel" });
defineProps<{ documentation: PhotoSealPresetDocumentationEntry }>();
</script>
