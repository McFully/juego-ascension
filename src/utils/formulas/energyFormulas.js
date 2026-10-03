// Fórmulas de energía: ÚNICA fuente para consumo y generación.
// Tick (calcProduction), tarjetas (buildingProdInfo) y Codex deben usar esto.
import { BUILDINGS } from '../../data/catalog/index.js';

const GEN_GROWTH = 1.1;

// Consumo de un edificio a un nivel dado (positivo).
export const calcBuildingEnergyDemand = (id, lvl) => {
  if (!lvl || lvl <= 0) return 0;
  const b = BUILDINGS[id];
  if (!b || !b.energy) return 0;
  const base = Math.abs(b.energy);
  const factor = b.energyFactor || ((b.cat === 'civil' || b.cat === 'government') ? 1.04 : 1.0);
  if (factor > 1) {
    return Math.floor(base * lvl * Math.pow(factor, lvl));
  }
  return Math.floor(base * lvl);
};

// Generación bruta (sin bonus ni redondeo) leída de energyGen / bonusEnergyGen.
export const rawBuildingEnergyGen = (id, lvl) => {
  if (!lvl || lvl <= 0) return 0;
  const b = BUILDINGS[id];
  if (!b) return 0;
  const gen = b.energyGen || b.bonusEnergyGen || 0;
  if (!gen) return 0;
  const growth = b.energyGen ? GEN_GROWTH : (b.bonusEnergyGenFactor || GEN_GROWTH);
  return gen * lvl * Math.pow(growth, lvl);
};

// Generación mostrable en UI (sin bonus de tecnología/facción).
export const calcBuildingEnergyGen = (id, lvl) => Math.floor(rawBuildingEnergyGen(id, lvl));

// Consumo de deuterio de plantas que queman combustible (fusión).
export const calcBuildingDeutCons = (id, lvl) => {
  if (!lvl || lvl <= 0) return 0;
  const b = BUILDINGS[id];
  if (!b?.deutCons) return 0;
  return Math.floor(b.deutCons * lvl * Math.pow(GEN_GROWTH, lvl));
};
