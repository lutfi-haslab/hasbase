// src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(not(mobile))]
fn main() {
    // Desktop entry point
    hasbase_lib::desktop_entry_point();
}

#[cfg(mobile)]
fn main() {
    // Mobile entry point
    hasbase_lib::mobile_entry_point();
}