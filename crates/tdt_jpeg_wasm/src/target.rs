use crate::{
    alpha::AlphaPolicy,
    color::{ColorPipelineSeal, ColorSpace},
    search_plan::{CompressionSearchPlan, SuppliedCompressionHandles},
    search_receipt::TargetBytesEncodeReceipt,
    types::JpegCompressionControl,
};

#[derive(Debug, Clone)]
pub struct TargetBytesEncodeRequest {
    pub rgba: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub target_bytes: usize,
    pub alpha_policy: AlphaPolicy,
    pub search_plan: CompressionSearchPlan,
    pub supplied_handles: Option<SuppliedCompressionHandles>,
    pub input_color_space: ColorSpace,
}

#[derive(Debug, Clone)]
pub struct TargetBytesEncodeResult {
    pub jpg: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub size_bytes: usize,
    pub reached_target: bool,
    pub selected_control: JpegCompressionControl,
    pub selected_color_pipeline: ColorPipelineSeal,
    pub attempts: Vec<crate::search_receipt::CompressionSearchAttempt>,
    pub receipt: TargetBytesEncodeReceipt,
}
