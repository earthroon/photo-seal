use tdt_jpeg_wasm::{
    encode_rgba_to_jpeg_444_target_bytes, AlphaPolicy, ColorSpace, CompressionEffort,
    CompressionSearchPlan, CompressionSearchStrategy, JpegSubsampling, TargetBytesEncodeRequest,
};

fn rgba(width: u32, height: u32) -> Vec<u8> {
    vec![128u8, 120, 112, 255].repeat((width * height) as usize)
}

fn plan() -> CompressionSearchPlan {
    CompressionSearchPlan {
        strategy: CompressionSearchStrategy::QualityLadder,
        min_quality: 40,
        max_quality: 92,
        initial_quality: 80,
        max_attempts: 5,
        effort: CompressionEffort::Balanced,
        progressive_allowed: false,
        optimize_huffman_allowed: true,
        subsampling: JpegSubsampling::YCbCr444,
    }
}

fn request(target_bytes: usize) -> TargetBytesEncodeRequest {
    TargetBytesEncodeRequest {
        rgba: rgba(16, 16),
        width: 16,
        height: 16,
        target_bytes,
        alpha_policy: AlphaPolicy::WhiteComposite,
        search_plan: plan(),
        supplied_handles: None,
        input_color_space: ColorSpace::Srgb,
    }
}

#[test]
fn target_search_receipt_records_srgb_input_and_output() {
    let out = encode_rgba_to_jpeg_444_target_bytes(request(16_384)).expect("target search should encode");
    assert_eq!(out.receipt.patch_id, "TDT-JPEG-WASM-03-R1");
    assert_eq!(out.receipt.stage, "target-bytes-compression-handle-search-srgb-seal");
    assert_eq!(out.receipt.input_color_space, ColorSpace::Srgb);
    assert_eq!(out.receipt.encoded_color_space, ColorSpace::Srgb);
    assert_eq!(out.receipt.selected_color_pipeline.encoded_color_space, ColorSpace::Srgb);
}

#[test]
fn every_attempt_records_srgb_color_pipeline() {
    let out = encode_rgba_to_jpeg_444_target_bytes(request(16_384)).expect("target search should encode");
    assert!(!out.attempts.is_empty());
    for attempt in out.attempts {
        assert_eq!(attempt.color_pipeline.input_color_space, ColorSpace::Srgb);
        assert_eq!(attempt.color_pipeline.rgb_color_space, ColorSpace::Srgb);
        assert_eq!(attempt.color_pipeline.encoded_color_space, ColorSpace::Srgb);
        assert!(!attempt.color_pipeline.gamma_transform_used);
        assert!(!attempt.color_pipeline.hidden_linearization_used);
        assert!(!attempt.color_pipeline.double_gamma_detected);
        assert!(attempt.sampling_audit.is_444);
    }
}

#[test]
fn reached_target_false_still_records_srgb_color_pipeline() {
    let out = encode_rgba_to_jpeg_444_target_bytes(request(1)).expect("best effort should encode");
    assert!(!out.reached_target);
    assert_eq!(out.selected_color_pipeline.input_color_space, ColorSpace::Srgb);
    assert_eq!(out.selected_color_pipeline.encoded_color_space, ColorSpace::Srgb);
    assert_eq!(out.receipt.selected_color_pipeline.encoded_color_space, ColorSpace::Srgb);
    assert!(!out.receipt.gamma_transform_used);
    assert!(!out.receipt.hidden_linearization_used);
    assert!(!out.receipt.double_gamma_detected);
}

#[test]
fn no_resize_no_crop_no_fallback_still_sealed() {
    let out = encode_rgba_to_jpeg_444_target_bytes(request(16_384)).expect("target search should encode");
    assert!(!out.receipt.resized_inside_encoder);
    assert!(!out.receipt.crop_inside_encoder);
    assert!(!out.receipt.fallback_used);
    assert!(out.receipt.target_bytes_used);
    assert!(out.receipt.quality_search_used);
    assert!(out.receipt.compression_handle_search_used);
}
