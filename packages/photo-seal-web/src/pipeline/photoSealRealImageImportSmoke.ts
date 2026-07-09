import { importPhotoSealImageFromBlob } from "../import/browserImageImport";
import type { PhotoSealImageImportReceipt } from "../import/imageImportReceipt";

export type PhotoSealRealImageImportSmokeReceipt = {
  patchId: "TDT-PHOTOSEAL-08";
  stage: "real-image-import-browser-decode-srgb-no-canvas-color-correction";
  status: "PASS" | "FAIL" | "NOT_RUN";
  reason: string;
  runtimeActuallyExecuted: boolean;
  runtimePassClaimed: boolean;
  importReceipt?: PhotoSealImageImportReceipt;
  canvasUsedForDecode: false;
  canvasUsedForPixelExtraction: false;
  canvasColorCorrectionUsed: false;
};

const ONE_PIXEL_PNG = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1,
  8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120, 156, 99, 248, 255,
  255, 63, 0, 5, 254, 2, 254, 220, 204, 89, 231, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96,
  130,
]);

export async function runPhotoSealRealImageImportSmoke(): Promise<PhotoSealRealImageImportSmokeReceipt> {
  if (typeof Blob !== "function" || typeof createImageBitmap !== "function") {
    return {
      patchId: "TDT-PHOTOSEAL-08",
      stage: "real-image-import-browser-decode-srgb-no-canvas-color-correction",
      status: "NOT_RUN",
      reason: "NO_BROWSER_RUNTIME",
      runtimeActuallyExecuted: false,
      runtimePassClaimed: false,
      canvasUsedForDecode: false,
      canvasUsedForPixelExtraction: false,
      canvasColorCorrectionUsed: false,
    };
  }

  try {
    const imported = await importPhotoSealImageFromBlob({
      blob: new Blob([ONE_PIXEL_PNG], { type: "image/png" }),
      mimeType: "image/png",
      decodeMethod: "create-image-bitmap",
      orientationPolicy: "none",
    });
    return {
      patchId: "TDT-PHOTOSEAL-08",
      stage: "real-image-import-browser-decode-srgb-no-canvas-color-correction",
      status: "PASS",
      reason: "OK",
      runtimeActuallyExecuted: true,
      runtimePassClaimed: true,
      importReceipt: imported.receipt,
      canvasUsedForDecode: false,
      canvasUsedForPixelExtraction: false,
      canvasColorCorrectionUsed: false,
    };
  } catch (error) {
    return {
      patchId: "TDT-PHOTOSEAL-08",
      stage: "real-image-import-browser-decode-srgb-no-canvas-color-correction",
      status: "FAIL",
      reason: error instanceof Error ? error.message : "IMPORT_SMOKE_FAILED",
      runtimeActuallyExecuted: true,
      runtimePassClaimed: false,
      canvasUsedForDecode: false,
      canvasUsedForPixelExtraction: false,
      canvasColorCorrectionUsed: false,
    };
  }
}
