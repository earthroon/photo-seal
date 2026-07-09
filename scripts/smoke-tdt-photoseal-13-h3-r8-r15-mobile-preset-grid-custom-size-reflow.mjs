import fs from 'node:fs';

const required = [
  ['packages/photo-seal-web/src/components/preset/ExportPresetSelector.vue', 'data-mobile-grid-contract="three-columns-two-rows"'],
  ['packages/photo-seal-web/src/components/preset/ExportPresetSelector.vue', 'const presetCards = computed<readonly PhotoSealExportPreset[]>(() =>'],
  ['packages/photo-seal-web/src/components/preset/ExportPresetSelector.vue', 'createCustomPhotoSealExportPreset(customInput.value)'],
  ['packages/photo-seal-web/src/components/preset/ExportPresetSelector.vue', 'v-for="preset in presetCards"'],
  ['packages/photo-seal-web/src/components/preset/ExportPresetCard.vue', 'data-card-density="mobile-tile"'],
  ['packages/photo-seal-web/src/components/preset/CustomPresetFields.vue', 'custom-preset-fields__size-row'],
  ['packages/photo-seal-web/src/components/preset/CustomPresetFields.vue', 'custom-preset-fields__status-row'],
  ['packages/photo-seal-web/src/components/preset/CustomPresetFields.vue', 'custom-preset-fields__action-row'],
  ['packages/photo-seal-web/src/components/preset/CustomPresetFields.vue', 'data-layout-contract="mobile-two-row-width-driven-auto-height"'],
  ['packages/photo-seal-web/src/style.css', 'grid-template-columns: repeat(3, minmax(0, 1fr))'],
  ['packages/photo-seal-web/src/style.css', '.custom-preset-fields__auto-height-output'],
  ['specs/TDT_PHOTOSEAL_13_H3_R8_R15_MOBILE_PRESET_GRID_CUSTOM_SIZE_REFLOW_SPEC.md', 'TDT-PHOTOSEAL-13-H3-R8-R15'],
  ['packages/photo-seal-web/src/components/preset/CustomPresetFields.vue', 'data-mobile-form-contract="input-result-action-notice-stack"'],
];

const failures = [];
for (const [file, token] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(token)) {
    failures.push({ file, token });
  }
}

const style = fs.readFileSync('packages/photo-seal-web/src/style.css', 'utf8');
const r15Index = style.lastIndexOf('TDT-PHOTOSEAL-13-H3-R8-R15');
const r15Block = r15Index >= 0 ? style.slice(r15Index) : '';
if (!r15Block.includes('grid-template-columns: repeat(3, minmax(0, 1fr))')) {
  failures.push({ file: 'packages/photo-seal-web/src/style.css', token: 'R15 mobile preset grid 3 columns' });
}
if (r15Block.includes('.primary-flow-panel .export-preset-selector__grid {\n    grid-template-columns: 1fr;')) {
  failures.push({ file: 'packages/photo-seal-web/src/style.css', token: 'R15 must not restore mobile preset grid to one column' });
}

if (failures.length > 0) {
  console.error('FAIL_TDT_PHOTOSEAL_13_H3_R8_R15_MOBILE_PRESET_GRID_CUSTOM_SIZE_REFLOW');
  console.error(JSON.stringify({ failures }, null, 2));
  process.exit(1);
}

console.log('PASS_TDT_PHOTOSEAL_13_H3_R8_R15_MOBILE_PRESET_GRID_CUSTOM_SIZE_REFLOW');
