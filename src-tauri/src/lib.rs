// src/lib.rs
mod desktop;
mod mobile;

pub use desktop::desktop_entry_point;
pub use mobile::mobile_entry_point;