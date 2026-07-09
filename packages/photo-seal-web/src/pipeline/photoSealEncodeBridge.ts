import type { CompressionSearchPlan } from "../encoder/jpegWasmTypes";
import type { AnyPhotoSealResizeResult } from "../resize/types";
import { validateBridgeColorSpace } from "../receipt/photoSealBridgeReceipt";
import {
  encodeRgbaReadbackToJpegViaWorker,
  type EncodeRgbaReadbackToJpegResult,
} from "../worker/encoderWorkerClient";

export type PhotoSealEncodeBridgeRequest = {
  resizeResult: AnyPhotoSealResizeResult;
  targetBytes: number;
  alphaPolicy: "white-composite" | "discard";
  rgbaColorSpace: "srgb";
  inputColorSpace: "srgb";
  searchPlan: CompressionSearchPlan;
};

export type PhotoSealEncodeBridgeResult = EncodeRgbaReadbackToJpegResult;

export async function encodePhotoSealRgbaReadbackToJpeg(
  request: PhotoSealEncodeBridgeRequest
): Promise<PhotoSealEncodeBridgeResult> {
  validateBridgeColorSpace(request.rgbaColorSpace);
  validateBridgeColorSpace(request.inputColorSpace);
  return await encodeRgbaReadbackToJpegViaWorker({
    rgba: request.resizeResult.rgba,
    width: request.resizeResult.width,
    height: request.resizeResult.height,
    targetBytes: request.targetBytes,
    alphaPolicy: request.alphaPolicy,
    rgbaColorSpace: "srgb",
    inputColorSpace: "srgb",
    searchPlan: request.searchPlan,
    resizeResult: request.resizeResult,
  });
}

export const bridgeRgbaReadbackToJpegWasm = encodePhotoSealRgbaReadbackToJpeg;
