#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = JSON.parse(fs.readFileSync(path.join(root, "specs/TDT_PHOTOSEAL_12_STATIC_CHECKS.json"), "utf8"));
const fail = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

for (const rel of checks.required_files) {
  if (!fs.existsSync(path.join(root, rel))) fail.push(`missing file: ${rel}`);
}

const allText = checks.required_files
  .filter((rel) => fs.existsSync(path.join(root, rel)))
  .map((rel) => read(rel))
  .join("\n");
for (const token of checks.required_tokens) {
  if (!allText.includes(token)) fail.push(`missing token: ${token}`);
}

const scanRoots = [
  "packages/photo-seal-web/src/documentation",
  "packages/photo-seal-web/src/components/documentation",
  "packages/photo-seal-web/src/dev/registerPhotoSealPresetDocumentationSmoke.ts",
  "packages/photo-seal-web/src/receipt/exportAuditTypes.ts",
  "packages/photo-seal-web/src/receipt/exportAuditSurface.ts",
  "packages/photo-seal-web/src/receipt/exportAuditWarnings.ts",
  "scripts/smoke-tdt-photoseal-12-export-preset-documentation.mjs",
];
function collectFiles(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return [];
  const stat = fs.statSync(abs);
  if (stat.isFile()) return [abs];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(rel, entry.name);
    return entry.isDirectory() ? collectFiles(next) : [path.join(root, next)];
  });
}
const implText = scanRoots.flatMap(collectFiles).map((abs) => fs.readFileSync(abs, "utf8")).join("\n");
for (const token of checks.forbidden_tokens) {
  if (implText.includes(token)) fail.push(`forbidden token in implementation/ui/script: ${token}`);
}

const passMarker = "PASS_TDT_PHOTOSEAL_12_EXPORT_PRESET_DOCUMENTATION_NO_COMPLIANCE_OVERCLAIM";
const result = {
  patch_id: "TDT-PHOTOSEAL-12",
  static_contract_smoke: fail.length === 0 ? "PASS" : "FAIL",
  browser_preset_documentation_smoke: "NOT_RUN",
  browser_preset_documentation_reason: "NO_BROWSER_RUNTIME",
  runtime_actually_executed: false,
  runtime_pass_claimed: false,
  required_files_checked: checks.required_files.length,
  required_tokens_checked: checks.required_tokens.length,
  forbidden_tokens_checked: checks.forbidden_tokens.length,
  forbidden_scan_scope: checks.forbidden_scan_scope,
  failures: fail,
  pass_marker: fail.length === 0 ? passMarker : undefined,
};
fs.writeFileSync(path.join(root, "artifacts/TDT_PHOTOSEAL_12_STATIC_CHECK_RESULT.json"), JSON.stringify(result, null, 2) + "\n");
if (fail.length > 0) {
  console.error("FAIL_TDT_PHOTOSEAL_12_EXPORT_PRESET_DOCUMENTATION_NO_COMPLIANCE_OVERCLAIM");
  console.error(fail.join("\n"));
  process.exit(1);
}
console.log(passMarker);
