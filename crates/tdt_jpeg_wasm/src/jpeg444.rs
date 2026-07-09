use crate::{
    audit::{audit_jpeg_sampling_factors, validate_jpeg_magic},
    error::TdtJpegWasmError,
    types::JpegCompressionControl,
    validate::{validate_compression_control, validate_dimensions, validate_rgb_len},
};

const ZIGZAG: [usize; 64] = [
    0, 1, 8, 16, 9, 2, 3, 10,
    17, 24, 32, 25, 18, 11, 4, 5,
    12, 19, 26, 33, 40, 48, 41, 34,
    27, 20, 13, 6, 7, 14, 21, 28,
    35, 42, 49, 56, 57, 50, 43, 36,
    29, 22, 15, 23, 30, 37, 44, 51,
    58, 59, 52, 45, 38, 31, 39, 46,
    53, 60, 61, 54, 47, 55, 62, 63,
];

const STD_LUMA_Q: [u8; 64] = [
    16, 11, 10, 16, 24, 40, 51, 61,
    12, 12, 14, 19, 26, 58, 60, 55,
    14, 13, 16, 24, 40, 57, 69, 56,
    14, 17, 22, 29, 51, 87, 80, 62,
    18, 22, 37, 56, 68, 109, 103, 77,
    24, 35, 55, 64, 81, 104, 113, 92,
    49, 64, 78, 87, 103, 121, 120, 101,
    72, 92, 95, 98, 112, 100, 103, 99,
];

const STD_CHROMA_Q: [u8; 64] = [
    17, 18, 24, 47, 99, 99, 99, 99,
    18, 21, 26, 66, 99, 99, 99, 99,
    24, 26, 56, 99, 99, 99, 99, 99,
    47, 66, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99,
];

const STD_DC_LUMA_BITS: [u8; 16] = [0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
const STD_DC_LUMA_VALS: [u8; 12] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const STD_AC_LUMA_BITS: [u8; 16] = [0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
const STD_AC_LUMA_VALS: [u8; 162] = [
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12,
    0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
    0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
    0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0,
    0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0A, 0x16,
    0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
    0x3A, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
    0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
    0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
    0x6A, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79,
    0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98,
    0x99, 0x9A, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7,
    0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6,
    0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5,
    0xC6, 0xC7, 0xC8, 0xC9, 0xCA, 0xD2, 0xD3, 0xD4,
    0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
    0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA,
    0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8,
    0xF9, 0xFA,
];
const STD_DC_CHROMA_BITS: [u8; 16] = [0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
const STD_DC_CHROMA_VALS: [u8; 12] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const STD_AC_CHROMA_BITS: [u8; 16] = [0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77];
const STD_AC_CHROMA_VALS: [u8; 162] = [
    0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21,
    0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71,
    0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91,
    0xA1, 0xB1, 0xC1, 0x09, 0x23, 0x33, 0x52, 0xF0,
    0x15, 0x62, 0x72, 0xD1, 0x0A, 0x16, 0x24, 0x34,
    0xE1, 0x25, 0xF1, 0x17, 0x18, 0x19, 0x1A, 0x26,
    0x27, 0x28, 0x29, 0x2A, 0x35, 0x36, 0x37, 0x38,
    0x39, 0x3A, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
    0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58,
    0x59, 0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
    0x69, 0x6A, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78,
    0x79, 0x7A, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
    0x88, 0x89, 0x8A, 0x92, 0x93, 0x94, 0x95, 0x96,
    0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3, 0xA4, 0xA5,
    0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4,
    0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3,
    0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9, 0xCA, 0xD2,
    0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA,
    0xE2, 0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9,
    0xEA, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8,
    0xF9, 0xFA,
];

#[derive(Clone, Copy, Default)]
struct HuffCode {
    code: u16,
    len: u8,
}

struct BitWriter {
    out: Vec<u8>,
    acc: u32,
    nbits: u8,
}

impl BitWriter {
    fn new() -> Self { Self { out: Vec::new(), acc: 0, nbits: 0 } }
    fn write(&mut self, bits: u16, len: u8) {
        if len == 0 { return; }
        self.acc = (self.acc << len) | bits as u32;
        self.nbits += len;
        while self.nbits >= 8 {
            let shift = self.nbits - 8;
            let byte = ((self.acc >> shift) & 0xFF) as u8;
            self.out.push(byte);
            if byte == 0xFF { self.out.push(0x00); }
            self.nbits -= 8;
            self.acc &= (1u32 << self.nbits) - 1;
        }
    }
    fn finish(mut self) -> Vec<u8> {
        if self.nbits > 0 {
            let byte = ((self.acc << (8 - self.nbits)) | ((1u32 << (8 - self.nbits)) - 1)) as u8;
            self.out.push(byte);
            if byte == 0xFF { self.out.push(0x00); }
        }
        self.out
    }
}

pub fn encode_rgb_to_jpeg_444_with_control(
    rgb: &[u8],
    width: u32,
    height: u32,
    compression: JpegCompressionControl,
    color_space: ColorSpace,
) -> Result<Vec<u8>, TdtJpegWasmError> {
    validate_dimensions(width, height)?;
    validate_rgb_len(rgb, width, height)?;
    validate_compression_control(&compression)?;
    validate_color_space(color_space)?;

    let q_luma = scale_quant_table(STD_LUMA_Q, compression.quality);
    let q_chroma = scale_quant_table(STD_CHROMA_Q, compression.quality);
    let dc_luma = build_huffman(&STD_DC_LUMA_BITS, &STD_DC_LUMA_VALS);
    let ac_luma = build_huffman(&STD_AC_LUMA_BITS, &STD_AC_LUMA_VALS);
    let dc_chroma = build_huffman(&STD_DC_CHROMA_BITS, &STD_DC_CHROMA_VALS);
    let ac_chroma = build_huffman(&STD_AC_CHROMA_BITS, &STD_AC_CHROMA_VALS);

    let mut out = Vec::new();
    write_marker(&mut out, 0xD8);
    write_app0(&mut out);
    write_dqt(&mut out, 0, &q_luma);
    write_dqt(&mut out, 1, &q_chroma);
    write_sof0_444(&mut out, width, height)?;
    write_dht(&mut out, 0, 0, &STD_DC_LUMA_BITS, &STD_DC_LUMA_VALS);
    write_dht(&mut out, 1, 0, &STD_AC_LUMA_BITS, &STD_AC_LUMA_VALS);
    write_dht(&mut out, 0, 1, &STD_DC_CHROMA_BITS, &STD_DC_CHROMA_VALS);
    write_dht(&mut out, 1, 1, &STD_AC_CHROMA_BITS, &STD_AC_CHROMA_VALS);
    write_sos(&mut out);

    let mut bw = BitWriter::new();
    let mut prev = [0i32; 3];
    let blocks_x = (width as usize + 7) / 8;
    let blocks_y = (height as usize + 7) / 8;
    for by in 0..blocks_y {
        for bx in 0..blocks_x {
            let mut y = [0f32; 64];
            let mut cb = [0f32; 64];
            let mut cr = [0f32; 64];
            fill_ycbcr_blocks(rgb, width as usize, height as usize, bx, by, &mut y, &mut cb, &mut cr);
            encode_block(&mut bw, &fdct_quant(&y, &q_luma), &mut prev[0], &dc_luma, &ac_luma);
            encode_block(&mut bw, &fdct_quant(&cb, &q_chroma), &mut prev[1], &dc_chroma, &ac_chroma);
            encode_block(&mut bw, &fdct_quant(&cr, &q_chroma), &mut prev[2], &dc_chroma, &ac_chroma);
        }
    }
    out.extend_from_slice(&bw.finish());
    write_marker(&mut out, 0xD9);
    validate_jpeg_magic(&out)?;
    let audit = audit_jpeg_sampling_factors(&out)?;
    if !audit.is_444 {
        return Err(TdtJpegWasmError::JpegSamplingAuditFailed);
    }
    Ok(out)
}

pub fn encode_rgb_to_jpeg_444(
    rgb: &[u8],
    width: u32,
    height: u32,
    quality: u8,
) -> Result<Vec<u8>, TdtJpegWasmError> {
    encode_rgb_to_jpeg_444_with_control(rgb, width, height, JpegCompressionControl::explicit_quality(quality), ColorSpace::Srgb)
}

fn fill_ycbcr_blocks(rgb: &[u8], width: usize, height: usize, bx: usize, by: usize, y: &mut [f32; 64], cb: &mut [f32; 64], cr: &mut [f32; 64]) {
    for yy in 0..8 {
        let sy = (by * 8 + yy).min(height - 1);
        for xx in 0..8 {
            let sx = (bx * 8 + xx).min(width - 1);
            let idx = (sy * width + sx) * 3;
            let r = rgb[idx] as f32;
            let g = rgb[idx + 1] as f32;
            let b = rgb[idx + 2] as f32;
            let p = yy * 8 + xx;
            y[p] = 0.299 * r + 0.587 * g + 0.114 * b - 128.0;
            cb[p] = -0.168736 * r - 0.331264 * g + 0.5 * b;
            cr[p] = 0.5 * r - 0.418688 * g - 0.081312 * b;
        }
    }
}

fn fdct_quant(block: &[f32; 64], q: &[u8; 64]) -> [i32; 64] {
    let mut out = [0i32; 64];
    for v in 0..8 {
        for u in 0..8 {
            let cu = if u == 0 { 1.0f32 / 2.0f32.sqrt() } else { 1.0 };
            let cv = if v == 0 { 1.0f32 / 2.0f32.sqrt() } else { 1.0 };
            let mut sum = 0.0f32;
            for y in 0..8 {
                for x in 0..8 {
                    let a = ((2 * x + 1) as f32 * u as f32 * core::f32::consts::PI / 16.0).cos();
                    let b = ((2 * y + 1) as f32 * v as f32 * core::f32::consts::PI / 16.0).cos();
                    sum += block[y * 8 + x] * a * b;
                }
            }
            let coeff = 0.25 * cu * cv * sum;
            out[v * 8 + u] = (coeff / q[v * 8 + u] as f32).round() as i32;
        }
    }
    let mut zz = [0i32; 64];
    for i in 0..64 {
        zz[i] = out[ZIGZAG[i]];
    }
    zz
}

fn encode_block(bw: &mut BitWriter, block: &[i32; 64], prev_dc: &mut i32, dc: &[HuffCode; 256], ac: &[HuffCode; 256]) {
    let diff = block[0] - *prev_dc;
    *prev_dc = block[0];
    let cat = magnitude_category(diff);
    let h = dc[cat as usize];
    bw.write(h.code, h.len);
    if cat > 0 { bw.write(amplitude_bits(diff, cat), cat); }

    let mut run = 0u8;
    for &v in &block[1..] {
        if v == 0 {
            run += 1;
            if run == 16 {
                let zrl = ac[0xF0];
                bw.write(zrl.code, zrl.len);
                run = 0;
            }
        } else {
            let size = magnitude_category(v);
            let sym = ((run as usize) << 4) | size as usize;
            let h = ac[sym];
            bw.write(h.code, h.len);
            bw.write(amplitude_bits(v, size), size);
            run = 0;
        }
    }
    if run > 0 {
        let eob = ac[0];
        bw.write(eob.code, eob.len);
    }
}

fn magnitude_category(v: i32) -> u8 {
    if v == 0 { return 0; }
    let mut n = if v < 0 { -v } else { v } as u32;
    let mut cat = 0u8;
    while n > 0 { cat += 1; n >>= 1; }
    cat
}

fn amplitude_bits(v: i32, size: u8) -> u16 {
    if v >= 0 { v as u16 } else { ((1i32 << size) - 1 + v) as u16 }
}

fn build_huffman(bits: &[u8; 16], vals: &[u8]) -> [HuffCode; 256] {
    let mut table = [HuffCode::default(); 256];
    let mut code = 0u16;
    let mut k = 0usize;
    for (i, &count) in bits.iter().enumerate() {
        let len = (i + 1) as u8;
        for _ in 0..count {
            let val = vals[k] as usize;
            table[val] = HuffCode { code, len };
            code += 1;
            k += 1;
        }
        code <<= 1;
    }
    table
}

fn scale_quant_table(base: [u8; 64], quality: u8) -> [u8; 64] {
    let q = quality.clamp(1, 100) as i32;
    let scale = if q < 50 { 5000 / q } else { 200 - q * 2 };
    let mut out = [0u8; 64];
    for (i, &v) in base.iter().enumerate() {
        let scaled = ((v as i32 * scale + 50) / 100).clamp(1, 255);
        out[i] = scaled as u8;
    }
    out
}

fn write_marker(out: &mut Vec<u8>, marker: u8) { out.extend_from_slice(&[0xFF, marker]); }
fn write_u16(out: &mut Vec<u8>, v: u16) { out.extend_from_slice(&v.to_be_bytes()); }

fn write_app0(out: &mut Vec<u8>) {
    write_marker(out, 0xE0);
    write_u16(out, 16);
    out.extend_from_slice(b"JFIF\0");
    out.extend_from_slice(&[1, 1, 0, 0, 1, 0, 1, 0, 0]);
}

fn write_dqt(out: &mut Vec<u8>, table_id: u8, q: &[u8; 64]) {
    write_marker(out, 0xDB);
    write_u16(out, 67);
    out.push(table_id & 0x0F);
    for &idx in &ZIGZAG { out.push(q[idx]); }
}

fn write_sof0_444(out: &mut Vec<u8>, width: u32, height: u32) -> Result<(), TdtJpegWasmError> {
    if width > u16::MAX as u32 || height > u16::MAX as u32 {
        return Err(TdtJpegWasmError::InvalidDimension { width, height });
    }
    write_marker(out, 0xC0);
    write_u16(out, 17);
    out.push(8);
    write_u16(out, height as u16);
    write_u16(out, width as u16);
    out.push(3);
    out.extend_from_slice(&[1, 0x11, 0]);
    out.extend_from_slice(&[2, 0x11, 1]);
    out.extend_from_slice(&[3, 0x11, 1]);
    Ok(())
}

fn write_dht(out: &mut Vec<u8>, class: u8, table_id: u8, bits: &[u8; 16], vals: &[u8]) {
    write_marker(out, 0xC4);
    write_u16(out, (3 + 16 + vals.len()) as u16);
    out.push((class << 4) | table_id);
    out.extend_from_slice(bits);
    out.extend_from_slice(vals);
}

fn write_sos(out: &mut Vec<u8>) {
    write_marker(out, 0xDA);
    write_u16(out, 12);
    out.push(3);
    out.extend_from_slice(&[1, 0x00, 2, 0x11, 3, 0x11]);
    out.extend_from_slice(&[0, 63, 0]);
}
