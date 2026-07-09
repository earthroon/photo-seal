import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const checks = [];
const check = (label, condition) => checks.push({ label, ok: Boolean(condition) });
const read = (file) => readFileSync(file, "utf8");

const stagePath = "packages/photo-seal-web/src/components/crop/PortraitCropStage.vue";
const stylePath = "packages/photo-seal-web/src/style.css";
const stage = read(stagePath);
const style = read(stylePath);

check("stage uses ResizeObserver to own displayed image rect", stage.includes("ResizeObserver") && stage.includes("refreshStageSize") && stage.includes("stageSize"));
check("frame fit computes contain width and height from source aspect", stage.includes("Math.min(width, height * aspect)") && stage.includes("const fitHeight = fitWidth / aspect"));
check("frame publishes preserve-aspect contract marker", stage.includes("data-crop-frame-contract=\"resize-observer-contain-preserve-aspect\""));
check("stage template binds frameFitStyle instead of raw aspect-only style", stage.includes(":style=\"frameFitStyle\"") && !stage.includes(":style=\"{ aspectRatio: `${props.sourceImageSize.widthPx} / ${props.sourceImageSize.heightPx}` }\""));
check("css centers stage content without stretch ownership", style.includes(".portrait-crop-stage {\n  display: grid;\n  place-items: center;"));
check("mobile panel is dvh bounded and grid-row owned", style.includes("height: calc(100dvh - 20px);") && style.includes("grid-template-rows: auto minmax(0, 1fr) auto auto;"));
check("mobile confirm actions compact to two columns", style.includes(".crop-confirm-actions {\n    display: grid;\n    grid-template-columns: repeat(2, minmax(0, 1fr));"));
check("wasm encoder authority untouched", !read("packages/photo-seal-web/src/App.vue").includes("toBlob(\"image/jpeg\")"));

const failed = checks.filter((item) => !item.ok);
const result = {
  patchId: "TDT-PHOTOSEAL-13-H3-R8-R14",
  marker: failed.length === 0
    ? "PASS_TDT_PHOTOSEAL_13_H3_R8_R14_MOBILE_CROP_MODAL_CONTAIN"
    : "FAIL_TDT_PHOTOSEAL_13_H3_R8_R14_MOBILE_CROP_MODAL_CONTAIN",
  checks,
};

mkdirSync("artifacts", { recursive: true });
writeFileSync("artifacts/TDT_PHOTOSEAL_13_H3_R8_R14_STATIC_CHECK_RESULT.json", JSON.stringify(result, null, 2));

if (failed.length > 0) {
  console.error(result.marker);
  console.error(JSON.stringify(failed, null, 2));
  process.exit(1);
}
console.log(result.marker);
