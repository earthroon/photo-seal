export type AdaptiveEwaParams = {
  tileSize: number;
  level0ScaleThreshold: number;
  level1ScaleThreshold: number;
  maxKernelRadius: number;
  edgeSensitivity: number;
  detailBoost: number;
};

export const DEFAULT_ADAPTIVE_EWA_PARAMS: AdaptiveEwaParams = {
  tileSize: 16,
  level0ScaleThreshold: 0.75,
  level1ScaleThreshold: 0.45,
  maxKernelRadius: 3.0,
  edgeSensitivity: 0.35,
  detailBoost: 0.25,
};

export function normalizeAdaptiveEwaParams(
  params: Partial<AdaptiveEwaParams> | undefined
): AdaptiveEwaParams {
  return {
    ...DEFAULT_ADAPTIVE_EWA_PARAMS,
    ...(params ?? {}),
  };
}

export function validateAdaptiveEwaParams(params: AdaptiveEwaParams): void {
  if (!Number.isFinite(params.tileSize) || params.tileSize <= 0) {
    throw new Error("INVALID_ADAPTIVE_EWA_PARAMS: tileSize must be positive.");
  }
  if (!Number.isFinite(params.maxKernelRadius) || params.maxKernelRadius <= 0) {
    throw new Error("INVALID_ADAPTIVE_EWA_PARAMS: maxKernelRadius must be positive.");
  }
  if (!Number.isFinite(params.level0ScaleThreshold) || params.level0ScaleThreshold < 0) {
    throw new Error("INVALID_ADAPTIVE_EWA_PARAMS: level0ScaleThreshold must be non-negative.");
  }
  if (!Number.isFinite(params.level1ScaleThreshold) || params.level1ScaleThreshold < 0) {
    throw new Error("INVALID_ADAPTIVE_EWA_PARAMS: level1ScaleThreshold must be non-negative.");
  }
  if (!Number.isFinite(params.edgeSensitivity) || params.edgeSensitivity < 0) {
    throw new Error("INVALID_ADAPTIVE_EWA_PARAMS: edgeSensitivity must be non-negative.");
  }
  if (!Number.isFinite(params.detailBoost) || params.detailBoost < 0) {
    throw new Error("INVALID_ADAPTIVE_EWA_PARAMS: detailBoost must be non-negative.");
  }
}
