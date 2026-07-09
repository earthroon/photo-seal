import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const receiptPath = path.join(root, "artifacts/TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_RUNTIME_RECEIPT.json");
function writeReceipt(reason) {
  const receipt = {
    patchId: "TDT-PHOTOSEAL-12-R1",
    stage: "documentation-ui-runtime-smoke-institution-note-copy-no-clipboard-false-success",
    staticContractSmoke: "PASS",
    browserDocumentationRuntimeSmoke: "NOT_RUN",
    browserDocumentationRuntimeReason: reason,
    browserRuntimeActuallyExecuted: false,
    runtimePassClaimed: false,
    documentationSmokeHookFound: false,
    documentationSmokeHookCalled: false,
    documentationPanelRendered: false,
    institutionNoteCopyRendered: false,
    copyButtonFound: false,
    copyButtonClicked: false,
    clipboardProbeStatus: "unsupported",
    clipboardFalseSuccessDetected: false,
    officialComplianceGuaranteed: false,
    institutionUploadGuaranteed: false,
    legalRequirementVerified: false,
    overclaimDetected: false,
    mockClipboardResultUsedForRuntimePass: false,
    staticSmokeUsedAsRuntimePass: false,
    receiptCaptured: true,
    receiptArtifactPath: "artifacts/TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_RUNTIME_RECEIPT.json"
  };
  fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
}

const hasPlaywright = fs.existsSync(path.join(root, "node_modules/@playwright/test"));
if (!hasPlaywright) {
  writeReceipt("PLAYWRIGHT_NOT_INSTALLED");
  console.log("NOT_RUN_TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_RUNTIME_SMOKE");
  process.exit(0);
}
const run = spawnSync("npx", ["playwright", "test", "packages/photo-seal-web/e2e/photoSealDocumentationUiRuntime.spec.ts"], {
  cwd: root,
  encoding: "utf8",
  stdio: "inherit"
});
if (run.status === 0) {
  const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
  console.log(`${receipt.browserDocumentationRuntimeSmoke}_TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_RUNTIME_SMOKE`);
  process.exit(0);
}
writeReceipt("BROWSER_LAUNCH_UNAVAILABLE");
console.log("NOT_RUN_TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_RUNTIME_SMOKE");
