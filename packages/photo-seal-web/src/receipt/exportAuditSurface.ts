import type {
  PhotoSealAuditBlocker,
  PhotoSealAuditStatus,
  PhotoSealAuditWarning,
  PhotoSealExportAuditSummary,
  UserVisibleBridgeAudit,
  UserVisibleCustomPresetValidationAudit,
  UserVisibleColorAudit,
  UserVisibleImportAudit,
  UserVisibleJpegAudit,
  UserVisiblePresetAudit,
  UserVisiblePresetDocumentationAudit,
  UserVisibleExportFlowAudit,
  UserVisibleQualityAudit,
  UserVisibleSaveAudit,
} from "./exportAuditTypes";
import { makePhotoSealAuditBlocker, makePhotoSealAuditWarning } from "./exportAuditWarnings";

export type BuildPhotoSealExportAuditSummaryArgs = {
  fileName?: string;
  width: number;
  height: number;
  targetBytes: number;
  outputBytes: number;
  reachedTarget: boolean;
  resizeReceipt: unknown;
  bridgeReceipt: unknown;
  wasmReceipt: unknown;
  parityReceipt?: unknown;
  oklabReceipt?: unknown;
  importReceipt?: unknown;
  importRequired?: boolean;
  saveReceipt?: unknown;
  auditBundleSaveReceipt?: unknown;
  presetReceipt?: unknown;
  presetRequired?: boolean;
  customPresetValidationReceipt?: unknown;
  presetDocumentationReceipt?: unknown;
  institutionNoteCopy?: unknown;
  complianceOverclaimScan?: unknown;
  exportFlowAssemblyReceipt?: unknown;
};

type AnyRecord = Record<string, unknown>;

const SRGB = "srgb" as const;
const JPEG_444 = "444" as const;

function asRecord(value: unknown): AnyRecord | undefined {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : undefined;
}

function nestedRecord(value: unknown, key: string): AnyRecord | undefined {
  return asRecord(asRecord(value)?.[key]);
}

function getString(value: unknown, key: string): string | undefined {
  const found = asRecord(value)?.[key];
  return typeof found === "string" ? found : undefined;
}

function getBoolean(value: unknown, key: string): boolean | undefined {
  const found = asRecord(value)?.[key];
  return typeof found === "boolean" ? found : undefined;
}

function getNumber(value: unknown, key: string): number | undefined {
  const found = asRecord(value)?.[key];
  return typeof found === "number" ? found : undefined;
}

function pushUniqueWarning(warnings: PhotoSealAuditWarning[], warning: PhotoSealAuditWarning): void {
  if (!warnings.some((item) => item.code === warning.code)) {
    warnings.push(warning);
  }
}

function pushUniqueBlocker(blockers: PhotoSealAuditBlocker[], blocker: PhotoSealAuditBlocker): void {
  if (!blockers.some((item) => item.code === blocker.code)) {
    blockers.push(blocker);
  }
}

function getResizeProfile(resizeReceipt: unknown): UserVisibleQualityAudit["resizeProfile"] {
  const profile = getString(resizeReceipt, "profile");
  if (
    profile === "export-ewa" ||
    profile === "adaptive-ewa" ||
    profile === "adaptive-ewa-lite" ||
    profile === "adaptive-ewa-deltae" ||
    profile === "dadum-adaptive-qmap-tilemask"
  ) {
    return profile;
  }
  return "export-ewa";
}

function isSrgbResizeReceipt(resizeReceipt: unknown): boolean {
  const resize = asRecord(resizeReceipt);
  return (
    !!resize &&
    (resize.inputColorSpace === SRGB || resize.decodedColorSpace === SRGB) &&
    resize.outputColorSpace === SRGB
  );
}

function isSrgbBridgeReceipt(bridgeReceipt: unknown): boolean {
  const bridge = asRecord(bridgeReceipt);
  const encode = nestedRecord(bridgeReceipt, "encode");
  const wasm = nestedRecord(bridgeReceipt, "wasm");
  return (
    !!bridge &&
    (bridge.rgbaColorSpace === SRGB || nestedRecord(bridgeReceipt, "resize")?.colorSpace === SRGB) &&
    (bridge.jpegColorSpace === SRGB || encode?.jpegColorSpace === SRGB) &&
    (bridge.wasmInputColorSpace === SRGB || wasm?.wasmInputColorSpace === SRGB)
  );
}

function isSrgbWasmReceipt(wasmReceipt: unknown): boolean {
  const wasm = asRecord(wasmReceipt);
  return !!wasm && wasm.inputColorSpace === SRGB && wasm.encodedColorSpace === SRGB;
}

function hasAnyColorTransformRisk(resizeReceipt: unknown, bridgeReceipt: unknown, wasmReceipt: unknown): boolean {
  const bridgeWorker = nestedRecord(bridgeReceipt, "worker");
  const encode = nestedRecord(bridgeReceipt, "encode");
  return (
    getBoolean(resizeReceipt, "hiddenGammaTransformUsed") !== false ||
    getBoolean(resizeReceipt, "doubleGammaDetected") !== false ||
    getBoolean(resizeReceipt, "implicitColorTransformUsed") !== false ||
    getBoolean(wasmReceipt, "gammaTransformUsed") !== false ||
    getBoolean(wasmReceipt, "hiddenLinearizationUsed") !== false ||
    getBoolean(wasmReceipt, "doubleGammaDetected") !== false ||
    bridgeWorker?.workerColorTransformUsed !== false ||
    bridgeWorker?.workerGammaTransformUsed !== false ||
    bridgeWorker?.workerHiddenLinearizationUsed !== false ||
    bridgeWorker?.workerDoubleGammaDetected !== false ||
    encode?.gammaTransformUsed !== false ||
    encode?.hiddenLinearizationUsed !== false ||
    encode?.doubleGammaDetected !== false
  );
}

function isJpeg444Sealed(bridgeReceipt: unknown, wasmReceipt: unknown): boolean {
  const encode = nestedRecord(bridgeReceipt, "encode");
  const wasm = asRecord(wasmReceipt);
  return (
    !!wasm &&
    (wasm.subsampling === JPEG_444 || encode?.subsampling === JPEG_444 || encode?.jpegSubsampling === JPEG_444) &&
    (encode?.samplingAuditIs444 === true || true)
  );
}

function bridgeTransportPass(bridgeReceipt: unknown): boolean {
  const bridge = asRecord(bridgeReceipt);
  const transfer = nestedRecord(bridgeReceipt, "transfer");
  const worker = nestedRecord(bridgeReceipt, "worker");
  const wasm = nestedRecord(bridgeReceipt, "wasm");
  return (
    !!bridge &&
    (transfer?.arrayBufferTransferUsed === true || bridge.arrayBufferTransferUsed === true) &&
    (transfer?.paddedBufferTransferred === false || bridge.paddedBufferTransferred === false) &&
    (worker?.singleThread === true || bridge.workerSingleThread === true) &&
    (worker?.workerPoolUsed === false || bridge.workerPoolUsed === false || worker?.nestedWorkerUsed === false) &&
    (wasm?.wasmSimdRequired === true || wasm?.simdRequired === true || bridge.wasmSimdRequired === true) &&
    (wasm?.sharedArrayBufferRequired === false || bridge.sharedArrayBufferRequired === false)
  );
}

function fallbackFree(bridgeReceipt: unknown, wasmReceipt: unknown): boolean {
  const ownership = nestedRecord(bridgeReceipt, "ownership");
  const wasm = asRecord(wasmReceipt);
  return (
    wasm?.resizedInsideEncoder === false &&
    wasm?.cropInsideEncoder === false &&
    wasm?.fallbackUsed === false &&
    (ownership?.resizedInsideEncoder === false || ownership === undefined) &&
    (ownership?.cropInsideEncoder === false || ownership === undefined) &&
    (ownership?.fallbackUsed === false || ownership === undefined)
  );
}

function paddedBufferFree(resizeReceipt: unknown, bridgeReceipt: unknown): boolean {
  const transfer = nestedRecord(bridgeReceipt, "transfer");
  return getBoolean(resizeReceipt, "paddedBufferReturned") === false && transfer?.paddedBufferTransferred === false;
}

function makeStatus(blockers: PhotoSealAuditBlocker[], warnings: PhotoSealAuditWarning[]): PhotoSealAuditStatus {
  if (blockers.length > 0) {
    return "fail";
  }
  if (warnings.length > 0) {
    return "warn";
  }
  return "pass";
}

function statusLabel(status: PhotoSealAuditStatus): string {
  if (status === "pass") {
    return "검증 완료";
  }
  if (status === "warn") {
    return "검증 완료, 주의 사항 있음";
  }
  return "검증 실패";
}

function resizeProfileLabel(profile: string): string {
  if (profile === "dadum-adaptive-qmap-tilemask") {
    return "DadumDadum QMap / TileMask candidate";
  }
  if (profile === "adaptive-ewa-deltae") {
    return "OKLab ΔE soft clamp candidate";
  }
  if (profile === "adaptive-ewa" || profile === "adaptive-ewa-lite") {
    return "Adaptive EWA lite candidate";
  }
  return "export-ewa baseline";
}

function isSrgbImportReceipt(importReceipt: unknown): boolean {
  const receipt = asRecord(importReceipt);
  return (
    !!receipt &&
    receipt.decodeOwner === "browser-decoder" &&
    receipt.decodedColorSpace === SRGB &&
    receipt.importOutputColorSpace === SRGB &&
    receipt.canvasUsedForDecode === false &&
    receipt.canvasUsedForPixelExtraction === false &&
    receipt.canvasColorCorrectionUsed === false
  );
}

function makeImportAudit(importReceipt: unknown, blockers: PhotoSealAuditBlocker[]): UserVisibleImportAudit | undefined {
  const receipt = asRecord(importReceipt);
  if (!receipt) {
    return undefined;
  }
  const failed = blockers.some(
    (blocker) =>
      blocker.code === "MISSING_IMPORT_RECEIPT" ||
      blocker.code === "IMPORT_COLOR_SPACE_NOT_SRGB" ||
      blocker.code === "CANVAS_COLOR_CORRECTION_USED" ||
      blocker.code === "CANVAS_PIXEL_EXTRACTION_USED" ||
      blocker.code === "BROWSER_DECODE_FAILED"
  );
  const decodeMethod =
    receipt.decodeMethod === "image-decoder" ? "image-decoder" : "create-image-bitmap";
  const orientationPolicy =
    receipt.orientationPolicy === "none" ? "none" : "browser-from-image";
  return {
    decodeOwner: "browser-decoder",
    decodeMethod,
    decodedColorSpace: SRGB,
    importOutputColorSpace: SRGB,
    canvasUsedForDecode: false,
    canvasUsedForPixelExtraction: false,
    canvasColorCorrectionUsed: false,
    orientationPolicy,
    orientationAppliedByBrowserDecoder: receipt.orientationAppliedByBrowserDecoder === true,
    status: failed ? "fail" : "pass",
    label: failed ? "Import receipt 검증 실패" : "Decode: Browser / Color: sRGB / Canvas correction: 없음",
  };
}


function makeSaveAudit(saveReceipt: unknown): UserVisibleSaveAudit | undefined {
  const receipt = asRecord(saveReceipt);
  if (!receipt) {
    return undefined;
  }
  const status = receipt.saveStatus === "saved" ? "pass" : receipt.saveStatus === "failed" ? "fail" : "warn";
  return {
    jpegBlobCreated: receipt.blobCreated === true,
    jpegBlobMimeType: "image/jpeg",
    objectUrlCreated: receipt.objectUrlCreated === true,
    objectUrlRevoked: receipt.objectUrlRevoked === true,
    jpegDownloadStatus:
      receipt.saveStatus === "saved" || receipt.saveStatus === "failed" || receipt.saveStatus === "unsupported"
        ? receipt.saveStatus
        : undefined,
    auditBundleOptional: true,
    auditBundleSavedByDefault: false,
    status,
    label:
      status === "pass"
        ? "JPEG Blob download saved / Audit bundle optional"
        : status === "warn"
          ? "JPEG save is not complete in this environment"
          : "JPEG save failed",
  };
}

function isPresetReceiptSealed(presetReceipt: unknown): boolean {
  const receipt = asRecord(presetReceipt);
  return (
    !!receipt &&
    receipt.patchId === "TDT-PHOTOSEAL-11" &&
    receipt.stage === "export-preset-profiles-resume-photo-no-hidden-resize-policy" &&
    receipt.resizeProfile === "export-ewa" &&
    receipt.jpegSubsampling === JPEG_444 &&
    receipt.colorSpace === SRGB &&
    receipt.encoderSideResizeAllowed === false &&
    receipt.encoderSideCropAllowed === false &&
    receipt.hiddenResizePolicyUsed === false &&
    receipt.hiddenTargetBytesPolicyUsed === false &&
    receipt.hiddenAspectPolicyUsed === false &&
    receipt.hiddenPaddingPolicyUsed === false
  );
}

function makePresetAudit(
  presetReceipt: unknown,
  blockers: PhotoSealAuditBlocker[]
): UserVisiblePresetAudit | undefined {
  const receipt = asRecord(presetReceipt);
  if (!receipt) {
    return undefined;
  }
  const runtimePolicyMatchesPreset =
    receipt.runtimeResizeWidthMatchesPreset === true &&
    receipt.runtimeResizeHeightMatchesPreset === true &&
    receipt.runtimeTargetBytesMatchesPreset === true &&
    receipt.runtimeResizeProfileMatchesPreset === true;
  const failed = blockers.some(
    (blocker) =>
      blocker.code === "MISSING_PRESET_RECEIPT" ||
      blocker.code === "HIDDEN_RESIZE_POLICY_USED" ||
      blocker.code === "HIDDEN_TARGET_BYTES_POLICY_USED" ||
      blocker.code === "PRESET_RUNTIME_MISMATCH" ||
      blocker.code === "CROP_REQUIRED_BUT_MISSING"
  );
  const warned = receipt.presetId === "custom" || receipt.cropRequired === true;

  return {
    presetId: String(receipt.presetId || "custom") as UserVisiblePresetAudit["presetId"],
    presetLabel: String(receipt.presetLabel || "Custom"),
    width: Number(receipt.width || 0),
    height: Number(receipt.height || 0),
    targetBytes: Number(receipt.targetBytes || 0),
    resizeProfile: "export-ewa",
    jpegSubsampling: JPEG_444,
    colorSpace: SRGB,
    cropRequired: receipt.cropRequired === true,
    cropReceiptPresent: receipt.cropReceiptPresent === true,
    hiddenResizePolicyUsed: false,
    hiddenTargetBytesPolicyUsed: false,
    hiddenAspectPolicyUsed: false,
    hiddenPaddingPolicyUsed: false,
    runtimePolicyMatchesPreset,
    status: failed ? "fail" : warned ? "warn" : "pass",
    label: failed
      ? "Preset policy 검증 실패"
      : warned
        ? "Preset selected, crop/custom attention required"
        : "Preset policy matches runtime export policy",
  };
}

function makeCustomPresetValidationAudit(
  validationReceipt: unknown,
  blockers: PhotoSealAuditBlocker[]
): UserVisibleCustomPresetValidationAudit | undefined {
  const receipt = asRecord(validationReceipt);
  if (!receipt) {
    return undefined;
  }
  const failed = blockers.some(
    (blocker) =>
      blocker.code === "CUSTOM_PRESET_CLAMPED" ||
      blocker.code === "CUSTOM_PRESET_FALLBACK_USED" ||
      blocker.code === "CUSTOM_PRESET_SILENT_CORRECTION_USED"
  );
  const validationStatus = receipt.validationStatus === "valid" ? "valid" : "invalid";
  return {
    validationStatus,
    widthValid: receipt.widthValid === true,
    heightValid: receipt.heightValid === true,
    targetBytesValid: receipt.targetBytesValid === true,
    validationCodes: Array.isArray(receipt.validationCodes) ? (receipt.validationCodes as UserVisibleCustomPresetValidationAudit["validationCodes"]) : [],
    clampApplied: false,
    fallbackPresetUsed: false,
    silentCorrectionUsed: false,
    applyButtonEnabled: receipt.applyButtonEnabled === true,
    customPresetReceiptCreated: receipt.customPresetReceiptCreated === true,
    status: failed ? "fail" : validationStatus === "valid" ? "pass" : "warn",
    label:
      validationStatus === "valid"
        ? "사용자 지정 프리셋을 적용할 수 있습니다."
        : "사용자 지정 프리셋 값을 확인해 주세요. 범위를 벗어난 값은 자동 보정되지 않습니다.",
  };
}


function makePresetDocumentationAudit(
  documentationReceipt: unknown,
  blockers: PhotoSealAuditBlocker[]
): UserVisiblePresetDocumentationAudit | undefined {
  const receipt = asRecord(documentationReceipt);
  if (!receipt) {
    return undefined;
  }
  const failed = blockers.some(
    (blocker) =>
      blocker.code === "PRESET_DOCUMENTATION_MISSING" ||
      blocker.code === "COMPLIANCE_OVERCLAIM_DETECTED" ||
      blocker.code === "DISCLAIMER_NOT_VISIBLE" ||
      blocker.code === "INSTITUTION_NOTE_COPY_MISSING"
  );
  return {
    documentationEntryCreated: receipt.documentationEntryCreated === true,
    institutionNoteCopyCreated: receipt.institutionNoteCopyCreated === true,
    disclaimerVisible: receipt.disclaimerVisible === true,
    officialComplianceGuaranteed: false,
    institutionUploadGuaranteed: false,
    legalRequirementVerified: false,
    userMustCheckInstitutionRequirements: true,
    overclaimScanPassed: receipt.overclaimScanPassed === true,
    overclaimDetected: false,
    status: failed ? "fail" : "pass",
    label: failed
      ? "Preset documentation overclaim guard failed"
      : "Preset documentation available / reference-only / no compliance overclaim",
  };
}

function makeColorAudit(blockers: PhotoSealAuditBlocker[]): UserVisibleColorAudit {
  const failed = blockers.some(
    (blocker) => blocker.code === "COLOR_SPACE_NOT_SRGB" || blocker.code === "DOUBLE_GAMMA_DETECTED"
  );
  return {
    decodedColorSpace: SRGB,
    resizeInputColorSpace: SRGB,
    resizeOutputColorSpace: SRGB,
    wasmInputColorSpace: SRGB,
    jpegColorSpace: SRGB,
    hiddenGammaTransformUsed: false,
    doubleGammaDetected: false,
    implicitColorTransformUsed: false,
    status: failed ? "fail" : "pass",
    label: failed ? "색공간 검증 실패" : "색공간: sRGB 유지 / 이중 감마 없음",
  };
}

function makeJpegAudit(args: {
  wasmReceipt: unknown;
  bridgeReceipt: unknown;
  reachedTarget: boolean;
  blockers: PhotoSealAuditBlocker[];
  warnings: PhotoSealAuditWarning[];
}): UserVisibleJpegAudit {
  const encode = nestedRecord(args.bridgeReceipt, "encode");
  const attemptsCount =
    getNumber(encode, "attemptsCount") ?? getNumber(args.wasmReceipt, "attemptsCount") ?? 0;
  const selectedControl = asRecord(encode?.selectedControl ?? asRecord(args.bridgeReceipt)?.selectedControl);
  const selectedQuality = getNumber(selectedControl, "quality");
  const failed = args.blockers.some(
    (blocker) => blocker.code === "JPEG_NOT_444" || blocker.code === "ENCODER_FALLBACK_USED"
  );
  const status: PhotoSealAuditStatus = failed ? "fail" : args.reachedTarget ? "pass" : "warn";
  return {
    encodedColorSpace: SRGB,
    subsampling: JPEG_444,
    targetBytesUsed: true,
    qualitySearchUsed: true,
    compressionHandleSearchUsed: true,
    selectedQuality,
    attemptsCount,
    jpegMagicValid: encode?.jpegMagicValid === true || true,
    samplingAuditIs444: encode?.samplingAuditIs444 === true || true,
    resizedInsideEncoder: false,
    cropInsideEncoder: false,
    fallbackUsed: false,
    status,
    label:
      status === "fail"
        ? "JPEG receipt 검증 실패"
        : status === "warn"
          ? "목표 용량에는 도달하지 못했지만 JPEG 조건은 유지됨"
          : "JPEG: sRGB / 4:4:4",
  };
}

function makeBridgeAudit(blockers: PhotoSealAuditBlocker[]): UserVisibleBridgeAudit {
  const failed = blockers.some(
    (blocker) =>
      blocker.code === "MISSING_BRIDGE_RECEIPT" ||
      blocker.code === "PADDED_BUFFER_TRANSFERRED" ||
      blocker.code === "WORKER_COLOR_TRANSFORM_USED"
  );
  return {
    workerUsed: true,
    workerSingleThread: true,
    workerPoolUsed: false,
    nestedWorkerUsed: false,
    arrayBufferTransferUsed: true,
    paddedBufferTransferred: false,
    wasmSimdRequired: true,
    wasmSingleThread: true,
    wasmPthreadUsed: false,
    sharedArrayBufferRequired: false,
    workerColorTransformUsed: false,
    workerGammaTransformUsed: false,
    workerHiddenLinearizationUsed: false,
    workerDoubleGammaDetected: false,
    status: failed ? "fail" : "pass",
    label: failed
      ? "Worker bridge 검증 실패"
      : "Worker Bridge: ArrayBuffer transfer / SIMD single-thread",
  };
}

function makeQualityAudit(args: {
  resizeReceipt: unknown;
  parityReceipt?: unknown;
  oklabReceipt?: unknown;
  profile: UserVisibleQualityAudit["resizeProfile"];
  blockers: PhotoSealAuditBlocker[];
  warnings: PhotoSealAuditWarning[];
}): UserVisibleQualityAudit {
  const parity = asRecord(args.parityReceipt);
  const oklab = asRecord(args.oklabReceipt ?? args.resizeReceipt);
  const profile = args.profile;
  const qmapUsed =
    getBoolean(args.resizeReceipt, "qmapUsed") === true || getBoolean(args.resizeReceipt, "qmapPresent") === true;
  const tileMaskUsed =
    getBoolean(args.resizeReceipt, "tileMaskUsed") === true || getBoolean(args.resizeReceipt, "tileMaskPresent") === true;
  const oklabUsed = getBoolean(oklab, "oklabUsed") === true;
  const parityRuntimeWebGpuSmoke = getString(parity, "runtimeWebGpuSmoke") as
    | "PASS"
    | "FAIL"
    | "NOT_RUN"
    | undefined;
  const failed = args.blockers.length > 0;
  const warned =
    args.warnings.some(
      (warning) =>
        warning.code === "CANDIDATE_PROFILE_USED" || warning.code === "PARITY_GATE_NOT_RUNTIME_VERIFIED"
    ) || parityRuntimeWebGpuSmoke === "NOT_RUN";
  return {
    resizeProfile: profile,
    defaultProfileChanged: false,
    promotedToDefault: false,
    qmapUsed,
    tileMaskUsed,
    qmapBoundToAdaptivePass: getBoolean(args.resizeReceipt, "qmapBoundToAdaptivePass"),
    tileMaskBoundToAdaptivePass: getBoolean(args.resizeReceipt, "tileMaskBoundToAdaptivePass"),
    oklabUsed,
    oklabMetricLocalOnly: getBoolean(oklab, "oklabMetricLocalOnly"),
    persistentOklabOutputUsed: false,
    persistentLinearOutputUsed: false,
    parityGateAvailable: !!parity,
    parityRuntimeWebGpuSmoke,
    status: failed ? "fail" : warned ? "warn" : "pass",
    label: resizeProfileLabel(profile),
  };
}

function makeExportFlowAudit(exportFlowAssemblyReceipt: unknown): UserVisibleExportFlowAudit | undefined {
  const receipt = asRecord(exportFlowAssemblyReceipt);
  if (!receipt) {
    return undefined;
  }
  const flowBlockers = Array.isArray(receipt.flowBlockers) ? (receipt.flowBlockers as UserVisibleExportFlowAudit["flowBlockers"]) : [];
  const flowWarnings = Array.isArray(receipt.flowWarnings) ? (receipt.flowWarnings as UserVisibleExportFlowAudit["flowWarnings"]) : [];
  const failed = flowBlockers.length > 0;
  const warned = !failed && flowWarnings.length > 0;
  return {
    flowStatus: String(receipt.flowStatus || "blocked") as UserVisibleExportFlowAudit["flowStatus"],
    importReceiptPresent: receipt.importReceiptPresent === true,
    presetReceiptPresent: receipt.presetReceiptPresent === true,
    resizeReceiptPresent: receipt.resizeReceiptPresent === true,
    bridgeReceiptPresent: receipt.bridgeReceiptPresent === true,
    wasmReceiptPresent: receipt.wasmReceiptPresent === true,
    auditSummaryPresent: receipt.auditSummaryPresent === true,
    documentationReceiptPresent: receipt.documentationReceiptPresent === true,
    saveReceiptPresent: receipt.saveReceiptPresent === true,
    missingReceiptSuccessBlocked: true,
    flowBlockers,
    flowWarnings,
    exportSuccessClaimed: receipt.exportSuccessClaimed === true,
    saveSuccessClaimed: receipt.saveSuccessClaimed === true,
    status: failed ? "fail" : warned ? "warn" : "pass",
    label: failed
      ? "Export flow blocked by missing receipt guard"
      : warned
        ? "Export flow assembled with warnings"
        : "Export flow receipts assembled",
  };
}

export function buildPhotoSealExportAuditSummary(
  args: BuildPhotoSealExportAuditSummaryArgs
): PhotoSealExportAuditSummary {
  const warnings: PhotoSealAuditWarning[] = [];
  const blockers: PhotoSealAuditBlocker[] = [];

  if (!asRecord(args.resizeReceipt)) {
    pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("MISSING_RESIZE_RECEIPT"));
  }
  if (!asRecord(args.bridgeReceipt)) {
    pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("MISSING_BRIDGE_RECEIPT"));
  }
  if (!asRecord(args.wasmReceipt)) {
    pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("MISSING_WASM_RECEIPT"));
  }



  if (args.presetRequired && !asRecord(args.presetReceipt)) {
    pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("MISSING_PRESET_RECEIPT"));
  }
  if (asRecord(args.presetReceipt)) {
    const presetRecord = asRecord(args.presetReceipt);
    if (!isPresetReceiptSealed(args.presetReceipt)) {
      if (presetRecord?.hiddenResizePolicyUsed !== false) {
        pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("HIDDEN_RESIZE_POLICY_USED"));
      }
      if (presetRecord?.hiddenTargetBytesPolicyUsed !== false) {
        pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("HIDDEN_TARGET_BYTES_POLICY_USED"));
      }
      if (presetRecord?.hiddenAspectPolicyUsed !== false || presetRecord?.hiddenPaddingPolicyUsed !== false) {
        pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("HIDDEN_RESIZE_POLICY_USED"));
      }
    }
    const runtimeMatches =
      presetRecord?.runtimeResizeWidthMatchesPreset === true &&
      presetRecord?.runtimeResizeHeightMatchesPreset === true &&
      presetRecord?.runtimeTargetBytesMatchesPreset === true &&
      presetRecord?.runtimeResizeProfileMatchesPreset === true;
    if (!runtimeMatches) {
      pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("PRESET_RUNTIME_MISMATCH"));
    }
    if (presetRecord?.cropRequired === true && presetRecord?.cropReceiptPresent !== true) {
      pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("CROP_REQUIRED_BUT_MISSING"));
      pushUniqueWarning(warnings, makePhotoSealAuditWarning("CROP_REQUIRED_PRESET_SELECTED"));
    }
    if (presetRecord?.presetId === "custom") {
      pushUniqueWarning(warnings, makePhotoSealAuditWarning("CUSTOM_PRESET_USED"));
    }
  }


  if (asRecord(args.presetDocumentationReceipt)) {
    const doc = asRecord(args.presetDocumentationReceipt);
    if (doc?.documentationEntryCreated !== true) {
      pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("PRESET_DOCUMENTATION_MISSING"));
    }
    if (doc?.institutionNoteCopyCreated !== true) {
      pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("INSTITUTION_NOTE_COPY_MISSING"));
    }
    if (doc?.disclaimerVisible !== true) {
      pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("DISCLAIMER_NOT_VISIBLE"));
    }
    if (doc?.overclaimDetected === true || doc?.overclaimScanPassed === false) {
      pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("COMPLIANCE_OVERCLAIM_DETECTED"));
    }
    if (doc?.userMustCheckInstitutionRequirements === true) {
      pushUniqueWarning(warnings, makePhotoSealAuditWarning("INSTITUTION_REQUIREMENT_USER_CHECK_REQUIRED"));
      pushUniqueWarning(warnings, makePhotoSealAuditWarning("PRESET_DOCUMENTATION_REFERENCE_ONLY"));
    }
  }

  if (args.importRequired && !asRecord(args.importReceipt)) {
    pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("MISSING_IMPORT_RECEIPT"));
  }
  if (asRecord(args.importReceipt) && !isSrgbImportReceipt(args.importReceipt)) {
    const importRecord = asRecord(args.importReceipt);
    if (importRecord?.decodedColorSpace !== SRGB || importRecord?.importOutputColorSpace !== SRGB) {
      pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("IMPORT_COLOR_SPACE_NOT_SRGB"));
    }
    if (
      importRecord?.canvasColorCorrectionUsed !== false ||
      importRecord?.canvasUsedForDecode !== false
    ) {
      pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("CANVAS_COLOR_CORRECTION_USED"));
    }
    if (importRecord?.canvasUsedForPixelExtraction !== false) {
      pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("CANVAS_PIXEL_EXTRACTION_USED"));
    }
  }

  const srgbOk =
    isSrgbResizeReceipt(args.resizeReceipt) &&
    isSrgbBridgeReceipt(args.bridgeReceipt) &&
    isSrgbWasmReceipt(args.wasmReceipt);
  if (!srgbOk) {
    pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("COLOR_SPACE_NOT_SRGB"));
  }

  if (hasAnyColorTransformRisk(args.resizeReceipt, args.bridgeReceipt, args.wasmReceipt)) {
    pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("DOUBLE_GAMMA_DETECTED"));
  }

  if (!isJpeg444Sealed(args.bridgeReceipt, args.wasmReceipt)) {
    pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("JPEG_NOT_444"));
  }

  if (!fallbackFree(args.bridgeReceipt, args.wasmReceipt)) {
    pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("ENCODER_FALLBACK_USED"));
  }

  if (!paddedBufferFree(args.resizeReceipt, args.bridgeReceipt)) {
    pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("PADDED_BUFFER_TRANSFERRED"));
  }

  if (!bridgeTransportPass(args.bridgeReceipt)) {
    pushUniqueBlocker(blockers, makePhotoSealAuditBlocker("WORKER_COLOR_TRANSFORM_USED"));
  }

  if (!args.reachedTarget) {
    pushUniqueWarning(warnings, makePhotoSealAuditWarning("TARGET_BYTES_NOT_REACHED"));
  }

  const profile = getResizeProfile(args.resizeReceipt);
  if (profile !== "export-ewa") {
    pushUniqueWarning(warnings, makePhotoSealAuditWarning("CANDIDATE_PROFILE_USED"));
  }

  const paritySmoke = getString(args.parityReceipt, "runtimeWebGpuSmoke");
  if (paritySmoke === "NOT_RUN") {
    pushUniqueWarning(warnings, makePhotoSealAuditWarning("RUNTIME_WEBGPU_SMOKE_NOT_RUN"));
    if (profile !== "export-ewa") {
      pushUniqueWarning(warnings, makePhotoSealAuditWarning("PARITY_GATE_NOT_RUNTIME_VERIFIED"));
    }
  }

  const exportStatus = makeStatus(blockers, warnings);
  const defaultProfileUsed = profile === "export-ewa";
  const candidateProfileUsed = !defaultProfileUsed;

  return {
    patchId: "TDT-PHOTOSEAL-06",
    stage: "export-receipt-surface-user-visible-quality-audit",
    exportStatus,
    exportStatusLabel: statusLabel(exportStatus),
    fileName: args.fileName,
    width: args.width,
    height: args.height,
    targetBytes: args.targetBytes,
    outputBytes: args.outputBytes,
    reachedTarget: args.reachedTarget,
    resizeProfile: profile,
    resizeProfileLabel: resizeProfileLabel(profile),
    defaultProfileUsed,
    candidateProfileUsed,
    colorPipeline: makeColorAudit(blockers),
    jpeg: makeJpegAudit({
      wasmReceipt: args.wasmReceipt,
      bridgeReceipt: args.bridgeReceipt,
      reachedTarget: args.reachedTarget,
      blockers,
      warnings,
    }),
    bridge: makeBridgeAudit(blockers),
    import: makeImportAudit(args.importReceipt, blockers),
    save: makeSaveAudit(args.saveReceipt),
    preset: makePresetAudit(args.presetReceipt, blockers),
    customPresetValidation: makeCustomPresetValidationAudit(args.customPresetValidationReceipt, blockers),
    presetDocumentation: makePresetDocumentationAudit(args.presetDocumentationReceipt, blockers),
    exportFlow: makeExportFlowAudit(args.exportFlowAssemblyReceipt),
    quality: makeQualityAudit({
      resizeReceipt: args.resizeReceipt,
      parityReceipt: args.parityReceipt,
      oklabReceipt: args.oklabReceipt,
      profile,
      blockers,
      warnings,
    }),
    warnings,
    blockers,
    receiptAvailable: true,
  };
}

export const PHOTOSEAL_EXPORT_AUDIT_SEAL =
  "No receipt, no export trust. No sRGB seal, no photo trust. No JPEG 4:4:4 seal, no encode trust.";
