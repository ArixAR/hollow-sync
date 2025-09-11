use crate::crypto::SaveCrypto;
use crate::utils::{Games, get_game_paths, is_jksv_format};
use serde_json::Value;
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use zip::{ZipArchive, ZipWriter, write::FileOptions};
use chrono::{DateTime, Utc};

#[derive(Debug)]
pub struct SaveFile {
    pub slot: u8,
    pub file: String,
    pub path: PathBuf,
    pub modified: DateTime<Utc>,
    pub size: u64,
    pub directory: PathBuf,
    pub game: String,
    pub game_name: String,
    pub game_display_name: String,
    pub base_path: PathBuf,
}

pub struct SaveManager {
    crypto: SaveCrypto,
}

impl SaveManager {
    pub fn new() -> Self {
        Self {
            crypto: SaveCrypto::new(),
        }
    }

    fn get_config_dir() -> Result<PathBuf, Box<dyn std::error::Error>> {
        let data_dir = dirs::data_dir()
            .ok_or("Failed to get user data directory")?
            .join("HollowSync");
        let config_dir = data_dir.join("config");
        fs::create_dir_all(&config_dir)?;
        Ok(config_dir)
    }

    pub fn get_saves_dir() -> Result<PathBuf, Box<dyn std::error::Error>> {
        let data_dir = dirs::data_dir()
            .ok_or("Failed to get user data directory")?
            .join("HollowSync");
        let saves_dir = data_dir.join("saves");
        fs::create_dir_all(&saves_dir)?;
        Ok(saves_dir)
    }

    pub async fn detect_all_saves(&self, game_filter: Option<String>) -> Result<Vec<Value>, Box<dyn std::error::Error>> {
        let search_paths = get_game_paths(game_filter.as_deref());
        let mut all_saves = Vec::new();
        let mut seen_paths = std::collections::HashSet::new();

        for (game, search_path) in search_paths {
            if search_path.exists() {
                let saves = self.find_save_files(&search_path, &game).await?;
                for save in saves {
                    let normalized = save.path.to_string_lossy().to_lowercase();
                    if !seen_paths.contains(&normalized) {
                        seen_paths.insert(normalized);
                        all_saves.push(save);
                    }
                }
            }
        }

        all_saves.sort_by(|a, b| b.modified.cmp(&a.modified));
        let mut result = Vec::new();
        for save in all_saves {
            let value = serde_json::json!({
                "slot": save.slot,
                "file": save.file,
                "path": save.path.to_string_lossy(),
                "modified": save.modified.to_rfc3339(),
                "size": save.size,
                "directory": save.directory.to_string_lossy(),
                "game": save.game,
                "gameName": save.game_name,
                "gameDisplayName": save.game_display_name,
                "basePath": save.base_path.to_string_lossy()
            });
            result.push(value);
        }

        Ok(result)
    }

    async fn find_save_files(&self, base_path: &Path, game_key: &str) -> Result<Vec<SaveFile>, Box<dyn std::error::Error>> {
        let mut results = Vec::new();
        let game_config = Games::get_config(game_key).ok_or("Unknown game")?;

        self.scan_for_saves(base_path, &mut results).await?;
        self.scan_user_directories(base_path, &mut results).await?;
        for save in &mut results {
            save.game = game_key.to_string();
            save.game_name = game_config.name.clone();
            save.game_display_name = game_config.display_name.clone();
            save.base_path = base_path.to_path_buf();
        }

        results.sort_by(|a, b| b.modified.cmp(&a.modified));

        Ok(results)
    }

    async fn scan_user_directories(&self, base_path: &Path, results: &mut Vec<SaveFile>) -> Result<(), Box<dyn std::error::Error>> {
        let Ok(entries) = fs::read_dir(base_path) else {
            return Ok(());
        };
        
        for entry in entries.flatten() {
            if !entry.file_type().map(|ft| ft.is_dir()).unwrap_or(false) {
                continue;
            }
            
            let name = entry.file_name();
            let Some(name_str) = name.to_str() else {
                continue;
            };
            
            if !name_str.chars().all(|c| c.is_ascii_digit()) {
                continue;
            }
            
            let sub_path = entry.path();
            self.scan_for_saves(&sub_path, results).await?;
        }
        
        Ok(())
    }

    async fn scan_for_saves(&self, scan_path: &Path, results: &mut Vec<SaveFile>) -> Result<(), Box<dyn std::error::Error>> {
        let user_regex = regex::Regex::new(r"^user([1-4])\.dat$")?;
        
        let Ok(entries) = fs::read_dir(scan_path) else {
            return Ok(());
        };
        
        for entry in entries.flatten() {
            if let Some(save_file) = self.try_parse_save_file(&entry, &user_regex, scan_path)? {
                results.push(save_file);
            }
        }
        
        Ok(())
    }

    fn try_parse_save_file(
        &self,
        entry: &std::fs::DirEntry,
        user_regex: &regex::Regex,
        scan_path: &Path,
    ) -> Result<Option<SaveFile>, Box<dyn std::error::Error>> {
        let file_name = entry.file_name();
        let Some(name_str) = file_name.to_str() else {
            return Ok(None);
        };
        
        let Some(captures) = user_regex.captures(name_str) else {
            return Ok(None);
        };
        
        let Some(slot_str) = captures.get(1) else {
            return Ok(None);
        };
        
        let Ok(slot) = slot_str.as_str().parse::<u8>() else {
            return Ok(None);
        };
        
        let Ok(metadata) = entry.metadata() else {
            return Ok(None);
        };
        
        let modified = metadata.modified()?;
        let modified_utc = DateTime::<Utc>::from(modified);
        
        Ok(Some(SaveFile {
            slot,
            file: name_str.to_string(),
            path: entry.path(),
            modified: modified_utc,
            size: metadata.len(),
            directory: scan_path.to_path_buf(),
            game: String::new(),
            game_name: String::new(),
            game_display_name: String::new(),
            base_path: PathBuf::new(),
        }))
    }

    pub async fn load_config(&self, game: &str) -> Result<Value, Box<dyn std::error::Error>> {
        let config_dir = Self::get_config_dir()?;
        let config_file = config_dir.join(format!("{}-sync.json", game));
        match fs::read_to_string(&config_file) {
            Ok(content) => Ok(serde_json::from_str(&content)?),
            Err(_) => Ok(serde_json::json!({
                "pcSave": "",
                "switchSave": "",
                "lastSync": null
            }))
        }
    }

    pub async fn save_config(&self, game: &str, config: Value) -> Result<(), Box<dyn std::error::Error>> {
        let config_dir = Self::get_config_dir()?;
        let config_file = config_dir.join(format!("{}-sync.json", game));
        let content = serde_json::to_string_pretty(&config)?;
        fs::write(&config_file, content)?;
        Ok(())
    }

    pub async fn get_file_info(&self, file_path: &str) -> Result<Value, Box<dyn std::error::Error>> {
        match fs::metadata(file_path) {
            Ok(metadata) => {
                let modified = metadata.modified()?;
                let modified_utc = DateTime::<Utc>::from(modified);
                Ok(serde_json::json!({
                    "exists": true,
                    "modified": modified_utc.to_rfc3339(),
                    "size": metadata.len()
                }))
            }
            Err(_) => Ok(serde_json::json!({
                "exists": false,
                "modified": null,
                "size": 0
            }))
        }
    }

    pub async fn sync(&self, game: &str, force_direction: Option<String>) -> Result<String, Box<dyn std::error::Error>> {
        let config = self.load_config(game).await?;
        
        let pc_save = config["pcSave"].as_str().ok_or("PC save path not configured")?;
        let switch_save = config["switchSave"].as_str().ok_or("Switch save path not configured")?;

        if pc_save.is_empty() || switch_save.is_empty() {
            return Err("Save sync not configured".into());
        }

        let pc_info = self.get_file_info(pc_save).await?;
        let switch_info = self.get_file_info(switch_save).await?;

        let pc_exists = pc_info["exists"].as_bool().unwrap_or(false);
        let switch_exists = switch_info["exists"].as_bool().unwrap_or(false);

        if !pc_exists && !switch_exists {
            return Err("No save files found at configured paths".into());
        }

        let direction = match force_direction {
            Some(dir) => dir,
            None => {
                if !pc_exists {
                    "switch-to-pc".to_string()
                } else if !switch_exists {
                    "pc-to-switch".to_string()
                } else {
                    // compare timestamps to decide sync direction
                    let pc_modified = pc_info["modified"].as_str().unwrap_or("");
                    let switch_modified = switch_info["modified"].as_str().unwrap_or("");
                    
                    if pc_modified > switch_modified {
                        "pc-to-switch".to_string()
                    } else {
                        "switch-to-pc".to_string()
                    }
                }
            }
        };

        match direction.as_str() {
            "pc-to-switch" => {
                self.sync_pc_to_switch(pc_save, switch_save).await?;
                "PC save synced to Switch format".to_string()
            }
            "switch-to-pc" => {
                self.sync_switch_to_pc(switch_save, pc_save).await?;
                "Switch save synced to PC format".to_string()
            }
            _ => return Err("Invalid sync direction".into())
        };

        let mut updated_config = config;
        updated_config["lastSync"] = serde_json::Value::String(Utc::now().to_rfc3339());
        self.save_config(game, updated_config).await?;

        Ok(format!("Sync completed: {}", direction))
    }

    async fn sync_pc_to_switch(&self, pc_save: &str, switch_save: &str) -> Result<(), Box<dyn std::error::Error>> {
        if is_jksv_format(switch_save) {
            self.create_backup(pc_save, switch_save).await?;
        } else {
            let pc_data = fs::read(pc_save)?;
            let switch_data = self.crypto.pc_to_switch(&pc_data)?;
            
            if let Some(parent) = Path::new(switch_save).parent() {
                fs::create_dir_all(parent)?;
            }
            fs::write(switch_save, switch_data)?;
        }
        Ok(())
    }

    async fn sync_switch_to_pc(&self, switch_save: &str, pc_save: &str) -> Result<(), Box<dyn std::error::Error>> {
        if is_jksv_format(switch_save) {
            let temp_dir = Path::new(pc_save).parent().unwrap().join("temp-extract");
            fs::create_dir_all(&temp_dir)?;
            
            let extracted = self.extract_backup(switch_save, temp_dir.to_str().unwrap()).await?;
            if extracted.is_empty() {
                return Err("No save files found in backup".into());
            }
            
            fs::copy(&extracted[0], pc_save)?;
            fs::remove_dir_all(&temp_dir)?;
        } else {
            let switch_data = fs::read_to_string(switch_save)?;
            let pc_data = self.crypto.switch_to_pc(&switch_data)?;
            
            if let Some(parent) = Path::new(pc_save).parent() {
                fs::create_dir_all(parent)?;
            }
            fs::write(pc_save, pc_data)?;
        }
        Ok(())
    }

    pub async fn pc_to_switch(&self, input_path: &str, output_path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let pc_data = fs::read(input_path)?;
        let switch_data = self.crypto.pc_to_switch(&pc_data)?;
        
        if let Some(parent) = Path::new(output_path).parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(output_path, switch_data)?;
        Ok(())
    }

    pub async fn switch_to_pc(&self, input_path: &str, output_path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let switch_data = fs::read_to_string(input_path)?;
        let pc_data = self.crypto.switch_to_pc(&switch_data)?;
        
        if let Some(parent) = Path::new(output_path).parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(output_path, pc_data)?;
        Ok(())
    }

    pub async fn create_backup(&self, save_file: &str, output_file: &str) -> Result<(), Box<dyn std::error::Error>> {
        let file = File::create(output_file)?;
        let mut zip = ZipWriter::new(file);
        
        let options = FileOptions::default()
            .compression_method(zip::CompressionMethod::Stored);
        
        let save_data = fs::read(save_file)?;
        let file_name = Path::new(save_file).file_name().unwrap().to_str().unwrap();
        
        zip.start_file(file_name, options)?;
        zip.write_all(&save_data)?;
        zip.finish()?;
        
        Ok(())
    }

    pub async fn extract_backup(&self, backup_file: &str, output_dir: &str) -> Result<Vec<String>, Box<dyn std::error::Error>> {
        let file = File::open(backup_file)?;
        let mut archive = ZipArchive::new(file)?;
        let mut extracted_files = Vec::new();
        
        fs::create_dir_all(output_dir)?;
        
        for i in 0..archive.len() {
            let mut file = archive.by_index(i)?;
            
            if !self.should_extract_file(&file) {
                continue;
            }
            
            if let Some(output_path) = self.extract_archive_file(&mut file, output_dir)? {
                extracted_files.push(output_path);
            }
        }
        
        Ok(extracted_files)
    }

    fn should_extract_file(&self, file: &zip::read::ZipFile) -> bool {
        !file.is_dir() && (file.name().contains("user") || file.name().ends_with(".dat"))
    }

    fn extract_archive_file(
        &self,
        file: &mut zip::read::ZipFile,
        output_dir: &str,
    ) -> Result<Option<String>, Box<dyn std::error::Error>> {
        let Some(file_name) = Path::new(file.name()).file_name().and_then(|n| n.to_str()) else {
            return Ok(None);
        };
        
        let output_path = Path::new(output_dir).join(file_name);
        
        let mut content = Vec::new();
        file.read_to_end(&mut content)?;
        
        fs::write(&output_path, content)?;
        Ok(Some(output_path.to_string_lossy().to_string()))
    }
}