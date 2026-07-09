use crate::{
    error::TdtJpegWasmError,
    receipt::EncodeReceipt,
    types::{EncodeInput, JpegCompressionControl, JpegSubsampling},
    color::ColorSpace,
};

pub fn validate_dimensions(width: u32, height: u32) -> Result<(), TdtJpegWasmError> {
    match (width, height) {
        (0, _) | (_, 0) => Err(TdtJpegWasmError::InvalidDimension { width, height }),
        _ => Ok(()),
    }
}

pub fn expected_rgba_len(width: u32, height: u32) -> Result<usize, TdtJpegWasmError> {
    validate_dimensions(width, height)?;
    let px = (width as u64)
        .checked_mul(height as u64)
        .ok_or(TdtJpegWasmError::RgbaByteCountOverflow)?;
    let bytes = px
        .checked_mul(4)
        .ok_or(TdtJpegWasmError::RgbaByteCountOverflow)?;
    if bytes > usize::MAX as u64 {
        return Err(TdtJpegWasmError::RgbaByteCountOverflow);
    }
    Ok(bytes as usize)
}

pub fn expected_rgb_len(width: u32, height: u32) -> Result<usize, TdtJpegWasmError> {
    validate_dimensions(width, height)?;
    let px = (width as u64)
        .checked_mul(height as u64)
        .ok_or(TdtJpegWasmError::RgbByteCountOverflow)?;
    let bytes = px
        .checked_mul(3)
        .ok_or(TdtJpegWasmError::RgbByteCountOverflow)?;
    if bytes > usize::MAX as u64 {
        return Err(TdtJpegWasmError::RgbByteCountOverflow);
    }
    Ok(bytes as usize)
}

pub fn validate_rgba_len(
    rgba: &[u8],
    width: u32,
    height: u32,
) -> Result<(), TdtJpegWasmError> {
    let expected = expected_rgba_len(width, height)?;
    let actual = rgba.len();
    match actual == expected {
        true => Ok(()),
        false => Err(TdtJpegWasmError::RgbaLengthMismatch { expected, actual }),
    }
}

pub fn validate_rgb_len(
    rgb: &[u8],
    width: u32,
    height: u32,
) -> Result<(), TdtJpegWasmError> {
    let expected = expected_rgb_len(width, height)?;
    let actual = rgb.len();
    match actual == expected {
        true => Ok(()),
        false => Err(TdtJpegWasmError::RgbLengthMismatch { expected, actual }),
    }
}

pub fn validate_quality(quality: u8) -> Result<(), TdtJpegWasmError> {
    match quality {
        1..=100 => Ok(()),
        _ => Err(TdtJpegWasmError::InvalidQuality { quality }),
    }
}

pub fn validate_subsampling(subsampling: JpegSubsampling) -> Result<(), TdtJpegWasmError> {
    match subsampling {
        JpegSubsampling::YCbCr444 => Ok(()),
    }
}

pub fn validate_color_space(color_space: ColorSpace) -> Result<(), TdtJpegWasmError> {
    match color_space {
        ColorSpace::Srgb => Ok(()),
    }
}

pub fn validate_compression_control(
    control: &JpegCompressionControl,
) -> Result<(), TdtJpegWasmError> {
    validate_quality(control.quality)?;
    validate_subsampling(control.subsampling)?;
    if let Some(hint) = control.compression_ratio_hint {
        if !(hint > 0.0 && hint <= 1.0) {
            return Err(TdtJpegWasmError::InvalidCompressionRatioHint);
        }
    }
    if control.progressive {
        return Err(TdtJpegWasmError::UnsupportedProgressive);
    }
    Ok(())
}

pub fn validate_encode_input(input: &EncodeInput) -> Result<EncodeReceipt, TdtJpegWasmError> {
    validate_dimensions(input.width, input.height)?;
    validate_rgba_len(&input.rgba, input.width, input.height)?;
    validate_color_space(input.input_color_space)?;
    validate_compression_control(&input.compression)?;
    Ok(EncodeReceipt::new_contract(
        input.width,
        input.height,
        input.rgba.len(),
        input.alpha_policy,
        input.compression,
    ))
}
