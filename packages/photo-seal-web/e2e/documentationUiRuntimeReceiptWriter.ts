import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { PhotoSealDocumentationUiRuntimeSmokeReceipt } from "../src/documentation/documentationRuntimeSmokeReceipt";

export const TDT_PHOTOSEAL_12_R1_DOCUMENTATION_RECEIPT_PATH =
  "artifacts/TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_RUNTIME_RECEIPT.json";

export function writeDocumentationUiRuntimeReceipt(
  receipt: PhotoSealDocumentationUiRuntimeSmokeReceipt,
  rootDir = process.cwd(),
): string {
  const outPath = resolve(rootDir, TDT_PHOTOSEAL_12_R1_DOCUMENTATION_RECEIPT_PATH);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  return outPath;
}
