import { PhotoSealImageImportError } from "./imageImportError";
import type { PhotoSealSupportedImageMime } from "./imageImportTypes";

type MinimalImageDecoderConstructor = new (args: { data: Blob; type: string }) => {
  decode: () => Promise<{ image: ImageBitmap }>;
  close?: () => void;
};

export async function decodeWithImageDecoder(args: {
  blob: Blob;
  mimeType: PhotoSealSupportedImageMime;
}): Promise<{
  imageBitmap: ImageBitmap;
  width: number;
  height: number;
}> {
  const maybeDecoder = (globalThis as unknown as {
  ImageDecoder?: MinimalImageDecoderConstructor;
}).ImageDecoder;
  if (!maybeDecoder) {
    throw new PhotoSealImageImportError(
      "IMAGE_BITMAP_UNAVAILABLE",
      "ImageDecoder is unavailable in this browser runtime."
    );
  }

  const decoder = new maybeDecoder({ data: args.blob, type: args.mimeType });
  try {
    const decoded = await decoder.decode();
    const imageBitmap = decoded.image;
    if (!imageBitmap || imageBitmap.width <= 0 || imageBitmap.height <= 0) {
      throw new PhotoSealImageImportError(
        "IMAGE_DIMENSION_INVALID",
        "Decoded image dimensions are invalid."
      );
    }
    return { imageBitmap, width: imageBitmap.width, height: imageBitmap.height };
  } catch (error) {
    if (error instanceof PhotoSealImageImportError) {
      throw error;
    }
    throw new PhotoSealImageImportError(
      "BROWSER_DECODE_FAILED",
      error instanceof Error ? error.message : "ImageDecoder decode failed."
    );
  } finally {
    decoder.close?.();
  }
}
