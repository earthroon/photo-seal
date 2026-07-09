import type { PhotoSealCropBox } from "./cropBoxTypes";

export type PhotoSealCropBoundsGuardResult =
  | { ok: true }
  | { ok: false; code: "CROP_BOX_OUT_OF_BOUNDS" | "CROP_BOX_EMPTY"; message: string };

export function assertCropBoundsGuard(cropBox: PhotoSealCropBox): PhotoSealCropBoundsGuardResult {
  const { x, y, width, height } = cropBox.rect;
  if (width <= 0 || height <= 0) {
    return { ok: false, code: "CROP_BOX_EMPTY", message: "크롭 박스가 비어 있습니다." };
  }
  if (x < 0 || y < 0 || x + width > 1 || y + height > 1) {
    return { ok: false, code: "CROP_BOX_OUT_OF_BOUNDS", message: "크롭 박스가 이미지 영역 밖으로 벗어났습니다." };
  }
  return { ok: true };
}
