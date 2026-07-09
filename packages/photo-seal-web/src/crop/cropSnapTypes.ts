import type { CropVirtualGridId, CropVirtualGrid } from "./cropVirtualGrid";
import type { NormalizedPoint, PhotoSealCropBox } from "./cropBoxTypes";

export type CropAnchorId =
  | "center"
  | "topCenter"
  | "bottomCenter"
  | "leftCenter"
  | "rightCenter"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";

export type CropAnchorSet = Record<CropAnchorId, NormalizedPoint>;

export type CropSnapMode = "none" | "axis-x" | "axis-y" | "axis-both" | "point";

export type CropSnapTargetKind =
  | "virtual-grid-x-guide"
  | "virtual-grid-y-guide"
  | "virtual-grid-point"
  | "image-bound";

export type CropSnapTarget = {
  kind: CropSnapTargetKind;
  guideId: string;
  x?: number;
  y?: number;
};

export type CropSnapPolicy = {
  enabled: boolean;
  virtualGridId: CropVirtualGridId;
  snapScreenPx: number;
  snapNormalizedMin: number;
  enableMoveSnap: boolean;
  enableResizeSnap: boolean;
  preferAxisSnap: boolean;
  preferCenterAnchor: boolean;
  temporaryDisableModifier: "Alt";
  toggleKey: "S";
  snapAuthority: "assist-only";
};

export type CropSnapInput = {
  draftCropBox: PhotoSealCropBox;
  virtualGrid: CropVirtualGrid;
  viewportSize: { widthPx: number; heightPx: number };
  imageDisplayRect: { x: number; y: number; width: number; height: number };
  modifierState: { altKey: boolean; shiftKey: boolean };
  policy: CropSnapPolicy;
};

export type CropSnapResult = {
  snapped: boolean;
  nextCropBox: PhotoSealCropBox;
  snapMode: CropSnapMode;
  snapAnchor: CropAnchorId | "none";
  snapTarget: CropSnapTarget | null;
  axisSnapX: boolean;
  axisSnapY: boolean;
  pointSnap: boolean;
  snapOverrideUsed: boolean;
};

export const DEFAULT_CROP_SNAP_POLICY: CropSnapPolicy = {
  enabled: true,
  virtualGridId: "quarter-grid",
  snapScreenPx: 8,
  snapNormalizedMin: 0.005,
  enableMoveSnap: true,
  enableResizeSnap: false,
  preferAxisSnap: true,
  preferCenterAnchor: true,
  temporaryDisableModifier: "Alt",
  toggleKey: "S",
  snapAuthority: "assist-only",
};
