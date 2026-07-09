// app/core/compute/downscale_webgpu/qmap_lod_meanmax_mix_rgba16f.wgsl
// Commit18B: Qmap LOD reducer that preserves strong tiles.
//
// For each destination texel (one per tile), we sample 4 points in the corresponding
// source tile block and compute:
//   mean = avg(s0..s3)
//   mx   = max(s0..s3)
//   q    = mix(mean, mx, mixK)
//
// Assumes source Qmap stores ΔK weight in .r.

struct Params {
  srcW : u32,
  srcH : u32,
  dstW : u32,
  dstH : u32,
  tilePx : u32,
  _pad0 : u32,
  mixK : f32,
  _pad1 : f32,
};

@group(0) @binding(0) var srcTex : texture_2d<f32>;
@group(0) @binding(1) var dstTex : texture_storage_2d<rgba16float, write>;
@group(0) @binding(2) var<uniform> P : Params;

fn clamp_i32(v: i32, lo: i32, hi: i32) -> i32 {
  return max(lo, min(hi, v));
}

fn loadQ(ix: i32, iy: i32) -> f32 {
  let x = clamp_i32(ix, 0, i32(P.srcW) - 1);
  let y = clamp_i32(iy, 0, i32(P.srcH) - 1);
  return textureLoad(srcTex, vec2<i32>(x, y), 0).r;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  if (gid.x >= P.dstW || gid.y >= P.dstH) {
    return;
  }

  // Tile origin in source space.
  let tx = i32(gid.x);
  let ty = i32(gid.y);
  let tile = i32(P.tilePx);
  let ox = tx * tile;
  let oy = ty * tile;

  // Sample 4 points inside the tile block (quarter offsets).
  // We use fixed fractions to keep it deterministic & cheap.
  let s0 = loadQ(ox + (tile * 1) / 4, oy + (tile * 1) / 4);
  let s1 = loadQ(ox + (tile * 3) / 4, oy + (tile * 1) / 4);
  let s2 = loadQ(ox + (tile * 1) / 4, oy + (tile * 3) / 4);
  let s3 = loadQ(ox + (tile * 3) / 4, oy + (tile * 3) / 4);

  let mean = 0.25 * (s0 + s1 + s2 + s3);
  let mx = max(max(s0, s1), max(s2, s3));

  let k = clamp(P.mixK, 0.0, 1.0);
  let q = mean * (1.0 - k) + mx * k;

  textureStore(dstTex, vec2<i32>(tx, ty), vec4<f32>(q, 0.0, 0.0, 1.0));
}
