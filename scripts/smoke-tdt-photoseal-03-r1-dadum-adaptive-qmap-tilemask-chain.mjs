import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checkPath = path.join(root, 'specs/TDT_PHOTOSEAL_03_R1_STATIC_CHECKS.json');
const checks = JSON.parse(fs.readFileSync(checkPath, 'utf8'));
const fail = (msg) => {
  console.error(`FAIL_TDT_PHOTOSEAL_03_R1_DADUMDADUM_ADAPTIVE_QMAP_TILEMASK_CHAIN_IMPORT: ${msg}`);
  process.exit(1);
};

for (const file of checks.required_files) {
  if (!fs.existsSync(path.join(root, file))) fail(`missing required file ${file}`);
}

const implementationFiles = [
  'packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskDownscale.ts',
  'packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskParams.ts',
  'packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskReceipt.ts',
  'packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskInventory.ts',
  'packages/photo-seal-web/src/resize/types.ts',
  'artifacts/TDT_PHOTOSEAL_03_R1_SOURCE_INVENTORY.json',
  'specs/TDT_PHOTOSEAL_03_R1_DADUMDADUM_ADAPTIVE_QMAP_TILEMASK_CHAIN_IMPORT_SPEC.md'
];
const haystack = implementationFiles.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
for (const token of checks.required_tokens) {
  if (!haystack.includes(token)) fail(`missing token ${token}`);
}
for (const token of checks.forbidden_tokens) {
  const scope = implementationFiles
    .filter(f => !f.endsWith('_SPEC.md'))
    .map(f => fs.readFileSync(path.join(root, f), 'utf8'))
    .join('\n');
  if (scope.includes(token)) fail(`forbidden token ${token}`);
}
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/TDT_PHOTOSEAL_03_R1_SOURCE_INVENTORY.json'), 'utf8'));
if (inventory.full_chain_candidate_profile !== 'dadum-adaptive-qmap-tilemask') fail('source inventory candidate profile mismatch');
if (inventory.default_profile_changed !== false) fail('source inventory default profile changed');
if (inventory.simplified_adaptive_ewa_alias_forbidden !== true) fail('source inventory alias seal missing');
if (!Array.isArray(inventory.required_source_files) || inventory.required_source_files.length < 9) fail('source inventory insufficient source files');
console.log('PASS_TDT_PHOTOSEAL_03_R1_DADUMDADUM_ADAPTIVE_QMAP_TILEMASK_CHAIN_IMPORT');
