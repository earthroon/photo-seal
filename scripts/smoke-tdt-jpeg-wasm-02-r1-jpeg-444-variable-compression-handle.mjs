import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "crates/tdt_jpeg_wasm/src/types.rs",
  "crates/tdt_jpeg_wasm/src/validate.rs",
  "crates/tdt_jpeg_wasm/src/receipt.rs",
  "crates/tdt_jpeg_wasm/src/audit.rs",
  "crates/tdt_jpeg_wasm/src/jpeg444.rs",
  "crates/tdt_jpeg_wasm/src/encode.rs",
  "crates/tdt_jpeg_wasm/src/lib.rs",
  "crates/tdt_jpeg_wasm/tests/jpeg444_variable_compression_tests.rs",
];

const requiredTokens = [
  "TDT-JPEG-WASM-02-R1",
  "JpegCompressionControl",
  "CompressionMode",
  "CompressionEffort",
  "ExplicitQuality",
  "CompressionRatioHint",
  "YCbCr444",
  "encode_rgb_to_jpeg_444_with_control",
  "encode_rgba_to_jpeg_444_with_control",
  "validate_compression_control",
  "validate_jpeg_magic",
  "audit_jpeg_sampling_factors",
  "compression_handle_used: true",
  "target_bytes_used: false",
  "quality_search_used: false",
  "resized_inside_encoder: false",
  "crop_inside_encoder: false",
  "fallback_used: false",
];

const forbiddenTokens = [
  "YCbCr420",
  "YCbCr422",
  "AutoSubsampling",
  "BackendDefault",
  "fallback_used: true",
  "target_bytes_used: true",
  "quality_search_used: true",
  "resized_inside_encoder: true",
  "crop_inside_encoder: true",
  "pb_encode_perblock",
  "YCbCr_420_raw",
  "jpeg_write_coefficients",
];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`FAIL_TDT_JPEG_WASM_02_R1_JPEG_444_VARIABLE_COMPRESSION_HANDLE missing ${file}`);
    process.exit(1);
  }
}
const corpus = required.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
for (const token of requiredTokens) {
  if (!corpus.includes(token)) {
    console.error(`FAIL_TDT_JPEG_WASM_02_R1_JPEG_444_VARIABLE_COMPRESSION_HANDLE missing token ${token}`);
    process.exit(1);
  }
}
for (const token of forbiddenTokens) {
  if (corpus.includes(token)) {
    console.error(`FAIL_TDT_JPEG_WASM_02_R1_JPEG_444_VARIABLE_COMPRESSION_HANDLE forbidden token ${token}`);
    process.exit(1);
  }
}
console.log("PASS_TDT_JPEG_WASM_02_R1_JPEG_444_VARIABLE_COMPRESSION_HANDLE");
