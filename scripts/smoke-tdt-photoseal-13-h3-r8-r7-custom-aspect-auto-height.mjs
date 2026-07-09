import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const checks = [];
function check(label, condition) {
  checks.push({ label, ok: Boolean(condition) });
}
function has(file, token) {
  return readFileSync(file, "utf8").includes(token);
}

const customFields = "packages/photo-seal-web/src/components/preset/CustomPresetFields.vue";
const selector = "packages/photo-seal-web/src/components/preset/ExportPresetSelector.vue";

const customSource = readFileSync(customFields, "utf8");
const selectorSource = readFileSync(selector, "utf8");

check("width-driven auto-height contract", has(customFields, "single-line-width-driven-auto-height"));
check("height ratio constant", has(customFields, "TDT_PHOTOSEAL_CUSTOM_PRESET_HEIGHT_RATIO"));
check("computed heightInput", has(customFields, "const heightInput = computed"));
check("height output is readonly", has(customFields, "custom-preset-fields__auto-height-output"));
check("target bytes computed but hidden", has(customFields, "const targetBytesInput = computed"));
check("no target bytes v-model", !customSource.includes("v-model=\"targetBytesInput\""));
check("no label v-model", !customSource.includes("v-model=\"labelInput\""));
check("selector no summary import", !selectorSource.includes("ExportPresetSummary from"));
check("selector no summary component render", !selectorSource.includes("<ExportPresetSummary"));
check("selector still emits selected preset", selectorSource.includes('emit("selected"'));
check("custom apply preserved", customSource.includes('emit("applied"'));
check("no browser jpeg fallback", !customSource.includes('toBlob("image/jpeg")') && !selectorSource.includes('toBlob("image/jpeg")'));

const failed = checks.filter((item) => !item.ok);
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8-R7",
  marker: failed.length === 0
    ? "PASS_TDT_PHOTOSEAL_13_H3_R8_R7_CUSTOM_ASPECT_AUTO_HEIGHT"
    : "FAIL_TDT_PHOTOSEAL_13_H3_R8_R7_CUSTOM_ASPECT_AUTO_HEIGHT",
  checks,
};

mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/TDT_PHOTOSEAL_13_H3_R8_R7_STATIC_CHECK_RESULT.json", JSON.stringify(result, null, 2));

if (failed.length > 0) {
  console.error(result.marker);
  console.error(JSON.stringify(failed, null, 2));
  process.exit(1);
}
console.log(result.marker);
