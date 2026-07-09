import type { PhotoSealJpegEncoderAuthoritySeal } from "./wasmEncoderAuthority";

export type JpegSubsampling = "444";

export type PhotoSealColorSpace = "srgb";

export type JpegCompressionMode = "explicit-quality" | "compression-ratio-hint";

export type JpegCompressionEffort = "fast" | "balanced" | "max";

export type JpegCompressionControl = {
  mode: JpegCompressionMode;
  quality: number;
  compressionRatioHint?: number;
  effort: JpegCompressionEffort;
  progressive: boolean;
  optimizeHuffman: boolean;
  subsampling: JpegSubsampling;
};

export type CompressionSearchStrategy =
  | "quality-binary"
  | "quality-ladder"
  | "supplied-handles";

export type CompressionSearchPlan = {
  strategy: CompressionSearchStrategy;
  minQuality: number;
  maxQuality: number;
  initialQuality: number;
  maxAttempts: number;
  effort: JpegCompressionEffort;
  progressiveAllowed: boolean;
  optimizeHuffmanAllowed: boolean;
  subsampling: JpegSubsampling;
  suppliedHandles?: JpegCompressionControl[];
};

export type CompressionHandleUiState = {
  targetKB: number;
  qualityFloor: number;
  qualityCeil: number;
  initialQuality: number;
  maxAttempts: number;
  effort: JpegCompressionEffort;
  progressive: boolean;
  optimizeHuffman: boolean;
  strategy: CompressionSearchStrategy;
  suppliedHandles?: JpegCompressionControl[];
};

export type JpegSamplingAudit = {
  yH: 1;
  yV: 1;
  cbH: 1;
  cbV: 1;
  crH: 1;
  crV: 1;
  is444: true;
};

export type JpegColorPipelineSeal = {
  inputColorSpace: "srgb";
  rgbColorSpace: "srgb";
  encodedColorSpace: "srgb";
  gammaTransformUsed: false;
  hiddenLinearizationUsed: false;
  doubleGammaDetected: false;
};

export type JpegCompressionAttempt = {
  index: number;
  control: JpegCompressionControl;
  sizeBytes: number;
  reachedTarget: boolean;
  samplingAudit: JpegSamplingAudit;
  colorPipeline: JpegColorPipelineSeal;
};

export type Jpeg444EncodeWasmRequest = {
  rgba: Uint8Array;
  width: number;
  height: number;
  alphaPolicy: "white-composite" | "discard";
  compression: JpegCompressionControl;
  inputColorSpace: PhotoSealColorSpace;
};

export type Jpeg444EncodeWasmReceipt = {
  patchId: "TDT-JPEG-WASM-02-R2";
  stage: "jpeg-444-variable-compression-srgb-output-seal";
  inputColorSpace: "srgb";
  rgbColorSpace: "srgb";
  encodedColorSpace: "srgb";
  gammaTransformUsed: false;
  hiddenLinearizationUsed: false;
  doubleGammaDetected: false;
  subsampling: "444";
  jpegMagicValid: true;
  samplingAuditIs444: true;
  resizedInsideEncoder: false;
  cropInsideEncoder: false;
  fallbackUsed: false;
};

export type Jpeg444TargetBytesWasmReceipt = {
  patchId: "TDT-JPEG-WASM-03-R1";
  encoderOwner?: "wasm-tdt-jpeg";
  browserJpegEncodeUsed?: false;
  browserJpegEncodeFallbackUsed?: false;
  stage: "target-bytes-compression-handle-search-srgb-seal";
  targetBytes: number;
  outputBytes: number;
  reachedTarget: boolean;
  selectedColorPipeline: JpegColorPipelineSeal;
  searchStrategy: CompressionSearchStrategy;
  compressionHandleSearchUsed: true;
  targetBytesUsed: true;
  qualitySearchUsed: true;
  subsampling: JpegSubsampling;
  inputColorSpace: "srgb";
  encodedColorSpace: "srgb";
  gammaTransformUsed: false;
  hiddenLinearizationUsed: false;
  doubleGammaDetected: false;
  resizedInsideEncoder: false;
  cropInsideEncoder: false;
  fallbackUsed: false;
};

export type Jpeg444TargetBytesWasmRequest = {
  rgba: Uint8Array;
  width: number;
  height: number;
  targetBytes: number;
  alphaPolicy: "white-composite" | "discard";
  searchPlan: CompressionSearchPlan;
  inputColorSpace: "srgb";
};

export type Jpeg444TargetBytesWasmResult = {
  encoderAuthority: PhotoSealJpegEncoderAuthoritySeal;
  encoderOwner: "wasm-tdt-jpeg";
  browserJpegEncodeUsed: false;
  browserJpegEncodeFallbackUsed: false;
  jpg: Uint8Array;
  width: number;
  height: number;
  sizeBytes: number;
  reachedTarget: boolean;
  selectedControl: JpegCompressionControl;
  selectedColorPipeline: JpegColorPipelineSeal;
  attempts: JpegCompressionAttempt[];
  receipt: Jpeg444TargetBytesWasmReceipt;
};

export function assertCompressionSearchPlan(plan: CompressionSearchPlan): void {
  const qualities = [plan.minQuality, plan.maxQuality, plan.initialQuality];
  for (const quality of qualities) {
    if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
      throw new Error(`Invalid PhotoSeal JPEG quality value: ${quality}`);
    }
  }

  if (plan.minQuality > plan.maxQuality) {
    throw new Error("PhotoSeal compression search quality floor exceeds quality ceiling.");
  }

  if (plan.initialQuality < plan.minQuality || plan.initialQuality > plan.maxQuality) {
    throw new Error("PhotoSeal compression initial quality is outside the search range.");
  }

  if (!Number.isInteger(plan.maxAttempts) || plan.maxAttempts <= 0 || plan.maxAttempts > 16) {
    throw new Error("PhotoSeal compression maxAttempts must be in 1..=16.");
  }

  if (plan.subsampling !== "444") {
    throw new Error("PhotoSeal JPEG bridge requires subsampling: \"444\".");
  }

  if (plan.strategy === "supplied-handles") {
    if (!plan.suppliedHandles || plan.suppliedHandles.length === 0) {
      throw new Error("PhotoSeal supplied-handles strategy requires at least one handle.");
    }
    if (plan.suppliedHandles.length > plan.maxAttempts) {
      throw new Error("PhotoSeal supplied handle count exceeds maxAttempts.");
    }
    for (const handle of plan.suppliedHandles) {
      assertJpegCompressionControl(handle);
    }
  }
}

export function assertJpegCompressionControl(control: JpegCompressionControl): void {
  if (!Number.isInteger(control.quality) || control.quality < 1 || control.quality > 100) {
    throw new Error(`Invalid PhotoSeal JPEG compression quality: ${control.quality}`);
  }
  if (control.subsampling !== "444") {
    throw new Error("PhotoSeal JPEG compression control requires subsampling: \"444\".");
  }
  if (
    control.compressionRatioHint !== undefined &&
    (!(control.compressionRatioHint > 0) || control.compressionRatioHint > 1)
  ) {
    throw new Error("PhotoSeal compressionRatioHint must be in (0, 1].");
  }
}
