import { readFileSync, writeFileSync } from 'node:fs';

function replaceOnce(file, before, after) {
  const path = `/mnt/data/tdt_r8r10_work/${file}`;
  const source = readFileSync(path, 'utf8');
  if (!source.includes(before)) {
    throw new Error(`missing token in ${file}: ${before.slice(0, 80)}`);
  }
  writeFileSync(path, source.replace(before, after));
}

replaceOnce(
  'packages/photo-seal-web/src/components/import/ImageImportPreviewCanvas.vue',
  `const props = defineProps<{\n  imageSource: PhotoSealImportedImageSource;\n}>();`,
  `const props = defineProps<{\n  imageSource: PhotoSealImportedImageSource;\n  cropBadgeLabel?: string | null;\n}>();`
);

replaceOnce(
  'packages/photo-seal-web/src/components/import/ImageImportPreviewCanvas.vue',
  `    <div\n      ref="frameRef"\n      class="image-import-preview-canvas__frame"\n      data-preview-display-contract="full-source-contain-no-crop"\n    >\n      <canvas`,
  `    <div\n      ref="frameRef"\n      class="image-import-preview-canvas__frame"\n      data-preview-display-contract="full-source-contain-no-crop"\n    >\n      <span\n        v-if="props.cropBadgeLabel"\n        class="image-import-preview-canvas__badge"\n        data-preview-crop-required-badge="true"\n      >\n        {{ props.cropBadgeLabel }}\n      </span>\n      <canvas`
);

replaceOnce(
  'packages/photo-seal-web/src/components/import/ImageImportPicker.vue',
  `const cropStatusLabel = computed(() => {\n  if (props.cropReceipt) {\n    return "크롭 적용됨";\n  }\n  return props.cropRequired ? "크롭 확인 필요" : "크롭 선택 사항";\n});`,
  `const cropStatusLabel = computed(() => {\n  if (props.cropReceipt) {\n    return "크롭 적용됨";\n  }\n  return props.cropRequired ? "크롭 확인 필요" : "크롭 선택 사항";\n});\n\nconst previewCropBadgeLabel = computed(() => {\n  if (!props.cropRequired) {\n    return null;\n  }\n  return props.cropReceipt ? "크롭 완료" : "크롭 필요";\n});`
);

replaceOnce(
  'packages/photo-seal-web/src/components/import/ImageImportPicker.vue',
  `      <ImageImportPreviewCanvas :image-source="props.importedImage" />`,
  `      <ImageImportPreviewCanvas\n        :image-source="props.importedImage"\n        :crop-badge-label="previewCropBadgeLabel"\n      />`
);

const cssPath = '/mnt/data/tdt_r8r10_work/packages/photo-seal-web/src/style.css';
let css = readFileSync(cssPath, 'utf8');
css += `\n\n/* TDT-PHOTOSEAL-13-H3-R8-R10: crop-required badge belongs inside import preview frame. */\n.image-import-preview-canvas__frame[data-preview-display-contract="full-source-contain-no-crop"] {\n  position: relative;\n}\n\n.image-import-preview-canvas__badge[data-preview-crop-required-badge="true"] {\n  position: absolute;\n  top: 10px;\n  left: 10px;\n  z-index: 2;\n  display: inline-flex;\n  align-items: center;\n  min-height: 26px;\n  padding: 0 10px;\n  border: 1px solid #d8c8a7;\n  border-radius: 999px;\n  background: #fff8ea;\n  color: #4f3510;\n  font-size: 12px;\n  font-weight: 900;\n  letter-spacing: -0.02em;\n  box-shadow: 0 6px 16px rgba(31, 31, 31, 0.08);\n  pointer-events: none;\n}\n`;
writeFileSync(cssPath, css);
