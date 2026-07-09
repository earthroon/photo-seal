import type { PhotoSealExportAuditSummary } from "../receipt/exportAuditTypes";
import { createJsonBlob, downloadBlobWithAnchor } from "./blobDownload";
import { getPhotoSealSaveErrorCode } from "./saveError";
import { sanitizePhotoSealFileName } from "./saveFileName";
import {
  makePhotoSealAuditBundleSaveReceipt,
  type PhotoSealAuditBundleSaveReceipt,
  type PhotoSealJpegSaveReceipt,
} from "./saveReceipt";
import type { PhotoSealSaveReason } from "./saveTypes";

export type PhotoSealSaveableAuditBundle = {
  auditSummary: PhotoSealExportAuditSummary;
  importReceipt?: unknown;
  resizeReceipt?: unknown;
  resizeTargetGuardReceipt?: unknown;
  bridgeReceipt?: unknown;
  wasmReceipt?: unknown;
  cropReceipt?: unknown;
  saveReceipt?: PhotoSealJpegSaveReceipt;
  generatedAt: string;
  bundleVersion: 1;
};

function statusForReason(reason: PhotoSealSaveReason): "failed" | "unsupported" {
  return reason === "BLOB_UNAVAILABLE" || reason === "OBJECT_URL_UNAVAILABLE" ? "unsupported" : "failed";
}

function makeBundleFailure(args: {
  bundle?: PhotoSealSaveableAuditBundle;
  reason: PhotoSealSaveReason;
  userActionObserved: boolean;
  fileName: string;
}): PhotoSealAuditBundleSaveReceipt {
  const bundle = args.bundle;
  return makePhotoSealAuditBundleSaveReceipt({
    saveStatus: statusForReason(args.reason),
    saveReason: args.reason,
    userActionObserved: args.userActionObserved,
    auditBundlePresent: !!bundle,
    jsonBlobCreated: false,
    objectUrlCreated: false,
    objectUrlRevoked: false,
    anchorDownloadUsed: false,
    fileName: args.fileName,
    containsAuditSummary: !!bundle?.auditSummary,
    containsImportReceipt: !!bundle?.importReceipt,
    containsResizeReceipt: !!bundle?.resizeReceipt,
    containsBridgeReceipt: !!bundle?.bridgeReceipt,
    containsWasmReceipt: !!bundle?.wasmReceipt,
    containsSaveReceipt: !!bundle?.saveReceipt,
  });
}

export function buildPhotoSealAuditBundleJson(bundle: PhotoSealSaveableAuditBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export async function savePhotoSealAuditBundleJson(args: {
  bundle: PhotoSealSaveableAuditBundle;
  sourceFileName?: string;
  userActionObserved: boolean;
}): Promise<PhotoSealAuditBundleSaveReceipt> {
  const fileName = sanitizePhotoSealFileName({
    inputName: args.sourceFileName,
    fallbackBaseName: "photoseal-export",
    extension: "json",
  }).fileName;

  if (!args.userActionObserved) {
    return makeBundleFailure({
      bundle: args.bundle,
      reason: "USER_ACTION_REQUIRED",
      userActionObserved: false,
      fileName,
    });
  }

  if (!args.bundle?.auditSummary) {
    return makeBundleFailure({
      bundle: args.bundle,
      reason: "AUDIT_BUNDLE_MISSING",
      userActionObserved: true,
      fileName,
    });
  }

  try {
    const jsonText = buildPhotoSealAuditBundleJson(args.bundle);
    const blob = createJsonBlob(jsonText);
    const download = downloadBlobWithAnchor({ blob, fileName, userActionObserved: true });
    const saved = download.objectUrlCreated && download.objectUrlRevoked && download.anchorDownloadUsed;
    return makePhotoSealAuditBundleSaveReceipt({
      saveStatus: saved ? "saved" : "failed",
      saveReason: saved ? "OK" : "DOWNLOAD_TRIGGER_FAILED",
      userActionObserved: true,
      auditBundlePresent: true,
      jsonBlobCreated: true,
      objectUrlCreated: download.objectUrlCreated,
      objectUrlRevoked: download.objectUrlRevoked,
      anchorDownloadUsed: download.anchorDownloadUsed,
      fileName,
      containsAuditSummary: true,
      containsImportReceipt: !!args.bundle.importReceipt,
      containsResizeReceipt: !!args.bundle.resizeReceipt,
      containsBridgeReceipt: !!args.bundle.bridgeReceipt,
      containsWasmReceipt: !!args.bundle.wasmReceipt,
      containsSaveReceipt: !!args.bundle.saveReceipt,
    });
  } catch (error) {
    return makeBundleFailure({
      bundle: args.bundle,
      reason: getPhotoSealSaveErrorCode(error),
      userActionObserved: true,
      fileName,
    });
  }
}
