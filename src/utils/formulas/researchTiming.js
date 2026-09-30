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
 * Tiempo de investigación en SEGUNDOS para un planeta concreto.
 *
 * @param {object} state  estado global (solo se lee `research`)
 * @param {object} planet planeta que realiza la investigación
 * @param {object} cost   { metal, crystal, deuterium }
 * @returns {number} segundos, mínimo 1
 */
export const calcPlanetResearchTime = (state, planet, cost) => {
  if (!planet) return 1;
  const buildings = planet.buildings || {};
  const research = state?.research || {};
  const mins = planet.ministries || state?.ministries || {};

  const factor =
    researchTimeBonus(buildings, research)   // ya es 1 + aceleradores
    * worldMultiplierFor(planet);

  return Math.max(1, Math.floor(
    calcResearchTime(cost, buildings.researchLab || 0, GAME_SPEED, factor, mins, research) || 1
  ));
};

/**
 * Multicplicador de velocidad de la investigación en un planeta, con un coste sonda
 * de 1. Sirve para reajustar operaciones EN CURSO: como `calcResearchTime` es
 * proporcional a `cost`, el cociente de sondeos es el cociente de duraciones reales.
 *
 * @returns {number|null} duración sonda en segundos, o null si no se puede calcular
 */
export const researchTimeMultFor = (state, planet) => {
  if (!planet) return null;
  const probe = { metal: 1000, crystal: 1000, deuterium: 0 };
  const mult = calcPlanetResearchTime(state, planet, probe);
  return Number.isFinite(mult) && mult > 0 ? mult : null;
};
