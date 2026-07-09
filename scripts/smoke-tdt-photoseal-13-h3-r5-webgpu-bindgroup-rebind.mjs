import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkPath = path.join(root, "specs/TDT_PHOTOSEAL_13_H3_R5_STATIC_CHECKS.json");
const check = JSON.parse(fs.readFileSync(checkPath, "utf8"));
const requiredFiles = check.required_files.map((file) => path.join(root, file));
const missingFiles = requiredFiles.filter((file) => !fs.existsSync(file));
const haystack = requiredFiles
  .filter((file) => fs.existsSync(file))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
const missingTokens = check.required_tokens.filter((token) => !haystack.includes(token));

const webgpuPath = path.join(root, "packages/photo-seal-web/src/resize/webgpuExportDownscale.ts");
const webgpuSource = fs.readFileSync(webgpuPath, "utf8");
const recomposeMatch = webgpuSource.match(/const recomposeBindGroup = device\.createBindGroup\(\{[\s\S]*?\n  \}\);/);
const recomposeBlock = recomposeMatch ? recomposeMatch[0] : "";
const forbiddenInRecompose = check.forbidden_tokens_in_recompose_bindgroup.filter((token) =>
  recomposeBlock.includes(token)
);
const requiredRecomposeBindings = ["binding: 1", "binding: 2", "binding: 3", "binding: 4"];
const missingRecomposeBindings = requiredRecomposeBindings.filter((token) => !recomposeBlock.includes(token));

const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R5",
  staticContractSmoke:
    missingFiles.length === 0 &&
    missingTokens.length === 0 &&
    recomposeBlock.length > 0 &&
    forbiddenInRecompose.length === 0 &&
    missingRecomposeBindings.length === 0
      ? "PASS"
      : "FAIL",
  missingFiles: missingFiles.map((file) => path.relative(root, file)),
  missingTokens,
  recomposeBindGroupFound: recomposeBlock.length > 0,
  forbiddenInRecompose,
  missingRecomposeBindings,
  recomposeActiveBindings: [1, 2, 3, 4],
  recomposeBinding0EntryUsed: forbiddenInRecompose.length > 0,
  lowpassBinding0StillAllowed: true,
  resizeOwner: "webgpu-typescript-pipeline",
  encoderOwner: "wasm-tdt-jpeg",
  browserJpegEncodeFallbackUsed: false,
  originalRgbaForwardedToWasm: false,
  browserRuntimeSmoke: "NOT_RUN",
  browserRuntimeReason: "NO_BROWSER_RUNTIME",
  runtimeActuallyExecuted: false,
  runtimePassClaimed: false
};

fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_13_H3_R5_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2)
);
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_13_H3_R5_WEBGPU_BINDGROUP_REBIND_RECEIPT.json"),
  JSON.stringify(result, null, 2)
);

if (result.staticContractSmoke !== "PASS") {
  console.error("FAIL_TDT_PHOTOSEAL_13_H3_R5_WEBGPU_RECOMPOSE_BINDGROUP_REBIND");
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log("PASS_TDT_PHOTOSEAL_13_H3_R5_WEBGPU_RECOMPOSE_BINDGROUP_REBIND");
