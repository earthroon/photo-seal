use crate::{
    color::{make_srgb_color_pipeline_seal, ColorPipelineSeal, ColorSpace},
    receipt::JpegSamplingAudit,
    search_plan::CompressionSearchStrategy,
    types::{JpegCompressionControl, JpegSubsampling},
};

#[derive(Debug, Clone)]
pub struct CompressionSearchAttempt {
    pub index: u8,
    pub control: JpegCompressionControl,
    pub size_bytes: usize,
    pub jpeg_magic_valid: bool,
    pub sampling_audit: JpegSamplingAudit,
    pub color_pipeline: ColorPipelineSeal,
    pub reached_target: bool,
}

impl CompressionSearchAttempt {
    pub fn to_json_string(&self) -> String {
        format!(
            "{{\"index\":{},\"control\":{},\"sizeBytes\":{},\"jpegMagicValid\":{},\"samplingAudit\":{},\"colorPipeline\":{},\"input_color_space\":\"{}\",\"encoded_color_space\":\"{}\",\"gamma_transform_used\":{},\"hidden_linearization_used\":{},\"double_gamma_detected\":{},\"reachedTarget\":{}}}",
            self.index,
            compression_control_json(&self.control),
            self.size_bytes,
            self.jpeg_magic_valid,
            self.sampling_audit.to_json_string(),
            self.color_pipeline.to_json_string(),
            self.color_pipeline.input_color_space.as_str(),
            self.color_pipeline.encoded_color_space.as_str(),
            self.color_pipeline.gamma_transform_used,
            self.color_pipeline.hidden_linearization_used,
            self.color_pipeline.double_gamma_detected,
            self.reached_target,
        )
    }
}

#[derive(Debug, Clone)]
pub struct TargetBytesEncodeReceipt {
    pub patch_id: &'static str,
    pub stage: &'static str,
    pub input_width: u32,
    pub input_height: u32,
    pub input_bytes: usize,
    pub input_format: &'static str,
    pub input_color_space: ColorSpace,
    pub target_bytes: usize,
    pub output_bytes: usize,
    pub reached_target: bool,
    pub selected_control: JpegCompressionControl,
    pub selected_color_pipeline: ColorPipelineSeal,
    pub attempts_count: usize,
    pub attempts: Vec<CompressionSearchAttempt>,
    pub search_strategy: CompressionSearchStrategy,
    pub compression_handle_search_used: bool,
    pub subsampling: JpegSubsampling,
    pub sampling_audit: JpegSamplingAudit,
    pub encoded_color_space: ColorSpace,
    pub gamma_transform_used: bool,
    pub hidden_linearization_used: bool,
    pub double_gamma_detected: bool,
    pub resized_inside_encoder: bool,
    pub crop_inside_encoder: bool,
    pub fallback_used: bool,
    pub target_bytes_used: bool,
    pub quality_search_used: bool,
}

impl TargetBytesEncodeReceipt {
    pub fn new(
        input_width: u32,
        input_height: u32,
        input_bytes: usize,
        input_color_space: ColorSpace,
        target_bytes: usize,
        output_bytes: usize,
        reached_target: bool,
        selected_control: JpegCompressionControl,
        selected_color_pipeline: ColorPipelineSeal,
        attempts: Vec<CompressionSearchAttempt>,
        search_strategy: CompressionSearchStrategy,
        sampling_audit: JpegSamplingAudit,
    ) -> Self {
        let attempts_count = attempts.len();
        let color_pipeline = make_srgb_color_pipeline_seal();
        Self {
            patch_id: "TDT-JPEG-WASM-03-R1",
            stage: "target-bytes-compression-handle-search-srgb-seal",
            input_width,
            input_height,
            input_bytes,
            input_format: "rgba8",
            input_color_space,
            target_bytes,
            output_bytes,
            reached_target,
            selected_control,
            selected_color_pipeline,
            attempts_count,
            attempts,
            search_strategy,
            compression_handle_search_used: true,
            subsampling: JpegSubsampling::YCbCr444,
            sampling_audit,
            encoded_color_space: color_pipeline.encoded_color_space,
            gamma_transform_used: false,
            hidden_linearization_used: false,
            double_gamma_detected: false,
            resized_inside_encoder: false,
            crop_inside_encoder: false,
            fallback_used: false,
            target_bytes_used: true,
            quality_search_used: true,
        }
    }

    pub fn to_json_string(&self) -> String {
        let attempts = self
            .attempts
            .iter()
            .map(CompressionSearchAttempt::to_json_string)
            .collect::<Vec<_>>()
            .join(",");
        format!(
            "{{\"patchId\":\"{}\",\"stage\":\"{}\",\"inputWidth\":{},\"inputHeight\":{},\"inputBytes\":{},\"inputFormat\":\"{}\",\"input_color_space\":\"{}\",\"targetBytes\":{},\"outputBytes\":{},\"reachedTarget\":{},\"selectedControl\":{},\"selectedColorPipeline\":{},\"selected_color_pipeline\":{},\"attemptsCount\":{},\"attempts\":[{}],\"searchStrategy\":\"{}\",\"compressionHandleSearchUsed\":{},\"compression_handle_search_used\":{},\"subsampling\":\"{}\",\"samplingAudit\":{},\"encoded_color_space\":\"{}\",\"gamma_transform_used\":{},\"hidden_linearization_used\":{},\"double_gamma_detected\":{},\"resized_inside_encoder\":{},\"crop_inside_encoder\":{},\"fallback_used\":{},\"target_bytes_used\":{},\"quality_search_used\":{}}}",
            self.patch_id,
            self.stage,
            self.input_width,
            self.input_height,
            self.input_bytes,
            self.input_format,
            self.input_color_space.as_str(),
            self.target_bytes,
            self.output_bytes,
            self.reached_target,
            compression_control_json(&self.selected_control),
            self.selected_color_pipeline.to_json_string(),
            self.selected_color_pipeline.to_json_string(),
            self.attempts_count,
            attempts,
            self.search_strategy.as_str(),
            self.compression_handle_search_used,
            self.compression_handle_search_used,
            self.subsampling.as_str(),
            self.sampling_audit.to_json_string(),
            self.encoded_color_space.as_str(),
            self.gamma_transform_used,
            self.hidden_linearization_used,
            self.double_gamma_detected,
            self.resized_inside_encoder,
            self.crop_inside_encoder,
            self.fallback_used,
            self.target_bytes_used,
            self.quality_search_used,
        )
    }
}

pub fn compression_control_json(control: &JpegCompressionControl) -> String {
    let hint = match control.compression_ratio_hint {
        Some(value) => value.to_string(),
        None => "null".to_string(),
    };
    format!(
        "{{\"mode\":\"{}\",\"quality\":{},\"compressionRatioHint\":{},\"effort\":\"{}\",\"progressive\":{},\"optimizeHuffman\":{},\"subsampling\":\"{}\"}}",
        control.mode.as_str(),
        control.quality,
        hint,
        control.effort.as_str(),
        control.progressive,
        control.optimize_huffman,
        control.subsampling.as_str(),
    )
}
