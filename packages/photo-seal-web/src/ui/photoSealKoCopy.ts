export const PHOTO_SEAL_LAYOUT_SSOT = {
  layoutSsotWidth: 1920,
  layoutSsotHeight: 1080,
  densityTarget: "desktop-no-scroll",
  primaryViewport: "1920x1080",
  desktopContentMaxWidth: 1720,
} as const;

export const PHOTO_SEAL_KO_COPY = {
  appTitle: "TDT PhotoSeal",
  appBuild: "TDT-PHOTOSEAL-13-H3-R4",
  appSubtitle: "이미지를 불러와 출력 프리셋에 맞춰 JPEG로 내보냅니다.",
  appNoticeTitle: "프리셋은 내부 권장 품질입니다.",
  appNotice: "제출 전 기관 요구사항을 꼭 확인해 주세요.",

  stepImageInput: "1단계",
  imageInputTitle: "이미지 불러오기",
  imageInputDescription: "JPG, PNG, WebP 이미지를 선택하세요. 브라우저 디코더가 sRGB RGBA로 불러옵니다.",
  chooseFile: "파일 선택",
  dragFile: "또는 파일을 드래그하여 선택",
  imageImported: "이미지 불러옴",
  imageNotImported: "이미지 파일이 선택되지 않았습니다.",
  imageImportFailed: "이미지를 불러오지 못했습니다.",
  imageDecodeBusy: "브라우저 디코더로 이미지를 여는 중입니다.",
  fileName: "파일명",
  fileType: "파일 형식",
  decodedSize: "디코딩 해상도",
  colorSpace: "색상 공간",
  decodeOwner: "디코더",
  canvasCorrection: "캔버스 색상 보정",
  none: "없음",
  browserDecoder: "브라우저",

  stepPreset: "2단계",
  presetTitle: "출력 프리셋",
  presetDescription: "출력 크기와 목표 용량을 선택하세요.",
  selectedPreset: "선택된 프리셋",
  selectedPresetInfo: "선택된 프리셋 정보",
  presetSelected: "선택됨",
  targetBytes: "목표 용량",
  resizeProfile: "리사이즈 방식",
  jpegPolicy: "JPEG 정책",
  cropRequired: "크롭 필요",
  cropNotRequired: "크롭 불필요",
  cropState: "크롭 상태",
  presetReferenceOnly: "내부 출력 프리셋입니다. 제출 전 기관 요구사항을 별도로 확인하세요.",
  resumePhoto: "이력서 사진",
  customPreset: "출력 크기 조절",
  customPresetCard: "사용자 지정",
  width: "너비",
  height: "높이",
  label: "라벨",
  applyCustomPreset: "출력 크기 적용",
  resetFields: "초기화",
  customValidationPassed: "사용자 설정 검증 통과",
  customValidationFailed: "사용자 설정 값을 확인해 주세요.",
  noAutoClamp: "입력값은 자동 보정되지 않습니다.",
  invalidRangeNotApplied: "범위를 벗어난 값은 적용되지 않습니다.",
  sizeAdjustDescription: "여기서 지정한 크기가 WebGPU 리사이즈 목표가 됩니다. WASM 인코더에는 이 크기로 조절된 RGBA8만 전달됩니다.",
  antiRingingProfile: "저링잉 리사이즈",

  stepExport: "3단계",
  exportTitle: "내보내기",
  exportReady: "내보내기 가능",
  exportBlocked: "내보내기 불가",
  exportWaiting: "대기 중",
  exportRunning: "내보내는 중",
  runExport: "JPEG 내보내기",
  downloadJpeg: "JPEG 다운로드",
  saveAuditBundle: "검증 기록 저장",
  copyInstitutionNote: "기관 제출 참고 문구 복사",
  importFirst: "이미지를 먼저 불러오세요.",
  selectPresetFirst: "출력 프리셋을 선택하세요.",
  cropReceiptRequired: "이 프리셋은 크롭 확인이 필요합니다. 크롭 조정에서 보이는 영역을 직접 적용하세요.",
  exportReadyMessage: "내보내기 준비가 완료되었습니다.",
  exportRunningMessage: "내보내는 중입니다.",
  exportCompleted: "내보내기가 완료되었습니다.",
  exportFailed: "내보내기에 실패했습니다.",
  exportBlockedByAssembly: "누락된 검증 기록이 있어 성공으로 표시하지 않습니다.",

  resultTitle: "출력 결과",
  outputSize: "출력 용량",
  outputResolution: "출력 해상도",
  targetReached: "목표 용량 도달",
  targetNotReached: "목표 용량 미도달",
  noResultYet: "아직 출력 결과가 없습니다.",

  technicalDetails: "기술 정보",
  showDetails: "자세히 보기",
  hideDetails: "접기",
  receiptSummary: "검증 기록 요약",
  receiptWaiting: "검증 기록 대기 중",
} as const;

export function formatPhotoSealBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "-";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getPhotoSealPresetDisplayTitle(args: { kind: string; label: string }): string {
  if (args.kind === "custom") {
    return PHOTO_SEAL_KO_COPY.customPresetCard;
  }
  return PHOTO_SEAL_KO_COPY.resumePhoto;
}
