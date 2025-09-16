use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct GameConfig {
    pub name: String,
    pub display_name: String,
    pub path: String,
}

pub struct Games;

impl Games {
    pub fn get_config(game_key: &str) -> Option<GameConfig> {
        match game_key {
            "hk" => Some(GameConfig {
                name: "Hollow Knight".to_string(),
                display_name: "Hollow Knight".to_string(),
                path: "Hollow Knight".to_string(),
            }),
            "silksong" => Some(GameConfig {
                name: "Silksong".to_string(),
                display_name: "Silksong".to_string(),
                path: "Hollow Knight Silksong".to_string(),
            }),
            _ => None,
        }
    }
}

pub fn get_game_paths(game_key: Option<&str>) -> Vec<(String, PathBuf)> {
    let mut all_paths = Vec::new();
    let games_to_check: Vec<&str> = match game_key {
        Some(key) => vec![key],
        None => vec!["hk", "silksong"],
    };

    for game in games_to_check {
        if let Some(game_config) = Games::get_config(game) {
            let mut game_paths = Vec::new();

            if let Some(home_dir) = dirs::home_dir() {
                let path = home_dir
                    .join("AppData")
                    .join("LocalLow")
                    .join("Team Cherry")
                    .join(&game_config.path);
                game_paths.push(path);
            }

            if let Ok(username) = std::env::var("USERNAME") {
                let path = PathBuf::from("C:")
                    .join("Users")
                    .join(username)
                    .join("AppData")
                    .join("LocalLow")
                    .join("Team Cherry")
                    .join(&game_config.path);
                game_paths.push(path);
            }
            let mut seen = std::collections::HashSet::new();
            for path in game_paths {
                let normalized = path.to_string_lossy().to_lowercase();
                if !seen.contains(&normalized) {
                    seen.insert(normalized);
                    all_paths.push((game.to_string(), path));
                }
            }
        }
    }

    all_paths
}

pub fn is_jksv_format(file_path: &str) -> bool {
    let path = std::path::Path::new(file_path);
    
    // check for zip file (legacy support)
    if let Some(ext) = path.extension() {
        if ext.to_str().map(|s| s.to_lowercase()) == Some("zip".to_string()) {
            return true;
        }
    }
    
    // check for directory or file without extension
    path.is_dir() || (!path.exists() && !file_path.contains('.'))
}