import type { PhotoSealCropBox } from "./cropBoxTypes";

export const CROP_ASPECT_EPSILON = 0.001;

export type PhotoSealCropAspectGuardResult =
  | { ok: true; targetAspectRatio: number; cropAspectRatio: number; delta: number; epsilon: number }
  | { ok: false; code: "CROP_ASPECT_MISMATCH"; targetAspectRatio: number; cropAspectRatio: number; delta: number; epsilon: number };

export function assertCropAspectGuard(args: {
  cropBox: PhotoSealCropBox;
  targetWidth: number;
  targetHeight: number;
  epsilon?: number;
}): PhotoSealCropAspectGuardResult {
  const targetAspectRatio = args.targetWidth / args.targetHeight;
  const cropAspectRatio = args.cropBox.targetAspectRatio;
  const epsilon = args.epsilon ?? CROP_ASPECT_EPSILON;
  const delta = Math.abs(cropAspectRatio - targetAspectRatio);
  if (delta <= epsilon) {
    return { ok: true, targetAspectRatio, cropAspectRatio, delta, epsilon };
  }
  return { ok: false, code: "CROP_ASPECT_MISMATCH", targetAspectRatio, cropAspectRatio, delta, epsilon };
}
