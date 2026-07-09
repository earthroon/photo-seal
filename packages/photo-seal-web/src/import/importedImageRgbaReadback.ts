import type { GPUHarnessReceipt } from "../gpu/gpuReceipt";
import { readbackRgba8Texture } from "../gpu/textureReadback";
import { uploadImportedImageToGpuTexture, type PhotoSealImportedImageGpuUploadReceipt } from "./importedImageToGpuTexture";
import type { PhotoSealImportedImageSource } from "./imageImportTypes";

export type PhotoSealImportedImageRgbaReadbackReceipt = {
  patchId: "TDT-PHOTOSEAL-13-H3";
  stage: "imported-image-webgpu-rgba8-readback-for-jpeg-export";
  sourceImportReceiptPatchId: "TDT-PHOTOSEAL-08";
  gpuUploadReceiptPatchId: "TDT-PHOTOSEAL-08";
  inputColorSpace: "srgb";
  outputColorSpace: "srgb";
  pixelFormat: "rgba8";
  width: number;
  height: number;
  bytes: number;
  copyExternalImageToTextureUsed: true;
  canvasPixelExtractionUsed: false;
  canvasColorCorrectionUsed: false;
  hiddenGammaTransformUsed: false;
  doubleGammaDetected: false;
  paddingStrippedReadback: true;
};

export type PhotoSealImportedImageRgbaReadbackResult = {
  rgba: Uint8Array;
  width: number;
  height: number;
  gpuUploadReceipt: PhotoSealImportedImageGpuUploadReceipt;
  gpuHarnessReceipt: GPUHarnessReceipt;
  receipt: PhotoSealImportedImageRgbaReadbackReceipt;
};

export async function readImportedImageAsSrgbRgba8(args: {
  device: GPUDevice;
  imported: PhotoSealImportedImageSource;
}): Promise<PhotoSealImportedImageRgbaReadbackResult> {
  const uploaded = await uploadImportedImageToGpuTexture({
    device: args.device,
    imported: args.imported,
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  try {
    const readback = await readbackRgba8Texture({
      device: args.device,
      texture: uploaded.texture,
      width: uploaded.width,
      height: uploaded.height,
      label: "tdt-photoseal-13-h3-imported-image-rgba8-readback",
    });

    return {
      rgba: readback.rgba,
      width: readback.width,
      height: readback.height,
      gpuUploadReceipt: uploaded.receipt,
      gpuHarnessReceipt: readback.receipt,
      receipt: {
        patchId: "TDT-PHOTOSEAL-13-H3",
        stage: "imported-image-webgpu-rgba8-readback-for-jpeg-export",
        sourceImportReceiptPatchId: "TDT-PHOTOSEAL-08",
        gpuUploadReceiptPatchId: "TDT-PHOTOSEAL-08",
        inputColorSpace: "srgb",
        outputColorSpace: "srgb",
        pixelFormat: "rgba8",
        width: readback.width,
        height: readback.height,
        bytes: readback.rgba.byteLength,
        copyExternalImageToTextureUsed: true,
        canvasPixelExtractionUsed: false,
        canvasColorCorrectionUsed: false,
        hiddenGammaTransformUsed: false,
        doubleGammaDetected: false,
        paddingStrippedReadback: true,
      },
    };
  } finally {
    uploaded.texture.destroy();
  }
}
