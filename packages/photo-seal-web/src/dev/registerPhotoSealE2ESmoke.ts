import { runPhotoSealE2EExportSmoke } from "../pipeline/photoSealE2ESmoke";
import type { PhotoSealE2ESmokeReceipt } from "../pipeline/photoSealE2ESmokeTypes";

declare global {
  interface Window {
    __runPhotoSealE2ESmoke?: () => Promise<PhotoSealE2ESmokeReceipt>;
    __TDT_PHOTOSEAL_E2E_SMOKE__?: PhotoSealE2ESmokeReceipt;
  }
}

export async function runPhotoSealBrowserE2ESmoke(): Promise<PhotoSealE2ESmokeReceipt> {
  const result = await runPhotoSealE2EExportSmoke({ targetBytes: 300 * 1024 });
  window.__TDT_PHOTOSEAL_E2E_SMOKE__ = result.e2eReceipt;

  if (result.e2eReceipt.browserRuntimeE2ESmoke === "PASS") {
    console.info("PASS_TDT_PHOTOSEAL_07_BROWSER_RUNTIME_E2E_EXPORT_SMOKE", result.e2eReceipt);
  } else if (result.e2eReceipt.browserRuntimeE2ESmoke === "FAIL") {
    console.error("FAIL_TDT_PHOTOSEAL_07_BROWSER_RUNTIME_E2E_EXPORT_SMOKE", result.e2eReceipt);
  } else {
    console.info("NOT_RUN_TDT_PHOTOSEAL_07_BROWSER_RUNTIME_E2E_EXPORT_SMOKE", result.e2eReceipt);
  }

  return result.e2eReceipt;
}

export function registerPhotoSealE2ESmoke(): void {
  if (typeof window === "undefined") return;
  if (import.meta.env.DEV) {
    window.__runPhotoSealE2ESmoke = runPhotoSealBrowserE2ESmoke;
  }
}

export const PHOTOSEAL_E2E_DEV_HOOK_POLICY =
  "Manual dev-only hook. No app-load automatic smoke, no production default execution, no silent runtime pass.";

export const PHOTOSEAL_E2E_BROWSER_GPU_TOKEN = "navigator.gpu";
