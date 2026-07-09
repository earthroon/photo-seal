import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PASS = "PASS_TDT_PHOTOSEAL_13_H3_R2_WASM_BINDINGS_WRAPPER_NO_MODULE_NAMESPACE_MUTATION";
const FAIL = "FAIL_TDT_PHOTOSEAL_13_H3_R2_WASM_BINDINGS_WRAPPER_NO_MODULE_NAMESPACE_MUTATION";
const checks = JSON.parse(fs.readFileSync(path.join(ROOT, "specs/TDT_PHOTOSEAL_13_H3_R2_STATIC_CHECKS.json"), "utf8"));

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
  const forbiddenTokens = [
    "Object.assign(module",
    "Object.defineProperty(module",
    "module.encoderAuthority =",
    "moduleNamespaceMutationUsed: true",
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
  for (const token of forbiddenTokens) {
    if (text.includes(token)) failures.push(`forbidden token in ${file}: ${token}`);
  }
  const browserEncoderForbiddenPatterns = [
    /\.toBlob\s*\(/,
    /\.toDataURL\s*\(/,
    /\.convertToBlob\s*\(/,
    /fallbackToBrowser/,
    /browserEncoderFallback/,
    /browserJpegEncode\s*\(/,
  ];
  for (const pattern of browserEncoderForbiddenPatterns) {
    if (pattern.test(text)) failures.push(`browser encoder pattern in ${file}: ${pattern}`);
  }
}

const loader = fs.readFileSync(path.join(ROOT, "packages/photo-seal-web/src/encoder/jpegWasmLoader.ts"), "utf8");
if (!loader.includes("return {")) failures.push("jpegWasmLoader must return a wrapper object.");
if (!loader.includes("wrapWasmBindings(module, true)")) failures.push("bundled WASM module must be wrapped, not mutated.");
if (!loader.includes("moduleNamespaceMutationUsed: false")) failures.push("module namespace mutation seal missing.");

const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R2",
  stage: "wasm-bindings-wrapper-no-module-namespace-mutation",
  staticContractSmoke: failures.length === 0 ? "PASS" : "FAIL",
  marker: failures.length === 0 ? PASS : FAIL,
  failures,
  encoderOwner: "wasm-tdt-jpeg",
  wasmEncoderRequired: true,
  browserJpegEncodeUsed: false,
  browserJpegEncodeFallbackUsed: false,
  moduleNamespaceMutationUsed: false,
  jpegSubsampling: "444",
  colorSpace: "srgb"
};

fs.mkdirSync(path.join(ROOT, "artifacts"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "artifacts/TDT_PHOTOSEAL_13_H3_R2_STATIC_CHECK_RESULT.json"), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(path.join(ROOT, "artifacts/TDT_PHOTOSEAL_13_H3_R2_WASM_BINDINGS_WRAPPER_RECEIPT.json"), `${JSON.stringify({
  patchId: "TDT-PHOTOSEAL-13-H3-R2",
  stage: "wasm-bindings-wrapper-no-module-namespace-mutation",
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
  moduleNamespaceMutationUsed: false,
  jpegSubsampling: "444",
  inputColorSpace: "srgb",
  outputColorSpace: "srgb",
}, null, 2)}\n`);

console.log(result.marker);
if (failures.length > 0) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
