import {
  calcStorage, calcDistance, calcFlightTime, fleetSpeed, uid, fmt
} from '../../../core.jsx';
import { dispatchTradeRouteMission } from '../../fleet/tradeRouteReducer.js';

export const processAutoTradeRoutesTick = (state) => {
  let newState = { ...state };
  if (newState.gameTick <= 0) return newState;

  const capital = newState.planets.find(pl => pl.isHome);
  if (!capital) return newState;

  newState.planets = newState.planets.map(colony => {
    if (colony.isHome || !colony.autoTrade) return colony;

    const storage = calcStorage(colony.buildings);
    const excess = {
      metal: Math.max(0, colony.resources.metal - storage.metal * 0.75),
      crystal: Math.max(0, colony.resources.crystal - storage.crystal * 0.75),
      deuterium: Math.max(0, colony.resources.deuterium - storage.deuterium * 0.75),
    };
    const totalExcess = excess.metal + excess.crystal + excess.deuterium;
    if (totalExcess <= 5000) return colony;

    const smallCargos = colony.fleet?.smallCargo || 0;
    const largeCargos = colony.fleet?.largeCargo || 0;
    if (smallCargos === 0 && largeCargos === 0) return colony;

    const isCommercial = colony.specialization === 'commercial';
    const cargoMult = isCommercial ? 1.5 : 1.0;
    
    const smallCap = 5000 * cargoMult;
    const largeCap = 25000 * cargoMult;
    
    let metalToSend = 0;
    let crystalToSend = 0;
    let deutToSend = 0;
    let smallUsed = 0;
    let largeUsed = 0;

    let totalCapAvailable = largeCargos * largeCap + smallCargos * smallCap;
    if (totalCapAvailable === 0) return colony;

    let carryAmount = Math.min(totalExcess, totalCapAvailable);
    const ratio = carryAmount / totalExcess;
    metalToSend = Math.floor(excess.metal * ratio);
    crystalToSend = Math.floor(excess.crystal * ratio);
    deutToSend = Math.floor(excess.deuterium * ratio);

    let remainingCargoNeeded = carryAmount;
    const largeNeeded = Math.min(largeCargos, Math.ceil(remainingCargoNeeded / largeCap));
    largeUsed = largeNeeded;
    remainingCargoNeeded -= largeUsed * largeCap;

    if (remainingCargoNeeded > 0) {
      const smallNeeded = Math.min(smallCargos, Math.ceil(remainingCargoNeeded / smallCap));
      smallUsed = smallNeeded;
    }

    const dispatchedFleet = {};
    if (largeUsed > 0) dispatchedFleet.largeCargo = largeUsed;
    if (smallUsed > 0) dispatchedFleet.smallCargo = smallUsed;

    const updatedColony = {
      ...colony,
      resources: {
        metal: Math.max(0, colony.resources.metal - metalToSend),
        crystal: Math.max(0, colony.resources.crystal - crystalToSend),
        deuterium: Math.max(0, colony.resources.deuterium - deutToSend),
      },
      fleet: {
        ...colony.fleet,
        smallCargo: Math.max(0, (colony.fleet.smallCargo || 0) - smallUsed),
        largeCargo: Math.max(0, (colony.fleet.largeCargo || 0) - largeUsed),
      }
    };
    if (updatedColony.fleet.smallCargo === 0) delete updatedColony.fleet.smallCargo;
    if (updatedColony.fleet.largeCargo === 0) delete updatedColony.fleet.largeCargo;

    const dist = calcDistance(colony, capital);
    const playerFaction = colony.faction || 'human';
    const spd = fleetSpeed(dispatchedFleet, newState.research, playerFaction);
    const flightTime = calcFlightTime(dist, spd, 10, newState.research);
    const arrivalTime = Date.now() + flightTime * 1000;
    const returnTime = arrivalTime + flightTime * 1000;

    newState.fleetMissions = [...(newState.fleetMissions || []), {
      id: uid(),
      type: 'transport',
      from: { id: colony.id, name: colony.name, galaxy: colony.galaxy, system: colony.system, position: colony.position, specialization: colony.specialization },
      to: { id: capital.id, name: capital.name, galaxy: capital.galaxy, system: capital.system, position: capital.position },
      fleet: dispatchedFleet,
      resources: { metal: metalToSend, crystal: crystalToSend, deuterium: deutToSend },
      fuel: 0,
      departure: Date.now(),
      arrivalTime,
      returnTime,
      isAI: false,
      autoRoute: true
    }];

    newState.notifications = [...(newState.notifications || []), {
      id: uid(),
      type: 'info',
      message: `🚚 Auto-Ruta: Despegó convoy desde ${colony.name} hacia capital llevando ${fmt(metalToSend)}M, ${fmt(crystalToSend)}C, ${fmt(deutToSend)}D`,
      timestamp: Date.now()
    }];
    return updatedColony;
  });

  // Procesar periódicamente las rutas programadas configuradas por el usuario en state.tradeRoutes
  const activeProgrammedRoutes = (newState.tradeRoutes || []).filter(r => r.active);
  if (activeProgrammedRoutes.length > 0) {
    const now = Date.now();
    for (const route of activeProgrammedRoutes) {
      const intervalMs = (route.intervalDays || 1) * 20000; // Cada día de juego o ciclo
      if (now - (route.lastProcessed || 0) < intervalMs) continue;

      newState = dispatchTradeRouteMission(newState, route);
    }
  }

  return newState;
};
