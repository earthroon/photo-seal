import { encodeRgbaToJpeg444TargetBytesWithWasm } from "../encoder/jpegWasmCompressionSearch";
import { assertCompressionSearchPlan } from "../encoder/jpegWasmTypes";
import {
  createPhotoSealBridgeReceipt,
  validateBridgeColorSpace,
  validateSelectedColorPipeline,
  validateWasmSrgbReceipt,
} from "../receipt/photoSealBridgeReceipt";
import type {
  EncoderWorkerBridgeErrorCode,
  EncoderWorkerEncodeFailure,
  EncoderWorkerEncodeRequest,
  EncoderWorkerEncodeSuccess,
  EncoderWorkerMessage,
} from "./encoderWorkerMessages";

function makeFailure(
  jobId: string,
  code: EncoderWorkerBridgeErrorCode,
  error: unknown
): EncoderWorkerEncodeFailure {
  const message = error instanceof Error ? error.message : String(error);
  return {
    kind: "ENCODE_JPEG_444_TARGET_BYTES_FAILURE",
    jobId,
    error: {
      patchId: "TDT-PHOTOSEAL-05-R1",
      code,
      message,
      detail: error,
    },
  };
}

function validateTransfer(request: EncoderWorkerEncodeRequest): Uint8Array {
  if (!(request.rgba.buffer instanceof ArrayBuffer)) {
    throw new Error("INVALID_TRANSFER_BUFFER: expected ArrayBuffer transport.");
  }
  if (request.rgba.format !== "rgba8") {
    throw new Error("INVALID_RGBA_READBACK: expected rgba8 transport format.");
  }
  validateBridgeColorSpace(request.rgba.colorSpace);
  validateBridgeColorSpace(request.rgbaColorSpace);
  validateBridgeColorSpace(request.inputColorSpace);
  const expected = request.rgba.width * request.rgba.height * 4;
  if (request.rgba.byteLength !== expected) {
    throw new Error(`INVALID_RGBA_READBACK: expected=${expected} actual=${request.rgba.byteLength}`);
  }
  return new Uint8Array(
    request.rgba.buffer,
    request.rgba.byteOffset,
    request.rgba.byteLength
  );
}

async function handleEncode(request: EncoderWorkerEncodeRequest): Promise<void> {
  try {
    const rgba = validateTransfer(request);
    assertCompressionSearchPlan(request.searchPlan);
    const encodeResult = await encodeRgbaToJpeg444TargetBytesWithWasm({
      rgba,
      width: request.rgba.width,
      height: request.rgba.height,
      targetBytes: request.targetBytes,
      alphaPolicy: request.alphaPolicy,
      inputColorSpace: "srgb",
      searchPlan: request.searchPlan,
    });

    if (encodeResult.width !== request.rgba.width || encodeResult.height !== request.rgba.height) {
      throw new Error(`ENCODE_SIZE_MISMATCH_AFTER_WASM: wasm result ${encodeResult.width}x${encodeResult.height} did not match resized RGBA input ${request.rgba.width}x${request.rgba.height}`);
    }

    validateWasmSrgbReceipt(encodeResult.receipt);
    validateSelectedColorPipeline(encodeResult.selectedColorPipeline);

    const bridgeReceipt = createPhotoSealBridgeReceipt({
      seed: request.bridgeReceiptSeed,
      targetBytes: request.targetBytes,
      encodeResult,
    });

    const response: EncoderWorkerEncodeSuccess = {
      kind: "ENCODE_JPEG_444_TARGET_BYTES_SUCCESS",
      jobId: request.jobId,
      jpeg: {
        buffer: encodeResult.jpg.buffer as ArrayBuffer,
        byteOffset: encodeResult.jpg.byteOffset,
        byteLength: encodeResult.jpg.byteLength,
        format: "jpeg",
        colorSpace: "srgb",
        subsampling: "444",
      },
      width: encodeResult.width,
      height: encodeResult.height,
      sizeBytes: encodeResult.sizeBytes,
      reachedTarget: encodeResult.reachedTarget,
      selectedControl: encodeResult.selectedControl,
      selectedColorPipeline: encodeResult.selectedColorPipeline,
      attempts: encodeResult.attempts,
      encoderAuthority: encodeResult.encoderAuthority,
      encoderOwner: encodeResult.encoderOwner,
      browserJpegEncodeUsed: encodeResult.browserJpegEncodeUsed,
      browserJpegEncodeFallbackUsed: encodeResult.browserJpegEncodeFallbackUsed,
      wasmReceipt: encodeResult.receipt,
      bridgeReceipt,
      receipt: bridgeReceipt,
    };

    self.postMessage(response, [encodeResult.jpg.buffer as ArrayBuffer]);
  } catch (error) {
    const response = makeFailure(request.jobId, "ENCODE_FAILED", error);
    self.postMessage(response);
  }
}

self.addEventListener("message", (event: MessageEvent<EncoderWorkerMessage>) => {
  const message = event.data;
  if (message.kind === "ENCODE_JPEG_444_TARGET_BYTES") {
    void handleEncode(message);
  }
});

export {};
