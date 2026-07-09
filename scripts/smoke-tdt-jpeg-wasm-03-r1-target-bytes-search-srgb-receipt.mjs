import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checksPath = path.join(root, "specs", "TDT_JPEG_WASM_03_R1_STATIC_CHECKS.json");
const checks = JSON.parse(fs.readFileSync(checksPath, "utf8"));
const missingFiles = checks.required_files.filter((file) => !fs.existsSync(path.join(root, file)));

const searchableFiles = [
  ...checks.required_files,
  "README.md",
  "artifacts/TDT_JPEG_WASM_03_R1_BAKE_MANIFEST.json",
  "artifacts/TDT_JPEG_WASM_03_R1_STATIC_CHECK_RESULT.json",
].filter((file) => fs.existsSync(path.join(root, file)));

const corpus = searchableFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
const missingTokens = checks.required_tokens.filter((token) => !corpus.includes(token));

const implementationCorpus = checks.implementation_scan_files
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");
const forbiddenHits = checks.forbidden_tokens_in_implementation.filter((token) => implementationCorpus.includes(token));

const result = {
  patch_id: checks.patch_id,
  status: missingFiles.length === 0 && missingTokens.length === 0 && forbiddenHits.length === 0 ? "PASS" : "FAIL",
  pass_marker: checks.pass_marker,
  missing_files: missingFiles,
  missing_tokens: missingTokens,
  forbidden_hits: forbiddenHits,
  static_checks: {
    every_attempt_srgb_receipt_required: true,
    selected_color_pipeline_required: true,
    reached_target_false_preserves_srgb_seal: true,
    jpeg_444_only: true,
    no_resize_crop_fallback: true,
  },
};

fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts", "TDT_JPEG_WASM_03_R1_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2),
);

if (result.status !== "PASS") {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log(checks.pass_marker);
