use tdt_jpeg_wasm::{
    make_srgb_color_pipeline_seal, rgba_to_rgb, validate_encode_input, AlphaPolicy,
    ColorSpace, CompressionEffort, CompressionMode, EncodeInput, JpegCompressionControl,
    JpegSubsampling,
};

fn compression() -> JpegCompressionControl {
    JpegCompressionControl {
        mode: CompressionMode::ExplicitQuality,
        quality: 90,
        compression_ratio_hint: None,
        effort: CompressionEffort::Balanced,
        progressive: false,
        optimize_huffman: true,
        subsampling: JpegSubsampling::YCbCr444,
    }
}

#[test]
fn encode_input_requires_srgb() {
    let item = EncodeInput {
        rgba: vec![10, 20, 30, 255],
        width: 1,
        height: 1,
        alpha_policy: AlphaPolicy::WhiteComposite,
        compression: compression(),
        input_color_space: ColorSpace::Srgb,
    };
    let receipt = validate_encode_input(&item).expect("sRGB input should pass");
    assert_eq!(receipt.patch_id, "TDT-JPEG-WASM-02-R2");
    assert_eq!(receipt.color_pipeline.input_color_space, ColorSpace::Srgb);
    assert_eq!(receipt.color_pipeline.encoded_color_space, ColorSpace::Srgb);
}

#[test]
fn rgba_to_rgb_preserves_srgb_contract() {
    let rgb = rgba_to_rgb(&[10, 20, 30, 255], 1, 1, AlphaPolicy::Discard).unwrap();
    assert_eq!(rgb, vec![10, 20, 30]);
}

#[test]
fn color_pipeline_seal_reports_srgb_to_srgb() {
    let seal = make_srgb_color_pipeline_seal();
    assert_eq!(seal.input_color_space, ColorSpace::Srgb);
    assert_eq!(seal.rgb_color_space, ColorSpace::Srgb);
    assert_eq!(seal.encoded_color_space, ColorSpace::Srgb);
}

#[test]
fn color_pipeline_seal_reports_no_gamma_or_hidden_transform() {
    let seal = make_srgb_color_pipeline_seal();
    assert!(!seal.gamma_transform_used);
    assert!(!seal.hidden_linearization_used);
    assert!(!seal.double_gamma_detected);
}
