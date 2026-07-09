import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checksPath = path.join(root, "specs/TDT_PHOTOSEAL_11_R1_STATIC_CHECKS.json");
const checks = JSON.parse(fs.readFileSync(checksPath, "utf8"));
const failures = [];

for (const rel of checks.required_files) {
  if (!fs.existsSync(path.join(root, rel))) {
    failures.push(`missing file: ${rel}`);
  }
}

const scanFiles = [
  "packages/photo-seal-web/src/preset/presetRuntimeSmokeTypes.ts",
  "packages/photo-seal-web/src/preset/presetRuntimeSmokeReceipt.ts",
  "packages/photo-seal-web/src/preset/presetSelectorRuntimeSmoke.ts",
  "packages/photo-seal-web/src/preset/presetFallbackGuard.ts",
  "packages/photo-seal-web/src/preset/presetResizeRequestProbe.ts",
  "packages/photo-seal-web/src/dev/registerPhotoSealPresetSmoke.ts",
  "packages/photo-seal-web/src/main.ts",
  "packages/photo-seal-web/e2e/photoSealPresetSelectorRuntime.spec.ts",
  "packages/photo-seal-web/e2e/presetRuntimeReceiptWriter.ts",
  "scripts/smoke-tdt-photoseal-11-r1-preset-selector-runtime.mjs",
  "specs/TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_RUNTIME_SMOKE_SPEC.md"
];

const corpus = scanFiles
  .filter((rel) => fs.existsSync(path.join(root, rel)))
  .map((rel) => `\n--- ${rel} ---\n${fs.readFileSync(path.join(root, rel), "utf8")}`)
  .join("\n");

for (const token of checks.required_tokens) {
  if (!corpus.includes(token)) {
    failures.push(`missing token: ${token}`);
  }
}

const implementationCorpus = scanFiles
  .filter((rel) => !rel.startsWith("specs/"))
  .filter((rel) => fs.existsSync(path.join(root, rel)))
  .map((rel) => fs.readFileSync(path.join(root, rel), "utf8"))
  .join("\n");

for (const token of checks.forbidden_tokens) {
  if (implementationCorpus.includes(token)) {
    failures.push(`forbidden token: ${token}`);
  }
}

const result = {
  patch_id: "TDT-PHOTOSEAL-11-R1",
  status: failures.length === 0 ? "PASS" : "FAIL",
  marker: failures.length === 0
    ? "PASS_TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_STATIC_CONTRACT"
    : "FAIL_TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_STATIC_CONTRACT",
  failures,
  static_contract_smoke: failures.length === 0 ? "PASS" : "FAIL",
  browser_preset_selector_runtime_smoke: "NOT_RUN",
  browser_preset_selector_runtime_reason: "PLAYWRIGHT_NOT_INSTALLED",
  runtime_actually_executed: false,
  runtime_pass_claimed: false,
  silent_preset_fallback_detected: false,
  invalid_custom_preset_clamped: false,
  hidden_resize_policy_used: false,
  hidden_target_bytes_policy_used: false,
  hidden_aspect_policy_used: false,
  hidden_padding_policy_used: false,
  encoder_side_resize_allowed: false,
  encoder_side_crop_allowed: false,
  sha256_files_emitted: false
};

fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_11_R1_STATIC_CHECK_RESULT.json"),
  `${JSON.stringify(result, null, 2)}\n`
);

console.log(result.marker);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
