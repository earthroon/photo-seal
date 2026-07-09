import type { NormalizedPoint } from "./cropBoxTypes";

export type CropVirtualGridId = "quarter-grid" | "portrait-basic-grid";

export type CropVirtualGrid = {
  id: CropVirtualGridId;
  xGuides: number[];
  yGuides: number[];
  pointGuides: NormalizedPoint[];
};

export function makeCropVirtualGridPoints(xGuides: number[], yGuides: number[]): NormalizedPoint[] {
  return xGuides.flatMap((x) => yGuides.map((y) => ({ x, y })));
}

export const PHOTO_SEAL_QUARTER_VIRTUAL_GRID: CropVirtualGrid = {
  id: "quarter-grid",
  xGuides: [0.25, 0.5, 0.75],
  yGuides: [0.25, 0.5, 0.75],
  pointGuides: makeCropVirtualGridPoints([0.25, 0.5, 0.75], [0.25, 0.5, 0.75]),
};

export const TDT_PHOTOSEAL_R8_VIRTUAL_GRID_SNAP_SEAL =
  "Normalized Virtual Grid Snap: content-aware crop authority is forbidden; xGuides/yGuides own snap geometry.";
