import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkPath = path.join(root, "specs/TDT_PHOTOSEAL_01_R1_STATIC_CHECKS.json");
const checks = JSON.parse(fs.readFileSync(checkPath, "utf8"));
const srcFiles = [
  "packages/photo-seal-web/src/resize/webgpuExportDownscale.ts",
  "packages/photo-seal-web/src/resize/resizeReceipt.ts",
  "packages/photo-seal-web/src/resize/types.ts",
];
const allFiles = [...new Set([...checks.required_files, ...srcFiles])];
const missingFiles = checks.required_files.filter((file) => !fs.existsSync(path.join(root, file)));
if (missingFiles.length) {
  console.error("Missing required files:", missingFiles);
  console.log("FAIL_TDT_PHOTOSEAL_01_R1_RESIZE_RECEIPT_SRGB_REBIND_EXPORT_EWA_COLOR_SEAL");
  process.exit(1);
}

const aggregate = allFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
const missingTokens = checks.required_tokens.filter((token) => !aggregate.includes(token));
if (missingTokens.length) {
  console.error("Missing required tokens:", missingTokens);
  console.log("FAIL_TDT_PHOTOSEAL_01_R1_RESIZE_RECEIPT_SRGB_REBIND_EXPORT_EWA_COLOR_SEAL");
  process.exit(1);
}

const srcAggregate = srcFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
const forbiddenHits = checks.forbidden_tokens_in_src.filter((token) => srcAggregate.includes(token));
if (forbiddenHits.length) {
  console.error("Forbidden implementation tokens:", forbiddenHits);
  console.log("FAIL_TDT_PHOTOSEAL_01_R1_RESIZE_RECEIPT_SRGB_REBIND_EXPORT_EWA_COLOR_SEAL");
  process.exit(1);
}

const receiptText = fs.readFileSync(path.join(root, "packages/photo-seal-web/src/resize/resizeReceipt.ts"), "utf8");
const requiredReceiptFacts = [
  'patchId: "TDT-PHOTOSEAL-01-R1"',
  'stage: "export-ewa-resize-srgb-receipt-color-seal"',
  'inputColorSpace: "srgb"',
  'outputColorSpace: "srgb"',
  'decodedColorSpace: "srgb"',
  'hiddenGammaTransformUsed: false',
  'doubleGammaDetected: false',
  'implicitColorTransformUsed: false',
  'paddedBufferReturned: false',
  'paddingStrippedReadback: true',
  'defaultProfileChanged: false',
  'promotedToDefault: false',
  'dadumFullAdaptiveChainUsed: false',
  'qmapUsed: false',
  'tileMaskUsed: false'
];
const missingReceiptFacts = requiredReceiptFacts.filter((token) => !receiptText.includes(token));
if (missingReceiptFacts.length) {
  console.error("Missing receipt facts:", missingReceiptFacts);
  console.log("FAIL_TDT_PHOTOSEAL_01_R1_RESIZE_RECEIPT_SRGB_REBIND_EXPORT_EWA_COLOR_SEAL");
  process.exit(1);
}

console.log("PASS_TDT_PHOTOSEAL_01_R1_RESIZE_RECEIPT_SRGB_REBIND_EXPORT_EWA_COLOR_SEAL");
