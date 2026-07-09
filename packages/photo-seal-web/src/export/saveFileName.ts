import type { PhotoSealSafeFileName } from "./saveTypes";

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const PATH_CHARS = /[\\/:*?"<>|]+/g;
const TRAILING_DOTS_SPACES = /[.\s]+$/g;

function stripKnownExtension(name: string): string {
  return name.replace(/\.(jpe?g|jpeg|png|webp|json)$/i, "");
}

function normalizeBaseName(name: string): { baseName: string; sanitized: boolean } {
  const original = name;
  const withoutPath = name.split(/[\\/]/).filter(Boolean).pop() ?? name;
  const stripped = stripKnownExtension(withoutPath)
    .replace(CONTROL_CHARS, "")
    .replace(PATH_CHARS, "-")
    .replace(/\s+/g, " ")
    .replace(TRAILING_DOTS_SPACES, "")
    .trim();
  const baseName = stripped.length > 0 ? stripped : "photoseal-export";
  return { baseName, sanitized: baseName !== original };
}

export function sanitizePhotoSealFileName(args: {
  inputName?: string;
  fallbackBaseName: string;
  extension: "jpg" | "json";
}): PhotoSealSafeFileName {
  const seed = args.inputName && args.inputName.trim().length > 0 ? args.inputName : args.fallbackBaseName;
  const normalized = normalizeBaseName(seed);
  const suffix = args.extension === "jpg" ? "photoseal" : "photoseal_audit";
  const fileName = `${normalized.baseName}_${suffix}.${args.extension}`;
  return {
    baseName: normalized.baseName,
    extension: args.extension,
    fileName,
    sanitized: normalized.sanitized || seed !== fileName,
  };
}
