import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";
import { registerPhotoSealE2ESmoke } from "./dev/registerPhotoSealE2ESmoke";
import { registerPhotoSealSaveSmoke } from "./dev/registerPhotoSealSaveSmoke";
import { registerPhotoSealPresetSmoke } from "./dev/registerPhotoSealPresetSmoke";
import { registerPhotoSealCustomPresetValidationSmoke } from "./dev/registerPhotoSealCustomPresetValidationSmoke";
import { registerPhotoSealPresetDocumentationSmoke } from "./dev/registerPhotoSealPresetDocumentationSmoke";
import { registerPhotoSealDocumentationUiSmoke } from "./dev/registerPhotoSealDocumentationUiSmoke";
import { registerPhotoSealExportFlowSmoke } from "./dev/registerPhotoSealExportFlowSmoke";

registerPhotoSealE2ESmoke();
registerPhotoSealSaveSmoke();
registerPhotoSealPresetSmoke();
registerPhotoSealCustomPresetValidationSmoke();
registerPhotoSealPresetDocumentationSmoke();
registerPhotoSealDocumentationUiSmoke();
registerPhotoSealExportFlowSmoke();

createApp(App).mount("#app");
