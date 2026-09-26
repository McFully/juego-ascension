import { SHIPS, DEFENSES } from '../../data/gameData.js';
import { getShipStats, getDefenseStats } from './combatFormulas.js';

/**
 * Lista de tecnologías clave que afectan a naves
 */
export const SHIP_TECH_KEYS = [
  'weapons', 'shields', 'armour', 'combustion', 'impulse', 'hyperspace',
  'quantumDrive', 'molecularCargoCompress', 'orbitalLogisticExpert',
  'grapheneTitanium', 'geneticWarAlgorithm', 'advLogistics'
];

/**
 * Lista de tecnologías clave que afectan a defensas
 */
export const DEFENSE_TECH_KEYS = [
  'weapons', 'shields', 'armour', 'defenseFields', 'fortressTech',
  'gaussRailgunAccel', 'aiTactics', 'aiMilitary', 'aiStrategy', 'nanoRepair'
];

/**
 * Extrae una foto de los niveles de tecnología relevantes para naves
 */
export const extractShipTechSnapshot = (research = {}) => {
  const snapshot = {};
  for (const k of SHIP_TECH_KEYS) {
    if (research[k] !== undefined) {
      snapshot[k] = research[k];
    } else {
      snapshot[k] = 0;
    }
  }
  return snapshot;
};

/**
 * Extrae una foto de los niveles de tecnología relevantes para defensas
 */
export const extractDefenseTechSnapshot = (research = {}) => {
  const snapshot = {};
  for (const k of DEFENSE_TECH_KEYS) {
    if (research[k] !== undefined) {
      snapshot[k] = research[k];
    } else {
      snapshot[k] = 0;
    }
  }
  return snapshot;
};

/**
 * Calcula un nivel acumulado para generar la etiqueta de generación (ej. Mk.1, Mk.3...)
 */
export const calculateTechGeneration = (techSnapshot = {}) => {
  const sum = Object.values(techSnapshot).reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
  return Math.max(1, sum + 1);
};

/**
 * Genera una clave única para una variante de unidad
 */
export const getVariantKey = (baseId, techGen) => {
  return `${baseId}__mk${techGen}`;
};

/**
 * Comprueba si una variante de nave o defensa está obsoleta respecto a la tecnología actual
 */
export const isVariantOutdated = (unitTechSnapshot = {}, currentResearch = {}, type = 'ship') => {
  const keys = type === 'ship' ? SHIP_TECH_KEYS : DEFENSE_TECH_KEYS;
  for (const k of keys) {
    if ((currentResearch[k] || 0) > (unitTechSnapshot[k] || 0)) {
      return true;
    }
  }
  return false;
};

/**
 * Calcula el coste de modernización por unidad entre la versión antigua y la nueva tecnología.
 * Suele ser una fracción del coste base de la nave o defensa, proporcional al desfase.
 */
export const calculateRetrofitUnitCost = (baseId, unitTechSnapshot = {}, currentResearch = {}, type = 'ship') => {
  const definition = type === 'ship' ? SHIPS[baseId] : DEFENSES[baseId];
  if (!definition) return { metal: 0, crystal: 0, deuterium: 0 };

  const keys = type === 'ship' ? SHIP_TECH_KEYS : DEFENSE_TECH_KEYS;
  let levelDiff = 0;
  for (const k of keys) {
    const diff = (currentResearch[k] || 0) - (unitTechSnapshot[k] || 0);
    if (diff > 0) levelDiff += diff;
  }

  if (levelDiff === 0) return { metal: 0, crystal: 0, deuterium: 0 };

  // Factor de coste: 15% base + 3% por cada nivel de desfase tecnológico, con tope del 65% del coste original
  const costFactor = Math.min(0.65, 0.15 + (levelDiff * 0.03));

  const baseCost = definition.cost || { m: 0, c: 0, d: 0 };
  return {
    metal: Math.max(10, Math.floor((baseCost.m || 0) * costFactor)),
    crystal: Math.max(0, Math.floor((baseCost.c || 0) * costFactor)),
    deuterium: Math.max(0, Math.floor((baseCost.d || 0) * costFactor))
  };
};

/**
 * Calcula el tiempo de modernización por unidad en segundos.
 */
export const calculateRetrofitUnitTime = (baseId, unitTechSnapshot = {}, currentResearch = {}, shipyardLevel = 1, naniteLevel = 0, gameSpeed = 1, type = 'ship') => {
  const definition = type === 'ship' ? SHIPS[baseId] : DEFENSES[baseId];
  if (!definition) return 5;

  const cost = calculateRetrofitUnitCost(baseId, unitTechSnapshot, currentResearch, type);
  const totalCost = cost.metal + cost.crystal;
  // Fracción del cálculo normal de tiempo
  const hours = totalCost / (2500 * (1 + shipyardLevel) * Math.pow(2, naniteLevel));
  const seconds = Math.max(3, Math.floor((hours * 3600) / gameSpeed));
  return seconds;
};
