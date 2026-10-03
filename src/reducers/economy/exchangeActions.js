import {
  fmt,
  uid,
  BUILDINGS,
  calcEffectiveBuildTime,
  GAME_SPEED
} from '../../core.jsx';
import { stampTimeMult } from '../tick/queues/queueTiming.js';

export const handleClaimDaoDividends = (state, action) => {
  const claimAmount = Number(action.amount || 0);
  if (claimAmount <= 0) return state;
  const currentCredits = state.credits || 0;
  return {
    ...state,
    credits: currentCredits + claimAmount,
    daoDividendPool: Math.max(0, (state.daoDividendPool || 250000) - claimAmount),
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `💎 Dividendos del Exchange liquidados: +${fmt(claimAmount)} Créditos Estelares ingresados al Tesoro Imperial.`,
      timestamp: Date.now()
    }]
  };
};

export const handleCreateLimitOrder = (state, action) => {
  const { orderType, resource, amount, targetPrice, hasParkedShip, destinationPlanetId } = action;
  if (!resource || amount <= 0 || targetPrice <= 0) return state;

  const currentCredits = state.credits || 0;
  let newCredits = currentCredits;

  if (orderType === 'buy_limit') {
    const requiredCredits = Math.floor(amount * targetPrice);
    if (currentCredits < requiredCredits) {
      return {
        ...state,
        notifications: [...(state.notifications || []), {
          id: uid(),
          type: 'warning',
          message: `⚠️ Fondos insuficientes para la orden Limit (${fmt(requiredCredits)} ₢ requeridos).`,
          timestamp: Date.now()
        }]
      };
    }
    newCredits -= requiredCredits;
  }

  const newOrder = {
    id: uid(),
    type: orderType,
    resource,
    amount,
    targetPrice,
    reservedCredits: orderType === 'buy_limit' ? Math.floor(amount * targetPrice) : 0,
    hasParkedShip: !!hasParkedShip,
    destinationPlanetId: destinationPlanetId || state.currentPlanetId,
    createdAt: Date.now()
  };

  return {
    ...state,
    credits: newCredits,
    exchangeOrders: [...(state.exchangeOrders || []), newOrder],
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'info',
      message: `📜 Orden Limit programada: ${orderType === 'buy_limit' ? 'Comprar' : 'Vender'} ${fmt(amount)} ${resource} a umbral de ${targetPrice} ₢.`,
      timestamp: Date.now()
    }]
  };
};

export const handleCancelLimitOrder = (state, action) => {
  const { orderId } = action;
  const order = (state.exchangeOrders || []).find(o => o.id === orderId);
  if (!order) return state;

  const currentCredits = state.credits || 0;
  const refund = order.reservedCredits || 0;

  return {
    ...state,
    credits: currentCredits + refund,
    exchangeOrders: (state.exchangeOrders || []).filter(o => o.id !== orderId),
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'info',
      message: `🚫 Orden Limit cancelada. Saldo reembolsado (+${fmt(refund)} ₢).`,
      timestamp: Date.now()
    }]
  };
};

export const handleContributeExchangeProject = (state, action) => {
  const { buildingId, amount, resource, planetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const donorPlanet = (state.planets || []).find(p => p.id === targetPlanetId) || state.planets[0];
  if (!donorPlanet || !buildingId || amount <= 0) return state;

  const resKey = resource || 'metal';
  if ((donorPlanet.resources?.[resKey] || 0) < amount) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `⚠️ Recursos insuficientes en ${donorPlanet.name} (${fmt(amount)} ${resKey} requeridos).`,
        timestamp: Date.now()
      }]
    };
  }

  let updatedPlanets = state.planets.map(p => {
    if (p.id === donorPlanet.id) {
      return {
        ...p,
        resources: {
          ...p.resources,
          [resKey]: Math.max(0, (p.resources[resKey] || 0) - amount)
        }
      };
    }
    return p;
  });

  const prevContributions = state.exchangeContributions || {};
  const planetContrib = prevContributions[targetPlanetId] || {};
  const buildingContrib = planetContrib[buildingId] || { metal: 0, crystal: 0, deuterium: 0 };
  const newBuildingContrib = {
    ...buildingContrib,
    [resKey]: (buildingContrib[resKey] || 0) + amount
  };

  const prevProjects = state.exchangeProjects || {};
  const currentBuildingTotal = (prevProjects[buildingId] || 0) + amount;

  const sharesEarned = Math.max(1, Math.floor(amount / 25000));
  const playerShares = (state.playerDaoShares || 100) + sharesEarned;
  const totalShares = (state.daoShares || 1000) + sharesEarned;

  return {
    ...state,
    planets: updatedPlanets,
    playerDaoShares: playerShares,
    daoShares: totalShares,
    exchangeProjects: {
      ...prevProjects,
      [buildingId]: currentBuildingTotal
    },
    exchangeContributions: {
      ...prevContributions,
      [targetPlanetId]: {
        ...planetContrib,
        [buildingId]: newBuildingContrib
      }
    },
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `🏛️ Aportación al módulo completada: -${fmt(amount)} ${resKey}. Has recibido +${sharesEarned} Acciones DAO en la Lonja.`,
      timestamp: Date.now()
    }]
  };
};

export const handleContributeAllExchangeProject = (state, action) => {
  const { buildingId, planetId, totalCost } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const donorPlanet = (state.planets || []).find(p => p.id === targetPlanetId) || state.planets[0];
  if (!donorPlanet || !buildingId || !totalCost) return state;

  const prevContributions = state.exchangeContributions || {};
  const planetContrib = prevContributions[targetPlanetId] || {};
  const buildingContrib = planetContrib[buildingId] || { metal: 0, crystal: 0, deuterium: 0 };

  let totalContributedAmount = 0;
  const newDeductions = { metal: 0, crystal: 0, deuterium: 0 };
  const newContribs = { ...buildingContrib };

  for (const resKey of ['metal', 'crystal', 'deuterium']) {
    const needed = Math.max(0, (totalCost[resKey] || 0) - (buildingContrib[resKey] || 0));
    const available = Math.max(0, donorPlanet.resources?.[resKey] || 0);
    const toGive = Math.min(needed, available);
    if (toGive > 0) {
      newDeductions[resKey] = toGive;
      newContribs[resKey] = (newContribs[resKey] || 0) + toGive;
      totalContributedAmount += toGive;
    }
  }

  if (totalContributedAmount <= 0) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `⚠️ No dispones de recursos suficientes en ${donorPlanet.name} para aportar a este megaproyecto.`,
        timestamp: Date.now()
      }]
    };
  }

  const updatedPlanets = state.planets.map(p => {
    if (p.id === donorPlanet.id) {
      return {
        ...p,
        resources: {
          ...p.resources,
          metal: Math.max(0, (p.resources.metal || 0) - newDeductions.metal),
          crystal: Math.max(0, (p.resources.crystal || 0) - newDeductions.crystal),
          deuterium: Math.max(0, (p.resources.deuterium || 0) - newDeductions.deuterium)
        }
      };
    }
    return p;
  });

  const sharesEarned = Math.max(1, Math.floor(totalContributedAmount / 25000));
  const playerShares = (state.playerDaoShares || 100) + sharesEarned;
  const totalShares = (state.daoShares || 1000) + sharesEarned;

  const prevProjects = state.exchangeProjects || {};
  const currentBuildingTotal = (prevProjects[buildingId] || 0) + totalContributedAmount;

  return {
    ...state,
    planets: updatedPlanets,
    playerDaoShares: playerShares,
    daoShares: totalShares,
    exchangeProjects: {
      ...prevProjects,
      [buildingId]: currentBuildingTotal
    },
    exchangeContributions: {
      ...prevContributions,
      [targetPlanetId]: {
        ...planetContrib,
        [buildingId]: newContribs
      }
    },
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `🏛️ Aportación total completada: -${fmt(totalContributedAmount)} recursos en total. Has recibido +${sharesEarned} Acciones DAO.`,
      timestamp: Date.now()
    }]
  };
};

export const handleFinalizeExchangeProject = (state, action) => {
  const { buildingId, planetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const targetPlanet = (state.planets || []).find(p => p.id === targetPlanetId);
  if (!targetPlanet) return state;

  const currentLvl = targetPlanet.buildings?.[buildingId] || 0;
  const targetLvl = currentLvl + 1;
  const b = BUILDINGS[buildingId] || {};

  const prevContributions = state.exchangeContributions || {};
  const planetContrib = { ...(prevContributions[targetPlanetId] || {}) };
  delete planetContrib[buildingId];

  const costFactor = Math.pow(1.5, currentLvl);
  const approxCost = { metal: Math.floor(50000 * costFactor), crystal: Math.floor(30000 * costFactor), deuterium: Math.floor(15000 * costFactor) };
  const time = Math.max(45, Math.floor(calcEffectiveBuildTime({ cost: approxCost, planet: targetPlanet, state, speed: GAME_SPEED }) || 60));
  const startTime = Date.now();
  const endTime = startTime + time * 1000;

  const queued = stampTimeMult(state, 'build', {
    id: uid(),
    planetId: targetPlanetId,
    buildingId,
    startTime,
    endTime,
    level: targetLvl,
    isMegaproject: true
  });

  return {
    ...state,
    buildQueue: [...(state.buildQueue || []), queued],
    exchangeContributions: {
      ...prevContributions,
      [targetPlanetId]: planetContrib
    },
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `🏗️ ¡Financiación 100% alcanzada! Ensamblaje de ${b.name || buildingId} Nivel ${targetLvl} iniciado en la Lonja (${time}s).`,
      timestamp: Date.now()
    }]
  };
};
