export type NormalizedUnit = number;

export type NormalizedPoint = {
  x: NormalizedUnit;
  y: NormalizedUnit;
};

export type NormalizedRect = {
  x: NormalizedUnit;
  y: NormalizedUnit;
  width: NormalizedUnit;
  height: NormalizedUnit;
};

export type SourcePixelRect = {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
};

export type SourceImageSize = {
  widthPx: number;
  heightPx: number;
};

export type TargetOutputSize = {
  widthPx: number;
  heightPx: number;
};

export type PhotoSealCropPresetAspect = {
  presetId: string;
  targetWidth: number;
  targetHeight: number;
  targetAspectRatio: number;
};

export type PhotoSealCropOwner = "suggested" | "user";

export type PhotoSealCropBox = {
  rect: NormalizedRect;
  sourceImageSize: SourceImageSize;
  targetOutputSize: TargetOutputSize;
  targetAspectRatio: number;
  cropAspectRatio: number;
  aspectLocked: true;
  cropOwner: PhotoSealCropOwner;
  cropConfirmed: boolean;
  createdByPatch: "TDT-PHOTOSEAL-13-H3-R8";
};

export type PhotoSealDraftCropBox = PhotoSealCropBox & {
  cropConfirmed: false;
};

export type PhotoSealConfirmedCropBox = PhotoSealCropBox & {
  cropOwner: "user";
  cropConfirmed: true;
};

export type CropBoxPixelProjection = {
  normalized: NormalizedRect;
  sourcePixels: SourcePixelRect;
};

export type PhotoSealResizeSamplingDomain =
  | { kind: "full-source" }
  | {
      kind: "crop-box";
      cropBox: SourcePixelRect;
      cropReceiptPatchId: "TDT-PHOTOSEAL-13-H3-R8";
    };

export const TDT_PHOTOSEAL_13_H3_R8_CROP_SSOT_SEAL =
  "TDT-PHOTOSEAL-13-H3-R8: Crop runtime SSOT is source-normalized rect. Visible crop equals export crop. No Hidden Crop Seal.";
