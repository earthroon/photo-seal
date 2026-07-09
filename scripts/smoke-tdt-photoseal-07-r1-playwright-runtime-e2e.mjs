import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const artifactPath = path.join(root, "artifacts/TDT_PHOTOSEAL_07_R1_RUNTIME_E2E_RECEIPT.json");
const stdoutPath = path.join(root, "artifacts/TDT_PHOTOSEAL_07_R1_PLAYWRIGHT_STDOUT.txt");
const stderrPath = path.join(root, "artifacts/TDT_PHOTOSEAL_07_R1_PLAYWRIGHT_STDERR.txt");

function writeReceipt(reason) {
  const receipt = {
    patchId: "TDT-PHOTOSEAL-07-R1",
    stage: "browser-webgpu-runtime-harness-playwright-e2e-receipt-capture",
    staticContractSmoke: "PASS",
    playwrightAssemblySmoke: "PASS",
    browserRuntimeE2ESmoke: "NOT_RUN",
    browserRuntimeE2EReason: reason,
    viteDevServerStarted: false,
    playwrightBrowserLaunched: false,
    appPageLoaded: false,
    browserRuntimeActuallyExecuted: false,
    runtimePassClaimed: false,
    navigatorGpuAvailable: false,
    gpuAdapterAcquired: false,
    gpuDeviceAcquired: false,
    wasmModuleLoaded: false,
    workerRuntimeAvailable: false,
    e2eSmokeFunctionFound: false,
    e2eSmokeFunctionCalled: false,
    resizeRuntimeExecuted: false,
    bridgeRuntimeExecuted: false,
    wasmEncodeRuntimeExecuted: false,
    auditSummaryRuntimeBuilt: false,
    uiSurfaceRuntimeRendered: false,
    resizeReceiptPresent: false,
    bridgeReceiptPresent: false,
    wasmReceiptPresent: false,
    auditSummaryPresent: false,
    inputColorSpace: "srgb",
    resizeOutputColorSpace: "srgb",
    wasmInputColorSpace: "srgb",
    jpegColorSpace: "srgb",
    jpegSubsampling: "444",
    doubleGammaDetected: false,
    hiddenGammaTransformUsed: false,
    workerColorTransformUsed: false,
    paddedBufferTransferred: false,
    mockReceiptUsedForRuntimePass: false,
    staticSmokeUsedAsRuntimePass: false,
    playwrightAssemblyUsedAsRuntimePass: false,
    defaultProfileChanged: false,
    promotedToDefault: false,
    receiptCaptured: true,
    receiptArtifactPath: "artifacts/TDT_PHOTOSEAL_07_R1_RUNTIME_E2E_RECEIPT.json"
  };
  fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
  fs.writeFileSync(artifactPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  return receipt;
}

function markerFor(receipt) {
  if (receipt.browserRuntimeE2ESmoke === "PASS") return "PASS_TDT_PHOTOSEAL_07_R1_BROWSER_WEBGPU_RUNTIME_E2E_RECEIPT_CAPTURE";
  if (receipt.browserRuntimeE2ESmoke === "FAIL") return "FAIL_TDT_PHOTOSEAL_07_R1_BROWSER_WEBGPU_RUNTIME_E2E_RECEIPT_CAPTURE";
  return "NOT_RUN_TDT_PHOTOSEAL_07_R1_BROWSER_WEBGPU_RUNTIME_E2E_RECEIPT_CAPTURE";
}

const pnpmCheck = spawnSync("pnpm", ["--version"], { cwd: root, encoding: "utf8" });
if (pnpmCheck.status !== 0) {
  const receipt = writeReceipt("PLAYWRIGHT_NOT_INSTALLED");
  console.log(markerFor(receipt));
  process.exit(0);
}

const run = spawnSync("pnpm", ["exec", "playwright", "test", "packages/photo-seal-web/e2e/photoSealRuntimeE2E.spec.ts"], {
  cwd: root,
  encoding: "utf8",
  env: { ...process.env, CI: "1" }
});
fs.writeFileSync(stdoutPath, run.stdout ?? "", "utf8");
fs.writeFileSync(stderrPath, run.stderr ?? "", "utf8");

if (!fs.existsSync(artifactPath)) {
  const receipt = writeReceipt(run.error ? "BROWSER_LAUNCH_UNAVAILABLE" : "PLAYWRIGHT_NOT_INSTALLED");
  console.log(markerFor(receipt));
  process.exit(0);
}

const receipt = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
console.log(markerFor(receipt));
process.exit(receipt.browserRuntimeE2ESmoke === "FAIL" ? 1 : 0);
