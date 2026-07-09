import { runPhotoSealCustomPresetValidationRuntimeSmoke } from "../preset/customPresetValidationRuntimeSmoke";

const TDT_PHOTOSEAL_11_R2_REGISTER_POLICY =
  "No Clamp Feedback Ambiguity Seal: registering the custom preset validation smoke hook must not apply presets automatically.";

declare global {
  interface Window {
    __runPhotoSealCustomPresetValidationRuntimeSmoke?: () => Promise<unknown>;
    __TDT_PHOTOSEAL_11_R2_CUSTOM_PRESET_VALIDATION_SMOKE__?: unknown;
  }
}

function shouldRegisterPhotoSealCustomPresetValidationSmoke(): boolean {
  return Boolean(import.meta.env.DEV || import.meta.env.MODE === "test");
}

export function registerPhotoSealCustomPresetValidationSmoke(): void {
  if (typeof window === "undefined" || !shouldRegisterPhotoSealCustomPresetValidationSmoke()) {
    return;
  }
  window.__runPhotoSealCustomPresetValidationRuntimeSmoke = async () => {
    const receipt = await runPhotoSealCustomPresetValidationRuntimeSmoke();
    window.__TDT_PHOTOSEAL_11_R2_CUSTOM_PRESET_VALIDATION_SMOKE__ = receipt;
    return receipt;
  };
  void TDT_PHOTOSEAL_11_R2_REGISTER_POLICY;
}
