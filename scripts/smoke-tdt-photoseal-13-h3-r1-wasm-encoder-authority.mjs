import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PASS = "PASS_TDT_PHOTOSEAL_13_H3_R1_WASM_ENCODER_AUTHORITY_REBIND";
const FAIL = "FAIL_TDT_PHOTOSEAL_13_H3_R1_WASM_ENCODER_AUTHORITY_REBIND";
const checks = JSON.parse(fs.readFileSync(path.join(ROOT, "specs/TDT_PHOTOSEAL_13_H3_R1_STATIC_CHECKS.json"), "utf8"));

const implementationFiles = [
  "packages/photo-seal-web/src/encoder/wasmEncoderAuthority.ts",
  "packages/photo-seal-web/src/encoder/jpegWasmLoader.ts",
  "packages/photo-seal-web/src/encoder/jpegWasmCompressionSearch.ts",
  "packages/photo-seal-web/src/encoder/jpegWasmTypes.ts",
  "packages/photo-seal-web/src/worker/encoderWorker.ts",
  "packages/photo-seal-web/src/worker/encoderWorkerClient.ts",
  "packages/photo-seal-web/src/worker/encoderWorkerMessages.ts",
  "packages/photo-seal-web/src/pipeline/photoSealPipeline.ts",
  "packages/photo-seal-web/src/pipeline/photoSealEncodeBridge.ts",
  "packages/photo-seal-web/src/assembly/photoSealExportFlow.ts",
  "packages/photo-seal-web/src/assembly/exportFlowAssemblyReceipt.ts",
  "packages/photo-seal-web/src/receipt/photoSealBridgeReceipt.ts",
  "packages/photo-seal-web/src/export/saveJpeg.ts",
  "packages/photo-seal-web/src/export/saveReceipt.ts",
  "packages/photo-seal-web/src/export/blobDownload.ts",
];

const browserEncoderForbiddenPatterns = [
  /\.toBlob\s*\(/,
  /\.toDataURL\s*\(/,
  /\.convertToBlob\s*\(/,
  /fallbackToBrowser/,
  /browserEncoderFallback/,
  /browserJpegEncode\s*\(/,
  /new\s+Image\s*\(/,
];

const forbiddenTokens = [
  "encoderOwner: \"browser",
  "browserJpegEncodeUsed: true",
  "browserJpegEncodeFallbackUsed: true",
  "canvasToBlobUsed: true",
  "canvasToDataUrlUsed: true",
  "offscreenCanvasConvertToBlobUsed: true",
  "wasmEncoderRequired: false",
  "blobUsedOnlyForWasmBytesDownload: false",
  "subsampling: \"420\"",
  "jpegSubsampling: \"420\"",
];

const failures = [];
for (const file of checks.required_files) {
  if (!fs.existsSync(path.join(ROOT, file))) failures.push(`missing file: ${file}`);
}

const tokenCorpus = checks.required_files
  .filter((file) => fs.existsSync(path.join(ROOT, file)))
  .map((file) => fs.readFileSync(path.join(ROOT, file), "utf8"))
  .join("\n");

for (const token of checks.required_tokens) {
  if (!tokenCorpus.includes(token)) failures.push(`missing token: ${token}`);
}

for (const file of implementationFiles) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, "utf8");
  for (const token of forbiddenTokens) {
    if (text.includes(token)) failures.push(`forbidden token in ${file}: ${token}`);
  }
  for (const pattern of browserEncoderForbiddenPatterns) {
    if (pattern.test(text)) failures.push(`browser encoder pattern in ${file}: ${pattern}`);
  }
}

const blobDownload = fs.readFileSync(path.join(ROOT, "packages/photo-seal-web/src/export/blobDownload.ts"), "utf8");
if (!blobDownload.includes("new Blob([bytes], { type: \"image/jpeg\" })")) {
  failures.push("JPEG Blob wrapper for WASM bytes is missing or changed.");
}
if (!tokenCorpus.includes("getTdtJpegWasmBindings")) failures.push("WASM bindings loader is not used.");
if (!tokenCorpus.includes("encodeRgbaToJpeg444TargetBytesWithWasm")) failures.push("WASM target bytes encoder path is not used.");

const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R1",
  stage: "wasm-encoder-authority-no-browser-jpeg-fallback",
  staticContractSmoke: failures.length === 0 ? "PASS" : "FAIL",
  marker: failures.length === 0 ? PASS : FAIL,
  failures,
  encoderOwner: "wasm-tdt-jpeg",
  wasmEncoderRequired: true,
  browserJpegEncodeUsed: false,
  browserJpegEncodeFallbackUsed: false,
  canvasToBlobUsed: false,
  canvasToDataUrlUsed: false,
  offscreenCanvasConvertToBlobUsed: false,
  blobUsedOnlyForWasmBytesDownload: true,
  jpegSubsampling: "444",
  colorSpace: "srgb",
};

fs.mkdirSync(path.join(ROOT, "artifacts"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "artifacts/TDT_PHOTOSEAL_13_H3_R1_STATIC_CHECK_RESULT.json"), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(path.join(ROOT, "artifacts/TDT_PHOTOSEAL_13_H3_R1_WASM_ENCODER_AUTHORITY_RECEIPT.json"), `${JSON.stringify({
  patchId: "TDT-PHOTOSEAL-13-H3-R1",
  stage: "wasm-encoder-authority-no-browser-jpeg-fallback",
  staticContractSmoke: result.staticContractSmoke,
  browserExportRuntimeSmoke: "NOT_RUN",
  browserExportRuntimeReason: "NO_BROWSER_RUNTIME",
  runtimeActuallyExecuted: false,
  runtimePassClaimed: false,
  encoderOwner: "wasm-tdt-jpeg",
  wasmEncoderRequired: true,
  wasmGlueLoaded: false,
  wasmEncodeFunctionPresent: false,
  browserJpegEncodeUsed: false,
  browserJpegEncodeFallbackUsed: false,
  canvasToBlobUsed: false,
  canvasToDataUrlUsed: false,
  offscreenCanvasConvertToBlobUsed: false,
  blobUsedOnlyForWasmBytesDownload: true,
  jpegSubsampling: "444",
  inputColorSpace: "srgb",
  outputColorSpace: "srgb",
}, null, 2)}\n`);

console.log(result.marker);
if (failures.length > 0) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
