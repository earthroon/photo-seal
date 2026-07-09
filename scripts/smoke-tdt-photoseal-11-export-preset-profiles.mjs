import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const staticChecksPath = path.join(root, "specs/TDT_PHOTOSEAL_11_STATIC_CHECKS.json");
const checks = JSON.parse(fs.readFileSync(staticChecksPath, "utf8"));
const failures = [];

for (const rel of checks.required_files) {
  if (!fs.existsSync(path.join(root, rel))) {
    failures.push(`missing file: ${rel}`);
  }
}

const scanFiles = [
  "packages/photo-seal-web/src/preset/exportPresetTypes.ts",
  "packages/photo-seal-web/src/preset/resumePhotoPresets.ts",
  "packages/photo-seal-web/src/preset/exportPresetRegistry.ts",
  "packages/photo-seal-web/src/preset/exportPresetReceipt.ts",
  "packages/photo-seal-web/src/preset/exportPresetResolver.ts",
  "packages/photo-seal-web/src/preset/presetToResizePolicy.ts",
  "packages/photo-seal-web/src/preset/presetRuntimeVerification.ts",
  "packages/photo-seal-web/src/components/preset/ExportPresetSelector.vue",
  "packages/photo-seal-web/src/components/preset/PresetReceiptBadge.vue",
  "packages/photo-seal-web/src/receipt/exportAuditTypes.ts",
  "packages/photo-seal-web/src/receipt/exportAuditSurface.ts",
  "packages/photo-seal-web/src/pipeline/photoSealPipeline.ts",
  "specs/TDT_PHOTOSEAL_11_EXPORT_PRESET_PROFILES_SPEC.md"
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
  patch_id: "TDT-PHOTOSEAL-11",
  status: failures.length === 0 ? "PASS" : "FAIL",
  marker: failures.length === 0
    ? "PASS_TDT_PHOTOSEAL_11_EXPORT_PRESET_PROFILES_RESUME_PHOTO_NO_HIDDEN_RESIZE_POLICY"
    : "FAIL_TDT_PHOTOSEAL_11_EXPORT_PRESET_PROFILES_RESUME_PHOTO_NO_HIDDEN_RESIZE_POLICY",
  failures,
  static_contract_smoke: failures.length === 0 ? "PASS" : "FAIL",
  browser_preset_policy_smoke: "NOT_RUN",
  browser_preset_policy_reason: "NO_BROWSER_RUNTIME",
  runtime_actually_executed: false,
  runtime_pass_claimed: false,
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
  path.join(root, "artifacts/TDT_PHOTOSEAL_11_STATIC_CHECK_RESULT.json"),
  `${JSON.stringify(result, null, 2)}\n`
);

console.log(result.marker);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
