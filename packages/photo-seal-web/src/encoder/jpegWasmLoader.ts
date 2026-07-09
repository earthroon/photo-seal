import { makePhotoSealWasmEncoderAuthoritySeal, type PhotoSealJpegEncoderAuthoritySeal } from "./wasmEncoderAuthority";

export type TdtJpegWasmBindings = {
  encode_rgba_to_jpeg_444_target_bytes_wasm(
    rgba: Uint8Array,
    width: number,
    height: number,
    targetBytes: number,
    alphaPolicy: string,
    searchPlanJson: string,
    inputColorSpace: "srgb"
  ): unknown | Promise<unknown>;
};

type TdtJpegWasmGlueModule = TdtJpegWasmBindings & {
  default?: (moduleOrPath?: unknown) => Promise<unknown>;
};

export type TdtJpegWasmLoadedBindings = TdtJpegWasmBindings & {
  encoderAuthority: PhotoSealJpegEncoderAuthoritySeal;
  readonly moduleNamespaceMutationUsed: false;
};

let boundModule: TdtJpegWasmLoadedBindings | null = null;
let initPromise: Promise<TdtJpegWasmLoadedBindings> | null = null;

function wrapWasmBindings(module: TdtJpegWasmBindings, wasmGlueLoaded: boolean): TdtJpegWasmLoadedBindings {
  const encodeRgbaToJpeg444TargetBytes = module.encode_rgba_to_jpeg_444_target_bytes_wasm;
  const wasmEncodeFunctionPresent = typeof encodeRgbaToJpeg444TargetBytes === "function";
  if (!wasmEncodeFunctionPresent) {
    throw new Error("WASM_INIT_FAILED: bundled tdt_jpeg_wasm glue did not expose targetBytes encoder.");
  }

  return {
    encode_rgba_to_jpeg_444_target_bytes_wasm: (
      rgba: Uint8Array,
      width: number,
      height: number,
      targetBytes: number,
      alphaPolicy: string,
      searchPlanJson: string,
      inputColorSpace: "srgb"
    ) => encodeRgbaToJpeg444TargetBytes(
      rgba,
      width,
      height,
      targetBytes,
      alphaPolicy,
      searchPlanJson,
      inputColorSpace
    ),
    encoderAuthority: makePhotoSealWasmEncoderAuthoritySeal({
      wasmGlueLoaded,
      wasmEncodeFunctionPresent,
    }),
    moduleNamespaceMutationUsed: false,
  };
}

export function bindTdtJpegWasmModuleForPhotoSeal(module: TdtJpegWasmBindings): void {
  boundModule = wrapWasmBindings(module, true);
  initPromise = Promise.resolve(boundModule);
}

async function importBundledTdtJpegWasmModule(): Promise<TdtJpegWasmLoadedBindings> {
  const module = (await import("../wasm/tdt_jpeg_wasm/tdt_jpeg_wasm.js")) as TdtJpegWasmGlueModule;
  if (typeof module.default !== "function") {
    throw new Error("WASM_INIT_FAILED: bundled tdt_jpeg_wasm glue default init is missing.");
  }
  await module.default();
  boundModule = wrapWasmBindings(module, true);
  return boundModule;
}

export async function getTdtJpegWasmBindings(): Promise<TdtJpegWasmLoadedBindings> {
  if (boundModule) return boundModule;
  if (initPromise) return initPromise;

  initPromise = importBundledTdtJpegWasmModule().catch((error) => {
    initPromise = null;
    throw new Error(
      `WASM_INIT_FAILED: TDT JPEG WASM bindings could not be loaded from bundled glue. ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  });
  return initPromise;
}

export const PHOTOSEAL_WASM_EXECUTION_POLICY = {
  patchId: "TDT-PHOTOSEAL-13-H3-R2",
  encoderOwner: "wasm-tdt-jpeg",
  simdRequired: true,
  singleThread: true,
  pthreadUsed: false,
  sharedArrayBufferRequired: false,
  bundledGlueAutoLoaded: true,
  browserJpegEncodeUsed: false,
  browserJpegEncodeFallbackUsed: false,
  moduleNamespaceMutationUsed: false,
} as const;
