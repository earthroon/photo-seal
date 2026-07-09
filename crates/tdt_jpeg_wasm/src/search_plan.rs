use crate::{
    error::TdtJpegWasmError,
    types::{CompressionEffort, CompressionMode, JpegCompressionControl, JpegSubsampling},
    validate::{validate_compression_control, validate_quality, validate_subsampling},
};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CompressionSearchStrategy {
    QualityBinary,
    QualityLadder,
    SuppliedHandles,
}

impl CompressionSearchStrategy {
    pub const fn as_str(self) -> &'static str {
        match self {
            CompressionSearchStrategy::QualityBinary => "QualityBinary",
            CompressionSearchStrategy::QualityLadder => "QualityLadder",
            CompressionSearchStrategy::SuppliedHandles => "SuppliedHandles",
        }
    }
}

#[derive(Debug, Clone)]
pub struct CompressionSearchPlan {
    pub strategy: CompressionSearchStrategy,
    pub min_quality: u8,
    pub max_quality: u8,
    pub initial_quality: u8,
    pub max_attempts: u8,
    pub effort: CompressionEffort,
    pub progressive_allowed: bool,
    pub optimize_huffman_allowed: bool,
    pub subsampling: JpegSubsampling,
}

impl CompressionSearchPlan {
    pub const fn quality_binary(min_quality: u8, max_quality: u8, initial_quality: u8, max_attempts: u8) -> Self {
        Self {
            strategy: CompressionSearchStrategy::QualityBinary,
            min_quality,
            max_quality,
            initial_quality,
            max_attempts,
            effort: CompressionEffort::Balanced,
            progressive_allowed: false,
            optimize_huffman_allowed: true,
            subsampling: JpegSubsampling::YCbCr444,
        }
    }
}

#[derive(Debug, Clone)]
pub struct SuppliedCompressionHandles {
    pub handles: Vec<JpegCompressionControl>,
}

pub fn validate_search_plan(plan: &CompressionSearchPlan) -> Result<(), TdtJpegWasmError> {
    validate_quality(plan.min_quality)?;
    validate_quality(plan.max_quality)?;
    validate_quality(plan.initial_quality)?;
    validate_subsampling(plan.subsampling)?;
    if plan.min_quality > plan.max_quality {
        return Err(TdtJpegWasmError::InvalidSearchPlan);
    }
    if plan.initial_quality < plan.min_quality || plan.initial_quality > plan.max_quality {
        return Err(TdtJpegWasmError::InvalidSearchPlan);
    }
    match plan.max_attempts {
        1..=16 => {}
        _ => return Err(TdtJpegWasmError::TooManyCompressionAttempts),
    }
    if plan.progressive_allowed {
        return Err(TdtJpegWasmError::UnsupportedProgressive);
    }
    Ok(())
}

pub fn validate_supplied_handles(
    handles: &[JpegCompressionControl],
    max_attempts: u8,
) -> Result<(), TdtJpegWasmError> {
    if handles.is_empty() {
        return Err(TdtJpegWasmError::EmptyCompressionHandleList);
    }
    if handles.len() > max_attempts as usize || handles.len() > 16 {
        return Err(TdtJpegWasmError::TooManyCompressionAttempts);
    }
    for handle in handles {
        validate_compression_control(handle)?;
        validate_subsampling(handle.subsampling)?;
    }
    Ok(())
}

pub fn make_quality_binary_control(
    quality: u8,
    plan: &CompressionSearchPlan,
) -> JpegCompressionControl {
    JpegCompressionControl {
        mode: CompressionMode::ExplicitQuality,
        quality,
        compression_ratio_hint: None,
        effort: plan.effort,
        progressive: false,
        optimize_huffman: plan.optimize_huffman_allowed,
        subsampling: JpegSubsampling::YCbCr444,
    }
}

pub fn make_quality_ladder_controls(plan: &CompressionSearchPlan) -> Vec<JpegCompressionControl> {
    let ladder = [96u8, 92, 88, 84, 80, 76, 72, 68, 64, 60, 56, 52, 48, 44, 40, 36];
    let mut controls = Vec::new();
    for quality in ladder {
        if controls.len() >= plan.max_attempts as usize {
            break;
        }
        if quality >= plan.min_quality && quality <= plan.max_quality {
            controls.push(make_quality_binary_control(quality, plan));
        }
    }
    if controls.is_empty() {
        controls.push(make_quality_binary_control(plan.initial_quality, plan));
    }
    controls
}
