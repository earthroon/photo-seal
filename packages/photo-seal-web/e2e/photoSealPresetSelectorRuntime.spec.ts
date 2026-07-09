import { expect, test } from "@playwright/test";
import { writePhotoSealPresetSelectorRuntimeReceipt } from "./presetRuntimeReceiptWriter";
import { makeNotRunPresetSelectorRuntimeReceipt } from "../src/preset/presetRuntimeSmokeReceipt";
import type { PhotoSealPresetSelectorRuntimeSmokeReceipt } from "../src/preset/presetRuntimeSmokeReceipt";

test("TDT-PHOTOSEAL-11-R1 preset selector runtime smoke captures receipt", async ({ page }) => {
  await page.goto("/");

  const hookFound = await page.evaluate(() => typeof window.__runPhotoSealPresetSelectorRuntimeSmoke === "function");
  if (!hookFound) {
    const receipt = makeNotRunPresetSelectorRuntimeReceipt("PRESET_SELECTOR_HOOK_MISSING");
    writePhotoSealPresetSelectorRuntimeReceipt(process.cwd(), receipt);
    console.log("NOT_RUN_TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_UI_RUNTIME_SMOKE");
    expect(receipt.browserPresetSelectorRuntimeSmoke).toBe("NOT_RUN");
    return;
  }

  const receipt = await page.evaluate(async () => {
    const run = window.__runPhotoSealPresetSelectorRuntimeSmoke;
    if (!run) {
      throw new Error("PRESET_SELECTOR_HOOK_MISSING");
    }
    return await run();
  }) as PhotoSealPresetSelectorRuntimeSmokeReceipt;

  writePhotoSealPresetSelectorRuntimeReceipt(process.cwd(), receipt);
  expect(receipt.patchId).toBe("TDT-PHOTOSEAL-11-R1");
  expect(receipt.stage).toBe("preset-selector-ui-runtime-smoke-preset-receipt-to-resize-request-verification");
  expect(receipt.presetReceiptPresent).toBe(true);
  expect(receipt.resizeRequestBuilt).toBe(true);
  expect(receipt.presetReceiptMatchesSelection).toBe(true);
  expect(receipt.runtimeResizeWidthMatchesPreset).toBe(true);
  expect(receipt.runtimeResizeHeightMatchesPreset).toBe(true);
  expect(receipt.runtimeTargetBytesMatchesPreset).toBe(true);
  expect(receipt.runtimeResizeProfileMatchesPreset).toBe(true);
  expect(receipt.invalidPresetRejected).toBe(true);
  expect(receipt.silentPresetFallbackDetected).toBe(false);
  expect(receipt.invalidCustomPresetRejected).toBe(true);
  expect(receipt.invalidCustomPresetClamped).toBe(false);
  expect(receipt.hiddenResizePolicyUsed).toBe(false);
  expect(receipt.hiddenTargetBytesPolicyUsed).toBe(false);
  expect(receipt.mockPresetReceiptUsedForRuntimePass).toBe(false);
  expect(receipt.staticSmokeUsedAsRuntimePass).toBe(false);

  if (receipt.browserPresetSelectorRuntimeSmoke === "PASS") {
    console.log("PASS_TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_UI_RUNTIME_SMOKE");
  } else {
    console.log("FAIL_TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_UI_RUNTIME_SMOKE");
  }

  expect(receipt.browserPresetSelectorRuntimeSmoke).toBe("PASS");
});
