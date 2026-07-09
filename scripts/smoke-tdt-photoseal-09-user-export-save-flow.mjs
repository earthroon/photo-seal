import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const markerPass = "PASS_TDT_PHOTOSEAL_09_USER_EXPORT_SAVE_FLOW_JPEG_BLOB_DOWNLOAD_AUDIT_BUNDLE_OPTIONAL_SAVE";
const markerFail = "FAIL_TDT_PHOTOSEAL_09_USER_EXPORT_SAVE_FLOW_JPEG_BLOB_DOWNLOAD_AUDIT_BUNDLE_OPTIONAL_SAVE";
const checksPath = path.join(root, "specs", "TDT_PHOTOSEAL_09_STATIC_CHECKS.json");
const checks = JSON.parse(fs.readFileSync(checksPath, "utf8"));

const failures = [];

for (const file of checks.required_files) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`missing file: ${file}`);
  }
}

const tokenFiles = checks.required_files.filter((file) => !file.endsWith(".json"));
const haystack = tokenFiles
  .map((file) => `${file}\n${fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), "utf8") : ""}`)
  .join("\n---FILE---\n");

for (const token of checks.required_tokens) {
  if (!haystack.includes(token)) {
    failures.push(`missing token: ${token}`);
  }
}

const implementationFiles = [
  "packages/photo-seal-web/src/export/saveTypes.ts",
  "packages/photo-seal-web/src/export/saveReceipt.ts",
  "packages/photo-seal-web/src/export/saveError.ts",
  "packages/photo-seal-web/src/export/saveFileName.ts",
  "packages/photo-seal-web/src/export/blobDownload.ts",
  "packages/photo-seal-web/src/export/saveJpeg.ts",
  "packages/photo-seal-web/src/export/saveAuditBundle.ts",
  "packages/photo-seal-web/src/components/export/ExportSaveActions.vue",
  "packages/photo-seal-web/src/components/export/ExportSaveStatus.vue",
  "packages/photo-seal-web/src/components/export/ExportSaveReceiptBadge.vue",
];
const implementationHaystack = implementationFiles
  .map((file) => fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), "utf8") : "")
  .join("\n");

for (const token of checks.forbidden_tokens) {
  if (implementationHaystack.includes(token)) {
    failures.push(`forbidden token: ${token}`);
  }
}

const result = {
  patchId: "TDT-PHOTOSEAL-09",
  staticContractSmoke: failures.length === 0 ? "PASS" : "FAIL",
  browserJpegSaveSmoke: "NOT_RUN",
  browserJpegSaveReason: "NO_BROWSER_RUNTIME",
  runtimeActuallyExecuted: false,
  runtimePassClaimed: false,
  rawAuditBundleSavedByDefault: false,
  auditBundleOptional: true,
  objectUrlRevokeRequired: true,
  failures,
};

fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts", "TDT_PHOTOSEAL_09_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2) + "\n"
);
fs.writeFileSync(
  path.join(root, "artifacts", "TDT_PHOTOSEAL_09_SAVE_SMOKE_RECEIPT.json"),
  JSON.stringify({
    patchId: "TDT-PHOTOSEAL-09",
    stage: "user-export-save-flow-jpeg-blob-download",
    staticContractSmoke: result.staticContractSmoke,
    browserJpegSaveSmoke: "NOT_RUN",
    browserJpegSaveReason: "NO_BROWSER_RUNTIME",
    runtimeActuallyExecuted: false,
    runtimePassClaimed: false,
    rawAuditBundleSavedByDefault: false,
    auditBundleOptional: true,
    objectUrlRevokeRequired: true,
  }, null, 2) + "\n"
);

if (failures.length > 0) {
  console.error(markerFail);
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(markerPass);
