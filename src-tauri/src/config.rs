use tauri::{menu::CheckMenuItem, AppHandle, Emitter, Runtime};
use tauri_plugin_store::StoreExt;

#[derive(serde::Serialize, serde::Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub auto_start: bool,
    pub pomodoro_time: u32,
}

pub struct ConfigService;

impl ConfigService {
    pub fn load<R: Runtime>(app: &AppHandle<R>) -> AppConfig {
        let store = app.store("config.json").unwrap();

        AppConfig {
            auto_start: store
                .get("auto_start")
                .and_then(|v| v.as_bool())
                .unwrap_or(false),
            pomodoro_time: store
                .get("pomodoro_time")
                .and_then(|v| v.as_u64())
                .unwrap_or(1500) as u32,
        }
    }

    pub fn save<R: Runtime>(app: &AppHandle<R>, config: &AppConfig) {
        let store = app.store("config.json").unwrap();
        store.set("auto_start", config.auto_start);
        store.set("pomodoro_time", config.pomodoro_time);
        let _ = store.save(); // Importante salvar no v2
    }

    pub fn update<R: Runtime, F: FnOnce(&mut AppConfig)>(
        app: &AppHandle<R>,
        updater: F,
    ) -> AppConfig {
        let mut config = Self::load(app);
        updater(&mut config);
        Self::save(app, &config);
        config
    }
}

pub struct MenuState<R: Runtime> {
    pub auto_start: CheckMenuItem<R>,
    pub pomodoro_time: Vec<(u32, CheckMenuItem<R>)>,
}

impl<R: Runtime> MenuState<R> {
    pub fn handle_event(&self, app: &AppHandle<R>, event_id: &str) {
        // 1. Atualiza a configuração e obtém a nova config
        let config = ConfigService::update(app, |cfg| match event_id {
            "auto_start" => {
                cfg.auto_start = !cfg.auto_start;
            }
            "p25" => cfg.pomodoro_time = 1500,
            "p30" => cfg.pomodoro_time = 1800,
            "p40" => cfg.pomodoro_time = 2400,
            "p50" => cfg.pomodoro_time = 3000,
            _ => {
                println!("ID de evento não reconhecido: {}", event_id);
            }
        });

        // Debug no console do Rust para termos certeza
        println!(
            "Nova config: auto_start={}, pomodoro={}",
            config.auto_start, config.pomodoro_time
        );

        // 2. Sincroniza os itens visuais do Menu
        let _ = self.auto_start.set_checked(config.auto_start);
        for (value, item) in &self.pomodoro_time {
            let _ = item.set_checked(*value == config.pomodoro_time);
        }

        // 3. Emite para o Frontend
        let _ = app.emit("config-updated", &config);
    }
}
