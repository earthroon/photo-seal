#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AlphaPolicy {
    WhiteComposite,
    Discard,
}

impl AlphaPolicy {
    pub const fn as_str(self) -> &'static str {
        match self {
            AlphaPolicy::WhiteComposite => "WhiteComposite",
            AlphaPolicy::Discard => "Discard",
        }
    }
}
