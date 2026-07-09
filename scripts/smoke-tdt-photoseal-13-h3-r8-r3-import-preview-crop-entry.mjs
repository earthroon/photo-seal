import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  "packages/photo-seal-web/src/components/import/ImageImportPreviewCanvas.vue",
  "packages/photo-seal-web/src/components/import/ImageImportPicker.vue",
  "packages/photo-seal-web/src/App.vue",
  "packages/photo-seal-web/src/style.css"
];

const requiredTokens = [
  "TDT-PHOTOSEAL-13-H3-R8-R3",
  "data-preview-owner=\"webgpu-canvas\"",
  "data-layout-section=\"import-webgpu-preview-flow\"",
  "copyExternalImageToTexture",
  "getPreferredCanvasFormat",
  "GPUTextureUsage.TEXTURE_BINDING",
  "ImageImportPreviewCanvas",
  ":imported-image=\"importedImage\"",
  "@open-crop=\"openCropModal\"",
  "image-import-crop-action",
  "크롭 조정",
  "파일 다시 선택",
  "export-panel .crop-requirement-card",
  "display: none"
];

const forbiddenInAppTokens = [
  "<CropRequirementCard"
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
const appText = fs.existsSync(path.join(root, "packages/photo-seal-web/src/App.vue"))
  ? fs.readFileSync(path.join(root, "packages/photo-seal-web/src/App.vue"), "utf8")
  : "";
const missingTokens = requiredTokens.filter((token) => !joined.includes(token));
const forbiddenTokensFound = forbiddenInAppTokens.filter((token) => appText.includes(token));
const pass = missingFiles.length === 0 && missingTokens.length === 0 && forbiddenTokensFound.length === 0;
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8-R3",
  patchName: "Import WebGPU Preview Canvas / Crop Button Under Preview / Export Panel Crop Action Removal",
  pass,
  missingFiles,
  missingTokens,
  forbiddenTokensFound,
  marker: pass
    ? "PASS_TDT_PHOTOSEAL_13_H3_R8_R3_IMPORT_PREVIEW_CROP_ENTRY"
    : "FAIL_TDT_PHOTOSEAL_13_H3_R8_R3_IMPORT_PREVIEW_CROP_ENTRY"
};
fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_13_H3_R8_R3_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2)
);
console.log(result.marker);
if (!pass) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
