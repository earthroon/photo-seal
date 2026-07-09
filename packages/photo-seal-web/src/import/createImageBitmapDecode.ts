import { PhotoSealImageImportError } from "./imageImportError";
import type { PhotoSealImageOrientationPolicy } from "./imageImportTypes";

export async function decodeWithCreateImageBitmap(args: {
  blob: Blob;
  orientationPolicy: PhotoSealImageOrientationPolicy;
}): Promise<{
  imageBitmap: ImageBitmap;
  width: number;
  height: number;
  orientationAppliedByBrowserDecoder: boolean;
}> {
  if (typeof createImageBitmap !== "function") {
    throw new PhotoSealImageImportError(
      "IMAGE_BITMAP_UNAVAILABLE",
      "createImageBitmap is unavailable in this browser runtime."
    );
  }

  const options: ImageBitmapOptions = {
    imageOrientation: args.orientationPolicy === "browser-from-image" ? "from-image" : "none",
    premultiplyAlpha: "none",
  };

  try {
    const imageBitmap = await createImageBitmap(args.blob, options);
    if (imageBitmap.width <= 0 || imageBitmap.height <= 0) {
      throw new PhotoSealImageImportError(
        "IMAGE_DIMENSION_INVALID",
        "Decoded image dimensions are invalid."
      );
    }
    return {
      imageBitmap,
      width: imageBitmap.width,
      height: imageBitmap.height,
      orientationAppliedByBrowserDecoder: args.orientationPolicy === "browser-from-image",
    };
  } catch (error) {
    if (error instanceof PhotoSealImageImportError) {
      throw error;
    }
    throw new PhotoSealImageImportError(
      "BROWSER_DECODE_FAILED",
      error instanceof Error ? error.message : "Browser decode failed."
    );
  }
}
