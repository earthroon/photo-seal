#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pass = "PASS_TDT_PHOTOSEAL_04_R1_OKLAB_METRIC_LOCAL_SEAL_REBIND";
const fail = "FAIL_TDT_PHOTOSEAL_04_R1_OKLAB_METRIC_LOCAL_SEAL_REBIND";
const checksPath = path.join(root, "specs/TDT_PHOTOSEAL_04_R1_STATIC_CHECKS.json");
const checks = JSON.parse(fs.readFileSync(checksPath, "utf8"));

const srcFiles = [
  "packages/photo-seal-web/src/resize/adaptiveEwaDeltaEGate.ts",
  "packages/photo-seal-web/src/resize/deltaEGateReceipt.ts",
  "packages/photo-seal-web/src/resize/shaders/adaptiveEwaDeltaEGate.wgsl",
];

function die(message) {
  console.error(fail);
  console.error(message);
  process.exit(1);
}

for (const file of checks.required_files) {
  if (!fs.existsSync(path.join(root, file))) die(`missing required file: ${file}`);
}

const allText = checks.required_files
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

for (const token of checks.required_tokens) {
  if (!allText.includes(token)) die(`missing required token: ${token}`);
}

const srcText = srcFiles
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

for (const token of checks.forbidden_tokens_in_src) {
  if (srcText.includes(token)) die(`forbidden src token found: ${token}`);
}

if (!srcText.includes("runtimeWebGpuSmoke") && !fs.readFileSync(path.join(root, "artifacts/TDT_PHOTOSEAL_04_R1_BAKE_MANIFEST.json"), "utf8").includes("NOT_RUN")) {
  die("runtime WebGPU NOT_RUN policy was not recorded");
}

console.log(pass);
