import {
  BUILDINGS,
  RESEARCH,
  SHIPS,
  DEFENSES,
  buildingCost,
  researchCost,
  constructionDiscount,
  calcCustomShipCost,
  updatePlanet,
  uid
} from '../../core.jsx';

export const handleCancelBuildQueue = (state, action) => {
  const { queueId } = action;
  const targetItem = state.buildQueue.find(q => q.id === queueId);
  if (!targetItem) return state;

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
};

export const handleCancelResearchQueue = (state, action) => {
  const { queueId } = action;
  const targetItem = state.researchQueue.find(q => q.id === queueId);
  if (!targetItem) return state;

  const r = RESEARCH[targetItem.researchId];
  const targetPlanetId = targetItem.planetId || state.currentPlanetId;
  const rPl = state.planets.find(p => p.id === targetPlanetId);

  const cost = researchCost(targetItem.researchId, targetItem.level - 1, state.research?.aiStrategy || 0, rPl?.buildings?.constructionCenter || 0);
  const totalRefund = {
    metal: Math.floor(cost.metal * 0.5),
    crystal: Math.floor(cost.crystal * 0.5),
    deuterium: Math.floor((cost.deuterium || 0) * 0.5)
  };

  let newState = updatePlanet(state, targetPlanetId, p => ({
    ...p,
    resources: {
      metal: p.resources.metal + totalRefund.metal,
      crystal: p.resources.crystal + totalRefund.crystal,
      deuterium: p.resources.deuterium + totalRefund.deuterium
    }
  }));

  newState.researchQueue = state.researchQueue.filter(q => q.id !== queueId);
  const msg = `🚫 Investigación de ${r?.name || 'tecnología'} (Nv. ${targetItem.level}) cancelada. Reembolso 50%`;

  newState.notifications = [
    ...(newState.notifications || []),
    { id: uid(), type: 'info', message: msg, timestamp: Date.now() }
  ];
  return newState;
};

export const handleCancelShipQueue = (state, action) => {
  const { queueId } = action;
  const item = state.shipQueue.find(q => q.id === queueId);
  if (!item) return state;
  const ship = SHIPS[item.shipId];
  if (!ship) {
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
};

export const handleCancelDefenseQueue = (state, action) => {
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
};
