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


export const fleetReducer = (state, action) => {
  const getCurrentPlanet = () => state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  let newState = { ...state };
  switch (action.type) {
    case 'START_SHIP': {
      const { shipId, quantity } = action;
      const planet = getCurrentPlanet();
      if (!planet || !planet.buildings.shipyard) return state;
      const s = SHIPS[shipId];
      if (!meetsReq(s.req, { ...planet.buildings, ...state.research })) return state;
      const cost = shipCost(shipId, quantity, planet.buildings?.constructionCenter || 0);
      if (!canAfford(planet.resources, cost)) return state;
      if (state.shipQueue.length >= 5) return state;

      let bonus = shipTimeBonus(planet.buildings);
      if (planet.specialization === 'military') bonus *= 1.20;

      const existingIdx = state.shipQueue.findIndex(item => item.shipId === shipId && item.planetId === planet.id);
      if (existingIdx >= 0) {
        const existing = state.shipQueue[existingIdx];
        const newQty = existing.quantity + quantity;
        const time = calcShipTime(shipId, newQty, planet.buildings.shipyard, planet.buildings.naniteFactory || 0, GAME_SPEED, bonus);
        const newEndTime = existing.startTime + time * 1000;
        let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: deduct(p.resources, cost) }));
        const newQueue = [...state.shipQueue];
        newQueue[existingIdx] = { ...existing, quantity: newQty, endTime: newEndTime };
        newState.shipQueue = newQueue;
        return newState;
      }

      const newRes = deduct(planet.resources, cost);
      const time = calcShipTime(shipId, quantity, planet.buildings.shipyard, planet.buildings.naniteFactory || 0, GAME_SPEED, bonus);
      const endTime = Date.now() + time * 1000;

      let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: newRes }));
      newState.shipQueue = [...state.shipQueue, {
        id: uid(), planetId: planet.id, shipId, quantity, startTime: Date.now(), endTime,
      }];
      return newState;
    }

    case 'START_DEFENSE': {
      const { defenseId, quantity } = action;
      const planet = getCurrentPlanet();
      if (!planet || !planet.buildings.shipyard) return state;
      const d = DEFENSES[defenseId];
      if (!meetsReq(d.req, state.research)) return state;
      if (d.max && (planet.defenses[defenseId] || 0) >= d.max) return state;
      const cost = defenseCost(defenseId, quantity, planet.buildings?.constructionCenter || 0);
      if (!canAfford(planet.resources, cost)) return state;
      if (state.defenseQueue.length >= 5) return state;

      let bonus = shipTimeBonus(planet.buildings);
      if (planet.specialization === 'military') bonus *= 1.20;

      const existingIdx = state.defenseQueue.findIndex(item => item.defenseId === defenseId && item.planetId === planet.id);
      if (existingIdx >= 0) {
        const existing = state.defenseQueue[existingIdx];
        const newQty = existing.quantity + quantity;
        const time = calcDefenseTime(defenseId, newQty, planet.buildings.shipyard, planet.buildings.naniteFactory || 0, GAME_SPEED, bonus);
        const newEndTime = existing.startTime + time * 1000;
        let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: deduct(p.resources, cost) }));
        const newQueue = [...state.defenseQueue];
        newQueue[existingIdx] = { ...existing, quantity: newQty, endTime: newEndTime };
        newState.defenseQueue = newQueue;
        return newState;
      }

      const newRes = deduct(planet.resources, cost);
      const time = calcDefenseTime(defenseId, quantity, planet.buildings.shipyard, planet.buildings.naniteFactory || 0, GAME_SPEED, bonus);
      const endTime = Date.now() + time * 1000;

      let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: newRes }));
      newState.defenseQueue = [...state.defenseQueue, {
        id: uid(), planetId: planet.id, defenseId, quantity, startTime: Date.now(), endTime,
      }];
      return newState;
    }

    case 'SEND_FLEET': {
      const { fromId, to, fleet, missionType, missionSpeed = 10, resources = null, autoRetreat = false, formation = 'standard' } = action;
      const from = state.planets.find(p => p.id === fromId);
      if (!from) return state;
      // Validate ships exist
      for (const [id, qty] of Object.entries(fleet)) {
        if (qty < 0 || (from.fleet[id] || 0) < qty) return state;
      }
      // Deduct ships
      const newFleet = { ...from.fleet };
      for (const [id, qty] of Object.entries(fleet)) {
        newFleet[id] = (newFleet[id] || 0) - qty;
        if (newFleet[id] <= 0) delete newFleet[id];
      }
      // Deduct resources if transport
      let newResources = { ...from.resources };
      if (resources) {
        if ((resources.metal || 0) < 0 || (resources.crystal || 0) < 0 || (resources.deuterium || 0) < 0) return state;
        if (!canAfford(newResources, resources)) return state;
        newResources = deduct(newResources, resources);
      }
      // Calculate fuel
      const dist = calcDistance(from, to);
      const destPoi = getPOIAtCoordinates(to.galaxy, to.system, to.position);
      const isWormhole = destPoi && destPoi.type === 'wormhole';

      const playerFaction = from.faction || 'human';
      let spd = fleetSpeed(fleet, state.research, playerFaction, state.relics || []);
      if (spd === 0) return state;
      if (formation === 'vanguard') spd *= 1.20;
      else if (formation === 'artillery') spd *= 0.85;
      else if (formation === 'escort') spd *= 1.05;
      else if (formation === 'raider') spd *= 1.10;

      const driveLevel = Math.max(
        state.research.combustion || 0,
        state.research.impulse || 0,
        state.research.hyperspace || 0
      );
      let totalFuel = 0;
      for (const [id, qty] of Object.entries(fleet)) {
        totalFuel += calcFuel(dist, id, qty, driveLevel);
      }
      if (isWormhole) {
        totalFuel = Math.max(1, Math.floor(totalFuel * 0.5));
      }
      if (newResources.deuterium < totalFuel) return state;
      newResources.deuterium -= totalFuel;

      let flightTime = calcFlightTime(dist, spd, missionSpeed);
      if (isWormhole) {
        flightTime = Math.max(10, Math.round(flightTime * 0.5));
      }
      const arrivalTime = Date.now() + flightTime * 1000;
      const returnTime = arrivalTime + flightTime * 1000;

      let newState = updatePlanet(state, fromId, p => ({ ...p, fleet: newFleet, resources: newResources }));
      newState.fleetMissions = [...state.fleetMissions, {
        id: uid(), type: missionType, from, to, fleet, resources, fuel: totalFuel,
        departure: Date.now(), arrivalTime, returnTime, isAI: false, autoRetreat, formation,
      }];
      newState.notifications = [...newState.notifications, {
        id: uid(), type: 'info', message: `🚀 Flota enviada a [${to.galaxy}:${to.system}:${to.position}]${isWormhole ? ' a través de Agujero de Gusano' : ''}`, timestamp: Date.now(),
      }];
      return newState;
    }

    case 'ABANDON_PLANET': {
      const { planetId } = action;
      const planet = state.planets.find(p => p.id === planetId);
      if (!planet || planet.isHome) return { ...state, notifications: [...state.notifications, { id: uid(), type: 'warning', message: '🚫 No puedes abandonar el planeta natal', timestamp: Date.now() }] };
      const homePlanet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
      if (homePlanet) {
        let newState = updatePlanet(state, homePlanet.id, p => {
          const mergedFleet = { ...p.fleet };
          for (const [id, qty] of Object.entries(planet.fleet || {})) {
            mergedFleet[id] = (mergedFleet[id] || 0) + qty;
          }
          const mergedDefenses = { ...p.defenses };
          for (const [id, qty] of Object.entries(planet.defenses || {})) {
            mergedDefenses[id] = (mergedDefenses[id] || 0) + qty;
          }
          return { ...p, fleet: mergedFleet, defenses: mergedDefenses };
        });
        newState.planets = newState.planets.filter(p => p.id !== planetId);
        newState.currentPlanetId = homePlanet.id;
        newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'info', message: `🏚️ Planeta ${planet.name} abandonado. Flota y defensas transferidas a ${homePlanet.name}`, timestamp: Date.now() }];
        return newState;
      }
      let newState = { ...state };
      newState.planets = state.planets.filter(p => p.id !== planetId);
      newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'info', message: `🏚️ Planeta ${planet.name} abandonado.`, timestamp: Date.now() }];
      return newState;
    }

    case 'RETROFIT_FLEET': {
      const planet = getCurrentPlanet();
      if (!planet) return state;
      const totalShips = Object.values(planet.fleet).reduce((a, b) => a + b, 0);
      if (totalShips === 0) return state;
      if (state.retrofitQueue.length >= 3) return state;

      // Calculate cost: 15% of build cost per ship
      let metalCost = 0, crystalCost = 0, deutCost = 0;
      for (const [id, qty] of Object.entries(planet.fleet)) {
        if (id.startsWith('custom_')) {
          const bp = state.blueprints.find(b => id === 'custom_' + b.id);
          if (bp) { const c = calcCustomShipCost(bp); metalCost += c.metal * qty * 0.15; crystalCost += c.crystal * qty * 0.15; deutCost += c.deuterium * qty * 0.15; }
        } else if (SHIPS[id]) {
          metalCost += SHIPS[id].cost.m * qty * 0.15;
          crystalCost += SHIPS[id].cost.c * qty * 0.15;
          deutCost += (SHIPS[id].cost.d || 0) * qty * 0.15;
        }
      }
      const cost = { metal: Math.floor(metalCost), crystal: Math.floor(crystalCost), deuterium: Math.floor(deutCost) };
      if (!canAfford(planet.resources, cost)) return state;

      // Time: ~2 seconds per ship at game speed
      const time = Math.max(10, Math.floor(totalShips * 2 * 3600 / GAME_SPEED));

      let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: deduct(p.resources, cost) }));
      newState.retrofitQueue = [...state.retrofitQueue, {
        id: uid(), planetId: planet.id, type: 'fleet', startTime: Date.now(), endTime: Date.now() + time * 1000,
        fleetSnapshot: { ...planet.fleet },
      }];

      // Mark fleet as in-retrofit (hide from combat)
      newState = updatePlanet(newState, planet.id, p => ({ ...p, fleet: {} }));
      return newState;
    }

    case 'RETROFIT_DEFENSES': {
      const planet = getCurrentPlanet();
      if (!planet) return state;
      const totalDefs = Object.values(planet.defenses).reduce((a, b) => a + b, 0);
      if (totalDefs === 0) return state;
      if (state.retrofitQueue.length >= 3) return state;

      let metalCost = 0, crystalCost = 0, deutCost = 0;
      for (const [id, qty] of Object.entries(planet.defenses)) {
        if (DEFENSES[id]) {
          metalCost += DEFENSES[id].cost.m * qty * 0.15;
          crystalCost += DEFENSES[id].cost.c * qty * 0.15;
          deutCost += (DEFENSES[id].cost.d || 0) * qty * 0.15;
        }
      }
      const cost = { metal: Math.floor(metalCost), crystal: Math.floor(crystalCost), deuterium: Math.floor(deutCost) };
      if (!canAfford(planet.resources, cost)) return state;

      const time = Math.max(10, Math.floor(totalDefs * 1.5 * 3600 / GAME_SPEED));

      let newState = updatePlanet(state, planet.id, p => ({ ...p, resources: deduct(p.resources, cost) }));
      newState.retrofitQueue = [...state.retrofitQueue, {
        id: uid(), planetId: planet.id, type: 'defense', startTime: Date.now(), endTime: Date.now() + time * 1000,
        defenseSnapshot: { ...planet.defenses },
      }];

      newState = updatePlanet(newState, planet.id, p => ({ ...p, defenses: {} }));
      return newState;
    }

    case 'BUILD_MOON_BUILDING': {
      const { buildingId } = action;
      const planet = getCurrentPlanet();
      if (!planet || !planet.moon) return state;
      const b = MOON_BUILDINGS[buildingId];
      if (!b) return state;
      const lvl = planet.moon.buildings[buildingId] || 0;
      const mDisc = constructionDiscount(planet.buildings?.constructionCenter || 0);
      const cost = { metal: Math.floor(b.cost.m * Math.pow(b.factor, lvl) * mDisc), crystal: Math.floor(b.cost.c * Math.pow(b.factor, lvl) * mDisc), deuterium: Math.floor((b.cost.d || 0) * Math.pow(b.factor, lvl) * mDisc) };
      if (!canAfford(planet.resources, cost)) return state;
      if (!meetsReq(b.req, planet.moon.buildings)) return state;
      if (b.max && lvl >= b.max) return state;
      
      const newRes = deduct(planet.resources, cost);
      let newState = updatePlanet(state, planet.id, p => ({
        ...p, resources: newRes,
        moon: { ...p.moon, buildings: { ...(p.moon?.buildings || {}), [buildingId]: lvl + 1 } },
      }));
      return newState;
    }

    case 'JUMP_GATE_TRANSFER': {
      const { fromPlanetId, toPlanetId, fleet } = action;
      const fromPlanet = state.planets.find(p => p.id === fromPlanetId);
      const toPlanet = state.planets.find(p => p.id === toPlanetId);
      if (!fromPlanet?.moon?.buildings?.jumpGate || !toPlanet?.moon?.buildings?.jumpGate) {
        return {
          ...state,
          notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: '🌀 Ambos planetas deben poseer una Puerta de Salto activa en la luna.', timestamp: Date.now() }]
        };
      }
      if (!fleet || Object.keys(fleet).length === 0) return state;
      for (const [id, qty] of Object.entries(fleet)) {
        if ((fromPlanet.fleet[id] || 0) < qty) {
          return {
            ...state,
            notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: '⚠️ No tienes suficientes naves para realizar el salto.', timestamp: Date.now() }]
          };
        }
      }
      let newState = updatePlanet(state, fromPlanetId, p => ({
        ...p,
        fleet: Object.entries(fleet).reduce((acc, [id, qty]) => {
          const remaining = (acc[id] || 0) - qty;
          if (remaining <= 0) delete acc[id]; else acc[id] = remaining;
          return acc;
        }, { ...p.fleet }),
      }));
      newState = updatePlanet(newState, toPlanetId, p => ({
        ...p,
        fleet: Object.entries(fleet).reduce((acc, [id, qty]) => {
          acc[id] = (acc[id] || 0) + qty;
          return acc;
        }, { ...p.fleet }),
      }));
      newState.notifications = [...newState.notifications, { id: uid(), type: 'info', message: `🌀 Salto completado de ${fromPlanet.name} a ${toPlanet.name}`, timestamp: Date.now() }];
      return newState;
    }

    case 'BUILD_MISSILE': {
      const { missileId, quantity } = action;
      const planet = getCurrentPlanet();
      if (!planet) return state;
      const siloLevel = planet.buildings.missileSilo || 0;
      if (siloLevel < 1) return state;
      const m = MISSILES[missileId];
      if (!m) return state;
      const maxMissiles = siloLevel * 10;
      const currentTotalUsed = Object.values(planet.missiles || {}).reduce((a, b) => a + b, 0);
      const spaceAvailable = Math.max(0, maxMissiles - currentTotalUsed);
      if (spaceAvailable <= 0) {
        return {
          ...state,
          notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: '🎯 Silo de Misiles al máximo de capacidad.', timestamp: Date.now() }]
        };
      }
      const actualQty = Math.min(quantity, spaceAvailable);
      const missileDisc = constructionDiscount(planet.buildings?.constructionCenter || 0);
      const cost = { metal: m.cost.m * actualQty * missileDisc, crystal: m.cost.c * actualQty * missileDisc, deuterium: (m.cost.d || 0) * actualQty * missileDisc };
      if (!canAfford(planet.resources, cost)) return state;

      const newRes = deduct(planet.resources, cost);
      let newState = updatePlanet(state, planet.id, p => ({
        ...p, resources: newRes,
        missiles: { ...(p.missiles || {}), [missileId]: ((p.missiles || {})[missileId] || 0) + actualQty },
      }));
      newState.notifications = [...newState.notifications, { id: uid(), type: 'success', message: `☄️ ${actualQty}x ${m.name} construidos`, timestamp: Date.now() }];
      return newState;
    }

    case 'LAUNCH_MISSILE': {
      const { targetGalaxy, targetSystem, targetPosition, quantity } = action;
      const planet = getCurrentPlanet();
      if (!planet) return state;
      const have = (planet.missiles || {}).interplanetaryMissile || 0;
      if (have < quantity) return state;

      // Find target
      const target = state.aiPlanets.find(p => p.galaxy === targetGalaxy && p.system === targetSystem && p.position === targetPosition);
      if (!target) return state;

      // Auto-ABM: target may fire ABMs
      let missilesHit = quantity;
      const targetABMs = (target.missiles || {}).antiBallisticMissile || 0;
      if (targetABMs > 0) {
        const abmDestroy = Math.min(targetABMs, Math.ceil(quantity * 0.7 + Math.random() * 0.3 * quantity));
        missilesHit = Math.max(0, quantity - abmDestroy);
        let newAIPlanets = state.aiPlanets.map(p => {
          if (p.id === target.id) {
            const miss = { ...(p.missiles || {}) };
            miss.antiBallisticMissile = Math.max(0, (miss.antiBallisticMissile || 0) - abmDestroy);
            if (miss.antiBallisticMissile <= 0) delete miss.antiBallisticMissile;
            return { ...p, missiles: miss };
          }
          return p;
        });
        let newState1 = { ...state, aiPlanets: newAIPlanets };
        if (missilesHit <= 0) {
          newState1 = updatePlanet(newState1, planet.id, p => ({
            ...p, missiles: { ...p.missiles, interplanetaryMissile: Math.max(0, (p.missiles?.interplanetaryMissile || 0) - quantity) }
          }));
          newState1.notifications = [...(newState1.notifications || []), { id: uid(), type: 'warning', message: `🛡️ Misiles antibalísticos destruyeron todos tus misiles`, timestamp: Date.now() }];
          return newState1;
        }
      }

      // Apply missile damage to target
      const dmgPerMissile = MISSILES.interplanetaryMissile.atk;
      const totalDmg = dmgPerMissile * missilesHit;
      let newAIPlanets2 = state.aiPlanets.map(p => {
        if (p.id === target.id) {
          // Damage defenses first, then buildings
          let remainingDmg = totalDmg;
          const newDefenses = { ...(p.defenses || {}) };
          const defOrder = ['smallShieldDome', 'largeShieldDome', 'plasmaTurret', 'gaussCannon', 'ionCannon', 'heavyLaser', 'lightLaser', 'rocketLauncher'];
          for (const defId of defOrder) {
            if (remainingDmg <= 0) break;
            const qty = newDefenses[defId] || 0;
            if (qty > 0) {
              const defHull = (DEFENSES[defId]?.hull || 100);
              const destroyed = Math.min(qty, Math.ceil(remainingDmg / defHull));
              newDefenses[defId] = qty - destroyed;
              if (newDefenses[defId] <= 0) delete newDefenses[defId];
              remainingDmg -= destroyed * defHull;
            }
          }
          // Damage random buildings
          const newBuildings = { ...(p.buildings || {}) };
          const bldIds = Object.keys(newBuildings).filter(k => newBuildings[k] > 0);
          while (remainingDmg > 0 && bldIds.length > 0) {
            const idx = Math.floor(Math.random() * bldIds.length);
            const bldId = bldIds[idx];
            const lvl = newBuildings[bldId];
            const reduction = Math.max(0, Math.min(lvl, Math.ceil(remainingDmg / 5000)));
            newBuildings[bldId] = lvl - reduction;
            if (newBuildings[bldId] <= 0) delete newBuildings[bldId];
            remainingDmg -= reduction * 5000;
            bldIds.splice(idx, 1);
          }
          return { ...p, defenses: newDefenses, buildings: newBuildings };
        }
        return p;
      });

      // Deduct missiles from player
      let newState = { ...state, aiPlanets: newAIPlanets2 };
      newState = updatePlanet(newState, planet.id, p => ({
        ...p, missiles: { ...p.missiles, interplanetaryMissile: Math.max(0, (p.missiles?.interplanetaryMissile || 0) - quantity) }
      }));
      const msg = targetABMs > 0
        ? `☄️ Misil impactó ${target.name}. ${missilesHit}/${quantity} superaron ABMs. Daño: ${fmt(totalDmg)}`
        : `☄️ Misil impactó ${target.name}. Daño: ${fmt(totalDmg)}`;
      newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: msg, timestamp: Date.now() }];
      return newState;
    }

    case 'SAVE_BLUEPRINT': {
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
    }

    case 'DELETE_BLUEPRINT': {
      return { ...state, blueprints: state.blueprints.filter(b => b.id !== action.id) };
    }

    case 'BUILD_CUSTOM_SHIP': {
      const { blueprintId, quantity } = action;
      const planet = getCurrentPlanet();
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
      newState.customShipQueue = [...state.customShipQueue, {
        id: uid(), planetId: planet.id, blueprintId, quantity, startTime: Date.now(), endTime,
      }];
      return newState;
    }

    case 'CANCEL_CUSTOM_SHIP_QUEUE': {
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
    }

    case 'CANCEL_BUILD_QUEUE': {
      const { queueId } = action;
      const item = state.buildQueue.find(q => q.id === queueId);
      if (!item) return state;
      const b = BUILDINGS[item.buildingId];
      if (!b) return state;
      const bPl = state.planets.find(p => p.id === item.planetId);
      const cost = buildingCost(item.buildingId, item.level - 1, bPl?.buildings?.constructionCenter || 0);
      const refund = { metal: Math.floor(cost.metal * 0.5), crystal: Math.floor(cost.crystal * 0.5), deuterium: Math.floor(cost.deuterium * 0.5) };
      let newState = updatePlanet(state, item.planetId, p => ({ ...p, resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium + refund.deuterium } }));
      newState.buildQueue = state.buildQueue.filter(q => q.id !== queueId);
      newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'info', message: '🚫 Construcción de ' + b.name + ' cancelada. Reembolso 50%', timestamp: Date.now() }];
      return newState;
    }

    case 'CANCEL_RESEARCH_QUEUE': {
      const { queueId } = action;
      const item = state.researchQueue.find(q => q.id === queueId);
      if (!item) return state;
      const r = RESEARCH[item.researchId];
      if (!r) return state;
      const rPl = state.planets.find(p => p.id === (item.planetId || state.currentPlanetId));
      const cost = researchCost(item.researchId, item.level - 1, state.research?.aiStrategy || 0, rPl?.buildings?.constructionCenter || 0);
      const refund = { metal: Math.floor(cost.metal * 0.5), crystal: Math.floor(cost.crystal * 0.5), deuterium: Math.floor(cost.deuterium * 0.5) };
      let newState = updatePlanet(state, item.planetId || state.currentPlanetId, p => ({ ...p, resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium + refund.deuterium } }));
      newState.researchQueue = state.researchQueue.filter(q => q.id !== queueId);
      newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'info', message: '🚫 Investigación de ' + r.name + ' cancelada. Reembolso 50%', timestamp: Date.now() }];
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
      const scrapShipsAction = action;
      const { shipId, quantity, planetId } = scrapShipsAction;
      if (!quantity || quantity <= 0) return state;
      const targetPlanet = state.planets.find(p => p.id === (planetId || state.currentPlanetId));
      if (!targetPlanet) return state;
      const shipCount = targetPlanet.fleet[shipId] || 0;
      if (shipCount < quantity) return state;
      const s = SHIPS[shipId];
      if (!s) return state;
      const refund = { metal: Math.floor(s.cost.m * 0.5 * quantity), crystal: Math.floor(s.cost.c * 0.5 * quantity), deuterium: Math.floor((s.cost.d || 0) * 0.5 * quantity) };
      let newState = updatePlanet(state, targetPlanet.id, p => {
        const newFleet = { ...p.fleet };
        newFleet[shipId] = (newFleet[shipId] || 0) - quantity;
        if (newFleet[shipId] <= 0) delete newFleet[shipId];
        return { ...p, fleet: newFleet, resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium + refund.deuterium } };
      });
      newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'info', message: `♻️ ${quantity}x ${s.name} desguazados. Recuperaste ${fmt(refund.metal)}M, ${fmt(refund.crystal)}C, ${fmt(refund.deuterium)}D`, timestamp: Date.now() }];
      return newState;
    }

    case 'SCRAP_DEFENSES': {
      const { defenseId, quantity, planetId } = action;
      if (!quantity || quantity <= 0) return state;
      const targetPlanet2 = state.planets.find(p => p.id === (planetId || state.currentPlanetId));
      if (!targetPlanet2) return state;
      const defCount = targetPlanet2.defenses[defenseId] || 0;
      if (defCount < quantity) return state;
      const d = DEFENSES[defenseId];
      if (!d) return state;
      const refund = { metal: Math.floor(d.cost.m * 0.4 * quantity), crystal: Math.floor(d.cost.c * 0.4 * quantity), deuterium: Math.floor((d.cost.d || 0) * 0.4 * quantity) };
      let newState = updatePlanet(state, targetPlanet2.id, p => {
        const newD = { ...p.defenses };
        newD[defenseId] = (newD[defenseId] || 0) - quantity;
        if (newD[defenseId] <= 0) delete newD[defenseId];
        return { ...p, defenses: newD, resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium + refund.deuterium } };
      });
      newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'info', message: `♻️ ${quantity}x ${d.name} retirados. Recuperaste ${fmt(refund.metal)}M`, timestamp: Date.now() }];
      return newState;
    }

    case 'COLONIZE': {
      const { to } = action;
      if (!to || !to.galaxy || !to.system || !to.position) return state;
      const occupiedByPlayer = state.planets.some(p => p.galaxy === to.galaxy && p.system === to.system && p.position === to.position);
      if (occupiedByPlayer) {
        return { ...state, notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: `🚫 Coordenadas [${to.galaxy}:${to.system}:${to.position}] ya ocupadas por una colonia tuya.`, timestamp: Date.now() }] };
      }
      const occupiedByAI = state.aiPlanets.some(p => p.galaxy === to.galaxy && p.system === to.system && p.position === to.position);
      if (occupiedByAI) {
        return { ...state, notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: `🚫 Coordenadas [${to.galaxy}:${to.system}:${to.position}] ya ocupadas por otro imperio.`, timestamp: Date.now() }] };
      }
      const originPlanet = getCurrentPlanet();
      if (!originPlanet) return state;
      const colonizerCount = originPlanet.fleet.colonizer || 0;
      if (colonizerCount < 1) return state;
      const colonizerCost = SHIPS.colonizer?.cost || { m: 5000, c: 10000, d: 5000 };
      const refund = { metal: Math.floor(colonizerCost.m * 0.3), crystal: Math.floor(colonizerCost.c * 0.3), deuterium: Math.floor((colonizerCost.d || 0) * 0.3) };
      let newState = updatePlanet(state, originPlanet.id, p => {
        const newFleet = { ...p.fleet };
        newFleet.colonizer = (newFleet.colonizer || 0) - 1;
        if (newFleet.colonizer <= 0) delete newFleet.colonizer;
        return { ...p, fleet: newFleet, resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium + refund.deuterium } };
      });
      const newPlanetId = uid();
      const newPlanet = {
        id: newPlanetId,
        name: `Colonia ${to.galaxy}:${to.system}:${to.position}`,
        galaxy: to.galaxy, system: to.system, position: to.position,
        isHome: false,
        biome: 'temperate',
        planetSize: 100 + Math.floor(Math.random() * 100),
        gravity: Math.ceil(Math.random() * 5),
        trait: null,
        specialization: null,
        faction: originPlanet.faction || 'human',
        population: 100,
        autoTrade: false,
        buildings: { metalMine: 0, crystalMine: 0, deutSynth: 0, solarPlant: 0, fusionReactor: 0, robotFactory: 0, shipyard: 0, researchLab: 0, missileSilo: 0, naniteFactory: 0, terraformer: 0, allianceDepot: 0, moonBase: 0, sensorPhalanx: 0, jumpGate: 0 },
        resources: { metal: 200, crystal: 100, deuterium: 50 },
        fleet: {},
        defenses: {},
        retrofitTech: { weapons: 0, shields: 0, armour: 0, combustion: 0, impulse: 0, hyperspace: 0 },
      };
      newState.planets = [...newState.planets, newPlanet];
      newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: `🚀 Nueva colonia establecida en [${to.galaxy}:${to.system}:${to.position}]`, timestamp: Date.now() }];
      return newState;
    }

    case 'SAVE_FLEET_PRESET': {
      const { name, fleet } = action;
      if (!name || !fleet || Object.keys(fleet).length === 0) return state;
      const presets = [...state.fleetPresets];
      const existing = presets.findIndex(p => p.name === name);
      if (existing >= 0) presets[existing] = { name, fleet: { ...fleet } };
      else presets.push({ name, fleet: { ...fleet } });
      return { ...state, fleetPresets: presets.slice(-10) };
    }

    case 'DELETE_FLEET_PRESET': {
      const { name } = action;
      return { ...state, fleetPresets: state.fleetPresets.filter(p => p.name !== name) };
    }

    case 'ADD_TRADE_ROUTE': {
      const { fromId, toGalaxy, toSystem, toPosition, resource, ratio } = action;
      const from = state.planets.find(p => p.id === fromId);
      if (!from) return state;
      const routes = state.tradeRoutes || [];
      if (routes.length >= 5) return state;
      const newRoute = {
        id: uid(),
        fromId,
        toGalaxy, toSystem, toPosition,
        resource: resource || 'metal',
        ratio: ratio || 0.5,
        active: true,
        lastProcessed: Date.now()
      };
      return { ...state, tradeRoutes: [...routes, newRoute] };
    }

    case 'REMOVE_TRADE_ROUTE': {
      const { routeId } = action;
      return { ...state, tradeRoutes: (state.tradeRoutes || []).filter(r => r.id !== routeId) };
    }

    case 'TOGGLE_TRADE_ROUTE': {
      const { routeId } = action;
      return {
        ...state,
        tradeRoutes: (state.tradeRoutes || []).map(r =>
          r.id === routeId ? { ...r, active: !r.active } : r
        )
      };
    }

    case 'PROCESS_TRADE_ROUTES': {
      const routes = state.tradeRoutes || [];
      if (routes.length === 0) return state;
      let newState = { ...state };
      for (const route of routes) {
        if (!route.active) continue;
        const from = newState.planets.find(p => p.id === route.fromId);
        if (!from) continue;
        const storage = from.resources[route.resource] || 0;
        const maxStorage = calcStorage(from.buildings);
        const maxCap = maxStorage[route.resource] || 0;
        const threshold = maxCap * (route.ratio || 0.5);
        if (storage > threshold) {
          const surplus = storage - threshold;
          const toSend = Math.min(surplus, Math.floor(surplus * 0.5));
          if (toSend < 100) continue;
          // Find home planet or first planet as destination
          const to = newState.planets.find(p => p.id !== route.fromId && p.isHome) ||
                     newState.planets.find(p => p.id !== route.fromId);
          if (!to) continue;
          newState = updatePlanet(newState, route.fromId, p => ({
            ...p,
            resources: { ...p.resources, [route.resource]: (p.resources[route.resource] || 0) - toSend }
          }));
          newState = updatePlanet(newState, to.id, p => ({
            ...p,
            resources: { ...p.resources, [route.resource]: (p.resources[route.resource] || 0) + toSend }
          }));
        }
      }
      return newState;
    }

    default:
      return state;
  }
};
