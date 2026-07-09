import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const patchId = "TDT-PHOTOSEAL-11-R2";
const passMarker = "PASS_TDT_PHOTOSEAL_11_R2_PRESET_UI_POLISH_CUSTOM_VALIDATION";
const failMarker = "FAIL_TDT_PHOTOSEAL_11_R2_PRESET_UI_POLISH_CUSTOM_VALIDATION";

const checks = JSON.parse(fs.readFileSync(path.join(root, "specs/TDT_PHOTOSEAL_11_R2_STATIC_CHECKS.json"), "utf8"));
const implementationFiles = [
  "packages/photo-seal-web/src/preset/customPresetValidationTypes.ts",
  "packages/photo-seal-web/src/preset/customPresetValidationReceipt.ts",
  "packages/photo-seal-web/src/preset/customPresetValidation.ts",
  "packages/photo-seal-web/src/preset/applyCustomPreset.ts",
  "packages/photo-seal-web/src/preset/customPresetValidationRuntimeSmoke.ts",
  "packages/photo-seal-web/src/dev/registerPhotoSealCustomPresetValidationSmoke.ts",
  "packages/photo-seal-web/src/components/preset/CustomPresetFields.vue",
  "packages/photo-seal-web/src/components/preset/CustomPresetValidationMessage.vue",
  "packages/photo-seal-web/src/components/preset/ExportPresetSelector.vue",
  "packages/photo-seal-web/src/components/preset/ExportPresetCard.vue"
];

const failures = [];
for (const file of checks.required_files) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`missing file: ${file}`);
}

const allText = checks.required_files
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

for (const token of checks.required_tokens) {
  if (!allText.includes(token)) failures.push(`missing token: ${token}`);
}

const implementationText = implementationFiles
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

for (const token of checks.forbidden_tokens) {
  if (implementationText.includes(token)) failures.push(`forbidden token in implementation: ${token}`);
}

const validationText = fs.existsSync(path.join(root, "packages/photo-seal-web/src/preset/customPresetValidation.ts"))
  ? fs.readFileSync(path.join(root, "packages/photo-seal-web/src/preset/customPresetValidation.ts"), "utf8")
  : "";
if (!validationText.includes("INTEGER_PATTERN")) failures.push("integer regex validation missing");
if (!validationText.includes("clamped: false")) failures.push("field-level clamped false missing");

const result = {
  patch_id: patchId,
  status: failures.length === 0 ? "PASS" : "FAIL",
  pass_marker: failures.length === 0 ? passMarker : null,
  fail_marker: failures.length > 0 ? failMarker : null,
  static_contract_smoke: failures.length === 0 ? "PASS" : "FAIL",
  browser_custom_preset_validation_smoke: "NOT_RUN",
  browser_custom_preset_validation_reason: "NO_BROWSER_RUNTIME",
  runtime_actually_executed: false,
  runtime_pass_claimed: false,
  clamp_applied: false,
  fallback_preset_used: false,
  silent_correction_used: false,
  invalid_custom_preset_applied: false,
  failures
};

fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(path.join(root, "artifacts/TDT_PHOTOSEAL_11_R2_STATIC_CHECK_RESULT.json"), JSON.stringify(result, null, 2));

if (failures.length > 0) {
  console.error(failMarker);
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(passMarker);
