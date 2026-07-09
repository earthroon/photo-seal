import type { PhotoSealImageImportReceipt } from "./imageImportReceipt";

export type PhotoSealImportSourceKind = "file" | "blob";

export type PhotoSealSupportedImageMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp";

export type PhotoSealBrowserDecodeMethod =
  | "create-image-bitmap"
  | "image-decoder";

export type PhotoSealImageOrientationPolicy =
  | "browser-from-image"
  | "none";

export type PhotoSealImportedImageSource = {
  sourceKind: PhotoSealImportSourceKind;
  fileName?: string;
  mimeType: PhotoSealSupportedImageMime;
  width: number;
  height: number;
  decodedColorSpace: "srgb";
  pixelFormat: "rgba8";
  imageBitmap?: ImageBitmap;
  bitmapSource?: ImageBitmap;
  receipt: PhotoSealImageImportReceipt;
};

export const PHOTOSEAL_SUPPORTED_IMAGE_MIME_TYPES: readonly PhotoSealSupportedImageMime[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const PHOTOSEAL_IMAGE_IMPORT_SEAL =
  "Browser decoder owns decode. No Canvas Color Correction Seal. decodedColorSpace srgb importOutputColorSpace srgb.";
