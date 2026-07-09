import fs from 'node:fs';

const required = [
  ['packages/photo-seal-web/src/components/preset/CustomPresetFields.vue', 'data-mobile-form-contract="input-result-action-notice-stack"'],
  ['packages/photo-seal-web/src/components/preset/CustomPresetFields.vue', 'custom-preset-fields__stack'],
  ['packages/photo-seal-web/src/components/preset/CustomPresetFields.vue', 'custom-preset-fields__size-row'],
  ['packages/photo-seal-web/src/components/preset/CustomPresetFields.vue', 'custom-preset-fields__status-row'],
  ['packages/photo-seal-web/src/components/preset/CustomPresetFields.vue', 'custom-preset-fields__action-row'],
  ['packages/photo-seal-web/src/components/preset/CustomPresetFields.vue', 'custom-preset-fields__compact-notice'],
  ['packages/photo-seal-web/src/style.css', '.custom-preset-fields__stack'],
  ['packages/photo-seal-web/src/style.css', 'grid-template-columns: minmax(0, 1fr)'],
  ['packages/photo-seal-web/src/style.css', 'overflow-wrap: anywhere'],
  ['specs/TDT_PHOTOSEAL_13_H3_R8_R16_MOBILE_CUSTOM_PRESET_FORM_STACK_SEAL_SPEC.md', 'TDT-PHOTOSEAL-13-H3-R8-R16'],
];

const forbidden = [
  ['packages/photo-seal-web/src/components/preset/CustomPresetFields.vue', 'custom-preset-fields__inline-row--auto-height'],
  ['packages/photo-seal-web/src/components/preset/CustomPresetFields.vue', 'custom-preset-fields__inline-row'],
  ['packages/photo-seal-web/src/style.css', '.custom-preset-fields__inline-row {'],
  ['packages/photo-seal-web/src/style.css', '.primary-flow-panel .custom-preset-fields__inline-row {'],
  ['packages/photo-seal-web/src/style.css', '.custom-preset-fields__inline-row.custom-preset-fields__inline-row--auto-height'],
];

const failures = [];
for (const [file, token] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(token)) failures.push({ type: 'missing', file, token });
}
for (const [file, token] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(token)) failures.push({ type: 'forbidden', file, token });
}

const style = fs.readFileSync('packages/photo-seal-web/src/style.css', 'utf8');
const r16Index = style.lastIndexOf('TDT-PHOTOSEAL-13-H3-R8-R16');
const r16Block = r16Index >= 0 ? style.slice(r16Index) : '';
if (!r16Block.includes('.custom-preset-fields__stack[data-mobile-form-contract="input-result-action-notice-stack"]')) {
  failures.push({ type: 'missing', file: 'packages/photo-seal-web/src/style.css', token: 'R16 stack contract selector' });
}
if (!r16Block.includes('grid-template-columns: minmax(0, 1fr)')) {
  failures.push({ type: 'missing', file: 'packages/photo-seal-web/src/style.css', token: 'R16 mobile one-column stack' });
}
if (!r16Block.includes('grid-template-columns: minmax(0, 1fr) 14px minmax(0, 1fr)')) {
  failures.push({ type: 'missing', file: 'packages/photo-seal-web/src/style.css', token: 'R16 size row three-cell layout' });
}

if (failures.length > 0) {
  console.error('FAIL_TDT_PHOTOSEAL_13_H3_R8_R16_MOBILE_CUSTOM_PRESET_FORM_STACK_SEAL');
  console.error(JSON.stringify({ failures }, null, 2));
  process.exit(1);
}

console.log('PASS_TDT_PHOTOSEAL_13_H3_R8_R16_MOBILE_CUSTOM_PRESET_FORM_STACK_SEAL');
