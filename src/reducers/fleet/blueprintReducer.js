import {
  updatePlanet, uid, canAfford, deduct,
  shipTimeBonus, calcCustomShipCost, calcCustomShipTime
} from '../../core.jsx';
import { GAME_SPEED } from '../../data/gameData.js';
import { stampTimeMult } from '../tick/queues/queueTiming.js';

export const handleSaveBlueprint = (state, action) => {
  if (!action.blueprint) return state;
  const { blueprint } = action;
  if (!blueprint.name || !blueprint.chassis) return state;
  if (state.blueprints.length >= 20) return state;
  const existing = state.blueprints.findIndex(b => b.name === blueprint.name);
  let newBlueprints;
  if (existing >= 0) {
    newBlueprints = [...state.blueprints];
    newBlueprints[existing] = { ...blueprint, id: state.blueprints[existing].id };
  } else {
    newBlueprints = [...state.blueprints, { ...blueprint, id: uid() }];
  }
  return { ...state, blueprints: newBlueprints };
};

export const handleDeleteBlueprint = (state, action) => {
  return { ...state, blueprints: state.blueprints.filter(b => b.id !== action.id) };
};

export const handleBuildCustomShip = (state, action) => {
  const { blueprintId, quantity, planetId } = action;
  const planet = (planetId ? state.planets.find(p => p.id === planetId) : null) || state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!planet || !planet.buildings.customShipyard) return state;
  const blueprint = state.blueprints.find(b => b.id === blueprintId);
  if (!blueprint) return state;
  const cost = calcCustomShipCost(blueprint, planet.buildings?.constructionCenter || 0);
  const totalCost = { metal: cost.metal * quantity, crystal: cost.crystal * quantity, deuterium: cost.deuterium * quantity };
  if (!canAfford(planet.resources, totalCost)) return state;
  if (state.customShipQueue.length >= 5) return state;

  const bonus = shipTimeBonus(planet.buildings);
  const time = calcCustomShipTime(blueprint, planet.buildings.shipyard, planet.buildings.naniteFactory || 0, GAME_SPEED, bonus) * quantity;
  const endTime = Date.now() + time * 1000;

  let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: deduct(p.resources, totalCost) }));
  newState.customShipQueue = [...state.customShipQueue, stampTimeMult(newState, 'customShip', {
    id: uid(), planetId: planet.id, blueprintId, quantity, startTime: Date.now(), endTime,
  })];
  return newState;
};

export const handleCancelCustomShipQueue = (state, action) => {
  const { queueId } = action;
  const item = state.customShipQueue.find(q => q.id === queueId);
  if (!item) return state;
  const bp = state.blueprints.find(b => b.id === item.blueprintId);
  if (!bp) return state;
  const pl = state.planets.find(p => p.id === item.planetId);
  const c = calcCustomShipCost(bp, pl?.buildings?.constructionCenter || 0);
  const refund = { metal: Math.floor(c.metal * item.quantity * 0.5), crystal: Math.floor(c.crystal * item.quantity * 0.5), deuterium: Math.floor((c.deuterium || 0) * item.quantity * 0.5) };
  let newState = updatePlanet(state, item.planetId, p => ({ ...p, resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium + refund.deuterium } }));
  newState.customShipQueue = state.customShipQueue.filter(q => q.id !== queueId);
  newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'info', message: `🚫 Fabricación de ${bp.name}x${item.quantity} cancelada. Reembolso 50%`, timestamp: Date.now() }];
  return newState;
};
