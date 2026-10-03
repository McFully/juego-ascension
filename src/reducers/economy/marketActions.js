import {
  canAfford,
  deduct,
  fmt,
  uid,
  updatePlanet
} from '../../core.jsx';

export const handleMarketTrade = (state, action, getCurrentPlanet) => {
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

  let newState = updatePlanet(state, targetPlanet.id, p => ({ ...p, resources: newRes }));
  newState.notifications = [...(newState.notifications || []), {
    id: uid(),
    type: 'success',
    message: `💱 Intercambio completado: -${fmt(sellAmount)} ${sellResource} ➔ +${fmt(buyAmount)} ${buyResource} en ${targetPlanet.name}.`,
    timestamp: Date.now()
  }];
  return newState;
};

export const handleMarketBuyUsedShips = (state, action, getCurrentPlanet) => {
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
};

export const handleMarketScrapShips = (state, action, getCurrentPlanet) => {
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
};

export const handleMarketBuyBlackMarket = (state, action, getCurrentPlanet) => {
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
};

export const handleMarketSellShips = (state, action, getCurrentPlanet) => {
  const { planetId, shipId, quantity, pricePerUnit } = action;
  const targetPlanet = state.planets.find(p => p.id === (planetId || state.currentPlanetId)) || getCurrentPlanet();
  if (!targetPlanet || !shipId || quantity <= 0) return state;

  const available = targetPlanet.fleet?.[shipId] || 0;
  if (available < quantity) return state;

  const currentFleet = { ...(targetPlanet.fleet || {}) };
  currentFleet[shipId] = available - quantity;
  if (currentFleet[shipId] <= 0) delete currentFleet[shipId];

  const totalCreditsEarned = Math.floor(quantity * (pricePerUnit || 1000));
  const currentCredits = state.credits || 0;

  let newState = updatePlanet(state, targetPlanet.id, p => ({
    ...p,
    fleet: currentFleet
  }));
  newState.credits = currentCredits + totalCreditsEarned;

  newState.notifications = [...(newState.notifications || []), {
    id: uid(),
    type: 'success',
    message: `🤝 Venta naval completada: ${quantity} unidad(es) de ${shipId} liquidadas por +${fmt(totalCreditsEarned)} Créditos Estelares.`,
    timestamp: Date.now()
  }];
  return newState;
};

export const handleMarketBuyBlueprint = (state, action) => {
  const { blueprint, costCredits } = action;
  if (!blueprint) return state;

  const currentCredits = state.credits || 0;
  if (currentCredits < costCredits) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `⚠️ Créditos insuficientes (${fmt(costCredits)} ₢ requeridos) para adquirir esta patente naval.`,
        timestamp: Date.now()
      }]
    };
  }

  const existingBps = state.blueprints || [];
  const alreadyHas = existingBps.some(b => b.name === blueprint.name);
  if (alreadyHas) return state;

  return {
    ...state,
    credits: currentCredits - costCredits,
    blueprints: [...existingBps, { ...blueprint, id: uid() }],
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `📜 Patente naval "${blueprint.name}" adquirida e integrada en el Diseñador de Naves.`,
      timestamp: Date.now()
    }]
  };
};
