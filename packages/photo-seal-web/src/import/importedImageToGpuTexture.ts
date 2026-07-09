import type { PhotoSealImportedImageSource } from "./imageImportTypes";
import { validatePhotoSealImageImportReceipt } from "./imageImportReceipt";

export type PhotoSealImportedImageGpuUploadReceipt = {
  patchId: "TDT-PHOTOSEAL-08";
  stage: "imported-image-to-webgpu-texture-srgb-upload";
  sourceImportReceiptPatchId: "TDT-PHOTOSEAL-08";
  inputColorSpace: "srgb";
  textureColorSpace: "srgb";
  textureFormat: "rgba8unorm";
  copyExternalImageToTextureUsed: true;
  canvasUploadUsed: false;
  canvasColorCorrectionUsed: false;
  width: number;
  height: number;
  hiddenGammaTransformUsed: false;
  doubleGammaDetected: false;
};

export async function uploadImportedImageToGpuTexture(args: {
  device: GPUDevice;
  imported: PhotoSealImportedImageSource;
  usage?: GPUTextureUsageFlags;
}): Promise<{
  texture: GPUTexture;
  width: number;
  height: number;
  receipt: PhotoSealImportedImageGpuUploadReceipt;
}> {
  validatePhotoSealImageImportReceipt(args.imported.receipt);
  const source = args.imported.bitmapSource ?? args.imported.imageBitmap;
  if (!source) {
    throw new Error("PhotoSeal imported image has no browser decoded bitmap source.");
  }

  const width = args.imported.width;
  const height = args.imported.height;
  const texture = args.device.createTexture({
    size: { width, height, depthOrArrayLayers: 1 },
    format: "rgba8unorm",
    usage:
      args.usage ??
      (GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.COPY_SRC |
        GPUTextureUsage.RENDER_ATTACHMENT),
    label: "tdt-photoseal-imported-image-srgb-texture",
  });

  args.device.queue.copyExternalImageToTexture(
    { source },
    { texture, colorSpace: "srgb" },
    { width, height, depthOrArrayLayers: 1 }
  );

  return {
    texture,
    width,
    height,
    receipt: {
      patchId: "TDT-PHOTOSEAL-08",
      stage: "imported-image-to-webgpu-texture-srgb-upload",
      sourceImportReceiptPatchId: "TDT-PHOTOSEAL-08",
      inputColorSpace: "srgb",
      textureColorSpace: "srgb",
      textureFormat: "rgba8unorm",
      copyExternalImageToTextureUsed: true,
      canvasUploadUsed: false,
      canvasColorCorrectionUsed: false,
      width,
      height,
      hiddenGammaTransformUsed: false,
      doubleGammaDetected: false,
    },
  };
}
