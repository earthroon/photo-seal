import { test, expect } from "@playwright/test";
import {
  makeExportFlowRuntimeNotRunReceipt,
  writeExportFlowRuntimeReceipt,
} from "./exportFlowRuntimeReceiptWriter";

test("TDT-PHOTOSEAL-13 export flow runtime smoke", async ({ page }) => {
  await page.goto("/");
  const hookExists = await page.evaluate(() => typeof window.__runPhotoSealExportFlowRuntimeSmoke === "function");
  if (!hookExists) {
    const receipt = makeExportFlowRuntimeNotRunReceipt("EXPORT_FLOW_SMOKE_HOOK_MISSING");
    writeExportFlowRuntimeReceipt(receipt);
    console.log("NOT_RUN_TDT_PHOTOSEAL_13_BROWSER_EXPORT_FLOW_RUNTIME_SMOKE");
    expect(receipt.runtimePassClaimed).toBe(false);
    return;
  }

  const receipt = await page.evaluate(() => window.__runPhotoSealExportFlowRuntimeSmoke?.());
  writeExportFlowRuntimeReceipt({
    ...makeExportFlowRuntimeNotRunReceipt("OK"),
    browserExportFlowRuntimeSmoke: receipt?.status ?? "FAIL",
    browserExportFlowRuntimeReason: receipt?.reason ?? "EXPORT_FLOW_RUNTIME_RECEIPT_MISSING",
    runtimeActuallyExecuted: receipt?.runtimeActuallyExecuted === true,
    runtimePassClaimed: receipt?.runtimePassClaimed === true,
    importReceiptPresent: receipt?.importReceiptPresent === true,
    presetReceiptPresent: receipt?.presetReceiptPresent === true,
    resizeReceiptPresent: receipt?.resizeReceiptPresent === true,
    bridgeReceiptPresent: receipt?.bridgeReceiptPresent === true,
    wasmReceiptPresent: receipt?.wasmReceiptPresent === true,
    auditSummaryPresent: receipt?.auditSummaryPresent === true,
    documentationReceiptPresent: receipt?.documentationReceiptPresent === true,
  });

  expect(receipt?.missingReceiptSuccessBlocked).toBe(true);
  expect(receipt?.runtimePassClaimed === true).toBe(receipt?.status === "PASS");
});
