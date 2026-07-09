use crate::{
    alpha::AlphaPolicy,
    color::{make_srgb_color_pipeline_seal, ColorPipelineSeal},
    types::{JpegCompressionControl, JpegSubsampling},
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct JpegSamplingAudit {
    pub y_h: u8,
    pub y_v: u8,
    pub cb_h: u8,
    pub cb_v: u8,
    pub cr_h: u8,
    pub cr_v: u8,
    pub is_444: bool,
}

impl JpegSamplingAudit {
    pub const fn ycbcr444() -> Self {
        Self { y_h: 1, y_v: 1, cb_h: 1, cb_v: 1, cr_h: 1, cr_v: 1, is_444: true }
    }

    pub fn to_json_string(&self) -> String {
        format!(
            "{{\"yH\":{},\"yV\":{},\"cbH\":{},\"cbV\":{},\"crH\":{},\"crV\":{},\"is444\":{}}}",
            self.y_h, self.y_v, self.cb_h, self.cb_v, self.cr_h, self.cr_v, self.is_444
        )
    }
}

#[derive(Debug, Clone)]
pub struct EncodeReceipt {
    pub patch_id: &'static str,
    pub stage: &'static str,
    pub input_width: u32,
    pub input_height: u32,
    pub input_bytes: usize,
    pub input_format: &'static str,
    pub rgb_bytes: usize,
    pub output_bytes: usize,
    pub alpha_policy: AlphaPolicy,
    pub compression: JpegCompressionControl,
    pub subsampling: JpegSubsampling,
    pub jpeg_magic_valid: bool,
    pub sampling_audit: Option<JpegSamplingAudit>,
    pub color_pipeline: ColorPipelineSeal,
    pub resized_inside_encoder: bool,
    pub crop_inside_encoder: bool,
    pub fallback_used: bool,
    pub target_bytes_used: bool,
    pub quality_search_used: bool,
    pub compression_handle_used: bool,
}

impl EncodeReceipt {
    pub fn new_contract(
        input_width: u32,
        input_height: u32,
        input_bytes: usize,
        alpha_policy: AlphaPolicy,
        compression: JpegCompressionControl,
    ) -> Self {
        Self {
            patch_id: "TDT-JPEG-WASM-02-R2",
            stage: "jpeg-444-variable-compression-srgb-input-contract",
            input_width,
            input_height,
            input_bytes,
            input_format: "rgba8",
            rgb_bytes: 0,
            output_bytes: 0,
            alpha_policy,
            compression,
            subsampling: JpegSubsampling::YCbCr444,
            jpeg_magic_valid: false,
            sampling_audit: None,
            color_pipeline: make_srgb_color_pipeline_seal(),
            resized_inside_encoder: false,
            crop_inside_encoder: false,
            fallback_used: false,
            target_bytes_used: false,
            quality_search_used: false,
            compression_handle_used: true,
        }
    }

    pub fn new_encode(
        input_width: u32,
        input_height: u32,
        input_bytes: usize,
        rgb_bytes: usize,
        output_bytes: usize,
        alpha_policy: AlphaPolicy,
        compression: JpegCompressionControl,
        sampling_audit: JpegSamplingAudit,
    ) -> Self {
        Self {
            patch_id: "TDT-JPEG-WASM-02-R2",
            stage: "jpeg-444-variable-compression-srgb-output-seal",
            input_width,
            input_height,
            input_bytes,
            input_format: "rgba8",
            rgb_bytes,
            output_bytes,
            alpha_policy,
            compression,
            subsampling: JpegSubsampling::YCbCr444,
            jpeg_magic_valid: true,
            sampling_audit: Some(sampling_audit),
            color_pipeline: make_srgb_color_pipeline_seal(),
            resized_inside_encoder: false,
            crop_inside_encoder: false,
            fallback_used: false,
            target_bytes_used: false,
            quality_search_used: false,
            compression_handle_used: true,
        }
    }

    pub fn compression_json(&self) -> String {
        let hint = match self.compression.compression_ratio_hint {
            Some(v) => v.to_string(),
            None => "null".to_string(),
        };
        format!(
            "{{\"mode\":\"{}\",\"quality\":{},\"compressionRatioHint\":{},\"effort\":\"{}\",\"progressive\":{},\"optimizeHuffman\":{},\"subsampling\":\"{}\"}}",
            self.compression.mode.as_str(),
            self.compression.quality,
            hint,
            self.compression.effort.as_str(),
            self.compression.progressive,
            self.compression.optimize_huffman,
            self.compression.subsampling.as_str(),
        )
    }

    pub fn to_json_string(&self) -> String {
        let audit = match &self.sampling_audit { Some(a) => a.to_json_string(), None => "null".to_string() };
        format!(
            "{{\"patchId\":\"{}\",\"stage\":\"{}\",\"inputWidth\":{},\"inputHeight\":{},\"inputBytes\":{},\"inputFormat\":\"{}\",\"input_color_space\":\"{}\",\"rgb_color_space\":\"{}\",\"encoded_color_space\":\"{}\",\"rgbBytes\":{},\"outputBytes\":{},\"alphaPolicy\":\"{}\",\"compression\":{},\"subsampling\":\"{}\",\"jpegMagicValid\":{},\"samplingAudit\":{},\"colorPipeline\":{},\"gamma_transform_used\":{},\"hidden_linearization_used\":{},\"double_gamma_detected\":{},\"resizedInsideEncoder\":{},\"cropInsideEncoder\":{},\"fallbackUsed\":{},\"targetBytesUsed\":{},\"qualitySearchUsed\":{},\"compressionHandleUsed\":{}}}",
            self.patch_id,
            self.stage,
            self.input_width,
            self.input_height,
            self.input_bytes,
            self.input_format,
            self.color_pipeline.input_color_space.as_str(),
            self.color_pipeline.rgb_color_space.as_str(),
            self.color_pipeline.encoded_color_space.as_str(),
            self.rgb_bytes,
            self.output_bytes,
            self.alpha_policy.as_str(),
            self.compression_json(),
            self.subsampling.as_str(),
            self.jpeg_magic_valid,
            audit,
            self.color_pipeline.to_json_string(),
            self.color_pipeline.gamma_transform_used,
            self.color_pipeline.hidden_linearization_used,
            self.color_pipeline.double_gamma_detected,
            self.resized_inside_encoder,
            self.crop_inside_encoder,
            self.fallback_used,
            self.target_bytes_used,
            self.quality_search_used,
            self.compression_handle_used,
        )
    }
}
