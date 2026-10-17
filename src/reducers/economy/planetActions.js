import {
  canAfford,
  deduct,
  fmt,
  uid,
  updatePlanet
} from '../../core.jsx';
import { PLANET_SPECIALIZATION_COSTS } from '../../data/gameData.js';

export const handleSetPlanet = (state, action) => {
  const targetId = action.payload || action.planetId;
  return targetId ? { ...state, currentPlanetId: targetId } : state;
};

export const handleRenamePlanet = (state, action) => {
  const { planetId, name } = action;
  if (!name || name.trim().length === 0) return state;
  return updatePlanet(state, planetId, p => ({ ...p, name: name.trim().slice(0, 20) }));
};

export const handlePlanetSpecialize = (state, action) => {
  const { planetId, specialization } = action;
  const planet = state.planets.find(p => p.id === planetId);
  if (!planet) return state;

  const cost = PLANET_SPECIALIZATION_COSTS[specialization] || { metal: 0, crystal: 0, deuterium: 0 };
  if (!canAfford(planet.resources, cost)) return state;

  let newState = updatePlanet(state, planetId, p => ({
    ...p,
    resources: deduct(p.resources, cost),
    specialization: specialization
  }));

  const specNames = {
    industrial: 'Industrial/Minera',
    scientific: 'Científica',
    military: 'Militar',
    commercial: 'Comercial'
  };
  const specName = specNames[specialization] || 'Ninguna';

  newState.notifications = [...(newState.notifications || []), {
    id: uid(),
    type: 'success',
    message: `🌟 Planeta ${planet.name} especializado en rama: ${specName}`,
    timestamp: Date.now()
  }];

  return newState;
};

export const handlePlanetToggleAutotrade = (state, action) => {
  const { planetId } = action;
  return updatePlanet(state, planetId, p => ({ ...p, autoTrade: !p.autoTrade }));
};

export const handleSetPlanetTaxRate = (state, action) => {
  const { planetId, taxRate } = action;
  const targetId = planetId || state.currentPlanetId;
  const rate = Math.max(0, Math.min(50, Number(taxRate) || 10));
  return updatePlanet(state, targetId, p => ({
    ...p,
    taxRate: rate
  }));
};

export const handleEqualizeColonyResources = (state) => {
  if (!state.planets || state.planets.length <= 1) return state;
  let totalMetal = 0, totalCrystal = 0, totalDeut = 0;
  state.planets.forEach(p => {
    totalMetal += p.resources.metal || 0;
    totalCrystal += p.resources.crystal || 0;
    totalDeut += p.resources.deuterium || 0;
  });

  const count = state.planets.length;
  const avgMetal = Math.floor(totalMetal / count);
  const avgCrystal = Math.floor(totalCrystal / count);
  const avgDeut = Math.floor(totalDeut / count);

  const newPlanets = state.planets.map(p => ({
    ...p,
    resources: {
      metal: avgMetal,
      crystal: avgCrystal,
      deuterium: avgDeut
    }
  }));

  return {
    ...state,
    planets: newPlanets,
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `⚖️ Recursos equilibrados en las ${count} colonias (${fmt(avgMetal)}M / ${fmt(avgCrystal)}C / ${fmt(avgDeut)}D por mundo)`,
      timestamp: Date.now()
    }]
  };
};

export const handleRelocateColonyFleet = (state, action) => {
  const { fromPlanetId, toPlanetId, ships } = action;
  if (!fromPlanetId || !toPlanetId || fromPlanetId === toPlanetId || !ships) return state;
  const fromP = state.planets.find(p => p.id === fromPlanetId);
  const toP = state.planets.find(p => p.id === toPlanetId);
  if (!fromP || !toP) return state;

  const newFromFleet = { ...(fromP.fleet || {}) };
  const newToFleet = { ...(toP.fleet || {}) };
  let movedCount = 0;

  for (const [shipId, qty] of Object.entries(ships)) {
    const available = newFromFleet[shipId] || 0;
    const toMove = Math.min(available, Math.max(0, qty));
    if (toMove > 0) {
      newFromFleet[shipId] = available - toMove;
      if (newFromFleet[shipId] <= 0) delete newFromFleet[shipId];
      newToFleet[shipId] = (newToFleet[shipId] || 0) + toMove;
      movedCount += toMove;
    }
  }

  if (movedCount === 0) return state;

  let newState = updatePlanet(state, fromPlanetId, p => ({ ...p, fleet: newFromFleet }));
  newState = updatePlanet(newState, toPlanetId, p => ({ ...p, fleet: newToFleet }));
  newState.notifications = [...(newState.notifications || []), {
    id: uid(),
    type: 'info',
    message: `🚀 Reubicación completada: ${movedCount} naves transferidas de ${fromP.name} a ${toP.name}`,
    timestamp: Date.now()
  }];
  return newState;
};

export const handleStartPlanetTerraforming = (state, action) => {
  const { planetId } = action;
  const planet = state.planets.find(p => p.id === planetId);
  if (!planet) return state;

  const hasShip = (planet.fleet?.terraformerShip || 0) >= 1;
  if (!hasShip) {
    return {
      ...state,
      notifications: [
        ...(state.notifications || []),
        {
          id: uid(),
          type: 'warning',
          message: `🚫 Se requiere una Nave Terraformatriz en órbita de ${planet.name} para acondicionar el planeta.`,
          timestamp: Date.now()
        }
      ]
    };
  }

  return updatePlanet(state, planetId, p => ({
    ...p,
    isTerraformingActive: true,
    terraformingProgress: 5
  }));
};

export const handleEstablishBilateralRoute = (state, action) => {
  const { originId, targetId, routeType, rewardCredits, costCredits } = action.payload || {};
  if (!originId || !targetId || !routeType) return state;
  if ((state.credits || 0) < (costCredits || 0)) return state;

  const newRoute = {
    id: uid(),
    originId,
    targetId,
    routeType,
    rewardCredits: rewardCredits || 150,
    createdAt: Date.now()
  };

  const originPlanet = state.planets.find(p => p.id === originId);
  const targetPlanet = state.planets.find(p => p.id === targetId);

  return {
    ...state,
    credits: Math.max(0, (state.credits || 0) - (costCredits || 0)),
    bilateralTradeRoutes: [...(state.bilateralTradeRoutes || []), newRoute],
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `🌐 Tratado comercial firmado: Ruta activa entre ${originPlanet?.name || 'Origen'} y ${targetPlanet?.name || 'Destino'} (+${newRoute.rewardCredits} ₢/ciclo).`,
      timestamp: Date.now()
    }]
  };
};

export const handleCancelBilateralRoute = (state, action) => {
  const { routeId } = action.payload || {};
  return {
    ...state,
    bilateralTradeRoutes: (state.bilateralTradeRoutes || []).filter(r => r.id !== routeId),
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'info',
      message: `🚫 Ruta comercial bilateral cancelada.`,
      timestamp: Date.now()
    }]
  };
};

export const handleApplyOfflineProgress = (state, action) => {
  const { seconds, planetGains, totalGathered, notification } = action.payload || {};
  if (!seconds || seconds <= 0 || !planetGains) return state;

  const now = Date.now();
  const currentStats = state.stats || {};

  const updatedPlanets = (state.planets || []).map(p => {
    const gain = planetGains[p.id];
    if (!gain) return p;
    const currentRes = p.resources || { metal: 0, crystal: 0, deuterium: 0 };
    return {
      ...p,
      resources: {
        ...currentRes,
        metal: (currentRes.metal || 0) + (gain.metal || 0),
        crystal: (currentRes.crystal || 0) + (gain.crystal || 0),
        deuterium: (currentRes.deuterium || 0) + (gain.deuterium || 0),
      }
    };
  });

  return {
    ...state,
    planets: updatedPlanets,
    lastTick: now,
    gameTick: (state.gameTick || 0) + Math.min(seconds, 1800),
    stats: {
      ...currentStats,
      metalGathered: (currentStats.metalGathered || 0) + (totalGathered?.metal || 0),
      crystalGathered: (currentStats.crystalGathered || 0) + (totalGathered?.crystal || 0),
      deuteriumGathered: (currentStats.deuteriumGathered || 0) + (totalGathered?.deuterium || 0),
    },
    notifications: notification ? [...(state.notifications || []), notification] : state.notifications
  };
};

