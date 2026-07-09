import type {
  CompressionSearchPlan,
  Jpeg444TargetBytesWasmResult,
} from "./jpegWasmTypes";
import { assertCompressionSearchPlan } from "./jpegWasmTypes";
import { getTdtJpegWasmBindings } from "./jpegWasmLoader";
import { assertPhotoSealWasmEncoderAuthority } from "./wasmEncoderAuthority";

export type JpegWasmTargetEncodeRequest = {
  rgba: Uint8Array;
  width: number;
  height: number;
  targetBytes: number;
  alphaPolicy: "white-composite" | "discard";
  inputColorSpace: "srgb";
  searchPlan: CompressionSearchPlan;
};

function assertRgbaContract(request: JpegWasmTargetEncodeRequest): void {
  if (!(request.rgba instanceof Uint8Array)) {
    throw new Error("PhotoSeal WASM bridge expected RGBA Uint8Array.");
  }
  if (!Number.isInteger(request.width) || request.width <= 0) {
    throw new Error("PhotoSeal WASM bridge width must be a positive integer.");
  }
  if (!Number.isInteger(request.height) || request.height <= 0) {
    throw new Error("PhotoSeal WASM bridge height must be a positive integer.");
  }
  const expected = request.width * request.height * 4;
  if (request.rgba.byteLength !== expected) {
    throw new Error(`PhotoSeal WASM bridge RGBA length mismatch. expected=${expected} actual=${request.rgba.byteLength}`);
  }
  if (!Number.isInteger(request.targetBytes) || request.targetBytes <= 0) {
    throw new Error("PhotoSeal targetBytes must be a positive integer.");
  }
  if (request.inputColorSpace !== "srgb") {
    throw new Error("PhotoSeal JPEG WASM bridge requires inputColorSpace: srgb.");
  }
  assertCompressionSearchPlan(request.searchPlan);
}

function normalizeWasmResult(value: unknown, encoderAuthority: Jpeg444TargetBytesWasmResult["encoderAuthority"]): Jpeg444TargetBytesWasmResult {
  assertPhotoSealWasmEncoderAuthority(encoderAuthority);
  const result = value as Omit<Jpeg444TargetBytesWasmResult, "encoderAuthority" | "encoderOwner" | "browserJpegEncodeUsed" | "browserJpegEncodeFallbackUsed">;
  if (!(result.jpg instanceof Uint8Array)) {
    throw new Error("PhotoSeal WASM result did not include JPEG Uint8Array.");
  }
  if (result.receipt?.subsampling !== "444") {
    throw new Error("PhotoSeal WASM result did not preserve JPEG 4:4:4 receipt.");
  }
  if (result.receipt.patchId !== "TDT-JPEG-WASM-03-R1") {
    throw new Error("PhotoSeal WASM result did not return the TDT-JPEG-WASM-03-R1 receipt.");
  }
  if (result.receipt.inputColorSpace !== "srgb" || result.receipt.encodedColorSpace !== "srgb") {
    throw new Error("PhotoSeal WASM result violated sRGB color pipeline receipt.");
  }
  if (result.selectedColorPipeline?.inputColorSpace !== "srgb" || result.selectedColorPipeline?.encodedColorSpace !== "srgb") {
    throw new Error("PhotoSeal WASM result did not seal selectedColorPipeline as sRGB.");
  }
  if (!result.attempts.every((attempt) => attempt.colorPipeline?.inputColorSpace === "srgb" && attempt.colorPipeline?.encodedColorSpace === "srgb")) {
    throw new Error("PhotoSeal WASM result did not seal every targetBytes attempt as sRGB.");
  }
  if (result.receipt.gammaTransformUsed || result.receipt.hiddenLinearizationUsed || result.receipt.doubleGammaDetected) {
    throw new Error("PhotoSeal WASM result reported forbidden gamma or hidden color transform.");
  }
  if (result.receipt.resizedInsideEncoder !== false || result.receipt.cropInsideEncoder !== false) {
    throw new Error("PhotoSeal WASM result violated resize/crop ownership seal.");
  }
  return {
    ...result,
    encoderAuthority,
    encoderOwner: "wasm-tdt-jpeg",
    browserJpegEncodeUsed: false,
    browserJpegEncodeFallbackUsed: false,
    receipt: {
      ...result.receipt,
      encoderOwner: "wasm-tdt-jpeg",
      browserJpegEncodeUsed: false,
      browserJpegEncodeFallbackUsed: false,
    },
  };
}

export async function encodeRgbaToJpeg444TargetBytesWithWasm(
  request: JpegWasmTargetEncodeRequest
): Promise<Jpeg444TargetBytesWasmResult> {
  assertRgbaContract(request);
  const bindings = await getTdtJpegWasmBindings();
  const result = bindings.encode_rgba_to_jpeg_444_target_bytes_wasm(
    request.rgba,
    request.width,
    request.height,
    request.targetBytes,
    request.alphaPolicy,
    JSON.stringify(request.searchPlan),
    request.inputColorSpace
  );
  return normalizeWasmResult(await result, bindings.encoderAuthority);
}
