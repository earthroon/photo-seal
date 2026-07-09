import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import {
  makeTdtPhotoSeal09R1SaveRuntimeReceipt,
  writeTdtPhotoSeal09R1SaveRuntimeReceipt,
} from "./write-tdt-photoseal-09-r1-save-runtime-receipt.mjs";

const require = createRequire(import.meta.url);

function notRun(reason) {
  const receipt = makeTdtPhotoSeal09R1SaveRuntimeReceipt({ browserJpegSaveRuntimeReason: reason });
  writeTdtPhotoSeal09R1SaveRuntimeReceipt(receipt);
  console.log("NOT_RUN_TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_SMOKE");
  return 0;
}

try {
  require.resolve("@playwright/test");
} catch {
  process.exit(notRun("PLAYWRIGHT_NOT_INSTALLED"));
}

const result = spawnSync("npx", ["playwright", "test", "packages/photo-seal-web/e2e/photoSealJpegSaveRuntime.spec.ts"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

const receiptPath = "artifacts/TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_RECEIPT.json";
if (!fs.existsSync(receiptPath)) {
  const receipt = makeTdtPhotoSeal09R1SaveRuntimeReceipt({
    browserJpegSaveRuntimeSmoke: result.status === 0 ? "FAIL" : "NOT_RUN",
    browserJpegSaveRuntimeReason: result.status === 0 ? "SAVE_RECEIPT_MISSING" : "BROWSER_LAUNCH_UNAVAILABLE",
    browserRuntimeActuallyExecuted: result.status === 0,
    runtimePassClaimed: false,
  });
  writeTdtPhotoSeal09R1SaveRuntimeReceipt(receipt);
}

const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
if (receipt.browserJpegSaveRuntimeSmoke === "PASS") {
  console.log("PASS_TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_SMOKE");
  process.exit(0);
}
if (receipt.browserJpegSaveRuntimeSmoke === "FAIL") {
  console.log("FAIL_TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_SMOKE");
  process.exit(1);
}
console.log("NOT_RUN_TDT_PHOTOSEAL_09_R1_BROWSER_JPEG_SAVE_RUNTIME_SMOKE");
process.exit(0);
