use tdt_jpeg_wasm::{
    AlphaPolicy, ColorSpace, CompressionSearchPlan, CompressionSearchStrategy, CompressionEffort,
    JpegSubsampling, TargetBytesEncodeRequest, encode_rgba_to_jpeg_444_target_bytes,
    validate_target_bytes, validate_search_plan,
};

fn rgba(width: u32, height: u32) -> Vec<u8> {
    let mut out = Vec::new();
    for y in 0..height {
        for x in 0..width {
            out.push((x * 17 % 255) as u8);
            out.push((y * 19 % 255) as u8);
            out.push(((x + y) * 13 % 255) as u8);
            out.push(255);
        }
    }
    out
}

fn plan(strategy: CompressionSearchStrategy) -> CompressionSearchPlan {
    CompressionSearchPlan {
        strategy,
        min_quality: 30,
        max_quality: 90,
        initial_quality: 70,
        max_attempts: 8,
        effort: CompressionEffort::Balanced,
        progressive_allowed: false,
        optimize_huffman_allowed: true,
        subsampling: JpegSubsampling::YCbCr444,
    }
}

#[test]
fn target_bytes_search_records_attempts() {
    let req = TargetBytesEncodeRequest {
        rgba: rgba(16, 16),
        width: 16,
        height: 16,
        target_bytes: 16_384,
        alpha_policy: AlphaPolicy::WhiteComposite,
        input_color_space: ColorSpace::Srgb,
        search_plan: plan(CompressionSearchStrategy::QualityBinary),
        supplied_handles: None,
    };
    let out = encode_rgba_to_jpeg_444_target_bytes(req).expect("target search should encode");
    assert!(!out.jpg.is_empty());
    assert!(!out.attempts.is_empty());
    assert_eq!(out.receipt.patch_id, "TDT-JPEG-WASM-03-R1");
    assert_eq!(out.receipt.input_color_space, ColorSpace::Srgb);
    assert_eq!(out.receipt.encoded_color_space, ColorSpace::Srgb);
    assert_eq!(out.selected_color_pipeline.encoded_color_space, ColorSpace::Srgb);
    assert!(out.attempts.iter().all(|a| a.color_pipeline.encoded_color_space == ColorSpace::Srgb));
    assert!(out.receipt.compression_handle_search_used);
    assert!(out.receipt.target_bytes_used);
    assert!(out.receipt.quality_search_used);
    assert!(!out.receipt.resized_inside_encoder);
    assert!(!out.receipt.crop_inside_encoder);
    assert!(!out.receipt.fallback_used);
}

#[test]
fn target_bytes_search_rejects_zero_target() {
    assert!(validate_target_bytes(0).is_err());
}

#[test]
fn target_bytes_search_rejects_invalid_quality_range() {
    let bad = CompressionSearchPlan {
        min_quality: 90,
        max_quality: 30,
        ..plan(CompressionSearchStrategy::QualityBinary)
    };
    assert!(validate_search_plan(&bad).is_err());
}
