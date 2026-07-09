import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const patchId = "TDT-PHOTOSEAL-12-R1";
const checks = JSON.parse(fs.readFileSync(path.join(root, "specs/TDT_PHOTOSEAL_12_R1_STATIC_CHECKS.json"), "utf8"));
const implementationFiles = [
  "packages/photo-seal-web/src/documentation/documentationRuntimeSmokeTypes.ts",
  "packages/photo-seal-web/src/documentation/documentationRuntimeSmokeReceipt.ts",
  "packages/photo-seal-web/src/documentation/clipboardRuntimeProbe.ts",
  "packages/photo-seal-web/src/documentation/documentationUiRuntimeSmoke.ts",
  "packages/photo-seal-web/src/dev/registerPhotoSealDocumentationUiSmoke.ts",
  "packages/photo-seal-web/e2e/photoSealDocumentationUiRuntime.spec.ts",
  "packages/photo-seal-web/e2e/documentationUiRuntimeReceiptWriter.ts",
  "packages/photo-seal-web/src/components/documentation/PresetInstitutionNoteCopy.vue",
  "scripts/smoke-tdt-photoseal-12-r1-documentation-ui-runtime.mjs"
];
const requiredCorpusFiles = [...new Set([...checks.required_files, ...implementationFiles])];
const failures = [];
for (const file of checks.required_files) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`missing file: ${file}`);
}
const corpus = requiredCorpusFiles
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");
for (const token of checks.required_tokens) {
  if (!corpus.includes(token)) failures.push(`missing token: ${token}`);
}
const implementationCorpus = implementationFiles
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");
for (const token of checks.forbidden_tokens_in_implementation) {
  if (implementationCorpus.includes(token)) failures.push(`forbidden implementation token: ${token}`);
}
const result = {
  patch_id: patchId,
  status: failures.length === 0 ? "PASS" : "FAIL",
  failures,
  static_contract_smoke: failures.length === 0 ? "PASS" : "FAIL",
  browser_documentation_ui_runtime_smoke: "NOT_RUN",
  browser_documentation_ui_runtime_reason: "NO_BROWSER_RUNTIME",
  runtime_pass_claimed: false,
  sha256_files_emitted: false
};
fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(path.join(root, "artifacts/TDT_PHOTOSEAL_12_R1_STATIC_CHECK_RESULT.json"), JSON.stringify(result, null, 2) + "\n");
if (failures.length > 0) {
  console.error("FAIL_TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_STATIC_CONTRACT");
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("PASS_TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_STATIC_CONTRACT");
