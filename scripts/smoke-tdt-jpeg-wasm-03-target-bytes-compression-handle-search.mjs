import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "crates/tdt_jpeg_wasm/src/target.rs",
  "crates/tdt_jpeg_wasm/src/search.rs",
  "crates/tdt_jpeg_wasm/src/search_plan.rs",
  "crates/tdt_jpeg_wasm/src/search_receipt.rs",
  "crates/tdt_jpeg_wasm/tests/target_bytes_search_tests.rs",
  "crates/tdt_jpeg_wasm/tests/compression_handle_search_tests.rs",
];

const requiredTokens = [
  "TDT-JPEG-WASM-03",
  "TargetBytesEncodeRequest",
  "CompressionSearchPlan",
  "CompressionSearchStrategy",
  "QualityBinary",
  "QualityLadder",
  "SuppliedHandles",
  "encode_rgba_to_jpeg_444_target_bytes",
  "encode_rgba_to_jpeg_444_target_bytes_wasm",
  "compression_handle_search_used: true",
  "target_bytes_used: true",
  "quality_search_used: true",
  "resized_inside_encoder: false",
  "crop_inside_encoder: false",
  "fallback_used: false",
  "JpegSubsampling::YCbCr444",
];

const forbiddenTokens = [
  "BackendDefault",
  "AutoSubsampling",
  "subsampling fallback",
  "YCbCr_420_raw",
  "pb_encode_perblock",
  "jpeg_write_coefficients",
  "fallback_used: true",
  "resized_inside_encoder: true",
  "crop_inside_encoder: true",
  "empty jpeg on failure",
];

const sourceFiles = requiredFiles.concat([
  "crates/tdt_jpeg_wasm/src/lib.rs",
  "crates/tdt_jpeg_wasm/src/error.rs",
  "crates/tdt_jpeg_wasm/Cargo.toml",
]);

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("FAIL_TDT_JPEG_WASM_03_TARGET_BYTES_COMPRESSION_HANDLE_SEARCH");
  console.error("missing files", missing);
  process.exit(1);
}

const haystack = sourceFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
const missingTokens = requiredTokens.filter((token) => !haystack.includes(token));
const forbiddenHits = forbiddenTokens.filter((token) => haystack.includes(token));

if (missingTokens.length || forbiddenHits.length) {
  console.error("FAIL_TDT_JPEG_WASM_03_TARGET_BYTES_COMPRESSION_HANDLE_SEARCH");
  console.error({ missingTokens, forbiddenHits });
  process.exit(1);
}

console.log("PASS_TDT_JPEG_WASM_03_TARGET_BYTES_COMPRESSION_HANDLE_SEARCH");
