import { decodeWithCreateImageBitmap } from "./createImageBitmapDecode";
import { decodeWithImageDecoder } from "./imageDecoderDecode";
import { PhotoSealImageImportError } from "./imageImportError";
import { makePhotoSealImageImportReceipt } from "./imageImportReceipt";
import type {
  PhotoSealBrowserDecodeMethod,
  PhotoSealImageOrientationPolicy,
  PhotoSealImportedImageSource,
  PhotoSealSupportedImageMime,
} from "./imageImportTypes";
import { PHOTOSEAL_SUPPORTED_IMAGE_MIME_TYPES } from "./imageImportTypes";

function assertSupportedMimeType(value: string): asserts value is PhotoSealSupportedImageMime {
  if (!PHOTOSEAL_SUPPORTED_IMAGE_MIME_TYPES.includes(value as PhotoSealSupportedImageMime)) {
    throw new PhotoSealImageImportError(
      "UNSUPPORTED_MIME_TYPE",
      `Unsupported PhotoSeal image type: ${value || "empty"}`
    );
  }
}

function assertNonEmptyBlob(blob: Blob): void {
  if (blob.size <= 0) {
    throw new PhotoSealImageImportError("EMPTY_FILE", "PhotoSeal import file is empty.");
  }
}

async function decodeBrowserImage(args: {
  blob: Blob;
  mimeType: PhotoSealSupportedImageMime;
  decodeMethod: PhotoSealBrowserDecodeMethod;
  orientationPolicy: PhotoSealImageOrientationPolicy;
}): Promise<{
  imageBitmap: ImageBitmap;
  width: number;
  height: number;
  decodeMethod: PhotoSealBrowserDecodeMethod;
  orientationAppliedByBrowserDecoder: boolean;
}> {
  if (args.decodeMethod === "image-decoder") {
    try {
      const decoded = await decodeWithImageDecoder({ blob: args.blob, mimeType: args.mimeType });
      return {
        ...decoded,
        decodeMethod: "image-decoder",
        orientationAppliedByBrowserDecoder: args.orientationPolicy === "browser-from-image",
      };
    } catch (error) {
      if (!(error instanceof PhotoSealImageImportError) || error.code !== "IMAGE_BITMAP_UNAVAILABLE") {
        throw error;
      }
    }
  }

  const decoded = await decodeWithCreateImageBitmap({
    blob: args.blob,
    orientationPolicy: args.orientationPolicy,
  });
  return { ...decoded, decodeMethod: "create-image-bitmap" };
}

export async function importPhotoSealImageFromFile(args: {
  file: File;
  decodeMethod?: PhotoSealBrowserDecodeMethod;
  orientationPolicy?: PhotoSealImageOrientationPolicy;
}): Promise<PhotoSealImportedImageSource> {
  assertNonEmptyBlob(args.file);
  assertSupportedMimeType(args.file.type);

  const orientationPolicy = args.orientationPolicy ?? "browser-from-image";
  const decoded = await decodeBrowserImage({
    blob: args.file,
    mimeType: args.file.type,
    decodeMethod: args.decodeMethod ?? "create-image-bitmap",
    orientationPolicy,
  });

  const receipt = makePhotoSealImageImportReceipt({
    sourceKind: "file",
    fileName: args.file.name,
    mimeType: args.file.type,
    fileBytes: args.file.size,
    decodeMethod: decoded.decodeMethod,
    width: decoded.width,
    height: decoded.height,
    orientationPolicy,
    orientationAppliedByBrowserDecoder: decoded.orientationAppliedByBrowserDecoder,
    objectUrlCreated: false,
    objectUrlRevoked: true,
  });

  return {
    sourceKind: "file",
    fileName: args.file.name,
    mimeType: args.file.type,
    width: decoded.width,
    height: decoded.height,
    decodedColorSpace: "srgb",
    pixelFormat: "rgba8",
    imageBitmap: decoded.imageBitmap,
    bitmapSource: decoded.imageBitmap,
    receipt,
  };
}

export async function importPhotoSealImageFromBlob(args: {
  blob: Blob;
  mimeType: PhotoSealSupportedImageMime;
  decodeMethod?: PhotoSealBrowserDecodeMethod;
  orientationPolicy?: PhotoSealImageOrientationPolicy;
}): Promise<PhotoSealImportedImageSource> {
  assertNonEmptyBlob(args.blob);
  assertSupportedMimeType(args.mimeType);

  const orientationPolicy = args.orientationPolicy ?? "browser-from-image";
  const decoded = await decodeBrowserImage({
    blob: args.blob,
    mimeType: args.mimeType,
    decodeMethod: args.decodeMethod ?? "create-image-bitmap",
    orientationPolicy,
  });

  const receipt = makePhotoSealImageImportReceipt({
    sourceKind: "blob",
    mimeType: args.mimeType,
    fileBytes: args.blob.size,
    decodeMethod: decoded.decodeMethod,
    width: decoded.width,
    height: decoded.height,
    orientationPolicy,
    orientationAppliedByBrowserDecoder: decoded.orientationAppliedByBrowserDecoder,
    objectUrlCreated: false,
    objectUrlRevoked: true,
  });

  return {
    sourceKind: "blob",
    mimeType: args.mimeType,
    width: decoded.width,
    height: decoded.height,
    decodedColorSpace: "srgb",
    pixelFormat: "rgba8",
    imageBitmap: decoded.imageBitmap,
    bitmapSource: decoded.imageBitmap,
    receipt,
  };
}

export const PHOTOSEAL_IMPORT_FORBIDDEN_CANVAS_PATH =
  "No Canvas Color Correction Seal: pipeline import does not use canvas pixel extraction.";
