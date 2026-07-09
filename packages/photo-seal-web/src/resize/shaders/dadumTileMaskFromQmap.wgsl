// app/core/compute/downscale_webgpu/tilemask_from_qmap.wgsl
// Commit17: Build a per-tile mask from a *Qmap LOD* texture.
//
// Rationale:
// - Commit11/13: tile classification was sampling the full-res Qmap per tile (4 taps).
// - Commit17: we instead generate a low-res Qmap LOD once (tilesW x tilesH),
//   and this pass just thresholds that LOD, so re-running with different UI thresholds
//   is cheap.
//
// Contract:
// - Input texture is a LOD where each texel corresponds to one tile.
// - Qmap core writes ΔK weight ("w") into the R channel.
// - Output is r8uint texture where .x is 0/1/2 (cheap/medium/expensive).

struct Params {
  tilesW: u32,
  tilesH: u32,
  _pad0: u32,
  _pad1: u32,
  threshLo: f32,
  threshHi: f32,
  _padf0: f32,
  _padf1: f32,
};

@group(0) @binding(0) var qmapLodTex: texture_2d<f32>;
@group(0) @binding(1) var outMask: texture_storage_2d<r8uint, write>;
@group(0) @binding(2) var<uniform> P: Params;

fn qWeight(c: vec4<f32>) -> f32 {
  return c.r;
}

@compute @workgroup_size(8,8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let tx = gid.x;
  let ty = gid.y;
  if (tx >= P.tilesW || ty >= P.tilesH) { return; }

  let c = textureLoad(qmapLodTex, vec2<i32>(i32(tx), i32(ty)), 0);
  let e = qWeight(c);

  // 3-level mask
  // 0: avgW < threshLo
  // 1: threshLo <= avgW < threshHi
  // 2: avgW >= threshHi
  let m0 = select(0u, 1u, e >= P.threshLo);
  let m1 = select(0u, 1u, e >= P.threshHi);
  let level = select(m0, 2u, m1 == 1u);
  textureStore(outMask, vec2<i32>(i32(tx), i32(ty)), vec4<u32>(level, 0u, 0u, 0u));
}
