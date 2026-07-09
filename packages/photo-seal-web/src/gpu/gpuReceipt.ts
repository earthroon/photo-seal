export type GPUDeviceReceipt = {
  patchId: "TDT-PHOTOSEAL-02";
  stage: "webgpu-device-request";
  requested: true;
  acquired: boolean;
};

export type GPUHarnessReceipt = {
  patchId: "TDT-PHOTOSEAL-02";
  stage: "webgpu-device-texture-readback-harness";
  fallbackUsed: false;
  device: {
    requested: true;
    acquired: boolean;
  };
  readback?: {
    width: number;
    height: number;
    format: "rgba8unorm";
    unpaddedBytesPerRow: number;
    paddedBytesPerRow: number;
    outputBytes: number;
  };
};

export function createGPUHarnessReceipt(args: {
  deviceAcquired: boolean;
  readback?: GPUHarnessReceipt["readback"];
}): GPUHarnessReceipt {
  return {
    patchId: "TDT-PHOTOSEAL-02",
    stage: "webgpu-device-texture-readback-harness",
    fallbackUsed: false,
    device: {
      requested: true,
      acquired: args.deviceAcquired,
    },
    ...(args.readback ? { readback: args.readback } : {}),
  };
}
