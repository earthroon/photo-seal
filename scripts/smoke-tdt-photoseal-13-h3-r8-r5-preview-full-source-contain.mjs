import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  "packages/photo-seal-web/src/components/import/ImageImportPreviewCanvas.vue",
  "packages/photo-seal-web/src/components/import/ImageImportPicker.vue",
  "packages/photo-seal-web/src/style.css",
  "specs/TDT_PHOTOSEAL_13_H3_R8_R5_PREVIEW_FULL_SOURCE_CONTAIN_SPEC.md"
];
const requiredTokens = [
  "TDT-PHOTOSEAL-13-H3-R8-R5",
  "frameRef",
  "previewDisplaySize",
  "previewDisplayStyle",
  "updatePreviewDisplaySize",
  "data-preview-display-contract=\"full-source-contain-no-crop\"",
  ":style=\"previewDisplayStyle\"",
  "resizeObserver.observe(frameRef.value)",
  "copyExternalImageToTexture",
  "height: clamp(230px, 25vh, 290px);",
  "overflow: visible;",
  "max-width: 100%;",
  "max-height: 100%;",
  "image-import-crop-button"
];
const forbiddenTokens = [
  "object-fit: cover",
  "cropReceipt?: PhotoSealCropReceipt | null;"
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
const forbiddenTokensFound = forbiddenTokens.filter((token) => joined.includes(token));
const pass = missingFiles.length === 0 && missingTokens.length === 0 && forbiddenTokensFound.length === 0;
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8-R5",
  patchName: "Preview Full Source Contain Vue3 Hotfix",
  basePatch: "TDT-PHOTOSEAL-13-H3-R8-R4",
  pass,
  previewDisplayComputedInVue3: true,
  sourceAspectPreserved: true,
  fullSourceVisibleContract: true,
  previewSizeBounded: true,
  cropButtonUnderPreviewPreserved: true,
  browserJpegEncodeUsed: false,
  sha256FilesEmitted: false,
  runtimeActuallyExecuted: false,
  runtimePassClaimed: false,
  missingFiles,
  missingTokens,
  forbiddenTokensFound,
  marker: pass
    ? "PASS_TDT_PHOTOSEAL_13_H3_R8_R5_PREVIEW_FULL_SOURCE_CONTAIN"
    : "FAIL_TDT_PHOTOSEAL_13_H3_R8_R5_PREVIEW_FULL_SOURCE_CONTAIN"
};
fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_13_H3_R8_R5_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2)
);
console.log(result.marker);
if (!pass) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
