import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const specPath = path.join(root, "specs/TDT_PHOTOSEAL_06_STATIC_CHECKS.json");
const checks = JSON.parse(fs.readFileSync(specPath, "utf8"));

const requiredFiles = checks.required_files;
const requiredTokens = checks.required_tokens;
const forbiddenTokens = checks.forbidden_tokens_in_implementation;

const implementationFiles = [
  "packages/photo-seal-web/src/receipt/exportAuditSurface.ts",
  "packages/photo-seal-web/src/receipt/exportAuditTypes.ts",
  "packages/photo-seal-web/src/receipt/exportAuditWarnings.ts",
  "packages/photo-seal-web/src/components/export/ExportReceiptSurface.vue",
  "packages/photo-seal-web/src/components/export/ExportAuditBadge.vue",
  "packages/photo-seal-web/src/components/export/ExportAuditSection.vue",
  "packages/photo-seal-web/src/components/export/ExportAuditWarnings.vue",
  "packages/photo-seal-web/src/components/export/ExportAuditDebugJson.vue",
  "packages/photo-seal-web/src/pipeline/photoSealPipeline.ts",
  "packages/photo-seal-web/src/App.vue"
];

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missingFiles.length > 0) {
  console.error("FAIL_TDT_PHOTOSEAL_06_EXPORT_RECEIPT_SURFACE_USER_VISIBLE_QUALITY_AUDIT_SEAL");
  console.error("Missing files:", missingFiles);
  process.exit(1);
}

const allText = requiredFiles.concat(implementationFiles)
  .filter((file, index, arr) => arr.indexOf(file) === index)
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

const missingTokens = requiredTokens.filter((token) => !allText.includes(token));
if (missingTokens.length > 0) {
  console.error("FAIL_TDT_PHOTOSEAL_06_EXPORT_RECEIPT_SURFACE_USER_VISIBLE_QUALITY_AUDIT_SEAL");
  console.error("Missing tokens:", missingTokens);
  process.exit(1);
}

const implementationText = implementationFiles
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

const forbiddenHits = forbiddenTokens.filter((token) => implementationText.includes(token));
if (forbiddenHits.length > 0) {
  console.error("FAIL_TDT_PHOTOSEAL_06_EXPORT_RECEIPT_SURFACE_USER_VISIBLE_QUALITY_AUDIT_SEAL");
  console.error("Forbidden implementation tokens:", forbiddenHits);
  process.exit(1);
}

const result = {
  patch_id: "TDT-PHOTOSEAL-06",
  status: "PASS",
  pass_marker: checks.pass_marker,
  static_smoke: "PASS",
  ui_runtime_smoke: "NOT_RUN",
  ui_runtime_smoke_reason: "VUE_RUNTIME_NOT_EXECUTED_IN_STATIC_SMOKE",
  raw_receipt_default_visible: false,
  user_visible_audit_surface: true,
  sha256_files_emitted: false
};

fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_06_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2) + "\n"
);

console.log(checks.pass_marker);
