use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Resources {
    pub metal: f64,
    pub crystal: f64,
    pub deuterium: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cost {
    pub metal: u64,
    pub crystal: u64,
    pub deuterium: u64,
}

/// Curva hiperbólica de rendimientos decrecientes del Centro de Construcciones
pub fn construction_discount(level: u32) -> f64 {
    1.0 / (1.0 + 0.15 * level as f64)
}

/// Curva de descuento de IA Estratégica
pub fn ai_research_discount(level: u32) -> f64 {
    1.0 / (1.0 + 0.10 * level as f64)
}

/// Cálculo determinista de coste de edificio en Rust
pub fn calc_building_cost(base_m: u64, base_c: u64, base_d: u64, factor: f64, level: u32, cc_level: u32) -> Cost {
    let mult = factor.powi(level as i32);
    let discount = construction_discount(cc_level);
    Cost {
        metal: (base_m as f64 * mult * discount).floor() as u64,
        crystal: (base_c as f64 * mult * discount).floor() as u64,
        deuterium: (base_d as f64 * mult * discount).floor() as u64,
    }
}

/// Cálculo de tiempo de construcción en segundos (respetando aceleradores)
pub fn calc_build_time(cost: &Cost, robot_lvl: u32, nanite_lvl: u32, speed: f64, cc_lvl: u32) -> u64 {
    let total_cost = (cost.metal + cost.crystal) as f64;
    let robot_mult = 1.0 + robot_lvl as f64 * 1.5625;
    let nanite_mult = 1.0 + nanite_lvl as f64 * 0.5;
    let cc_mult = 1.0 + cc_lvl as f64 * 1.5625;
    let speed_mult = if speed > 0.0 { speed } else { 1.0 };

    let denominator = 2500.0 * robot_mult * nanite_mult * cc_mult * speed_mult;
    let seconds = (total_cost / denominator) * 3600.0;
    seconds.max(1.0).floor() as u64
}

/// Verificación estricta de solvencia de recursos
pub fn can_afford(available: &Resources, cost: &Cost) -> bool {
    available.metal >= cost.metal as f64
        && available.crystal >= cost.crystal as f64
        && available.deuterium >= cost.deuterium as f64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hyperbolic_discount() {
        let disc_0 = construction_discount(0);
        let disc_10 = construction_discount(10);
        assert_eq!(disc_0, 1.0);
        assert!((disc_10 - 0.40).abs() < 1e-4);
    }

    #[test]
    fn test_building_cost_calculation() {
        let cost = calc_building_cost(100, 50, 0, 1.5, 2, 0);
        assert_eq!(cost.metal, 225);
        assert_eq!(cost.crystal, 112);
        assert_eq!(cost.deuterium, 0);
    }
}
