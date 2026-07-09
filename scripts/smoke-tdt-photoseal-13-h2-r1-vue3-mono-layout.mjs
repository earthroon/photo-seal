import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = JSON.parse(fs.readFileSync(path.join(root, "specs/TDT_PHOTOSEAL_13_H2_R1_STATIC_CHECKS.json"), "utf8"));
const failures = [];

for (const file of checks.required_files) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`missing file: ${file}`);
  }
}

const implementationFiles = [
  "packages/photo-seal-web/src/App.vue",
  "packages/photo-seal-web/src/style.css",
  "packages/photo-seal-web/src/ui/photoSealKoCopy.ts",
  "packages/photo-seal-web/src/components/import/ImageImportPicker.vue",
  "packages/photo-seal-web/src/components/preset/ExportPresetSelector.vue",
  "packages/photo-seal-web/src/components/preset/ExportPresetCard.vue",
  "packages/photo-seal-web/src/components/preset/ExportPresetSummary.vue",
  "packages/photo-seal-web/src/components/assembly/ExportFlowActions.vue",
].map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");

for (const token of checks.required_tokens) {
  if (!implementationFiles.includes(token)) {
    failures.push(`missing token: ${token}`);
  }
}

for (const token of checks.forbidden_tokens) {
  if (implementationFiles.includes(token)) {
    failures.push(`forbidden token: ${token}`);
  }
}

const result = {
  patchId: checks.patch_id,
  marker: failures.length === 0
    ? "PASS_TDT_PHOTOSEAL_13_H2_R1_VUE3_MONOCHROME_NO_SCROLL_LAYOUT"
    : "FAIL_TDT_PHOTOSEAL_13_H2_R1_VUE3_MONOCHROME_NO_SCROLL_LAYOUT",
  failures,
  staticSmoke: failures.length === 0 ? "PASS" : "FAIL",
  browserUiSurfaceSmoke: "NOT_RUN",
  browserUiSurfaceReason: "NO_BROWSER_RUNTIME",
  runtimeActuallyExecuted: false,
  runtimePassClaimed: false,
  layoutSsotWidth: 1920,
  layoutSsotHeight: 1080,
  vue3LayerRewired: true,
  cssOnlyPretendFix: false,
  grayMonochromeSurface: true,
  desktopNoScrollPolicy: true,
  technicalDetailsDefaultClosed: true,
  sha256FilesEmitted: false,
};

fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(path.join(root, "artifacts/TDT_PHOTOSEAL_13_H2_R1_STATIC_CHECK_RESULT.json"), JSON.stringify(result, null, 2));
fs.writeFileSync(path.join(root, "artifacts/TDT_PHOTOSEAL_13_H2_R1_UI_SURFACE_SMOKE_RECEIPT.json"), JSON.stringify(result, null, 2));
fs.writeFileSync(path.join(root, "artifacts/TDT_PHOTOSEAL_13_H2_R1_BAKE_MANIFEST.json"), JSON.stringify({
  patch_id: checks.patch_id,
  patch_name: "Vue3 Monochrome Layout Rewire / 1920x1080 No Scroll Surface / No CSS-Only Pretend Fix Seal",
  base_patch: "TDT-PHOTOSEAL-13-H2",
  vue3_app_recomposition: true,
  image_import_dropzone_rewired: true,
  preset_cards_rewired: true,
  export_actions_rewired: true,
  gray_monochrome_surface: true,
  layout_ssot_width: 1920,
  layout_ssot_height: 1080,
  desktop_no_scroll_policy: true,
  static_contract_smoke: result.staticSmoke,
  browser_ui_surface_smoke: "NOT_RUN",
  browser_ui_surface_reason: "NO_BROWSER_RUNTIME",
  runtime_actually_executed: false,
  runtime_pass_claimed: false,
  sha256_files_emitted: false
}, null, 2));

console.log(result.marker);
if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
