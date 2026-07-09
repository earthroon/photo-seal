use tdt_jpeg_wasm::{
    audit_jpeg_sampling_factors, encode_rgba_to_jpeg_444, AlphaPolicy, CompressionEffort,
    CompressionMode, EncodeInput, JpegCompressionControl, JpegSubsampling, ColorSpace,
};

fn rgba_checker() -> Vec<u8> {
    vec![
        255, 255, 255, 255,
        0, 0, 0, 255,
        255, 0, 0, 255,
        0, 0, 255, 255,
    ]
}

#[test]
fn encode_2x2_rgba_checker_to_jpeg_444_with_control_passes() {
    let compression = JpegCompressionControl {
        mode: CompressionMode::ExplicitQuality,
        quality: 90,
        compression_ratio_hint: None,
        effort: CompressionEffort::Balanced,
        progressive: false,
        optimize_huffman: true,
        subsampling: JpegSubsampling::YCbCr444,
    };
    let output = encode_rgba_to_jpeg_444(EncodeInput {
        rgba: rgba_checker(),
        width: 2,
        height: 2,
        alpha_policy: AlphaPolicy::WhiteComposite,
        compression,
        input_color_space: ColorSpace::Srgb,
    }).expect("jpeg encode should pass");
    assert!(output.jpg.starts_with(&[0xFF, 0xD8]));
    assert!(output.jpg.ends_with(&[0xFF, 0xD9]));
    let audit = audit_jpeg_sampling_factors(&output.jpg).expect("sampling audit should pass");
    assert!(audit.is_444);
    assert_eq!(output.receipt.patch_id, "TDT-JPEG-WASM-02-R2");
    assert!(output.receipt.compression_handle_used);
    assert!(!output.receipt.target_bytes_used);
    assert!(!output.receipt.quality_search_used);
    assert!(!output.receipt.resized_inside_encoder);
    assert!(!output.receipt.crop_inside_encoder);
    assert!(!output.receipt.fallback_used);
}

#[test]
fn compression_ratio_hint_contract_is_accepted_without_target_search() {
    let compression = JpegCompressionControl {
        mode: CompressionMode::CompressionRatioHint,
        quality: 82,
        compression_ratio_hint: Some(0.35),
        effort: CompressionEffort::Max,
        progressive: false,
        optimize_huffman: true,
        subsampling: JpegSubsampling::YCbCr444,
    };
    let output = encode_rgba_to_jpeg_444(EncodeInput {
        rgba: rgba_checker(),
        width: 2,
        height: 2,
        alpha_policy: AlphaPolicy::Discard,
        compression,
        input_color_space: ColorSpace::Srgb,
    }).expect("jpeg encode should pass");
    assert_eq!(output.receipt.compression.mode, CompressionMode::CompressionRatioHint);
    assert!(output.receipt.compression_handle_used);
    assert!(!output.receipt.target_bytes_used);
}
