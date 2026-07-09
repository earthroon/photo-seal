// TDT-PHOTOSEAL-03
// Adaptive EWA Candidate Import
// Imported from DadumDadum adaptive EWA intent, narrowed for PhotoSeal candidate use.
// This candidate is explicit profile only and does not replace export-ewa.

struct Params {
  srcW: u32,
  srcH: u32,
  dstW: u32,
  dstH: u32,

  scaleX: f32,
  scaleY: f32,
  tileSize: f32,
  maxKernelRadius: f32,

  level0ScaleThreshold: f32,
  level1ScaleThreshold: f32,
  edgeSensitivity: f32,
  detailBoost: f32,
};

@group(0) @binding(0) var srcTex: texture_2d<f32>;
@group(0) @binding(1) var srcSampler: sampler;
@group(0) @binding(2) var outTex: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(3) var<uniform> P: Params;

fn gaussian_weight(d: vec2<f32>, sigma: f32) -> f32 {
  let r2 = dot(d, d);
  return exp(-0.5 * r2 / max(1e-6, sigma * sigma));
}

fn luma(c: vec3<f32>) -> f32 {
  return dot(c, vec3<f32>(0.2126, 0.7152, 0.0722));
}

fn estimate_edge_energy(uv: vec2<f32>, invSrc: vec2<f32>) -> f32 {
  let c = luma(textureSampleLevel(srcTex, srcSampler, uv, 0.0).rgb);
  let rx = luma(textureSampleLevel(srcTex, srcSampler, uv + vec2<f32>(invSrc.x, 0.0), 0.0).rgb);
  let lx = luma(textureSampleLevel(srcTex, srcSampler, uv - vec2<f32>(invSrc.x, 0.0), 0.0).rgb);
  let uy = luma(textureSampleLevel(srcTex, srcSampler, uv + vec2<f32>(0.0, invSrc.y), 0.0).rgb);
  let dy = luma(textureSampleLevel(srcTex, srcSampler, uv - vec2<f32>(0.0, invSrc.y), 0.0).rgb);
  return abs(rx - lx) + abs(uy - dy) + abs(c - (rx + lx + uy + dy) * 0.25);
}

fn sample_candidate(srcPos: vec2<f32>, level: u32, invSrc: vec2<f32>) -> vec3<f32> {
  let base = floor(srcPos);
  let radius = max(1.0, P.maxKernelRadius);
  let sigma = max(0.35, radius * 0.45);

  var acc = vec3<f32>(0.0);
  var wsum = 0.0;

  let radiusI = i32(ceil(radius));
  for (var j: i32 = -4; j <= 4; j = j + 1) {
    for (var i: i32 = -4; i <= 4; i = i + 1) {
      if (abs(i) > radiusI || abs(j) > radiusI) { continue; }
      if (level == 0u && (abs(i) > 1 || abs(j) > 1)) { continue; }
      if (level == 1u && (abs(i) > 2 || abs(j) > 2)) { continue; }

      let p = base + vec2<f32>(f32(i), f32(j));
      let clamped = clamp(p, vec2<f32>(0.0), vec2<f32>(f32(P.srcW) - 1.0, f32(P.srcH) - 1.0));
      let uv = (clamped + vec2<f32>(0.5)) * invSrc;
      let d = p - srcPos;
      let w = gaussian_weight(d, sigma);
      acc = acc + textureSampleLevel(srcTex, srcSampler, uv, 0.0).rgb * w;
      wsum = wsum + w;
    }
  }

  return acc / max(1e-6, wsum);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let x = gid.x;
  let y = gid.y;
  if (x >= P.dstW || y >= P.dstH) { return; }

  let dstPos = vec2<f32>(f32(x) + 0.5, f32(y) + 0.5);
  let srcPos = dstPos * vec2<f32>(P.scaleX, P.scaleY) - vec2<f32>(0.5, 0.5);
  let invSrc = vec2<f32>(1.0 / f32(P.srcW), 1.0 / f32(P.srcH));
  let uvRef = (clamp(srcPos, vec2<f32>(0.0), vec2<f32>(f32(P.srcW) - 1.0, f32(P.srcH) - 1.0)) + vec2<f32>(0.5)) * invSrc;

  let scaleMajor = max(P.scaleX, P.scaleY);
  let energy = estimate_edge_energy(uvRef, invSrc) * max(0.0, P.edgeSensitivity);

  var level = 0u;
  if (scaleMajor > P.level0ScaleThreshold || energy > 0.07) {
    level = 1u;
  }
  if (scaleMajor > P.level1ScaleThreshold || energy > 0.14) {
    level = 2u;
  }

  let ewa = sample_candidate(srcPos, level, invSrc);
  let refRgb = textureSampleLevel(srcTex, srcSampler, uvRef, 0.0).rgb;
  let detailMix = clamp(P.detailBoost * f32(level) * 0.5, 0.0, 0.35);
  let outRgb = mix(ewa, refRgb, detailMix);

  textureStore(outTex, vec2<i32>(i32(x), i32(y)), vec4<f32>(outRgb, 1.0));
}
