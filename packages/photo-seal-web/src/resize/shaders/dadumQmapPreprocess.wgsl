// app/core/compute/qmap_webgpu/qmap_core.wgsl
struct Params {
  width: u32,
  height: u32,
  k0: f32,
  k1: f32,
  gammaK: f32,
  lumaR: f32,
  lumaG: f32,
  lumaB: f32,
};

@group(0) @binding(0) var samp : sampler;
@group(0) @binding(1) var src  : texture_2d<f32>;
@group(0) @binding(2) var outTex : texture_storage_2d<rgba16float, write>;
@group(0) @binding(3) var<uniform> P : Params;

fn toLuma(rgb: vec3<f32>) -> f32 {
  return rgb.r * P.lumaR + rgb.g * P.lumaG + rgb.b * P.lumaB;
}

fn srgbToLinear(c: vec3<f32>) -> vec3<f32> {
  let a = 0.055;
  let low  = c / 12.92;
  let high = pow((c + a) / (1.0 + a), vec3<f32>(2.4));
  let mask = c >= vec3<f32>(0.04045);
  return select(low, high, mask);
}

fn rgbToXyz(lrgb: vec3<f32>) -> vec3<f32> {
  let M = mat3x3<f32>(
    0.4123908, 0.3575843, 0.1804808,
    0.2126390, 0.7151687, 0.0721923,
    0.0193308, 0.1191948, 0.9505322
  );
  return M * lrgb;
}

fn f_lab(t: f32) -> f32 {
  let d = 6.0/29.0;
  let t0 = d*d*d;
  if (t > t0) {
    return pow(t, 1.0/3.0);
  }
  return (t / (3.0*d*d)) + (4.0/29.0);
}

fn rgbToLab(rgb: vec3<f32>) -> vec3<f32> {
  let lrgb = srgbToLinear(rgb);
  let xyz  = rgbToXyz(lrgb);
  let Xn = 0.95047;
  let Yn = 1.00000;
  let Zn = 1.08883;
  let fx = f_lab(xyz.x / Xn);
  let fy = f_lab(xyz.y / Yn);
  let fz = f_lab(xyz.z / Zn);
  let L = max(0.0, 116.0 * fy - 16.0);
  let a = 500.0 * (fx - fy);
  let b = 200.0 * (fy - fz);
  return vec3<f32>(L, a, b);
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= P.width || gid.y >= P.height) { return; }
  let coord = vec2<i32>(i32(gid.x), i32(gid.y));
  let uv = vec2<f32>((f32(coord.x) + 0.5) / f32(P.width),
                     (f32(coord.y) + 0.5) / f32(P.height));
  let texelSize = vec2<f32>(1.0 / f32(P.width), 1.0 / f32(P.height));
  let dx = vec2<f32>(texelSize.x, 0.0);
  let dy = vec2<f32>(0.0, texelSize.y);

  let c00 = textureSampleLevel(src, samp, uv + (-dx - dy), 0.0).rgb;
  let c10 = textureSampleLevel(src, samp, uv + ( vec2<f32>(0.0) - dy), 0.0).rgb;
  let c20 = textureSampleLevel(src, samp, uv + ( dx - dy), 0.0).rgb;
  let c01 = textureSampleLevel(src, samp, uv + (-dx), 0.0).rgb;
  let c11 = textureSampleLevel(src, samp, uv, 0.0).rgb;
  let c21 = textureSampleLevel(src, samp, uv + ( dx), 0.0).rgb;
  let c02 = textureSampleLevel(src, samp, uv + (-dx + dy), 0.0).rgb;
  let c12 = textureSampleLevel(src, samp, uv + ( vec2<f32>(0.0) + dy), 0.0).rgb;
  let c22 = textureSampleLevel(src, samp, uv + ( dx + dy), 0.0).rgb;

  let l00 = toLuma(c00); let l10 = toLuma(c10); let l20 = toLuma(c20);
  let l01 = toLuma(c01); let l11 = toLuma(c11); let l21 = toLuma(c21);
  let l02 = toLuma(c02); let l12 = toLuma(c12); let l22 = toLuma(c22);

  let gx = (-1.0*l00) + (0.0*l10) + (1.0*l20)
         + (-2.0*l01) + (0.0*l11) + (2.0*l21)
         + (-1.0*l02) + (0.0*l12) + (1.0*l22);

  let gy = (-1.0*l00) + (-2.0*l10) + (-1.0*l20)
         + ( 1.0*l02) + ( 2.0*l12) + ( 1.0*l22);

  let I = sqrt(gx*gx + gy*gy);

  let lab = rgbToLab(c11);
  let chroma = length(lab.yz);
  let M = chroma / 150.0;

  var dK = I * (M * M);
  dK = pow(max(dK, 0.0), P.gammaK);
  let w = clamp((dK - P.k0) / max(P.k1 - P.k0, 1e-6), 0.0, 1.0);

  textureStore(outTex, coord, vec4<f32>(w, 0.0, 0.0, 1.0));
}
