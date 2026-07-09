import fs from "node:fs";
import path from "node:path";
import type { PhotoSealPresetSelectorRuntimeSmokeReceipt } from "../src/preset/presetRuntimeSmokeReceipt";

export const TDT_PHOTOSEAL_11_R1_PRESET_RUNTIME_RECEIPT_PATH =
  "artifacts/TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_RUNTIME_RECEIPT.json";

export function writePhotoSealPresetSelectorRuntimeReceipt(
  rootDir: string,
  receipt: PhotoSealPresetSelectorRuntimeSmokeReceipt
): void {
  const target = path.join(rootDir, TDT_PHOTOSEAL_11_R1_PRESET_RUNTIME_RECEIPT_PATH);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(receipt, null, 2)}\n`);
}
