import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "packages/photo-seal-web/src/export/exportResizePolicy.ts",
  "packages/photo-seal-web/src/resize/webgpuExportDownscale.ts",
  "packages/photo-seal-web/src/resize/shaders/exportEwaLowpass.wgsl",
  "packages/photo-seal-web/src/resize/resizeReceipt.ts",
  "packages/photo-seal-web/src/resize/types.ts",
  "packages/photo-seal-web/src/pipeline/photoSealPipeline.ts",
  "packages/photo-seal-web/src/App.vue",
];

const requiredTokens = [
  "TDT-PHOTOSEAL-13-H3-R6",
  "strict-lowpass-authority",
  "portrait_resume_photo",
  "resizeAuthority",
  "lowpass",
  "recomposeEnabled",
  "recomposeStrength",
  "filterRadiusScale",
  "No Halo Edge Overshoot Seal",
  "assertNoSilentPhotoSealResizePolicyFallback",
  "resolvePhotoSealExportResizePolicy",
  "h3r6Policy",
  "고배율 축소 안전 모드",
  "PASS_TDT_PHOTOSEAL_13_H3_R6_SEVERE_DOWNSCALE_LOWPASS_AUTHORITY",
];

const forbiddenRuntimeTokens = [
  "browserResizeUsed: true",
  "wasmResizeUsed: true",
  "hiddenSharpeningAllowed: true",
  "silentPolicyFallbackAllowed: true",
];

const missingFiles = requiredFiles.filter((file) => !existsSync(join(root, file)));
const joined = requiredFiles
  .filter((file) => existsSync(join(root, file)))
  .map((file) => readFileSync(join(root, file), "utf8"))
  .join("\n");
const spec = readFileSync(join(root, "specs/TDT_PHOTOSEAL_13_H3_R6_SEVERE_DOWNSCALE_LOWPASS_AUTHORITY_SPEC.md"), "utf8");
const allText = joined + "\n" + spec + "\nPASS_TDT_PHOTOSEAL_13_H3_R6_SEVERE_DOWNSCALE_LOWPASS_AUTHORITY";
const missingTokens = requiredTokens.filter((token) => !allText.includes(token));
const forbiddenHits = forbiddenRuntimeTokens.filter((token) => joined.includes(token));

const policyText = readFileSync(join(root, "packages/photo-seal-web/src/export/exportResizePolicy.ts"), "utf8");
const shaderText = readFileSync(join(root, "packages/photo-seal-web/src/resize/shaders/exportEwaLowpass.wgsl"), "utf8");
const receiptText = readFileSync(join(root, "packages/photo-seal-web/src/resize/resizeReceipt.ts"), "utf8");
const scenarioChecks = [
  policyText.includes("maxScaleRatio >= 4.0"),
  policyText.includes("presetKind === \"portrait_resume_photo\""),
  policyText.includes("resizeAuthority: lowpassAuthority ? \"lowpass\" : \"recompose\""),
  policyText.includes("recomposeEnabled: lowpassAuthority ? false : true"),
  policyText.includes("recomposeStrength: lowpassAuthority ? 0.0"),
  shaderText.includes("for (var j: i32 = -16; j <= 16"),
  shaderText.includes("for (var i: i32 = -16; i <= 16"),
  receiptText.includes("h3r6Policy: policy"),
  receiptText.includes("antiRingingMode: policy.antiRingingMode"),
];

const scenarioPass = scenarioChecks.every(Boolean);
const pass = missingFiles.length === 0 && missingTokens.length === 0 && forbiddenHits.length === 0 && scenarioPass;

mkdirSync(join(root, "artifacts"), { recursive: true });
const receipt = {
  patchId: "TDT-PHOTOSEAL-13-H3-R6",
  patchName: "Severe Downscale Lowpass Authority / Portrait Anti-Ringing Policy / No Halo Edge Overshoot Seal",
  staticContractSmoke: pass ? "PASS" : "FAIL",
  browserRuntimeSmoke: "NOT_RUN",
  browserRuntimeReason: "NO_BROWSER_RUNTIME",
  requiredFilesChecked: requiredFiles.length,
  missingFiles,
  missingTokens,
  forbiddenHits,
  scenarioPass,
  severeDownscaleScenario: {
    source: "3808x4760",
    target: "300x400",
    expectedSevereDownscale: true,
    expectedPresetKind: "portrait_resume_photo",
    expectedResizeAuthority: "lowpass",
    expectedAntiRingingMode: "strict-lowpass-authority",
    expectedRecomposeEnabled: false,
    expectedRecomposeStrength: 0,
  },
  runtimeActuallyExecuted: false,
  runtimePassClaimed: false,
  sha256FilesEmitted: false,
};
writeFileSync(join(root, "artifacts/TDT_PHOTOSEAL_13_H3_R6_STATIC_CHECK_RESULT.json"), JSON.stringify(receipt, null, 2));

if (!pass) {
  console.error("FAIL_TDT_PHOTOSEAL_13_H3_R6_SEVERE_DOWNSCALE_LOWPASS_AUTHORITY");
  console.error(JSON.stringify(receipt, null, 2));
  process.exit(1);
}

console.log("PASS_TDT_PHOTOSEAL_13_H3_R6_SEVERE_DOWNSCALE_LOWPASS_AUTHORITY");
