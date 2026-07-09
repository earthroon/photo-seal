import fs from "node:fs";
import path from "node:path";
import type { PhotoSealRuntimeE2EReceipt } from "../src/pipeline/photoSealE2ERuntimeReceipt";

export const TDT_PHOTOSEAL_07_R1_RUNTIME_RECEIPT_ARTIFACT =
  "artifacts/TDT_PHOTOSEAL_07_R1_RUNTIME_E2E_RECEIPT.json";

export function writePhotoSealRuntimeReceipt(
  receipt: PhotoSealRuntimeE2EReceipt,
  rootDir = process.cwd(),
): void {
  const targetPath = path.join(rootDir, TDT_PHOTOSEAL_07_R1_RUNTIME_RECEIPT_ARTIFACT);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
}

export function runtimeReceiptMarker(receipt: PhotoSealRuntimeE2EReceipt): string {
  if (receipt.browserRuntimeE2ESmoke === "PASS") {
    return "PASS_TDT_PHOTOSEAL_07_R1_BROWSER_WEBGPU_RUNTIME_E2E_RECEIPT_CAPTURE";
  }
  if (receipt.browserRuntimeE2ESmoke === "FAIL") {
    return "FAIL_TDT_PHOTOSEAL_07_R1_BROWSER_WEBGPU_RUNTIME_E2E_RECEIPT_CAPTURE";
  }
  return "NOT_RUN_TDT_PHOTOSEAL_07_R1_BROWSER_WEBGPU_RUNTIME_E2E_RECEIPT_CAPTURE";
}

export const TDT_PHOTOSEAL_07_R1_RECEIPT_WRITER_POLICY =
  "Runtime receipt artifact is the source of truth; console marker alone is not runtime proof.";
