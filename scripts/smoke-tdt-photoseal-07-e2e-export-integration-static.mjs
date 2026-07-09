import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checksPath = path.join(root, "specs/TDT_PHOTOSEAL_07_STATIC_CHECKS.json");
const checks = JSON.parse(fs.readFileSync(checksPath, "utf8"));
const sourceFiles = [
  ...checks.required_files,
  "scripts/smoke-tdt-photoseal-07-e2e-export-integration-static.mjs",
  "artifacts/TDT_PHOTOSEAL_07_E2E_SMOKE_RECEIPT.json",
  "artifacts/TDT_PHOTOSEAL_07_BAKE_MANIFEST.json"
];

const failures = [];
for (const file of checks.required_files) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`missing file: ${file}`);
  }
}

const haystack = sourceFiles
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

for (const token of checks.required_tokens) {
  if (!haystack.includes(token)) {
    failures.push(`missing token: ${token}`);
  }
}

const forbiddenFiles = sourceFiles.filter((file) =>
  fs.existsSync(path.join(root, file)) &&
  !file.endsWith("TDT_PHOTOSEAL_07_E2E_EXPORT_SMOKE_RECEIPT_INTEGRATION_SPEC.md") &&
  !file.endsWith("TDT_PHOTOSEAL_07_STATIC_CHECKS.json")
);
const forbiddenHaystack = forbiddenFiles
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

for (const token of checks.forbidden_tokens) {
  if (forbiddenHaystack.includes(token)) {
    failures.push(`forbidden token: ${token}`);
  }
}

const receipt = JSON.parse(fs.readFileSync(path.join(root, "artifacts/TDT_PHOTOSEAL_07_E2E_SMOKE_RECEIPT.json"), "utf8"));
if (receipt.browserRuntimeE2ESmoke !== "NOT_RUN") failures.push("browser runtime smoke must be NOT_RUN in static bake");
if (receipt.runtimePassClaimed !== false) failures.push("runtimePassClaimed must be false in static bake");
if (receipt.runtimeActuallyExecuted !== false) failures.push("runtimeActuallyExecuted must be false in static bake");
if (receipt.staticSmokeUsedAsRuntimePass !== false) failures.push("static smoke must not be runtime pass");
if (receipt.integrationSmokeUsedAsRuntimePass !== false) failures.push("integration smoke must not be runtime pass");

if (failures.length > 0) {
  console.error("FAIL_TDT_PHOTOSEAL_07_E2E_EXPORT_SMOKE_STATIC_CONTRACT");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS_TDT_PHOTOSEAL_07_E2E_EXPORT_SMOKE_STATIC_CONTRACT");
