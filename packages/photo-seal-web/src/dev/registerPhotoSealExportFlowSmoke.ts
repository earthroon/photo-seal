import { runPhotoSealExportFlowRuntimeSmoke } from "../assembly/exportFlowRuntimeSmoke";

declare global {
  interface Window {
    __runPhotoSealExportFlowRuntimeSmoke?: typeof runPhotoSealExportFlowRuntimeSmoke;
    __TDT_PHOTOSEAL_13_EXPORT_FLOW_SMOKE__?: unknown;
  }
}

export function registerPhotoSealExportFlowSmoke(): void {
  if (typeof window === "undefined") return;
  window.__runPhotoSealExportFlowRuntimeSmoke = async () => {
    const receipt = await runPhotoSealExportFlowRuntimeSmoke();
    window.__TDT_PHOTOSEAL_13_EXPORT_FLOW_SMOKE__ = receipt;
    return receipt;
  };
}
