import {
  BUILDINGS, RESEARCH, SHIPS, DEFENSES,
  MOON_BUILDINGS, MISSIONS, MISSILES, BIOME_KEYS, AI_STRATEGIES,
  NARRATIVE_EVENTS, EVENTS, checkAchievements, checkMissions, clampResources,
  fmt, uid, buildingCost, researchCost, shipCost, defenseCost, canAfford, deduct,
  calcResourceValueForAI, meetsResearchReq, calcProduction, calcStorage, shipTimeBonus,
  calcCustomShipCost, calcCustomShipTime, calcBuildTime,
  calcShipTime, calcDefenseTime, calcDistance, calcFlightTime,
  calcFuel, fleetSpeed, getPOIAtCoordinates, getVirginPlanet,
  updatePlanet, shouldKeepNotification
} from '../core.jsx';
import { processMission, returnFleetToOrigin, processEvent } from '../missions.jsx';
import { stampTimeMult } from './tick/queues/queueTiming.js';
import { calcPlanetResearchTime } from '../utils/formulas/researchTiming.js';

export const researchReducer = (state, action) => {
  const getCurrentPlanet = () => state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  switch (action.type) {
    case 'START_RESEARCH': {
      const { researchId } = action;
      const r = RESEARCH[researchId];
      const lvl = state.research[researchId] || 0;
      
      const queuedCount = state.researchQueue.filter(q => q.researchId === researchId).length;
      const targetLvl = lvl + queuedCount + 1;

      const planet = (action.planetId ? state.planets.find(p => p.id === action.planetId) : null) || getCurrentPlanet();
      if (!planet) return state;
      const cost = researchCost(researchId, targetLvl - 1, state.research?.aiStrategy || 0, planet.buildings?.constructionCenter || 0);

      if (!canAfford(planet.resources, cost)) return state;
      if (!meetsResearchReq(r.req, { ...(planet.buildings || {}), ...(state.research || {}) })) return state;
      if (!planet.buildings?.researchLab) return state;
      if (state.researchQueue.length >= 8) return state;

      const newRes = clampResources(deduct(planet.resources, cost));
      const time = calcPlanetResearchTime(state, planet, cost);
      
      const startTime = Date.now();
      const endTime = startTime + time * 1000;

      let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: newRes }));
      newState.researchQueue = [...state.researchQueue, stampTimeMult(newState, 'research', {
        id: uid(), researchId, startTime, endTime, level: targetLvl, planetId: planet.id,
      })];
      return newState;
    }

    default:
      return state;
  }
};
