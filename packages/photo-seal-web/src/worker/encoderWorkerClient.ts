import type {
  CompressionSearchPlan,
  Jpeg444TargetBytesWasmReceipt,
  JpegColorPipelineSeal,
  JpegCompressionAttempt,
  JpegCompressionControl,
} from "../encoder/jpegWasmTypes";
import type { PhotoSealJpegEncoderAuthoritySeal } from "../encoder/wasmEncoderAuthority";
import type { AnyPhotoSealResizeResult } from "../resize/types";
import {
  makePhotoSealBridgeReceiptSeed,
  validateBridgeColorSpace,
  validateSelectedColorPipeline,
  validateWasmSrgbReceipt,
  type PhotoSealBridgeReceipt,
} from "../receipt/photoSealBridgeReceipt";
import type {
  EncoderWorkerEncodeRequest,
  EncoderWorkerEncodeSuccess,
  EncoderWorkerResponse,
} from "./encoderWorkerMessages";

export type EncodeRgbaReadbackToJpegRequest = {
  rgba: Uint8Array;
  width: number;
  height: number;
  targetBytes: number;
  alphaPolicy: "white-composite" | "discard";
  inputColorSpace: "srgb";
  rgbaColorSpace: "srgb";
  searchPlan: CompressionSearchPlan;
  resizeResult: AnyPhotoSealResizeResult;
};

export type EncodeRgbaReadbackToJpegResult = {
  jpeg: Uint8Array;
  width: number;
  height: number;
  sizeBytes: number;
  reachedTarget: boolean;
  selectedControl: JpegCompressionControl;
  selectedColorPipeline: JpegColorPipelineSeal;
  attempts: JpegCompressionAttempt[];
  wasmReceipt: Jpeg444TargetBytesWasmReceipt;
  encoderAuthority: PhotoSealJpegEncoderAuthoritySeal;
  encoderOwner: "wasm-tdt-jpeg";
  browserJpegEncodeUsed: false;
  browserJpegEncodeFallbackUsed: false;
  bridgeReceipt: PhotoSealBridgeReceipt;
  receipt: PhotoSealBridgeReceipt;
};

let worker: Worker | null = null;
let jobSeq = 0;

function getEncoderWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./encoderWorker.ts", import.meta.url), {
      type: "module",
      name: "tdt-photoseal-encoder-worker",
    });
  }
  return worker;
}

function nextJobId(): string {
  jobSeq += 1;
  return `tdt-photoseal-05-r1-job-${jobSeq}`;
}

function assertRgbaReadback(request: EncodeRgbaReadbackToJpegRequest): void {
  if (!(request.rgba instanceof Uint8Array)) {
    throw new Error("TDT-PHOTOSEAL-05-R1 requires RGBA Uint8Array readback.");
  }
  validateBridgeColorSpace(request.inputColorSpace);
  validateBridgeColorSpace(request.rgbaColorSpace);
  if (request.width !== request.resizeResult.width || request.height !== request.resizeResult.height) {
    throw new Error(`TDT-PHOTOSEAL-13-H3-R4 encoder input size must match resize result. resize=${request.resizeResult.width}x${request.resizeResult.height} encoder=${request.width}x${request.height}`);
  }
  const expected = request.width * request.height * 4;
  if (request.rgba.byteLength !== expected) {
    throw new Error(`TDT-PHOTOSEAL-05-R1 RGBA readback size mismatch. expected=${expected} actual=${request.rgba.byteLength}`);
  }
  if (request.rgba.byteOffset !== 0 || request.rgba.byteLength !== request.rgba.buffer.byteLength) {
    throw new Error("TDT-PHOTOSEAL-05-R1 requires an exact RGBA ArrayBuffer view before transfer.");
  }
}

function mapSuccess(response: EncoderWorkerEncodeSuccess): EncodeRgbaReadbackToJpegResult {
  validateWasmSrgbReceipt(response.wasmReceipt);
  validateSelectedColorPipeline(response.selectedColorPipeline);
  if (response.bridgeReceipt.rgbaColorSpace !== "srgb" || response.bridgeReceipt.jpegColorSpace !== "srgb") {
    throw new Error("TDT-PHOTOSEAL-05-R1 worker response missed bridge sRGB receipt.");
  }
  const jpeg = new Uint8Array(
    response.jpeg.buffer,
    response.jpeg.byteOffset,
    response.jpeg.byteLength
  );
  return {
    jpeg,
    width: response.width,
    height: response.height,
    sizeBytes: response.sizeBytes,
    reachedTarget: response.reachedTarget,
    selectedControl: response.selectedControl,
    selectedColorPipeline: response.selectedColorPipeline,
    attempts: response.attempts,
    wasmReceipt: response.wasmReceipt,
    encoderAuthority: response.encoderAuthority,
    encoderOwner: response.encoderOwner,
    browserJpegEncodeUsed: response.browserJpegEncodeUsed,
    browserJpegEncodeFallbackUsed: response.browserJpegEncodeFallbackUsed,
    bridgeReceipt: response.bridgeReceipt,
    receipt: response.bridgeReceipt,
  };
}

export async function encodeRgbaReadbackToJpegViaWorker(
  request: EncodeRgbaReadbackToJpegRequest
): Promise<EncodeRgbaReadbackToJpegResult> {
  assertRgbaReadback(request);
  const activeWorker = getEncoderWorker();
  const jobId = nextJobId();
  const seed = makePhotoSealBridgeReceiptSeed(request.resizeResult);
  const searchPlanJson = JSON.stringify(request.searchPlan);

  const message: EncoderWorkerEncodeRequest = {
    kind: "ENCODE_JPEG_444_TARGET_BYTES",
    jobId,
    rgba: {
      buffer: request.rgba.buffer as ArrayBuffer,
      byteOffset: request.rgba.byteOffset,
      byteLength: request.rgba.byteLength,
      width: request.width,
      height: request.height,
      format: "rgba8",
      colorSpace: "srgb",
    },
    alphaPolicy: request.alphaPolicy,
    inputColorSpace: "srgb",
    rgbaColorSpace: "srgb",
    searchPlan: request.searchPlan,
    searchPlanJson,
    targetBytes: request.targetBytes,
    bridgeReceiptSeed: seed,
  };

  return await new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent<EncoderWorkerResponse>) => {
      const response = event.data;
      if (response.jobId !== jobId) return;
      activeWorker.removeEventListener("message", onMessage);
      activeWorker.removeEventListener("error", onError);

      if (response.kind === "ENCODE_JPEG_444_TARGET_BYTES_SUCCESS") {
        resolve(mapSuccess(response));
        return;
      }

      reject(new Error(`${response.error.code}: ${response.error.message}`));
    };

    const onError = (event: ErrorEvent) => {
      activeWorker.removeEventListener("message", onMessage);
      activeWorker.removeEventListener("error", onError);
      reject(new Error(`WORKER_INIT_FAILED: ${event.message}`));
    };

    activeWorker.addEventListener("message", onMessage);
    activeWorker.addEventListener("error", onError);
    activeWorker.postMessage(message, [request.rgba.buffer as ArrayBuffer]);
  });
}
