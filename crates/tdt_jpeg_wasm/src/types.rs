use crate::{alpha::AlphaPolicy, color::ColorSpace};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum JpegSubsampling {
    YCbCr444,
}

impl JpegSubsampling {
    pub const fn as_str(self) -> &'static str {
        match self {
            JpegSubsampling::YCbCr444 => "YCbCr444",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CompressionMode {
    ExplicitQuality,
    CompressionRatioHint,
}

impl CompressionMode {
    pub const fn as_str(self) -> &'static str {
        match self {
            CompressionMode::ExplicitQuality => "ExplicitQuality",
            CompressionMode::CompressionRatioHint => "CompressionRatioHint",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CompressionEffort {
    Fast,
    Balanced,
    Max,
}

impl CompressionEffort {
    pub const fn as_str(self) -> &'static str {
        match self {
            CompressionEffort::Fast => "fast",
            CompressionEffort::Balanced => "balanced",
            CompressionEffort::Max => "max",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct JpegCompressionControl {
    pub mode: CompressionMode,
    pub quality: u8,
    pub compression_ratio_hint: Option<f32>,
    pub effort: CompressionEffort,
    pub progressive: bool,
    pub optimize_huffman: bool,
    pub subsampling: JpegSubsampling,
}

impl JpegCompressionControl {
    pub const fn explicit_quality(quality: u8) -> Self {
        Self {
            mode: CompressionMode::ExplicitQuality,
            quality,
            compression_ratio_hint: None,
            effort: CompressionEffort::Balanced,
            progressive: false,
            optimize_huffman: true,
            subsampling: JpegSubsampling::YCbCr444,
        }
    }
}

#[derive(Debug, Clone)]
pub struct EncodeInput {
    pub rgba: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub alpha_policy: AlphaPolicy,
    pub compression: JpegCompressionControl,
    pub input_color_space: ColorSpace,
}

#[derive(Debug, Clone)]
pub struct EncodeOutput {
    pub jpg: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub quality: u8,
    pub size_bytes: usize,
    pub receipt: crate::receipt::EncodeReceipt,
}
