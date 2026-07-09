import { clampNormalizedRect } from "./cropBoxResolver";
import type { NormalizedRect } from "./cropBoxTypes";
import type { CropAnchorId, CropAnchorSet, CropSnapInput, CropSnapResult, CropSnapTarget } from "./cropSnapTypes";

export function getCropAnchors(rect: NormalizedRect): CropAnchorSet {
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;

  return {
    center: { x: centerX, y: centerY },
    topCenter: { x: centerX, y: top },
    bottomCenter: { x: centerX, y: bottom },
    leftCenter: { x: left, y: centerY },
    rightCenter: { x: right, y: centerY },
    topLeft: { x: left, y: top },
    topRight: { x: right, y: top },
    bottomLeft: { x: left, y: bottom },
    bottomRight: { x: right, y: bottom },
  };
}

export function resolveCropSnap(input: CropSnapInput): CropSnapResult {
  if (!input.policy.enabled || input.modifierState.altKey) {
    return {
      snapped: false,
      nextCropBox: input.draftCropBox,
      snapMode: "none",
      snapAnchor: "none",
      snapTarget: null,
      axisSnapX: false,
      axisSnapY: false,
      pointSnap: false,
      snapOverrideUsed: input.modifierState.altKey,
    };
  }

  const anchors = getCropAnchors(input.draftCropBox.rect);
  const anchorId: CropAnchorId = input.policy.preferCenterAnchor ? "center" : "topCenter";
  const anchor = anchors[anchorId];
  const thresholdNormalizedX = Math.max(input.policy.snapNormalizedMin, input.policy.snapScreenPx / Math.max(1, input.imageDisplayRect.width));
  const thresholdNormalizedY = Math.max(input.policy.snapNormalizedMin, input.policy.snapScreenPx / Math.max(1, input.imageDisplayRect.height));

  let nextRect = { ...input.draftCropBox.rect };
  let axisSnapX = false;
  let axisSnapY = false;
  let snapTarget: CropSnapTarget | null = null;

  for (const xGuide of input.virtualGrid.xGuides) {
    if (Math.abs(anchor.x - xGuide) <= thresholdNormalizedX) {
      const dx = xGuide - anchor.x;
      nextRect = { ...nextRect, x: nextRect.x + dx };
      axisSnapX = true;
      snapTarget = { kind: "virtual-grid-x-guide", guideId: `x-${xGuide}`, x: xGuide };
      break;
    }
  }

  for (const yGuide of input.virtualGrid.yGuides) {
    if (Math.abs(anchor.y - yGuide) <= thresholdNormalizedY) {
      const dy = yGuide - anchor.y;
      nextRect = { ...nextRect, y: nextRect.y + dy };
      axisSnapY = true;
      snapTarget = { kind: "virtual-grid-y-guide", guideId: `y-${yGuide}`, y: yGuide };
      break;
    }
  }

  const snapped = axisSnapX || axisSnapY;
  const nextCropBox = {
    ...input.draftCropBox,
    rect: clampNormalizedRect(nextRect),
    cropOwner: "user" as const,
    cropConfirmed: false as const,
  };

  return {
    snapped,
    nextCropBox,
    snapMode: axisSnapX && axisSnapY ? "axis-both" : axisSnapX ? "axis-x" : axisSnapY ? "axis-y" : "none",
    snapAnchor: snapped ? anchorId : "none",
    snapTarget,
    axisSnapX,
    axisSnapY,
    pointSnap: false,
    snapOverrideUsed: false,
  };
}

export const TDT_PHOTOSEAL_R8_SNAP_AUTHORITY_SEAL =
  'snapAuthority: "assist-only"; cropConfirmedByUser remains required. CROP_REQUIRED_BUT_MISSING is not bypassed by snap.';
