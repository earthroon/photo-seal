/* tslint:disable */
/* eslint-disable */

export function encode_rgba_to_jpeg_444_target_bytes_wasm(rgba: Uint8Array, width: number, height: number, target_bytes: number, alpha_policy: string, search_plan_json: string, input_color_space: string): any;

export function encode_rgba_to_jpeg_444_with_control_wasm(rgba: Uint8Array, width: number, height: number, alpha_policy: string, quality: number, effort: string, progressive: boolean, optimize_huffman: boolean, compression_ratio_hint: number, input_color_space: string): Uint8Array;

export function encode_rgba_to_jpeg_444_with_receipt_wasm(rgba: Uint8Array, width: number, height: number, alpha_policy: string, quality: number, effort: string, progressive: boolean, optimize_huffman: boolean, compression_ratio_hint: number, input_color_space: string): string;

export function tdt_jpeg_wasm_patch_id(): string;

export function validate_rgba_contract_wasm(rgba: Uint8Array, width: number, height: number, quality: number): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly encode_rgba_to_jpeg_444_target_bytes_wasm: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => [number, number, number];
    readonly encode_rgba_to_jpeg_444_with_control_wasm: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number) => [number, number, number, number];
    readonly encode_rgba_to_jpeg_444_with_receipt_wasm: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number) => [number, number, number, number];
    readonly tdt_jpeg_wasm_patch_id: () => [number, number];
    readonly validate_rgba_contract_wasm: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
