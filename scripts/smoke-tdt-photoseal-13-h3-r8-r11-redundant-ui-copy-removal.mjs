import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const checks = [];
const check = (label, condition) => checks.push({ label, ok: Boolean(condition) });
const read = (file) => readFileSync(file, "utf8");

const picker = "packages/photo-seal-web/src/components/import/ImageImportPicker.vue";
const preview = "packages/photo-seal-web/src/components/import/ImageImportPreviewCanvas.vue";
const card = "packages/photo-seal-web/src/components/preset/ExportPresetCard.vue";
const selector = "packages/photo-seal-web/src/components/preset/ExportPresetSelector.vue";
const style = "packages/photo-seal-web/src/style.css";

const pickerSource = read(picker);
const previewSource = read(preview);
const cardSource = read(card);
const selectorSource = read(selector);
const styleSource = read(style);

check("preview badge remains in import picker", pickerSource.includes("previewCropBadgeLabel"));
check("preview badge still passes to canvas", pickerSource.includes(':crop-badge-label="previewCropBadgeLabel"'));
check("preview frame still renders crop badge", previewSource.includes("data-preview-crop-required-badge=\"true\"") && previewSource.includes("props.cropBadgeLabel"));
check("import helper copy row removed from template", !pickerSource.includes("image-import-crop-action") && !pickerSource.includes("프리셋은 미리보기 아래에서 크롭을 확정해야 합니다"));
check("preset card redundant meta computed removed", !cardSource.includes("compactMeta") && !cardSource.includes("export-preset-card__meta"));
check("preset card uses compact one-line density", cardSource.includes('data-card-density="compact-1-line"'));
check("preset card no crop required inline meta", !cardSource.includes("JPEG 4:4:4") && !cardSource.includes("크롭 필요"));
check("custom collapsed helper row removed", !selectorSource.includes("custom-preset-collapsed-flow") && !selectorSource.includes("사용자 지정 프리셋은 사용자 지정 카드를 선택하면 조정할 수 있습니다"));
check("r11 css seal exists", styleSource.includes("TDT-PHOTOSEAL-13-H3-R8-R11"));
check("no browser jpeg fallback", !pickerSource.includes('toBlob("image/jpeg")') && !previewSource.includes('toDataURL("image/jpeg")'));

const failed = checks.filter((item) => !item.ok);
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8-R11",
  marker: failed.length === 0
    ? "PASS_TDT_PHOTOSEAL_13_H3_R8_R11_REDUNDANT_UI_COPY_REMOVAL"
    : "FAIL_TDT_PHOTOSEAL_13_H3_R8_R11_REDUNDANT_UI_COPY_REMOVAL",
  checks,
};

mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/TDT_PHOTOSEAL_13_H3_R8_R11_STATIC_CHECK_RESULT.json", JSON.stringify(result, null, 2));

if (failed.length > 0) {
  console.error(result.marker);
  console.error(JSON.stringify(failed, null, 2));
  process.exit(1);
}
console.log(result.marker);
