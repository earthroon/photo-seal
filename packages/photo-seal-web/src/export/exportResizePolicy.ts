import type { PhotoSealExportPreset } from "../preset/exportPresetTypes";

export type PhotoSealResolvedPresetKind =
  | "portrait_resume_photo"
  | "custom"
  | "generic";

export type PhotoSealAntiRingingMode =
  | "standard"
  | "strict"
  | "strict-lowpass-authority";

export type PhotoSealResizeAuthority = "lowpass" | "recompose";

export type PhotoSealResidualClampMode =
  | "none"
  | "portrait-strict";

export type PhotoSealKernelProfile =
  | "export-ewa"
  | "export-ewa-portrait-lowpass";

export type PhotoSealExportResizePolicy = {
  patchId: "TDT-PHOTOSEAL-13-H3-R6";
  policySeal: "Severe Downscale Lowpass Authority / Portrait Anti-Ringing Policy / No Halo Edge Overshoot Seal";
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
  scaleRatioX: number;
  scaleRatioY: number;
  severeDownscaleThreshold: 4;
  severeDownscale: boolean;
  presetKind: PhotoSealResolvedPresetKind;
  antiRingingMode: PhotoSealAntiRingingMode;
  resizeAuthority: PhotoSealResizeAuthority;
  recomposeEnabled: boolean;
  recomposeStrength: number;
  residualClampMode: PhotoSealResidualClampMode;
  kernelProfile: PhotoSealKernelProfile;
  filterRadiusScale: number;
  hiddenSharpeningAllowed: false;
  silentPolicyFallbackAllowed: false;
};

const PORTRAIT_RESUME_DIMENSIONS = new Set(["300x400", "354x472", "413x531", "600x800"]);

function clampRadiusScale(scale: number): number {
  if (scale >= 8.0) return 1.35;
  if (scale >= 6.0) return 1.25;
  if (scale >= 4.0) return 1.15;
  return 1.0;
}

function resolvePresetKind(args: {
  preset?: PhotoSealExportPreset;
  targetWidth: number;
  targetHeight: number;
}): PhotoSealResolvedPresetKind {
  const dimensionKey = `${args.targetWidth}x${args.targetHeight}`;
  if (args.preset?.kind === "resume-photo" || PORTRAIT_RESUME_DIMENSIONS.has(dimensionKey)) {
    return "portrait_resume_photo";
  }
  if (args.preset?.kind === "custom") {
    return "custom";
  }
  return "generic";
}

export function resolvePhotoSealExportResizePolicy(args: {
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
  preset?: PhotoSealExportPreset;
}): PhotoSealExportResizePolicy {
  const scaleRatioX = args.sourceWidth / Math.max(1, args.targetWidth);
  const scaleRatioY = args.sourceHeight / Math.max(1, args.targetHeight);
  const maxScaleRatio = Math.max(scaleRatioX, scaleRatioY);
  const severeDownscale = maxScaleRatio >= 4.0;
  const presetKind = resolvePresetKind(args);
  const portraitStrict = presetKind === "portrait_resume_photo";
  const lowpassAuthority = portraitStrict && severeDownscale;

  return {
    patchId: "TDT-PHOTOSEAL-13-H3-R6",
    policySeal: "Severe Downscale Lowpass Authority / Portrait Anti-Ringing Policy / No Halo Edge Overshoot Seal",
    sourceWidth: args.sourceWidth,
    sourceHeight: args.sourceHeight,
    targetWidth: args.targetWidth,
    targetHeight: args.targetHeight,
    scaleRatioX,
    scaleRatioY,
    severeDownscaleThreshold: 4,
    severeDownscale,
    presetKind,
    antiRingingMode: lowpassAuthority
      ? "strict-lowpass-authority"
      : portraitStrict
        ? "strict"
        : "standard",
    resizeAuthority: lowpassAuthority ? "lowpass" : "recompose",
    recomposeEnabled: lowpassAuthority ? false : true,
    recomposeStrength: lowpassAuthority ? 0.0 : 0.18,
    residualClampMode: lowpassAuthority ? "portrait-strict" : "none",
    kernelProfile: lowpassAuthority ? "export-ewa-portrait-lowpass" : "export-ewa",
    filterRadiusScale: clampRadiusScale(maxScaleRatio),
    hiddenSharpeningAllowed: false,
    silentPolicyFallbackAllowed: false,
  };
}

export function createDefaultPhotoSealExportResizePolicy(args: {
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
}): PhotoSealExportResizePolicy {
  return resolvePhotoSealExportResizePolicy(args);
}

export function assertNoSilentPhotoSealResizePolicyFallback(policy: PhotoSealExportResizePolicy): void {
  if (policy.hiddenSharpeningAllowed !== false || policy.silentPolicyFallbackAllowed !== false) {
    throw new Error("FAIL_TDT_PHOTOSEAL_13_H3_R6_NO_SILENT_RESIZE_POLICY_FALLBACK");
  }

  if (policy.presetKind === "portrait_resume_photo" && policy.severeDownscale) {
    const invalid =
      policy.resizeAuthority !== "lowpass" ||
      policy.antiRingingMode !== "strict-lowpass-authority" ||
      policy.recomposeEnabled !== false ||
      policy.recomposeStrength !== 0.0 ||
      policy.residualClampMode !== "portrait-strict";

    if (invalid) {
      throw new Error("FAIL_TDT_PHOTOSEAL_13_H3_R6_PORTRAIT_LOWPASS_AUTHORITY_POLICY");
    }
  }
}
