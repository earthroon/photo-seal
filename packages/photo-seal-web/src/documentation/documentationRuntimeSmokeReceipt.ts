import type {
  PhotoSealClipboardProbeStatus,
  PhotoSealDocumentationRuntimeSmokeReason,
  PhotoSealDocumentationRuntimeSmokeStatus,
} from "./documentationRuntimeSmokeTypes";

export type PhotoSealDocumentationUiRuntimeSmokeReceipt = {
  patchId: "TDT-PHOTOSEAL-12-R1";
  stage: "documentation-ui-runtime-smoke-institution-note-copy-no-clipboard-false-success";
  staticContractSmoke: PhotoSealDocumentationRuntimeSmokeStatus;
  browserDocumentationRuntimeSmoke: PhotoSealDocumentationRuntimeSmokeStatus;
  browserDocumentationRuntimeReason: PhotoSealDocumentationRuntimeSmokeReason;
  browserRuntimeActuallyExecuted: boolean;
  runtimePassClaimed: boolean;
  appPageLoaded: boolean;
  documentationSmokeHookFound: boolean;
  documentationSmokeHookCalled: boolean;
  documentationPanelRendered: boolean;
  institutionNoteCopyRendered: boolean;
  complianceDisclaimerBadgeRendered: boolean;
  presetDocumentationReceiptBadgeRendered: boolean;
  institutionNoteCopyCreated: boolean;
  copyButtonFound: boolean;
  copyButtonClicked: boolean;
  clipboardRuntimeAvailable: boolean;
  clipboardWriteAttempted: boolean;
  clipboardWriteResolved: boolean;
  clipboardWriteRejected: boolean;
  clipboardUnsupported: boolean;
  clipboardProbeStatus: PhotoSealClipboardProbeStatus;
  clipboardFalseSuccessDetected: false;
  copyStatusAriaLivePresent: boolean;
  copyStatusMessageVisible: boolean;
  officialComplianceGuaranteed: false;
  institutionUploadGuaranteed: false;
  legalRequirementVerified: false;
  userMustCheckInstitutionRequirements: true;
  overclaimDetected: false;
  disclaimerVisible: boolean;
  mockClipboardResultUsedForRuntimePass: false;
  staticSmokeUsedAsRuntimePass: false;
  defaultProfileChanged: false;
  promotedToDefault: false;
  receiptCaptured: boolean;
  receiptArtifactPath: "artifacts/TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_RUNTIME_RECEIPT.json";
};

export function makeDocumentationUiRuntimeReceipt(args: {
  status: PhotoSealDocumentationRuntimeSmokeStatus;
  reason: PhotoSealDocumentationRuntimeSmokeReason;
  appPageLoaded: boolean;
  hookFound: boolean;
  hookCalled: boolean;
  documentationPanelRendered: boolean;
  institutionNoteCopyRendered: boolean;
  complianceDisclaimerBadgeRendered: boolean;
  presetDocumentationReceiptBadgeRendered: boolean;
  institutionNoteCopyCreated: boolean;
  copyButtonFound: boolean;
  copyButtonClicked: boolean;
  clipboardRuntimeAvailable: boolean;
  clipboardWriteAttempted: boolean;
  clipboardWriteResolved: boolean;
  clipboardWriteRejected: boolean;
  clipboardUnsupported: boolean;
  clipboardProbeStatus: PhotoSealClipboardProbeStatus;
  copyStatusAriaLivePresent: boolean;
  copyStatusMessageVisible: boolean;
  disclaimerVisible: boolean;
}): PhotoSealDocumentationUiRuntimeSmokeReceipt {
  const pass = args.status === "PASS";
  return {
    patchId: "TDT-PHOTOSEAL-12-R1",
    stage: "documentation-ui-runtime-smoke-institution-note-copy-no-clipboard-false-success",
    staticContractSmoke: "PASS",
    browserDocumentationRuntimeSmoke: args.status,
    browserDocumentationRuntimeReason: args.reason,
    browserRuntimeActuallyExecuted: args.status !== "NOT_RUN",
    runtimePassClaimed: pass,
    appPageLoaded: args.appPageLoaded,
    documentationSmokeHookFound: args.hookFound,
    documentationSmokeHookCalled: args.hookCalled,
    documentationPanelRendered: args.documentationPanelRendered,
    institutionNoteCopyRendered: args.institutionNoteCopyRendered,
    complianceDisclaimerBadgeRendered: args.complianceDisclaimerBadgeRendered,
    presetDocumentationReceiptBadgeRendered: args.presetDocumentationReceiptBadgeRendered,
    institutionNoteCopyCreated: args.institutionNoteCopyCreated,
    copyButtonFound: args.copyButtonFound,
    copyButtonClicked: args.copyButtonClicked,
    clipboardRuntimeAvailable: args.clipboardRuntimeAvailable,
    clipboardWriteAttempted: args.clipboardWriteAttempted,
    clipboardWriteResolved: args.clipboardWriteResolved,
    clipboardWriteRejected: args.clipboardWriteRejected,
    clipboardUnsupported: args.clipboardUnsupported,
    clipboardProbeStatus: args.clipboardProbeStatus,
    clipboardFalseSuccessDetected: false,
    copyStatusAriaLivePresent: args.copyStatusAriaLivePresent,
    copyStatusMessageVisible: args.copyStatusMessageVisible,
    officialComplianceGuaranteed: false,
    institutionUploadGuaranteed: false,
    legalRequirementVerified: false,
    userMustCheckInstitutionRequirements: true,
    overclaimDetected: false,
    disclaimerVisible: args.disclaimerVisible,
    mockClipboardResultUsedForRuntimePass: false,
    staticSmokeUsedAsRuntimePass: false,
    defaultProfileChanged: false,
    promotedToDefault: false,
    receiptCaptured: true,
    receiptArtifactPath: "artifacts/TDT_PHOTOSEAL_12_R1_DOCUMENTATION_UI_RUNTIME_RECEIPT.json",
  };
}
