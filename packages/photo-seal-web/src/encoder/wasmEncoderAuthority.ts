export type PhotoSealJpegEncoderOwner = "wasm-tdt-jpeg";

export type PhotoSealJpegEncoderAuthoritySeal = {
  patchId: "TDT-PHOTOSEAL-13-H3-R2";
  stage: "wasm-encoder-authority-no-browser-jpeg-fallback-no-module-namespace-mutation";
  encoderOwner: PhotoSealJpegEncoderOwner;
  wasmEncoderRequired: true;
  wasmGlueLoaded: boolean;
  wasmEncodeFunctionPresent: boolean;
  wasmEncodeFunctionName: "encode_rgba_to_jpeg_444_target_bytes_wasm";
  browserJpegEncodeUsed: false;
  browserJpegEncodeFallbackUsed: false;
  canvasToBlobUsed: false;
  canvasToDataUrlUsed: false;
  offscreenCanvasConvertToBlobUsed: false;
  blobUsedOnlyForWasmBytesDownload: true;
  moduleNamespaceMutationUsed: false;
  jpegSubsampling: "444";
  inputColorSpace: "srgb";
  outputColorSpace: "srgb";
};

export type PhotoSealWasmEncoderAuthorityProbe = {
  encoderAuthority: PhotoSealJpegEncoderAuthoritySeal;
};

export function makePhotoSealWasmEncoderAuthoritySeal(args: {
  wasmGlueLoaded: boolean;
  wasmEncodeFunctionPresent: boolean;
}): PhotoSealJpegEncoderAuthoritySeal {
  return {
    patchId: "TDT-PHOTOSEAL-13-H3-R2",
    stage: "wasm-encoder-authority-no-browser-jpeg-fallback-no-module-namespace-mutation",
    encoderOwner: "wasm-tdt-jpeg",
    wasmEncoderRequired: true,
    wasmGlueLoaded: args.wasmGlueLoaded,
    wasmEncodeFunctionPresent: args.wasmEncodeFunctionPresent,
    wasmEncodeFunctionName: "encode_rgba_to_jpeg_444_target_bytes_wasm",
    browserJpegEncodeUsed: false,
    browserJpegEncodeFallbackUsed: false,
    canvasToBlobUsed: false,
    canvasToDataUrlUsed: false,
    offscreenCanvasConvertToBlobUsed: false,
    blobUsedOnlyForWasmBytesDownload: true,
    moduleNamespaceMutationUsed: false,
    jpegSubsampling: "444",
    inputColorSpace: "srgb",
    outputColorSpace: "srgb",
  };
}

export function assertPhotoSealWasmEncoderAuthority(
  seal: PhotoSealJpegEncoderAuthoritySeal
): void {
  if (seal.encoderOwner !== "wasm-tdt-jpeg") {
    throw new Error("ENCODER_AUTHORITY_VIOLATION: JPEG encoder owner must be wasm-tdt-jpeg.");
  }
  if (seal.wasmEncoderRequired !== true || seal.wasmGlueLoaded !== true || seal.wasmEncodeFunctionPresent !== true) {
    throw new Error("WASM_ENCODER_REQUIRED: TDT JPEG WASM glue and targetBytes encoder must be present.");
  }
  if (seal.moduleNamespaceMutationUsed !== false) {
    throw new Error("WASM_BINDINGS_MUTATION_FORBIDDEN: imported module namespace must not be mutated.");
  }
  if (
    seal.browserJpegEncodeUsed ||
    seal.browserJpegEncodeFallbackUsed ||
    seal.canvasToBlobUsed ||
    seal.canvasToDataUrlUsed ||
    seal.offscreenCanvasConvertToBlobUsed
  ) {
    throw new Error("BROWSER_JPEG_FALLBACK_FORBIDDEN: browser JPEG encode path is not allowed.");
  }
  if (seal.jpegSubsampling !== "444" || seal.inputColorSpace !== "srgb" || seal.outputColorSpace !== "srgb") {
    throw new Error("WASM_ENCODER_AUTHORITY_RECEIPT_MISMATCH: expected JPEG 4:4:4 sRGB authority seal.");
  }
}

export const TDT_PHOTOSEAL_13_H3_R2_WASM_ENCODER_AUTHORITY_SEAL =
  "Assembly JPEG 4:4:4 Only Seal: encoderOwner=wasm-tdt-jpeg, browserJpegEncodeUsed=false, browserJpegEncodeFallbackUsed=false, moduleNamespaceMutationUsed=false.";
