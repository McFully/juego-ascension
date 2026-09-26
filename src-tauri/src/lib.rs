pub mod formulas;
pub mod simulation;

use formulas::{calc_building_cost, Cost};
use simulation::{process_planet_tick, PlanetState, ProductionTickResult};

#[tauri::command]
fn get_engine_version() -> String {
    "Ascension-Rust-Engine-v2.0".to_string()
}

#[tauri::command]
fn calculate_building_cost_native(
    base_m: u64,
    base_c: u64,
    base_d: u64,
    factor: f64,
    level: u32,
    cc_level: u32,
) -> Cost {
    calc_building_cost(base_m, base_c, base_d, factor, level, cc_level)
}

#[tauri::command]
fn process_planet_tick_native(mut planet: PlanetState, game_speed: f64) -> (PlanetState, ProductionTickResult) {
    let result = process_planet_tick(&mut planet, game_speed);
    (planet, result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_engine_version,
            calculate_building_cost_native,
            process_planet_tick_native
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

