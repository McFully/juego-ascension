import {
  calcStorage, calcDistance, calcFlightTime, fleetSpeed, uid, fmt
} from '../../../core.jsx';

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

      const from = newState.planets.find(p => p.id === route.fromId);
      if (!from) continue;

      let to = null;
      if (route.toId) {
        to = newState.planets.find(p => p.id === route.toId);
      }
      if (!to && route.toGalaxy && route.toSystem && route.toPosition) {
        to = newState.planets.find(p => p.galaxy === route.toGalaxy && p.system === route.toSystem && p.position === route.toPosition);
      }
      if (!to) {
        to = newState.planets.find(p => p.id !== route.fromId && p.isHome) ||
             newState.planets.find(p => p.id !== route.fromId);
      }
      if (!to || to.id === from.id) continue;

      let toSend = 0;
      if (route.mode === 'fixed') {
        const available = from.resources[route.resource] || 0;
        toSend = Math.min(available, route.amount || 1000);
      } else {
        const storage = calcStorage(from.buildings);
        const maxCap = storage[route.resource] || 0;
        const threshold = maxCap * (route.ratio || 0.5);
        const available = from.resources[route.resource] || 0;
        if (available > threshold) {
          const surplus = available - threshold;
          toSend = Math.min(surplus, Math.floor(surplus * 0.5));
        }
      }

      if (toSend < 50) continue;

      // Transferir recursos de ida
      newState.planets = newState.planets.map(pl => {
        if (pl.id === route.fromId) {
          return {
            ...pl,
            resources: { ...pl.resources, [route.resource]: Math.max(0, (pl.resources[route.resource] || 0) - toSend) }
          };
        }
        if (pl.id === to.id) {
          return {
            ...pl,
            resources: { ...pl.resources, [route.resource]: (pl.resources[route.resource] || 0) + toSend }
          };
        }
        return pl;
      });

      // Transferencia de vuelta si está configurada
      let returnSent = 0;
      if (route.returnResource && route.returnResource !== 'none' && route.returnAmount > 0) {
        const targetPl = newState.planets.find(p => p.id === to.id);
        const destAvailable = targetPl?.resources[route.returnResource] || 0;
        returnSent = Math.min(destAvailable, route.returnAmount);
        if (returnSent > 0) {
          newState.planets = newState.planets.map(pl => {
            if (pl.id === to.id) {
              return {
                ...pl,
                resources: { ...pl.resources, [route.returnResource]: Math.max(0, (pl.resources[route.returnResource] || 0) - returnSent) }
              };
            }
            if (pl.id === route.fromId) {
              return {
                ...pl,
                resources: { ...pl.resources, [route.returnResource]: (pl.resources[route.returnResource] || 0) + returnSent }
              };
            }
            return pl;
          });
        }
      }

      // Marcar ruta procesada
      newState.tradeRoutes = (newState.tradeRoutes || []).map(r => {
        if (r.id !== route.id) return r;
        const deliveries = (r.deliveriesCount || 0) + 1;
        return {
          ...r,
          lastProcessed: now,
          deliveriesCount: deliveries,
          active: r.loop !== false
        };
      });
    }
  }

  return newState;
};
