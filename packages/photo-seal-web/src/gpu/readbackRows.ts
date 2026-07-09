import { PhotoSealWebGPUError } from "./gpuError";
import { validateGpuDimension } from "./webgpuSupport";

export function alignTo256(value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new PhotoSealWebGPUError(
      "INVALID_READBACK_LAYOUT",
      "alignTo256 value must be a positive integer."
    );
  }
  return (value + 255) & ~255;
}

export function getPaddedBytesPerRow(width: number, bytesPerPixel: number): number {
  const validWidth = validateGpuDimension("width", width);
  if (!Number.isInteger(bytesPerPixel) || bytesPerPixel <= 0) {
    throw new PhotoSealWebGPUError(
      "INVALID_READBACK_LAYOUT",
      "bytesPerPixel must be a positive integer."
    );
  }
  return alignTo256(validWidth * bytesPerPixel);
}

export type StripPaddedRowsRequest = {
  padded: Uint8Array;
  width: number;
  height: number;
  bytesPerPixel: number;
  paddedBytesPerRow: number;
};

export function stripPaddedRows(request: StripPaddedRowsRequest): Uint8Array {
  const width = validateGpuDimension("width", request.width);
  const height = validateGpuDimension("height", request.height);

  if (!(request.padded instanceof Uint8Array)) {
    throw new PhotoSealWebGPUError(
      "INVALID_READBACK_LAYOUT",
      "Padded readback must be a Uint8Array."
    );
  }

  if (!Number.isInteger(request.bytesPerPixel) || request.bytesPerPixel <= 0) {
    throw new PhotoSealWebGPUError(
      "INVALID_READBACK_LAYOUT",
      "bytesPerPixel must be a positive integer."
    );
  }

  const unpaddedBytesPerRow = width * request.bytesPerPixel;
  if (request.paddedBytesPerRow < unpaddedBytesPerRow) {
    throw new PhotoSealWebGPUError(
      "INVALID_READBACK_LAYOUT",
      "paddedBytesPerRow cannot be smaller than the unpadded row size."
    );
  }

  const requiredPaddedBytes = request.paddedBytesPerRow * height;
  if (request.padded.length < requiredPaddedBytes) {
    throw new PhotoSealWebGPUError(
      "INVALID_READBACK_LAYOUT",
      `Padded readback too small. expected>=${requiredPaddedBytes} actual=${request.padded.length}`
    );
  }

  const output = new Uint8Array(width * height * request.bytesPerPixel);
  for (let y = 0; y < height; y += 1) {
    const srcOffset = y * request.paddedBytesPerRow;
    const dstOffset = y * unpaddedBytesPerRow;
    output.set(
      request.padded.subarray(srcOffset, srcOffset + unpaddedBytesPerRow),
      dstOffset
    );
  }

  return output;
}
