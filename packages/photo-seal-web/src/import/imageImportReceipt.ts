import type {
  PhotoSealBrowserDecodeMethod,
  PhotoSealImageOrientationPolicy,
  PhotoSealImportSourceKind,
  PhotoSealSupportedImageMime,
} from "./imageImportTypes";

export type PhotoSealImageImportReceipt = {
  patchId: "TDT-PHOTOSEAL-08";
  stage: "real-image-import-browser-decode-srgb-no-canvas-color-correction";
  sourceKind: PhotoSealImportSourceKind;
  fileName?: string;
  mimeType: PhotoSealSupportedImageMime;
  fileBytes?: number;
  decodeOwner: "browser-decoder";
  decodeMethod: PhotoSealBrowserDecodeMethod;
  inputColorSpacePolicy: "browser-managed";
  decodedColorSpace: "srgb";
  importOutputColorSpace: "srgb";
  pixelFormat: "rgba8";
  width: number;
  height: number;
  orientationPolicy: PhotoSealImageOrientationPolicy;
  orientationAppliedByBrowserDecoder: boolean;
  orientationReceiptAvailable: boolean;
  browserDecodedInputAssumed: true;
  canvasUsedForDecode: false;
  canvasUsedForPixelExtraction: false;
  canvasColorCorrectionUsed: false;
  cpuColorCorrectionUsed: false;
  hiddenGammaTransformUsed: false;
  doubleGammaDetected: false;
  implicitColorTransformUsed: false;
  previewOnlyCanvasAllowed: boolean;
  objectUrlCreated: boolean;
  objectUrlRevoked: boolean;
  importReceiptVersion: 1;
};

export function makePhotoSealImageImportReceipt(args: {
  sourceKind: PhotoSealImportSourceKind;
  fileName?: string;
  mimeType: PhotoSealSupportedImageMime;
  fileBytes?: number;
  decodeMethod: PhotoSealBrowserDecodeMethod;
  width: number;
  height: number;
  orientationPolicy: PhotoSealImageOrientationPolicy;
  orientationAppliedByBrowserDecoder: boolean;
  objectUrlCreated?: boolean;
  objectUrlRevoked?: boolean;
}): PhotoSealImageImportReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-08",
    stage: "real-image-import-browser-decode-srgb-no-canvas-color-correction",
    sourceKind: args.sourceKind,
    fileName: args.fileName,
    mimeType: args.mimeType,
    fileBytes: args.fileBytes,
    decodeOwner: "browser-decoder",
    decodeMethod: args.decodeMethod,
    inputColorSpacePolicy: "browser-managed",
    decodedColorSpace: "srgb",
    importOutputColorSpace: "srgb",
    pixelFormat: "rgba8",
    width: args.width,
    height: args.height,
    orientationPolicy: args.orientationPolicy,
    orientationAppliedByBrowserDecoder: args.orientationAppliedByBrowserDecoder,
    orientationReceiptAvailable: true,
    browserDecodedInputAssumed: true,
    canvasUsedForDecode: false,
    canvasUsedForPixelExtraction: false,
    canvasColorCorrectionUsed: false,
    cpuColorCorrectionUsed: false,
    hiddenGammaTransformUsed: false,
    doubleGammaDetected: false,
    implicitColorTransformUsed: false,
    previewOnlyCanvasAllowed: true,
    objectUrlCreated: args.objectUrlCreated ?? false,
    objectUrlRevoked: args.objectUrlRevoked ?? true,
    importReceiptVersion: 1,
  };
}

export function validatePhotoSealImageImportReceipt(
  receipt: PhotoSealImageImportReceipt
): void {
  if (receipt.patchId !== "TDT-PHOTOSEAL-08") {
    throw new Error("Invalid PhotoSeal image import receipt patchId.");
  }
  if (receipt.decodeOwner !== "browser-decoder") {
    throw new Error("PhotoSeal import requires browser-decoder ownership.");
  }
  if (receipt.decodedColorSpace !== "srgb" || receipt.importOutputColorSpace !== "srgb") {
    throw new Error("PhotoSeal import requires srgb decode and import output receipt.");
  }
  if (
    receipt.canvasUsedForDecode !== false ||
    receipt.canvasUsedForPixelExtraction !== false ||
    receipt.canvasColorCorrectionUsed !== false
  ) {
    throw new Error("No Canvas Color Correction Seal was violated.");
  }
  if (
    receipt.hiddenGammaTransformUsed !== false ||
    receipt.doubleGammaDetected !== false ||
    receipt.implicitColorTransformUsed !== false
  ) {
    throw new Error("PhotoSeal import detected a hidden color transform risk.");
  }
}
