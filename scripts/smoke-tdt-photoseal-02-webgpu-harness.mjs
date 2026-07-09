#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const required = [
  "packages/photo-seal-web/src/gpu/webgpuSupport.ts",
  "packages/photo-seal-web/src/gpu/device.ts",
  "packages/photo-seal-web/src/gpu/textureUpload.ts",
  "packages/photo-seal-web/src/gpu/textureReadback.ts",
  "packages/photo-seal-web/src/gpu/readbackRows.ts",
  "packages/photo-seal-web/src/gpu/gpuTextureFactory.ts",
  "packages/photo-seal-web/src/gpu/gpuError.ts",
  "packages/photo-seal-web/src/gpu/gpuReceipt.ts",
];

for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error("FAIL_TDT_PHOTOSEAL_02_WEBGPU_DEVICE_TEXTURE_READBACK_HARNESS", rel);
    process.exit(1);
  }
}

const scanFiles = required.concat(["packages/photo-seal-web/src/resize/webgpuExportDownscale.ts"]);
const text = scanFiles.map((rel) => fs.readFileSync(path.join(root, rel), "utf8")).join("\n");
const requiredTokens = [
  "TDT-PHOTOSEAL-02",
  "requestPhotoSealGPUDevice",
  "assertWebGPUSupported",
  "uploadRgba8Texture",
  "readbackRgba8Texture",
  "stripPaddedRows",
  "alignTo256",
  "rgba8unorm",
  "rgba16float",
  "fallbackUsed: false",
  "WEBGPU_UNAVAILABLE",
  "ADAPTER_UNAVAILABLE",
  "DEVICE_UNAVAILABLE",
  "INVALID_RGBA_LENGTH",
  "READBACK_SIZE_MISMATCH",
];
for (const token of requiredTokens) {
  if (!text.includes(token)) {
    console.error("FAIL_TDT_PHOTOSEAL_02_WEBGPU_DEVICE_TEXTURE_READBACK_HARNESS missing", token);
    process.exit(1);
  }
}

const forbiddenTokens = [
  "cpuFallback",
  "canvasFallback",
  "fallbackUsed: true",
  "document.createElement(\"canvas\")",
  "getContext(\"2d\")",
  "encodeJpeg",
  "targetBytes",
  "qualitySearch",
  "subsampling",
  "YCbCr",
  "JPEG",
];
for (const token of forbiddenTokens) {
  if (text.includes(token)) {
    console.error("FAIL_TDT_PHOTOSEAL_02_WEBGPU_DEVICE_TEXTURE_READBACK_HARNESS forbidden", token);
    process.exit(1);
  }
}

console.log("PASS_TDT_PHOTOSEAL_02_WEBGPU_DEVICE_TEXTURE_READBACK_HARNESS");
