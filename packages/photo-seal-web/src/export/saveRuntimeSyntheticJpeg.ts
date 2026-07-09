export function createPhotoSealSyntheticJpegBytes(): Uint8Array {
  // Minimal JPEG-like byte stream for save-flow smoke only.
  // This is not encoder quality evidence and must not be recorded as encode runtime PASS.
  return new Uint8Array([
    0xff, 0xd8,
    0xff, 0xe0, 0x00, 0x10,
    0x4a, 0x46, 0x49, 0x46, 0x00,
    0x01, 0x01, 0x00,
    0x00, 0x01, 0x00, 0x01,
    0x00, 0x00,
    0xff, 0xd9,
  ]);
}

export const TDT_PHOTOSEAL_09_R1_SYNTHETIC_JPEG_POLICY =
  "Synthetic JPEG bytes are save-flow smoke input only; they are not encoder quality proof.";
