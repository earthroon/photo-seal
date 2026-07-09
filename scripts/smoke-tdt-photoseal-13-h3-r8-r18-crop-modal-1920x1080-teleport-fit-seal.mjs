import fs from "node:fs";

const app = fs.readFileSync("packages/photo-seal-web/src/App.vue", "utf8");
const modal = fs.readFileSync("packages/photo-seal-web/src/components/crop/PortraitCropModal.vue", "utf8");
const bar = fs.readFileSync("packages/photo-seal-web/src/components/crop/CropConfirmBar.vue", "utf8");
const style = fs.readFileSync("packages/photo-seal-web/src/style.css", "utf8");

const checks = [];
function check(name, ok) {
  checks.push({ name, ok });
}

check("App passes Vue3 viewport layout to teleported crop modal", app.includes(':viewport-layout="viewportLayout"') && app.includes(':desktop-fit="isDesktop1080Fit ? \'1920x1080\' : \'off\'"'));
check("PortraitCropModal declares viewport props", modal.includes('viewportLayout: PhotoSealViewportLayout') && modal.includes('desktopFit: PhotoSealDesktopFit'));
check("PortraitCropModal root owns data viewport attributes", modal.includes(':data-viewport-layout="props.viewportLayout"') && modal.includes(':data-desktop-fit="props.desktopFit"'));
check("PortraitCropModal groups footer stack", modal.includes('portrait-crop-modal__footer-stack') && modal.indexOf('portrait-crop-modal__footer-stack') < modal.indexOf('<CropConfirmBar'));
check("CropConfirmBar isolates primary action", bar.includes('crop-confirm-action--confirm') && bar.includes('primary-action crop-confirm-action'));
check("R18 modal fit selector exists", style.includes('.portrait-crop-modal[data-desktop-fit="1920x1080"]'));
check("R18 modal panel has 3-row fit grid", style.includes('grid-template-rows: auto minmax(0, 1fr) auto;'));
check("R18 stage uses bounded middle row", style.includes('.portrait-crop-modal[data-desktop-fit="1920x1080"] .portrait-crop-stage') && style.includes('height: 100%;') && style.includes('min-height: 0;'));
check("Desktop crop buttons override global primary width", style.includes('@media (min-width: 768px)') && style.includes('.crop-confirm-actions .crop-confirm-action') && style.includes('width: auto;') && style.includes('.crop-confirm-actions .crop-confirm-action--confirm'));
check("Mobile crop actions remain two-column", style.includes('@media (max-width: 767px)') && style.includes('grid-template-columns: repeat(2, minmax(0, 1fr));'));
check("No shell-only dependency for crop modal fit", !style.includes('.photo-seal-shell[data-desktop-fit="1920x1080"] .portrait-crop-modal'));

const failed = checks.filter((item) => !item.ok);
if (failed.length > 0) {
  console.error("FAIL_TDT_PHOTOSEAL_13_H3_R8_R18_CROP_MODAL_1920X1080_TELEPORT_FIT_SEAL");
  for (const item of failed) console.error(`- ${item.name}`);
  process.exit(1);
}

console.log("PASS_TDT_PHOTOSEAL_13_H3_R8_R18_CROP_MODAL_1920X1080_TELEPORT_FIT_SEAL");
