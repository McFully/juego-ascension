import { uid, updatePlanet, shipCost, defenseCost, canAfford, deduct, meetsResearchReq, calcShipTime, calcDefenseTime, shipTimeBonus } from '../../core.jsx';
import { SHIPS, DEFENSES, GAME_SPEED } from '../../data/gameData.js';
import { extractShipTechSnapshot, extractDefenseTechSnapshot, calculateTechGeneration } from '../../utils/formulas/retrofitFormulas.js';
import { stampTimeMult } from '../tick/queues/queueTiming.js';

export const handleStartShip = (state, action) => {
  const { shipId, quantity, planetId } = action;
  const planet = (planetId ? state.planets.find(p => p.id === planetId) : null) || state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!planet || !planet.buildings.shipyard) return state;
  const s = SHIPS[shipId];
  if (!meetsResearchReq(s?.req, { ...planet.buildings, ...state.research })) return state;
  const cost = shipCost(shipId, quantity, planet.buildings?.constructionCenter || 0);
  if (!canAfford(planet.resources, cost)) return state;
  if (state.shipQueue.length >= 5) return state;

  const mins = planet.ministries || state.ministries || {};
  let bonus = shipTimeBonus(planet.buildings);
  if (planet.specialization === 'military') bonus *= 1.20;

  const existingIdx = state.shipQueue.findIndex(item => item.shipId === shipId && item.planetId === planet.id);
  if (existingIdx >= 0) {
    const existing = state.shipQueue[existingIdx];
    const newQty = existing.quantity + quantity;
    const time = calcShipTime(shipId, newQty, planet.buildings.shipyard, planet.buildings.naniteFactory || 0, GAME_SPEED, bonus, mins);
    const newEndTime = existing.startTime + time * 1000;
    let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: deduct(p.resources, cost) }));
    const newQueue = [...state.shipQueue];
    newQueue[existingIdx] = stampTimeMult(newState, 'ship', { ...existing, quantity: newQty, endTime: newEndTime });
    newState.shipQueue = newQueue;
    return newState;
  }

  const newRes = deduct(planet.resources, cost);
  const time = calcShipTime(shipId, quantity, planet.buildings.shipyard, planet.buildings.naniteFactory || 0, GAME_SPEED, bonus, mins);
  const endTime = Date.now() + time * 1000;

  const techSnapshot = extractShipTechSnapshot(state.research || {});
  const techGen = calculateTechGeneration(techSnapshot);

  let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: newRes }));
  newState.shipQueue = [...state.shipQueue, stampTimeMult(newState, 'ship', {
    id: uid(), planetId: planet.id, shipId, quantity, startTime: Date.now(), endTime,
    techSnapshot, techGen
  })];
  return newState;
};

export const handleStartDefense = (state, action) => {
  const { defenseId, quantity, planetId } = action;
  const planet = (planetId ? state.planets.find(p => p.id === planetId) : null) || state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  const hasShipyardFacility = Boolean(planet?.buildings?.shipyard || (planet?.isExchangePlanet && (planet?.buildings?.exchangeBastion || planet?.buildings?.exchangeDocks)));
  if (!planet || !hasShipyardFacility) return state;
  const d = DEFENSES[defenseId];
  if (!meetsResearchReq(d?.req, { ...planet.buildings, ...state.research })) return state;
  if (d?.max && (planet.defenses[defenseId] || 0) >= d.max) return state;
  const cost = defenseCost(defenseId, quantity, planet.buildings?.constructionCenter || 0);
  if (!canAfford(planet.resources, cost)) return state;
  if (state.defenseQueue.length >= 5) return state;

  const mins = planet.ministries || state.ministries || {};
  let bonus = shipTimeBonus(planet.buildings);
  if (planet.specialization === 'military') bonus *= 1.20;

  const existingIdx = state.defenseQueue.findIndex(item => item.defenseId === defenseId && item.planetId === planet.id);
  if (existingIdx >= 0) {
    const existing = state.defenseQueue[existingIdx];
    const newQty = existing.quantity + quantity;
    const time = calcDefenseTime(defenseId, newQty, planet.buildings.shipyard, planet.buildings.naniteFactory || 0, GAME_SPEED, bonus, mins);
    const newEndTime = existing.startTime + time * 1000;
    let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: deduct(p.resources, cost) }));
    const newQueue = [...state.defenseQueue];
    newQueue[existingIdx] = stampTimeMult(newState, 'defense', { ...existing, quantity: newQty, endTime: newEndTime });
    newState.defenseQueue = newQueue;
    return newState;
  }

  const newRes = deduct(planet.resources, cost);
  const time = calcDefenseTime(defenseId, quantity, planet.buildings.shipyard, planet.buildings.naniteFactory || 0, GAME_SPEED, bonus, mins);
  const endTime = Date.now() + time * 1000;

  const techSnapshot = extractDefenseTechSnapshot(state.research || {});
  const techGen = calculateTechGeneration(techSnapshot);

  let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: newRes }));
  newState.defenseQueue = [...state.defenseQueue, stampTimeMult(newState, 'defense', {
    id: uid(), planetId: planet.id, defenseId, quantity, startTime: Date.now(), endTime,
    techSnapshot, techGen
  })];
  return newState;
};
