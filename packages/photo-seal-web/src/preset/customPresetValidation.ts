import type {
  PhotoSealCustomPresetFieldId,
  PhotoSealCustomPresetFieldValidation,
  PhotoSealCustomPresetValidationCode,
  PhotoSealCustomPresetValidationResult,
} from "./customPresetValidationTypes";

const MIN_DIMENSION = 64;
const MAX_DIMENSION = 4096;
const MIN_TARGET_BYTES = 10240;
const MAX_TARGET_BYTES = 10485760;
const MAX_LABEL_LENGTH = 80;
const INTEGER_PATTERN = /^[-+]?\d+$/u;

type NumericRule = {
  fieldId: Extract<PhotoSealCustomPresetFieldId, "width" | "height" | "targetBytes">;
  requiredCode: PhotoSealCustomPresetValidationCode;
  notIntegerCode: PhotoSealCustomPresetValidationCode;
  tooSmallCode: PhotoSealCustomPresetValidationCode;
  tooLargeCode: PhotoSealCustomPresetValidationCode;
  min: number;
  max: number;
  label: string;
};

function trimInput(value: string | undefined): string {
  return value === undefined ? "" : value.trim();
}

function makeField(args: {
  fieldId: PhotoSealCustomPresetFieldId;
  status: "valid" | "invalid" | "empty";
  code?: PhotoSealCustomPresetValidationCode;
  message: string;
  originalInput: string;
  parsedValue?: number | string;
}): PhotoSealCustomPresetFieldValidation {
  return {
    fieldId: args.fieldId,
    status: args.status,
    code: args.code,
    message: args.message,
    originalInput: args.originalInput,
    parsedValue: args.parsedValue,
    clamped: false,
  };
}

function validateIntegerField(rawInput: string, rule: NumericRule): PhotoSealCustomPresetFieldValidation {
  const normalized = trimInput(rawInput);
  if (normalized.length === 0) {
    return makeField({
      fieldId: rule.fieldId,
      status: "empty",
      code: rule.requiredCode,
      message: `${rule.label} 값을 입력해 주세요.`,
      originalInput: rawInput,
    });
  }
  if (!INTEGER_PATTERN.test(normalized)) {
    return makeField({
      fieldId: rule.fieldId,
      status: "invalid",
      code: rule.notIntegerCode,
      message: `${rule.label} 값은 정수여야 합니다. 입력값은 자동 보정되지 않습니다.`,
      originalInput: rawInput,
    });
  }
  const value = Number(normalized);
  if (!Number.isSafeInteger(value)) {
    return makeField({
      fieldId: rule.fieldId,
      status: "invalid",
      code: rule.notIntegerCode,
      message: `${rule.label} 값은 안전한 정수 범위 안이어야 합니다.`,
      originalInput: rawInput,
    });
  }
  if (value < rule.min) {
    return makeField({
      fieldId: rule.fieldId,
      status: "invalid",
      code: rule.tooSmallCode,
      message: `${rule.label} 값은 ${rule.min} 이상이어야 합니다. 범위를 벗어난 값은 적용되지 않습니다.`,
      originalInput: rawInput,
      parsedValue: value,
    });
  }
  if (value > rule.max) {
    return makeField({
      fieldId: rule.fieldId,
      status: "invalid",
      code: rule.tooLargeCode,
      message: `${rule.label} 값은 ${rule.max} 이하여야 합니다. 범위를 벗어난 값은 적용되지 않습니다.`,
      originalInput: rawInput,
      parsedValue: value,
    });
  }
  return makeField({
    fieldId: rule.fieldId,
    status: "valid",
    message: `${rule.label} 값이 유효합니다.`,
    originalInput: rawInput,
    parsedValue: value,
  });
}

function validateLabel(rawInput: string | undefined): PhotoSealCustomPresetFieldValidation {
  const normalized = trimInput(rawInput);
  if (normalized.length > MAX_LABEL_LENGTH) {
    return makeField({
      fieldId: "label",
      status: "invalid",
      code: "LABEL_TOO_LONG",
      message: `라벨은 ${MAX_LABEL_LENGTH}자 이하여야 합니다.`,
      originalInput: rawInput ?? "",
    });
  }
  return makeField({
    fieldId: "label",
    status: "valid",
    message: normalized.length > 0 ? "라벨을 사용할 수 있습니다." : "라벨은 선택 항목입니다.",
    originalInput: rawInput ?? "",
    parsedValue: normalized.length > 0 ? normalized : undefined,
  });
}

function codeList(fields: PhotoSealCustomPresetFieldValidation[]): PhotoSealCustomPresetValidationCode[] {
  return fields.flatMap((field) => (field.code ? [field.code] : []));
}

function numericParsedValue(field: PhotoSealCustomPresetFieldValidation): number | undefined {
  return typeof field.parsedValue === "number" ? field.parsedValue : undefined;
}

export function validateCustomPresetInput(args: {
  widthInput: string;
  heightInput: string;
  targetBytesInput: string;
  labelInput?: string;
}): PhotoSealCustomPresetValidationResult {
  const widthField = validateIntegerField(args.widthInput, {
    fieldId: "width",
    requiredCode: "WIDTH_REQUIRED",
    notIntegerCode: "WIDTH_NOT_INTEGER",
    tooSmallCode: "WIDTH_TOO_SMALL",
    tooLargeCode: "WIDTH_TOO_LARGE",
    min: MIN_DIMENSION,
    max: MAX_DIMENSION,
    label: "너비",
  });
  const heightField = validateIntegerField(args.heightInput, {
    fieldId: "height",
    requiredCode: "HEIGHT_REQUIRED",
    notIntegerCode: "HEIGHT_NOT_INTEGER",
    tooSmallCode: "HEIGHT_TOO_SMALL",
    tooLargeCode: "HEIGHT_TOO_LARGE",
    min: MIN_DIMENSION,
    max: MAX_DIMENSION,
    label: "높이",
  });
  const targetBytesField = validateIntegerField(args.targetBytesInput, {
    fieldId: "targetBytes",
    requiredCode: "TARGET_BYTES_REQUIRED",
    notIntegerCode: "TARGET_BYTES_NOT_INTEGER",
    tooSmallCode: "TARGET_BYTES_TOO_SMALL",
    tooLargeCode: "TARGET_BYTES_TOO_LARGE",
    min: MIN_TARGET_BYTES,
    max: MAX_TARGET_BYTES,
    label: "목표 용량",
  });
  const labelField = validateLabel(args.labelInput);
  const fields = [widthField, heightField, targetBytesField, labelField];
  const isValid = fields.every((field) => field.status === "valid");
  const width = numericParsedValue(widthField);
  const height = numericParsedValue(heightField);
  const targetBytes = numericParsedValue(targetBytesField);
  const label = typeof labelField.parsedValue === "string" ? labelField.parsedValue : undefined;
  return {
    patchId: "TDT-PHOTOSEAL-11-R2",
    stage: "custom-preset-validation-ux-no-clamp-feedback-ambiguity",
    status: isValid ? "valid" : "invalid",
    originalWidthInput: args.widthInput,
    originalHeightInput: args.heightInput,
    originalTargetBytesInput: args.targetBytesInput,
    originalLabelInput: args.labelInput,
    width: isValid ? width : undefined,
    height: isValid ? height : undefined,
    targetBytes: isValid ? targetBytes : undefined,
    label: isValid ? label : undefined,
    fields,
    clampApplied: false,
    fallbackPresetUsed: false,
    silentCorrectionUsed: false,
    canApply: isValid,
  };
}

export function getCustomPresetValidationCodes(
  validation: PhotoSealCustomPresetValidationResult
): PhotoSealCustomPresetValidationCode[] {
  return codeList(validation.fields);
}
