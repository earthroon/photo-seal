import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const passMarker = "PASS_TDT_PHOTOSEAL_13_H3_R7_DELTAK_TANGENT_TENSOR_INTERPOLATION";
const failMarker = "FAIL_TDT_PHOTOSEAL_13_H3_R7_DELTAK_TANGENT_TENSOR_INTERPOLATION";

const requiredFiles = [
  "packages/photo-seal-web/src/export/deltaKTangentPolicy.ts",
  "packages/photo-seal-web/src/resize/shaders/deltaKStructureTensor.wgsl",
  "packages/photo-seal-web/src/resize/shaders/deltaKTangentInterpolate.wgsl",
  "packages/photo-seal-web/src/resize/shaders/deltaKNormalOvershootClamp.wgsl",
  "packages/photo-seal-web/src/resize/webgpuExportDownscale.ts",
  "packages/photo-seal-web/src/resize/resizeReceipt.ts",
  "packages/photo-seal-web/src/resize/types.ts",
  "packages/photo-seal-web/src/App.vue",
  "specs/TDT_PHOTOSEAL_13_H3_R7_DELTAK_TANGENT_TENSOR_SPEC.md",
];

const requiredTokens = [
  ["packages/photo-seal-web/src/export/deltaKTangentPolicy.ts", "resolveDeltaKTangentInterpolationPolicy"],
  ["packages/photo-seal-web/src/export/deltaKTangentPolicy.ts", "normalOvershootRecoveryAllowed: false"],
  ["packages/photo-seal-web/src/export/deltaKTangentPolicy.ts", "normalResidualStrength: 0"],
  ["packages/photo-seal-web/src/export/deltaKTangentPolicy.ts", "tangentDetailStrength"],
  ["packages/photo-seal-web/src/resize/webgpuExportDownscale.ts", "deltaKStructureTensorWGSL"],
  ["packages/photo-seal-web/src/resize/webgpuExportDownscale.ts", "photoseal-deltak-structure-tensor-bindgroup"],
  ["packages/photo-seal-web/src/resize/webgpuExportDownscale.ts", "photoseal-deltak-tangent-interpolate-bindgroup"],
  ["packages/photo-seal-web/src/resize/webgpuExportDownscale.ts", "photoseal-deltak-normal-overshoot-clamp-bindgroup"],
  ["packages/photo-seal-web/src/resize/resizeReceipt.ts", "deltaKTangentPolicy"],
  ["packages/photo-seal-web/src/resize/types.ts", "DeltaKTangentInterpolationPolicy"],
  ["packages/photo-seal-web/src/App.vue", "ΔK 탄젠트 보간"],
  ["packages/photo-seal-web/src/App.vue", "normal 방향 복구"],
  ["packages/photo-seal-web/src/App.vue", "tangent 디테일 복구"],
  ["specs/TDT_PHOTOSEAL_13_H3_R7_DELTAK_TANGENT_TENSOR_SPEC.md", passMarker],
];

const forbiddenSrcTokens = [
  "canvas.toBlob",
  "toDataURL",
  "convertToBlob",
  "fallbackToBrowser",
  "browserEncoderFallback",
  "normalOvershootRecoveryAllowed: true",
];

const errors = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`missing file: ${file}`);
}
for (const [file, token] of requiredTokens) {
  const full = path.join(root, file);
  const text = fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
  if (!text.includes(token)) errors.push(`missing token in ${file}: ${token}`);
}

const srcFiles = [
  "packages/photo-seal-web/src/export/deltaKTangentPolicy.ts",
  "packages/photo-seal-web/src/resize/webgpuExportDownscale.ts",
  "packages/photo-seal-web/src/resize/resizeReceipt.ts",
  "packages/photo-seal-web/src/resize/types.ts",
  "packages/photo-seal-web/src/App.vue",
];
for (const file of srcFiles) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  for (const token of forbiddenSrcTokens) {
    if (text.includes(token)) errors.push(`forbidden token in ${file}: ${token}`);
  }
}

if (errors.length) {
  console.error(failMarker);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const receipt = {
  patchId: "TDT-PHOTOSEAL-13-H3-R7",
  stage: "deltak-tangent-tensor-interpolation-static-smoke",
  lowpassAuthorityPreserved: true,
  deltaKTangentInterpolationAdded: true,
  structureTensorAdded: true,
  normalOvershootRecoveryAllowed: false,
  normalResidualStrength: 0,
  tangentDetailStrengthDefault: 0.1,
  browserJpegEncodeUsed: false,
  wasmEncoderAuthorityPreserved: true,
  staticContractSmoke: "PASS",
  browserRuntimeSmoke: "NOT_RUN",
  runtimeActuallyExecuted: false,
  runtimePassClaimed: false,
  sha256FilesEmitted: false,
  passMarker,
};
fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts", "TDT_PHOTOSEAL_13_H3_R7_DELTAK_TANGENT_RECEIPT.json"),
  `${JSON.stringify(receipt, null, 2)}\n`
);
console.log(passMarker);
