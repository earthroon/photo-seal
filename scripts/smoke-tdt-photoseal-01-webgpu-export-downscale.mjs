import { existsSync, readFileSync } from "node:fs";

const required = [
  "packages/photo-seal-web/src/resize/webgpuExportDownscale.ts",
  "packages/photo-seal-web/src/resize/types.ts",
  "packages/photo-seal-web/src/resize/resizeReceipt.ts",
  "packages/photo-seal-web/src/resize/shaders/exportEwaLowpass.wgsl",
  "packages/photo-seal-web/src/resize/shaders/exportEwaRecompose.wgsl",
];

const requiredTokens = [
  "TDT-PHOTOSEAL-01",
  "downscaleRgbaWithWebGPUExportEwa",
  "export-ewa",
  "rgba8unorm",
  "rgba16float",
  "fallbackUsed: false",
  "INVALID_RGBA_LENGTH",
  "READBACK_SIZE_MISMATCH",
  "alignTo256",
  "dstWidth * dstHeight * 4",
];

const forbiddenTokens = [
  "cpuFallback",
  "fallbackUsed: true",
  "adaptive-ewa",
  "aniso-ewa",
  "deltaE",
  "encodeJpeg",
  "targetBytes",
  "subsampling",
  "YCbCr",
];

const missingFiles = required.filter((file) => !existsSync(file));
if (missingFiles.length > 0) {
  console.error("FAIL_TDT_PHOTOSEAL_01_DADUMDADUM_EXPORT_DOWNSCALE_CORE_EXTRACTION");
  console.error({ missingFiles });
  process.exit(1);
}

const joined = required.map((file) => readFileSync(file, "utf8")).join("\n");
const missingTokens = requiredTokens.filter((token) => !joined.includes(token));
const forbiddenFound = forbiddenTokens.filter((token) => joined.includes(token));

if (missingTokens.length > 0 || forbiddenFound.length > 0) {
  console.error("FAIL_TDT_PHOTOSEAL_01_DADUMDADUM_EXPORT_DOWNSCALE_CORE_EXTRACTION");
  console.error({ missingTokens, forbiddenFound });
  process.exit(1);
}

console.log("PASS_TDT_PHOTOSEAL_01_DADUMDADUM_EXPORT_DOWNSCALE_CORE_EXTRACTION");
