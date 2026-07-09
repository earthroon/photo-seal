import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const checks = [];
const check = (label, condition) => checks.push({ label, ok: Boolean(condition) });
const read = (file) => readFileSync(file, "utf8");

const picker = "packages/photo-seal-web/src/components/import/ImageImportPicker.vue";
const preview = "packages/photo-seal-web/src/components/import/ImageImportPreviewCanvas.vue";
const style = "packages/photo-seal-web/src/style.css";
const pickerSource = read(picker);
const previewSource = read(preview);
const styleSource = read(style);

check("preview badge computed in Vue3 picker", pickerSource.includes("previewCropBadgeLabel"));
check("crop required state maps to badge label", pickerSource.includes('return props.cropReceipt ? "크롭 완료" : "크롭 필요"'));
check("non crop required preset hides badge", pickerSource.includes("if (!props.cropRequired)"));
check("picker passes badge prop to preview", pickerSource.includes(':crop-badge-label="previewCropBadgeLabel"'));
check("preview canvas accepts badge prop", previewSource.includes("cropBadgeLabel?: string | null"));
check("preview frame renders badge", previewSource.includes("data-preview-crop-required-badge=\"true\"") && previewSource.includes("props.cropBadgeLabel"));
check("badge style is preview-frame local", styleSource.includes("TDT-PHOTOSEAL-13-H3-R8-R10") && styleSource.includes("image-import-preview-canvas__badge"));
check("badge frame is positioned relative", styleSource.includes('data-preview-display-contract="full-source-contain-no-crop"]') && styleSource.includes("position: relative"));
check("badge is visual only", styleSource.includes("pointer-events: none"));
check("no browser jpeg fallback", !pickerSource.includes('toBlob("image/jpeg")') && !previewSource.includes('toDataURL("image/jpeg")'));

const failed = checks.filter((item) => !item.ok);
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8-R10",
  marker: failed.length === 0
    ? "PASS_TDT_PHOTOSEAL_13_H3_R8_R10_IMPORT_PREVIEW_CROP_BADGE"
    : "FAIL_TDT_PHOTOSEAL_13_H3_R8_R10_IMPORT_PREVIEW_CROP_BADGE",
  checks,
};

mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/TDT_PHOTOSEAL_13_H3_R8_R10_STATIC_CHECK_RESULT.json", JSON.stringify(result, null, 2));

if (failed.length > 0) {
  console.error(result.marker);
  console.error(JSON.stringify(failed, null, 2));
  process.exit(1);
}
console.log(result.marker);
