import { runPhotoSealBrowserJpegSaveSmoke } from "../export/saveRuntimeSmoke";
import type { PhotoSealJpegSaveRuntimeSmokeReceipt } from "../export/saveRuntimeSmokeTypes";

const TDT_PHOTOSEAL_09_R1_SAVE_SMOKE_REGISTER_POLICY =
  "No Auto Download Seal: registering the smoke hook must not trigger download or audit bundle save.";

declare global {
  interface Window {
    __runPhotoSealBrowserJpegSaveSmoke?: () => Promise<PhotoSealJpegSaveRuntimeSmokeReceipt>;
    __TDT_PHOTOSEAL_09_R1_SAVE_SMOKE__?: PhotoSealJpegSaveRuntimeSmokeReceipt;
  }
}

function shouldRegisterPhotoSealSaveSmoke(): boolean {
  return Boolean(import.meta.env.DEV || import.meta.env.MODE === "test");
}

export function registerPhotoSealSaveSmoke(): void {
  if (typeof window === "undefined" || !shouldRegisterPhotoSealSaveSmoke()) {
    return;
  }
  window.__runPhotoSealBrowserJpegSaveSmoke = async () => {
    const receipt = await runPhotoSealBrowserJpegSaveSmoke({ userActionObserved: true });
    window.__TDT_PHOTOSEAL_09_R1_SAVE_SMOKE__ = receipt;
    return receipt;
  };
  void TDT_PHOTOSEAL_09_R1_SAVE_SMOKE_REGISTER_POLICY;
}
