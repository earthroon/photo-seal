import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  "packages/photo-seal-web/src/components/preset/ExportPresetSelector.vue",
  "packages/photo-seal-web/src/style.css",
  "packages/photo-seal-web/src/App.vue"
];

const requiredTokens = [
  "TDT-PHOTOSEAL-13-H3-R8-R2",
  "data-layout-owner=\"vue3-preset-selector\"",
  "data-layout-section=\"preset-card-flow\"",
  "data-layout-section=\"custom-preset-fields-flow\"",
  "data-layout-section=\"custom-preset-collapsed-flow\"",
  "data-layout-section=\"selected-preset-summary-flow\"",
  "customFieldsVisible",
  "selectorLayoutState",
  "v-if=\"customFieldsVisible\"",
  "v-else",
  "preset-panel",
  "overflow: auto",
  "contain: layout"
];

const forbiddenTokens = [
  "grid-template-rows: auto auto minmax(0, auto) auto auto;"
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
const foundForbidden = forbiddenTokens.filter((token) => joined.includes(token));
const pass = missingFiles.length === 0 && missingTokens.length === 0 && foundForbidden.length === 0;
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8-R2",
  pass,
  missingFiles,
  missingTokens,
  foundForbidden,
  marker: pass
    ? "PASS_TDT_PHOTOSEAL_13_H3_R8_R2_VUE3_LAYOUT_OWNERSHIP"
    : "FAIL_TDT_PHOTOSEAL_13_H3_R8_R2_VUE3_LAYOUT_OWNERSHIP"
};
fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_13_H3_R8_R2_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2)
);
console.log(result.marker);
if (!pass) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
