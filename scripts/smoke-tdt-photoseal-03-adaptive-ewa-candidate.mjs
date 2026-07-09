#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "packages/photo-seal-web/src/resize/adaptiveEwaDownscale.ts",
  "packages/photo-seal-web/src/resize/adaptiveEwaParams.ts",
  "packages/photo-seal-web/src/resize/adaptiveEwaReceipt.ts",
  "packages/photo-seal-web/src/resize/shaders/adaptiveEwaDownscale.wgsl",
  "packages/photo-seal-web/src/resize/types.ts",
];

const requiredTokens = [
  "TDT-PHOTOSEAL-03",
  "downscaleRgbaWithAdaptiveEwa",
  "adaptive-ewa",
  "DEFAULT_ADAPTIVE_EWA_PARAMS",
  "AdaptiveEwaParams",
  "AdaptiveEwaReceipt",
  "promotedToDefault: false",
  "defaultProfileChanged: false",
  "rgba8unorm",
  "rgba16float",
  "readbackRgba8Texture",
  "uploadRgba8Texture",
  "fallbackUsed: false",
];

const forbiddenInSrc = [
  "promotedToDefault: true",
  "defaultProfileChanged: true",
  "cpuFallback",
  "canvasFallback",
  "fallbackUsed: true",
  "document.createElement(\"canvas\")",
  "getContext(\"2d\")",
  "encodeJpeg",
  "targetBytes",
  "qualitySearch",
  "YCbCr",
  "JPEG",
  "aniso-ewa",
  "deltaE",
];

const srcFiles = requiredFiles.filter((file) => file.startsWith("packages/photo-seal-web/src/"));
const allText = requiredFiles
  .map((file) => {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) throw new Error(`missing required file: ${file}`);
    return fs.readFileSync(full, "utf8");
  })
  .join("\n");

for (const token of requiredTokens) {
  if (!allText.includes(token)) throw new Error(`missing token: ${token}`);
}

const srcText = srcFiles
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

for (const token of forbiddenInSrc) {
  if (srcText.includes(token)) throw new Error(`forbidden source token: ${token}`);
}

console.log("PASS_TDT_PHOTOSEAL_03_ADAPTIVE_EWA_CANDIDATE_IMPORT");
