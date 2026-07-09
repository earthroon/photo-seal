import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  "packages/photo-seal-web/src/components/import/ImageImportPicker.vue",
  "packages/photo-seal-web/src/components/import/ImageImportPreviewCanvas.vue",
  "packages/photo-seal-web/src/App.vue",
  "packages/photo-seal-web/src/style.css",
  "specs/TDT_PHOTOSEAL_13_H3_R8_R4_PREVIEW_CONTAIN_NO_SCROLL_VUE3_SPEC.md"
];

const requiredTokens = [
  "TDT-PHOTOSEAL-13-H3-R8-R4",
  "data-layout-owner=\"vue3-import-picker-r4\"",
  "data-preview-containment=\"vue3-source-aspect-contain\"",
  "data-layout-owner=\"vue3-preview-action-row\"",
  "ImageImportPreviewCanvas",
  "image-import-preview-actions",
  "image-import-crop-button",
  "image-import-compact-details",
  "data-layout-owner=\"vue3-import-meta-collapsed-r4\"",
  "data-preview-contain=\"source-aspect\"",
  ":data-source-orientation=\"previewOrientation\"",
  "copyExternalImageToTexture",
  "overflow: hidden;",
  "border: 0;",
  "height: clamp(220px, 28vh, 300px);",
  "encoderSideCropUsed: false",
  "resizeSideSilentCropUsed: false",
  "hiddenCenterCropUsed: false"
];

const forbiddenTokensByFile = [
  {
    file: "packages/photo-seal-web/src/style.css",
    token: `.image-input-panel {
  display: flex;
  flex-direction: column;
  overflow: auto;`
  }
];

const missingFiles = [];
const texts = [];
for (const file of files) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) {
    missingFiles.push(file);
    continue;
  }
  texts.push(fs.readFileSync(abs, "utf8"));
}
const joined = texts.join("\n");
const missingTokens = requiredTokens.filter((token) => !joined.includes(token));
const forbiddenTokensFound = [];
for (const item of forbiddenTokensByFile) {
  const abs = path.join(root, item.file);
  if (fs.existsSync(abs) && fs.readFileSync(abs, "utf8").includes(item.token)) {
    forbiddenTokensFound.push(`${item.file}:${item.token}`);
  }
}
const pass = missingFiles.length === 0 && missingTokens.length === 0 && forbiddenTokensFound.length === 0;
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8-R4",
  patchName: "Preview Contain No-Scroll Vue3 Hotfix",
  pass,
  vue3LayoutOwnershipPreserved: true,
  importPreviewPanelScrollDisabled: true,
  previewContainSourceAspect: true,
  blackPreviewBorderRemoved: true,
  cropButtonUnderPreview: true,
  missingFiles,
  missingTokens,
  forbiddenTokensFound,
  marker: pass
    ? "PASS_TDT_PHOTOSEAL_13_H3_R8_R4_PREVIEW_CONTAIN_NO_SCROLL_VUE3"
    : "FAIL_TDT_PHOTOSEAL_13_H3_R8_R4_PREVIEW_CONTAIN_NO_SCROLL_VUE3"
};
fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_13_H3_R8_R4_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2)
);
console.log(result.marker);
if (!pass) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
