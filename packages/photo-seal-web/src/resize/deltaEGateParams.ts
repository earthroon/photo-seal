export type DeltaEGateParams = {
  enabled: boolean;
  threshold: number;
  softness: number;
  strength: number;
  referenceMode: "source-nearest" | "ewa-lowpass";
  clampMode: "soft";
};

export const RESUME_PHOTO_DELTAE_SOFT_CLAMP: DeltaEGateParams = {
  enabled: true,
  threshold: 0.035,
  softness: 0.02,
  strength: 0.35,
  referenceMode: "ewa-lowpass",
  clampMode: "soft",
};

export function normalizeDeltaEGateParams(
  params: Partial<DeltaEGateParams> | undefined
): DeltaEGateParams {
  return {
    ...RESUME_PHOTO_DELTAE_SOFT_CLAMP,
    ...(params ?? {}),
    clampMode: "soft",
  };
}

export function deltaEReferenceModeToUniform(
  mode: DeltaEGateParams["referenceMode"]
): 0 | 1 {
  return mode === "source-nearest" ? 0 : 1;
}

export function validateDeltaEGateParams(params: DeltaEGateParams): void {
  if (typeof params.enabled !== "boolean") {
    throw new Error("INVALID_DELTAE_GATE_PARAMS: enabled must be boolean.");
  }
  if (!Number.isFinite(params.threshold) || params.threshold < 0) {
    throw new Error("INVALID_DELTAE_GATE_PARAMS: threshold must be non-negative.");
  }
  if (!Number.isFinite(params.softness) || params.softness <= 0) {
    throw new Error("INVALID_DELTAE_GATE_PARAMS: softness must be positive.");
  }
  if (!Number.isFinite(params.strength) || params.strength < 0 || params.strength > 1) {
    throw new Error("INVALID_DELTAE_GATE_PARAMS: strength must be in 0..=1.");
  }
  if (params.referenceMode !== "source-nearest" && params.referenceMode !== "ewa-lowpass") {
    throw new Error("INVALID_DELTAE_GATE_PARAMS: referenceMode is invalid.");
  }
  if (params.clampMode !== "soft") {
    throw new Error("INVALID_DELTAE_GATE_PARAMS: clampMode must be soft.");
  }
}
