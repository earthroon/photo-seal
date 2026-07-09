import fs from "node:fs";
import path from "node:path";

const patchId = "TDT-PHOTOSEAL-09-R1";
const checksPath = "specs/TDT_PHOTOSEAL_09_R1_STATIC_CHECKS.json";
const resultPath = "artifacts/TDT_PHOTOSEAL_09_R1_STATIC_CHECK_RESULT.json";
const passMarker = "PASS_TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_STATIC_CONTRACT";
const failMarker = "FAIL_TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_STATIC_CONTRACT";

const checks = JSON.parse(fs.readFileSync(checksPath, "utf8"));
const failures = [];

for (const file of checks.required_files) {
  if (!fs.existsSync(file)) failures.push(`missing file: ${file}`);
}

const implementationFiles = checks.required_files.filter((file) => !file.startsWith("specs/"));
const implementationCorpus = implementationFiles
  .filter((file) => fs.existsSync(file))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
const fullCorpus = checks.required_files
  .filter((file) => fs.existsSync(file))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

for (const token of checks.required_tokens) {
  if (!fullCorpus.includes(token)) failures.push(`missing token: ${token}`);
}

for (const token of checks.forbidden_tokens) {
  if (implementationCorpus.includes(token)) failures.push(`forbidden implementation token: ${token}`);
}

const runtimeReceiptPath = "artifacts/TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_RECEIPT.json";
if (!fs.existsSync(runtimeReceiptPath)) failures.push(`missing runtime receipt artifact: ${runtimeReceiptPath}`);
else {
  const receipt = JSON.parse(fs.readFileSync(runtimeReceiptPath, "utf8"));
  if (receipt.patchId !== patchId) failures.push("runtime receipt patchId mismatch");
  if (receipt.browserJpegSaveRuntimeSmoke === "PASS" && receipt.browserRuntimeActuallyExecuted !== true) {
    failures.push("runtime PASS without browserRuntimeActuallyExecuted true");
  }
  if (receipt.staticSmokeUsedAsRuntimePass !== false) failures.push("static smoke used as runtime pass");
  if (receipt.mockSaveReceiptUsedForRuntimePass !== false) failures.push("mock save receipt used as runtime pass");
  if (receipt.rawAuditBundleSavedByDefault !== false) failures.push("raw audit bundle saved by default");
  if (receipt.auditBundleOptional !== true) failures.push("audit bundle optional flag missing");
}

const result = {
  patch_id: patchId,
  status: failures.length === 0 ? "PASS" : "FAIL",
  pass_marker: failures.length === 0 ? passMarker : null,
  fail_marker: failures.length > 0 ? failMarker : null,
  failures,
  static_contract_smoke: failures.length === 0 ? "PASS" : "FAIL",
  browser_jpeg_save_runtime_smoke: fs.existsSync(runtimeReceiptPath)
    ? JSON.parse(fs.readFileSync(runtimeReceiptPath, "utf8")).browserJpegSaveRuntimeSmoke
    : "MISSING",
};

fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(result.status === "PASS" ? passMarker : failMarker);
if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
