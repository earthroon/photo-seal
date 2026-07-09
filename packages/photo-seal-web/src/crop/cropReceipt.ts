import { CROP_ASPECT_EPSILON, assertCropAspectGuard } from "./cropAspectGuard";
import { assertCropBoundsGuard } from "./cropBoundsGuard";
import { projectCropBoxToSourcePixels } from "./cropBoxResolver";
import type { PhotoSealCropBox, NormalizedRect, SourceImageSize, SourcePixelRect, TargetOutputSize } from "./cropBoxTypes";
import type { CropAnchorId, CropSnapMode, CropSnapResult, CropSnapTarget } from "./cropSnapTypes";
import type { CropVirtualGridId } from "./cropVirtualGrid";
import { PHOTO_SEAL_QUARTER_VIRTUAL_GRID } from "./cropVirtualGrid";

export type PhotoSealCropSnapReceipt = {
  snapEnabled: boolean;
  snapApplied: boolean;
  snapMode: CropSnapMode;
  snapAnchor: CropAnchorId | "none";
  snapTarget: CropSnapTarget | null;
  snapThresholdScreenPx: number;
  snapOverrideUsed: boolean;
  snapAuthority: "assist-only";
};

export type PhotoSealCropReceipt = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8";
  cropRequired: boolean;
  cropConfirmed: boolean;
  cropOwner: "user";
  cropMethod: "manual-crop-box";
  sourceImageSize: SourceImageSize;
  targetOutputSize: TargetOutputSize;
  cropRectNormalized: NormalizedRect;
  cropRectSourcePixels: SourcePixelRect;
  targetAspectRatio: number;
  cropAspectRatio: number;
  aspectGuardPassed: true;
  aspectEpsilon: number;
  virtualGrid: { id: CropVirtualGridId; xGuides: number[]; yGuides: number[] };
  snap: PhotoSealCropSnapReceipt;
  officialInstitutionComplianceClaimed: false;
  encoderSideCropUsed: false;
  resizeSideSilentCropUsed: false;
  hiddenCenterCropUsed: false;
};

export function buildPhotoSealCropReceipt(args: {
  cropBox: PhotoSealCropBox;
  cropRequired: boolean;
  snapResult: CropSnapResult | null;
  snapEnabled: boolean;
  snapThresholdScreenPx?: number;
}): PhotoSealCropReceipt {
  const bounds = assertCropBoundsGuard(args.cropBox);
  if (!bounds.ok) {
    throw new Error(bounds.code);
  }
  const aspect = assertCropAspectGuard({
    cropBox: args.cropBox,
    targetWidth: args.cropBox.targetOutputSize.widthPx,
    targetHeight: args.cropBox.targetOutputSize.heightPx,
  });
  if (!aspect.ok) {
    throw new Error(aspect.code);
  }
  const projection = projectCropBoxToSourcePixels(args.cropBox);
  return {
    patchId: "TDT-PHOTOSEAL-13-H3-R8",
    cropRequired: args.cropRequired,
    cropConfirmed: true,
    cropOwner: "user",
    cropMethod: "manual-crop-box",
    sourceImageSize: args.cropBox.sourceImageSize,
    targetOutputSize: args.cropBox.targetOutputSize,
    cropRectNormalized: args.cropBox.rect,
    cropRectSourcePixels: projection.sourcePixels,
    targetAspectRatio: args.cropBox.targetAspectRatio,
    cropAspectRatio: args.cropBox.cropAspectRatio,
    aspectGuardPassed: true,
    aspectEpsilon: CROP_ASPECT_EPSILON,
    virtualGrid: {
      id: PHOTO_SEAL_QUARTER_VIRTUAL_GRID.id,
      xGuides: PHOTO_SEAL_QUARTER_VIRTUAL_GRID.xGuides,
      yGuides: PHOTO_SEAL_QUARTER_VIRTUAL_GRID.yGuides,
    },
    snap: {
      snapEnabled: args.snapEnabled,
      snapApplied: args.snapResult?.snapped === true,
      snapMode: args.snapResult?.snapMode ?? "none",
      snapAnchor: args.snapResult?.snapAnchor ?? "none",
      snapTarget: args.snapResult?.snapTarget ?? null,
      snapThresholdScreenPx: args.snapThresholdScreenPx ?? 8,
      snapOverrideUsed: args.snapResult?.snapOverrideUsed === true,
      snapAuthority: "assist-only",
    },
    officialInstitutionComplianceClaimed: false,
    encoderSideCropUsed: false,
    resizeSideSilentCropUsed: false,
    hiddenCenterCropUsed: false,
  };
}

export const TDT_PHOTOSEAL_R8_NO_HIDDEN_CROP_RECEIPT_SEAL =
  "encoderSideCropUsed: false; resizeSideSilentCropUsed: false; hiddenCenterCropUsed: false; officialInstitutionComplianceClaimed: false";
