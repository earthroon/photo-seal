use crate::{
    audit::{audit_jpeg_sampling_factors, validate_jpeg_magic},
    color::{make_srgb_color_pipeline_seal, ColorPipelineSeal, ColorSpace},
    encode::encode_rgba_to_jpeg_444,
    error::TdtJpegWasmError,
    rgba::rgba_to_rgb,
    search_plan::{
        make_quality_binary_control, make_quality_ladder_controls, validate_search_plan,
        validate_supplied_handles, CompressionSearchStrategy,
    },
    search_receipt::{CompressionSearchAttempt, TargetBytesEncodeReceipt},
    target::{TargetBytesEncodeRequest, TargetBytesEncodeResult},
    types::{EncodeInput, JpegCompressionControl},
    validate::{validate_color_space, validate_dimensions, validate_rgba_len},
};

struct AttemptRecord {
    control: JpegCompressionControl,
    jpg: Vec<u8>,
    size_bytes: usize,
    sampling_audit: crate::receipt::JpegSamplingAudit,
    color_pipeline: ColorPipelineSeal,
    reached_target: bool,
}

pub fn validate_target_bytes(target_bytes: usize) -> Result<(), TdtJpegWasmError> {
    match target_bytes {
        0 => Err(TdtJpegWasmError::InvalidTargetBytes),
        _ => Ok(()),
    }
}

fn ensure_srgb_search_contract(color_space: ColorSpace) -> Result<(), TdtJpegWasmError> {
    validate_color_space(color_space)
}

pub fn encode_rgba_to_jpeg_444_target_bytes(
    request: TargetBytesEncodeRequest,
) -> Result<TargetBytesEncodeResult, TdtJpegWasmError> {
    validate_dimensions(request.width, request.height)?;
    validate_rgba_len(&request.rgba, request.width, request.height)?;
    ensure_srgb_search_contract(request.input_color_space)?;
    validate_target_bytes(request.target_bytes)?;
    validate_search_plan(&request.search_plan)?;
    let _rgb_probe = rgba_to_rgb(&request.rgba, request.width, request.height, request.alpha_policy)?;

    let (attempts, mut records) = match request.search_plan.strategy {
        CompressionSearchStrategy::QualityBinary => run_quality_binary_search(&request)?,
        CompressionSearchStrategy::QualityLadder => {
            let controls = make_quality_ladder_controls(&request.search_plan);
            run_supplied_control_list(&request, &controls)?
        }
        CompressionSearchStrategy::SuppliedHandles => {
            let supplied = request
                .supplied_handles
                .as_ref()
                .ok_or(TdtJpegWasmError::EmptyCompressionHandleList)?;
            validate_supplied_handles(&supplied.handles, request.search_plan.max_attempts)?;
            run_supplied_control_list(&request, &supplied.handles)?
        }
    };

    if attempts.is_empty() || records.is_empty() {
        return Err(TdtJpegWasmError::NoEncodeAttemptProduced);
    }

    let selected_index = select_best_record(&records, request.target_bytes);
    let selected = records.swap_remove(selected_index);
    let selected_color_pipeline = selected.color_pipeline;
    let receipt = TargetBytesEncodeReceipt::new(
        request.width,
        request.height,
        request.rgba.len(),
        request.input_color_space,
        request.target_bytes,
        selected.size_bytes,
        selected.reached_target,
        selected.control,
        selected_color_pipeline,
        attempts.clone(),
        request.search_plan.strategy,
        selected.sampling_audit.clone(),
    );

    Ok(TargetBytesEncodeResult {
        jpg: selected.jpg,
        width: request.width,
        height: request.height,
        size_bytes: selected.size_bytes,
        reached_target: selected.reached_target,
        selected_control: selected.control,
        selected_color_pipeline,
        attempts,
        receipt,
    })
}

fn run_quality_binary_search(
    request: &TargetBytesEncodeRequest,
) -> Result<(Vec<CompressionSearchAttempt>, Vec<AttemptRecord>), TdtJpegWasmError> {
    let mut attempts = Vec::new();
    let mut records = Vec::new();
    let mut low = request.search_plan.min_quality;
    let mut high = request.search_plan.max_quality;

    while low <= high && attempts.len() < request.search_plan.max_attempts as usize {
        let quality = low + (high - low) / 2;
        let control = make_quality_binary_control(quality, &request.search_plan);
        let record = encode_attempt(request, control, attempts.len() as u8)?;
        let reached = record.0.reached_target;
        attempts.push(record.0);
        records.push(record.1);
        if reached {
            if quality == u8::MAX {
                break;
            }
            low = quality.saturating_add(1);
        } else {
            if quality == 0 {
                break;
            }
            high = quality.saturating_sub(1);
        }
    }

    Ok((attempts, records))
}

fn run_supplied_control_list(
    request: &TargetBytesEncodeRequest,
    controls: &[JpegCompressionControl],
) -> Result<(Vec<CompressionSearchAttempt>, Vec<AttemptRecord>), TdtJpegWasmError> {
    let mut attempts = Vec::new();
    let mut records = Vec::new();
    for control in controls.iter().copied().take(request.search_plan.max_attempts as usize) {
        let record = encode_attempt(request, control, attempts.len() as u8)?;
        attempts.push(record.0);
        records.push(record.1);
    }
    Ok((attempts, records))
}

fn encode_attempt(
    request: &TargetBytesEncodeRequest,
    control: JpegCompressionControl,
    index: u8,
) -> Result<(CompressionSearchAttempt, AttemptRecord), TdtJpegWasmError> {
    let output = encode_rgba_to_jpeg_444(EncodeInput {
        rgba: request.rgba.clone(),
        width: request.width,
        height: request.height,
        alpha_policy: request.alpha_policy,
        compression: control,
        input_color_space: request.input_color_space,
    })?;
    validate_jpeg_magic(&output.jpg)?;
    let sampling_audit = audit_jpeg_sampling_factors(&output.jpg)?;
    if !sampling_audit.is_444 {
        return Err(TdtJpegWasmError::JpegSamplingAuditFailed);
    }
    let color_pipeline = make_srgb_color_pipeline_seal();
    let reached_target = output.size_bytes <= request.target_bytes;
    let attempt = CompressionSearchAttempt {
        index,
        control,
        size_bytes: output.size_bytes,
        jpeg_magic_valid: true,
        sampling_audit: sampling_audit.clone(),
        color_pipeline,
        reached_target,
    };
    let record = AttemptRecord {
        control,
        jpg: output.jpg,
        size_bytes: output.size_bytes,
        sampling_audit,
        color_pipeline,
        reached_target,
    };
    Ok((attempt, record))
}

fn select_best_record(records: &[AttemptRecord], target_bytes: usize) -> usize {
    let mut best_under: Option<usize> = None;
    for (index, record) in records.iter().enumerate() {
        if !record.reached_target || record.size_bytes > target_bytes {
            continue;
        }
        best_under = match best_under {
            None => Some(index),
            Some(best) => match compare_success_candidate(record, &records[best]) {
                core::cmp::Ordering::Greater => Some(index),
                _ => Some(best),
            },
        };
    }
    if let Some(index) = best_under {
        return index;
    }

    let mut smallest = 0usize;
    for index in 1..records.len() {
        if records[index].size_bytes < records[smallest].size_bytes {
            smallest = index;
        }
    }
    smallest
}

fn compare_success_candidate(a: &AttemptRecord, b: &AttemptRecord) -> core::cmp::Ordering {
    match a.control.quality.cmp(&b.control.quality) {
        core::cmp::Ordering::Equal => {}
        other => return other,
    }
    match effort_rank(a.control.effort).cmp(&effort_rank(b.control.effort)) {
        core::cmp::Ordering::Equal => {}
        other => return other,
    }
    a.size_bytes.cmp(&b.size_bytes)
}

fn effort_rank(effort: crate::types::CompressionEffort) -> u8 {
    match effort {
        crate::types::CompressionEffort::Fast => 0,
        crate::types::CompressionEffort::Balanced => 1,
        crate::types::CompressionEffort::Max => 2,
    }
}
