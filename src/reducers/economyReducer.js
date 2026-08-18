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


export const economyReducer = (state, action) => {
  const getCurrentPlanet = () => state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  let newState = { ...state };
  switch (action.type) {
    case 'SET_PLANET':
      return { ...state, currentPlanetId: action.payload };

    case 'RENAME_PLANET': {
      const { planetId, name } = action;
      if (!name || name.trim().length === 0) return state;
      return updatePlanet(state, planetId, p => ({ ...p, name: name.trim().slice(0, 20) }));
    }

    case 'PLANET_SPECIALIZE': {
      const { planetId, specialization } = action; // 'industrial', 'scientific', 'military', 'commercial', or null
      const planet = state.planets.find(p => p.id === planetId);
      if (!planet) return state;

      let cost = { metal: 0, crystal: 0, deuterium: 0 };
      if (specialization === 'industrial') {
        cost = { metal: 10000, crystal: 10000, deuterium: 0 };
      } else if (specialization === 'scientific') {
        cost = { metal: 15000, crystal: 10000, deuterium: 5000 };
      } else if (specialization === 'military') {
        cost = { metal: 10000, crystal: 15000, deuterium: 5000 };
      } else if (specialization === 'commercial') {
        cost = { metal: 12000, crystal: 12000, deuterium: 2000 };
      }

      if (!canAfford(planet.resources, cost)) return state;

      let newState = updatePlanet(state, planetId, p => ({
        ...p,
        resources: deduct(p.resources, cost),
        specialization: specialization
      }));

      const specNames = {
        industrial: 'Industrial/Minera',
        scientific: 'Científica',
        military: 'Militar',
        commercial: 'Comercial'
      };
      const specName = specNames[specialization] || 'Ninguna';

      newState.notifications = [...(newState.notifications || []), {
        id: uid(),
        type: 'success',
        message: `🌟 Planeta ${planet.name} especializado en rama: ${specName}`,
        timestamp: Date.now()
      }];

      return newState;
    }

    case 'PLANET_TOGGLE_AUTOTRADE': {
      const { planetId } = action;
      return updatePlanet(state, planetId, p => ({ ...p, autoTrade: !p.autoTrade }));
    }

    case 'START_BUILDING': {
      const { buildingId } = action;
      const planet = getCurrentPlanet();
      if (!planet) return state;
      const b = BUILDINGS[buildingId];
      const lvl = planet.buildings[buildingId] || 0;
      
      const planetBuildQueue = state.buildQueue.filter(q => q.planetId === planet.id);
      const queuedCount = planetBuildQueue.filter(q => q.buildingId === buildingId).length;
      const targetLvl = lvl + queuedCount + 1;
      const requiredPopulation = targetLvl * 150;
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
      if (!meetsReq(b.req, { ...planet.buildings, ...state.research })) return state;
      if (planetBuildQueue.length >= 8) return state;

      const newRes = clampResources(deduct(planet.resources, cost));
      const time = calcBuildTime(cost, planet.buildings.robotFactory || 0, planet.buildings.naniteFactory || 0, GAME_SPEED, planet.buildings.constructionCenter || 0, {}, state.research, planet.buildings);
      
      const startTime = Date.now();
      const endTime = startTime + time * 1000;

      let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: newRes }));
      newState.buildQueue = [...state.buildQueue, {
        id: uid(), planetId: planet.id, buildingId, startTime, endTime, level: targetLvl,
      }];
      return newState;
    }

    default:
      return state;
  }
};
