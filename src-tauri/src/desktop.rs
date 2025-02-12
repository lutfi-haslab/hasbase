// Prevents additional console window on Windows in release, DO NOT REMOVE!!
use std::sync::{Arc, Mutex};
use tauri::{Emitter, Manager, RunEvent};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;
use std::fs;
use crate::desktop::fs::File;
use std::io::Write;
use std::path::PathBuf;
use std::env;


#[tauri::command]
fn toggle_fullscreen(window: tauri::Window) {
    if let Ok(is_fullscreen) = window.is_fullscreen() {
        window.set_fullscreen(!is_fullscreen).unwrap();
    }
}

// Helper function to spawn the sidecar and monitor its stdout/stderr
fn spawn_and_monitor_sidecar(app_handle: tauri::AppHandle) -> Result<(), String> {
    println!("Sidecar open");
    // Check if a sidecar process already exists
    if let Some(state) = app_handle.try_state::<Arc<Mutex<Option<CommandChild>>>>() {
        let child_process = state.lock().unwrap();
        if child_process.is_some() {
            // A sidecar is already running, do not spawn a new one
            println!("[tauri] Sidecar is already running. Skipping spawn.");
            return Ok(()); // Exit early since sidecar is already running
        }
    }
    // Spawn sidecar
    let sidecar_command = app_handle
        .shell()
        .sidecar("main")
        .map_err(|e| e.to_string())?;
    let (mut rx, child) = sidecar_command.spawn().map_err(|e| e.to_string())?;
    // Store the child process in the app state
    if let Some(state) = app_handle.try_state::<Arc<Mutex<Option<CommandChild>>>>() {
        *state.lock().unwrap() = Some(child);
    } else {
        return Err("Failed to access app state".to_string());
    }

    // Spawn an async task to handle sidecar communication
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes);
                    println!("Sidecar stdout: {}", line);
                    // Emit the line to the frontend
                    app_handle
                        .emit("sidecar-stdout", line.to_string())
                        .expect("Failed to emit sidecar stdout event");
                }
                CommandEvent::Stderr(line_bytes) => {
                    let line = String::from_utf8_lossy(&line_bytes);
                    eprintln!("Sidecar stderr: {}", line);
                    // Emit the error line to the frontend
                    app_handle
                        .emit("sidecar-stderr", line.to_string())
                        .expect("Failed to emit sidecar stderr event");
                }
                _ => {}
            }
        }
    });

    Ok(())
}

// Define a command to shutdown sidecar process
#[tauri::command]
fn shutdown_sidecar(app_handle: tauri::AppHandle) -> Result<String, String> {
    println!("[tauri] Received command to shutdown sidecar.");
    // Access the sidecar process state
    if let Some(state) = app_handle.try_state::<Arc<Mutex<Option<CommandChild>>>>() {
        let mut child_process = state
            .lock()
            .map_err(|_| "[tauri] Failed to acquire lock on sidecar process.")?;

        if let Some(mut process) = child_process.take() {
            let command = "sidecar shutdown\n"; // Add newline to signal the end of the command

            // Attempt to write the command to the sidecar's stdin
            if let Err(err) = process.write(command.as_bytes()) {
                println!("[tauri] Failed to write to sidecar stdin: {}", err);
                // Restore the process reference if shutdown fails
                *child_process = Some(process);
                return Err(format!("Failed to write to sidecar stdin: {}", err));
            }

            println!("[tauri] Sent 'sidecar shutdown' command to sidecar.");
            Ok("'sidecar shutdown' command sent.".to_string())
        } else {
            println!("[tauri] No active sidecar process to shutdown.");
            Err("No active sidecar process to shutdown.".to_string())
        }
    } else {
        Err("Sidecar process state not found.".to_string())
    }
}

// Define a command to start sidecar process.
#[tauri::command]
fn start_sidecar(app_handle: tauri::AppHandle) -> Result<String, String> {
    println!("[tauri] Received command to start sidecar.");
    spawn_and_monitor_sidecar(app_handle)?;
    Ok("Sidecar spawned and monitoring started.".to_string())
}

// Helper function to create directory if it doesn't exist
fn ensure_directory(base_path: &PathBuf, dir_name: &str) -> Result<PathBuf, std::io::Error> {
    let dir_path = base_path.join(dir_name);
    if !dir_path.exists() {
        fs::create_dir_all(&dir_path)?;
        println!("[tauri] Created directory at: {:?}", dir_path);
    } else {
        println!("[tauri] Directory already exists at: {:?}", dir_path);
    }
    Ok(dir_path)
}

// Helper function to create JSON file if it doesn't exist
fn ensure_json_file(base_path: &PathBuf, file_name: &str) -> Result<(), std::io::Error> {
    let file_path = base_path.join(file_name);
    if !file_path.exists() {
        let mut file = File::create(&file_path)?;
        // Initialize with empty JSON object
        file.write_all(b"{}")?;
        println!("[tauri] Created JSON file at: {:?}", file_path);
    } else {
        println!("[tauri] JSON file already exists at: {:?}", file_path);
    }
    Ok(())
}

#[cfg(not(mobile))]
pub fn desktop_entry_point() {
    tauri::Builder::default()
        // Add any necessary plugins
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
              let window = app.get_webview_window("main").unwrap();
              window.open_devtools();
              window.close_devtools();
            }

            // Get user's home directory and create an app folder there
            let home_dir = env::var("HOME")
                .or_else(|_| env::var("USERPROFILE")) // Fallback for Windows
                .expect("Could not find home directory");
            let base_path = PathBuf::from(home_dir).join(".hasbase"); // Create .hasbase in home directory

            // Create the base app directory
            if let Err(e) = fs::create_dir_all(&base_path) {
                eprintln!("[tauri] Failed to create base directory: {}", e);
                return Ok(());
            }

            // Create all required directories
            let directories = [
                "vector_db",
                "chatDB",
                "userDB",
                "documentDB"
            ];

            // Create directories
            for dir in directories.iter() {
                if let Err(e) = ensure_directory(&base_path, dir) {
                    eprintln!("[tauri] Failed to create directory {}: {}", dir, e);
                }
            }

            // Create JSON files in their respective directories
            let json_files = [
                "chatDB.json",
                "userDB.json",
               "documentDB.json",
            ];

            for file in json_files.iter() {
                if let Err(e) = ensure_json_file(&base_path, file) {
                    eprintln!("[tauri] Failed to create file {} in {}: {}", file, base_path.display(), e);
                }
            }
            // Store the initial sidecar process in the app state
            app.manage(Arc::new(Mutex::new(None::<CommandChild>)));
            // Clone the app handle for use elsewhere
            let app_handle = app.handle().clone();
            // // Spawn the Python sidecar on startup
            println!("[tauri] Creating sidecar...");
            spawn_and_monitor_sidecar(app_handle).ok();
            println!("[tauri] Sidecar spawned and monitoring started.");
            Ok(())
        })
        // Register the shutdown_server command
        .invoke_handler(tauri::generate_handler![
            start_sidecar,
            shutdown_sidecar,
            toggle_fullscreen
        ])
        .build(tauri::generate_context!())
        .expect("Error while running tauri application")
        .run(|app_handle, event| match event {
            // Ensure the Python sidecar is killed when the app is closed
            RunEvent::ExitRequested { .. } => {
                if let Some(child_process) =
                    app_handle.try_state::<Arc<Mutex<Option<CommandChild>>>>()
                {
                    if let Ok(mut child) = child_process.lock() {
                        if let Some(process) = child.as_mut() {
                            // Send msg via stdin to sidecar where it self terminates
                            let command = "sidecar shutdown\n";
                            let buf: &[u8] = command.as_bytes();
                            let _ = process.write(buf);

                            // *Important* `process.kill()` will only shutdown the parent sidecar (python process). Tauri doesnt know about the second process spawned by the "bootloader" script.
                            // This only applies if you compile a "one-file" exe using PyInstaller. Otherwise, just use the line below to kill the process normally.
                            // let _ = process.kill();
                           
                            println!("[tauri] Sidecar closed.");
                        }
                    }
                }
            }
            _ => {}
        });
}


#[cfg(mobile)]
pub fn desktop_entry_point() {
    unreachable!("This should never be called on mobile");
}