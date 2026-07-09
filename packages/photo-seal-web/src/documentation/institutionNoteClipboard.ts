import type { PhotoSealInstitutionNoteCopy } from "./institutionNoteCopy";

export async function copyInstitutionNoteToClipboard(args: {
  note: PhotoSealInstitutionNoteCopy;
}): Promise<{
  status: "copied" | "failed" | "unsupported";
  message: string;
}> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return { status: "unsupported", message: "Clipboard API is not available." };
  }
  try {
    await navigator.clipboard.writeText(args.note.copyText);
    return { status: "copied", message: "Institution note copied." };
  } catch (error) {
    return {
      status: "failed",
      message: error instanceof Error ? error.message : "Clipboard write failed.",
    };
  }
}
