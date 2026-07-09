import type { PhotoSealExportAuditSummary } from "../receipt/exportAuditTypes";
import type { PhotoSealSaveReason } from "./saveTypes";

export type PhotoSealJpegSaveReceipt = {
  patchId: "TDT-PHOTOSEAL-09";
  stage: "user-export-save-flow-jpeg-blob-download";
  saveTarget: "jpeg";
  saveStatus: "saved" | "failed" | "unsupported";
  saveReason: PhotoSealSaveReason;
  userActionRequired: true;
  userActionObserved: boolean;
  jpegBytesPresent: boolean;
  jpegByteLength: number;
  jpegMimeType: "image/jpeg";
  blobCreated: boolean;
  blobMimeType: "image/jpeg";
  blobByteLength: number;
  objectUrlCreated: boolean;
  objectUrlRevoked: boolean;
  anchorDownloadUsed: boolean;
  fileName: string;
  fileExtension: "jpg";
  auditSummaryPresent: boolean;
  exportStatus: "pass" | "warn" | "fail";
  inputColorSpace: "srgb";
  jpegColorSpace: "srgb";
  jpegSubsampling: "444";
  jpegBytesSource: "wasm-tdt-jpeg";
  browserJpegEncodeUsed: false;
  browserJpegEncodeFallbackUsed: false;
  blobUsedOnlyForWasmBytesDownload: true;
  hiddenGammaTransformUsed: false;
  doubleGammaDetected: false;
  workerColorTransformUsed: false;
  rawAuditBundleSavedByDefault: false;
  auditBundleOptional: true;
  saveReceiptVersion: 1;
};

export type PhotoSealAuditBundleSaveReceipt = {
  patchId: "TDT-PHOTOSEAL-09";
  stage: "audit-bundle-optional-json-save";
  saveTarget: "audit-bundle-json";
  saveStatus: "saved" | "failed" | "unsupported";
  saveReason: PhotoSealSaveReason;
  userActionRequired: true;
  userActionObserved: boolean;
  auditBundlePresent: boolean;
  rawReceiptDefaultVisible: false;
  rawAuditBundleSavedByDefault: false;
  explicitAuditBundleSaveAction: boolean;
  jsonBlobCreated: boolean;
  blobMimeType: "application/json";
  objectUrlCreated: boolean;
  objectUrlRevoked: boolean;
  anchorDownloadUsed: boolean;
  fileName: string;
  fileExtension: "json";
  containsAuditSummary: boolean;
  containsImportReceipt: boolean;
  containsResizeReceipt: boolean;
  containsBridgeReceipt: boolean;
  containsWasmReceipt: boolean;
  containsSaveReceipt: boolean;
  saveReceiptVersion: 1;
};

export function makePhotoSealJpegSaveReceipt(args: {
  saveStatus: "saved" | "failed" | "unsupported";
  saveReason: PhotoSealSaveReason;
  userActionObserved: boolean;
  jpegByteLength: number;
  blobCreated: boolean;
  blobByteLength: number;
  objectUrlCreated: boolean;
  objectUrlRevoked: boolean;
  anchorDownloadUsed: boolean;
  fileName: string;
  auditSummary?: PhotoSealExportAuditSummary;
}): PhotoSealJpegSaveReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-09",
    stage: "user-export-save-flow-jpeg-blob-download",
    saveTarget: "jpeg",
    saveStatus: args.saveStatus,
    saveReason: args.saveReason,
    userActionRequired: true,
    userActionObserved: args.userActionObserved,
    jpegBytesPresent: args.jpegByteLength > 0,
    jpegByteLength: args.jpegByteLength,
    jpegMimeType: "image/jpeg",
    blobCreated: args.blobCreated,
    blobMimeType: "image/jpeg",
    blobByteLength: args.blobByteLength,
    objectUrlCreated: args.objectUrlCreated,
    objectUrlRevoked: args.objectUrlRevoked,
    anchorDownloadUsed: args.anchorDownloadUsed,
    fileName: args.fileName,
    fileExtension: "jpg",
    auditSummaryPresent: !!args.auditSummary,
    exportStatus: args.auditSummary?.exportStatus ?? "fail",
    inputColorSpace: "srgb",
    jpegColorSpace: "srgb",
    jpegSubsampling: "444",
    jpegBytesSource: "wasm-tdt-jpeg",
    browserJpegEncodeUsed: false,
    browserJpegEncodeFallbackUsed: false,
    blobUsedOnlyForWasmBytesDownload: true,
    hiddenGammaTransformUsed: false,
    doubleGammaDetected: false,
    workerColorTransformUsed: false,
    rawAuditBundleSavedByDefault: false,
    auditBundleOptional: true,
    saveReceiptVersion: 1,
  };
}

export function makePhotoSealAuditBundleSaveReceipt(args: {
  saveStatus: "saved" | "failed" | "unsupported";
  saveReason: PhotoSealSaveReason;
  userActionObserved: boolean;
  auditBundlePresent: boolean;
  jsonBlobCreated: boolean;
  objectUrlCreated: boolean;
  objectUrlRevoked: boolean;
  anchorDownloadUsed: boolean;
  fileName: string;
  containsAuditSummary: boolean;
  containsImportReceipt: boolean;
  containsResizeReceipt: boolean;
  containsBridgeReceipt: boolean;
  containsWasmReceipt: boolean;
  containsSaveReceipt: boolean;
}): PhotoSealAuditBundleSaveReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-09",
    stage: "audit-bundle-optional-json-save",
    saveTarget: "audit-bundle-json",
    saveStatus: args.saveStatus,
    saveReason: args.saveReason,
    userActionRequired: true,
    userActionObserved: args.userActionObserved,
    auditBundlePresent: args.auditBundlePresent,
    rawReceiptDefaultVisible: false,
    rawAuditBundleSavedByDefault: false,
    explicitAuditBundleSaveAction: args.userActionObserved,
    jsonBlobCreated: args.jsonBlobCreated,
    blobMimeType: "application/json",
    objectUrlCreated: args.objectUrlCreated,
    objectUrlRevoked: args.objectUrlRevoked,
    anchorDownloadUsed: args.anchorDownloadUsed,
    fileName: args.fileName,
    fileExtension: "json",
    containsAuditSummary: args.containsAuditSummary,
    containsImportReceipt: args.containsImportReceipt,
    containsResizeReceipt: args.containsResizeReceipt,
    containsBridgeReceipt: args.containsBridgeReceipt,
    containsWasmReceipt: args.containsWasmReceipt,
    containsSaveReceipt: args.containsSaveReceipt,
    saveReceiptVersion: 1,
  };
}
