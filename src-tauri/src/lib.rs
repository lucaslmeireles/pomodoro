mod timer;
mod tray_icon;
use serde::Serialize;
use tauri::Manager;
use windows::Media::Control::{
    GlobalSystemMediaTransportControlsSessionManager,
    GlobalSystemMediaTransportControlsSessionPlaybackStatus,
};

use crate::tray_icon::create_tray_menu;

#[derive(Serialize)]
pub struct MediaInfo {
    title: String,
    artist: String,
    status: String,
    position_seconds: f64,
    duration_seconds: f64,
    last_updated_at: f64,
}
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[tauri::command]
async fn get_media_info() -> Result<Option<MediaInfo>, String> {
    const UNIX_EPOCH_DIFF_SECS: f64 = 11_644_473_600.0; // 1601->1970
    const TICKS_PER_SECOND: f64 = 10_000_000.0; // 100ns ticks
    const MS_PER_SEC: f64 = 1000.0;
    let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
        .map_err(|e| e.to_string())?
        .await
        .map_err(|e| e.to_string())?;

    let session = match manager.GetCurrentSession() {
        Ok(s) => s,
        Err(_) => return Ok(None), // nothing playing
    };

    let playback = session.GetPlaybackInfo().map_err(|e| e.to_string())?;

    let status = playback.PlaybackStatus().map_err(|e| e.to_string())?;

    let playing_status = match status {
        GlobalSystemMediaTransportControlsSessionPlaybackStatus::Playing => "playing",
        GlobalSystemMediaTransportControlsSessionPlaybackStatus::Paused => "paused",
        GlobalSystemMediaTransportControlsSessionPlaybackStatus::Changing => "changing",
        _ => "none",
    }
    .to_string();

    let props = session
        .TryGetMediaPropertiesAsync()
        .map_err(|e| e.to_string())?
        .await
        .map_err(|e| e.to_string())?;

    let timeline = session.GetTimelineProperties().map_err(|e| e.to_string())?;

    let position = timeline.Position().map_err(|e| e.to_string())?;
    let duration = timeline.EndTime().map_err(|e| e.to_string())?;
    let last_updated = timeline
        .LastUpdatedTime()
        .map_err(|e| e.to_string())?
        .UniversalTime;
    Ok(Some(MediaInfo {
        title: props.Title().unwrap_or_default().to_string(),
        artist: props.Artist().unwrap_or_default().to_string(),
        status: playing_status,
        position_seconds: position.Duration as f64 / 10_000_000.0,
        duration_seconds: duration.Duration as f64 / 10_000_000.0,
        last_updated_at: ((last_updated as f64 / TICKS_PER_SECOND) - UNIX_EPOCH_DIFF_SECS)
            * MS_PER_SEC,
    }))
}

#[tauri::command]
fn set_always_on_top(window: tauri::Window, always_on_top: bool) {
    window.set_always_on_top(always_on_top).unwrap();
}

#[tauri::command]
async fn media_controls(command: String) -> Result<(), String> {
    let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
        .map_err(|e| e.to_string())?
        .await
        .map_err(|e| e.to_string())?;

    let session = match manager.GetCurrentSession() {
        Ok(s) => s,
        Err(_) => return Err("nenhuma sessão de mídia ativa".to_string()),
    };

    let op = match command.as_str() {
        "play" => session.TryPlayAsync(),
        "pause" => session.TryPauseAsync(),
        "forward" => session.TrySkipNextAsync(),
        "rewind" => session.TryRewindAsync(),
        _ => return Err(format!("comando desconhecido: {command}")),
    };

    op.map_err(|e| e.to_string())?
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_always_on_top(false).unwrap();
            let tray = create_tray_menu(app);
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_media_info,
            media_controls,
            set_always_on_top
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
