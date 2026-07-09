import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const checks = [];
function check(label, condition) {
  checks.push({ label, ok: Boolean(condition) });
}
function has(file, token) {
  return readFileSync(file, "utf8").includes(token);
}

const app = "packages/photo-seal-web/src/App.vue";
const style = "packages/photo-seal-web/src/style.css";

const appSource = readFileSync(app, "utf8");
const styleSource = readFileSync(style, "utf8");

check("primary flow panel rendered", has(app, "vue3-two-column-primary-r8-r8"));
check("export panel two-column owner", has(app, "vue3-two-column-export-r8-r8"));
check("image import nested in primary flow", has(app, "embedded-step-panel image-input-panel"));
check("preset panel nested in primary flow", has(app, "embedded-step-panel preset-panel"));
check("technical details block removed from App", !appSource.includes('<details class="technical-details"'));
check("technical details toggle removed", !appSource.includes("onTechnicalDetailsToggle"));
check("technical details state removed", !appSource.includes("technicalDetailsOpen"));
check("workspace two-column CSS", styleSource.includes("grid-template-columns: minmax(720px, 1fr) minmax(380px, 460px)"));
check("primary flow CSS owner", has(style, "primary-flow-panel[data-layout-owner=\"vue3-two-column-primary-r8-r8\"]"));
check("middle column deleted from CSS override", !styleSource.includes("grid-template-columns: 500px minmax(600px, 680px) 460px;\n  gap: 22px"));
check("right technical details hidden guard", has(style, ".export-panel[data-layout-owner=\"vue3-two-column-export-r8-r8\"] .technical-details"));
check("no browser jpeg fallback", !appSource.includes('toBlob("image/jpeg")') && !appSource.includes('toDataURL("image/jpeg")'));

const failed = checks.filter((item) => !item.ok);
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8-R8",
  marker: failed.length === 0
    ? "PASS_TDT_PHOTOSEAL_13_H3_R8_R8_TWO_COLUMN_VUE3_LAYOUT"
    : "FAIL_TDT_PHOTOSEAL_13_H3_R8_R8_TWO_COLUMN_VUE3_LAYOUT",
  checks,
};

mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/TDT_PHOTOSEAL_13_H3_R8_R8_STATIC_CHECK_RESULT.json", JSON.stringify(result, null, 2));

if (failed.length > 0) {
  console.error(result.marker);
  console.error(JSON.stringify(failed, null, 2));
  process.exit(1);
}
console.log(result.marker);
