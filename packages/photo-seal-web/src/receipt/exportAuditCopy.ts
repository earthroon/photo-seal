import type { ExportAuditCopyStatus } from "./exportAuditInteractionTypes";
import type { PhotoSealDebugReceiptBundle, PhotoSealExportAuditSummary } from "./exportAuditTypes";

function yesNo(value: boolean): string {
  return value ? "yes" : "no";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function buildExportAuditSummaryText(audit: PhotoSealExportAuditSummary): string {
  const warningLines = audit.warnings.length === 0
    ? ["Warnings: none"]
    : ["Warnings:", ...audit.warnings.map((warning) => `- ${warning.code}: ${warning.message}`)];
  const blockerLines = audit.blockers.length === 0
    ? ["Blockers: none"]
    : ["Blockers:", ...audit.blockers.map((blocker) => `- ${blocker.code}: ${blocker.message}`)];

  return [
    "PhotoSeal Export Audit",
    `Status: ${audit.exportStatus}`,
    `Output: ${audit.width}x${audit.height}`,
    `Size: ${formatBytes(audit.outputBytes)} / ${formatBytes(audit.targetBytes)}`,
    `Target reached: ${yesNo(audit.reachedTarget)}`,
    `Resize: ${audit.resizeProfile}`,
    `Color: ${audit.colorPipeline.label}`,
    `JPEG: ${audit.jpeg.label}`,
    `Worker: ${audit.bridge.label}`,
    ...warningLines,
    ...blockerLines,
  ].join("\n");
}

export function buildDebugReceiptJsonText(bundle: PhotoSealDebugReceiptBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export async function copyTextToClipboard(text: string): Promise<ExportAuditCopyStatus> {
  const clipboard = globalThis.navigator?.clipboard;
  if (!clipboard || typeof clipboard.writeText !== "function") {
    return "unsupported";
  }

  try {
    await clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
