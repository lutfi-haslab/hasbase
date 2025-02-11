// src/mobile.rs
#[cfg(mobile)]
#[tauri::mobile_entry_point]
pub fn mobile_entry_point() {
    tauri::Builder::default()
        // Add mobile-specific plugins and setup here
        .plugin(tauri_plugin_shell::init())
        // Mobile-specific handlers
        .invoke_handler(tauri::generate_handler![
            // Your mobile-specific commands
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri mobile application")
}

#[cfg(not(mobile))]
pub fn mobile_entry_point() {
    unreachable!("This should never be called on desktop");
}