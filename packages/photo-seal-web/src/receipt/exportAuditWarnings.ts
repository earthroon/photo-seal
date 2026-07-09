import type {
  PhotoSealAuditBlocker,
  PhotoSealAuditBlockerCode,
  PhotoSealAuditWarning,
  PhotoSealAuditWarningCode,
} from "./exportAuditTypes";

const warningMessages: Record<PhotoSealAuditWarningCode, string> = {
  TARGET_BYTES_NOT_REACHED:
    "목표 용량에는 도달하지 못했지만, 반환된 JPEG의 구조 조건은 계속 확인해야 합니다.",
  RUNTIME_WEBGPU_SMOKE_NOT_RUN:
    "현재 환경에서 WebGPU 런타임 스모크가 실행되지 않았습니다.",
  CANDIDATE_PROFILE_USED:
    "기본 profile이 아닌 후보 resize profile이 사용되었습니다.",
  PARITY_GATE_NOT_RUNTIME_VERIFIED:
    "후보 profile의 parity gate가 런타임 WebGPU로 검증되지 않았습니다.",
  IMPORT_ORIENTATION_NOT_CONFIRMED:
    "브라우저 디코더의 orientation 적용 여부가 완전히 확인되지 않았습니다.",
  IMAGE_DECODER_FALLBACK_TO_CREATE_IMAGE_BITMAP:
    "ImageDecoder를 사용할 수 없어 createImageBitmap decode path로 전환했습니다.",
  OBJECT_URL_REVOKE_WARNING:
    "이미지 preview object URL 정리 상태를 확인하세요.",
  JPEG_SAVE_NOT_ATTEMPTED:
    "JPEG 저장은 아직 시도되지 않았습니다.",
  AUDIT_BUNDLE_NOT_SAVED:
    "Audit bundle은 선택 저장 항목이며 아직 저장되지 않았습니다.",
  CUSTOM_PRESET_USED:
    "사용자 지정 preset이 사용되었습니다.",
  CROP_REQUIRED_PRESET_SELECTED:
    "선택한 preset은 사용자 crop receipt가 필요합니다.",
  CUSTOM_PRESET_INVALID:
    "사용자 지정 프리셋 값을 확인해 주세요. 범위를 벗어난 값은 자동 보정되지 않습니다.",
  CUSTOM_PRESET_NOT_APPLIED:
    "사용자 지정 프리셋이 아직 적용되지 않았습니다.",
  INSTITUTION_REQUIREMENT_USER_CHECK_REQUIRED:
    "Preset documentation is reference-only; check the receiving institution requirements before submission.",
  PRESET_DOCUMENTATION_REFERENCE_ONLY:
    "This preset documentation explains PhotoSeal internal export policy only.",
  EXPORT_FLOW_SAVE_NOT_ATTEMPTED:
    "Export flow is assembled, but JPEG save has not been attempted by user action yet.",
  EXPORT_FLOW_BROWSER_RUNTIME_NOT_RUN:
    "Browser export flow runtime smoke has not run in this environment.",
};

const blockerMessages: Record<PhotoSealAuditBlockerCode, string> = {
  MISSING_RESIZE_RECEIPT: "resize receipt가 없어 리사이즈 결과를 신뢰할 수 없습니다.",
  MISSING_BRIDGE_RECEIPT: "bridge receipt가 없어 Worker/WASM 운반 경로를 신뢰할 수 없습니다.",
  MISSING_WASM_RECEIPT: "WASM/JPEG receipt가 없어 인코딩 결과를 신뢰할 수 없습니다.",
  COLOR_SPACE_NOT_SRGB: "sRGB 색공간 봉인을 확인할 수 없습니다.",
  DOUBLE_GAMMA_DETECTED: "이중 감마 또는 숨은 색공간 변환 위험이 감지되었습니다.",
  JPEG_NOT_444: "JPEG 4:4:4 봉인을 확인할 수 없습니다.",
  ENCODER_FALLBACK_USED: "인코더 fallback 또는 소유권 위반이 감지되었습니다.",
  PADDED_BUFFER_TRANSFERRED: "padding이 제거되지 않은 버퍼가 전달되었습니다.",
  WORKER_COLOR_TRANSFORM_USED: "Worker 경로에서 색공간 변환 위험이 감지되었습니다.",
  MISSING_IMPORT_RECEIPT: "import receipt가 없어 실제 이미지 입력을 신뢰할 수 없습니다.",
  IMPORT_COLOR_SPACE_NOT_SRGB: "import 단계의 sRGB 봉인을 확인할 수 없습니다.",
  CANVAS_COLOR_CORRECTION_USED: "금지된 canvas color correction path가 감지되었습니다.",
  BROWSER_DECODE_FAILED: "브라우저 이미지 디코딩에 실패했습니다.",
  UNSUPPORTED_MIME_TYPE: "지원하지 않는 이미지 MIME 타입입니다.",
  CANVAS_PIXEL_EXTRACTION_USED: "금지된 canvas pixel extraction path가 감지되었습니다.",
  MISSING_PRESET_RECEIPT: "preset receipt가 없어 export preset 정책을 신뢰할 수 없습니다.",
  HIDDEN_RESIZE_POLICY_USED: "preset에 없는 resize 정책이 감지되었습니다.",
  HIDDEN_TARGET_BYTES_POLICY_USED: "preset에 없는 targetBytes 정책이 감지되었습니다.",
  PRESET_RUNTIME_MISMATCH: "runtime export 정책이 선택된 preset receipt와 일치하지 않습니다.",
  CROP_REQUIRED_BUT_MISSING: "선택한 preset은 사용자 crop receipt가 필요합니다.",
  JPEG_BYTES_MISSING: "JPEG bytes가 없어 저장할 수 없습니다.",
  JPEG_BLOB_CREATE_FAILED: "JPEG Blob 생성에 실패했습니다.",
  DOWNLOAD_TRIGGER_FAILED: "다운로드 트리거에 실패했습니다.",
  OBJECT_URL_REVOKE_FAILED: "Blob object URL 회수에 실패했습니다.",
  AUDIT_BUNDLE_MISSING: "저장할 audit bundle이 없습니다.",
  CUSTOM_PRESET_CLAMPED: "사용자 지정 프리셋 값이 금지된 방식으로 보정되었습니다.",
  CUSTOM_PRESET_FALLBACK_USED: "사용자 지정 프리셋이 다른 preset으로 대체되었습니다.",
  CUSTOM_PRESET_SILENT_CORRECTION_USED: "사용자 지정 프리셋에 숨은 보정이 적용되었습니다.",
  PRESET_DOCUMENTATION_MISSING: "preset documentation receipt is missing.",
  COMPLIANCE_OVERCLAIM_DETECTED: "documentation overclaim guard detected unsafe guarantee wording.",
  DISCLAIMER_NOT_VISIBLE: "preset documentation disclaimer is not visible.",
  INSTITUTION_NOTE_COPY_MISSING: "institution note copy is missing.",
  EXPORT_FLOW_MISSING_IMPORT_RECEIPT: "Export flow import receipt is missing.",
  EXPORT_FLOW_MISSING_PRESET_RECEIPT: "Export flow preset receipt is missing.",
  EXPORT_FLOW_MISSING_RESIZE_RECEIPT: "Export flow resize receipt is missing.",
  EXPORT_FLOW_MISSING_BRIDGE_RECEIPT: "Export flow bridge receipt is missing.",
  EXPORT_FLOW_MISSING_WASM_RECEIPT: "Export flow WASM receipt is missing.",
  EXPORT_FLOW_MISSING_AUDIT_SUMMARY: "Export flow audit summary is missing.",
  EXPORT_FLOW_MISSING_DOCUMENTATION_RECEIPT: "Export flow documentation receipt is missing.",
  EXPORT_FLOW_MISSING_RECEIPT_SUCCESS_BLOCKED: "No Missing Receipt Success Seal blocked an incomplete success claim.",
};

export function makePhotoSealAuditWarning(
  code: PhotoSealAuditWarningCode,
  message = warningMessages[code]
): PhotoSealAuditWarning {
  return { code, severity: "warning", message };
}

export function makePhotoSealAuditBlocker(
  code: PhotoSealAuditBlockerCode,
  message = blockerMessages[code]
): PhotoSealAuditBlocker {
  return { code, severity: "blocker", message };
}

export function hasBlocker(
  blockers: PhotoSealAuditBlocker[],
  code: PhotoSealAuditBlockerCode
): boolean {
  return blockers.some((blocker) => blocker.code === code);
}
