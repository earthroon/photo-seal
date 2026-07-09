import { runPhotoSealPresetDocumentationRuntimeSmoke } from "../documentation/presetDocumentationRuntimeSmoke";

declare global {
  interface Window {
    __runPhotoSealPresetDocumentationRuntimeSmoke?: typeof runPhotoSealPresetDocumentationRuntimeSmoke;
    __TDT_PHOTOSEAL_12_PRESET_DOCUMENTATION_SMOKE__?: unknown;
  }
}

export function registerPhotoSealPresetDocumentationSmoke(): void {
  if (typeof window === "undefined") {
    return;
  }
  const env = import.meta.env.MODE;
  if (import.meta.env.DEV || env === "test") {
    window.__runPhotoSealPresetDocumentationRuntimeSmoke = runPhotoSealPresetDocumentationRuntimeSmoke;
  }
}
