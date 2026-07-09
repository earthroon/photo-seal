import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pass = "PASS_TDT_PHOTOSEAL_03_R2_DADUMDADUM_ADAPTIVE_QMAP_TILEMASK_CANDIDATE_PARITY_GATE";
const fail = "FAIL_TDT_PHOTOSEAL_03_R2_DADUMDADUM_ADAPTIVE_QMAP_TILEMASK_CANDIDATE_PARITY_GATE";

const requiredFiles = [
  "packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskParityGate.ts",
  "packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskParityMetrics.ts",
  "packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskParityReceipt.ts",
  "packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskParityPolicy.ts",
  "packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskDownscale.ts",
  "packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskReceipt.ts",
  "artifacts/TDT_PHOTOSEAL_03_R1_SOURCE_INVENTORY.json",
  "specs/TDT_PHOTOSEAL_03_R2_DADUMDADUM_ADAPTIVE_QMAP_TILEMASK_CANDIDATE_PARITY_GATE_SPEC.md",
];

const requiredTokens = [
  "TDT-PHOTOSEAL-03-R2",
  "dadum-adaptive-qmap-tilemask-parity-gate",
  "export-ewa",
  "dadum-adaptive-qmap-tilemask",
  "baselineProfile",
  "candidateProfile",
  "defaultProfileBefore",
  "defaultProfileAfter",
  "defaultProfileChanged",
  "promotedToDefault",
  "silentPromotionUsed",
  "autoPromotionUsed",
  "promotionRequiresExplicitPatch",
  "ExportEwaComparisonReceipt",
  "DadumCandidateComparisonReceipt",
  "DownscaleParityGateReceipt",
  "meanAbsChannelDiff",
  "maxAbsChannelDiff",
  "meanDeltaEProxy",
  "maxDeltaEProxy",
  "edgeRetentionProxy",
  "detailRetentionProxy",
  "qmapPresent",
  "tileMaskPresent",
  "adaptiveEwaPresent",
  "qmapBoundToAdaptivePass",
  "tileMaskBoundToAdaptivePass",
  "inputColorSpace",
  "baselineOutputColorSpace",
  "candidateOutputColorSpace",
  "srgb",
  "hiddenGammaTransformUsed",
  "doubleGammaDetected",
  "runtimeWebGpuSmoke",
  "comparisonReceiptWritten",
];

const forbiddenImplementationTokens = [
  "promotedToDefault: true",
  "defaultProfileChanged: true",
  "silentPromotionUsed: true",
  "autoPromotionUsed: true",
  "defaultProfileAfter: \"dadum-adaptive-qmap-tilemask\"",
  "candidate promoted",
  "production profile",
  "replace export-ewa",
  "qmapPresent: false",
  "tileMaskPresent: false",
  "adaptiveEwaPresent: false",
  "qmapBoundToAdaptivePass: false",
  "tileMaskBoundToAdaptivePass: false",
  "hiddenGammaTransformUsed: true",
  "doubleGammaDetected: true",
];

try {
  const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
  if (missingFiles.length) throw new Error(`missing required files: ${missingFiles.join(", ")}`);

  const implementationFiles = requiredFiles.filter((file) => file.endsWith(".ts"));
  const haystack = implementationFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
  const allText = requiredFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");

  const missingTokens = requiredTokens.filter((token) => !allText.includes(token));
  if (missingTokens.length) throw new Error(`missing required tokens: ${missingTokens.join(", ")}`);

  const forbiddenHits = forbiddenImplementationTokens.filter((token) => haystack.includes(token));
  if (forbiddenHits.length) throw new Error(`forbidden implementation tokens: ${forbiddenHits.join(", ")}`);

  const r1Inventory = JSON.parse(fs.readFileSync(path.join(root, "artifacts/TDT_PHOTOSEAL_03_R1_SOURCE_INVENTORY.json"), "utf8"));
  if (r1Inventory.patch_id !== "TDT-PHOTOSEAL-03-R1") throw new Error("source inventory patch_id mismatch");

  const manifest = JSON.parse(fs.readFileSync(path.join(root, "artifacts/TDT_PHOTOSEAL_03_R2_BAKE_MANIFEST.json"), "utf8"));
  if (manifest.default_profile_changed !== false) throw new Error("default_profile_changed must be false");
  if (manifest.promoted_to_default !== false) throw new Error("promoted_to_default must be false");
  if (manifest.runtime_webgpu_smoke !== "NOT_RUN") throw new Error("container bake manifest must record runtime_webgpu_smoke as NOT_RUN");
  if (manifest.sha256_files_emitted !== false) throw new Error("sha256 files must not be emitted");

  console.log(pass);
} catch (error) {
  console.error(fail);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
