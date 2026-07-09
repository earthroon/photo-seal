import type {
  CompressionSearchPlan,
  Jpeg444TargetBytesWasmReceipt,
  JpegColorPipelineSeal,
  JpegCompressionAttempt,
  JpegCompressionControl,
  JpegSamplingAudit,
} from "../encoder/jpegWasmTypes";
import type { PhotoSealBridgeReceipt, PhotoSealBridgeReceiptSeed } from "../receipt/photoSealBridgeReceipt";
import type { PhotoSealJpegEncoderAuthoritySeal } from "../encoder/wasmEncoderAuthority";

export type EncoderWorkerBridgeErrorCode =
  | "WORKER_INIT_FAILED"
  | "WASM_INIT_FAILED"
  | "WASM_SIMD_UNAVAILABLE"
  | "INVALID_RGBA_READBACK"
  | "INVALID_TRANSFER_BUFFER"
  | "DETACHED_BUFFER_REUSE"
  | "INVALID_SEARCH_PLAN"
  | "INVALID_COLOR_SPACE"
  | "ENCODE_FAILED"
  | "JPEG_444_AUDIT_FAILED"
  | "WORKER_RESPONSE_MISMATCH";

export type EncoderWorkerEncodeRequest = {
  kind: "ENCODE_JPEG_444_TARGET_BYTES";
  jobId: string;
  rgba: {
    buffer: ArrayBuffer;
    byteOffset: number;
    byteLength: number;
    width: number;
    height: number;
    format: "rgba8";
    colorSpace: "srgb";
  };
  alphaPolicy: "white-composite" | "discard";
  inputColorSpace: "srgb";
  rgbaColorSpace: "srgb";
  searchPlan: CompressionSearchPlan;
  searchPlanJson: string;
  targetBytes: number;
  bridgeReceiptSeed: PhotoSealBridgeReceiptSeed;
};

export type EncoderWorkerEncodeSuccess = {
  kind: "ENCODE_JPEG_444_TARGET_BYTES_SUCCESS";
  jobId: string;
  jpeg: {
    buffer: ArrayBuffer;
    byteOffset: number;
    byteLength: number;
    format: "jpeg";
    colorSpace: "srgb";
    subsampling: "444";
  };
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

export type EncoderWorkerEncodeFailure = {
  kind: "ENCODE_JPEG_444_TARGET_BYTES_FAILURE";
  jobId: string;
  error: {
    patchId: "TDT-PHOTOSEAL-05-R1";
    code: EncoderWorkerBridgeErrorCode;
    message: string;
    detail?: unknown;
  };
  receipt?: PhotoSealBridgeReceipt;
};

export type EncoderWorkerMessage = EncoderWorkerEncodeRequest;
export type EncoderWorkerResponse = EncoderWorkerEncodeSuccess | EncoderWorkerEncodeFailure;

export type WorkerSamplingAuditReceipt = JpegSamplingAudit;
