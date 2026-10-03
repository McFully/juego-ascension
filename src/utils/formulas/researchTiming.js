/**
 * researchTiming.js — Fuente ÚNICA de verdad del tiempo de investigación.
 *
 * EL PROBLEMA QUE RESUELVE
 * ------------------------
 * El tiempo de investigación se calculaba en tres sitios distintos y los tres
 * discrepaban:
 *
 *   - researchReducer (START_RESEARCH manual)
 *       researchTimeBonus(buildings)                       // sin research
 *       × faction × specialization
 *       calcResearchTime(cost, lab, GAME_SPEED, b)        // sin mins, sin research
 *     → ignoraba las techs de investigación themselves, los researchGrants, el
 *       ministro de ciencia y synchronousOptical.
 *
 *   - autoResearchTick (IA)
 *       (1 + researchTimeBonus(buildings, research)) × (1 + researchGrants)
 *       calcResearchTime(cost, lab, GAME_SPEED, b, mins, research)
 *     → TRES errores: `researchTimeBonus` ya devuelve `1 + ...`, así que el `1 +`
 *       lo duplicaba; los grants se aplicaban dos veces (aquí y dentro de
 *       calcResearchTime); y faltaban faction y specialization.
 *
 *   - queueTiming.js (reajuste de operaciones en curso)
 *     → tenía que replicar a mano una de las dos versiones, así que arrastraba
 *       uno de los dos errores según cuál copiara.
 *
 * LA SOLUCIÓN
 * -----------
 * Un solo sitio calcula el tiempo, y todo el que necesite un tiempo de
 * investigación (manual, automático o re-ajuste) pasa por aquí. Si mañana se
 * toca una fórmula, los tres caminos cambian a la vez por construcción.
 *
 * NOTA SOBRE LA ARITMÉTICA
 * ------------------------
 * `researchTimeBonus(b, r)` ya devuelve `1 + accelerator`: es un FACTOR, no un
 * porcentaje. Multiplicarlo por faction y specialization es correcto; sumarle
 * otro `1` (como hacía autoResearchTick) no lo era.
 *
 * Los `researchGrants`, el ministro de ciencia y el bonus de `synchronousOptical`
 * NO se aplican aquí: `calcResearchTime` ya los gestiona internamente a partir de
 * `mins` y `research`. Por eso se los pasan tal cual.
 */

import { GAME_SPEED, FACTIONS } from '../../data/gameData.js';
import { researchTimeBonus, calcResearchTime } from '../formulas.js';

/** Factor de la facción + especialización de un planeta, para investigación. */
const worldMultiplierFor = (planet) => {
  const factionBonus = (FACTIONS[planet?.faction] || FACTIONS.human).bonuses?.research || 1.0;
  const specBonus = planet?.specialization === 'scientific' ? 1.15 : 1.0;
  return factionBonus * specBonus;
};

/**
 * Multiplicador global de tiempo de investigación para un planeta (duración del sondeo en segundos).
 */
export const researchTimeMultFor = (state, planet) => {
  if (!planet) return null;
  return calcPlanetResearchTime(state, planet, { metal: 1000, crystal: 1000, deuterium: 0 });
};

/**
 * Obtiene el nivel efectivo de laboratorio de un planeta teniendo en cuenta
 * la Red Neural de Laboratorios compartida.
 * Si el planeta está enlazado a la red o es la sede con red activa, consolida
 * los laboratorios de todos los nodos sincronizados del imperio.
 */
export const getPlanetEffectiveLab = (state, planet) => {
  if (!planet) return 0;
  const localLab = planet.buildings?.researchLab || 0;
  const network = state?.researchNetwork;
  const linkedIds = network?.linkedPlanetIds || [];
  const planets = state?.planets || [];
  const homePlanet = planets.find(p => p.isHome) || planets[0];
  
  const isNetworkActive = linkedIds.includes(planet.id) || (planet.id === homePlanet?.id && linkedIds.length > 0);
  if (!isNetworkActive) return localLab;

  const networkPlanetIds = new Set(linkedIds);
  if (homePlanet) networkPlanetIds.add(homePlanet.id);

  return Array.from(networkPlanetIds).reduce((sum, pid) => {
    const p = planets.find(item => item.id === pid);
    return sum + (p?.buildings?.researchLab || 0);
  }, 0);
};

/**
 * Tiempo de investigación en SEGUNDOS para un planeta concreto.
 *
 * @param {object} state  estado global (solo se lee `research`)
 * @param {object} planet planeta que realiza la investigación
 * @param {object} cost   { metal, crystal, deuterium }
 * @param {string} [researchId] identificador opcional de la tecnología
 * @returns {number} segundos, mínimo 1
 */
export const calcPlanetResearchTime = (state, planet, cost, researchId = null) => {
  if (!planet) return 1;
  const buildings = planet.buildings || {};
  const research = state?.research || {};
  const mins = planet.ministries || state?.ministries || {};

  const factor =
    researchTimeBonus(buildings, research)   // ya es 1 + aceleradores
    * worldMultiplierFor(planet);

  // Red Neural de Laboratorios: consolida laboratorios compartidos
  const effectiveLab = getPlanetEffectiveLab(state, planet);
  let networkTimeMult = 1.0;

  const network = state?.researchNetwork;
  const linkedIds = network?.linkedPlanetIds || [];
  const planets = state?.planets || [];
  const homePlanet = planets.find(p => p.isHome) || planets[0];
  const isNetworkActive = linkedIds.includes(planet.id) || (planet.id === homePlanet?.id && linkedIds.length > 0);

  if (isNetworkActive) {
    // Hito de 25 niveles: -10% tiempo en techs de IA y Cómputo
    const aiComputerTechs = ['computer', 'aiTactics', 'aiProd', 'aiMilitary', 'aiStrategy', 'fullAuto', 'cyberIntegration'];
    if (effectiveLab >= 25 && researchId && aiComputerTechs.includes(researchId)) {
      networkTimeMult *= 0.90;
    }
    // Hito de 100 niveles: -25% de tiempo adicional
    if (effectiveLab >= 100) {
      networkTimeMult *= 0.75;
    }
  }

  const baseSeconds = calcResearchTime(cost, effectiveLab, GAME_SPEED, factor, mins, research) || 1;
  return Math.max(1, Math.floor(baseSeconds * networkTimeMult));
};

/**
 * Calcula la capacidad máxima de la cola de investigación.
 * Base: 8 ranuras concurrentes.
 * Cada nodo planetario sincronizado a la Red Neural añade +2 ranuras a la cola.
 * Adicionalmente, cada 25 niveles acumulados de laboratorio en la red añaden +1 ranura extra.
 *
 * @param {object} state estado global
 * @returns {number} slots máximos de cola de investigación
 */
export const getMaxResearchQueueSlots = (state) => {
  const baseSlots = 8;
  const network = state?.researchNetwork;
  const linkedIds = network?.linkedPlanetIds || [];
  const planets = state?.planets || [];
  const homePlanet = planets.find(p => p.isHome) || planets[0];

  const networkPlanetIds = new Set(linkedIds);
  if (homePlanet && linkedIds.length > 0) {
    networkPlanetIds.add(homePlanet.id);
  }

  const linkedBonus = linkedIds.length * 2;
  
  // Total de laboratorios enlazados
  const totalLab = Array.from(networkPlanetIds).reduce((sum, pid) => {
    const p = planets.find(item => item.id === pid);
    return sum + (p?.buildings?.researchLab || 0);
  }, 0);

  const labBonus = Math.floor(totalLab / 25);

  return baseSlots + linkedBonus + labBonus;
};
