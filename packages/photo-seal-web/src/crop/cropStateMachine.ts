import type { PhotoSealCropReceipt } from "./cropReceipt";
import type { PhotoSealDraftCropBox, SourceImageSize, TargetOutputSize } from "./cropBoxTypes";
import type { CropSnapResult } from "./cropSnapTypes";

export type PhotoSealCropRuntimeState =
  | { tag: "idle" }
  | { tag: "image-ready"; sourceImageSize: SourceImageSize }
  | { tag: "crop-not-required" }
  | { tag: "crop-required"; reason: "resume-preset" }
  | { tag: "crop-suggested"; draftCropBox: PhotoSealDraftCropBox }
  | { tag: "crop-editing"; draftCropBox: PhotoSealDraftCropBox; dragMode: "move" | "resize-nw" | "resize-ne" | "resize-sw" | "resize-se" | "keyboard-nudge"; lastSnapResult: CropSnapResult | null }
  | { tag: "crop-invalid"; draftCropBox: PhotoSealDraftCropBox; reason: "CROP_ASPECT_MISMATCH" | "CROP_BOX_OUT_OF_BOUNDS" | "CROP_BOX_EMPTY" }
  | { tag: "crop-confirmed"; cropReceipt: PhotoSealCropReceipt }
  | { tag: "export-blocked"; blocker: "CROP_REQUIRED_BUT_MISSING" | "CROP_NOT_CONFIRMED" | "CROP_ASPECT_MISMATCH" | "CROP_BOX_OUT_OF_BOUNDS" }
  | { tag: "export-ready"; cropReceipt: PhotoSealCropReceipt | null };

export type PhotoSealCropRuntimeEvent =
  | { type: "IMAGE_IMPORTED"; sourceImageSize: SourceImageSize }
  | { type: "PRESET_SELECTED"; presetId: string; cropRequired: boolean; targetOutputSize: TargetOutputSize }
  | { type: "OPEN_CROP_MODAL" }
  | { type: "CREATE_INITIAL_CROP"; draftCropBox: PhotoSealDraftCropBox }
  | { type: "CROP_DRAFT_CHANGED"; draftCropBox: PhotoSealDraftCropBox; snapResult: CropSnapResult | null }
  | { type: "CROP_CONFIRMED"; cropReceipt: PhotoSealCropReceipt }
  | { type: "EXPORT_READINESS_CHECK" };

export const TDT_PHOTOSEAL_R8_CROP_STATE_MACHINE_SEAL =
  "App owns cropReceipt and cropModalOpen; PortraitCropModal owns draftCropBox; resize and encoder cannot create crop authority.";
