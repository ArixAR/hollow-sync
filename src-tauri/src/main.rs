// prevents console window on windows release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod save_manager;
mod crypto;
mod utils;

use save_manager::SaveManager;
#[tauri::command]
async fn detect_saves(game_filter: Option<String>) -> Result<Vec<serde_json::Value>, String> {
    let manager = SaveManager::new();
    manager.detect_all_saves(game_filter).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn load_config(game: String) -> Result<serde_json::Value, String> {
    let manager = SaveManager::new();
    manager.load_config(&game).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_config(game: String, config: serde_json::Value) -> Result<(), String> {
    let manager = SaveManager::new();
    manager.save_config(&game, config).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn sync_saves(game: String, force_direction: Option<String>) -> Result<String, String> {
    let manager = SaveManager::new();
    manager.sync(&game, force_direction).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn convert_pc_to_switch(input_path: String, output_path: String) -> Result<(), String> {
    let manager = SaveManager::new();
    manager.pc_to_switch(&input_path, &output_path).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn convert_switch_to_pc(input_path: String, output_path: String) -> Result<(), String> {
    let manager = SaveManager::new();
    manager.switch_to_pc(&input_path, &output_path).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_backup(save_file: String, output_dir: String) -> Result<(), String> {
    let manager = SaveManager::new();
    manager.create_backup(&save_file, &output_dir).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn extract_backup(backup_file: String, output_dir: String) -> Result<Vec<String>, String> {
    let manager = SaveManager::new();
    manager.extract_backup(&backup_file, &output_dir).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_file_info(file_path: String) -> Result<serde_json::Value, String> {
    let manager = SaveManager::new();
    manager.get_file_info(&file_path).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_saves_dir() -> Result<String, String> {
    SaveManager::get_saves_dir()
        .map(|path| path.to_string_lossy().to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn open_path(path: String) -> Result<(), String> {
    use std::process::Command;
    use std::path::Path;
    
    let target_path = if path.contains(".dat") {
        Path::new(&path).parent()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or(path)
    } else {
        path
    };
    
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&target_path)
            .spawn()
            .map_err(|e| format!("Failed to open path: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&target_path)
            .spawn()
            .map_err(|e| format!("Failed to open path: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&target_path)
            .spawn()
            .map_err(|e| format!("Failed to open path: {}", e))?;
    }
    
    Ok(())
}

fn generate_pc_to_switch_output(input_path: &str, input_filename: &str) -> String {
    if let Ok(saves_dir) = SaveManager::get_saves_dir() {
        return saves_dir.join(format!("{}.dat", input_filename)).to_string_lossy().to_string();
    }
    
    format!("{}.dat", input_path.replace(".dat", ""))
}

fn generate_switch_to_pc_output(input_path: &str, input_filename: &str) -> String {
    if let Ok(saves_dir) = SaveManager::get_saves_dir() {
        return saves_dir.join(format!("{}.dat", input_filename)).to_string_lossy().to_string();
    }
    
    format!("{}.dat", input_path.replace(".dat", ""))
}

fn get_input_filename(input_path: &str) -> &str {
    std::path::Path::new(input_path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("converted")
}

#[tauri::command]
async fn convert_save(input_path: String, output_path: Option<String>, direction: String) -> Result<String, String> {
    let manager = SaveManager::new();
    
    if direction != "pc-to-switch" && direction != "switch-to-pc" {
        return Err("Invalid conversion direction".to_string());
    }
    
    let input_filename = get_input_filename(&input_path);
    
    let output = match output_path {
        Some(path) => path,
        None => {
            if direction == "pc-to-switch" {
                generate_pc_to_switch_output(&input_path, input_filename)
            } else {
                generate_switch_to_pc_output(&input_path, input_filename)
            }
        }
    };
    
    if direction == "pc-to-switch" {
        manager.pc_to_switch(&input_path, &output).await
            .map_err(|e| e.to_string())?;
    } else {
        manager.switch_to_pc(&input_path, &output).await
            .map_err(|e| e.to_string())?;
    }
    
    Ok(output)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            detect_saves,
            load_config,
            save_config,
            sync_saves,
            convert_pc_to_switch,
            convert_switch_to_pc,
            convert_save,
            create_backup,
            extract_backup,
            get_file_info,
            get_saves_dir,
            open_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}