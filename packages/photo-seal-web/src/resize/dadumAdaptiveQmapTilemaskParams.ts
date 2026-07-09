export type DadumAdaptiveQmapTilemaskParams = {
  profile: "dadum-adaptive-qmap-tilemask";

  qmapEnabled: true;
  tileMaskEnabled: true;
  adaptiveEwaEnabled: true;

  anisoEnabled: boolean;
  fastPassEnabled: boolean;

  radiusMul: number;
  sigma: number;
  detailMix: number;
  edgeBoost: number;
  majorBoost: number;
  minorClamp: number;

  qmapK0: number;
  qmapK1: number;
  qmapGammaK: number;
  qmapLodLevels: number;
  qmapLodMaxMix: number;

  tilePx: number;
  tileMaskThreshold: number;
  tileMaskSoftness: number;
  tileMaskThresholdLo: number;
  tileMaskThresholdHi: number;

  fastMode: "bilinear" | "box";
  anisoAngle: number;
  anisoAspect: number;

  deThresh: number;
  deSoft: number;
  deK: number;
  deK1Scale: number;
  deThresh1Add: number;
  deSoft1Mul: number;

  inputColorSpace: "srgb";
  outputColorSpace: "srgb";
  oklabMetricLocalOnly: true;
};

export const DEFAULT_DADUM_ADAPTIVE_QMAP_TILEMASK_PARAMS: DadumAdaptiveQmapTilemaskParams = {
  profile: "dadum-adaptive-qmap-tilemask",
  qmapEnabled: true,
  tileMaskEnabled: true,
  adaptiveEwaEnabled: true,
  anisoEnabled: false,
  fastPassEnabled: true,
  radiusMul: 1.5,
  sigma: 0.65,
  detailMix: 0.0,
  edgeBoost: 0.0,
  majorBoost: 1.0,
  minorClamp: 1.0,
  qmapK0: 0.08,
  qmapK1: 0.35,
  qmapGammaK: 1.0,
  qmapLodLevels: 1,
  qmapLodMaxMix: 0.7,
  tilePx: 32,
  tileMaskThreshold: 0.35,
  tileMaskSoftness: 0.18,
  tileMaskThresholdLo: 0.17,
  tileMaskThresholdHi: 0.35,
  fastMode: "box",
  anisoAngle: 0.0,
  anisoAspect: 1.0,
  deThresh: 0.0,
  deSoft: 0.25,
  deK: 1.0,
  deK1Scale: 0.25,
  deThresh1Add: 0.08,
  deSoft1Mul: 1.3,
  inputColorSpace: "srgb",
  outputColorSpace: "srgb",
  oklabMetricLocalOnly: true,
};

export function normalizeDadumAdaptiveQmapTilemaskParams(
  params: Partial<DadumAdaptiveQmapTilemaskParams> | undefined
): DadumAdaptiveQmapTilemaskParams {
  return {
    ...DEFAULT_DADUM_ADAPTIVE_QMAP_TILEMASK_PARAMS,
    ...(params ?? {}),
    profile: "dadum-adaptive-qmap-tilemask",
    qmapEnabled: true,
    tileMaskEnabled: true,
    adaptiveEwaEnabled: true,
    inputColorSpace: "srgb",
    outputColorSpace: "srgb",
    oklabMetricLocalOnly: true,
  };
}

function assertFinitePositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`INVALID_DADUM_ADAPTIVE_QMAP_TILEMASK_PARAMS: ${name} must be positive.`);
  }
}

function assertFiniteNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`INVALID_DADUM_ADAPTIVE_QMAP_TILEMASK_PARAMS: ${name} must be non-negative.`);
  }
}

export function validateDadumAdaptiveQmapTilemaskParams(
  params: DadumAdaptiveQmapTilemaskParams
): void {
  if (params.profile !== "dadum-adaptive-qmap-tilemask") {
    throw new Error("INVALID_DADUM_ADAPTIVE_QMAP_TILEMASK_PARAMS: profile must be dadum-adaptive-qmap-tilemask.");
  }
  if (params.qmapEnabled !== true || params.tileMaskEnabled !== true || params.adaptiveEwaEnabled !== true) {
    throw new Error("INVALID_DADUM_ADAPTIVE_QMAP_TILEMASK_PARAMS: qmap/tileMask/adaptive EWA are mandatory for full-chain candidate trust.");
  }
  if (params.inputColorSpace !== "srgb" || params.outputColorSpace !== "srgb") {
    throw new Error("INVALID_DADUM_ADAPTIVE_QMAP_TILEMASK_PARAMS: sRGB input/output is sealed by TDT-PHOTOSEAL-00-R2.");
  }
  if (params.oklabMetricLocalOnly !== true) {
    throw new Error("INVALID_DADUM_ADAPTIVE_QMAP_TILEMASK_PARAMS: OKLab must remain metric-local only.");
  }
  assertFinitePositive("radiusMul", params.radiusMul);
  assertFinitePositive("sigma", params.sigma);
  assertFinitePositive("qmapK1", params.qmapK1);
  assertFinitePositive("tilePx", params.tilePx);
  assertFiniteNonNegative("qmapK0", params.qmapK0);
  assertFiniteNonNegative("qmapGammaK", params.qmapGammaK);
  assertFiniteNonNegative("qmapLodMaxMix", params.qmapLodMaxMix);
  assertFiniteNonNegative("tileMaskThreshold", params.tileMaskThreshold);
  assertFiniteNonNegative("tileMaskSoftness", params.tileMaskSoftness);
  assertFinitePositive("anisoAspect", params.anisoAspect);
  assertFiniteNonNegative("deSoft", params.deSoft);
  assertFiniteNonNegative("deK", params.deK);
}
