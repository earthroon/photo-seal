use crate::{
    alpha::AlphaPolicy,
    audit::{audit_jpeg_sampling_factors, validate_jpeg_magic},
    color::ColorSpace,
    error::TdtJpegWasmError,
    jpeg444::encode_rgb_to_jpeg_444_with_control,
    receipt::EncodeReceipt,
    rgba::rgba_to_rgb,
    types::{EncodeInput, EncodeOutput, JpegCompressionControl},
    validate::{validate_color_space, validate_compression_control, validate_encode_input},
};

pub fn encode_rgba_to_jpeg_444(
    input: EncodeInput,
) -> Result<EncodeOutput, TdtJpegWasmError> {
    let _contract = validate_encode_input(&input)?;
    validate_color_space(input.input_color_space)?;
    let rgb = rgba_to_rgb(&input.rgba, input.width, input.height, input.alpha_policy)?;
    let jpg = encode_rgb_to_jpeg_444_with_control(
        &rgb,
        input.width,
        input.height,
        input.compression,
        input.input_color_space,
    )?;
    validate_jpeg_magic(&jpg)?;
    let sampling_audit = audit_jpeg_sampling_factors(&jpg)?;
    let receipt = EncodeReceipt::new_encode(
        input.width,
        input.height,
        input.rgba.len(),
        rgb.len(),
        jpg.len(),
        input.alpha_policy,
        input.compression,
        sampling_audit,
    );
    Ok(EncodeOutput {
        quality: input.compression.quality,
        width: input.width,
        height: input.height,
        size_bytes: jpg.len(),
        jpg,
        receipt,
    })
}

pub fn encode_rgba_to_jpeg_444_with_control(
    rgba: Vec<u8>,
    width: u32,
    height: u32,
    alpha_policy: AlphaPolicy,
    compression: JpegCompressionControl,
    input_color_space: ColorSpace,
) -> Result<EncodeOutput, TdtJpegWasmError> {
    validate_compression_control(&compression)?;
    validate_color_space(input_color_space)?;
    encode_rgba_to_jpeg_444(EncodeInput {
        rgba,
        width,
        height,
        alpha_policy,
        compression,
        input_color_space,
    })
}
