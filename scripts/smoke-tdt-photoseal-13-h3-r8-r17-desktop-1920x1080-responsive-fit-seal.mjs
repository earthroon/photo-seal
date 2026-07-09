import fs from 'node:fs';

const appPath = 'packages/photo-seal-web/src/App.vue';
const stylePath = 'packages/photo-seal-web/src/style.css';
const specPath = 'specs/TDT_PHOTOSEAL_13_H3_R8_R17_DESKTOP_1920X1080_RESPONSIVE_FIT_SEAL_SPEC.md';

const app = fs.readFileSync(appPath, 'utf8');
const style = fs.readFileSync(stylePath, 'utf8');
const spec = fs.readFileSync(specPath, 'utf8');
const customPresetPath = 'packages/photo-seal-web/src/components/preset/CustomPresetFields.vue';
const customPreset = fs.readFileSync(customPresetPath, 'utf8');
const failures = [];

const required = [
  [appPath, app, 'PhotoSealViewportLayout'],
  [appPath, app, 'viewportSize'],
  [appPath, app, 'syncViewportSize'],
  [appPath, app, 'viewportLayout'],
  [appPath, app, 'isDesktop1080Fit'],
  [appPath, app, ':data-viewport-layout="viewportLayout"'],
  [appPath, app, ':data-desktop-fit="isDesktop1080Fit ? \'1920x1080\' : \'off\'"'],
  [appPath, app, 'desktop-1080-fit'],
  [appPath, app, 'data-layout-contract="desktop-1080-fit-collapsed-resize-policy"'],
  [appPath, app, 'resizePolicyInfo && !isDesktop1080Fit'],
  [stylePath, style, 'TDT-PHOTOSEAL-13-H3-R8-R17'],
  [stylePath, style, '.photo-seal-shell[data-desktop-fit="1920x1080"]'],
  [stylePath, style, 'grid-template-rows: 68px minmax(0, 1fr) 22px'],
  [stylePath, style, 'width: min(100%, 1210px)'],
  [stylePath, style, 'height: clamp(170px, 22vh, 220px)'],
  [stylePath, style, '.resize-policy-details'],
  [stylePath, style, 'grid-template-columns: repeat(3, minmax(0, 1fr))'],
  [stylePath, style, '.custom-preset-fields__stack[data-mobile-form-contract="input-result-action-notice-stack"]'],
  [specPath, spec, 'TDT-PHOTOSEAL-13-H3-R8-R17'],
];

for (const [file, source, token] of required) {
  if (!source.includes(token)) {
    failures.push({ type: 'missing', file, token });
  }
}

const r17Index = style.lastIndexOf('TDT-PHOTOSEAL-13-H3-R8-R17');
if (r17Index < 0) {
  failures.push({ type: 'missing', file: stylePath, token: 'R17 block' });
} else {
  const r17Block = style.slice(r17Index);
  if (!r17Block.includes('.photo-seal-shell[data-desktop-fit="1920x1080"]')) {
    failures.push({ type: 'missing', file: stylePath, token: 'R17 desktop fit selector' });
  }
  if (/@media\s*\(max-width:\s*767px\)[\s\S]*data-desktop-fit="1920x1080"/.test(r17Block)) {
    failures.push({ type: 'forbidden', file: stylePath, token: 'desktop fit rule inside mobile media block' });
  }
}

const r15Index = style.lastIndexOf('TDT-PHOTOSEAL-13-H3-R8-R15');
const r15Block = r15Index >= 0 ? style.slice(r15Index) : '';
if (!r15Block.includes('grid-template-columns: repeat(3, minmax(0, 1fr))')) {
  failures.push({ type: 'regression', file: stylePath, token: 'R15 mobile 3-column preset grid' });
}
if (r15Block.includes('.primary-flow-panel .export-preset-selector__grid {\n    grid-template-columns: 1fr;')) {
  failures.push({ type: 'regression', file: stylePath, token: 'mobile preset grid restored to one column after R15' });
}

const r16Index = style.lastIndexOf('TDT-PHOTOSEAL-13-H3-R8-R16');
const r16Block = r16Index >= 0 ? style.slice(r16Index) : '';
if (!r16Block.includes('.custom-preset-fields__stack[data-mobile-form-contract="input-result-action-notice-stack"]')) {
  failures.push({ type: 'regression', file: stylePath, token: 'R16 custom stack contract' });
}
if (!customPreset.includes('data-mobile-form-contract="input-result-action-notice-stack"')) {
  failures.push({ type: 'regression', file: customPresetPath, token: 'R16 Vue custom stack contract' });
}

if (failures.length > 0) {
  console.error('FAIL_TDT_PHOTOSEAL_13_H3_R8_R17_DESKTOP_1920X1080_RESPONSIVE_FIT_SEAL');
  console.error(JSON.stringify({ failures }, null, 2));
  process.exit(1);
}

console.log('PASS_TDT_PHOTOSEAL_13_H3_R8_R17_DESKTOP_1920X1080_RESPONSIVE_FIT_SEAL');
