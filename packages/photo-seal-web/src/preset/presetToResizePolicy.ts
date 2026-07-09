import { PhotoSealExportPresetError } from "./exportPresetError";
import type { PhotoSealResizeFitPolicy } from "./exportPresetTypes";
import type { PhotoSealExportPresetReceipt } from "./exportPresetReceipt";

export type PhotoSealPresetResizePolicy = {
  width: number;
  height: number;
  targetBytes: number;
  resizeProfile: "export-ewa";
  jpegSubsampling: "444";
  colorSpace: "srgb";
  fitPolicy: PhotoSealResizeFitPolicy;
  cropRequired: boolean;
  encoderSideResizeAllowed: false;
  encoderSideCropAllowed: false;
};

export function mapPresetToResizePolicy(
  presetReceipt: PhotoSealExportPresetReceipt
): PhotoSealPresetResizePolicy {
  if (presetReceipt.hiddenResizePolicyUsed) {
    throw new PhotoSealExportPresetError("HIDDEN_RESIZE_POLICY_DETECTED", "Hidden resize policy is not allowed.");
  }
  if (presetReceipt.hiddenTargetBytesPolicyUsed) {
    throw new PhotoSealExportPresetError("HIDDEN_TARGET_BYTES_POLICY_DETECTED", "Hidden targetBytes policy is not allowed.");
  }
  if (presetReceipt.encoderSideResizeAllowed || presetReceipt.encoderSideCropAllowed) {
    throw new PhotoSealExportPresetError("HIDDEN_RESIZE_POLICY_DETECTED", "Encoder-side resize or crop is not allowed.");
  }
  if (presetReceipt.cropRequired && !presetReceipt.cropReceiptPresent) {
    throw new PhotoSealExportPresetError("CROP_REQUIRED_BUT_MISSING", "This preset requires a user crop receipt before export.");
  }
  return {
    width: presetReceipt.width,
    height: presetReceipt.height,
    targetBytes: presetReceipt.targetBytes,
    resizeProfile: "export-ewa",
    jpegSubsampling: "444",
    colorSpace: "srgb",
    fitPolicy: presetReceipt.fitPolicy,
    cropRequired: presetReceipt.cropRequired,
    encoderSideResizeAllowed: false,
    encoderSideCropAllowed: false,
  };
}
