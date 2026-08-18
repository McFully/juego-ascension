import {
  GAME_SPEED, FACTIONS, BUILDINGS, RESEARCH, SHIPS, DEFENSES,
  MOON_BUILDINGS, MISSIONS, MISSILES, BIOME_KEYS, AI_STRATEGIES,
  NARRATIVE_EVENTS, EVENTS, checkAchievements, checkMissions, clampResources,
  fmt, uid, buildingCost, researchCost, shipCost, defenseCost, canAfford, deduct,
  calcResourceValueForAI, meetsReq, calcProduction, calcStorage, shipTimeBonus,
  researchTimeBonus, calcCustomShipCost, calcCustomShipTime, calcBuildTime,
  calcResearchTime, calcShipTime, calcDefenseTime, calcDistance, calcFlightTime,
  calcFuel, fleetSpeed, getPOIAtCoordinates, getVirginPlanet,
  updatePlanet, shouldKeepNotification
} from '../core.jsx';
import { processMission, returnFleetToOrigin, processEvent } from '../missions.jsx';

export const researchReducer = (state, action) => {
  const getCurrentPlanet = () => state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  switch (action.type) {
    case 'START_RESEARCH': {
      const { researchId } = action;
      const r = RESEARCH[researchId];
      const lvl = state.research[researchId] || 0;
      
      const queuedCount = state.researchQueue.filter(q => q.researchId === researchId).length;
      const targetLvl = lvl + queuedCount + 1;

      const planet = getCurrentPlanet();
      if (!planet) return state;
      const cost = researchCost(researchId, targetLvl - 1, state.research?.aiStrategy || 0, planet.buildings?.constructionCenter || 0);

      if (!canAfford(planet.resources, cost)) return state;
      if (!meetsReq(r.req, state.research)) return state;
      if (!planet.buildings.researchLab) return state;
      if (state.researchQueue.length >= 8) return state;

      const newRes = deduct(planet.resources, cost);
      const bonus = researchTimeBonus(planet.buildings);
      const factionResearchBonus = (FACTIONS[planet.faction] || FACTIONS.human).bonuses.research || 1.0;
      let specBonus = 1.0;
      if (planet.specialization === 'scientific') specBonus = 1.15;
      const time = calcResearchTime(cost, planet.buildings.researchLab, GAME_SPEED, bonus * factionResearchBonus * specBonus);
      
      const startTime = Date.now();
      const endTime = startTime + time * 1000;

      let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: newRes }));
      newState.researchQueue = [...state.researchQueue, {
        id: uid(), researchId, startTime, endTime, level: targetLvl, planetId: planet.id,
      }];
      return newState;
    }

    default:
      return state;
  }
};
