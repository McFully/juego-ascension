import {
  updatePlanet, uid, calcStorage, calcDistance, calcFlightTime, fleetSpeed, fmt, GAME_SPEED
} from '../../core.jsx';

export const handleSaveFleetPreset = (state, action) => {
  const { name, fleet } = action;
  if (!name || !fleet || Object.keys(fleet).length === 0) return state;
  const presets = [...state.fleetPresets];
  const existing = presets.findIndex(p => p.name === name);
  if (existing >= 0) presets[existing] = { name, fleet: { ...fleet } };
  else presets.push({ name, fleet: { ...fleet } });
  return { ...state, fleetPresets: presets.slice(-10) };
};

export const handleDeleteFleetPreset = (state, action) => {
  const { name } = action;
  return { ...state, fleetPresets: state.fleetPresets.filter(p => p.name !== name) };
};

export const handleAddTradeRoute = (state, action) => {
  const {
    fromId,
    toId,
    toGalaxy,
    toSystem,
    toPosition,
    resource = 'metal',
    mode = 'fixed', // 'fixed' | 'surplus'
    amount = 5000,
    ratio = 0.5,
    intervalDays = 1,
    loop = true,
    returnResource = 'none',
    returnAmount = 0,
    assignedShips = {}
  } = action;
  
  const from = state.planets.find(p => p.id === fromId);
  if (!from) return state;
  const routes = state.tradeRoutes || [];
  if (routes.length >= 10) return state;
  
  const newRoute = {
    id: uid(),
    fromId,
    toId: toId || null,
    toGalaxy: toGalaxy || 1,
    toSystem: toSystem || 1,
    toPosition: toPosition || 1,
    resource: resource || 'metal',
    mode: mode || 'fixed',
    amount: Math.max(100, Number(amount) || 5000),
    ratio: Math.max(0.1, Math.min(1, Number(ratio) || 0.5)),
    intervalDays: Math.max(1, Number(intervalDays) || 1),
    loop: loop !== undefined ? Boolean(loop) : true,
    returnResource: returnResource || 'none',
    returnAmount: Math.max(0, Number(returnAmount) || 0),
    assignedShips: {
      smallCargo: Math.max(0, Number(assignedShips.smallCargo) || 0),
      largeCargo: Math.max(0, Number(assignedShips.largeCargo) || 0),
      lightFighter: Math.max(0, Number(assignedShips.lightFighter) || 0),
      heavyFighter: Math.max(0, Number(assignedShips.heavyFighter) || 0)
    },
    active: true,
    lastProcessed: Date.now(),
    deliveriesCount: 0
  };
  return { ...state, tradeRoutes: [...routes, newRoute] };
};

export const handleRemoveTradeRoute = (state, action) => {
  const { routeId } = action;
  return { ...state, tradeRoutes: (state.tradeRoutes || []).filter(r => r.id !== routeId) };
};

export const handleToggleTradeRoute = (state, action) => {
  const { routeId } = action;
  return {
    ...state,
    tradeRoutes: (state.tradeRoutes || []).map(r =>
      r.id === routeId ? { ...r, active: !r.active } : r
    )
  };
};

export const dispatchTradeRouteMission = (state, route) => {
  const from = state.planets.find(p => p.id === route.fromId);
  if (!from) return state;

  // Buscar planeta destino (por toId o coordenadas)
  let to = null;
  if (route.toId) {
    to = state.planets.find(p => p.id === route.toId);
  }
  if (!to && route.toGalaxy && route.toSystem && route.toPosition) {
    to = state.planets.find(p => p.galaxy === route.toGalaxy && p.system === route.toSystem && p.position === route.toPosition);
  }
  if (!to) {
    to = state.planets.find(p => p.id !== route.fromId && p.isHome) ||
         state.planets.find(p => p.id !== route.fromId);
  }
  if (!to || to.id === from.id) return state;

  let toSend = 0;
  if (route.mode === 'fixed') {
    const available = from.resources[route.resource] || 0;
    toSend = Math.min(available, route.amount || 1000);
  } else {
    // Modo excedente clásico
    const storageObj = calcStorage(from.buildings, state.research || {});
    const maxCap = storageObj[route.resource] || 0;
    const threshold = maxCap * (route.ratio || 0.5);
    const available = from.resources[route.resource] || 0;
    if (available > threshold) {
      const surplus = available - threshold;
      toSend = Math.min(surplus, Math.floor(surplus * 0.5));
    }
  }

  if (toSend < 50) return state;

  // Comprobar capacidad disponible en destino
  const destStorage = calcStorage(to.buildings, state.research || {});
  const destCurrent = to.resources?.[route.resource] || 0;
  const destMax = destStorage[route.resource] || 100000;
  const destSpace = Math.max(0, destMax - destCurrent);
  toSend = Math.min(toSend, destSpace);
  if (toSend < 50) return state;

  // Determinar flota de cargueros necesaria
  const isCommercial = from.specialization === 'commercial';
  const cargoMult = isCommercial ? 1.5 : 1.0;
  const smallCap = 5000 * cargoMult;
  const largeCap = 25000 * cargoMult;

  const assigned = route.assignedShips || {};
  let smallUsed = 0;
  let largeUsed = 0;
  let lightUsed = 0;
  let heavyUsed = 0;

  const originFleet = from.fleet || {};

  if (assigned.smallCargo || assigned.largeCargo || assigned.lightFighter || assigned.heavyFighter) {
    // Convoy configurado explícitamente en la ruta
    const availSmall = originFleet.smallCargo || 0;
    const availLarge = originFleet.largeCargo || 0;
    const availLight = originFleet.lightFighter || 0;
    const availHeavy = originFleet.heavyFighter || 0;

    smallUsed = Math.min(availSmall, assigned.smallCargo || 0);
    largeUsed = Math.min(availLarge, assigned.largeCargo || 0);
    lightUsed = Math.min(availLight, assigned.lightFighter || 0);
    heavyUsed = Math.min(availHeavy, assigned.heavyFighter || 0);

    const totalConvoyCap = smallUsed * smallCap + largeUsed * largeCap;
    if (totalConvoyCap <= 0) return state; // Sin cargueros disponibles del convoy en el hangar
    toSend = Math.min(toSend, totalConvoyCap);
  } else {
    // Auto-asignar cargueros disponibles del hangar de origen
    const availSmall = originFleet.smallCargo || 0;
    const availLarge = originFleet.largeCargo || 0;
    const totalAvailCap = availLarge * largeCap + availSmall * smallCap;
    if (totalAvailCap <= 0) return state; // No hay cargueros en la colonia

    toSend = Math.min(toSend, totalAvailCap);
    let remNeeded = toSend;
    largeUsed = Math.min(availLarge, Math.floor(remNeeded / largeCap));
    remNeeded -= largeUsed * largeCap;
    if (remNeeded > 0) {
      smallUsed = Math.min(availSmall, Math.ceil(remNeeded / smallCap));
    }
  }

  if (smallUsed === 0 && largeUsed === 0) return state;

  // Deducir recursos y naves del origen
  let newState = updatePlanet(state, from.id, p => {
    const updatedFleet = { ...(p.fleet || {}) };
    if (smallUsed > 0) updatedFleet.smallCargo = Math.max(0, (updatedFleet.smallCargo || 0) - smallUsed);
    if (largeUsed > 0) updatedFleet.largeCargo = Math.max(0, (updatedFleet.largeCargo || 0) - largeUsed);
    if (lightUsed > 0) updatedFleet.lightFighter = Math.max(0, (updatedFleet.lightFighter || 0) - lightUsed);
    if (heavyUsed > 0) updatedFleet.heavyFighter = Math.max(0, (updatedFleet.heavyFighter || 0) - heavyUsed);

    if (updatedFleet.smallCargo === 0) delete updatedFleet.smallCargo;
    if (updatedFleet.largeCargo === 0) delete updatedFleet.largeCargo;
    if (updatedFleet.lightFighter === 0) delete updatedFleet.lightFighter;
    if (updatedFleet.heavyFighter === 0) delete updatedFleet.heavyFighter;

    return {
      ...p,
      resources: {
        ...p.resources,
        [route.resource]: Math.max(0, (p.resources[route.resource] || 0) - toSend)
      },
      fleet: updatedFleet
    };
  });

  const dispatchedFleet = {};
  if (smallUsed > 0) dispatchedFleet.smallCargo = smallUsed;
  if (largeUsed > 0) dispatchedFleet.largeCargo = largeUsed;
  if (lightUsed > 0) dispatchedFleet.lightFighter = lightUsed;
  if (heavyUsed > 0) dispatchedFleet.heavyFighter = heavyUsed;

  const dist = calcDistance(from, to);
  const playerFaction = from.faction || 'human';
  const spd = fleetSpeed(dispatchedFleet, newState.research || {}, playerFaction);
  const flightTime = calcFlightTime(dist, spd, 10, newState.research || {});
  const departure = Date.now();
  const arrivalTime = departure + flightTime * 1000;
  const returnTime = arrivalTime + flightTime * 1000;

  // Registrar misión real de transporte en fleetMissions
  const newMission = {
    id: uid(),
    type: 'transport',
    from: { id: from.id, name: from.name, galaxy: from.galaxy, system: from.system, position: from.position, specialization: from.specialization },
    to: { id: to.id, name: to.name, galaxy: to.galaxy, system: to.system, position: to.position },
    fleet: dispatchedFleet,
    resources: { [route.resource]: toSend },
    fuel: 0,
    departure,
    arrivalTime,
    returnTime,
    isAI: false,
    autoRoute: true,
    routeId: route.id
  };

  newState.fleetMissions = [...(newState.fleetMissions || []), newMission];

  // Actualizar estadística de entrega en la ruta
  const now = Date.now();
  newState.tradeRoutes = (newState.tradeRoutes || []).map(r => {
    if (r.id !== route.id) return r;
    const deliveries = (r.deliveriesCount || 0) + 1;
    return {
      ...r,
      deliveriesCount: deliveries,
      lastProcessed: now,
      active: r.loop !== false
    };
  });

  newState.notifications = [...(newState.notifications || []), {
    id: uid(),
    type: 'info',
    message: `🚚 Convoy comercial despachado desde ${from.name} hacia ${to.name} llevando ${fmt(toSend)} de ${route.resource}`,
    timestamp: now
  }];

  return newState;
};

export const handleProcessTradeRoutes = (state, action) => {
  const routes = state.tradeRoutes || [];
  if (routes.length === 0) return state;
  let newState = { ...state };
  for (const route of routes) {
    if (!route.active) continue;
    newState = dispatchTradeRouteMission(newState, route);
  }
  return newState;
};
