use crate::{error::TdtJpegWasmError, receipt::JpegSamplingAudit};

pub fn validate_jpeg_magic(jpg: &[u8]) -> Result<(), TdtJpegWasmError> {
    let starts = jpg.len() >= 4 && jpg[0] == 0xFF && jpg[1] == 0xD8;
    let ends = jpg.len() >= 4 && jpg[jpg.len() - 2] == 0xFF && jpg[jpg.len() - 1] == 0xD9;
    match starts && ends {
        true => Ok(()),
        false => Err(TdtJpegWasmError::JpegMagicInvalid),
    }
}

pub fn audit_jpeg_sampling_factors(jpg: &[u8]) -> Result<JpegSamplingAudit, TdtJpegWasmError> {
    validate_jpeg_magic(jpg)?;
    let mut i = 2usize;
    while i + 3 < jpg.len() {
        if jpg[i] != 0xFF {
            i += 1;
            continue;
        }
        while i < jpg.len() && jpg[i] == 0xFF {
            i += 1;
        }
        if i >= jpg.len() {
            break;
        }
        let marker = jpg[i];
        i += 1;
        match marker {
            0xD9 | 0xDA => break,
            0x01 | 0xD0..=0xD7 => continue,
            _ => {}
        }
        if i + 1 >= jpg.len() {
            break;
        }
        let len = u16::from_be_bytes([jpg[i], jpg[i + 1]]) as usize;
        if len < 2 || i + len > jpg.len() {
            return Err(TdtJpegWasmError::JpegSamplingAuditFailed);
        }
        if marker == 0xC0 || marker == 0xC2 {
            if len < 8 {
                return Err(TdtJpegWasmError::JpegSamplingAuditFailed);
            }
            let components = jpg[i + 7] as usize;
            if components != 3 || len < 8 + components * 3 {
                return Err(TdtJpegWasmError::JpegSamplingAuditFailed);
            }
            let y = jpg[i + 9];
            let cb = jpg[i + 12];
            let cr = jpg[i + 15];
            let audit = JpegSamplingAudit {
                y_h: y >> 4,
                y_v: y & 0x0F,
                cb_h: cb >> 4,
                cb_v: cb & 0x0F,
                cr_h: cr >> 4,
                cr_v: cr & 0x0F,
                is_444: y == 0x11 && cb == 0x11 && cr == 0x11,
            };
            return match audit.is_444 {
                true => Ok(audit),
                false => Err(TdtJpegWasmError::JpegSamplingAuditFailed),
            };
        }
        i += len;
    }
    Err(TdtJpegWasmError::JpegSamplingAuditFailed)
}
