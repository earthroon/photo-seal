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
@group(0) @binding(1) var srcSmp : sampler;
@group(0) @binding(2) var tensorTex : texture_storage_2d<rgba16float, write>;
@group(0) @binding(3) var<uniform> P : Params;

fn clamp01(v: vec2<f32>) -> vec2<f32> {
  return clamp(v, vec2<f32>(0.0), vec2<f32>(1.0));
}

fn sampleLow(pixel: vec2<f32>) -> vec3<f32> {
  let uv = (pixel + vec2<f32>(0.5)) / vec2<f32>(f32(P.dstW), f32(P.dstH));
  return textureSampleLevel(lowTex, srcSmp, clamp01(uv), 0.0).rgb;
}

fn luminance(c: vec3<f32>) -> f32 {
  return dot(c, vec3<f32>(0.2126, 0.7152, 0.0722));
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  if (gid.x >= P.dstW || gid.y >= P.dstH) { return; }
  let p = vec2<f32>(f32(gid.x), f32(gid.y));

  let l = luminance(sampleLow(p + vec2<f32>(-1.0,  0.0)));
  let r = luminance(sampleLow(p + vec2<f32>( 1.0,  0.0)));
  let u = luminance(sampleLow(p + vec2<f32>( 0.0, -1.0)));
  let d = luminance(sampleLow(p + vec2<f32>( 0.0,  1.0)));

  let ix = 0.5 * (r - l);
  let iy = 0.5 * (d - u);
  let g2 = ix * ix + iy * iy;
  let g = sqrt(max(g2, 0.0));

  var n = vec2<f32>(0.0, 1.0);
  if (g > 1e-6) {
    n = normalize(vec2<f32>(ix, iy));
  }
  let tangent = vec2<f32>(-n.y, n.x);

  // A compact tensor confidence: this pass keeps the full tensor contract
  // in spirit but stores the resolved tangent and confidence in RGBA16F.
  let anisotropy = clamp(g * 8.0, 0.0, 1.0);
  let deltaK = clamp(g * max(1.0, max(P.scaleX, P.scaleY)) * 0.35, 0.0, 1.0);

  textureStore(
    tensorTex,
    vec2<i32>(i32(gid.x), i32(gid.y)),
    vec4<f32>(tangent.x, tangent.y, anisotropy, deltaK)
  );
}
