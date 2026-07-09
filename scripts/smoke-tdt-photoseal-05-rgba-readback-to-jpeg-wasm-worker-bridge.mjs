import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checksPath = path.join(root, "specs", "TDT_PHOTOSEAL_05_STATIC_CHECKS.json");
const checks = JSON.parse(fs.readFileSync(checksPath, "utf8"));

const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
let ok = true;
const errors = [];

for (const file of checks.required_files) {
  if (!fs.existsSync(path.join(root, file))) {
    ok = false;
    errors.push(`missing file: ${file}`);
  }
}

const corpus = checks.required_files
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => read(file))
  .join("\n");

for (const token of checks.required_tokens) {
  if (!corpus.includes(token)) {
    ok = false;
    errors.push(`missing token: ${token}`);
  }
}

const srcFiles = checks.required_files.filter((file) => file.includes("/src/"));
const srcCorpus = srcFiles
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => read(file))
  .join("\n");

for (const token of checks.forbidden_tokens_src) {
  if (srcCorpus.includes(token)) {
    ok = false;
    errors.push(`forbidden src token: ${token}`);
  }
}

if (!ok) {
  console.error("FAIL_TDT_PHOTOSEAL_05_RGBA_READBACK_TO_JPEG_WASM_WORKER_BRIDGE");
  for (const error of errors) console.error(error);
  process.exit(1);
}

console.log("PASS_TDT_PHOTOSEAL_05_RGBA_READBACK_TO_JPEG_WASM_WORKER_BRIDGE");
