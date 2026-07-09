import type { PhotoSealExportResizePolicy } from "./exportResizePolicy";

export type DeltaKTangentPresetKind =
  | "portrait_resume_photo"
  | "general"
  | "unknown";

export type DeltaKTangentKernelProfile =
  | "disabled"
  | "portrait-deltak-tangent-safe"
  | "general-deltak-tangent-safe";

export type DeltaKTangentHaloClampMode =
  | "disabled"
  | "normal-minmax-strict"
  | "portrait-normal-overshoot-strict";

export type DeltaKTangentOutputClampMode =
  | "lowpass-neighborhood"
  | "source-lowpass-hybrid-neighborhood";

export type DeltaKTangentInterpolationPolicy = {
  patchId: "TDT-PHOTOSEAL-13-H3-R7";
  policySeal: "DeltaK Variable Anisotropic Tangent Tensor Interpolation / Portrait Edge-Safe Detail Recovery / No Halo Normal Overshoot Seal";
  enabled: boolean;
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
  scaleRatioX: number;
  scaleRatioY: number;
  severeDownscale: boolean;
  presetKind: DeltaKTangentPresetKind;
  resizeAuthority: "lowpass";
  baseAuthorityFromR6: true;
  deltaKEnabled: boolean;
  structureTensorEnabled: boolean;
  tangentInterpolationEnabled: boolean;
  normalOvershootRecoveryAllowed: false;
  normalResidualStrength: 0;
  tangentDetailStrength: number;
  tangentDetailMaxStrength: number;
  anisotropyThreshold: number;
  deltaKThreshold: number;
  normalClampTolerance: number;
  anisotropyConfidence: number;
  deltaKEdgeConfidence: number;
  tensorKernelProfile: DeltaKTangentKernelProfile;
  haloClampMode: DeltaKTangentHaloClampMode;
  outputClampMode: DeltaKTangentOutputClampMode;
  fallbackToR6LowpassAllowed: true;
  deltaKTangentFallbackReason: string | null;
  receiptRequired: true;
};

function mapPresetKind(kind: string): DeltaKTangentPresetKind {
  if (kind === "portrait_resume_photo") return "portrait_resume_photo";
  if (kind === "custom" || kind === "generic" || kind === "general") return "general";
  return "unknown";
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function resolveDeltaKTangentInterpolationPolicy(args: {
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
  presetKind: string;
  severeDownscale: boolean;
  resizeAuthority: string;
  r6Policy?: PhotoSealExportResizePolicy;
}): DeltaKTangentInterpolationPolicy {
  const scaleRatioX = args.sourceWidth / Math.max(1, args.targetWidth);
  const scaleRatioY = args.sourceHeight / Math.max(1, args.targetHeight);
  const presetKind = mapPresetKind(args.presetKind);
  const r6LowpassAuthority = args.resizeAuthority === "lowpass";
  const portraitSevereLowpass =
    args.severeDownscale &&
    presetKind === "portrait_resume_photo" &&
    r6LowpassAuthority;

  const anisotropyThreshold = 0.18;
  const deltaKThreshold = 0.12;
  const normalClampTolerance = 2.0 / 255.0;
  const tangentDetailStrength = portraitSevereLowpass ? 0.10 : 0.0;
  const tangentDetailMaxStrength = portraitSevereLowpass ? 0.14 : 0.0;

  const scaleSeverity = clamp01((Math.max(scaleRatioX, scaleRatioY) - 4.0) / 8.0);
  const anisotropyConfidence = portraitSevereLowpass ? 0.35 + scaleSeverity * 0.35 : 0.0;
  const deltaKEdgeConfidence = portraitSevereLowpass ? 0.24 + scaleSeverity * 0.30 : 0.0;

  return {
    patchId: "TDT-PHOTOSEAL-13-H3-R7",
    policySeal: "DeltaK Variable Anisotropic Tangent Tensor Interpolation / Portrait Edge-Safe Detail Recovery / No Halo Normal Overshoot Seal",
    enabled: portraitSevereLowpass,
    sourceWidth: args.sourceWidth,
    sourceHeight: args.sourceHeight,
    targetWidth: args.targetWidth,
    targetHeight: args.targetHeight,
    scaleRatioX,
    scaleRatioY,
    severeDownscale: args.severeDownscale,
    presetKind,
    resizeAuthority: "lowpass",
    baseAuthorityFromR6: true,
    deltaKEnabled: portraitSevereLowpass,
    structureTensorEnabled: portraitSevereLowpass,
    tangentInterpolationEnabled: portraitSevereLowpass,
    normalOvershootRecoveryAllowed: false,
    normalResidualStrength: 0,
    tangentDetailStrength,
    tangentDetailMaxStrength,
    anisotropyThreshold,
    deltaKThreshold,
    normalClampTolerance,
    anisotropyConfidence,
    deltaKEdgeConfidence,
    tensorKernelProfile: portraitSevereLowpass ? "portrait-deltak-tangent-safe" : "disabled",
    haloClampMode: portraitSevereLowpass ? "portrait-normal-overshoot-strict" : "disabled",
    outputClampMode: "lowpass-neighborhood",
    fallbackToR6LowpassAllowed: true,
    deltaKTangentFallbackReason: portraitSevereLowpass ? null : "R7_CONDITIONS_NOT_MET_R6_LOWPASS_AUTHORITY_USED",
    receiptRequired: true,
  };
}

export function resolveDeltaKTangentInterpolationPolicyFromR6(
  r6Policy: PhotoSealExportResizePolicy
): DeltaKTangentInterpolationPolicy {
  return resolveDeltaKTangentInterpolationPolicy({
    sourceWidth: r6Policy.sourceWidth,
    sourceHeight: r6Policy.sourceHeight,
    targetWidth: r6Policy.targetWidth,
    targetHeight: r6Policy.targetHeight,
    presetKind: r6Policy.presetKind,
    severeDownscale: r6Policy.severeDownscale,
    resizeAuthority: r6Policy.resizeAuthority,
    r6Policy,
  });
}

export function assertDeltaKTangentPolicySeal(policy: DeltaKTangentInterpolationPolicy): void {
  const invalid =
    policy.patchId !== "TDT-PHOTOSEAL-13-H3-R7" ||
    policy.baseAuthorityFromR6 !== true ||
    policy.resizeAuthority !== "lowpass" ||
    policy.normalOvershootRecoveryAllowed !== false ||
    policy.normalResidualStrength !== 0 ||
    policy.receiptRequired !== true;

  if (invalid) {
    throw new Error("FAIL_TDT_PHOTOSEAL_13_H3_R7_DELTAK_TANGENT_POLICY_SEAL");
  }

  if (policy.enabled) {
    const enabledInvalid =
      policy.deltaKEnabled !== true ||
      policy.structureTensorEnabled !== true ||
      policy.tangentInterpolationEnabled !== true ||
      policy.presetKind !== "portrait_resume_photo" ||
      policy.severeDownscale !== true ||
      policy.tangentDetailStrength <= 0 ||
      policy.tangentDetailStrength > policy.tangentDetailMaxStrength ||
      policy.tangentDetailMaxStrength > 0.14 ||
      policy.haloClampMode !== "portrait-normal-overshoot-strict" ||
      policy.outputClampMode !== "lowpass-neighborhood";

    if (enabledInvalid) {
      throw new Error("FAIL_TDT_PHOTOSEAL_13_H3_R7_DELTAK_TANGENT_ENABLED_POLICY");
    }
  }
}
