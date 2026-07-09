export type PhotoSealAutoDownloadGuardResult = {
  autoDownloadDetected: boolean;
  anchorClickCount: number;
  objectUrlCreateCount: number;
  objectUrlRevokeCount: number;
};

export function installPhotoSealNoAutoDownloadGuard(): {
  getResult(): PhotoSealAutoDownloadGuardResult;
  restore(): void;
} {
  const originalCreateObjectURL = URL.createObjectURL.bind(URL);
  const originalRevokeObjectURL = URL.revokeObjectURL.bind(URL);
  const originalClick = HTMLAnchorElement.prototype.click;

  let anchorClickCount = 0;
  let objectUrlCreateCount = 0;
  let objectUrlRevokeCount = 0;

  URL.createObjectURL = ((object: Blob | MediaSource) => {
    objectUrlCreateCount += 1;
    return originalCreateObjectURL(object);
  }) as typeof URL.createObjectURL;

  URL.revokeObjectURL = ((url: string) => {
    objectUrlRevokeCount += 1;
    return originalRevokeObjectURL(url);
  }) as typeof URL.revokeObjectURL;

  HTMLAnchorElement.prototype.click = function clickWithPhotoSealSaveSmokeSpy() {
    anchorClickCount += 1;
    return originalClick.call(this);
  };

  return {
    getResult(): PhotoSealAutoDownloadGuardResult {
      return {
        autoDownloadDetected: anchorClickCount > 0 || objectUrlCreateCount > 0,
        anchorClickCount,
        objectUrlCreateCount,
        objectUrlRevokeCount,
      };
    },
    restore(): void {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      HTMLAnchorElement.prototype.click = originalClick;
    },
  };
}

export const TDT_PHOTOSEAL_09_R1_NO_AUTO_DOWNLOAD_SEAL =
  "No Auto Download Seal: app load and hook registration must not trigger JPEG or audit bundle download.";
