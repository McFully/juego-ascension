use serde::{Deserialize, Serialize};
use crate::formulas::Resources;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanetState {
    pub id: String,
    pub name: String,
    pub resources: Resources,
    pub metal_mine: u32,
    pub crystal_mine: u32,
    pub deut_synth: u32,
    pub solar_plant: u32,
    pub fusion_reactor: u32,
    pub auto_governance: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionTickResult {
    pub planet_id: String,
    pub resources: Resources,
    pub energy_balance: i64,
    pub ratio: f64,
}

/// Procesa la producción de un planeta en 1 segundo de simulación física en Rust
pub fn process_planet_tick(planet: &mut PlanetState, game_speed: f64) -> ProductionTickResult {
    let speed = if game_speed > 0.0 { game_speed } else { 1.0 };

    let ml = planet.metal_mine as f64;
    let cl = planet.crystal_mine as f64;
    let dl = planet.deut_synth as f64;
    let sl = planet.solar_plant as f64;
    let fl = planet.fusion_reactor as f64;

    // Producción energética total
    let solar_energy = (20.0 * sl * 1.1_f64.powf(sl)).floor();
    let fusion_energy = (1000.0 * fl * 1.1_f64.powf(fl)).floor();
    let energy_prod = solar_energy + fusion_energy;

    // Consumo de energía por minas
    let energy_cons = (10.0 * ml * 1.1_f64.powf(ml)
        + 10.0 * cl * 1.1_f64.powf(cl)
        + 20.0 * dl * 1.1_f64.powf(dl)).floor();

    let energy_balance = (energy_prod - energy_cons) as i64;
    let ratio = if energy_cons > 0.0 {
        (energy_prod / energy_cons).min(1.0)
    } else {
        1.0
    };

    // Producción horaria normalizada por segundo de tick
    let metal_per_sec = (45.0 * speed * ml * 1.1_f64.powf(ml) * ratio) / 3600.0;
    let crystal_per_sec = (30.0 * speed * cl * 1.1_f64.powf(cl) * ratio) / 3600.0;
    let deut_per_sec = (22.5 * speed * dl * 1.1_f64.powf(dl) * ratio) / 3600.0;

    planet.resources.metal += metal_per_sec;
    planet.resources.crystal += crystal_per_sec;
    planet.resources.deuterium += deut_per_sec;

    ProductionTickResult {
        planet_id: planet.id.clone(),
        resources: planet.resources.clone(),
        energy_balance,
        ratio,
    }
}
