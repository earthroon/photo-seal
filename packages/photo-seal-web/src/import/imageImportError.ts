export type PhotoSealImageImportErrorCode =
  | "UNSUPPORTED_MIME_TYPE"
  | "EMPTY_FILE"
  | "BROWSER_DECODE_FAILED"
  | "IMAGE_DIMENSION_INVALID"
  | "IMAGE_BITMAP_UNAVAILABLE"
  | "OBJECT_URL_REVOKE_FAILED"
  | "CANVAS_DECODE_PATH_FORBIDDEN"
  | "COLOR_SPACE_RECEIPT_MISSING";

export class PhotoSealImageImportError extends Error {
  readonly code: PhotoSealImageImportErrorCode;

  constructor(code: PhotoSealImageImportErrorCode, message: string) {
    super(message);
    this.name = "PhotoSealImageImportError";
    this.code = code;
  }
}
