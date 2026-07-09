// TDT-PHOTOSEAL-04-R1
// OKLab DeltaE soft clamp candidate shader.
// metric-local OKLab only.
// final output is sRGB RGBA8.
// no persistent OKLab output.
// no double gamma.

struct Params {
  src_size: vec2<u32>,
  dst_size: vec2<u32>,
  scale: vec2<f32>,
  tile_size: f32,
  max_kernel_radius: f32,
  level0_scale_threshold: f32,
  level1_scale_threshold: f32,
  edge_sensitivity: f32,
  detail_boost: f32,
  delta_threshold: f32,
  delta_softness: f32,
  delta_strength: f32,
  delta_enabled: u32,
  reference_mode: u32,
  _pad0: vec2<u32>,
};

@group(0) @binding(0) var src_tex: texture_2d<f32>;
@group(0) @binding(1) var src_sampler: sampler;
@group(0) @binding(2) var out_tex: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(3) var<uniform> params: Params;

fn srgb_to_linear_channel(v: f32) -> f32 {
  if (v <= 0.04045) {
    return v / 12.92;
  }
  return pow((v + 0.055) / 1.055, 2.4);
}

fn srgb_to_linear(c: vec3<f32>) -> vec3<f32> {
  return vec3<f32>(
    srgb_to_linear_channel(c.r),
    srgb_to_linear_channel(c.g),
    srgb_to_linear_channel(c.b)
  );
}

fn linear_srgb_to_oklab(c: vec3<f32>) -> vec3<f32> {
  let l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  let m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  let s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;

  let l_ = pow(max(l, 0.0), 1.0 / 3.0);
  let m_ = pow(max(m, 0.0), 1.0 / 3.0);
  let s_ = pow(max(s, 0.0), 1.0 / 3.0);

  return vec3<f32>(
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
  );
}

fn deltae_oklab(a: vec3<f32>, b: vec3<f32>) -> f32 {
  let d = a - b;
  return sqrt(dot(d, d));
}

fn sample_src(uv: vec2<f32>) -> vec4<f32> {
  return textureSampleLevel(src_tex, src_sampler, clamp(uv, vec2<f32>(0.0), vec2<f32>(1.0)), 0.0);
}

fn source_nearest_color(src_px: vec2<f32>) -> vec4<f32> {
  let dims = vec2<f32>(params.src_size);
  let nearest = (floor(src_px) + vec2<f32>(0.5)) / dims;
  return sample_src(nearest);
}

fn gaussian_weight(offset: vec2<f32>, radius: f32) -> f32 {
  let sigma = max(radius * 0.5, 0.0001);
  return exp(-dot(offset, offset) / (2.0 * sigma * sigma));
}

fn ewa_color(src_px: vec2<f32>, radius: f32) -> vec4<f32> {
  let dims = vec2<f32>(params.src_size);
  var sum = vec4<f32>(0.0);
  var total = 0.0;
  let r = i32(ceil(radius));

  for (var y = -4; y <= 4; y = y + 1) {
    for (var x = -4; x <= 4; x = x + 1) {
      if (abs(x) <= r && abs(y) <= r) {
        let off = vec2<f32>(f32(x), f32(y));
        let weight = gaussian_weight(off, radius);
        let uv = (src_px + off + vec2<f32>(0.5)) / dims;
        sum = sum + sample_src(uv) * weight;
        total = total + weight;
      }
    }
  }

  if (total <= 0.0) {
    return source_nearest_color(src_px);
  }
  return sum / total;
}

fn candidate_radius() -> f32 {
  let scale_max = max(params.scale.x, params.scale.y);
  let base = clamp(scale_max * 0.75, 1.0, params.max_kernel_radius);
  let detail = clamp(params.detail_boost, 0.0, 1.0);
  return mix(base, max(1.0, base * 0.85), detail);
}

fn reference_color(src_px: vec2<f32>, candidate_radius_value: f32) -> vec4<f32> {
  if (params.reference_mode == 0u) {
    return source_nearest_color(src_px);
  }
  return ewa_color(src_px, max(1.0, candidate_radius_value * 0.65));
}

// apply_oklab_deltae_soft_clamp computes DeltaE as soft-clamp-weight only.
// It returns sRGB-domain candidate/reference mixing, not an OKLab storage output.
fn apply_oklab_deltae_soft_clamp(candidate: vec4<f32>, reference: vec4<f32>) -> vec4<f32> {
  if (params.delta_enabled == 0u) {
    return candidate;
  }

  let candidate_lab = linear_srgb_to_oklab(srgb_to_linear(clamp(candidate.rgb, vec3<f32>(0.0), vec3<f32>(1.0))));
  let reference_lab = linear_srgb_to_oklab(srgb_to_linear(clamp(reference.rgb, vec3<f32>(0.0), vec3<f32>(1.0))));
  let de = deltae_oklab(candidate_lab, reference_lab);

  let gate = smoothstep(
    params.delta_threshold,
    params.delta_threshold + params.delta_softness,
    de
  );
  let mix_amount = clamp(gate * params.delta_strength, 0.0, 1.0);
  let rgb = mix(candidate.rgb, reference.rgb, mix_amount);
  return vec4<f32>(rgb, candidate.a);
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= params.dst_size.x || gid.y >= params.dst_size.y) {
    return;
  }

  let dst_px = vec2<f32>(vec2<u32>(gid.xy));
  let src_px = (dst_px + vec2<f32>(0.5)) * params.scale - vec2<f32>(0.5);
  let radius = candidate_radius();
  let candidate = ewa_color(src_px, radius);
  let reference = reference_color(src_px, radius);
  let final_color = apply_oklab_deltae_soft_clamp(candidate, reference);

  // Store final sRGB RGBA8 only; OKLab was metric-local and is not persisted.
  textureStore(out_tex, vec2<i32>(gid.xy), clamp(final_color, vec4<f32>(0.0), vec4<f32>(1.0)));
}
