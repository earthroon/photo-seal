use tdt_jpeg_wasm::{
    rgba_to_rgb, validate_encode_input, validate_quality, AlphaPolicy, CompressionEffort,
    CompressionMode, EncodeInput, JpegCompressionControl, JpegSubsampling, ColorSpace, TdtJpegWasmError,
};

fn compression(quality: u8) -> JpegCompressionControl {
    JpegCompressionControl {
        mode: CompressionMode::ExplicitQuality,
        quality,
        compression_ratio_hint: None,
        effort: CompressionEffort::Balanced,
        progressive: false,
        optimize_huffman: true,
        subsampling: JpegSubsampling::YCbCr444,
    }
}

fn input(rgba: Vec<u8>, width: u32, height: u32, quality: u8) -> EncodeInput {
    EncodeInput {
        rgba,
        width,
        height,
        alpha_policy: AlphaPolicy::WhiteComposite,
        compression: compression(quality),
        input_color_space: ColorSpace::Srgb,
    }
}

#[test]
fn valid_rgba_contract_passes() {
    let item = input(vec![10, 20, 30, 255], 1, 1, 90);
    let receipt = validate_encode_input(&item).expect("valid rgba contract should pass");
    assert_eq!(receipt.patch_id, "TDT-JPEG-WASM-02-R2");
    assert_eq!(receipt.stage, "jpeg-444-variable-compression-srgb-input-contract");
    assert!(receipt.compression_handle_used);
}

#[test]
fn zero_width_fails() {
    let err = validate_encode_input(&input(vec![], 0, 1, 90)).unwrap_err();
    assert!(matches!(err, TdtJpegWasmError::InvalidDimension { .. }));
}

#[test]
fn zero_height_fails() {
    let err = validate_encode_input(&input(vec![], 1, 0, 90)).unwrap_err();
    assert!(matches!(err, TdtJpegWasmError::InvalidDimension { .. }));
}

#[test]
fn rgba_length_mismatch_fails() {
    let err = validate_encode_input(&input(vec![1, 2, 3], 1, 1, 90)).unwrap_err();
    assert!(matches!(err, TdtJpegWasmError::RgbaLengthMismatch { .. }));
}

#[test]
fn quality_zero_fails() {
    let err = validate_quality(0).unwrap_err();
    assert_eq!(err, TdtJpegWasmError::InvalidQuality { quality: 0 });
}

#[test]
fn quality_100_passes() {
    validate_quality(100).expect("quality 100 should pass");
}

#[test]
fn white_composite_alpha_0_returns_white() {
    let rgb = rgba_to_rgb(&[10, 20, 30, 0], 1, 1, AlphaPolicy::WhiteComposite).unwrap();
    assert_eq!(rgb, vec![255, 255, 255]);
}

#[test]
fn white_composite_alpha_255_returns_source_rgb() {
    let rgb = rgba_to_rgb(&[10, 20, 30, 255], 1, 1, AlphaPolicy::WhiteComposite).unwrap();
    assert_eq!(rgb, vec![10, 20, 30]);
}

#[test]
fn discard_alpha_returns_source_rgb() {
    let rgb = rgba_to_rgb(&[10, 20, 30, 0], 1, 1, AlphaPolicy::Discard).unwrap();
    assert_eq!(rgb, vec![10, 20, 30]);
}

#[test]
fn receipt_seals_no_resize_no_crop_no_fallback() {
    let item = input(vec![10, 20, 30, 255], 1, 1, 90);
    let receipt = validate_encode_input(&item).unwrap();
    assert!(!receipt.resized_inside_encoder);
    assert!(!receipt.crop_inside_encoder);
    assert!(!receipt.fallback_used);
    assert!(!receipt.target_bytes_used);
    assert!(!receipt.quality_search_used);
}
