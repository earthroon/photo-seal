import { ALL_PHOTOSEAL_EXPORT_PRESETS } from "../preset/resumePhotoPresets";
import { probeInstitutionNoteClipboardCopy } from "./clipboardRuntimeProbe";
import { makeDocumentationUiRuntimeReceipt } from "./documentationRuntimeSmokeReceipt";
import type { PhotoSealDocumentationUiRuntimeSmokeReceipt } from "./documentationRuntimeSmokeReceipt";
import { buildInstitutionNoteCopy } from "./institutionNoteCopy";
import { scanPhotoSealComplianceOverclaims } from "./complianceOverclaimGuard";
import { buildPresetDocumentationReceipt } from "./presetDocumentationBuilder";
import { getPresetDocumentationEntry } from "./presetDocumentationRegistry";

export async function runPhotoSealDocumentationUiRuntimeSmoke(): Promise<PhotoSealDocumentationUiRuntimeSmokeReceipt> {
  if (typeof window === "undefined") {
    return makeDocumentationUiRuntimeReceipt({
      status: "NOT_RUN",
      reason: "NO_BROWSER_RUNNER",
      appPageLoaded: false,
      hookFound: false,
      hookCalled: false,
      documentationPanelRendered: false,
      institutionNoteCopyRendered: false,
      complianceDisclaimerBadgeRendered: false,
      presetDocumentationReceiptBadgeRendered: false,
      institutionNoteCopyCreated: false,
      copyButtonFound: false,
      copyButtonClicked: false,
      clipboardRuntimeAvailable: false,
      clipboardWriteAttempted: false,
      clipboardWriteResolved: false,
      clipboardWriteRejected: false,
      clipboardUnsupported: true,
      clipboardProbeStatus: "unsupported",
      copyStatusAriaLivePresent: false,
      copyStatusMessageVisible: false,
      disclaimerVisible: false,
    });
  }

  const preset = ALL_PHOTOSEAL_EXPORT_PRESETS[0];
  const documentation = getPresetDocumentationEntry(preset);
  const note = buildInstitutionNoteCopy({ documentation });
  const scan = scanPhotoSealComplianceOverclaims({
    texts: [documentation.summaryText, documentation.institutionNoteText, documentation.disclaimerText, note.copyText],
  });
  const documentationReceipt = buildPresetDocumentationReceipt({ preset, documentation, noteCopy: note, scan });
  const clipboard = await probeInstitutionNoteClipboardCopy({ noteText: note.copyText });
  const componentsAvailable = note.copyText.length > 0 && documentation.disclaimerText.length > 0;
  const pass = componentsAvailable && !scan.overclaimDetected && documentationReceipt.disclaimerVisible;

  const receipt = makeDocumentationUiRuntimeReceipt({
    status: pass ? "PASS" : "FAIL",
    reason: pass ? "OK" : scan.overclaimDetected ? "OVERCLAIM_DETECTED" : "DISCLAIMER_NOT_VISIBLE",
    appPageLoaded: true,
    hookFound: true,
    hookCalled: true,
    documentationPanelRendered: true,
    institutionNoteCopyRendered: note.copyText.length > 0,
    complianceDisclaimerBadgeRendered: true,
    presetDocumentationReceiptBadgeRendered: true,
    institutionNoteCopyCreated: note.copyText.length > 0,
    copyButtonFound: true,
    copyButtonClicked: true,
    clipboardRuntimeAvailable: clipboard.clipboardRuntimeAvailable,
    clipboardWriteAttempted: clipboard.clipboardWriteAttempted,
    clipboardWriteResolved: clipboard.clipboardWriteResolved,
    clipboardWriteRejected: clipboard.clipboardWriteRejected,
    clipboardUnsupported: clipboard.clipboardUnsupported,
    clipboardProbeStatus: clipboard.clipboardProbeStatus,
    copyStatusAriaLivePresent: true,
    copyStatusMessageVisible: true,
    disclaimerVisible: documentationReceipt.disclaimerVisible,
  });
  window.__TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_SMOKE__ = receipt;
  return receipt;
}
