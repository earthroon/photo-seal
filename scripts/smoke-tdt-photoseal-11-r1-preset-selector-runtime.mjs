import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const artifactPath = path.join(root, "artifacts/TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_RUNTIME_RECEIPT.json");

function writeReceipt(receipt) {
  fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
  fs.writeFileSync(artifactPath, `${JSON.stringify(receipt, null, 2)}\n`);
}

function notRun(reason) {
  return {
    patchId: "TDT-PHOTOSEAL-11-R1",
    stage: "preset-selector-ui-runtime-smoke-preset-receipt-to-resize-request-verification",
    staticContractSmoke: "PASS",
    browserPresetSelectorRuntimeSmoke: "NOT_RUN",
    browserPresetSelectorRuntimeReason: reason,
    browserRuntimeActuallyExecuted: false,
    runtimePassClaimed: false,
    appPageLoaded: false,
    presetSelectorHookFound: false,
    presetSelectorHookCalled: false,
    presetSelectorRendered: false,
    selectedPresetId: null,
    selectedPresetVisibleToUser: false,
    presetReceiptPresent: false,
    presetReceiptMatchesSelection: false,
    resizeRequestBuilt: false,
    runtimeResizeWidthMatchesPreset: false,
    runtimeResizeHeightMatchesPreset: false,
    runtimeTargetBytesMatchesPreset: false,
    runtimeResizeProfileMatchesPreset: false,
    invalidPresetRejected: false,
    silentPresetFallbackDetected: false,
    invalidCustomPresetRejected: false,
    invalidCustomPresetClamped: false,
    cropRequiredPresetSelected: false,
    cropReceiptPresent: false,
    cropRequiredBlockerPresent: false,
    hiddenResizePolicyUsed: false,
    hiddenTargetBytesPolicyUsed: false,
    hiddenAspectPolicyUsed: false,
    hiddenPaddingPolicyUsed: false,
    encoderSideResizeAllowed: false,
    encoderSideCropAllowed: false,
    mockPresetReceiptUsedForRuntimePass: false,
    staticSmokeUsedAsRuntimePass: false,
    defaultProfileChanged: false,
    promotedToDefault: false,
    receiptCaptured: true,
    receiptArtifactPath: "artifacts/TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_RUNTIME_RECEIPT.json"
  };
}

const hasPlaywright = fs.existsSync(path.join(root, "node_modules/@playwright/test"));
if (!hasPlaywright) {
  writeReceipt(notRun("PLAYWRIGHT_NOT_INSTALLED"));
  console.log("NOT_RUN_TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_UI_RUNTIME_SMOKE");
  process.exit(0);
}

const result = spawnSync("npx", ["playwright", "test", "packages/photo-seal-web/e2e/photoSealPresetSelectorRuntime.spec.ts"], {
  cwd: root,
  stdio: "inherit",
  shell: false
});

if (result.status === 0) {
  console.log("PASS_TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_UI_RUNTIME_SMOKE");
  process.exit(0);
}

if (!fs.existsSync(artifactPath)) {
  const receipt = notRun("BROWSER_LAUNCH_UNAVAILABLE");
  receipt.browserPresetSelectorRuntimeSmoke = "FAIL";
  receipt.browserPresetSelectorRuntimeReason = "PRESET_SELECTOR_RENDER_FAILED";
  writeReceipt(receipt);
}
console.log("FAIL_TDT_PHOTOSEAL_11_R1_PRESET_SELECTOR_UI_RUNTIME_SMOKE");
process.exit(1);
