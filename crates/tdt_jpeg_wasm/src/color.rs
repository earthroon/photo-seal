#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ColorSpace {
    Srgb,
}

impl ColorSpace {
    pub const fn as_str(self) -> &'static str {
        match self {
            ColorSpace::Srgb => "srgb",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PixelFormat {
    Rgba8,
    Rgb8,
}

impl PixelFormat {
    pub const fn as_str(self) -> &'static str {
        match self {
            PixelFormat::Rgba8 => "rgba8",
            PixelFormat::Rgb8 => "rgb8",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ColorPipelineSeal {
    pub input_color_space: ColorSpace,
    pub rgba_pixel_format: PixelFormat,
    pub rgb_color_space: ColorSpace,
    pub rgb_pixel_format: PixelFormat,
    pub encoded_color_space: ColorSpace,
    pub gamma_transform_used: bool,
    pub hidden_linearization_used: bool,
    pub double_gamma_detected: bool,
}

pub fn make_srgb_color_pipeline_seal() -> ColorPipelineSeal {
    ColorPipelineSeal {
        input_color_space: ColorSpace::Srgb,
        rgba_pixel_format: PixelFormat::Rgba8,
        rgb_color_space: ColorSpace::Srgb,
        rgb_pixel_format: PixelFormat::Rgb8,
        encoded_color_space: ColorSpace::Srgb,
        gamma_transform_used: false,
        hidden_linearization_used: false,
        double_gamma_detected: false,
    }
}

impl ColorPipelineSeal {
    pub fn to_json_string(&self) -> String {
        format!(
            "{{\"input_color_space\":\"{}\",\"rgba_pixel_format\":\"{}\",\"rgb_color_space\":\"{}\",\"rgb_pixel_format\":\"{}\",\"encoded_color_space\":\"{}\",\"gamma_transform_used\":{},\"hidden_linearization_used\":{},\"double_gamma_detected\":{}}}",
            self.input_color_space.as_str(),
            self.rgba_pixel_format.as_str(),
            self.rgb_color_space.as_str(),
            self.rgb_pixel_format.as_str(),
            self.encoded_color_space.as_str(),
            self.gamma_transform_used,
            self.hidden_linearization_used,
            self.double_gamma_detected,
        )
    }
}
