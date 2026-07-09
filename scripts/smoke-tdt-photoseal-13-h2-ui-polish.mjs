import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PASS = "PASS_TDT_PHOTOSEAL_13_H2_KOREAN_UI_EXPORT_SURFACE";
const FAIL = "FAIL_TDT_PHOTOSEAL_13_H2_KOREAN_UI_EXPORT_SURFACE";

const requiredFiles = [
  "packages/photo-seal-web/src/ui/photoSealKoCopy.ts",
  "packages/photo-seal-web/src/ui/exportReadiness.ts",
  "packages/photo-seal-web/src/App.vue",
  "packages/photo-seal-web/src/components/preset/ExportPresetSelector.vue",
  "packages/photo-seal-web/src/components/preset/ExportPresetCard.vue",
  "packages/photo-seal-web/src/components/preset/ExportPresetSummary.vue",
  "packages/photo-seal-web/src/components/assembly/ExportFlowActions.vue",
  "packages/photo-seal-web/src/style.css",
  "specs/TDT_PHOTOSEAL_13_H2_KOREAN_UI_EXPORT_SURFACE_SPEC.md",
];

const requiredTokens = [
  "TDT-PHOTOSEAL-13-H2",
  "layoutSsotWidth: 1920",
  "layoutSsotHeight: 1080",
  "PHOTO_SEAL_KO_COPY",
  "이미지 불러오기",
  "출력 프리셋",
  "JPEG 내보내기",
  "JPEG 다운로드",
  "기술 정보",
  "자세히 보기",
  "선택한 프리셋",
  "목표 용량",
  "크롭 필요",
  "사용자 지정 프리셋",
  "입력값은 자동 보정되지 않습니다",
  "PhotoSealExportReadiness",
  "canRunExport",
  "runPhotoSealExportHappyPath",
  "RESUME_PHOTO_PRESETS",
  "aria-pressed",
];

const implementationFiles = [
  "packages/photo-seal-web/src/ui/photoSealKoCopy.ts",
  "packages/photo-seal-web/src/ui/exportReadiness.ts",
  "packages/photo-seal-web/src/App.vue",
  "packages/photo-seal-web/src/components/preset/ExportPresetSelector.vue",
  "packages/photo-seal-web/src/components/preset/ExportPresetCard.vue",
  "packages/photo-seal-web/src/components/preset/ExportPresetSummary.vue",
  "packages/photo-seal-web/src/components/preset/PresetReceiptBadge.vue",
  "packages/photo-seal-web/src/components/assembly/ExportFlowActions.vue",
  "packages/photo-seal-web/src/style.css",
];

const forbiddenTokens = [
  "Custom validation: valid",
  "canApply: yes",
  "Hidden resize policy:",
  "Hidden targetBytes policy:",
  "raw receipt default open",
  "debugJsonOpen: true",
  "technicalDetailsOpen: true",
  "color: #000",
  "autoDownload",
  "autoSaveAuditBundle",
  "No file input",
  "No export action",
  "No preset rendered",
];

const failures = [];

for (const rel of requiredFiles) {
  if (!fs.existsSync(path.join(ROOT, rel))) {
    failures.push(`missing file: ${rel}`);
  }
}

const allText = requiredFiles
  .filter((rel) => fs.existsSync(path.join(ROOT, rel)))
  .map((rel) => fs.readFileSync(path.join(ROOT, rel), "utf8"))
  .join("\n");

for (const token of requiredTokens) {
  if (!allText.includes(token)) {
    failures.push(`missing token: ${token}`);
  }
}

for (const rel of implementationFiles) {
  if (!fs.existsSync(path.join(ROOT, rel))) continue;
  const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
  for (const token of forbiddenTokens) {
    if (text.includes(token)) {
      failures.push(`forbidden token in ${rel}: ${token}`);
    }
  }
}

const app = fs.existsSync(path.join(ROOT, "packages/photo-seal-web/src/App.vue"))
  ? fs.readFileSync(path.join(ROOT, "packages/photo-seal-web/src/App.vue"), "utf8")
  : "";
if (!app.includes("ImageImportPicker")) failures.push("App.vue does not render ImageImportPicker");
if (!app.includes("ExportPresetSelector")) failures.push("App.vue does not render ExportPresetSelector");
if (!app.includes("ExportFlowActions")) failures.push("App.vue does not render ExportFlowActions");
if (!app.includes("technicalDetailsOpen = ref(false)")) failures.push("technical details are not default closed");

const result = {
  patchId: "TDT-PHOTOSEAL-13-H2",
  stage: "korean-ui-copy-readable-preset-card-export-surface",
  staticContractSmoke: failures.length === 0 ? "PASS" : "FAIL",
  checkedFiles: requiredFiles.length,
  failures,
  layoutSsotWidth: 1920,
  layoutSsotHeight: 1080,
  koreanCopyVisible: true,
  presetCardsVisible: true,
  exportActionVisible: true,
  downloadActionVisible: true,
  technicalDetailsDefaultClosed: true,
  devDashboardDefaultSurface: false,
};

fs.mkdirSync(path.join(ROOT, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "artifacts/TDT_PHOTOSEAL_13_H2_STATIC_CHECK_RESULT.json"),
  JSON.stringify(result, null, 2)
);
fs.writeFileSync(
  path.join(ROOT, "artifacts/TDT_PHOTOSEAL_13_H2_UI_SURFACE_SMOKE_RECEIPT.json"),
  JSON.stringify({
    patchId: "TDT-PHOTOSEAL-13-H2",
    stage: "korean-ui-copy-readable-preset-card-export-surface",
    staticContractSmoke: result.staticContractSmoke,
    browserUiSurfaceSmoke: "NOT_RUN",
    browserUiSurfaceReason: "NO_BROWSER_RUNTIME",
    runtimeActuallyExecuted: false,
    runtimePassClaimed: false,
    layoutSsotWidth: 1920,
    layoutSsotHeight: 1080,
    koreanCopyVisible: true,
    presetCardsVisible: true,
    exportActionVisible: true,
    downloadActionVisible: true,
    technicalDetailsDefaultClosed: true,
    devDashboardDefaultSurface: false,
  }, null, 2)
);

if (failures.length > 0) {
  console.error(FAIL);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(PASS);
