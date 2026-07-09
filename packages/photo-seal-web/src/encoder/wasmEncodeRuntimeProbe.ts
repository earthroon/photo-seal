import { getTdtJpegWasmBindings } from "./jpegWasmLoader";
import { assertPhotoSealWasmEncoderAuthority } from "./wasmEncoderAuthority";

export type PhotoSealWasmEncodeInvocationMode =
  | "export-preflight"
  | "actual-export";

export type PhotoSealWasmEncodeInvocationReceipt = {
  patchId: "TDT-PHOTOSEAL-13-H3-R3";
  stage: "wasm-encode-runtime-invocation-preflight-no-silent-non-invocation";
  mode: PhotoSealWasmEncodeInvocationMode;
  encoderOwner: "wasm-tdt-jpeg";
  wasmBindingsRequested: true;
  wasmGlueLoaded: boolean;
  wasmEncodeFunctionPresent: boolean;
  wasmEncodeFunctionCalled: boolean;
  wasmEncodeReturned: boolean;
  wasmJpegBytes: number;
  browserJpegEncodeUsed: false;
  browserJpegEncodeFallbackUsed: false;
  moduleNamespaceMutationUsed: false;
  jpegSubsampling: "444";
  colorSpace: "srgb";
};

const PROBE_SEARCH_PLAN = {
  strategy: "quality-binary",
  minQuality: 70,
  maxQuality: 82,
  initialQuality: 76,
  maxAttempts: 1,
  effort: "fast",
  progressiveAllowed: false,
  optimizeHuffmanAllowed: true,
  subsampling: "444",
} as const;

function makeProbeRgba(): Uint8Array {
  const width = 8;
  const height = 8;
  const rgba = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const value = (x + y) % 2 === 0 ? 232 : 96;
      rgba[offset] = value;
      rgba[offset + 1] = value;
      rgba[offset + 2] = value;
      rgba[offset + 3] = 255;
    }
  }
  return rgba;
}

function extractJpegByteLength(value: unknown): number {
  const result = value as { jpg?: unknown };
  if (!(result.jpg instanceof Uint8Array)) {
    throw new Error("WASM_INVOKE_FAILED: targetBytes encoder did not return jpg Uint8Array.");
  }
  if (result.jpg.byteLength <= 0) {
    throw new Error("WASM_INVOKE_FAILED: targetBytes encoder returned an empty JPEG buffer.");
  }
  return result.jpg.byteLength;
}

export async function runTdtJpegWasmEncodeInvocationProbe(args: {
  mode: PhotoSealWasmEncodeInvocationMode;
}): Promise<PhotoSealWasmEncodeInvocationReceipt> {
  const bindings = await getTdtJpegWasmBindings();
  assertPhotoSealWasmEncoderAuthority(bindings.encoderAuthority);

  const value = bindings.encode_rgba_to_jpeg_444_target_bytes_wasm(
    makeProbeRgba(),
    8,
    8,
    65536,
    "white-composite",
    JSON.stringify(PROBE_SEARCH_PLAN),
    "srgb"
  );
  const wasmJpegBytes = extractJpegByteLength(await value);

  return {
    patchId: "TDT-PHOTOSEAL-13-H3-R3",
    stage: "wasm-encode-runtime-invocation-preflight-no-silent-non-invocation",
    mode: args.mode,
    encoderOwner: "wasm-tdt-jpeg",
    wasmBindingsRequested: true,
    wasmGlueLoaded: bindings.encoderAuthority.wasmGlueLoaded,
    wasmEncodeFunctionPresent: bindings.encoderAuthority.wasmEncodeFunctionPresent,
    wasmEncodeFunctionCalled: true,
    wasmEncodeReturned: true,
    wasmJpegBytes,
    browserJpegEncodeUsed: false,
    browserJpegEncodeFallbackUsed: false,
    moduleNamespaceMutationUsed: bindings.moduleNamespaceMutationUsed,
    jpegSubsampling: "444",
    colorSpace: "srgb",
  };
}

export const TDT_PHOTOSEAL_13_H3_R3_WASM_INVOKE_PROBE_SEAL =
  "WASM encode function must be called explicitly before export proceeds. PASS_TDT_PHOTOSEAL_13_H3_R3_WASM_RUNTIME_INVOKE_TRACE";
