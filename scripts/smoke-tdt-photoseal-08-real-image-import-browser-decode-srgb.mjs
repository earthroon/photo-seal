import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const specPath = join(root, "specs/TDT_PHOTOSEAL_08_STATIC_CHECKS.json");
const checks = JSON.parse(readFileSync(specPath, "utf8"));

function collectText(relativePath) {
  const absolute = join(root, relativePath);
  if (!existsSync(absolute)) return "";
  const stat = statSync(absolute);
  if (stat.isDirectory()) {
    return readdirSync(absolute)
      .sort()
      .map((name) => collectText(join(relativePath, name)))
      .join("\n");
  }
  return readFileSync(absolute, "utf8");
}

const missing = [];
for (const file of checks.required_files) {
  if (!existsSync(join(root, file))) missing.push(file);
}
const scanText = checks.scan_paths.map(collectText).join("\n");
const requiredMissing = checks.required_tokens.filter((token) => !scanText.includes(token));
const forbiddenFound = checks.forbidden_tokens.filter((token) => scanText.includes(token));
const pass = missing.length === 0 && requiredMissing.length === 0 && forbiddenFound.length === 0;
const result = {
  patch_id: "TDT-PHOTOSEAL-08",
  status: pass ? "PASS" : "FAIL",
  pass_marker: pass
    ? "PASS_TDT_PHOTOSEAL_08_REAL_IMAGE_IMPORT_BROWSER_DECODE_SRGB_NO_CANVAS_COLOR_CORRECTION"
    : "FAIL_TDT_PHOTOSEAL_08_REAL_IMAGE_IMPORT_BROWSER_DECODE_SRGB_NO_CANVAS_COLOR_CORRECTION",
  missing_files: missing,
  missing_tokens: requiredMissing,
  forbidden_tokens_found: forbiddenFound,
  browser_real_image_import_smoke: "NOT_RUN",
  browser_real_image_import_reason: "NO_BROWSER_RUNTIME",
  runtime_actually_executed: false,
  runtime_pass_claimed: false,
  sha256_files_emitted: false,
};
writeFileSync(
  join(root, "artifacts/TDT_PHOTOSEAL_08_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2)
);
console.log(result.pass_marker);
if (!pass) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
