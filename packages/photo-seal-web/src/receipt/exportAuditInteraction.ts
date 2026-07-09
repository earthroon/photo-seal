import type {
  ExportAuditAccordionState,
  ExportAuditInteractionState,
  ExportAuditSectionId,
} from "./exportAuditInteractionTypes";
import { EXPORT_AUDIT_SECTION_IDS } from "./exportAuditInteractionTypes";
import type { PhotoSealAuditStatus } from "./exportAuditTypes";

const sectionSet = new Set<ExportAuditSectionId>(EXPORT_AUDIT_SECTION_IDS);

function assertExportAuditSectionId(sectionId: ExportAuditSectionId): void {
  if (!sectionSet.has(sectionId)) {
    throw new Error(`Unknown export audit section: ${sectionId}`);
  }
}

export function createDefaultExportAuditAccordionState(
  exportStatus: PhotoSealAuditStatus,
): ExportAuditAccordionState {
  const base: ExportAuditAccordionState = {
    status: true,
    size: true,
    resize: false,
    color: true,
    jpeg: true,
    bridge: false,
    quality: false,
    warnings: false,
    debug: false,
  };

  if (exportStatus === "warn") {
    return { ...base, warnings: true };
  }

  if (exportStatus === "fail") {
    return { ...base, resize: true, bridge: true, warnings: true };
  }

  return base;
}

export function createInitialExportAuditInteractionState(
  exportStatus: PhotoSealAuditStatus,
): ExportAuditInteractionState {
  const accordion = createDefaultExportAuditAccordionState(exportStatus);
  return {
    accordion,
    lastCopyTarget: null,
    copyStatus: "idle",
    copyMessage: null,
    debugJsonVisible: accordion.debug,
  };
}

export function toggleExportAuditSection(
  state: ExportAuditAccordionState,
  sectionId: ExportAuditSectionId,
): ExportAuditAccordionState {
  assertExportAuditSectionId(sectionId);
  return { ...state, [sectionId]: !state[sectionId] };
}

export function openExportAuditSection(
  state: ExportAuditAccordionState,
  sectionId: ExportAuditSectionId,
): ExportAuditAccordionState {
  assertExportAuditSectionId(sectionId);
  return { ...state, [sectionId]: true };
}

export function closeExportAuditSection(
  state: ExportAuditAccordionState,
  sectionId: ExportAuditSectionId,
): ExportAuditAccordionState {
  assertExportAuditSectionId(sectionId);
  return { ...state, [sectionId]: false };
}

export function isDebugJsonVisible(state: ExportAuditAccordionState): boolean {
  return state.debug === true;
}

export const NO_RAW_JSON_DEFAULT_FLOOD_SEAL = "No raw JSON default flood" as const;
export const RAW_JSON_IS_OPT_IN_SEAL = "raw JSON is opt-in" as const;
