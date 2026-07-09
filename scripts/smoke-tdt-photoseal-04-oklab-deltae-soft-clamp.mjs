import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = JSON.parse(fs.readFileSync(path.join(root, "specs/TDT_PHOTOSEAL_04_STATIC_CHECKS.json"), "utf8"));
const srcFiles = [
  "packages/photo-seal-web/src/resize/deltaEGateParams.ts",
  "packages/photo-seal-web/src/resize/deltaEGateReceipt.ts",
  "packages/photo-seal-web/src/resize/adaptiveEwaDeltaEGate.ts",
  "packages/photo-seal-web/src/resize/shaders/adaptiveEwaDeltaEGate.wgsl",
  "packages/photo-seal-web/src/resize/types.ts",
];
const allFiles = [...new Set([...checks.required_files, "specs/TDT_PHOTOSEAL_04_OKLAB_DELTAE_RESUME_PHOTO_SOFT_CLAMP_SPEC.md"])]

let ok = true;
const issues = [];
for (const rel of checks.required_files) {
  if (!fs.existsSync(path.join(root, rel))) {
    ok = false;
    issues.push(`missing file: ${rel}`);
  }
}
const combined = allFiles
  .filter((rel) => fs.existsSync(path.join(root, rel)))
  .map((rel) => fs.readFileSync(path.join(root, rel), "utf8"))
  .join("\n");
for (const token of checks.required_tokens) {
  if (!combined.includes(token)) {
    ok = false;
    issues.push(`missing token: ${token}`);
  }
}
const srcCombined = srcFiles
  .filter((rel) => fs.existsSync(path.join(root, rel)))
  .map((rel) => fs.readFileSync(path.join(root, rel), "utf8"))
  .join("\n");
for (const token of checks.forbidden_tokens_for_src) {
  if (srcCombined.includes(token)) {
    ok = false;
    issues.push(`forbidden src token: ${token}`);
  }
}

if (!ok) {
  console.error(checks.fail_marker);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log(checks.pass_marker);
