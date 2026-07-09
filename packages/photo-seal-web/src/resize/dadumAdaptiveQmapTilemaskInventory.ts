export type DadumAdaptiveQmapTilemaskInventory = {
  patchId: "TDT-PHOTOSEAL-03-R1";
  sourceProject: "DadumDadum";
  sourceRole: "reference-only";
  fullChainCandidateProfile: "dadum-adaptive-qmap-tilemask";
  defaultProfileChanged: false;
  simplifiedAdaptiveEwaAliasForbidden: true;
  requiredSourceFiles: string[];
  requiredSourceTokens: string[];
  importedFiles: string[];
  intentionallyOmitted: string[];
  unknownOrUnverified: string[];
};

export const DADUM_ADAPTIVE_QMAP_TILEMASK_SOURCE_INVENTORY: DadumAdaptiveQmapTilemaskInventory = {
  patchId: "TDT-PHOTOSEAL-03-R1",
  sourceProject: "DadumDadum",
  sourceRole: "reference-only",
  fullChainCandidateProfile: "dadum-adaptive-qmap-tilemask",
  defaultProfileChanged: false,
  simplifiedAdaptiveEwaAliasForbidden: true,
  requiredSourceFiles: [
    "app/core/compute/downscale_webgpu/adaptive_ewa_downscale_pass.js",
    "app/core/compute/downscale_webgpu/adaptive_ewa_downscale_rgba16f.wgsl",
    "app/core/compute/downscale_webgpu/downscale_pass.js",
    "app/core/compute/downscale_webgpu/downscale_box_bilinear_rgba16f.wgsl",
    "app/core/compute/downscale_webgpu/qmap_lod_meanmax_mix_pass.js",
    "app/core/compute/downscale_webgpu/qmap_lod_meanmax_mix_rgba16f.wgsl",
    "app/core/compute/downscale_webgpu/tilemask_from_qmap_pass.js",
    "app/core/compute/downscale_webgpu/tilemask_from_qmap.wgsl",
    "app/core/compute/qmap_webgpu/qmap_preprocess_adaptive_ewa_chain.js",
    "app/core/compute/qmap_webgpu/qmap_core.wgsl"
  ],
  requiredSourceTokens: [
    "createTileMaskFromQmapPass",
    "createDownscalePass",
    "createQmapLodMeanMaxMixPass",
    "tileMask",
    "tileMaskTex",
    "qmap",
    "fastTex",
    "anisoAspect",
    "anisoAngle",
    "deThresh",
    "deSoft",
    "srgbToLinear",
    "linearToOklab"
  ],
  importedFiles: [
    "packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskDownscale.ts",
    "packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskParams.ts",
    "packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskReceipt.ts",
    "packages/photo-seal-web/src/resize/dadumAdaptiveQmapTilemaskInventory.ts",
    "packages/photo-seal-web/src/resize/shaders/dadumQmapPreprocess.wgsl",
    "packages/photo-seal-web/src/resize/shaders/dadumQmapLodMeanMaxMix.wgsl",
    "packages/photo-seal-web/src/resize/shaders/dadumTileMaskFromQmap.wgsl",
    "packages/photo-seal-web/src/resize/shaders/dadumAdaptiveEwaDownscaleRgba16f.wgsl",
    "packages/photo-seal-web/src/resize/shaders/dadumEwaAnisoDownscaleRgba16f.wgsl",
    "packages/photo-seal-web/src/resize/shaders/dadumBoxBilinearDownscaleRgba16f.wgsl",
    "packages/photo-seal-web/src/resize/shaders/dadumRgba16fToRgba8SrgbCopy.wgsl"
  ],
  intentionallyOmitted: [
    "DadumDadum UI globals and tilemask overlay debug drawing are not imported into PhotoSeal.",
    "DadumDadum WebGPUChainRunner wrapper is not imported; PhotoSeal owns its Vite/Vue/WebGPU harness.",
    "ICC/profile correction routes are not imported; TDT-PHOTOSEAL-00-R2 keeps browser decode as sRGB RGBA8."
  ],
  unknownOrUnverified: []
};
