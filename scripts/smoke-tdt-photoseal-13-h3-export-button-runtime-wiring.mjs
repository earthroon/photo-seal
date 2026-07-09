import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = JSON.parse(fs.readFileSync(path.join(root, 'specs/TDT_PHOTOSEAL_13_H3_STATIC_CHECKS.json'), 'utf8'));
const failures = [];

for (const file of checks.required_files) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`missing file: ${file}`);
}

const searchableFiles = checks.required_files.filter((file) => fs.existsSync(path.join(root, file)));
const corpus = searchableFiles.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const token of checks.required_tokens) {
  if (!corpus.includes(token)) failures.push(`missing token: ${token}`);
}
for (const token of checks.forbidden_tokens) {
  if (corpus.includes(token)) failures.push(`forbidden token: ${token}`);
}

const result = {
  patchId: 'TDT-PHOTOSEAL-13-H3',
  staticContractSmoke: failures.length === 0 ? 'PASS' : 'FAIL',
  failures,
  marker: failures.length === 0
    ? 'PASS_TDT_PHOTOSEAL_13_H3_EXPORT_BUTTON_JPEG_DOWNLOAD_WIRING'
    : 'FAIL_TDT_PHOTOSEAL_13_H3_EXPORT_BUTTON_JPEG_DOWNLOAD_WIRING',
};
fs.mkdirSync(path.join(root, 'artifacts'), { recursive: true });
fs.writeFileSync(path.join(root, 'artifacts/TDT_PHOTOSEAL_13_H3_STATIC_CHECK_RESULT.json'), JSON.stringify(result, null, 2));
console.log(result.marker);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
