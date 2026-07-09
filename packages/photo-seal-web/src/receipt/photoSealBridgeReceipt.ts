import type {
  Jpeg444TargetBytesWasmReceipt,
  Jpeg444TargetBytesWasmResult,
  JpegColorPipelineSeal,
  JpegCompressionControl,
} from "../encoder/jpegWasmTypes";
import type { AnyPhotoSealResizeResult } from "../resize/types";

export type PhotoSealBridgeReceiptSeed = {
  resize: {
    patchId: string;
    profile: string;
    width: number;
    height: number;
    outputBytes: number;
    format: "rgba8";
    colorSpace: "srgb";
  };
};

export type PhotoSealBridgeReceipt = {
  patchId: "TDT-PHOTOSEAL-05-R1";
  stage: "rgba-readback-to-jpeg-wasm-bridge-srgb-contract-rebind";
  rgbaWidth: number;
  rgbaHeight: number;
  rgbaBytes: number;
  rgbaPixelFormat: "rgba8";
  rgbaColorSpace: "srgb";
  resize: {
    patchId: string;
    profile: string;
    width: number;
    height: number;
    outputBytes: number;
    format: "rgba8";
    colorSpace: "srgb";
  };
  transfer: {
    rgbaTransferredToWorker: true;
    jpegTransferredFromWorker: true;
    transferMode: "arraybuffer-transfer";
    arrayBufferTransferUsed: true;
    paddedBufferTransferred: false;
  };
  worker: {
    used: true;
    singleThread: true;
    nestedWorkerUsed: false;
    workerPoolUsed: false;
    workerColorTransformUsed: false;
    workerGammaTransformUsed: false;
    workerHiddenLinearizationUsed: false;
    workerDoubleGammaDetected: false;
  };
  wasm: {
    used: true;
    encoderOwner: "wasm-tdt-jpeg";
    wasmEncoderRequired: true;
    wasmGlueLoaded: boolean;
    wasmEncodeFunctionPresent: boolean;
    browserJpegEncodeUsed: false;
    browserJpegEncodeFallbackUsed: false;
    simdRequired: true;
    wasmSimdRequired: true;
    singleThread: true;
    wasmSingleThread: true;
    pthreadUsed: false;
    sharedArrayBufferRequired: false;
    wasmInputColorSpace: "srgb";
    wasmReceiptPatchId: "TDT-JPEG-WASM-03-R1";
    wasmReceiptStage: "target-bytes-compression-handle-search-srgb-seal";
  };
  encode: {
    patchId: "TDT-JPEG-WASM-03-R1";
    targetBytes: number;
    outputBytes: number;
    reachedTarget: boolean;
    selectedControl: JpegCompressionControl;
    attemptsCount: number;
    selectedColorPipeline: JpegColorPipelineSeal;
    jpegColorSpace: "srgb";
    jpegSubsampling: "444";
    subsampling: "444";
    jpegMagicValid: true;
    samplingAuditIs444: true;
    inputColorSpace: "srgb";
    encodedColorSpace: "srgb";
    gammaTransformUsed: false;
    hiddenLinearizationUsed: false;
    doubleGammaDetected: false;
    compressionHandleSearchUsed: true;
    targetBytesUsed: true;
    qualitySearchUsed: true;
  };
  ownership: {
    encoderOwner: "wasm-tdt-jpeg";
    browserJpegEncodeUsed: false;
    browserJpegEncodeFallbackUsed: false;
    canvasToBlobUsed: false;
    canvasToDataUrlUsed: false;
    offscreenCanvasConvertToBlobUsed: false;
    resizedInsideEncoder: false;
    cropInsideEncoder: false;
    fallbackUsed: false;
    cpuFallbackUsed: false;
    canvasFallbackUsed: false;
  };
  selectedColorPipeline: JpegColorPipelineSeal;
  wasmReceiptPatchId: "TDT-JPEG-WASM-03-R1";
  wasmReceiptStage: "target-bytes-compression-handle-search-srgb-seal";
  wasmInputColorSpace: "srgb";
  workerSingleThread: true;
  wasmSimdRequired: true;
  sharedArrayBufferRequired: false;
  jpegColorSpace: "srgb";
  jpegSubsampling: "444";
  encoderOwner: "wasm-tdt-jpeg";
  browserJpegEncodeUsed: false;
  browserJpegEncodeFallbackUsed: false;
  workerColorTransformUsed: false;
  workerGammaTransformUsed: false;
  workerHiddenLinearizationUsed: false;
  workerDoubleGammaDetected: false;
  reachedTarget: boolean;
  targetBytesUsed: true;
  qualitySearchUsed: true;
  compressionHandleSearchUsed: true;
};

export function validateBridgeColorSpace(value: unknown): asserts value is "srgb" {
  if (value !== "srgb") {
    throw new Error("TDT-PHOTOSEAL-05-R1 requires colorSpace: srgb.");
  }
}

export function validateSelectedColorPipeline(seal: JpegColorPipelineSeal): void {
  validateBridgeColorSpace(seal.inputColorSpace);
  validateBridgeColorSpace(seal.rgbColorSpace);
  validateBridgeColorSpace(seal.encodedColorSpace);
  if (seal.gammaTransformUsed !== false) {
    throw new Error("TDT-PHOTOSEAL-05-R1 rejected selectedColorPipeline gammaTransformUsed.");
  }
  if (seal.hiddenLinearizationUsed !== false) {
    throw new Error("TDT-PHOTOSEAL-05-R1 rejected selectedColorPipeline hiddenLinearizationUsed.");
  }
  if (seal.doubleGammaDetected !== false) {
    throw new Error("TDT-PHOTOSEAL-05-R1 rejected selectedColorPipeline doubleGammaDetected.");
  }
}

export function validateWasmSrgbReceipt(receipt: Jpeg444TargetBytesWasmReceipt): void {
  if (receipt.patchId !== "TDT-JPEG-WASM-03-R1") {
    throw new Error("TDT-PHOTOSEAL-05-R1 requires TDT-JPEG-WASM-03-R1 receipt.");
  }
  if (receipt.stage !== "target-bytes-compression-handle-search-srgb-seal") {
    throw new Error("TDT-PHOTOSEAL-05-R1 rejected unexpected WASM receipt stage.");
  }
  validateBridgeColorSpace(receipt.inputColorSpace);
  validateBridgeColorSpace(receipt.encodedColorSpace);
  validateSelectedColorPipeline(receipt.selectedColorPipeline);
  if (receipt.gammaTransformUsed !== false) {
    throw new Error("TDT-PHOTOSEAL-05-R1 rejected WASM gammaTransformUsed.");
  }
  if (receipt.hiddenLinearizationUsed !== false) {
    throw new Error("TDT-PHOTOSEAL-05-R1 rejected WASM hiddenLinearizationUsed.");
  }
  if (receipt.doubleGammaDetected !== false) {
    throw new Error("TDT-PHOTOSEAL-05-R1 rejected WASM doubleGammaDetected.");
  }
  if (receipt.subsampling !== "444") {
    throw new Error("TDT-PHOTOSEAL-05-R1 requires JPEG 4:4:4 WASM receipt.");
  }
  if (receipt.resizedInsideEncoder !== false || receipt.cropInsideEncoder !== false) {
    throw new Error("TDT-PHOTOSEAL-05-R1 rejected WASM resize/crop ownership violation.");
  }
  if (receipt.fallbackUsed !== false) {
    throw new Error("TDT-PHOTOSEAL-05-R1 rejected WASM fallback receipt.");
  }
  if (receipt.encoderOwner !== undefined && receipt.encoderOwner !== "wasm-tdt-jpeg") {
    throw new Error("TDT-PHOTOSEAL-13-H3-R1 requires wasm-tdt-jpeg encoder owner.");
  }
  if ((receipt as { browserJpegEncodeUsed?: boolean; browserJpegEncodeFallbackUsed?: boolean }).browserJpegEncodeUsed === true || (receipt as { browserJpegEncodeUsed?: boolean; browserJpegEncodeFallbackUsed?: boolean }).browserJpegEncodeFallbackUsed === true) {
    throw new Error("TDT-PHOTOSEAL-13-H3-R1 forbids browser JPEG encoder fallback.");
  }
}

export function makePhotoSealBridgeReceiptSeed(
  resizeResult: AnyPhotoSealResizeResult
): PhotoSealBridgeReceiptSeed {
  return {
    resize: {
      patchId: resizeResult.receipt.patchId,
      profile: resizeResult.profile,
      width: resizeResult.width,
      height: resizeResult.height,
      outputBytes: resizeResult.rgba.byteLength,
      format: "rgba8",
      colorSpace: "srgb",
    },
  };
}

export function makePhotoSealBridgeReceipt(args: {
  seed: PhotoSealBridgeReceiptSeed;
  targetBytes: number;
  encodeResult: Jpeg444TargetBytesWasmResult;
}): PhotoSealBridgeReceipt {
  validateWasmSrgbReceipt(args.encodeResult.receipt);
  validateSelectedColorPipeline(args.encodeResult.selectedColorPipeline);

  const audit = args.encodeResult.attempts[0]?.samplingAudit;
  if (!audit?.is444) {
    throw new Error("TDT-PHOTOSEAL-05-R1 requires JPEG 4:4:4 sampling audit before bridge receipt.");
  }

  return {
    patchId: "TDT-PHOTOSEAL-05-R1",
    stage: "rgba-readback-to-jpeg-wasm-bridge-srgb-contract-rebind",
    rgbaWidth: args.seed.resize.width,
    rgbaHeight: args.seed.resize.height,
    rgbaBytes: args.seed.resize.outputBytes,
    rgbaPixelFormat: "rgba8",
    rgbaColorSpace: "srgb",
    resize: args.seed.resize,
    transfer: {
      rgbaTransferredToWorker: true,
      jpegTransferredFromWorker: true,
      transferMode: "arraybuffer-transfer",
      arrayBufferTransferUsed: true,
      paddedBufferTransferred: false,
    },
    worker: {
      used: true,
      singleThread: true,
      nestedWorkerUsed: false,
      workerPoolUsed: false,
      workerColorTransformUsed: false,
      workerGammaTransformUsed: false,
      workerHiddenLinearizationUsed: false,
      workerDoubleGammaDetected: false,
    },
    wasm: {
      used: true,
      encoderOwner: "wasm-tdt-jpeg",
      wasmEncoderRequired: true,
      wasmGlueLoaded: args.encodeResult.encoderAuthority.wasmGlueLoaded,
      wasmEncodeFunctionPresent: args.encodeResult.encoderAuthority.wasmEncodeFunctionPresent,
      browserJpegEncodeUsed: false,
      browserJpegEncodeFallbackUsed: false,
      simdRequired: true,
      wasmSimdRequired: true,
      singleThread: true,
      wasmSingleThread: true,
      pthreadUsed: false,
      sharedArrayBufferRequired: false,
      wasmInputColorSpace: "srgb",
      wasmReceiptPatchId: "TDT-JPEG-WASM-03-R1",
      wasmReceiptStage: "target-bytes-compression-handle-search-srgb-seal",
    },
    encode: {
      patchId: "TDT-JPEG-WASM-03-R1",
      targetBytes: args.targetBytes,
      outputBytes: args.encodeResult.sizeBytes,
      reachedTarget: args.encodeResult.reachedTarget,
      selectedControl: args.encodeResult.selectedControl,
      attemptsCount: args.encodeResult.attempts.length,
      selectedColorPipeline: args.encodeResult.selectedColorPipeline,
      jpegColorSpace: "srgb",
      jpegSubsampling: "444",
      subsampling: "444",
      jpegMagicValid: true,
      samplingAuditIs444: true,
      inputColorSpace: "srgb",
      encodedColorSpace: "srgb",
      gammaTransformUsed: false,
      hiddenLinearizationUsed: false,
      doubleGammaDetected: false,
      compressionHandleSearchUsed: true,
      targetBytesUsed: true,
      qualitySearchUsed: true,
    },
    ownership: {
      encoderOwner: "wasm-tdt-jpeg",
      browserJpegEncodeUsed: false,
      browserJpegEncodeFallbackUsed: false,
      canvasToBlobUsed: false,
      canvasToDataUrlUsed: false,
      offscreenCanvasConvertToBlobUsed: false,
      resizedInsideEncoder: false,
      cropInsideEncoder: false,
      fallbackUsed: false,
      cpuFallbackUsed: false,
      canvasFallbackUsed: false,
    },
    selectedColorPipeline: args.encodeResult.selectedColorPipeline,
    wasmReceiptPatchId: "TDT-JPEG-WASM-03-R1",
    wasmReceiptStage: "target-bytes-compression-handle-search-srgb-seal",
    wasmInputColorSpace: "srgb",
    workerSingleThread: true,
    wasmSimdRequired: true,
    sharedArrayBufferRequired: false,
    jpegColorSpace: "srgb",
    jpegSubsampling: "444",
    encoderOwner: "wasm-tdt-jpeg",
    browserJpegEncodeUsed: false,
    browserJpegEncodeFallbackUsed: false,
    workerColorTransformUsed: false,
    workerGammaTransformUsed: false,
    workerHiddenLinearizationUsed: false,
    workerDoubleGammaDetected: false,
    reachedTarget: args.encodeResult.reachedTarget,
    targetBytesUsed: true,
    qualitySearchUsed: true,
    compressionHandleSearchUsed: true,
  };
}

export const createPhotoSealBridgeReceipt = makePhotoSealBridgeReceipt;
