export const TDT_PHOTOSEAL_03_R2_PATCH_ID = "TDT-PHOTOSEAL-03-R2" as const;
export const DADUM_ADAPTIVE_QMAP_TILEMASK_PARITY_STAGE = "dadum-adaptive-qmap-tilemask-parity-gate" as const;
export const EXPORT_EWA_BASELINE_PROFILE = "export-ewa" as const;
export const DADUM_ADAPTIVE_QMAP_TILEMASK_CANDIDATE_PROFILE = "dadum-adaptive-qmap-tilemask" as const;

export type DownscaleComparisonProfile =
  | typeof EXPORT_EWA_BASELINE_PROFILE
  | typeof DADUM_ADAPTIVE_QMAP_TILEMASK_CANDIDATE_PROFILE;

export type DownscaleParityGateParams = {
  input: Uint8Array;
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  baselineProfile: typeof EXPORT_EWA_BASELINE_PROFILE;
  candidateProfile: typeof DADUM_ADAPTIVE_QMAP_TILEMASK_CANDIDATE_PROFILE;
  inputColorSpace: "srgb";
  outputColorSpace: "srgb";
  compareDeltaE: boolean;
  compareEdgeProxy: boolean;
  compareDetailProxy: boolean;
  compareByteStats: boolean;
  allowPromotion: false;
};

export const DEFAULT_DOWNSCALE_PARITY_GATE_PARAMS = {
  baselineProfile: EXPORT_EWA_BASELINE_PROFILE,
  candidateProfile: DADUM_ADAPTIVE_QMAP_TILEMASK_CANDIDATE_PROFILE,
  inputColorSpace: "srgb",
  outputColorSpace: "srgb",
  compareDeltaE: true,
  compareEdgeProxy: true,
  compareDetailProxy: true,
  compareByteStats: true,
  allowPromotion: false,
} as const;

export function validateDownscaleParityGateParams(params: DownscaleParityGateParams): void {
  const expectedInputBytes = params.inputWidth * params.inputHeight * 4;
  if (!(params.input instanceof Uint8Array)) {
    throw new Error("TDT-PHOTOSEAL-03-R2 parity gate requires Uint8Array RGBA8 input.");
  }
  if (params.input.length !== expectedInputBytes) {
    throw new Error(`TDT-PHOTOSEAL-03-R2 parity gate input length mismatch. expected=${expectedInputBytes} actual=${params.input.length}`);
  }
  if (params.baselineProfile !== EXPORT_EWA_BASELINE_PROFILE) {
    throw new Error("TDT-PHOTOSEAL-03-R2 baselineProfile must remain export-ewa.");
  }
  if (params.candidateProfile !== DADUM_ADAPTIVE_QMAP_TILEMASK_CANDIDATE_PROFILE) {
    throw new Error("TDT-PHOTOSEAL-03-R2 candidateProfile must remain dadum-adaptive-qmap-tilemask.");
  }
  if (params.inputColorSpace !== "srgb" || params.outputColorSpace !== "srgb") {
    throw new Error("TDT-PHOTOSEAL-03-R2 parity gate only accepts sRGB RGBA8 input and sRGB RGBA8 output.");
  }
  if (params.allowPromotion !== false) {
    throw new Error("TDT-PHOTOSEAL-03-R2 is a comparison receipt gate only. promotionRequiresExplicitPatch remains true.");
  }
}
