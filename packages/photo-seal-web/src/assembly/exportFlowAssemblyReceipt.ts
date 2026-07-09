import type {
  PhotoSealExportFlowBlockerCode,
  PhotoSealExportFlowStatus,
  PhotoSealExportFlowWarningCode,
} from "./exportFlowAssemblyTypes";

export type PhotoSealExportFlowAssemblyReceipt = {
  patchId: "TDT-PHOTOSEAL-13";
  stage: "export-flow-assembly-import-preset-resize-encode-save-happy-path";
  flowStatus: PhotoSealExportFlowStatus;

  importReceiptPresent: boolean;
  presetReceiptPresent: boolean;
  resizeReceiptPresent: boolean;
  bridgeReceiptPresent: boolean;
  wasmReceiptPresent: boolean;
  auditSummaryPresent: boolean;
  documentationReceiptPresent: boolean;
  saveReceiptPresent: boolean;

  importReceiptPatchId?: "TDT-PHOTOSEAL-08";
  presetReceiptPatchId?: "TDT-PHOTOSEAL-11";
  resizeReceiptPatchId?: "TDT-PHOTOSEAL-01-R1";
  bridgeReceiptPatchId?: "TDT-PHOTOSEAL-05-R1";
  wasmReceiptPatchId?: "TDT-JPEG-WASM-03-R1";
  documentationReceiptPatchId?: "TDT-PHOTOSEAL-12";
  saveReceiptPatchId?: "TDT-PHOTOSEAL-09";

  selectedPresetId?: string;
  resizeWidth?: number;
  resizeHeight?: number;
  targetBytes?: number;
  outputBytes?: number;
  reachedTarget?: boolean;

  inputColorSpace: "srgb";
  importOutputColorSpace: "srgb";
  resizeOutputColorSpace: "srgb";
  wasmInputColorSpace: "srgb";
  jpegColorSpace: "srgb";
  jpegSubsampling: "444";
  encoderOwner: "wasm-tdt-jpeg";
  wasmEncoderRequired: true;
  wasmGlueLoaded: boolean;
  wasmEncodeFunctionPresent: boolean;
  browserJpegEncodeUsed: false;
  browserJpegEncodeFallbackUsed: false;
  canvasToBlobUsed: false;
  canvasToDataUrlUsed: false;
  offscreenCanvasConvertToBlobUsed: false;
  blobUsedOnlyForWasmBytesDownload: true;

  hiddenResizePolicyUsed: false;
  hiddenTargetBytesPolicyUsed: false;
  hiddenGammaTransformUsed: false;
  doubleGammaDetected: false;
  canvasColorCorrectionUsed: false;
  workerColorTransformUsed: false;
  encoderSideResizeUsed: false;
  encoderSideCropUsed: false;

  auditBlockersCount: number;
  auditWarningsCount: number;
  flowBlockers: PhotoSealExportFlowBlockerCode[];
  flowWarnings: PhotoSealExportFlowWarningCode[];

  exportSuccessClaimed: boolean;
  saveSuccessClaimed: boolean;
  runtimePassClaimed: boolean;
  runtimeActuallyExecuted: boolean;

  staticSmokeUsedAsRuntimePass: false;
  mockReceiptUsedForSuccess: false;
  missingReceiptSuccessBlocked: true;

  defaultProfileChanged: false;
  promotedToDefault: false;
  receiptVersion: 1;
};

export function makePhotoSealExportFlowAssemblyReceipt(args: {
  flowStatus: PhotoSealExportFlowStatus;
  importReceiptPresent: boolean;
  presetReceiptPresent: boolean;
  resizeReceiptPresent: boolean;
  bridgeReceiptPresent: boolean;
  wasmReceiptPresent: boolean;
  auditSummaryPresent: boolean;
  documentationReceiptPresent: boolean;
  saveReceiptPresent?: boolean;
  selectedPresetId?: string;
  resizeWidth?: number;
  resizeHeight?: number;
  targetBytes?: number;
  outputBytes?: number;
  reachedTarget?: boolean;
  auditBlockersCount?: number;
  auditWarningsCount?: number;
  flowBlockers?: PhotoSealExportFlowBlockerCode[];
  flowWarnings?: PhotoSealExportFlowWarningCode[];
  exportSuccessClaimed?: boolean;
  saveSuccessClaimed?: boolean;
  runtimePassClaimed?: boolean;
  runtimeActuallyExecuted?: boolean;
  wasmGlueLoaded?: boolean;
  wasmEncodeFunctionPresent?: boolean;
}): PhotoSealExportFlowAssemblyReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-13",
    stage: "export-flow-assembly-import-preset-resize-encode-save-happy-path",
    flowStatus: args.flowStatus,
    importReceiptPresent: args.importReceiptPresent,
    presetReceiptPresent: args.presetReceiptPresent,
    resizeReceiptPresent: args.resizeReceiptPresent,
    bridgeReceiptPresent: args.bridgeReceiptPresent,
    wasmReceiptPresent: args.wasmReceiptPresent,
    auditSummaryPresent: args.auditSummaryPresent,
    documentationReceiptPresent: args.documentationReceiptPresent,
    saveReceiptPresent: args.saveReceiptPresent === true,
    selectedPresetId: args.selectedPresetId,
    resizeWidth: args.resizeWidth,
    resizeHeight: args.resizeHeight,
    targetBytes: args.targetBytes,
    outputBytes: args.outputBytes,
    reachedTarget: args.reachedTarget,
    inputColorSpace: "srgb",
    importOutputColorSpace: "srgb",
    resizeOutputColorSpace: "srgb",
    wasmInputColorSpace: "srgb",
    jpegColorSpace: "srgb",
    jpegSubsampling: "444",
    encoderOwner: "wasm-tdt-jpeg",
    wasmEncoderRequired: true,
    wasmGlueLoaded: args.wasmGlueLoaded === true,
    wasmEncodeFunctionPresent: args.wasmEncodeFunctionPresent === true,
    browserJpegEncodeUsed: false,
    browserJpegEncodeFallbackUsed: false,
    canvasToBlobUsed: false,
    canvasToDataUrlUsed: false,
    offscreenCanvasConvertToBlobUsed: false,
    blobUsedOnlyForWasmBytesDownload: true,
    hiddenResizePolicyUsed: false,
    hiddenTargetBytesPolicyUsed: false,
    hiddenGammaTransformUsed: false,
    doubleGammaDetected: false,
    canvasColorCorrectionUsed: false,
    workerColorTransformUsed: false,
    encoderSideResizeUsed: false,
    encoderSideCropUsed: false,
    auditBlockersCount: args.auditBlockersCount ?? 0,
    auditWarningsCount: args.auditWarningsCount ?? 0,
    flowBlockers: args.flowBlockers ?? [],
    flowWarnings: args.flowWarnings ?? [],
    exportSuccessClaimed: args.exportSuccessClaimed === true,
    saveSuccessClaimed: args.saveSuccessClaimed === true,
    runtimePassClaimed: args.runtimePassClaimed === true,
    runtimeActuallyExecuted: args.runtimeActuallyExecuted === true,
    staticSmokeUsedAsRuntimePass: false,
    mockReceiptUsedForSuccess: false,
    missingReceiptSuccessBlocked: true,
    defaultProfileChanged: false,
    promotedToDefault: false,
    receiptVersion: 1,
  };
}
