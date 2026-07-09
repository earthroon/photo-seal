import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checksPath = path.join(root, "specs/TDT_PHOTOSEAL_07_R1_STATIC_CHECKS.json");
const checks = JSON.parse(fs.readFileSync(checksPath, "utf8"));
const failures = [];

for (const file of checks.required_files) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`missing file: ${file}`);
}

const sourceFiles = [
  ...checks.required_files,
  "package.json",
  "packages/photo-seal-web/src/main.ts",
  "packages/photo-seal-web/src/dev/registerPhotoSealE2ESmoke.ts"
];

const existingFiles = sourceFiles.filter((file) => fs.existsSync(path.join(root, file)));
const haystack = existingFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");

for (const token of checks.required_tokens) {
  if (!haystack.includes(token)) failures.push(`missing token: ${token}`);
}

const forbiddenFiles = existingFiles.filter((file) =>
  !file.endsWith("TDT_PHOTOSEAL_07_R1_BROWSER_WEBGPU_RUNTIME_HARNESS_SPEC.md") &&
  !file.endsWith("TDT_PHOTOSEAL_07_R1_STATIC_CHECKS.json")
);
const forbiddenHaystack = forbiddenFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");

for (const token of checks.forbidden_tokens) {
  if (forbiddenHaystack.includes(token)) failures.push(`forbidden token: ${token}`);
}

const receiptPath = path.join(root, "artifacts/TDT_PHOTOSEAL_07_R1_RUNTIME_E2E_RECEIPT.json");
const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
if (receipt.patchId !== "TDT-PHOTOSEAL-07-R1") failures.push("runtime receipt patchId mismatch");
if (receipt.browserRuntimeE2ESmoke !== "NOT_RUN") failures.push("static bake runtime receipt must be NOT_RUN");
if (receipt.browserRuntimeActuallyExecuted !== false) failures.push("browserRuntimeActuallyExecuted must be false in static bake");
if (receipt.runtimePassClaimed !== false) failures.push("runtimePassClaimed must be false in static bake");
if (receipt.mockReceiptUsedForRuntimePass !== false) failures.push("runtime pass mock guard must be false");
if (receipt.staticSmokeUsedAsRuntimePass !== false) failures.push("static smoke cannot be runtime pass");
if (receipt.playwrightAssemblyUsedAsRuntimePass !== false) failures.push("playwright assembly cannot be runtime pass");
if (receipt.receiptCaptured !== true) failures.push("runtime receipt artifact must be captured, even when NOT_RUN");

if (failures.length > 0) {
  console.error("FAIL_TDT_PHOTOSEAL_07_R1_PLAYWRIGHT_RUNTIME_STATIC_CONTRACT");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PASS_TDT_PHOTOSEAL_07_R1_PLAYWRIGHT_RUNTIME_STATIC_CONTRACT");
