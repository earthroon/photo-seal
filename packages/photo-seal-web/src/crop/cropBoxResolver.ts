import type {
  CropBoxPixelProjection,
  NormalizedRect,
  PhotoSealCropBox,
  PhotoSealDraftCropBox,
  SourceImageSize,
  SourcePixelRect,
  TargetOutputSize,
} from "./cropBoxTypes";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function clampNormalizedRect(rect: NormalizedRect): NormalizedRect {
  const width = Math.min(1, Math.max(0.000001, rect.width));
  const height = Math.min(1, Math.max(0.000001, rect.height));
  const x = clamp01(Math.min(rect.x, 1 - width));
  const y = clamp01(Math.min(rect.y, 1 - height));
  return { x, y, width, height };
}

export function projectNormalizedRectToSourcePixels(args: {
  rect: NormalizedRect;
  sourceImageSize: SourceImageSize;
}): SourcePixelRect {
  const rect = clampNormalizedRect(args.rect);
  const sourceX = Math.round(rect.x * args.sourceImageSize.widthPx);
  const sourceY = Math.round(rect.y * args.sourceImageSize.heightPx);
  const right = Math.round((rect.x + rect.width) * args.sourceImageSize.widthPx);
  const bottom = Math.round((rect.y + rect.height) * args.sourceImageSize.heightPx);
  return {
    sourceX,
    sourceY,
    sourceWidth: Math.max(1, right - sourceX),
    sourceHeight: Math.max(1, bottom - sourceY),
  };
}

export function projectCropBoxToSourcePixels(cropBox: PhotoSealCropBox): CropBoxPixelProjection {
  return {
    normalized: cropBox.rect,
    sourcePixels: projectNormalizedRectToSourcePixels({
      rect: cropBox.rect,
      sourceImageSize: cropBox.sourceImageSize,
    }),
  };
}

export function createInitialPortraitCropBox(args: {
  sourceImageSize: SourceImageSize;
  targetOutputSize: TargetOutputSize;
}): PhotoSealDraftCropBox {
  const targetAspectRatio = args.targetOutputSize.widthPx / args.targetOutputSize.heightPx;
  const sourceAspectRatio = args.sourceImageSize.widthPx / args.sourceImageSize.heightPx;

  let width = 0;
  let height = 0;

  if (sourceAspectRatio > targetAspectRatio) {
    height = 0.86;
    width = height * (targetAspectRatio / sourceAspectRatio);
  } else {
    width = 0.86;
    height = width * (sourceAspectRatio / targetAspectRatio);
  }

  const x = (1 - width) / 2;
  const y = Math.max(0, (1 - height) * 0.42);

  return {
    rect: clampNormalizedRect({ x, y, width, height }),
    sourceImageSize: args.sourceImageSize,
    targetOutputSize: args.targetOutputSize,
    targetAspectRatio,
    cropAspectRatio: targetAspectRatio,
    aspectLocked: true,
    cropOwner: "suggested",
    cropConfirmed: false,
    createdByPatch: "TDT-PHOTOSEAL-13-H3-R8",
  };
}

export function reaspectCropBoxToTarget(args: {
  cropBox: PhotoSealCropBox;
  targetOutputSize: TargetOutputSize;
}): PhotoSealDraftCropBox {
  const targetAspectRatio = args.targetOutputSize.widthPx / args.targetOutputSize.heightPx;
  const centerX = args.cropBox.rect.x + args.cropBox.rect.width / 2;
  const centerY = args.cropBox.rect.y + args.cropBox.rect.height / 2;
  const sourceAspectRatio = args.cropBox.sourceImageSize.widthPx / args.cropBox.sourceImageSize.heightPx;

  let width = args.cropBox.rect.width;
  let height = width * (sourceAspectRatio / targetAspectRatio);
  if (height > 1) {
    height = Math.min(1, args.cropBox.rect.height);
    width = height * (targetAspectRatio / sourceAspectRatio);
  }

  return {
    ...args.cropBox,
    rect: clampNormalizedRect({
      x: centerX - width / 2,
      y: centerY - height / 2,
      width,
      height,
    }),
    targetOutputSize: args.targetOutputSize,
    targetAspectRatio,
    cropAspectRatio: targetAspectRatio,
    cropOwner: "suggested",
    cropConfirmed: false,
    createdByPatch: "TDT-PHOTOSEAL-13-H3-R8",
  };
}
