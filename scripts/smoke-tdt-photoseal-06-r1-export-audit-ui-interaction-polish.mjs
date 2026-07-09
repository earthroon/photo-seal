#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const patchId = "TDT-PHOTOSEAL-06-R1";
const passMarker = "PASS_TDT_PHOTOSEAL_06_R1_EXPORT_AUDIT_UI_INTERACTION_POLISH";
const failMarker = "FAIL_TDT_PHOTOSEAL_06_R1_EXPORT_AUDIT_UI_INTERACTION_POLISH";

const requiredFiles = [
  "packages/photo-seal-web/src/receipt/exportAuditInteractionTypes.ts",
  "packages/photo-seal-web/src/receipt/exportAuditInteraction.ts",
  "packages/photo-seal-web/src/receipt/exportAuditCopy.ts",
  "packages/photo-seal-web/src/components/export/ExportReceiptSurface.vue",
  "packages/photo-seal-web/src/components/export/ExportAuditSection.vue",
  "packages/photo-seal-web/src/components/export/ExportAuditDebugJson.vue",
  "packages/photo-seal-web/src/components/export/ExportAuditCopyButton.vue",
  "specs/TDT_PHOTOSEAL_06_R1_EXPORT_AUDIT_UI_INTERACTION_POLISH_SPEC.md",
];

const requiredTokens = [
  patchId,
  "ExportAuditAccordionState",
  "ExportAuditSectionId",
  "ExportAuditCopyTarget",
  "ExportAuditCopyStatus",
  "ExportAuditInteractionState",
  "createDefaultExportAuditAccordionState",
  "toggleExportAuditSection",
  "buildExportAuditSummaryText",
  "buildDebugReceiptJsonText",
  "copyTextToClipboard",
  "debug: false",
  "No raw JSON default flood",
  "aria-expanded",
  "aria-controls",
  "aria-live",
  "Copy summary",
  "Copy debug receipt JSON",
  "raw JSON is opt-in",
];

const forbiddenTokens = [
  "rawJsonDefaultVisible: true",
  "receiptAvailable: false",
  "autoCopy",
  "copyStatus = \"copied\" // fallback",
  "완벽한 품질 보장",
  "무손실 보장",
  "색상 100% 동일",
  "promotedToDefault: true",
  "defaultProfileChanged: true",
];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const missingFiles = requiredFiles.filter((rel) => !fs.existsSync(path.join(root, rel)));
if (missingFiles.length > 0) {
  console.error(failMarker);
  console.error(JSON.stringify({ missingFiles }, null, 2));
  process.exit(1);
}

const haystack = requiredFiles.map((rel) => `\n/* ${rel} */\n${read(rel)}`).join("\n");
const missingTokens = requiredTokens.filter((token) => !haystack.includes(token));
const forbiddenFound = forbiddenTokens.filter((token) => haystack.includes(token));

const section = read("packages/photo-seal-web/src/components/export/ExportAuditSection.vue");
const surface = read("packages/photo-seal-web/src/components/export/ExportReceiptSurface.vue");
const interaction = read("packages/photo-seal-web/src/receipt/exportAuditInteraction.ts");
const debug = read("packages/photo-seal-web/src/components/export/ExportAuditDebugJson.vue");

const structuralFailures = [];
if (!section.includes("<button") || !section.includes("@keydown") || !section.includes("event.key === \"Enter\"") || !section.includes("event.key === \" \"")) {
  structuralFailures.push("accordion keyboard button contract missing");
}
if (!surface.includes("aria-live=\"polite\"")) {
  structuralFailures.push("aria-live copy status missing");
}
if (!interaction.includes("debug: false")) {
  structuralFailures.push("debug accordion default is not sealed false");
}
if (!debug.includes("v-if=\"props.open === true\"")) {
  structuralFailures.push("debug JSON render is not gated by open state");
}

if (missingTokens.length > 0 || forbiddenFound.length > 0 || structuralFailures.length > 0) {
  console.error(failMarker);
  console.error(JSON.stringify({ missingTokens, forbiddenFound, structuralFailures }, null, 2));
  process.exit(1);
}

console.log(passMarker);
console.log(JSON.stringify({
  patch_id: patchId,
  static_smoke: "PASS",
  accordion_state_added: true,
  copy_summary_button_added: true,
  copy_debug_receipt_button_added: true,
  debug_json_default_visible: false,
  raw_json_default_flood_forbidden: true,
  keyboard_accessibility_required: true,
  aria_expanded_required: true,
  aria_controls_required: true,
  aria_live_copy_status_required: true,
  audit_truth_logic_changed: false,
  default_profile_changed: false,
  promoted_to_default: false,
}, null, 2));
