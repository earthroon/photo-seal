use wasm_bindgen::prelude::*;
use js_sys::{Array, Object, Reflect, Uint8Array};

pub mod alpha;
pub mod audit;
pub mod color;
pub mod encode;
pub mod error;
pub mod jpeg444;
pub mod receipt;
pub mod rgba;
pub mod search;
pub mod search_plan;
pub mod search_receipt;
pub mod target;
pub mod types;
pub mod validate;

pub use alpha::AlphaPolicy;
pub use audit::{audit_jpeg_sampling_factors, validate_jpeg_magic};
pub use color::{make_srgb_color_pipeline_seal, ColorPipelineSeal, ColorSpace, PixelFormat};
pub use encode::{encode_rgba_to_jpeg_444, encode_rgba_to_jpeg_444_with_control};
pub use error::TdtJpegWasmError;
pub use jpeg444::{encode_rgb_to_jpeg_444, encode_rgb_to_jpeg_444_with_control};
pub use receipt::{EncodeReceipt, JpegSamplingAudit};
pub use rgba::rgba_to_rgb;
pub use search::{encode_rgba_to_jpeg_444_target_bytes, validate_target_bytes};
pub use search_plan::{
    make_quality_binary_control, make_quality_ladder_controls, validate_search_plan,
    validate_supplied_handles, CompressionSearchPlan, CompressionSearchStrategy,
    SuppliedCompressionHandles,
};
pub use search_receipt::{CompressionSearchAttempt, TargetBytesEncodeReceipt};
pub use target::{TargetBytesEncodeRequest, TargetBytesEncodeResult};
pub use types::{
    CompressionEffort, CompressionMode, EncodeInput, EncodeOutput, JpegCompressionControl,
    JpegSubsampling,
};
pub use validate::{
    expected_rgb_len, expected_rgba_len, validate_compression_control, validate_dimensions,
    validate_color_space, validate_encode_input, validate_quality, validate_rgb_len, validate_rgba_len,
    validate_subsampling,
};

#[wasm_bindgen]
pub fn tdt_jpeg_wasm_patch_id() -> String {
    "TDT-JPEG-WASM-03-R1".to_string()
}

#[wasm_bindgen]
pub fn validate_rgba_contract_wasm(
    rgba: Vec<u8>,
    width: u32,
    height: u32,
    quality: u8,
) -> Result<String, JsValue> {
    let input = EncodeInput {
        rgba,
        width,
        height,
        alpha_policy: AlphaPolicy::WhiteComposite,
        compression: JpegCompressionControl::explicit_quality(quality),
        input_color_space: ColorSpace::Srgb,
    };

    let receipt = validate_encode_input(&input).map_err(|err| JsValue::from_str(&err.to_string()))?;
    Ok(receipt.to_json_string())
}

#[wasm_bindgen]
pub fn encode_rgba_to_jpeg_444_with_control_wasm(
    rgba: Vec<u8>,
    width: u32,
    height: u32,
    alpha_policy: String,
    quality: u8,
    effort: String,
    progressive: bool,
    optimize_huffman: bool,
    compression_ratio_hint: f32,
    input_color_space: String,
) -> Result<Vec<u8>, JsValue> {
    let alpha_policy = parse_alpha_policy(&alpha_policy)?;
    let input_color_space = parse_color_space(&input_color_space)?;
    let effort = parse_effort(&effort)?;
    let compression = JpegCompressionControl {
        mode: match compression_ratio_hint > 0.0 {
            true => CompressionMode::CompressionRatioHint,
            false => CompressionMode::ExplicitQuality,
        },
        quality,
        compression_ratio_hint: match compression_ratio_hint > 0.0 {
            true => Some(compression_ratio_hint),
            false => None,
        },
        effort,
        progressive,
        optimize_huffman,
        subsampling: JpegSubsampling::YCbCr444,
    };
    let output = encode_rgba_to_jpeg_444_with_control(
        rgba,
        width,
        height,
        alpha_policy,
        compression,
        input_color_space,
    )
    .map_err(|err| JsValue::from_str(&err.to_string()))?;
    Ok(output.jpg)
}

#[wasm_bindgen]
pub fn encode_rgba_to_jpeg_444_with_receipt_wasm(
    rgba: Vec<u8>,
    width: u32,
    height: u32,
    alpha_policy: String,
    quality: u8,
    effort: String,
    progressive: bool,
    optimize_huffman: bool,
    compression_ratio_hint: f32,
    input_color_space: String,
) -> Result<String, JsValue> {
    let alpha_policy = parse_alpha_policy(&alpha_policy)?;
    let input_color_space = parse_color_space(&input_color_space)?;
    let effort = parse_effort(&effort)?;
    let compression = JpegCompressionControl {
        mode: match compression_ratio_hint > 0.0 {
            true => CompressionMode::CompressionRatioHint,
            false => CompressionMode::ExplicitQuality,
        },
        quality,
        compression_ratio_hint: match compression_ratio_hint > 0.0 {
            true => Some(compression_ratio_hint),
            false => None,
        },
        effort,
        progressive,
        optimize_huffman,
        subsampling: JpegSubsampling::YCbCr444,
    };
    let output = encode_rgba_to_jpeg_444_with_control(
        rgba,
        width,
        height,
        alpha_policy,
        compression,
        input_color_space,
    )
    .map_err(|err| JsValue::from_str(&err.to_string()))?;
    Ok(format!(
        "{{\"jpgBytes\":{},\"width\":{},\"height\":{},\"quality\":{},\"sizeBytes\":{},\"receipt\":{}}}",
        output.jpg.len(),
        output.width,
        output.height,
        output.quality,
        output.size_bytes,
        output.receipt.to_json_string(),
    ))
}


#[wasm_bindgen]
pub fn encode_rgba_to_jpeg_444_target_bytes_wasm(
    rgba: Vec<u8>,
    width: u32,
    height: u32,
    target_bytes: usize,
    alpha_policy: String,
    search_plan_json: String,
    input_color_space: String,
) -> Result<JsValue, JsValue> {
    let alpha_policy = parse_alpha_policy(&alpha_policy)?;
    let input_color_space = parse_color_space(&input_color_space)?;
    let search_plan = parse_search_plan_json(&search_plan_json)?;
    let supplied_handles = parse_supplied_handles_json(&search_plan_json, &search_plan)?;
    let result = encode_rgba_to_jpeg_444_target_bytes(TargetBytesEncodeRequest {
        rgba,
        width,
        height,
        target_bytes,
        alpha_policy,
        input_color_space,
        search_plan,
        supplied_handles,
    })
    .map_err(|err| JsValue::from_str(&err.to_string()))?;
    Ok(target_result_to_js_value(result)?)
}

fn target_result_to_js_value(result: TargetBytesEncodeResult) -> Result<JsValue, JsValue> {
    let obj = Object::new();
    let jpg = Uint8Array::from(result.jpg.as_slice());
    Reflect::set(&obj, &JsValue::from_str("jpg"), &jpg.into())?;
    Reflect::set(&obj, &JsValue::from_str("width"), &JsValue::from_f64(result.width as f64))?;
    Reflect::set(&obj, &JsValue::from_str("height"), &JsValue::from_f64(result.height as f64))?;
    Reflect::set(&obj, &JsValue::from_str("sizeBytes"), &JsValue::from_f64(result.size_bytes as f64))?;
    Reflect::set(&obj, &JsValue::from_str("reachedTarget"), &JsValue::from_bool(result.reached_target))?;
    Reflect::set(&obj, &JsValue::from_str("selectedControl"), &compression_control_to_js(&result.selected_control)?)?;
    Reflect::set(&obj, &JsValue::from_str("selectedColorPipeline"), &color_pipeline_to_js(&result.selected_color_pipeline)?)?;

    let attempts = Array::new();
    for attempt in &result.attempts {
        attempts.push(&attempt_to_js(attempt)?);
    }
    Reflect::set(&obj, &JsValue::from_str("attempts"), &attempts.into())?;
    Reflect::set(&obj, &JsValue::from_str("receipt"), &target_receipt_to_js(&result.receipt)?)?;
    Ok(obj.into())
}

fn compression_control_to_js(control: &JpegCompressionControl) -> Result<JsValue, JsValue> {
    let obj = Object::new();
    Reflect::set(&obj, &JsValue::from_str("mode"), &JsValue::from_str(control.mode.as_str()))?;
    Reflect::set(&obj, &JsValue::from_str("quality"), &JsValue::from_f64(control.quality as f64))?;
    if let Some(hint) = control.compression_ratio_hint {
        Reflect::set(&obj, &JsValue::from_str("compressionRatioHint"), &JsValue::from_f64(hint as f64))?;
    }
    Reflect::set(&obj, &JsValue::from_str("effort"), &JsValue::from_str(control.effort.as_str()))?;
    Reflect::set(&obj, &JsValue::from_str("progressive"), &JsValue::from_bool(control.progressive))?;
    Reflect::set(&obj, &JsValue::from_str("optimizeHuffman"), &JsValue::from_bool(control.optimize_huffman))?;
    Reflect::set(&obj, &JsValue::from_str("subsampling"), &JsValue::from_str("444"))?;
    Ok(obj.into())
}

fn audit_to_js(audit: &JpegSamplingAudit) -> Result<JsValue, JsValue> {
    let obj = Object::new();
    Reflect::set(&obj, &JsValue::from_str("yH"), &JsValue::from_f64(audit.y_h as f64))?;
    Reflect::set(&obj, &JsValue::from_str("yV"), &JsValue::from_f64(audit.y_v as f64))?;
    Reflect::set(&obj, &JsValue::from_str("cbH"), &JsValue::from_f64(audit.cb_h as f64))?;
    Reflect::set(&obj, &JsValue::from_str("cbV"), &JsValue::from_f64(audit.cb_v as f64))?;
    Reflect::set(&obj, &JsValue::from_str("crH"), &JsValue::from_f64(audit.cr_h as f64))?;
    Reflect::set(&obj, &JsValue::from_str("crV"), &JsValue::from_f64(audit.cr_v as f64))?;
    Reflect::set(&obj, &JsValue::from_str("is444"), &JsValue::from_bool(audit.is_444))?;
    Ok(obj.into())
}


fn color_pipeline_to_js(seal: &ColorPipelineSeal) -> Result<JsValue, JsValue> {
    let obj = Object::new();
    Reflect::set(&obj, &JsValue::from_str("inputColorSpace"), &JsValue::from_str(seal.input_color_space.as_str()))?;
    Reflect::set(&obj, &JsValue::from_str("rgbColorSpace"), &JsValue::from_str(seal.rgb_color_space.as_str()))?;
    Reflect::set(&obj, &JsValue::from_str("encodedColorSpace"), &JsValue::from_str(seal.encoded_color_space.as_str()))?;
    Reflect::set(&obj, &JsValue::from_str("gammaTransformUsed"), &JsValue::from_bool(seal.gamma_transform_used))?;
    Reflect::set(&obj, &JsValue::from_str("hiddenLinearizationUsed"), &JsValue::from_bool(seal.hidden_linearization_used))?;
    Reflect::set(&obj, &JsValue::from_str("doubleGammaDetected"), &JsValue::from_bool(seal.double_gamma_detected))?;
    Ok(obj.into())
}

fn attempt_to_js(attempt: &CompressionSearchAttempt) -> Result<JsValue, JsValue> {
    let obj = Object::new();
    Reflect::set(&obj, &JsValue::from_str("index"), &JsValue::from_f64(attempt.index as f64))?;
    Reflect::set(&obj, &JsValue::from_str("control"), &compression_control_to_js(&attempt.control)?)?;
    Reflect::set(&obj, &JsValue::from_str("sizeBytes"), &JsValue::from_f64(attempt.size_bytes as f64))?;
    Reflect::set(&obj, &JsValue::from_str("reachedTarget"), &JsValue::from_bool(attempt.reached_target))?;
    Reflect::set(&obj, &JsValue::from_str("samplingAudit"), &audit_to_js(&attempt.sampling_audit)?)?;
    Reflect::set(&obj, &JsValue::from_str("colorPipeline"), &color_pipeline_to_js(&attempt.color_pipeline)?)?;
    Ok(obj.into())
}

fn target_receipt_to_js(receipt: &TargetBytesEncodeReceipt) -> Result<JsValue, JsValue> {
    let obj = Object::new();
    Reflect::set(&obj, &JsValue::from_str("patchId"), &JsValue::from_str(receipt.patch_id))?;
    Reflect::set(&obj, &JsValue::from_str("stage"), &JsValue::from_str(receipt.stage))?;
    Reflect::set(&obj, &JsValue::from_str("targetBytes"), &JsValue::from_f64(receipt.target_bytes as f64))?;
    Reflect::set(&obj, &JsValue::from_str("outputBytes"), &JsValue::from_f64(receipt.output_bytes as f64))?;
    Reflect::set(&obj, &JsValue::from_str("reachedTarget"), &JsValue::from_bool(receipt.reached_target))?;
    Reflect::set(&obj, &JsValue::from_str("selectedColorPipeline"), &color_pipeline_to_js(&receipt.selected_color_pipeline)?)?;
    Reflect::set(&obj, &JsValue::from_str("attemptsCount"), &JsValue::from_f64(receipt.attempts_count as f64))?;
    Reflect::set(&obj, &JsValue::from_str("searchStrategy"), &JsValue::from_str(receipt.search_strategy.as_str()))?;
    Reflect::set(&obj, &JsValue::from_str("compressionHandleSearchUsed"), &JsValue::from_bool(receipt.compression_handle_search_used))?;
    Reflect::set(&obj, &JsValue::from_str("targetBytesUsed"), &JsValue::from_bool(receipt.target_bytes_used))?;
    Reflect::set(&obj, &JsValue::from_str("qualitySearchUsed"), &JsValue::from_bool(receipt.quality_search_used))?;
    Reflect::set(&obj, &JsValue::from_str("subsampling"), &JsValue::from_str("444"))?;
    Reflect::set(&obj, &JsValue::from_str("samplingAudit"), &audit_to_js(&receipt.sampling_audit)?)?;
    Reflect::set(&obj, &JsValue::from_str("inputColorSpace"), &JsValue::from_str(receipt.input_color_space.as_str()))?;
    Reflect::set(&obj, &JsValue::from_str("encodedColorSpace"), &JsValue::from_str(receipt.encoded_color_space.as_str()))?;
    Reflect::set(&obj, &JsValue::from_str("gammaTransformUsed"), &JsValue::from_bool(receipt.gamma_transform_used))?;
    Reflect::set(&obj, &JsValue::from_str("hiddenLinearizationUsed"), &JsValue::from_bool(receipt.hidden_linearization_used))?;
    Reflect::set(&obj, &JsValue::from_str("doubleGammaDetected"), &JsValue::from_bool(receipt.double_gamma_detected))?;
    Reflect::set(&obj, &JsValue::from_str("resizedInsideEncoder"), &JsValue::from_bool(receipt.resized_inside_encoder))?;
    Reflect::set(&obj, &JsValue::from_str("cropInsideEncoder"), &JsValue::from_bool(receipt.crop_inside_encoder))?;
    Reflect::set(&obj, &JsValue::from_str("fallbackUsed"), &JsValue::from_bool(receipt.fallback_used))?;
    Ok(obj.into())
}

fn parse_search_plan_json(value: &str) -> Result<CompressionSearchPlan, JsValue> {
    let strategy = parse_search_strategy(&extract_string(value, "strategy").unwrap_or_else(|| "quality-binary".to_string()))?;
    let min_quality = extract_u8(value, "minQuality").unwrap_or(40);
    let max_quality = extract_u8(value, "maxQuality").unwrap_or(92);
    let initial_quality = extract_u8(value, "initialQuality").unwrap_or(max_quality);
    let max_attempts = extract_u8(value, "maxAttempts").unwrap_or(8);
    let effort = parse_effort(&extract_string(value, "effort").unwrap_or_else(|| "balanced".to_string()))?;
    let optimize_huffman_allowed = extract_bool(value, "optimizeHuffmanAllowed").unwrap_or(true);
    Ok(CompressionSearchPlan {
        strategy,
        min_quality,
        max_quality,
        initial_quality,
        max_attempts,
        effort,
        progressive_allowed: false,
        optimize_huffman_allowed,
        subsampling: JpegSubsampling::YCbCr444,
    })
}

fn parse_supplied_handles_json(
    value: &str,
    plan: &CompressionSearchPlan,
) -> Result<Option<SuppliedCompressionHandles>, JsValue> {
    if plan.strategy != CompressionSearchStrategy::SuppliedHandles {
        return Ok(None);
    }
    let mut handles = Vec::new();
    let mut rest = value;
    while let Some(pos) = rest.find("\"quality\"") {
        rest = &rest[pos + "\"quality\"".len()..];
        if let Some(quality) = extract_first_u8_after_colon(rest) {
            handles.push(JpegCompressionControl {
                mode: CompressionMode::ExplicitQuality,
                quality,
                compression_ratio_hint: None,
                effort: plan.effort,
                progressive: false,
                optimize_huffman: plan.optimize_huffman_allowed,
                subsampling: JpegSubsampling::YCbCr444,
            });
        }
        if handles.len() >= plan.max_attempts as usize {
            break;
        }
    }
    Ok(Some(SuppliedCompressionHandles { handles }))
}

fn extract_string(value: &str, key: &str) -> Option<String> {
    let needle = format!("\"{}\"", key);
    let start = value.find(&needle)? + needle.len();
    let after_key = &value[start..];
    let colon = after_key.find(':')?;
    let after_colon = after_key[colon + 1..].trim_start();
    if !after_colon.starts_with('\"') {
        return None;
    }
    let body = &after_colon[1..];
    let end = body.find('\"')?;
    Some(body[..end].to_string())
}

fn extract_u8(value: &str, key: &str) -> Option<u8> {
    let needle = format!("\"{}\"", key);
    let start = value.find(&needle)? + needle.len();
    extract_first_u8_after_colon(&value[start..])
}

fn extract_first_u8_after_colon(value: &str) -> Option<u8> {
    let colon = value.find(':')?;
    let mut digits = String::new();
    for ch in value[colon + 1..].chars().skip_while(|c| c.is_whitespace()) {
        if ch.is_ascii_digit() {
            digits.push(ch);
        } else {
            break;
        }
    }
    digits.parse::<u8>().ok()
}

fn extract_bool(value: &str, key: &str) -> Option<bool> {
    let needle = format!("\"{}\"", key);
    let start = value.find(&needle)? + needle.len();
    let after_key = &value[start..];
    let colon = after_key.find(':')?;
    let after_colon = after_key[colon + 1..].trim_start();
    if after_colon.starts_with("true") {
        Some(true)
    } else if after_colon.starts_with("false") {
        Some(false)
    } else {
        None
    }
}

fn parse_search_strategy(value: &str) -> Result<CompressionSearchStrategy, JsValue> {
    match value {
        "quality-binary" | "QualityBinary" => Ok(CompressionSearchStrategy::QualityBinary),
        "quality-ladder" | "QualityLadder" => Ok(CompressionSearchStrategy::QualityLadder),
        "supplied-handles" | "SuppliedHandles" => Ok(CompressionSearchStrategy::SuppliedHandles),
        other => Err(JsValue::from_str(&format!("invalid search strategy: {}", other))),
    }
}

fn parse_alpha_policy(value: &str) -> Result<AlphaPolicy, JsValue> {
    match value {
        "white-composite" | "WhiteComposite" => Ok(AlphaPolicy::WhiteComposite),
        "discard" | "Discard" => Ok(AlphaPolicy::Discard),
        other => Err(JsValue::from_str(&format!("invalid alpha policy: {}", other))),
    }
}

fn parse_color_space(value: &str) -> Result<ColorSpace, JsValue> {
    match value {
        "srgb" | "sRGB" | "Srgb" => Ok(ColorSpace::Srgb),
        other => Err(JsValue::from_str(&format!("invalid color space: {}", other))),
    }
}

fn parse_effort(value: &str) -> Result<CompressionEffort, JsValue> {
    match value {
        "fast" | "Fast" => Ok(CompressionEffort::Fast),
        "balanced" | "Balanced" => Ok(CompressionEffort::Balanced),
        "max" | "Max" => Ok(CompressionEffort::Max),
        other => Err(JsValue::from_str(&format!("invalid effort: {}", other))),
    }
}
