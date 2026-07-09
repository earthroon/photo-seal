import type { AnyPhotoSealResizeResult } from "./types";

export type PhotoSealResizeTargetGuardReceipt = {
  patchId: "TDT-PHOTOSEAL-13-H3-R4";
  stage: "resize-target-guard-before-wasm-encode";
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
  actualResizeWidth: number;
  actualResizeHeight: number;
  sourceBytes: number;
  resizedBytes: number;
  expectedResizedBytes: number;
  targetMatched: true;
  wasmReceivesResizedRgba: true;
  originalRgbaForwardedToWasm: false;
  encoderSideResizeAllowed: false;
  encoderSideResizeUsed: false;
  encoderInputWidth: number;
  encoderInputHeight: number;
  ringingSuppressionProfile: "export-ewa-lowpass-no-sharpen";
  receiptVersion: 1;
};

export function assertResizeResultMatchesTarget(args: {
  resizeResult: AnyPhotoSealResizeResult;
  sourceWidth: number;
  sourceHeight: number;
  sourceBytes: number;
  targetWidth: number;
  targetHeight: number;
}): PhotoSealResizeTargetGuardReceipt {
  const expectedBytes = args.targetWidth * args.targetHeight * 4;
  const actualBytes = args.resizeResult.rgba.byteLength;
  const mismatches: string[] = [];

  if (args.resizeResult.width !== args.targetWidth) {
    mismatches.push(`width expected=${args.targetWidth} actual=${args.resizeResult.width}`);
  }
  if (args.resizeResult.height !== args.targetHeight) {
    mismatches.push(`height expected=${args.targetHeight} actual=${args.resizeResult.height}`);
  }
  if (actualBytes !== expectedBytes) {
    mismatches.push(`rgba bytes expected=${expectedBytes} actual=${actualBytes}`);
  }

  if (mismatches.length > 0) {
    throw new Error(`RESIZE_TARGET_MISMATCH_BEFORE_WASM: ${mismatches.join("; ")}`);
  }

  return {
    patchId: "TDT-PHOTOSEAL-13-H3-R4",
    stage: "resize-target-guard-before-wasm-encode",
    sourceWidth: args.sourceWidth,
    sourceHeight: args.sourceHeight,
    targetWidth: args.targetWidth,
    targetHeight: args.targetHeight,
    actualResizeWidth: args.resizeResult.width,
    actualResizeHeight: args.resizeResult.height,
    sourceBytes: args.sourceBytes,
    resizedBytes: actualBytes,
    expectedResizedBytes: expectedBytes,
    targetMatched: true,
    wasmReceivesResizedRgba: true,
    originalRgbaForwardedToWasm: false,
    encoderSideResizeAllowed: false,
    encoderSideResizeUsed: false,
    encoderInputWidth: args.resizeResult.width,
    encoderInputHeight: args.resizeResult.height,
    ringingSuppressionProfile: "export-ewa-lowpass-no-sharpen",
    receiptVersion: 1,
  };
}
