export type ExportAuditSectionId =
  | "status"
  | "size"
  | "resize"
  | "color"
  | "jpeg"
  | "bridge"
  | "quality"
  | "warnings"
  | "debug";

export type ExportAuditAccordionState = Record<ExportAuditSectionId, boolean>;

export type ExportAuditCopyTarget = "summary" | "debug-receipt-json";

export type ExportAuditCopyStatus = "idle" | "copied" | "failed" | "unsupported";

export type ExportAuditInteractionState = {
  accordion: ExportAuditAccordionState;
  lastCopyTarget: ExportAuditCopyTarget | null;
  copyStatus: ExportAuditCopyStatus;
  copyMessage: string | null;
  debugJsonVisible: boolean;
};

export const EXPORT_AUDIT_SECTION_IDS: readonly ExportAuditSectionId[] = [
  "status",
  "size",
  "resize",
  "color",
  "jpeg",
  "bridge",
  "quality",
  "warnings",
  "debug",
] as const;
