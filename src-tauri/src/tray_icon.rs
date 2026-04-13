use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

pub fn create_tray_menu(app: &tauri::App) -> Result<tauri::tray::TrayIcon, tauri::Error> {
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let start_i = MenuItem::with_id(app, "start", "Start Timer", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&quit_i, &start_i])?;

    let tray = TrayIconBuilder::new()
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                id,
                ..
            } => {
                match id.0.as_str() {
                    "quit" => {
                        tray.app_handle().exit(0);
                    }
                    "start" => {
                        // Lógica para iniciar timer, ex.: emitir evento
                        println!("unhandle event");
                    }
                    _ => {
                        println!("unhandle event");
                    }
                }
            }
            _ => {
                println!("unhandle event")
            }
        })
        .build(app);
    return tray;
}
