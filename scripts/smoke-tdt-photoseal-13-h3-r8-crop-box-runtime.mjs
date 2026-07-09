import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "packages/photo-seal-web/src/crop/cropBoxTypes.ts",
  "packages/photo-seal-web/src/crop/cropBoxResolver.ts",
  "packages/photo-seal-web/src/crop/cropAspectGuard.ts",
  "packages/photo-seal-web/src/crop/cropBoundsGuard.ts",
  "packages/photo-seal-web/src/crop/cropVirtualGrid.ts",
  "packages/photo-seal-web/src/crop/cropSnapTypes.ts",
  "packages/photo-seal-web/src/crop/cropSnapResolver.ts",
  "packages/photo-seal-web/src/crop/cropReceipt.ts",
  "packages/photo-seal-web/src/crop/cropStateMachine.ts",
  "packages/photo-seal-web/src/components/crop/PortraitCropModal.vue",
  "packages/photo-seal-web/src/components/crop/PortraitCropStage.vue",
  "packages/photo-seal-web/src/components/crop/CropBoxOverlay.vue",
  "packages/photo-seal-web/src/components/crop/CropGuideOverlay.vue",
  "packages/photo-seal-web/src/components/crop/CropImageViewport.vue",
  "packages/photo-seal-web/src/components/crop/CropConfirmBar.vue",
  "packages/photo-seal-web/src/components/export/CropRequirementCard.vue",
  "packages/photo-seal-web/src/pipeline/photoSealPipeline.ts",
  "packages/photo-seal-web/src/resize/webgpuExportDownscale.ts",
  "packages/photo-seal-web/src/resize/shaders/exportEwaLowpass.wgsl",
  "packages/photo-seal-web/src/App.vue"
];

const requiredTokens = [
  "TDT-PHOTOSEAL-13-H3-R8",
  "PhotoSealCropBox",
  "NormalizedRect",
  "CropVirtualGrid",
  "PHOTO_SEAL_QUARTER_VIRTUAL_GRID",
  "CropSnapPolicy",
  "resolveCropSnap",
  "snapAuthority: \"assist-only\"",
  "PortraitCropModal",
  "CropBoxOverlay",
  "CropGuideOverlay",
  "CROP_REQUIRED_BUT_MISSING",
  "CROP_ASPECT_MISMATCH",
  "CROP_BOX_OUT_OF_BOUNDS",
  "encoderSideCropUsed: false",
  "resizeSideSilentCropUsed: false",
  "hiddenCenterCropUsed: false",
  "officialInstitutionComplianceClaimed: false",
  "samplingDomain",
  "cropSourceX",
  "cropReceipt"
];

const forbiddenTokens = [
  "hiddenCenterCropUsed: true",
  "encoderSideCropUsed: true",
  "resizeSideSilentCropUsed: true",
  "officialInstitutionComplianceClaimed: true",
  "canvas.toBlob",
  "toDataURL",
  "convertToBlob"
];

const allText = [];
const missingFiles = [];
for (const file of requiredFiles) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) {
    missingFiles.push(file);
    continue;
  }
  allText.push(fs.readFileSync(abs, "utf8"));
}
const joined = allText.join("\n");
const missingTokens = requiredTokens.filter((token) => !joined.includes(token));
const foundForbidden = forbiddenTokens.filter((token) => joined.includes(token));
const ok = missingFiles.length === 0 && missingTokens.length === 0 && foundForbidden.length === 0;
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8",
  pass: ok,
  missingFiles,
  missingTokens,
  foundForbidden,
  marker: ok ? "PASS_TDT_PHOTOSEAL_13_H3_R8_PORTRAIT_CROP_BOX_RUNTIME" : "FAIL_TDT_PHOTOSEAL_13_H3_R8_PORTRAIT_CROP_BOX_RUNTIME",
};
fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(path.join(root, "artifacts/TDT_PHOTOSEAL_13_H3_R8_STATIC_CHECK_RESULT.json"), JSON.stringify(result, null, 2));
console.log(result.marker);
if (!ok) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
