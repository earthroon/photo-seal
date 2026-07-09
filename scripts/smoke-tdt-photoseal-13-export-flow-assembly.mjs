import fs from "node:fs";
import path from "node:path";

const patchId = "TDT-PHOTOSEAL-13";
const root = process.cwd();
const checks = JSON.parse(fs.readFileSync(path.join(root, "specs/TDT_PHOTOSEAL_13_STATIC_CHECKS.json"), "utf8"));
const implementationFiles = [
  "packages/photo-seal-web/src/assembly/exportFlowAssemblyTypes.ts",
  "packages/photo-seal-web/src/assembly/exportFlowAssemblyReceipt.ts",
  "packages/photo-seal-web/src/assembly/exportFlowAssemblyResult.ts",
  "packages/photo-seal-web/src/assembly/exportFlowReceiptGuard.ts",
  "packages/photo-seal-web/src/assembly/photoSealExportFlow.ts",
  "packages/photo-seal-web/src/assembly/exportFlowRuntimeSmoke.ts",
  "packages/photo-seal-web/src/dev/registerPhotoSealExportFlowSmoke.ts",
  "packages/photo-seal-web/e2e/photoSealExportFlowRuntime.spec.ts",
  "packages/photo-seal-web/e2e/exportFlowRuntimeReceiptWriter.ts",
  "packages/photo-seal-web/src/receipt/exportAuditTypes.ts",
  "packages/photo-seal-web/src/receipt/exportAuditSurface.ts",
  "packages/photo-seal-web/src/receipt/exportAuditWarnings.ts",
  "packages/photo-seal-web/src/main.ts",
];

const forbiddenTokens = [
  "test.skip",
  "missingReceiptSuccessBlocked: false",
  "mockReceiptUsedForSuccess: true",
  "staticSmokeUsedAsRuntimePass: true",
  "hiddenResizePolicyUsed: true",
  "hiddenTargetBytesPolicyUsed: true",
  "doubleGammaDetected: true",
  "canvasColorCorrectionUsed: true",
  "workerColorTransformUsed: true",
  "encoderSideResizeUsed: true",
  "encoderSideCropUsed: true",
  "promotedToDefault: true",
  "defaultProfileChanged: true",
];

const failures = [];
for (const file of checks.required_files) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`missing file: ${file}`);
}

const tokenCorpus = checks.required_files
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");
for (const token of checks.required_tokens) {
  if (!tokenCorpus.includes(token)) failures.push(`missing token: ${token}`);
}

for (const file of implementationFiles) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, "utf8");
  for (const token of forbiddenTokens) {
    if (text.includes(token)) failures.push(`forbidden token in ${file}: ${token}`);
  }
}

const result = {
  patch_id: patchId,
  status: failures.length === 0 ? "PASS" : "FAIL",
  marker:
    failures.length === 0
      ? "PASS_TDT_PHOTOSEAL_13_EXPORT_FLOW_ASSEMBLY_STATIC_CONTRACT"
      : "FAIL_TDT_PHOTOSEAL_13_EXPORT_FLOW_ASSEMBLY_STATIC_CONTRACT",
  failures,
  required_files_checked: checks.required_files.length,
  required_tokens_checked: checks.required_tokens.length,
  forbidden_tokens_checked: forbiddenTokens.length,
};

fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
fs.writeFileSync(
  path.join(root, "artifacts/TDT_PHOTOSEAL_13_STATIC_CHECK_RESULT.json"),
  `${JSON.stringify(result, null, 2)}\n`
);
console.log(result.marker);
if (failures.length > 0) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
