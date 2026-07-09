// app/core/compute/downscale_webgpu/downscale_box_bilinear_rgba16f.wgsl
// Commit7: Simple downscale pass (bilinear or 4-tap box) for rgba16f pipeline.
// - Input: sampled texture_2d<f32>
// - Output: storage texture rgba16float
// Notes: "box" here is an approximation (4-tap over the src footprint). Good for preview/fast path.

struct Params {
  srcW : u32,
  srcH : u32,
  dstW : u32,
  dstH : u32,
  mode : u32,   // 0 = bilinear, 1 = box4
  _pad0: u32,
  _pad1: u32,
  _pad2: u32,
};

@group(0) @binding(0) var srcTex : texture_2d<f32>;
@group(0) @binding(1) var srcSmp : sampler;
@group(0) @binding(2) var dstTex : texture_storage_2d<rgba16float, write>;
@group(0) @binding(3) var<uniform> P : Params;

fn clamp01(v: vec2<f32>) -> vec2<f32> {
  return clamp(v, vec2<f32>(0.0), vec2<f32>(1.0));
}

fn sampleBilinear(uv: vec2<f32>) -> vec4<f32> {
  return textureSampleLevel(srcTex, srcSmp, clamp01(uv), 0.0);
}

fn sampleBox4(dstPx: vec2<u32>) -> vec4<f32> {
  // Map dst pixel to src footprint.
  // u0/u1 are pixel-edge coordinates in src space.
  let fx0 = (f32(dstPx.x)      ) * (f32(P.srcW) / f32(P.dstW));
  let fy0 = (f32(dstPx.y)      ) * (f32(P.srcH) / f32(P.dstH));
  let fx1 = (f32(dstPx.x) + 1.0) * (f32(P.srcW) / f32(P.dstW));
  let fy1 = (f32(dstPx.y) + 1.0) * (f32(P.srcH) / f32(P.dstH));

  // Sample near the four corners (centered within the footprint).
  let cx0 = fx0 + 0.25 * (fx1 - fx0);
  let cy0 = fy0 + 0.25 * (fy1 - fy0);
  let cx1 = fx0 + 0.75 * (fx1 - fx0);
  let cy1 = fy0 + 0.75 * (fy1 - fy0);

  let uv00 = vec2<f32>(cx0 / f32(P.srcW), cy0 / f32(P.srcH));
  let uv10 = vec2<f32>(cx1 / f32(P.srcW), cy0 / f32(P.srcH));
  let uv01 = vec2<f32>(cx0 / f32(P.srcW), cy1 / f32(P.srcH));
  let uv11 = vec2<f32>(cx1 / f32(P.srcW), cy1 / f32(P.srcH));

  let a = sampleBilinear(uv00);
  let b = sampleBilinear(uv10);
  let c = sampleBilinear(uv01);
  let d = sampleBilinear(uv11);
  return 0.25 * (a + b + c + d);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  if (gid.x >= P.dstW || gid.y >= P.dstH) { return; }
  let dstPx = vec2<u32>(gid.xy);

  // dst center uv
  let uv = vec2<f32>(
    (f32(dstPx.x) + 0.5) / f32(P.dstW),
    (f32(dstPx.y) + 0.5) / f32(P.dstH)
  );

  var col : vec4<f32>;
  if (P.mode == 0u) {
    // Bilinear in src UV space
    col = sampleBilinear(uv);
  } else {
    // Box4 approximation
    col = sampleBox4(dstPx);
  }

  textureStore(dstTex, vec2<i32>(i32(dstPx.x), i32(dstPx.y)), col);
}
