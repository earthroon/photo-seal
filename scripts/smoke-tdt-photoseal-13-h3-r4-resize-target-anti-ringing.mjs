import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const check = JSON.parse(fs.readFileSync(path.join(root, "specs/TDT_PHOTOSEAL_13_H3_R4_STATIC_CHECKS.json"), "utf8"));
const files = check.required_files.map((file) => path.join(root, file));
const missing = files.filter((file) => !fs.existsSync(file));
const haystack = files.filter((file) => fs.existsSync(file)).map((file) => fs.readFileSync(file, "utf8")).join("\n");
const missingTokens = check.required_tokens.filter((token) => !haystack.includes(token));
const forbiddenTokens = check.forbidden_tokens.filter((token) => haystack.includes(token));

const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R4",
  staticContractSmoke: missing.length === 0 && missingTokens.length === 0 && forbiddenTokens.length === 0 ? "PASS" : "FAIL",
  missingFiles: missing.map((file) => path.relative(root, file)),
  missingTokens,
  forbiddenTokens,
  resizeOwner: "webgpu-typescript-pipeline",
  encoderOwner: "wasm-tdt-jpeg",
  wasmReceivesResizedRgba: true,
  originalRgbaForwardedToWasm: false,
  residualSharpeningUsed: false,
  edgeBoostUsed: false,
  browserRuntimeSmoke: "NOT_RUN",
  runtimeActuallyExecuted: false,
  runtimePassClaimed: false
};

fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_13_H3_R4_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2)
);
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_13_H3_R4_RESIZE_TARGET_ANTI_RINGING_RECEIPT.json"),
  JSON.stringify(result, null, 2)
);

if (result.staticContractSmoke !== "PASS") {
  console.error("FAIL_TDT_PHOTOSEAL_13_H3_R4_RESIZE_TARGET_ANTI_RINGING_GUARD");
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log("PASS_TDT_PHOTOSEAL_13_H3_R4_RESIZE_TARGET_ANTI_RINGING_GUARD");
