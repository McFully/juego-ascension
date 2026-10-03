import {
  calcRequiredPopulation,
  buildingCost,
  canAfford,
  deduct,
  clampResources,
  meetsResearchReq,
  calcEffectiveBuildTime,
  GAME_SPEED,
  BUILDINGS,
  uid,
  updatePlanet
} from '../../core.jsx';
import { stampTimeMult } from '../tick/queues/queueTiming.js';

export const handleStartBuilding = (state, action, getCurrentPlanet) => {
  const { buildingId, planetId } = action;
  const planet = (planetId ? state.planets.find(p => p.id === planetId) : null) || getCurrentPlanet();
  if (!planet) return state;
  const b = BUILDINGS[buildingId];
  const lvl = planet.buildings[buildingId] || 0;
  
  const planetBuildQueue = state.buildQueue.filter(q => q.planetId === planet.id);
  const queuedCount = planetBuildQueue.filter(q => q.buildingId === buildingId).length;
  const targetLvl = lvl + queuedCount + 1;
  const requiredPopulation = calcRequiredPopulation(buildingId, targetLvl);
  const currentPopulation = planet.population || 1000;
  if (currentPopulation < requiredPopulation) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `👥 Población insuficiente para ${b.name} Nivel ${targetLvl}. Requiere ${requiredPopulation} habitantes (tienes ${currentPopulation}).`,
        timestamp: Date.now()
      }]
    };
  }
  const cost = buildingCost(buildingId, targetLvl - 1, planet.buildings?.constructionCenter || 0);
  
  if (!canAfford(planet.resources, cost)) return state;
  if (!meetsResearchReq(b.req, { ...planet.buildings, ...state.research })) return state;
  if (planetBuildQueue.length >= 8) return state;

  const newRes = clampResources(deduct(planet.resources, cost));
  const time = calcEffectiveBuildTime({ cost, planet, state, speed: GAME_SPEED });
  
  const startTime = Date.now();
  const endTime = startTime + time * 1000;

  let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: newRes }));
  const queued = stampTimeMult(newState, 'build', {
    id: uid(), planetId: planet.id, buildingId, startTime, endTime, level: targetLvl,
  });
  newState.buildQueue = [...state.buildQueue, queued];
  return newState;
};
