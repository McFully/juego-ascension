import {
  checkAchievements, checkMissions, getVirginPlanet,
  updatePlanet, shouldKeepNotification,
  clampResources, fmt, uid, buildingCost, researchCost, shipCost, defenseCost,
  constructionDiscount,
  canAfford, deduct, calcResourceValueForAI, meetsReq, calcProduction, calcStorage,
  shipTimeBonus, researchTimeBonus, calcCustomShipCost, calcCustomShipTime, calcBuildTime,
  calcResearchTime, calcShipTime, calcDefenseTime, calcDistance, calcFlightTime,
  calcFuel, fleetSpeed, getPOIAtCoordinates
} from '../core.jsx';
import {
  GAME_SPEED, FACTIONS, BUILDINGS, RESEARCH, SHIPS, DEFENSES,
  MOON_BUILDINGS, MISSIONS, MISSILES, BIOME_KEYS, AI_STRATEGIES,
  NARRATIVE_EVENTS, EVENTS
} from '../data/gameData.js';
import { processMission, returnFleetToOrigin, processEvent } from '../missions.jsx';
import { handleBuildMissile, handleLaunchMissile } from './fleet/missileReducer.js';
import {
  handleSaveBlueprint, handleDeleteBlueprint, handleBuildCustomShip, handleCancelCustomShipQueue
} from './fleet/blueprintReducer.js';
import {
  handleSaveFleetPreset, handleDeleteFleetPreset, handleAddTradeRoute,
  handleRemoveTradeRoute, handleToggleTradeRoute, handleProcessTradeRoutes
} from './fleet/tradeRouteReducer.js';
import { handleBuildMoonBuilding, handleJumpGateTransfer } from './fleet/moonReducer.js';
import { handleAbandonPlanet, handleScrapShips, handleScrapDefenses, handleColonize } from './fleet/colonyReducer.js';


import { handleStartShip, handleStartDefense } from './fleet/shipProductionActions.js';
import { handleSendFleet } from './fleet/fleetMissionActions.js';
import {
  handleRetrofitFleet,
  handleRetrofitDefenses,
  handleRetrofitShipVariant,
  handleRetrofitDefenseVariant,
  handleCancelRetrofitQueue
} from './fleet/retrofitActions.js';
import { handleDeployPatrol, handleRecallPatrol, handleReinforcePatrol, handleInterceptInvasion } from './fleet/patrolActions.js';

export const fleetReducer = (state, action) => {
  const getCurrentPlanet = () => state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  let newState = { ...state };
  switch (action.type) {
    case 'DEPLOY_PATROL': {
      return handleDeployPatrol(state, action);
    }

    case 'RECALL_PATROL': {
      return handleRecallPatrol(state, action);
    }

    case 'REINFORCE_PATROL': {
      return handleReinforcePatrol(state, action);
    }

    case 'INTERCEPT_INVASION': {
      return handleInterceptInvasion(state, action);
    }

    case 'START_SHIP': {
      return handleStartShip(state, action);
    }

    case 'START_DEFENSE': {
      return handleStartDefense(state, action);
    }

    case 'SEND_FLEET': {
      return handleSendFleet(state, action);
    }

    case 'ABANDON_PLANET': {
      return handleAbandonPlanet(state, action);
    }

    case 'RETROFIT_FLEET': {
      return handleRetrofitFleet(state, action);
    }

    case 'RETROFIT_DEFENSES': {
      return handleRetrofitDefenses(state, action);
    }

    case 'RETROFIT_SHIP_VARIANT': {
      return handleRetrofitShipVariant(state, action);
    }

    case 'RETROFIT_DEFENSE_VARIANT': {
      return handleRetrofitDefenseVariant(state, action);
    }

    case 'CANCEL_RETROFIT_QUEUE': {
      return handleCancelRetrofitQueue(state, action);
    }

    case 'BUILD_MOON_BUILDING': {
      return handleBuildMoonBuilding(state, action);
    }

    // Alias historico. MoonPage despachaba START_MOON_BUILDING, nombre que no
    // existia en ningun reducer: la base lunar no construia. Se acepta el
    // nombre viejo para que un enlace o un save en vuelo no se rompa.
    case 'START_MOON_BUILDING': {
      return handleBuildMoonBuilding(state, action);
    }

    case 'JUMP_GATE_TRANSFER': {
      return handleJumpGateTransfer(state, action);
    }

    case 'BUILD_MISSILE': {
      return handleBuildMissile(state, action);
    }

    case 'LAUNCH_MISSILE': {
      return handleLaunchMissile(state, action);
    }

    case 'SAVE_BLUEPRINT': {
      return handleSaveBlueprint(state, action);
    }

    case 'DELETE_BLUEPRINT': {
      return handleDeleteBlueprint(state, action);
    }

    case 'BUILD_CUSTOM_SHIP': {
      return handleBuildCustomShip(state, action);
    }

    case 'CANCEL_CUSTOM_SHIP_QUEUE': {
      return handleCancelCustomShipQueue(state, action);
    }

    case 'CANCEL_BUILD_QUEUE': {
      const { queueId } = action;
      const targetItem = state.buildQueue.find(q => q.id === queueId);
      if (!targetItem) return state;

      // Si se cancela un nivel, también se cancelan en cascada los niveles superiores en cola de ese mismo edificio y planeta
      const sameBuildingItems = state.buildQueue.filter(
        q => q.planetId === targetItem.planetId && q.buildingId === targetItem.buildingId
      );
      const itemsToCancel = sameBuildingItems.filter(q => q.level >= targetItem.level);
      const idsToCancel = new Set(itemsToCancel.map(q => q.id));

      const b = BUILDINGS[targetItem.buildingId];
      const bPl = state.planets.find(p => p.id === targetItem.planetId);

      let totalRefund = { metal: 0, crystal: 0, deuterium: 0 };
      for (const it of itemsToCancel) {
        const cost = buildingCost(it.buildingId, it.level - 1, bPl?.buildings?.constructionCenter || 0);
        totalRefund.metal += Math.floor(cost.metal * 0.5);
        totalRefund.crystal += Math.floor(cost.crystal * 0.5);
        totalRefund.deuterium += Math.floor((cost.deuterium || 0) * 0.5);
      }

      let newState = updatePlanet(state, targetItem.planetId, p => ({
        ...p,
        resources: {
          metal: p.resources.metal + totalRefund.metal,
          crystal: p.resources.crystal + totalRefund.crystal,
          deuterium: p.resources.deuterium + totalRefund.deuterium
        }
      }));

      newState.buildQueue = state.buildQueue.filter(q => !idsToCancel.has(q.id));
      const msg = itemsToCancel.length > 1
        ? `🚫 Canceladas ${itemsToCancel.length} órdenes de ${b?.name || 'edificio'}. Reembolso 50%`
        : `🚫 Construcción de ${b?.name || 'edificio'} (Nv. ${targetItem.level}) cancelada. Reembolso 50%`;

      newState.notifications = [
        ...(newState.notifications || []),
        { id: uid(), type: 'info', message: msg, timestamp: Date.now() }
      ];
      return newState;
    }

    case 'CANCEL_RESEARCH_QUEUE': {
      const { queueId } = action;
      const targetItem = state.researchQueue.find(q => q.id === queueId);
      if (!targetItem) return state;

      const sameResearchItems = state.researchQueue.filter(
        q => q.researchId === targetItem.researchId
      );
      const itemsToCancel = sameResearchItems.filter(q => q.level >= targetItem.level);
      const idsToCancel = new Set(itemsToCancel.map(q => q.id));

      const r = RESEARCH[targetItem.researchId];
      const targetPlanetId = targetItem.planetId || state.currentPlanetId;
      const rPl = state.planets.find(p => p.id === targetPlanetId);

      let totalRefund = { metal: 0, crystal: 0, deuterium: 0 };
      for (const it of itemsToCancel) {
        const cost = researchCost(it.researchId, it.level - 1, state.research?.aiStrategy || 0, rPl?.buildings?.constructionCenter || 0);
        totalRefund.metal += Math.floor(cost.metal * 0.5);
        totalRefund.crystal += Math.floor(cost.crystal * 0.5);
        totalRefund.deuterium += Math.floor((cost.deuterium || 0) * 0.5);
      }

      let newState = updatePlanet(state, targetPlanetId, p => ({
        ...p,
        resources: {
          metal: p.resources.metal + totalRefund.metal,
          crystal: p.resources.crystal + totalRefund.crystal,
          deuterium: p.resources.deuterium + totalRefund.deuterium
        }
      }));

      newState.researchQueue = state.researchQueue.filter(q => !idsToCancel.has(q.id));
      const msg = itemsToCancel.length > 1
        ? `🚫 Canceladas ${itemsToCancel.length} investigaciones de ${r?.name || 'tecnología'}. Reembolso 50%`
        : `🚫 Investigación de ${r?.name || 'tecnología'} (Nv. ${targetItem.level}) cancelada. Reembolso 50%`;

      newState.notifications = [
        ...(newState.notifications || []),
        { id: uid(), type: 'info', message: msg, timestamp: Date.now() }
      ];
      return newState;
    }

    case 'CANCEL_SHIP_QUEUE': {
      const { queueId } = action;
      const item = state.shipQueue.find(q => q.id === queueId);
      if (!item) return state;
      const ship = SHIPS[item.shipId];
      if (!ship) {
        // Custom ship
        const bp = state.blueprints.find(b => 'custom_' + b.id === item.shipId);
        if (!bp) return state;
        const cPl = state.planets.find(p => p.id === item.planetId);
        const c = calcCustomShipCost(bp, cPl?.buildings?.constructionCenter || 0);
        const refund = { metal: Math.floor(c.metal * item.quantity * 0.5), crystal: Math.floor(c.crystal * item.quantity * 0.5), deuterium: Math.floor((c.deuterium || 0) * item.quantity * 0.5) };
        let newState = updatePlanet(state, item.planetId, p => ({ ...p, resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium + refund.deuterium } }));
        newState.shipQueue = state.shipQueue.filter(q => q.id !== queueId);
        newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'info', message: `🚫 Construcción de ${bp.name}x${item.quantity} cancelada. Reembolso 50%`, timestamp: Date.now() }];
        return newState;
      }
      const sPl = state.planets.find(p => p.id === item.planetId);
      const refund = { metal: Math.floor(ship.cost.m * item.quantity * 0.5 * constructionDiscount(sPl?.buildings?.constructionCenter || 0)), crystal: Math.floor(ship.cost.c * item.quantity * 0.5 * constructionDiscount(sPl?.buildings?.constructionCenter || 0)), deuterium: Math.floor((ship.cost.d || 0) * item.quantity * 0.5 * constructionDiscount(sPl?.buildings?.constructionCenter || 0)) };
      let newState = updatePlanet(state, item.planetId, p => ({ ...p, resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium + refund.deuterium } }));
      newState.shipQueue = state.shipQueue.filter(q => q.id !== queueId);
      newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'info', message: `🚫 Construcción de ${ship.name}x${item.quantity} cancelada. Reembolso 50%`, timestamp: Date.now() }];
      return newState;
    }

    case 'CANCEL_DEFENSE_QUEUE': {
      const { queueId } = action;
      const item = state.defenseQueue.find(q => q.id === queueId);
      if (!item) return state;
      const d = DEFENSES[item.defenseId];
      if (!d) return state;
      const dPl = state.planets.find(p => p.id === item.planetId);
      const dDisc = constructionDiscount(dPl?.buildings?.constructionCenter || 0);
      const refund = { metal: Math.floor(d.cost.m * item.quantity * 0.5 * dDisc), crystal: Math.floor(d.cost.c * item.quantity * 0.5 * dDisc), deuterium: Math.floor((d.cost.d || 0) * item.quantity * 0.5 * dDisc) };
      let newState = updatePlanet(state, item.planetId, p => ({ ...p, resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium + refund.deuterium } }));
      newState.defenseQueue = state.defenseQueue.filter(q => q.id !== queueId);
      newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'info', message: `🚫 Construcción de ${d.name}x${item.quantity} cancelada. Reembolso 50%`, timestamp: Date.now() }];
      return newState;
    }

    case 'CANCEL_MISSION': {
      const { missionId } = action;
      const mission = state.fleetMissions.find(m => m.id === missionId);
      if (!mission) return state;
      let newState = returnFleetToOrigin(state, mission);
      newState.fleetMissions = state.fleetMissions.filter(m => m.id !== missionId);
      newState.notifications = [...newState.notifications, { id: uid(), type: 'info', message: `🚀 Misión cancelada, flota regresó a ${mission.from.name || 'origen'}`, timestamp: Date.now() }];
      return newState;
    }

    case 'REQUEST_REINFORCEMENTS': {
      const { targetPlanetId } = action;
      const targetPlanet = state.planets.find(p => p.id === targetPlanetId);
      if (!targetPlanet) return state;

      const nearbyAI = state.aiPlanets.filter(p => p.galaxy === targetPlanet.galaxy && p.fleet && Object.values(p.fleet).some(v => v > 5));
      if (nearbyAI.length === 0) {
        return { ...state, notifications: [...state.notifications, { id: uid(), type: 'warning', message: '⚠️ No hay aliados cercanos disponibles', timestamp: Date.now() }] };
      }

      const ally = nearbyAI[Math.floor(Math.random() * nearbyAI.length)];
      const reinforcementFleet = {};
      for (const [id, qty] of Object.entries(ally.fleet)) {
        const sendQty = Math.floor(qty * 0.3);
        if (sendQty > 0) reinforcementFleet[id] = sendQty;
      }
      if (Object.keys(reinforcementFleet).length === 0) {
        return { ...state, notifications: [...state.notifications, { id: uid(), type: 'warning', message: '⚠️ El aliado no tiene naves disponibles', timestamp: Date.now() }] };
      }

      const newAIPlanets = state.aiPlanets.map(p => p.id === ally.id ? {
        ...p,
        fleet: Object.entries(reinforcementFleet).reduce((acc, [id, qty]) => {
          acc[id] = Math.max(0, (acc[id] || 0) - qty);
          if (acc[id] <= 0) delete acc[id];
          return acc;
        }, { ...p.fleet }),
      } : p);

      const dist = calcDistance(ally, targetPlanet);
      const spd = fleetSpeed(reinforcementFleet, ally.research || {}, ally.faction || 'human');
      const flightTime = calcFlightTime(dist, spd, 10);

      let newState = { ...state, aiPlanets: newAIPlanets };
      newState.fleetMissions = [...(newState.fleetMissions || []), {
        id: uid(), type: 'ally_reinforce', from: ally, to: targetPlanet, fleet: reinforcementFleet,
        departure: Date.now(), arrivalTime: Date.now() + flightTime * 1000,
        returnTime: Date.now() + flightTime * 2000,
        isAI: false,
      }];
      newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: `🤝 Aliado envió refuerzos desde [${ally.galaxy}:${ally.system}:${ally.position}]`, timestamp: Date.now() }];
      return newState;
    }

    case 'START_MISSION': {
      const { missionId } = action;
      if (state.activeMissions.includes(missionId) || state.completedMissions.includes(missionId)) return state;
      return { ...state, activeMissions: [...state.activeMissions, missionId] };
    }

    case 'COMPLETE_MISSION': {
      const { missionId } = action;
      if (!state.activeMissions.includes(missionId) || state.completedMissions.includes(missionId)) return state;
      
      const m = MISSIONS.find(m => m.id === missionId);
      if (!m) return state;

      const planet = getCurrentPlanet();
      if (!planet) return state;

      let newState = updatePlanet(state, planet.id, p => ({
        ...p,
        resources: {
          metal: p.resources.metal + (m.reward.metal || 0),
          crystal: p.resources.crystal + (m.reward.crystal || 0),
          deuterium: p.resources.deuterium + (m.reward.deuterium || 0)
        }
      }));

      newState.activeMissions = newState.activeMissions.filter(id => id !== missionId);
      newState.completedMissions = [...newState.completedMissions, missionId];
      
      newState.notifications = [...(newState.notifications || []), {
        id: uid(),
        type: 'success',
        message: `🎯 ¡Misión Cumplida! ${m.icon} ${m.name}. Recompensa: ${m.rewardDesc}`,
        timestamp: Date.now(),
        isMission: true
      }];
      return newState;
    }

    case 'SCRAP_SHIPS': {
      return handleScrapShips(state, action);
    }

    case 'SCRAP_DEFENSES': {
      return handleScrapDefenses(state, action);
    }

    case 'COLONIZE': {
      return handleColonize(state, action);
    }

    case 'SAVE_FLEET_PRESET': {
      return handleSaveFleetPreset(state, action);
    }

    case 'DELETE_FLEET_PRESET': {
      return handleDeleteFleetPreset(state, action);
    }

    case 'ADD_TRADE_ROUTE': {
      return handleAddTradeRoute(state, action);
    }

    case 'REMOVE_TRADE_ROUTE': {
      return handleRemoveTradeRoute(state, action);
    }

    case 'TOGGLE_TRADE_ROUTE': {
      return handleToggleTradeRoute(state, action);
    }

    case 'PROCESS_TRADE_ROUTES': {
      return handleProcessTradeRoutes(state, action);
    }

    default:
      return state;
  }
};
