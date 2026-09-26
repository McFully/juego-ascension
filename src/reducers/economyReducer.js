import {
  GAME_SPEED, FACTIONS, BUILDINGS, RESEARCH, SHIPS, DEFENSES,
  MOON_BUILDINGS, MISSIONS, MISSILES, BIOME_KEYS, AI_STRATEGIES,
  NARRATIVE_EVENTS, EVENTS, checkAchievements, checkMissions, clampResources,
  fmt, uid, buildingCost, researchCost, shipCost, defenseCost, canAfford, deduct,
  calcRequiredPopulation,
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
    case 'SET_PLANET': {
      const targetId = action.payload || action.planetId;
      return targetId ? { ...state, currentPlanetId: targetId } : state;
    }

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

    case 'MARKET_TRADE': {
      const { planetId, sellResource, buyResource, sellAmount, buyAmount } = action;
      const targetPlanet = state.planets.find(p => p.id === (planetId || state.currentPlanetId)) || getCurrentPlanet();
      if (!targetPlanet) return state;
      if (!sellResource || !buyResource || sellAmount <= 0 || buyAmount <= 0) return state;
      if ((targetPlanet.resources[sellResource] || 0) < sellAmount) {
        return {
          ...state,
          notifications: [...(state.notifications || []), {
            id: uid(),
            type: 'warning',
            message: `⚠️ Recursos insuficientes en ${targetPlanet.name} para completar la transacción.`,
            timestamp: Date.now()
          }]
        };
      }

      const newRes = {
        ...targetPlanet.resources,
        [sellResource]: Math.max(0, targetPlanet.resources[sellResource] - sellAmount),
        [buyResource]: (targetPlanet.resources[buyResource] || 0) + buyAmount
      };

      const resNames = { metal: 'Metal', crystal: 'Cristal', deuterium: 'Deuterio' };
      let newState = updatePlanet(state, targetPlanet.id, p => ({ ...p, resources: newRes }));
      newState.notifications = [...(newState.notifications || []), {
        id: uid(),
        type: 'success',
        message: `💼 Transacción completada: -${fmt(sellAmount)} ${resNames[sellResource]} -> +${fmt(buyAmount)} ${resNames[buyResource]}`,
        timestamp: Date.now()
      }];
      return newState;
    }

    case 'EQUALIZE_COLONY_RESOURCES': {
      if (!state.planets || state.planets.length <= 1) return state;
      let totalMetal = 0, totalCrystal = 0, totalDeut = 0;
      state.planets.forEach(p => {
        totalMetal += p.resources.metal || 0;
        totalCrystal += p.resources.crystal || 0;
        totalDeut += p.resources.deuterium || 0;
      });

      const count = state.planets.length;
      const avgMetal = Math.floor(totalMetal / count);
      const avgCrystal = Math.floor(totalCrystal / count);
      const avgDeut = Math.floor(totalDeut / count);

      const newPlanets = state.planets.map(p => ({
        ...p,
        resources: {
          metal: avgMetal,
          crystal: avgCrystal,
          deuterium: avgDeut
        }
      }));

      return {
        ...state,
        planets: newPlanets,
        notifications: [...(state.notifications || []), {
          id: uid(),
          type: 'success',
          message: `⚖️ Recursos equilibrados en las ${count} colonias (${fmt(avgMetal)}M / ${fmt(avgCrystal)}C / ${fmt(avgDeut)}D por mundo)`,
          timestamp: Date.now()
        }]
      };
    }

    case 'RELOCATE_COLONY_FLEET': {
      const { fromPlanetId, toPlanetId, ships } = action;
      if (!fromPlanetId || !toPlanetId || fromPlanetId === toPlanetId || !ships) return state;
      const fromP = state.planets.find(p => p.id === fromPlanetId);
      const toP = state.planets.find(p => p.id === toPlanetId);
      if (!fromP || !toP) return state;

      const newFromFleet = { ...(fromP.fleet || {}) };
      const newToFleet = { ...(toP.fleet || {}) };
      let movedCount = 0;

      for (const [shipId, qty] of Object.entries(ships)) {
        const available = newFromFleet[shipId] || 0;
        const toMove = Math.min(available, Math.max(0, qty));
        if (toMove > 0) {
          newFromFleet[shipId] = available - toMove;
          if (newFromFleet[shipId] <= 0) delete newFromFleet[shipId];
          newToFleet[shipId] = (newToFleet[shipId] || 0) + toMove;
          movedCount += toMove;
        }
      }

      if (movedCount === 0) return state;

      let newState = updatePlanet(state, fromPlanetId, p => ({ ...p, fleet: newFromFleet }));
      newState = updatePlanet(newState, toPlanetId, p => ({ ...p, fleet: newToFleet }));
      newState.notifications = [...(newState.notifications || []), {
        id: uid(),
        type: 'info',
        message: `🚀 Reubicación completada: ${movedCount} naves transferidas de ${fromP.name} a ${toP.name}`,
        timestamp: Date.now()
      }];
      return newState;
    }

    case 'START_PLANET_TERRAFORMING': {
      const { planetId } = action;
      const planet = state.planets.find(p => p.id === planetId);
      if (!planet) return state;

      const hasShip = (planet.fleet?.terraformerShip || 0) >= 1;
      if (!hasShip) {
        return {
          ...state,
          notifications: [
            ...(state.notifications || []),
            {
              id: uid(),
              type: 'warning',
              message: `🚫 Se requiere una Nave Terraformatriz en órbita de ${planet.name} para acondicionar el planeta.`,
              timestamp: Date.now()
            }
          ]
        };
      }

      return updatePlanet(state, planetId, p => ({
        ...p,
        isTerraformingActive: true,
        terraformingProgress: 5
      }));
    }

    case 'MARKET_BUY_USED_SHIPS': {
      const { planetId, lot, cost } = action;
      const targetPlanet = state.planets.find(p => p.id === (planetId || state.currentPlanetId)) || getCurrentPlanet();
      if (!targetPlanet || !lot || !cost) return state;

      if (!canAfford(targetPlanet.resources, cost)) {
        return {
          ...state,
          notifications: [...(state.notifications || []), {
            id: uid(),
            type: 'warning',
            message: `⚠️ Recursos insuficientes en ${targetPlanet.name} para adquirir este lote naval de ocasión.`,
            timestamp: Date.now()
          }]
        };
      }

      const newRes = deduct(targetPlanet.resources, cost);
      const currentFleet = { ...(targetPlanet.fleet || {}) };
      currentFleet[lot.shipId] = (currentFleet[lot.shipId] || 0) + lot.quantity;

      let newState = updatePlanet(state, targetPlanet.id, p => ({
        ...p,
        resources: newRes,
        fleet: currentFleet
      }));

      newState.notifications = [...(newState.notifications || []), {
        id: uid(),
        type: 'success',
        message: `🛸 Lote de ocasión adquirido: +${lot.quantity} ${lot.title} asignadas al hangar de ${targetPlanet.name}.`,
        timestamp: Date.now()
      }];
      return newState;
    }

    case 'MARKET_SCRAP_SHIPS': {
      const { planetId, shipId, quantity, returnResources } = action;
      const targetPlanet = state.planets.find(p => p.id === (planetId || state.currentPlanetId)) || getCurrentPlanet();
      if (!targetPlanet || !shipId || quantity <= 0) return state;

      const available = targetPlanet.fleet?.[shipId] || 0;
      if (available < quantity) return state;

      const currentFleet = { ...(targetPlanet.fleet || {}) };
      currentFleet[shipId] = available - quantity;
      if (currentFleet[shipId] <= 0) delete currentFleet[shipId];

      const newRes = {
        ...targetPlanet.resources,
        metal: (targetPlanet.resources.metal || 0) + (returnResources?.metal || 0),
        crystal: (targetPlanet.resources.crystal || 0) + (returnResources?.crystal || 0),
        deuterium: (targetPlanet.resources.deuterium || 0) + (returnResources?.deuterium || 0)
      };

      let newState = updatePlanet(state, targetPlanet.id, p => ({
        ...p,
        resources: newRes,
        fleet: currentFleet
      }));

      newState.notifications = [...(newState.notifications || []), {
        id: uid(),
        type: 'success',
        message: `♻️ Desguace completado: ${quantity} unidades recicladas en ${targetPlanet.name}. Materiales recuperados con éxito.`,
        timestamp: Date.now()
      }];
      return newState;
    }

    case 'MARKET_BUY_BLACK_MARKET': {
      const { planetId, item, cost } = action;
      const targetPlanet = state.planets.find(p => p.id === (planetId || state.currentPlanetId)) || getCurrentPlanet();
      if (!targetPlanet || !item || !cost) return state;

      if (!canAfford(targetPlanet.resources, cost)) {
        return {
          ...state,
          notifications: [...(state.notifications || []), {
            id: uid(),
            type: 'warning',
            message: `⚠️ Recursos insuficientes para pactar con el sindicato del Mercado Negro.`,
            timestamp: Date.now()
          }]
        };
      }

      let newRes = deduct(targetPlanet.resources, cost);
      if (item.grantResources) {
        newRes = {
          ...newRes,
          metal: (newRes.metal || 0) + (item.grantResources.metal || 0),
          crystal: (newRes.crystal || 0) + (item.grantResources.crystal || 0),
          deuterium: (newRes.deuterium || 0) + (item.grantResources.deuterium || 0)
        };
      }

      const currentFleet = { ...(targetPlanet.fleet || {}) };
      if (item.grantFleet) {
        Object.entries(item.grantFleet).forEach(([sId, qty]) => {
          currentFleet[sId] = (currentFleet[sId] || 0) + qty;
        });
      }

      const currentDefenses = { ...(targetPlanet.defenses || {}) };
      if (item.grantDefenses) {
        Object.entries(item.grantDefenses).forEach(([dId, qty]) => {
          currentDefenses[dId] = (currentDefenses[dId] || 0) + qty;
        });
      }

      let newState = updatePlanet(state, targetPlanet.id, p => ({
        ...p,
        resources: newRes,
        fleet: currentFleet,
        defenses: currentDefenses
      }));

      if (item.grantInfluence) {
        newState.influence = (newState.influence || 0) + item.grantInfluence;
      }

      newState.notifications = [...(newState.notifications || []), {
        id: uid(),
        type: 'success',
        message: `🕵️ Transacción clandestina sellada: "${item.title}". Beneficios ingresados en ${targetPlanet.name}.`,
        timestamp: Date.now()
      }];
      return newState;
    }

    default:
      return state;
  }
};
