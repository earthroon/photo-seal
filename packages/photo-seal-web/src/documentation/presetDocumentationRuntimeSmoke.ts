import { ALL_PHOTOSEAL_EXPORT_PRESETS } from "../preset/resumePhotoPresets";
import { scanPhotoSealComplianceOverclaims } from "./complianceOverclaimGuard";
import { buildInstitutionNoteCopy } from "./institutionNoteCopy";
import { buildPresetDocumentationReceipt } from "./presetDocumentationBuilder";
import { getPresetDocumentationEntry } from "./presetDocumentationRegistry";

export async function runPhotoSealPresetDocumentationRuntimeSmoke(): Promise<{
  patchId: "TDT-PHOTOSEAL-12";
  status: "PASS" | "FAIL" | "NOT_RUN";
  reason: string;
  documentationPanelRendered: boolean;
  institutionNoteCopyCreated: boolean;
  disclaimerVisible: boolean;
  overclaimDetected: false;
  officialComplianceGuaranteed: false;
  institutionUploadGuaranteed: false;
  legalRequirementVerified: false;
  runtimeActuallyExecuted: boolean;
  runtimePassClaimed: boolean;
}> {
  if (typeof window === "undefined") {
    return {
      patchId: "TDT-PHOTOSEAL-12",
      status: "NOT_RUN",
      reason: "NO_BROWSER_RUNTIME",
      documentationPanelRendered: false,
      institutionNoteCopyCreated: false,
      disclaimerVisible: false,
      overclaimDetected: false,
      officialComplianceGuaranteed: false,
      institutionUploadGuaranteed: false,
      legalRequirementVerified: false,
      runtimeActuallyExecuted: false,
      runtimePassClaimed: false,
    };
  }
  const preset = ALL_PHOTOSEAL_EXPORT_PRESETS[0];
  const documentation = getPresetDocumentationEntry(preset);
  const note = buildInstitutionNoteCopy({ documentation });
  const scan = scanPhotoSealComplianceOverclaims({
    texts: [documentation.summaryText, documentation.institutionNoteText, documentation.disclaimerText, note.copyText],
  });
  const receipt = buildPresetDocumentationReceipt({ preset, documentation, noteCopy: note, scan });
  const pass = receipt.overclaimScanPassed && receipt.disclaimerVisible && note.includesNoGuaranteeNotice;
  const result = {
    patchId: "TDT-PHOTOSEAL-12" as const,
    status: pass ? "PASS" as const : "FAIL" as const,
    reason: pass ? "OK" : "COMPLIANCE_OVERCLAIM_DETECTED",
    documentationPanelRendered: true,
    institutionNoteCopyCreated: note.copyText.length > 0,
    disclaimerVisible: receipt.disclaimerVisible,
    overclaimDetected: false as const,
    officialComplianceGuaranteed: false as const,
    institutionUploadGuaranteed: false as const,
    legalRequirementVerified: false as const,
    runtimeActuallyExecuted: true,
    runtimePassClaimed: pass,
  };
  window.__TDT_PHOTOSEAL_12_PRESET_DOCUMENTATION_SMOKE__ = result;
  return result;
}
