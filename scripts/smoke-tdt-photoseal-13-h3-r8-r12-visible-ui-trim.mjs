import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const checks = [];
const check = (label, condition) => checks.push({ label, ok: Boolean(condition) });
const read = (file) => readFileSync(file, "utf8");

const app = "packages/photo-seal-web/src/App.vue";
const actions = "packages/photo-seal-web/src/components/assembly/ExportFlowActions.vue";
const flowPanel = "packages/photo-seal-web/src/components/assembly/ExportFlowPanel.vue";
const style = "packages/photo-seal-web/src/style.css";

const appSource = read(app);
const actionsSource = read(actions);
const flowPanelSource = read(flowPanel);
const styleSource = read(style);

check("header preset notice banner removed", !appSource.includes("header-note") && !appSource.includes("appNoticeTitle") && !appSource.includes("appNotice"));
check("step 1 image input description removed", !appSource.includes("imageInputDescription"));
check("step 3 readiness description paragraph removed", !appSource.includes('<p class="section-description">{{ readiness.message }}</p>'));
check("export disabled helper prose removed", !actionsSource.includes("action-disabled-reason") && !actionsSource.includes("disabledReason"));
check("audit bundle button removed from visible actions", !actionsSource.includes("saveAuditBundle") && !actionsSource.includes("saveAuditBundle") && !actionsSource.includes("saveAuditBundle"));
check("save audit prop removed from app action binding", !appSource.includes("can-save-audit-bundle") && !appSource.includes("@save-audit-bundle"));
check("save audit prop removed from assembly flow panel binding", !flowPanelSource.includes("can-save-audit-bundle") && !flowPanelSource.includes("can-copy-institution-note"));
check("download action hidden until JPEG exists", actionsSource.includes('v-if="canDownloadJpeg"') && actionsSource.includes("downloadJpeg"));
check("action disabled css removed", !styleSource.includes("action-disabled-reason"));
check("crop preview badge preserved", read("packages/photo-seal-web/src/components/import/ImageImportPreviewCanvas.vue").includes("cropBadgeLabel"));
check("no browser jpeg fallback", !appSource.includes('toBlob("image/jpeg")') && !actionsSource.includes('toDataURL("image/jpeg")'));

const failed = checks.filter((item) => !item.ok);
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8-R12",
  marker: failed.length === 0
    ? "PASS_TDT_PHOTOSEAL_13_H3_R8_R12_VISIBLE_UI_TRIM"
    : "FAIL_TDT_PHOTOSEAL_13_H3_R8_R12_VISIBLE_UI_TRIM",
  checks,
};

mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/TDT_PHOTOSEAL_13_H3_R8_R12_STATIC_CHECK_RESULT.json", JSON.stringify(result, null, 2));

if (failed.length > 0) {
  console.error(result.marker);
  console.error(JSON.stringify(failed, null, 2));
  process.exit(1);
}
console.log(result.marker);
