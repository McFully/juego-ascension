import { GAME_SPEED } from '../../data/gameData.js';
import { calcBuildTime } from './costFormulas.js';

/**
 * calcEffectiveBuildTime — Fuente única de verdad para el tiempo de construcción de edificios.
 * Cierra internamente la precedencia de ministerios, reliquias, investigaciones y bonificaciones
 * de infraestructuras a partir de la tupla canónica { cost, planet, state, speed }.
 */
export const calcEffectiveBuildTime = ({ cost, planet, state, speed = GAME_SPEED }) => {
  if (!cost || !planet) return 1;
  const buildings = planet.buildings || {};
  const research = state?.research || {};
  const mins = planet.ministries || state?.ministries || {};
  const relics = state?.relics || [];

  return calcBuildTime(
    cost,
    buildings.robotFactory || 0,
    buildings.naniteFactory || 0,
    speed,
    buildings.constructionCenter || 0,
    mins,
    research,
    buildings,
    relics
  );
};
