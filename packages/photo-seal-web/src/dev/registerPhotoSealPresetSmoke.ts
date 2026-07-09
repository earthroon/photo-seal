import { runPhotoSealPresetSelectorRuntimeSmoke } from "../preset/presetSelectorRuntimeSmoke";
import type { PhotoSealPresetSelectorRuntimeSmokeReceipt } from "../preset/presetRuntimeSmokeReceipt";

const TDT_PHOTOSEAL_11_R1_PRESET_SMOKE_REGISTER_POLICY =
  "No Silent Preset Fallback Seal: registering the preset smoke hook must not run export or save automatically.";

declare global {
  interface Window {
    __runPhotoSealPresetSelectorRuntimeSmoke?: () => Promise<PhotoSealPresetSelectorRuntimeSmokeReceipt>;
    __TDT_PHOTOSEAL_11_R1_PRESET_SMOKE__?: PhotoSealPresetSelectorRuntimeSmokeReceipt;
  }
}

function shouldRegisterPhotoSealPresetSmoke(): boolean {
  return Boolean(import.meta.env.DEV || import.meta.env.MODE === "test");
}

export function registerPhotoSealPresetSmoke(): void {
  if (typeof window === "undefined" || !shouldRegisterPhotoSealPresetSmoke()) {
    return;
  }
  window.__runPhotoSealPresetSelectorRuntimeSmoke = async () => {
    const receipt = await runPhotoSealPresetSelectorRuntimeSmoke({ presetId: "resume-photo-300x400" });
    window.__TDT_PHOTOSEAL_11_R1_PRESET_SMOKE__ = receipt;
    return receipt;
  };
  void TDT_PHOTOSEAL_11_R1_PRESET_SMOKE_REGISTER_POLICY;
}
