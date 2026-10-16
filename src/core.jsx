import {
  TICK_MS,
  STORAGE_BASE,
  GAME_SPEED,
  SHIPS,
  DEFENSES,
  SHIP_CHASSIS,
  SHIP_WEAPONS,
  SHIP_ENGINES,
  SHIP_SHIELDS,
  SHIP_MODULES,
  MISSILES,
  MOON_BUILDINGS,
  BIOMES,
  BIOME_KEYS,
  FACTIONS,
  AI_STRATEGIES,
  AI_STRATEGY_KEYS,
  POPULATION_CONSUMPTION_RATES,
  STORAGE_OVERFLOW_THRESHOLD,
  AUTO_BUILD_STORAGE_THRESHOLD
} from "./data/gameData.js";
import { BUILDINGS, RESEARCH } from "./data/catalog/index.js";
import { MISSIONS } from "./data/missionsData.js";
import { ACHIEVEMENTS, RES_NAMES, RES_ICONS, NARRATIVE_EVENTS, ARTIFACTS } from "./data/gameConstants.js";

export { MISSIONS, ACHIEVEMENTS, RES_NAMES, RES_ICONS, NARRATIVE_EVENTS, FACTIONS, BIOMES, BIOME_KEYS, AI_STRATEGIES, AI_STRATEGY_KEYS, POPULATION_CONSUMPTION_RATES, STORAGE_OVERFLOW_THRESHOLD, AUTO_BUILD_STORAGE_THRESHOLD };
export {
  TICK_MS, STORAGE_BASE, GAME_SPEED,
  SHIPS, DEFENSES, SHIP_CHASSIS, SHIP_WEAPONS, SHIP_ENGINES, SHIP_SHIELDS, SHIP_MODULES,
  MISSILES, MOON_BUILDINGS
};

export { BUILDINGS, RESEARCH };

// Re-exports de fórmulas y utilidades
export {
  calcStorage, shipTimeBonus, researchTimeBonus, calcPlanetMaxPop,
  calcCustomShipCost, calcCustomShipTime, calcCustomShipStats,
  buildingProdDisplay, buildingProdInfo, researchEffectInfo,
  calcBuildTime, calcEffectiveBuildTime, calcResearchTime, calcPlanetResearchTime, getPlanetEffectiveLab, getMaxResearchQueueSlots, calcShipTime, calcDefenseTime,
  calcRemainingSeconds, calcTotalSeconds,
  calcDistance,
  calcFlightTime, calcFuel, shipSpeed, fleetSpeed, getDefenseStats, getShipStats,
  buildingCost, researchCost, shipCost, defenseCost, constructionDiscount, aiResearchDiscount,
  calcRequiredPopulation,
  fmt, fmtTime, uid, getGalacticAlignment, getPOIAtCoordinates,
  canAfford, deduct, calcResourceValueForAI, clampResources, meetsReq, meetsResearchReq,
  unmetReqList, reqLabel, resolveReqKey, calcProduction,
  REFINERY_REWARD_MULTIPLIER, BASE_REFINERY_PROD
} from "./utils/formulas.js";

export { getEffectiveTech, isOutdated } from "./utils/formulas/combatFormulas.js";
export { simulateCombat } from "./combat.js";

// Eventos, misiones y progresión
export { EVENTS } from "./data/gameData.js";
export { checkAchievements, checkMissions } from "./core/progression.js";

// Generador de galaxia y planetas
export {
  generateAIName,
  generatePlanetName,
  generateAIPlanet,
  getVirginPlanet,
  getSystemProfile,
  generateGalaxy
} from "./core/galaxyGenerator.js";

// Estado inicial
export { createInitial } from "./core/initialState.js";

export const updatePlanet = (st, id, updater) => ({
  ...st,
  planets: st.planets.map(p => p.id === id ? updater(p) : p),
});

export const shouldKeepNotification = (n) => {
  if (!n || !n.message) return false;
  const msg = n.message;
  // No descartar alertas de error o límite
  if (n.type === 'warning' || n.type === 'error') return true;

  if (
    msg.includes("mejorado a nivel") ||
    (msg.includes("nivel") && (msg.includes("=,") || msg.includes("nivel "))) ||
    msg.includes("listos") ||
    msg.includes("construidos") ||
    msg.includes("lista") ||
    msg.includes("Modernización completada") ||
    msg.includes("cancelada") ||
    msg.includes("Reembolso") ||
    msg.includes("desguazados") ||
    msg.includes("retirados") ||
    msg.includes("Salto completado") ||
    msg.includes("Partida cargada") ||
    msg.includes("Logro:") ||
    msg.includes("Misión Cumplida") ||
    msg.includes("No puedes abandonar") ||
    msg.includes("Retira todas las naves") ||
    msg.includes("No tienes recursos") ||
    msg.includes("Delegación diplomática llegó a") ||
    msg.includes("Ya no tienes suficientes recursos") ||
    msg.includes("Vendiste excedentes a") ||
    msg.includes("Pagaste tributo a") ||
    msg.includes("Has cancelado el pacto") ||
    msg.includes("Rechazaste el chantaje de") ||
    msg.includes("Tratado firmado con") ||
    (msg.includes("¡Éxito!") && msg.includes("cede ante tu flota")) ||
    msg.includes("Flota regresó a")
  ) {
    return false;
  }
  return true;
};

export { gameReducer } from "./reducer.jsx";
export { processMission, returnFleetToOrigin, processEvent } from "./missions.jsx";
export { validateSave } from "./utils/saveValidation.js";
