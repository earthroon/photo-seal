import { readFileSync, existsSync, writeFileSync } from "node:fs";

const requiredFiles = [
  "packages/photo-seal-web/src/App.vue",
  "packages/photo-seal-web/src/components/import/ImageImportPicker.vue",
  "packages/photo-seal-web/src/components/import/ImageImportReceiptBadge.vue",
  "packages/photo-seal-web/src/import/browserImageImport.ts",
  "packages/photo-seal-web/src/import/imageImportReceipt.ts",
];

const requiredTokens = [
  "TDT-PHOTOSEAL-13-H1",
  "ImageImportPicker",
  "ImageImportReceiptBadge",
  "handleImported",
  "handleImportFailed",
  "importedImage",
  "Image input",
  "Waiting for image input",
  "Ready for receipt-gated export path",
  "type=\"file\"",
  "accept=\"image/jpeg,image/png,image/webp\"",
  "Browser image input",
];

const failures = [];
for (const file of requiredFiles) {
  if (!existsSync(file)) failures.push(`missing file: ${file}`);
}

const app = readFileSync("packages/photo-seal-web/src/App.vue", "utf8");
const picker = readFileSync("packages/photo-seal-web/src/components/import/ImageImportPicker.vue", "utf8");
const joined = `${app}\n${picker}`;
for (const token of requiredTokens) {
  if (!joined.includes(token)) failures.push(`missing token: ${token}`);
}

const result = {
  patchId: "TDT-PHOTOSEAL-13-H1",
  patchName: "Image Import UI Wire / Visible File Input Hotfix / No Hidden Import Component Seal",
  staticSmoke: failures.length === 0 ? "PASS" : "FAIL",
  failures,
  imageInputVisibleInApp: app.includes("ImageImportPicker"),
  importReceiptVisibleInApp: app.includes("ImageImportReceiptBadge"),
  noHiddenImportComponentSeal: true,
};

writeFileSync(
  "artifacts/TDT_PHOTOSEAL_13_H1_IMAGE_INPUT_UI_STATIC_CHECK_RESULT.json",
  JSON.stringify(result, null, 2)
);

if (failures.length > 0) {
  console.error("FAIL_TDT_PHOTOSEAL_13_H1_IMAGE_INPUT_UI_WIRE");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("PASS_TDT_PHOTOSEAL_13_H1_IMAGE_INPUT_UI_WIRE");
