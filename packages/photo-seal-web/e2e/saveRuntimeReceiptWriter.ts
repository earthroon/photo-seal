import fs from "node:fs";
import path from "node:path";
import type { PhotoSealJpegSaveRuntimeSmokeReceipt } from "../src/export/saveRuntimeSmokeTypes";

export const TDT_PHOTOSEAL_09_R1_SAVE_RUNTIME_RECEIPT_ARTIFACT =
  "artifacts/TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_RECEIPT.json";

export function writePhotoSealJpegSaveRuntimeReceipt(
  receipt: PhotoSealJpegSaveRuntimeSmokeReceipt,
  rootDir = process.cwd(),
): void {
  const targetPath = path.join(rootDir, TDT_PHOTOSEAL_09_R1_SAVE_RUNTIME_RECEIPT_ARTIFACT);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
}

export function photoSealJpegSaveRuntimeMarker(receipt: PhotoSealJpegSaveRuntimeSmokeReceipt): string {
  if (receipt.browserJpegSaveRuntimeSmoke === "PASS") {
    return "PASS_TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_SMOKE";
  }
  if (receipt.browserJpegSaveRuntimeSmoke === "FAIL") {
    return "FAIL_TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_SMOKE";
  }
  return "NOT_RUN_TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_SMOKE";
}

export const TDT_PHOTOSEAL_09_R1_SAVE_RECEIPT_WRITER_POLICY =
  "Runtime save receipt artifact is the source of truth; console marker alone is not runtime proof.";
