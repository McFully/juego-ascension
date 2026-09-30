import { MINISTRY_MAPPING } from '../data/buildingOperationsData.js';

/**
 * Defaults por ministerio, para que los 17 nazcan con estado.
 *
 * 1.6-2 — Antes esto estaba hardcodeado en tres sitios (`initialState.js`,
 * `ministryTick.js` y `loadMigrator.js`) y solo cubría 6 de los 17 ministerios
 * de `MINISTRY_MAPPING`. Los otros 11 nacían sin estado: sin `taxRate` ni
 * `researchGrants` ni `automationEnabled`, y todos los leapfrogs con `|| 0.1`
 * los trataban como si tuvieran valor cero.
 *
 * Aquí se declara una sola vez y se deriva el resto. Los ministerios que ya
 * tenían defaults propios los conservan.
 */

const DEFAULTS = {
  economy: { taxRate: 0.1, tradeSubsidies: false, treasury: 1000, gdp: 0 },
  defense: { conscriptionLevel: 'volunteer', combatDoctrine: 'balanced', patrolIntensity: 1 },
  science: { researchGrants: 0.05, techFocus: 'general', experimentalProjects: [] },
  culture: { propagandaLevel: 1, socialUnity: 80, eventsActive: [] },
  infra: { maintenanceBudget: 0.05, logisticsLevel: 1, orbitalNetwork: false },
  intel: { espionageBudget: 0.1, counterIntelLevel: 1, sleeperCells: [] },
};

/** Campos que todos los ministerios comparten, sea cual sea su función. */
const COMMON = { automationEnabled: false, minister: null, upgrades: {} };

/**
 * Genera el estado completo de ministerios.
 *
 * @param {object} [existing]  estado previo, si se está cargando una partida
 * @param {object} [overrides] ajustes del modo de partida (decay, etc.)
 */
export const buildMinistriesState = (existing = null, overrides = {}) => {
  const out = {};

  for (const minId of Object.keys(MINISTRY_MAPPING)) {
    // Se parte de lo que hubiera, para no perder lo que el jugador ya ajustó.
    const prev = existing?.[minId] || {};
    out[minId] = {
      ...COMMON,
      ...(DEFAULTS[minId] || {}),
      ...overrides[minId],
      ...prev,
    };
  }

  return out;
};

/**
 * Ajustes del modo "decay" (partida difícil).
 *
 * Vivían duplicados en `initialState.js` y `loadMigrator.js`. Ahora el estado de
 * ministerios por planeta se construye con `buildPlanetMinistries`, así que la
 * lista tiene que estar en un único sitio o dos mundos newly colonized
 * arrancarían con reglas distintas según quién los creara.
 */
export const DECAY_MINISTRY_OVERRIDES = {
  economy: { taxRate: 0.3, treasury: -50000 },
  culture: { socialUnity: 20 },
  infra: { maintenanceBudget: 0.01 },
};

/**
 * Estado de ministerios en blanco para UN planeta.
 *
 * Un mundo sin `ministries` no debe heredar los ministros del mundo anterior:
 * cada planeta tiene su gabinete, sus nombramientos y sus programas. Antes se
 * caía a `state.ministries`, que era estado global mutado, y por eso el
 * ministro de un planeta aparecía en otro.
 *
 * @param {string} [gameMode] 'decay' aplica los ajustes de partida difícil.
 */
export const buildPlanetMinistries = (gameMode = null) =>
  buildMinistriesState(null, gameMode === 'decay' ? DECAY_MINISTRY_OVERRIDES : {});

/**
 * 1.6-3 — Requisito de edificio para operar cada sede ministerial.
 *
 * Antes este mapa vivía en `colonyGovernor.js` y solo cubría 6 de 17
 * ministerios, así que el resto se trataba como "desbloqueado" sin requisito.
 * Peor: `MINISTRY_MAPPING` YA declara `parentRequiredBuilding` en varias sedes
 * (science, cybernetics...), y ese mapa duplicado lo ignoraba. Dos fuentes de
 * verdad que además no coincidían.
 *
 * Ahora hay una sola: primero `parentRequiredBuilding` del propio ministerio, y
 * para los que no lo declaran, un mínimo explícito según lo que hacen de verdad.
 * Un ministerio sin ninguno de los dos se considera sin requisito: son inertes
 * por diseño, no desbloqueados por descuido.
 *
 * IMPORTANTE: no se inventa un requisito nuevo. Que un ministerio pueda
 * investigar no implica exigirle un laboratorio para todo: `colonyGovernor` ya
 * comprueba `researchLab >= 1` justo antes de investigar, así que un ministerio
 * harto de minas puede seguir construyéndolas en un planeta sin laboratorio.
 * Exigirlo para la investidura le quitaría también la construcción, que no es el
 * problema a arreglar.
 */
export const MINISTRY_BUILDING_REQS = (() => {
  // Mínimo para los que no declaran `parentRequiredBuilding` en el mapeo.
  const fallback = {
    war: { id: 'shipyard', name: 'Astillero Orbital' },
    innovation: { id: 'naniteFactory', name: 'Fábrica de Nanitas' },
    industry: { id: 'robotFactory', name: 'Fábrica de Robots' },
    transport: { id: 'spacePort', name: 'Puerto Espacial' },
  };

  const out = {};
  for (const [minId, mapping] of Object.entries(MINISTRY_MAPPING)) {
    const declared = mapping?.parentRequiredBuilding;
    if (declared) {
      out[minId] = { id: declared, name: declared };
    } else if (fallback[minId]) {
      out[minId] = fallback[minId];
    }
  }
  return out;
})();

/** ¿Este ministerio tiene sede operativa que exigir? */
export const ministryHasBuildingReq = (minId) =>
  Boolean(MINISTRY_BUILDING_REQS[minId]);

/** ¿Está desbloqueado el ministerio en este planeta? */
export const isMinistryUnlocked = (minId, buildings = {}) => {
  const req = MINISTRY_BUILDING_REQS[minId];
  if (!req) return true;
  return (buildings[req.id] || 0) >= 1;
};
