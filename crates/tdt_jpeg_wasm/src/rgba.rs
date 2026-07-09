// TDT-JPEG-WASM-02-R2: rgba_to_rgb preserves sRGB channel interpretation.
// This function applies alpha policy only; it performs no gamma correction, no linearization, and no color-space conversion.
use crate::{alpha::AlphaPolicy, error::TdtJpegWasmError, validate::validate_rgba_len};

pub fn rgba_to_rgb(
    rgba: &[u8],
    width: u32,
    height: u32,
    alpha_policy: AlphaPolicy,
) -> Result<Vec<u8>, TdtJpegWasmError> {
    validate_rgba_len(rgba, width, height)?;
    let pixel_count = rgba.len() / 4;
    let mut rgb = Vec::with_capacity(pixel_count * 3);

    for px in rgba.chunks_exact(4) {
        let r = px[0];
        let g = px[1];
        let b = px[2];
        let a = px[3];
        match alpha_policy {
            AlphaPolicy::Discard => {
                rgb.push(r);
                rgb.push(g);
                rgb.push(b);
            }
            AlphaPolicy::WhiteComposite => {
                rgb.push(composite_over_white(r, a));
                rgb.push(composite_over_white(g, a));
                rgb.push(composite_over_white(b, a));
            }
        }
    }

    Ok(rgb)
}

fn composite_over_white(src: u8, alpha: u8) -> u8 {
    let a = alpha as u16;
    let inv_a = 255u16 - a;
    ((src as u16 * a + 255u16 * inv_a + 127u16) / 255u16) as u8
}
