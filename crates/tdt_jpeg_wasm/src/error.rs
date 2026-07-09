use core::fmt;

#[derive(Debug, Clone, PartialEq)]
pub enum TdtJpegWasmError {
    InvalidDimension { width: u32, height: u32 },
    RgbaLengthMismatch { expected: usize, actual: usize },
    InvalidQuality { quality: u8 },
    InvalidSubsampling,
    InvalidColorSpace,
    ColorPipelineSealMismatch,
    InvalidCompressionRatioHint,
    UnsupportedProgressive,
    UnsupportedOptimizeHuffman,
    RgbaByteCountOverflow,
    RgbByteCountOverflow,
    RgbLengthMismatch { expected: usize, actual: usize },
    JpegEncodeFailed { reason: String },
    JpegMagicInvalid,
    JpegSamplingAuditFailed,
    InvalidTargetBytes,
    InvalidSearchPlan,
    EmptyCompressionHandleList,
    TooManyCompressionAttempts,
    NoEncodeAttemptProduced,
    EncodeNotImplemented,
}

impl fmt::Display for TdtJpegWasmError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TdtJpegWasmError::InvalidDimension { width, height } => {
                write!(f, "invalid dimensions: {}x{}", width, height)
            }
            TdtJpegWasmError::RgbaLengthMismatch { expected, actual } => {
                write!(f, "rgba length mismatch: expected {}, got {}", expected, actual)
            }
            TdtJpegWasmError::InvalidQuality { quality } => {
                write!(f, "invalid quality: {}", quality)
            }
            TdtJpegWasmError::InvalidSubsampling => write!(f, "invalid subsampling: YCbCr444 only"),
            TdtJpegWasmError::InvalidColorSpace => write!(f, "invalid color space: Srgb only"),
            TdtJpegWasmError::ColorPipelineSealMismatch => write!(f, "color pipeline seal mismatch"),
            TdtJpegWasmError::InvalidCompressionRatioHint => write!(f, "invalid compression ratio hint"),
            TdtJpegWasmError::UnsupportedProgressive => write!(f, "progressive JPEG is not supported by TDT-JPEG-WASM-02-R2 backend"),
            TdtJpegWasmError::UnsupportedOptimizeHuffman => write!(f, "optimize huffman is not supported by this backend"),
            TdtJpegWasmError::RgbaByteCountOverflow => write!(f, "rgba byte count overflow"),
            TdtJpegWasmError::RgbByteCountOverflow => write!(f, "rgb byte count overflow"),
            TdtJpegWasmError::RgbLengthMismatch { expected, actual } => {
                write!(f, "rgb length mismatch: expected {}, got {}", expected, actual)
            }
            TdtJpegWasmError::JpegEncodeFailed { reason } => write!(f, "jpeg encode failed: {}", reason),
            TdtJpegWasmError::JpegMagicInvalid => write!(f, "jpeg magic marker invalid"),
            TdtJpegWasmError::JpegSamplingAuditFailed => write!(f, "jpeg 4:4:4 sampling audit failed"),
            TdtJpegWasmError::InvalidTargetBytes => write!(f, "invalid target bytes"),
            TdtJpegWasmError::InvalidSearchPlan => write!(f, "invalid compression search plan"),
            TdtJpegWasmError::EmptyCompressionHandleList => write!(f, "empty compression handle list"),
            TdtJpegWasmError::TooManyCompressionAttempts => write!(f, "too many compression attempts"),
            TdtJpegWasmError::NoEncodeAttemptProduced => write!(f, "no encode attempt produced"),
            TdtJpegWasmError::EncodeNotImplemented => write!(f, "jpeg encode not implemented"),
        }
    }
}

impl std::error::Error for TdtJpegWasmError {}
