export type PhotoSealClipboardRuntimeProbeResult = {
  clipboardRuntimeAvailable: boolean;
  clipboardWriteAttempted: boolean;
  clipboardWriteResolved: boolean;
  clipboardWriteRejected: boolean;
  clipboardUnsupported: boolean;
  clipboardProbeStatus: "copied" | "failed" | "unsupported";
  clipboardFalseSuccessDetected: false;
  message: string;
};

export async function probeInstitutionNoteClipboardCopy(args: {
  noteText: string;
}): Promise<PhotoSealClipboardRuntimeProbeResult> {
  if (args.noteText.trim().length === 0) {
    return {
      clipboardRuntimeAvailable: false,
      clipboardWriteAttempted: false,
      clipboardWriteResolved: false,
      clipboardWriteRejected: false,
      clipboardUnsupported: true,
      clipboardProbeStatus: "unsupported",
      clipboardFalseSuccessDetected: false,
      message: "Institution note text is empty.",
    };
  }
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return {
      clipboardRuntimeAvailable: false,
      clipboardWriteAttempted: false,
      clipboardWriteResolved: false,
      clipboardWriteRejected: false,
      clipboardUnsupported: true,
      clipboardProbeStatus: "unsupported",
      clipboardFalseSuccessDetected: false,
      message: "Clipboard writeText is unavailable.",
    };
  }
  try {
    await navigator.clipboard.writeText(args.noteText);
    return {
      clipboardRuntimeAvailable: true,
      clipboardWriteAttempted: true,
      clipboardWriteResolved: true,
      clipboardWriteRejected: false,
      clipboardUnsupported: false,
      clipboardProbeStatus: "copied",
      clipboardFalseSuccessDetected: false,
      message: "Institution note copied.",
    };
  } catch (error) {
    return {
      clipboardRuntimeAvailable: true,
      clipboardWriteAttempted: true,
      clipboardWriteResolved: false,
      clipboardWriteRejected: true,
      clipboardUnsupported: false,
      clipboardProbeStatus: "failed",
      clipboardFalseSuccessDetected: false,
      message: error instanceof Error ? error.message : "Clipboard write failed.",
    };
  }
}
