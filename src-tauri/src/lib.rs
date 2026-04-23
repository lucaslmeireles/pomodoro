mod config;
use crate::config::{AppConfig, ConfigService, MenuState};
use serde::Serialize;
use std::sync::Mutex;
use tauri::{
    menu::{CheckMenuItemBuilder, MenuBuilder, SubmenuBuilder},
    tray::TrayIconBuilder,
    AppHandle, Manager, Runtime,
};
use windows::Media::Control::{
    GlobalSystemMediaTransportControlsSessionManager,
    GlobalSystemMediaTransportControlsSessionPlaybackStatus,
};

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

#[tauri::command]
fn toggle_focus_mode(window: tauri::Window, is_active: bool) {
    if is_active {
        window.set_resizable(false).unwrap();
        window.set_always_on_top(true).unwrap();
        window
            .set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: 180.0,
                height: 80.0,
            }))
            .unwrap();
    } else {
        window.set_always_on_top(false).unwrap();
        window
            .set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: 430.0,
                height: 250.0,
            }))
            .unwrap();
    }
}
#[tauri::command]
fn start_drag(window: tauri::Window) {
    let _ = window.start_dragging();
}

#[tauri::command]
fn get_config_timer(app: tauri::AppHandle) -> Result<AppConfig, String> {
    let config = ConfigService::load(&app);
    Ok(config)
}

pub fn create_menu<R: Runtime>(
    app: &AppHandle<R>,
) -> tauri::Result<(tauri::menu::Menu<R>, MenuState<R>)> {
    let config = ConfigService::load(app);

    let auto_start = CheckMenuItemBuilder::new("Auto start")
        .id("auto_start")
        .checked(config.auto_start)
        .build(app)?;

    // Criação dos itens (Exemplo simplificado para um, repita para os outros ou use um loop)
    let p25 = CheckMenuItemBuilder::new("25 min")
        .id("p25")
        .checked(config.pomodoro_time == 1500)
        .build(app)?;
    let p30 = CheckMenuItemBuilder::new("30 min")
        .id("p30")
        .checked(config.pomodoro_time == 1800)
        .build(app)?;
    let p40 = CheckMenuItemBuilder::new("40 min")
        .id("p40")
        .checked(config.pomodoro_time == 2400)
        .build(app)?;
    let p50 = CheckMenuItemBuilder::new("50 min")
        .id("p50")
        .checked(config.pomodoro_time == 3000)
        .build(app)?;

    let pomodoro_menu = SubmenuBuilder::new(app, "Pomodoro")
        .items(&[&p25, &p30, &p40, &p50])
        .build()?;

    let menu = MenuBuilder::new(app)
        .items(&[&auto_start, &pomodoro_menu])
        .build()?;

    Ok((
        menu,
        MenuState {
            auto_start,
            pomodoro_time: vec![(1500, p25), (1800, p30), (2400, p40), (3000, p50)],
        },
    ))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_always_on_top(false).unwrap();
            let (menu, menu_state) = create_menu(&app.app_handle())?;

            app.set_menu(menu.clone())?;
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(true) // Opcional: abre o menu com clique esquerdo
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| {
                    let state = app.state::<Mutex<MenuState<tauri::Wry>>>();
                    let state = state.lock().unwrap();

                    state.handle_event(app, event.id().as_ref());
                })
                .build(app)?;

            app.manage(Mutex::new(menu_state));

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_media_info,
            media_controls,
            set_always_on_top,
            toggle_focus_mode,
            start_drag,
            get_config_timer
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
