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
import { calcPlanetResearchTime, getPlanetEffectiveLab, getMaxResearchQueueSlots } from '../utils/formulas/researchTiming.js';

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
      const effectiveLab = getPlanetEffectiveLab(state, planet);
      if (effectiveLab < 1) return state;
      const reqBuildings = { ...(planet.buildings || {}), researchLab: effectiveLab };
      if (!meetsResearchReq(r.req, { ...reqBuildings, ...(state.research || {}) })) return state;
      const maxSlots = getMaxResearchQueueSlots(state);
      if (state.researchQueue.length >= maxSlots) return state;

      const newRes = clampResources(deduct(planet.resources, cost));
      const time = calcPlanetResearchTime(state, planet, cost, researchId);
      
      const startTime = Date.now();
      const endTime = startTime + time * 1000;

      let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: newRes }));
      newState.researchQueue = [...state.researchQueue, stampTimeMult(newState, 'research', {
        id: uid(), researchId, startTime, endTime, level: targetLvl, planetId: planet.id,
      })];
      return newState;
    }

    case 'TOGGLE_RESEARCH_NODE_LINK': {
      const { planetId } = action;
      if (!planetId) return state;

      const network = state.researchNetwork || { baseSlots: 2, linkedPlanetIds: [] };
      const linked = network.linkedPlanetIds || [];
      const isAlreadyLinked = linked.includes(planetId);

      if (isAlreadyLinked) {
        return {
          ...state,
          researchNetwork: {
            ...network,
            linkedPlanetIds: linked.filter(id => id !== planetId)
          }
        };
      }

      // Conectar: validar slots (la sede es el nodo central sin coste de ranura)
      const planets = state.planets || [];
      const homePlanet = planets.find(p => p.isHome) || planets[0];
      const usedSlots = linked.filter(id => id !== homePlanet?.id).length;

      const totalLevels = linked.reduce((sum, pid) => {
        const p = planets.find(item => item.id === pid);
        return sum + (p?.buildings?.researchLab || 0);
      }, 0);
      const bonusSlots = totalLevels >= 75 ? 1 : 0;
      const maxSlots = (network.baseSlots || 2) + bonusSlots;

      const targetPlanet = planets.find(p => p.id === planetId);
      if (!targetPlanet) return state;

      // Planetas colonia requieren ranuras libres
      if (planetId !== homePlanet?.id && usedSlots >= maxSlots) return state;

      const lab = targetPlanet.buildings?.researchLab || 0;
      let energyProd = targetPlanet.resources?.energy || 0;
      try {
        const prod = calcProduction(
          targetPlanet.buildings || {},
          state.research || {},
          targetPlanet.temperature ?? 20,
          1,
          targetPlanet.faction || 'human',
          targetPlanet.biome || null,
          targetPlanet.gravity ?? null,
          targetPlanet.trait || null,
          targetPlanet.specialization || 'balanced',
          targetPlanet.coords || null,
          targetPlanet.taxRate || 0,
          state.relics || []
        );
        energyProd = Math.max(energyProd, prod?.energyProd || 0);
      } catch (_) {}
      if (lab < 3 || energyProd < 50) return state;

      return {
        ...state,
        researchNetwork: {
          ...network,
          linkedPlanetIds: [...linked, planetId]
        }
      };
    }

    case 'UPGRADE_RESEARCH_NETWORK_SLOT': {
      const network = state.researchNetwork || { baseSlots: 2, linkedPlanetIds: [] };
      const currentSlots = network.baseSlots || 2;
      const cost = {
        metal: currentSlots * 8000,
        crystal: currentSlots * 15000,
        deuterium: currentSlots * 8000
      };

      const capitalPlanet = state.planets?.find(p => p.isHome) || state.planets?.[0];
      if (!capitalPlanet) return state;
      if (!canAfford(capitalPlanet.resources, cost)) return state;

      const newRes = clampResources(deduct(capitalPlanet.resources, cost));
      const newState = updatePlanet(state, capitalPlanet.id, p => ({ ...p, resources: newRes }));

      return {
        ...newState,
        researchNetwork: {
          ...network,
          baseSlots: currentSlots + 1
        }
      };
    }

    default:
      return state;
  }
};
