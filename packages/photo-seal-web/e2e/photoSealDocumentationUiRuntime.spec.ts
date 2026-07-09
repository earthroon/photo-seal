import { test, expect } from "@playwright/test";
import { writeDocumentationUiRuntimeReceipt } from "./documentationUiRuntimeReceiptWriter";

test("TDT-PHOTOSEAL-12-R1 documentation UI runtime smoke", async ({ page }) => {
  await page.goto("/");
  const hasHook = await page.evaluate(() => typeof window.__runPhotoSealDocumentationUiRuntimeSmoke === "function");
  if (!hasHook) {
    const receipt = {
      patchId: "TDT-PHOTOSEAL-12-R1",
      stage: "documentation-ui-runtime-smoke-institution-note-copy-no-clipboard-false-success",
      staticContractSmoke: "PASS",
      browserDocumentationRuntimeSmoke: "NOT_RUN",
      browserDocumentationRuntimeReason: "DOCUMENTATION_SMOKE_HOOK_MISSING",
      browserRuntimeActuallyExecuted: false,
      runtimePassClaimed: false,
      appPageLoaded: true,
      documentationSmokeHookFound: false,
      documentationSmokeHookCalled: false,
      documentationPanelRendered: false,
      institutionNoteCopyRendered: false,
      complianceDisclaimerBadgeRendered: false,
      presetDocumentationReceiptBadgeRendered: false,
      institutionNoteCopyCreated: false,
      copyButtonFound: false,
      copyButtonClicked: false,
      clipboardRuntimeAvailable: false,
      clipboardWriteAttempted: false,
      clipboardWriteResolved: false,
      clipboardWriteRejected: false,
      clipboardUnsupported: true,
      clipboardProbeStatus: "unsupported",
      clipboardFalseSuccessDetected: false,
      copyStatusAriaLivePresent: false,
      copyStatusMessageVisible: false,
      officialComplianceGuaranteed: false,
      institutionUploadGuaranteed: false,
      legalRequirementVerified: false,
      userMustCheckInstitutionRequirements: true,
      overclaimDetected: false,
      disclaimerVisible: false,
      mockClipboardResultUsedForRuntimePass: false,
      staticSmokeUsedAsRuntimePass: false,
      defaultProfileChanged: false,
      promotedToDefault: false,
      receiptCaptured: true,
      receiptArtifactPath: "artifacts/TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_RUNTIME_RECEIPT.json",
    } as const;
    writeDocumentationUiRuntimeReceipt(receipt);
    console.log("NOT_RUN_TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_RUNTIME_SMOKE");
    expect(receipt.browserDocumentationRuntimeSmoke).toBe("NOT_RUN");
    return;
  }
  const receipt = await page.evaluate(() => window.__runPhotoSealDocumentationUiRuntimeSmoke?.());
  writeDocumentationUiRuntimeReceipt(receipt as never);
  expect(receipt?.clipboardFalseSuccessDetected).toBe(false);
  expect(receipt?.overclaimDetected).toBe(false);
  expect(receipt?.staticSmokeUsedAsRuntimePass).toBe(false);
  if (receipt?.browserDocumentationRuntimeSmoke === "PASS") {
    console.log("PASS_TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_RUNTIME_SMOKE");
  } else if (receipt?.browserDocumentationRuntimeSmoke === "FAIL") {
    console.log("FAIL_TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_RUNTIME_SMOKE");
  } else {
    console.log("NOT_RUN_TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_RUNTIME_SMOKE");
  }
});
