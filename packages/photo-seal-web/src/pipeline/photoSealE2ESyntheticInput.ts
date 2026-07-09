export type PhotoSealSyntheticInput = {
  rgba: Uint8Array;
  width: number;
  height: number;
  colorSpace: "srgb";
  pattern: "resume-photo-gradient" | "edge-grid" | "alpha-corner";
};

function assertSyntheticDimension(name: string, value: number): number {
  if (!Number.isInteger(value) || value <= 0 || value > 8192) {
    throw new Error(`TDT-PHOTOSEAL-07 invalid synthetic ${name}: ${value}`);
  }
  return value;
}

export function createPhotoSealSyntheticSrgbRgba8Input(args: {
  width: number;
  height: number;
  pattern: PhotoSealSyntheticInput["pattern"];
}): PhotoSealSyntheticInput {
  const width = assertSyntheticDimension("width", args.width);
  const height = assertSyntheticDimension("height", args.height);
  const rgba = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const fx = width <= 1 ? 0 : x / (width - 1);
      const fy = height <= 1 ? 0 : y / (height - 1);
      const edge = (x % 32 < 2 || y % 32 < 2) ? 255 : 0;

      if (args.pattern === "edge-grid") {
        rgba[index] = edge;
        rgba[index + 1] = Math.round(80 + 120 * fx);
        rgba[index + 2] = Math.round(80 + 120 * fy);
        rgba[index + 3] = 255;
      } else if (args.pattern === "alpha-corner") {
        rgba[index] = Math.round(220 * fx);
        rgba[index + 1] = Math.round(220 * fy);
        rgba[index + 2] = 180;
        rgba[index + 3] = x < width / 4 && y < height / 4 ? 96 : 255;
      } else {
        rgba[index] = Math.round(192 + 48 * fx);
        rgba[index + 1] = Math.round(160 + 64 * fy);
        rgba[index + 2] = Math.round(128 + 48 * (1 - fx));
        rgba[index + 3] = 255;
      }
    }
  }

  return {
    rgba,
    width,
    height,
    colorSpace: "srgb",
    pattern: args.pattern,
  };
}

export const PHOTOSEAL_SYNTHETIC_INPUT_COLOR_CONTRACT =
  "createPhotoSealSyntheticSrgbRgba8Input returns sRGB RGBA8 only; no linear buffer, no OKLab buffer, no unknown colorSpace.";
