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

@group(0) @binding(0) var candidateTex : texture_2d<f32>;
@group(0) @binding(1) var lowTex : texture_2d<f32>;
@group(0) @binding(2) var tensorTex : texture_2d<f32>;
@group(0) @binding(3) var srcSmp : sampler;
@group(0) @binding(4) var dstTex : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(5) var<uniform> P : Params;

fn clamp01(v: vec2<f32>) -> vec2<f32> {
  return clamp(v, vec2<f32>(0.0), vec2<f32>(1.0));
}

fn pixelUv(pixel: vec2<f32>) -> vec2<f32> {
  return clamp01((pixel + vec2<f32>(0.5)) / vec2<f32>(f32(P.dstW), f32(P.dstH)));
}

fn sampleCandidate(pixel: vec2<f32>) -> vec4<f32> {
  return textureSampleLevel(candidateTex, srcSmp, pixelUv(pixel), 0.0);
}

fn sampleLow(pixel: vec2<f32>) -> vec4<f32> {
  return textureSampleLevel(lowTex, srcSmp, pixelUv(pixel), 0.0);
}

fn sampleTensor(pixel: vec2<f32>) -> vec4<f32> {
  return textureSampleLevel(tensorTex, srcSmp, pixelUv(pixel), 0.0);
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  if (gid.x >= P.dstW || gid.y >= P.dstH) { return; }
  let p = vec2<f32>(f32(gid.x), f32(gid.y));
  let candidate = sampleCandidate(p);
  let tensor = sampleTensor(p);
  let tangent = normalize(tensor.xy + vec2<f32>(1e-6, 0.0));
  let normal = vec2<f32>(-tangent.y, tangent.x);

  let lowCenter = sampleLow(p);
  let lowN1 = sampleLow(p + normal);
  let lowN2 = sampleLow(p - normal);
  let lowT1 = sampleLow(p + tangent);
  let lowT2 = sampleLow(p - tangent);

  var minV = min(lowCenter.rgb, min(min(lowN1.rgb, lowN2.rgb), min(lowT1.rgb, lowT2.rgb)));
  var maxV = max(lowCenter.rgb, max(max(lowN1.rgb, lowN2.rgb), max(lowT1.rgb, lowT2.rgb)));
  let tol = max(0.0, P.normalClampTolerance);
  minV = minV - vec3<f32>(tol);
  maxV = maxV + vec3<f32>(tol);

  // No Halo Normal Overshoot Seal: tangent detail may survive only inside
  // the lowpass neighborhood envelope. Normal residual strength is zero.
  let rgb = clamp(candidate.rgb, minV, maxV);
  let a = clamp(candidate.a, 0.0, 1.0);
  textureStore(dstTex, vec2<i32>(i32(gid.x), i32(gid.y)), vec4<f32>(clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0)), a));
}
