export type PhotoSealComplianceOverclaimCode =
  | "LEGAL_COMPLIANCE_GUARANTEE"
  | "INSTITUTION_UPLOAD_GUARANTEE"
  | "PERFECT_ID_PHOTO_CLAIM"
  | "PASSPORT_VISA_GUARANTEE"
  | "SUBMISSION_SUCCESS_GUARANTEE"
  | "HUNDRED_PERCENT_COMPATIBILITY_CLAIM";

export type PhotoSealComplianceOverclaimScanResult = {
  patchId: "TDT-PHOTOSEAL-12";
  scannedTextCount: number;
  overclaimDetected: boolean;
  detectedCodes: PhotoSealComplianceOverclaimCode[];
  officialComplianceGuaranteed: false;
  institutionUploadGuaranteed: false;
  legalRequirementVerified: false;
  noComplianceOverclaimSeal: true;
};

type OverclaimPattern = {
  code: PhotoSealComplianceOverclaimCode;
  pieces: readonly string[];
};

const OVERCLAIM_PATTERNS: readonly OverclaimPattern[] = [
  { code: "LEGAL_COMPLIANCE_GUARANTEE", pieces: ["legal", " compliance", " guarantee"] },
  { code: "INSTITUTION_UPLOAD_GUARANTEE", pieces: ["institution", " upload", " guarantee"] },
  { code: "PERFECT_ID_PHOTO_CLAIM", pieces: ["perfect", " id", " photo"] },
  { code: "PASSPORT_VISA_GUARANTEE", pieces: ["passport", " visa", " guarantee"] },
  { code: "SUBMISSION_SUCCESS_GUARANTEE", pieces: ["submission", " success", " guarantee"] },
  { code: "HUNDRED_PERCENT_COMPATIBILITY_CLAIM", pieces: ["100", "%", " compatible"] },

  { code: "LEGAL_COMPLIANCE_GUARANTEE", pieces: ["\uBC95\uC801", " \uADDC\uACA9", " \uBCF4\uC7A5"] },
  { code: "INSTITUTION_UPLOAD_GUARANTEE", pieces: ["\uAE30\uAD00", " \uC5C5\uB85C\uB4DC", " \uBCF4\uC7A5"] },
  { code: "PERFECT_ID_PHOTO_CLAIM", pieces: ["\uC644\uBCBD\uD55C", " \uC99D\uBA85", "\uC0AC\uC9C4"] },
  { code: "PASSPORT_VISA_GUARANTEE", pieces: ["\uC5EC\uAD8C", " \uC0AC\uC9C4", " \uADDC\uACA9", " \uBCF4\uC7A5"] },
  { code: "PASSPORT_VISA_GUARANTEE", pieces: ["\uBE44\uC790", " \uC0AC\uC9C4", " \uADDC\uACA9", " \uBCF4\uC7A5"] },
  { code: "SUBMISSION_SUCCESS_GUARANTEE", pieces: ["\uC81C\uCD9C", " \uC131\uACF5", " \uBCF4\uC7A5"] },
  { code: "SUBMISSION_SUCCESS_GUARANTEE", pieces: ["\uC2EC\uC0AC", " \uD1B5\uACFC", " \uBCF4\uC7A5"] },
  { code: "HUNDRED_PERCENT_COMPATIBILITY_CLAIM", pieces: ["100", "%", " \uD638\uD658"] },
];

function buildPatternText(pattern: OverclaimPattern): string {
  return pattern.pieces.join("").toLowerCase();
}

export function scanPhotoSealComplianceOverclaims(args: {
  texts: string[];
}): PhotoSealComplianceOverclaimScanResult {
  const joined = args.texts.join("\n").toLowerCase();

  const detectedCodes = OVERCLAIM_PATTERNS
    .filter((pattern) => joined.includes(buildPatternText(pattern)))
    .map((pattern) => pattern.code)
    .filter((code, index, all) => all.indexOf(code) === index);

  return {
    patchId: "TDT-PHOTOSEAL-12",
    scannedTextCount: args.texts.length,
    overclaimDetected: detectedCodes.length > 0,
    detectedCodes,
    officialComplianceGuaranteed: false,
    institutionUploadGuaranteed: false,
    legalRequirementVerified: false,
    noComplianceOverclaimSeal: true,
  };
}
