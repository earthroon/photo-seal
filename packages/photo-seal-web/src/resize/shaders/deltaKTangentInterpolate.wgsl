struct Params {
  srcW : u32,
  srcH : u32,
  dstW : u32,
  dstH : u32,
  scaleX : f32,
  scaleY : f32,
  radiusMul : f32,
  sigma : f32,
  tangentDetailStrength : f32,
  tangentEnabled : f32,
  majorBoost : f32,
  minorClamp : f32,
  anisotropyThreshold : f32,
  deltaKThreshold : f32,
  normalClampTolerance : f32,
  portraitStrict : f32,
  cropSourceX : f32,
  cropSourceY : f32,
  cropSourceWidth : f32,
  cropSourceHeight : f32,
};

@group(0) @binding(0) var lowTex : texture_2d<f32>;
@group(0) @binding(1) var srcTex : texture_2d<f32>;
@group(0) @binding(2) var tensorTex : texture_2d<f32>;
@group(0) @binding(3) var srcSmp : sampler;
@group(0) @binding(4) var candidateTex : texture_storage_2d<rgba16float, write>;
@group(0) @binding(5) var<uniform> P : Params;

fn clamp01(v: vec2<f32>) -> vec2<f32> {
  return clamp(v, vec2<f32>(0.0), vec2<f32>(1.0));
}

fn sourceUv(pos: vec2<f32>, invSrc: vec2<f32>) -> vec2<f32> {
  let minP = vec2<f32>(P.cropSourceX, P.cropSourceY);
  let maxP = vec2<f32>(P.cropSourceX + max(1.0, P.cropSourceWidth) - 1.0, P.cropSourceY + max(1.0, P.cropSourceHeight) - 1.0);
  return (clamp(pos, minP, maxP) + vec2<f32>(0.5)) * invSrc;
}

fn sampleSrcUv(uv: vec2<f32>) -> vec4<f32> {
  return textureSampleLevel(srcTex, srcSmp, clamp01(uv), 0.0);
}

fn sampleLowPixel(pixel: vec2<f32>) -> vec4<f32> {
  let uv = (pixel + vec2<f32>(0.5)) / vec2<f32>(f32(P.dstW), f32(P.dstH));
  return textureSampleLevel(lowTex, srcSmp, clamp01(uv), 0.0);
}

fn sampleTensorPixel(pixel: vec2<f32>) -> vec4<f32> {
  let uv = (pixel + vec2<f32>(0.5)) / vec2<f32>(f32(P.dstW), f32(P.dstH));
  return textureSampleLevel(tensorTex, srcSmp, clamp01(uv), 0.0);
}

fn safeUnpremult(c: vec4<f32>) -> vec4<f32> {
  if (c.a <= 1e-6) { return vec4<f32>(0.0); }
  return vec4<f32>(c.rgb / c.a, c.a);
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  if (gid.x >= P.dstW || gid.y >= P.dstH) { return; }
  let dst = vec2<f32>(f32(gid.x), f32(gid.y));
  let low = sampleLowPixel(dst);
  let tensor = sampleTensorPixel(dst);
  let tangent = normalize(tensor.xy + vec2<f32>(1e-6, 0.0));
  let anisotropy = tensor.z;
  let deltaK = tensor.w;
  let gate = step(P.anisotropyThreshold, anisotropy) * step(P.deltaKThreshold, deltaK) * clamp(P.tangentEnabled, 0.0, 1.0);

  let srcCenter = vec2<f32>(P.cropSourceX, P.cropSourceY) + (dst + vec2<f32>(0.5)) * vec2<f32>(P.scaleX, P.scaleY) - vec2<f32>(0.5);
  let invSrc = vec2<f32>(1.0 / f32(P.srcW), 1.0 / f32(P.srcH));
  let stepSrc = tangent * max(0.75, min(1.75, max(P.scaleX, P.scaleY) * 0.18));

  let c0 = sampleSrcUv(sourceUv(srcCenter, invSrc));
  let cp = sampleSrcUv(sourceUv(srcCenter + stepSrc, invSrc));
  let cm = sampleSrcUv(sourceUv(srcCenter - stepSrc, invSrc));
  let tangentSmall = (c0 * 2.0 + cp + cm) * 0.25;

  let lowP = sampleLowPixel(dst + tangent);
  let lowM = sampleLowPixel(dst - tangent);
  let tangentLow = (low * 2.0 + lowP + lowM) * 0.25;
  let detail = tangentSmall - tangentLow;

  let strength = clamp(P.tangentDetailStrength, 0.0, 0.14);
  let candidate = low + detail * strength * gate;
  let out = safeUnpremult(vec4<f32>(max(candidate.rgb, vec3<f32>(0.0)), clamp(candidate.a, 0.0, 1.0)));
  textureStore(candidateTex, vec2<i32>(i32(gid.x), i32(gid.y)), vec4<f32>(clamp(out.rgb, vec3<f32>(0.0), vec3<f32>(1.0)), clamp(out.a, 0.0, 1.0)));
}
