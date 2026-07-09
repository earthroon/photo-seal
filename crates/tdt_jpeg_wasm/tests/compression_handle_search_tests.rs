use tdt_jpeg_wasm::{
    AlphaPolicy, ColorSpace, CompressionEffort, CompressionSearchPlan, CompressionSearchStrategy,
    JpegCompressionControl, JpegSubsampling, SuppliedCompressionHandles,
    TargetBytesEncodeRequest, encode_rgba_to_jpeg_444_target_bytes,
    make_quality_ladder_controls, validate_supplied_handles,
};

fn rgba(width: u32, height: u32) -> Vec<u8> {
    vec![220u8, 210, 200, 255].repeat((width * height) as usize)
}

fn plan(strategy: CompressionSearchStrategy) -> CompressionSearchPlan {
    CompressionSearchPlan {
        strategy,
        min_quality: 40,
        max_quality: 95,
        initial_quality: 75,
        max_attempts: 6,
        effort: CompressionEffort::Balanced,
        progressive_allowed: false,
        optimize_huffman_allowed: true,
        subsampling: JpegSubsampling::YCbCr444,
    }
}

#[test]
fn supplied_handles_are_respected() {
    let handles = SuppliedCompressionHandles {
        handles: vec![
            JpegCompressionControl::explicit_quality(80),
            JpegCompressionControl::explicit_quality(60),
        ],
    };
    let req = TargetBytesEncodeRequest {
        rgba: rgba(16, 16),
        width: 16,
        height: 16,
        target_bytes: 12_288,
        alpha_policy: AlphaPolicy::WhiteComposite,
        input_color_space: ColorSpace::Srgb,
        search_plan: plan(CompressionSearchStrategy::SuppliedHandles),
        supplied_handles: Some(handles),
    };
    let out = encode_rgba_to_jpeg_444_target_bytes(req).expect("supplied handles should encode");
    assert!(!out.attempts.is_empty());
    assert_eq!(out.receipt.search_strategy, CompressionSearchStrategy::SuppliedHandles);
}

#[test]
fn supplied_handles_reject_empty_list() {
    assert!(validate_supplied_handles(&[], 4).is_err());
}

#[test]
fn supplied_handles_reject_too_many_attempts() {
    let handles = vec![JpegCompressionControl::explicit_quality(50); 17];
    assert!(validate_supplied_handles(&handles, 16).is_err());
}

#[test]
fn quality_ladder_generates_expected_controls() {
    let controls = make_quality_ladder_controls(&plan(CompressionSearchStrategy::QualityLadder));
    assert!(!controls.is_empty());
    assert!(controls.len() <= 6);
    assert!(controls.iter().all(|c| c.subsampling == JpegSubsampling::YCbCr444));
}
