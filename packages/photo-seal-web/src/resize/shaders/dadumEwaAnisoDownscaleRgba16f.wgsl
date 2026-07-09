// TDT-PHOTOSEAL-03-R1 optional DadumDadum EWA/aniso candidate rebind.
// Source reference: app/core/compute/downscale_webgpu/ewa_aniso_downscale_rgba16f.wgsl.
// This PhotoSeal copy keeps the same binding contract and parameters but removes
// the malformed orphan statements found in the archived DadumDadum reference file.
struct Params {
  srcW : u32,
  srcH : u32,
  dstW : u32,
  dstH : u32,
  scaleX : f32,
  scaleY : f32,
  radiusMul : f32,
  sigma : f32,
  anisoAngle : f32,
  anisoAspect : f32,
  deThresh : f32,
  deSoft : f32,
  deK : f32,
  _pad0 : f32,
};

@group(0) @binding(0) var srcTex : texture_2d<f32>;
@group(0) @binding(1) var srcSamp : sampler;
@group(0) @binding(2) var dstTex : texture_storage_2d<rgba16float, write>;
@group(0) @binding(3) var<uniform> P : Params;

fn clamp01(v: vec2<f32>) -> vec2<f32> {
  return clamp(v, vec2<f32>(0.0), vec2<f32>(1.0));
}

fn cbrt1(x: f32) -> f32 {
  return pow(max(0.0, x), 0.3333333333);
}

fn rgb_to_oklab(rgb: vec3<f32>) -> vec3<f32> {
  let l = 0.4122214708 * rgb.x + 0.5363325363 * rgb.y + 0.0514459929 * rgb.z;
  let m = 0.2119034982 * rgb.x + 0.6806995451 * rgb.y + 0.1073969566 * rgb.z;
  let s = 0.0883024619 * rgb.x + 0.2817188376 * rgb.y + 0.6299787005 * rgb.z;
  let l_ = cbrt1(l);
  let m_ = cbrt1(m);
  let s_ = cbrt1(s);
  return vec3<f32>(
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
  );
}

fn gate_good(de: f32) -> f32 {
  if (P.deThresh <= 0.0 || P.deK <= 0.0) {
    return 1.0;
  }
  let soft = max(1e-6, P.deSoft);
  let g = smoothstep(P.deThresh + soft, P.deThresh, de);
  return mix(1.0, g, clamp(P.deK, 0.0, 1.0));
}

fn gauss_w(x: f32, sigma: f32) -> f32 {
  let t = x / max(1e-6, sigma);
  return exp(-0.5 * t * t);
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  if (gid.x >= P.dstW || gid.y >= P.dstH) { return; }
  let dst = vec2<f32>(f32(gid.x) + 0.5, f32(gid.y) + 0.5);
  let srcPos = dst * vec2<f32>(P.scaleX, P.scaleY) - vec2<f32>(0.5);
  let invSrc = vec2<f32>(1.0 / f32(P.srcW), 1.0 / f32(P.srcH));
  let refUv = clamp01((srcPos + vec2<f32>(0.5)) * invSrc);
  let refLab = rgb_to_oklab(textureSampleLevel(srcTex, srcSamp, refUv, 0.0).rgb);
  let ca = cos(P.anisoAngle);
  let sa = sin(P.anisoAngle);
  let ax = vec2<f32>(ca, sa);
  let ay = vec2<f32>(-sa, ca);
  let aspect = max(1.0, P.anisoAspect);
  var acc = vec3<f32>(0.0);
  var wsum = 0.0;
  for (var j: i32 = -2; j <= 2; j = j + 1) {
    for (var i: i32 = -2; i <= 2; i = i + 1) {
      let d = vec2<f32>(f32(i), f32(j));
      let dx = dot(d, ax) / aspect;
      let dy = dot(d, ay) * aspect;
      let w = gauss_w(dx * dx + dy * dy, P.sigma) * max(0.25, P.radiusMul);
      let uv = clamp01((srcPos + d + vec2<f32>(0.5)) * invSrc);
      let rgb = textureSampleLevel(srcTex, srcSamp, uv, 0.0).rgb;
      let de = length(rgb_to_oklab(rgb) - refLab);
      let wg = w * gate_good(de);
      acc = acc + rgb * wg;
      wsum = wsum + wg;
    }
  }
  textureStore(dstTex, vec2<i32>(i32(gid.x), i32(gid.y)), vec4<f32>(acc / max(1e-6, wsum), 1.0));
}
