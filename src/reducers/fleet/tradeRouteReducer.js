import {
  updatePlanet, uid, calcStorage
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

export const handleProcessTradeRoutes = (state, action) => {
  const routes = state.tradeRoutes || [];
  if (routes.length === 0) return state;
  let newState = { ...state };
  for (const route of routes) {
    if (!route.active) continue;
    const from = newState.planets.find(p => p.id === route.fromId);
    if (!from) continue;
    
    // Buscar planeta destino (por toId o coordenadas)
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
      // Modo excedente clásico
      const storage = from.resources[route.resource] || 0;
      const maxStorage = calcStorage(from.buildings);
      const maxCap = maxStorage[route.resource] || 0;
      const threshold = maxCap * (route.ratio || 0.5);
      if (storage > threshold) {
        const surplus = storage - threshold;
        toSend = Math.min(surplus, Math.floor(surplus * 0.5));
      }
    }

    if (toSend < 50) continue;

    // Ejecutar envío de ida
    newState = updatePlanet(newState, route.fromId, p => ({
      ...p,
      resources: { ...p.resources, [route.resource]: Math.max(0, (p.resources[route.resource] || 0) - toSend) }
    }));
    newState = updatePlanet(newState, to.id, p => ({
      ...p,
      resources: { ...p.resources, [route.resource]: (p.resources[route.resource] || 0) + toSend }
    }));

    // Carga de retorno opcional
    let returnSent = 0;
    if (route.returnResource && route.returnResource !== 'none' && route.returnAmount > 0) {
      const destAvailable = to.resources[route.returnResource] || 0;
      returnSent = Math.min(destAvailable, route.returnAmount);
      if (returnSent > 0) {
        newState = updatePlanet(newState, to.id, p => ({
          ...p,
          resources: { ...p.resources, [route.returnResource]: Math.max(0, (p.resources[route.returnResource] || 0) - returnSent) }
        }));
        newState = updatePlanet(newState, route.fromId, p => ({
          ...p,
          resources: { ...p.resources, [route.returnResource]: (p.resources[route.returnResource] || 0) + returnSent }
        }));
      }
    }

    // Actualizar estadística de entrega en la ruta
    newState.tradeRoutes = (newState.tradeRoutes || []).map(r => {
      if (r.id !== route.id) return r;
      const deliveries = (r.deliveriesCount || 0) + 1;
      const keepActive = r.loop !== false;
      return {
        ...r,
        deliveriesCount: deliveries,
        lastProcessed: Date.now(),
        active: keepActive
      };
    });
  }
  return newState;
};
