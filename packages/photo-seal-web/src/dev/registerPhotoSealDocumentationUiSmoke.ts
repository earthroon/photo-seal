import { runPhotoSealDocumentationUiRuntimeSmoke } from "../documentation/documentationUiRuntimeSmoke";

export type PhotoSealDocumentationUiSmokeRunner = typeof runPhotoSealDocumentationUiRuntimeSmoke;

declare global {
  interface Window {
    __runPhotoSealDocumentationUiRuntimeSmoke?: PhotoSealDocumentationUiSmokeRunner;
    __TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_SMOKE__?: unknown;
  }
}

export function registerPhotoSealDocumentationUiSmoke(): void {
  if (typeof window === "undefined") {
    return;
  }
  const env = import.meta.env.MODE;
  if (import.meta.env.DEV || env === "test") {
    window.__runPhotoSealDocumentationUiRuntimeSmoke = runPhotoSealDocumentationUiRuntimeSmoke;
  }
}
