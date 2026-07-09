import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const marker = "PASS_TDT_PHOTOSEAL_13_H3_R3_WASM_RUNTIME_INVOKE_TRACE";
const fail = "FAIL_TDT_PHOTOSEAL_13_H3_R3_WASM_RUNTIME_INVOKE_TRACE";

const requiredFiles = [
  "packages/photo-seal-web/src/encoder/wasmEncodeRuntimeProbe.ts",
  "packages/photo-seal-web/src/assembly/photoSealExportFlow.ts",
  "packages/photo-seal-web/src/encoder/jpegWasmLoader.ts",
  "packages/photo-seal-web/src/encoder/jpegWasmCompressionSearch.ts",
  "specs/TDT_PHOTOSEAL_13_H3_R3_WASM_RUNTIME_INVOKE_TRACE_SPEC.md"
];

const requiredTokens = [
  "TDT-PHOTOSEAL-13-H3-R3",
  "runTdtJpegWasmEncodeInvocationProbe",
  "wasmEncodeFunctionCalled",
  "wasmEncodeReturned",
  "encode_rgba_to_jpeg_444_target_bytes_wasm",
  "encoderOwner: \"wasm-tdt-jpeg\"",
  "browserJpegEncodeUsed: false",
  "browserJpegEncodeFallbackUsed: false",
  "moduleNamespaceMutationUsed: false"
];

const forbiddenTokens = [
  "canvas.toBlob",
  "HTMLCanvasElement.prototype.toBlob",
  "toDataURL",
  "convertToBlob",
  "browserJpegEncodeUsed: true",
  "browserJpegEncodeFallbackUsed: true",
  "fallbackToBrowser",
  "mockWasmInvocation"
];

const implementationFiles = [
  "packages/photo-seal-web/src/encoder/wasmEncodeRuntimeProbe.ts",
  "packages/photo-seal-web/src/encoder/jpegWasmLoader.ts",
  "packages/photo-seal-web/src/encoder/jpegWasmCompressionSearch.ts",
  "packages/photo-seal-web/src/assembly/photoSealExportFlow.ts"
];

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
const corpus = requiredFiles
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");
const missingTokens = requiredTokens.filter((token) => !corpus.includes(token));
const forbiddenFound = [];
for (const file of implementationFiles) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, "utf8");
  for (const token of forbiddenTokens) {
    if (text.includes(token)) forbiddenFound.push(`${file}: ${token}`);
  }
}

const ok = missingFiles.length === 0 && missingTokens.length === 0 && forbiddenFound.length === 0;
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R3",
  staticContractSmoke: ok ? "PASS" : "FAIL",
  missingFiles,
  missingTokens,
  forbiddenFound,
  marker: ok ? marker : fail
};

fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_13_H3_R3_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2)
);

console.log(ok ? marker : fail);
if (!ok) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
