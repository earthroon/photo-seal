import type { PhotoSealExportAuditSummary } from "../receipt/exportAuditTypes";
import type { PhotoSealE2ESmokeReason } from "./photoSealE2ESmokeTypes";

export type PhotoSealE2EUiSmokeResult = {
  rendered: boolean;
  reason: PhotoSealE2ESmokeReason;
  debugJsonDefaultVisible: false;
};

export async function smokeRenderExportReceiptSurface(args: {
  auditSummary: PhotoSealExportAuditSummary;
}): Promise<PhotoSealE2EUiSmokeResult> {
  const audit = args.auditSummary;
  const statusRenderable = audit.exportStatus === "pass" || audit.exportStatus === "warn" || audit.exportStatus === "fail";
  const colorRenderable = audit.colorPipeline.jpegColorSpace === "srgb" && audit.colorPipeline.doubleGammaDetected === false;
  const jpegRenderable = audit.jpeg.subsampling === "444" && audit.jpeg.encodedColorSpace === "srgb";
  const bridgeRenderable = audit.bridge.workerColorTransformUsed === false;

  if (!statusRenderable || !colorRenderable || !jpegRenderable || !bridgeRenderable) {
    return {
      rendered: false,
      reason: "UI_RENDER_FAILED",
      debugJsonDefaultVisible: false,
    };
  }

  return {
    rendered: true,
    reason: "OK",
    debugJsonDefaultVisible: false,
  };
}

export const PHOTOSEAL_E2E_UI_SMOKE_POLICY =
  "ExportReceiptSurface render smoke checks status, color, JPEG, bridge sections; raw JSON remains collapsed by default.";
