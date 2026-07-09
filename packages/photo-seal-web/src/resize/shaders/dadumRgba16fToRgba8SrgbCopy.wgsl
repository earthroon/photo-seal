// TDT-PHOTOSEAL-03-R1 final copy pass.
// Converts the DadumDadum rgba16float candidate output into PhotoSeal's
// padding-stripped sRGB RGBA8 readback contract. This is not a color repair pass.
struct Params {
  width: u32,
  height: u32,
  _pad0: u32,
  _pad1: u32,
};

@group(0) @binding(0) var srcTex: texture_2d<f32>;
@group(0) @binding(1) var outTex: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(2) var<uniform> P: Params;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= P.width || gid.y >= P.height) { return; }
  let c = textureLoad(srcTex, vec2<i32>(i32(gid.x), i32(gid.y)), 0);
  textureStore(outTex, vec2<i32>(i32(gid.x), i32(gid.y)), vec4<f32>(clamp(c.rgb, vec3<f32>(0.0), vec3<f32>(1.0)), clamp(c.a, 0.0, 1.0)));
}
