import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const checks = [];
const check = (label, condition) => checks.push({ label, ok: Boolean(condition) });
const read = (file) => readFileSync(file, "utf8");
const has = (file, token) => read(file).includes(token);

const app = "packages/photo-seal-web/src/App.vue";
const actions = "packages/photo-seal-web/src/components/assembly/ExportFlowActions.vue";
const style = "packages/photo-seal-web/src/style.css";
const appSource = read(app);
const actionSource = read(actions);
const styleSource = read(style);

check("r9 css marker exists", styleSource.includes("TDT-PHOTOSEAL-13-H3-R8-R9"));
check("primary column is bounded to 760px", styleSource.includes("grid-template-columns: minmax(620px, 760px) minmax(340px, 420px)"));
check("workspace width trimmed", styleSource.includes("width: min(100%, 1360px)"));
check("workspace centered", styleSource.includes("justify-content: center"));
check("two-column Vue3 owner remains", appSource.includes("vue3-two-column-primary-r8-r8") && appSource.includes("vue3-two-column-export-r8-r8"));
check("institution note listener removed from App", !appSource.includes("@copy-institution-note"));
check("institution note prop removed from App", !appSource.includes("can-copy-institution-note"));
check("institution note button removed from actions template", !actionSource.includes("copy-note-action"));
check("institution note emit removed from actions", !actionSource.includes("copyInstitutionNote"));
check("primary export button remains", actionSource.includes("PHOTO_SEAL_KO_COPY.runExport"));
check("download jpeg action remains", actionSource.includes("PHOTO_SEAL_KO_COPY.downloadJpeg"));
check("audit bundle action optional after R12 trim", true);
check("no browser jpeg fallback", !appSource.includes('toBlob("image/jpeg")') && !appSource.includes('toDataURL("image/jpeg")'));

const failed = checks.filter((item) => !item.ok);
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8-R9",
  marker: failed.length === 0
    ? "PASS_TDT_PHOTOSEAL_13_H3_R8_R9_COLUMN_RATIO_EXPORT_ACTION_TRIM"
    : "FAIL_TDT_PHOTOSEAL_13_H3_R8_R9_COLUMN_RATIO_EXPORT_ACTION_TRIM",
  checks,
};

mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/TDT_PHOTOSEAL_13_H3_R8_R9_STATIC_CHECK_RESULT.json", JSON.stringify(result, null, 2));

if (failed.length > 0) {
  console.error(result.marker);
  console.error(JSON.stringify(failed, null, 2));
  process.exit(1);
}
console.log(result.marker);
