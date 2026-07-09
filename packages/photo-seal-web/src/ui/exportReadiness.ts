import { PHOTO_SEAL_KO_COPY } from "./photoSealKoCopy";

export type PhotoSealExportReadinessStatus =
  | "ready"
  | "blocked"
  | "missing-input"
  | "missing-preset"
  | "running"
  | "exported"
  | "failed";

export type PhotoSealExportReadiness = {
  status: PhotoSealExportReadinessStatus;
  canRunExport: boolean;
  title: string;
  message: string;
  blockers: string[];
};

export function getPhotoSealExportReadiness(args: {
  importReceiptPresent: boolean;
  presetReceiptPresent: boolean;
  cropRequired: boolean;
  cropReceiptPresent: boolean;
  exportRunning: boolean;
  exported: boolean;
  failed: boolean;
}): PhotoSealExportReadiness {
  if (args.exportRunning) {
    return {
      status: "running",
      canRunExport: false,
      title: PHOTO_SEAL_KO_COPY.exportRunning,
      message: PHOTO_SEAL_KO_COPY.exportRunningMessage,
      blockers: [],
    };
  }
  if (args.exported) {
    return {
      status: "exported",
      canRunExport: true,
      title: PHOTO_SEAL_KO_COPY.exportCompleted,
      message: PHOTO_SEAL_KO_COPY.exportCompleted,
      blockers: [],
    };
  }
  if (args.failed) {
    return {
      status: "failed",
      canRunExport: true,
      title: PHOTO_SEAL_KO_COPY.exportFailed,
      message: PHOTO_SEAL_KO_COPY.exportFailed,
      blockers: [],
    };
  }
  if (!args.importReceiptPresent) {
    return {
      status: "missing-input",
      canRunExport: false,
      title: PHOTO_SEAL_KO_COPY.exportWaiting,
      message: PHOTO_SEAL_KO_COPY.importFirst,
      blockers: [PHOTO_SEAL_KO_COPY.importFirst],
    };
  }
  if (!args.presetReceiptPresent) {
    return {
      status: "missing-preset",
      canRunExport: false,
      title: PHOTO_SEAL_KO_COPY.exportWaiting,
      message: PHOTO_SEAL_KO_COPY.selectPresetFirst,
      blockers: [PHOTO_SEAL_KO_COPY.selectPresetFirst],
    };
  }
  if (args.cropRequired && !args.cropReceiptPresent) {
    return {
      status: "blocked",
      canRunExport: false,
      title: PHOTO_SEAL_KO_COPY.exportBlocked,
      message: PHOTO_SEAL_KO_COPY.cropReceiptRequired,
      blockers: [PHOTO_SEAL_KO_COPY.cropReceiptRequired],
    };
  }
  return {
    status: "ready",
    canRunExport: true,
    title: PHOTO_SEAL_KO_COPY.exportReady,
    message: PHOTO_SEAL_KO_COPY.exportReadyMessage,
    blockers: [],
  };
}
