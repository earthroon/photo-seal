import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pipelinePath = path.join(root, "packages/photo-seal-web/src/pipeline/photoSealPipeline.ts");
const text = fs.readFileSync(pipelinePath, "utf8");

const forbiddenRuntimeFragments = [
  "h3r7DeltaKTangentPolicy: (resizeResult.receipt as any).deltaKTangentPolicy,\n    cropReceipt?: PhotoSealCropReceipt | null;",
];

const requiredFragments = [
  "h3r7DeltaKTangentPolicy: (resizeResult.receipt as any).deltaKTangentPolicy,\n    cropReceipt,\n    colorPipeline:",
  "cropReceipt?: PhotoSealCropReceipt | null;\n  colorPipeline: {",
  "CROP_REQUIRED_BUT_MISSING",
];

const foundForbidden = forbiddenRuntimeFragments.filter((fragment) => text.includes(fragment));
const missingRequired = requiredFragments.filter((fragment) => !text.includes(fragment));
const ok = foundForbidden.length === 0 && missingRequired.length === 0;

const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8-R1",
  basePatch: "TDT-PHOTOSEAL-13-H3-R8",
  pass: ok,
  foundForbidden,
  missingRequired,
  runtimeActuallyExecuted: false,
  runtimePassClaimed: false,
  marker: ok
    ? "PASS_TDT_PHOTOSEAL_13_H3_R8_R1_PIPELINE_PARSE_HOTFIX"
    : "FAIL_TDT_PHOTOSEAL_13_H3_R8_R1_PIPELINE_PARSE_HOTFIX",
};

fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_13_H3_R8_R1_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2),
);

console.log(result.marker);
if (!ok) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
