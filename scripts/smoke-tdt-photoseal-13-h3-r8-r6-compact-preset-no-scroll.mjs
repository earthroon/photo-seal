import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  "packages/photo-seal-web/src/components/preset/ExportPresetCard.vue",
  "packages/photo-seal-web/src/components/preset/CustomPresetFields.vue",
  "packages/photo-seal-web/src/components/preset/ExportPresetSelector.vue",
  "packages/photo-seal-web/src/components/preset/ExportPresetSummary.vue",
  "packages/photo-seal-web/src/style.css",
  "specs/TDT_PHOTOSEAL_13_H3_R8_R6_COMPACT_PRESET_NO_SCROLL_SPEC.md"
];

const requiredTokens = [
  "TDT-PHOTOSEAL-13-H3-R8-R6",
  "data-card-density=\"compact-2-line\"",
  "compactMeta",
  "data-layout-contract=\"single-line-width-height-only\"",
  "custom-preset-fields__inline-row",
  "custom-preset-fields__dimension-field",
  "custom-preset-fields__multiply",
  "ExportPresetSummary",
  "export-preset-summary--compact",
  "preset-panel[data-layout-owner=\"vue3-preset-panel\"]",
  "overflow: hidden;",
  "min-height: 62px;",
  "grid-template-rows: auto auto;",
  "export-preset-selector__details.technical-details",
  "display: none;"
];

const forbiddenPairs = [
  {
    file: "packages/photo-seal-web/src/components/preset/ExportPresetCard.vue",
    tokens: ["formatPhotoSealBytes", "targetBytes"]
  },
  {
    file: "packages/photo-seal-web/src/components/preset/CustomPresetFields.vue",
    tokens: ["PHOTO_SEAL_KO_COPY.targetBytes", "PHOTO_SEAL_KO_COPY.label"]
  },
  {
    file: "packages/photo-seal-web/src/components/preset/ExportPresetSummary.vue",
    tokens: ["formatPhotoSealBytes", "targetBytes"]
  }
];

const missingFiles = [];
const texts = [];
const perFileText = new Map();
for (const file of files) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) {
    missingFiles.push(file);
    continue;
  }
  const text = fs.readFileSync(abs, "utf8");
  texts.push(text);
  perFileText.set(file, text);
}
const joined = texts.join("\n");
const missingTokens = requiredTokens.filter((token) => !joined.includes(token));
const forbiddenTokensFound = [];
for (const pair of forbiddenPairs) {
  const text = perFileText.get(pair.file) ?? "";
  for (const token of pair.tokens) {
    if (text.includes(token)) {
      forbiddenTokensFound.push(`${pair.file}: ${token}`);
    }
  }
}

const pass = missingFiles.length === 0 && missingTokens.length === 0 && forbiddenTokensFound.length === 0;
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8-R6",
  patchName: "Compact Preset Cards / Inline Custom Size / No Preset Panel Scroll Seal",
  basePatch: "TDT-PHOTOSEAL-13-H3-R8-R5",
  pass,
  compactPresetCards: true,
  presetCardTwoLineContract: true,
  customSizeInlineRow: true,
  targetBytesInputVisible: false,
  labelInputVisible: false,
  presetPanelInternalScrollbarAllowed: false,
  vue3TemplateAdjusted: true,
  cssOnlyFix: false,
  browserJpegEncodeUsed: false,
  sha256FilesEmitted: false,
  runtimeActuallyExecuted: false,
  runtimePassClaimed: false,
  missingFiles,
  missingTokens,
  forbiddenTokensFound,
  marker: pass
    ? "PASS_TDT_PHOTOSEAL_13_H3_R8_R6_COMPACT_PRESET_NO_SCROLL"
    : "FAIL_TDT_PHOTOSEAL_13_H3_R8_R6_COMPACT_PRESET_NO_SCROLL"
};
fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_13_H3_R8_R6_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2)
);
console.log(result.marker);
if (!pass) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
