import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const patchId = "TDT-PHOTOSEAL-05-R1";
const passMarker = "PASS_TDT_PHOTOSEAL_05_R1_BRIDGE_RECEIPT_SRGB_CONTRACT_REBIND";
const failMarker = "FAIL_TDT_PHOTOSEAL_05_R1_BRIDGE_RECEIPT_SRGB_CONTRACT_REBIND";

const checksPath = path.join(root, "specs", "TDT_PHOTOSEAL_05_R1_STATIC_CHECKS.json");
const checks = JSON.parse(fs.readFileSync(checksPath, "utf8"));

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function fail(message) {
  console.error(failMarker);
  console.error(message);
  process.exit(1);
}

for (const rel of checks.required_files) {
  if (!fs.existsSync(path.join(root, rel))) {
    fail(`missing required file: ${rel}`);
  }
}

const implementationFiles = checks.required_files.filter((rel) =>
  rel.startsWith("packages/") || rel.startsWith("crates/")
);
const implementationText = implementationFiles.map((rel) => read(rel)).join("\n");
const fullText = checks.required_files.map((rel) => read(rel)).join("\n");

for (const token of checks.required_tokens) {
  if (!fullText.includes(token)) {
    fail(`missing required token: ${token}`);
  }
}

for (const token of checks.implementation_forbidden_tokens) {
  if (implementationText.includes(token)) {
    fail(`forbidden implementation token found: ${token}`);
  }
}

const bridge = read("packages/photo-seal-web/src/pipeline/photoSealEncodeBridge.ts");
if (!bridge.includes('rgbaColorSpace: "srgb"') || !bridge.includes('inputColorSpace: "srgb"')) {
  fail("bridge request did not require sRGB color spaces");
}

const worker = read("packages/photo-seal-web/src/worker/encoderWorker.ts");
if (!worker.includes('inputColorSpace: "srgb"')) {
  fail("worker did not force inputColorSpace srgb in WASM request");
}
if (!worker.includes("validateWasmSrgbReceipt") || !worker.includes("validateSelectedColorPipeline")) {
  fail("worker did not validate WASM sRGB receipt and selectedColorPipeline");
}

const loader = read("packages/photo-seal-web/src/encoder/jpegWasmLoader.ts");
if (!loader.includes('inputColorSpace: "srgb"')) {
  fail("WASM binding did not type inputColorSpace as srgb");
}

const receipt = read("packages/photo-seal-web/src/receipt/photoSealBridgeReceipt.ts");
const receiptTokens = [
  'patchId: "TDT-PHOTOSEAL-05-R1"',
  'stage: "rgba-readback-to-jpeg-wasm-bridge-srgb-contract-rebind"',
  'rgbaColorSpace: "srgb"',
  'jpegColorSpace: "srgb"',
  'workerColorTransformUsed: false',
  'workerGammaTransformUsed: false',
  'workerHiddenLinearizationUsed: false',
  'workerDoubleGammaDetected: false',
  'paddedBufferTransferred: false',
  'sharedArrayBufferRequired: false',
  'jpegSubsampling: "444"',
];
for (const token of receiptTokens) {
  if (!receipt.includes(token)) {
    fail(`missing bridge receipt token: ${token}`);
  }
}

const zipArtifacts = fs.readdirSync(path.join(root, "artifacts"));
if (zipArtifacts.some((name) => name.endsWith(".sha256"))) {
  fail("sha256 files must not be emitted for this bake");
}

console.log(passMarker);
console.log(JSON.stringify({
  patchId,
  checkedFiles: checks.required_files.length,
  implementationFiles: implementationFiles.length,
  workerColorTransformUsed: false,
  rgbaColorSpace: "srgb",
  jpegColorSpace: "srgb",
  jpegSubsampling: "444",
}, null, 2));
