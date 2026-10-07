import { depositToClientVault, scheduleFreightTransport } from '../../utils/galacticLonjaMarketMaker.js';
import { calculateCapitalContribution, recordTreasuryLedger, castDaoVote, placeShareOrder } from '../../utils/galacticLonjaAutonomousCore.js';
import {
  fmt,
  uid,
  BUILDINGS,
  calcEffectiveBuildTime,
  GAME_SPEED
} from '../../core.jsx';
import { stampTimeMult } from '../tick/queues/queueTiming.js';
import { checkPhysicalAccess } from '../../utils/galacticSpotExchange.js';
import { estimateSpotArbitrage } from '../../utils/spotArbitrage.js';
import { handleSendFleet } from '../fleet/fleetMissionActions.js';

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
  const { orderType, resource, amount, targetPrice, hasParkedShip, destinationPlanetId, planetId,
          stopPrice, limitPrice, spotOrderType, takeProfitPrice, expiresAt, clientOrderId } = action;
  if (!resource || amount <= 0 || targetPrice <= 0) return state;

  const curSpot = state.spotExchange || { orders: [], trades: [], candles: {}, lastPrices: {}, stats: {} };
  if (clientOrderId && (curSpot.orders || []).some(o => o.clientOrderId === clientOrderId)) {
    return state;
  }

  const currentCredits = state.credits || 0;
  let newCredits = currentCredits;
  const targetPlanetId = destinationPlanetId || planetId || state.currentPlanetId;
  const access = checkPhysicalAccess(state, targetPlanetId);
  if (!access.hasAccess) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 ${access.reason}`,
        timestamp: Date.now()
      }]
    };
  }
  const currentPlanets = [...(state.planets || [])];
  const planetIndex = currentPlanets.findIndex(p => p.id === targetPlanetId);
  if (planetIndex < 0) return state;
  const targetPlanet = currentPlanets[planetIndex];
  if (!targetPlanet) return state;

  let reservedCredits = 0;
  let reservedResourceAmount = 0;

  if (orderType === 'buy_limit' || orderType === 'buy') {
    const requiredCredits = Math.floor(amount * targetPrice);
    if (currentCredits < requiredCredits) {
      return {
        ...state,
        notifications: [...(state.notifications || []), {
          id: uid(),
          type: 'warning',
          message: `⚠️ Fondos insuficientes para la orden (${fmt(requiredCredits)} ₢ requeridos).`,
          timestamp: Date.now()
        }]
      };
    }
    newCredits -= requiredCredits;
    reservedCredits = requiredCredits;
  } else {
    // Orden de VENTA (Sell): Bloquea los recursos en custodia física
    const currentRes = targetPlanet.resources?.[resource] || 0;
    if (currentRes < amount) {
      return {
        ...state,
        notifications: [...(state.notifications || []), {
          id: uid(),
          type: 'warning',
          message: `⚠️ Recursos insuficientes en ${targetPlanet.name} para colocar orden de venta (${fmt(amount)} ${resource} requeridos).`,
          timestamp: Date.now()
        }]
      };
    }
    // Deducir del inventario disponible y bloquear en custodia de orden
    const updatedPlanet = {
      ...targetPlanet,
      resources: {
        ...(targetPlanet.resources || {}),
        [resource]: Math.max(0, currentRes - amount)
      }
    };
    currentPlanets[planetIndex >= 0 ? planetIndex : 0] = updatedPlanet;
    reservedResourceAmount = amount;
  }

  // Determinar type de orden (limit, market, stop, stop_limit)
  const resolvedType = spotOrderType || (
    (orderType === 'buy' || orderType === 'sell') ? 'market' : 'limit'
  );

  const newOrder = {
    id: uid(),
    ownerId: 'player',
    instrument: resource,
    side: (orderType === 'buy_limit' || orderType === 'buy') ? 'buy' : 'sell',
    type: resolvedType,
    resource,
    amount,
    price: targetPrice,
    targetPrice,
    stopPrice: stopPrice || null,
    limitPrice: limitPrice || null,
    takeProfitPrice: takeProfitPrice || stopPrice || null,
    expiresAt: expiresAt || null,
    clientOrderId: clientOrderId || null,
    filledAmount: 0,
    status: 'OPEN',
    reservedCredits,
    reservedResource: resource,
    reservedResourceAmount,
    hasParkedShip: !!hasParkedShip,
    planetId: targetPlanetId,
    destinationPlanetId: targetPlanetId,
    marketId: targetPlanetId,
    createdAt: state.gameTick || 0,
    tickCreated: state.gameTick || 0
  };

  const updatedSpotOrders = [...(curSpot.orders || []), newOrder];

  return {
    ...state,
    planets: currentPlanets,
    credits: newCredits,
    exchangeOrders: [...(state.exchangeOrders || []), newOrder],
    spotExchange: {
      ...curSpot,
      orders: updatedSpotOrders
    },
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'info',
      message: `📜 Orden Registrada en Libro Spot: ${(orderType === 'buy_limit' || orderType === 'buy') ? 'Comprar' : 'Vender'} ${fmt(amount)} ${resource} @ ${targetPrice} ₢.`,
      timestamp: Date.now()
    }]
  };
};

export const handleCancelLimitOrder = (state, action) => {
  const { orderId } = action;
  const order = (state.exchangeOrders || []).find(o => o.id === orderId) ||
                (state.spotExchange?.orders || []).find(o => o.id === orderId);
  if (!order) return state;

  if (order.status && order.status !== 'OPEN' && order.status !== 'PARTIALLY_FILLED') {
    return state;
  }

  const currentCredits = state.credits || 0;
  const remaining = Math.max(0, (order.amount || 0) - (order.filledAmount || 0));
  const remainingCost = Math.floor((order.price || order.targetPrice || 0) * remaining);
  const refundCredits = order.side === 'buy'
    ? Math.min(order.reservedCredits ?? remainingCost, remainingCost)
    : 0;
  const refundRes = order.reservedResource || order.instrument;
  const remainingResAmount = order.side === 'sell'
    ? Math.max(0, (order.reservedResourceAmount != null
      ? order.reservedResourceAmount
      : remaining))
    : 0;

  let currentPlanets = [...(state.planets || [])];
  if (refundRes && remainingResAmount > 0) {
    const pIndex = currentPlanets.findIndex(p => p.id === (order.planetId || order.destinationPlanetId));
    if (pIndex >= 0) {
      const pl = currentPlanets[pIndex];
      currentPlanets[pIndex] = {
        ...pl,
        resources: {
          ...pl.resources,
          [refundRes]: (pl.resources?.[refundRes] || 0) + remainingResAmount
        }
      };
    }
  }

  const curSpot = state.spotExchange || { orders: [] };
  const updatedSpotOrders = (curSpot.orders || []).map(o => o.id === orderId ? {
    ...o,
    status: 'CANCELLED',
    cancelledAt: Date.now(),
    cancelledBy: 'player',
    cancelReason: action.reason || 'user_cancel'
  } : o);

  return {
    ...state,
    planets: currentPlanets,
    credits: currentCredits + refundCredits,
    exchangeOrders: (state.exchangeOrders || []).filter(o => o.id !== orderId),
    spotExchange: {
      ...curSpot,
      orders: updatedSpotOrders
    },
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'info',
      message: `🚫 Orden Cancelada. Activos devueltos a bóveda (${refundCredits > 0 ? `+${fmt(refundCredits)} ₢` : `+${fmt(remainingResAmount)} ${refundRes}`}).`,
      timestamp: Date.now()
    }]
  };
};

export const handleModifySpotOrder = (state, action) => {
  const { orderId, newPrice, newAmount } = action;
  const priceNum = Number(newPrice);
  const amountNum = Number(newAmount);
  if (!orderId || (priceNum <= 0 && amountNum <= 0)) return state;

  const curSpot = state.spotExchange || { orders: [] };
  const orderIndex = (curSpot.orders || []).findIndex(o => o.id === orderId && o.ownerId === 'player');
  if (orderIndex < 0) return state;

  const targetOrder = curSpot.orders[orderIndex];
  if (targetOrder.status !== 'OPEN' && targetOrder.status !== 'PARTIALLY_FILLED') {
    return state;
  }

  const finalPrice = priceNum > 0 ? priceNum : targetOrder.price;
  const finalAmount = amountNum > 0 ? amountNum : targetOrder.amount;
  if (finalAmount <= (targetOrder.filledAmount || 0)) {
    return state;
  }

  let currentCredits = state.credits || 0;
  let currentPlanets = [...(state.planets || [])];
  let reservedCredits = targetOrder.reservedCredits || 0;
  let reservedResourceAmount = targetOrder.reservedResourceAmount || 0;

  if (targetOrder.side === 'buy') {
    const remainingToBuy = finalAmount - (targetOrder.filledAmount || 0);
    const newTotalRequiredCredits = Math.floor(remainingToBuy * finalPrice);
    const creditDelta = newTotalRequiredCredits - reservedCredits;

    if (creditDelta > 0) {
      if (currentCredits < creditDelta) {
        return {
          ...state,
          notifications: [...(state.notifications || []), {
            id: uid(),
            type: 'warning',
            message: `⚠️ Fondos insuficientes para modificar orden (+${fmt(creditDelta)} ₢ adicionales requeridos).`,
            timestamp: Date.now()
          }]
        };
      }
      currentCredits -= creditDelta;
      reservedCredits += creditDelta;
    } else if (creditDelta < 0) {
      const refundCredits = Math.abs(creditDelta);
      currentCredits += refundCredits;
      reservedCredits -= refundCredits;
    }
  } else {
    // Venta: reajustar recurso bloqueado en el planeta
    const planetIdx = currentPlanets.findIndex(p => p.id === targetOrder.planetId);
    if (planetIdx >= 0) {
      const pl = { ...currentPlanets[planetIdx] };
      pl.resources = { ...(pl.resources || {}) };
      const remainingToSell = finalAmount - (targetOrder.filledAmount || 0);
      const resDelta = remainingToSell - reservedResourceAmount;

      if (resDelta > 0) {
        const available = pl.resources[targetOrder.instrument] || 0;
        if (available < resDelta) {
          return {
            ...state,
            notifications: [...(state.notifications || []), {
              id: uid(),
              type: 'warning',
              message: `⚠️ Recursos insuficientes en ${pl.name} (+${fmt(resDelta)} ${targetOrder.instrument} requeridos).`,
              timestamp: Date.now()
            }]
          };
        }
        pl.resources[targetOrder.instrument] = available - resDelta;
        reservedResourceAmount += resDelta;
      } else if (resDelta < 0) {
        const refundRes = Math.abs(resDelta);
        pl.resources[targetOrder.instrument] = (pl.resources[targetOrder.instrument] || 0) + refundRes;
        reservedResourceAmount -= refundRes;
      }
      currentPlanets[planetIdx] = pl;
    }
  }

  // REGLA ESPEC §18: Toda modificación de precio o aumento de cantidad pierde prioridad y resetea createdAt
  const updatedOrder = {
    ...targetOrder,
    price: finalPrice,
    targetPrice: finalPrice,
    amount: finalAmount,
    reservedCredits,
    reservedResourceAmount,
    createdAt: state.gameTick || 0
  };

  const updatedSpotOrders = [...curSpot.orders];
  updatedSpotOrders[orderIndex] = updatedOrder;

  const updatedExchangeOrders = (state.exchangeOrders || []).map(o => o.id === orderId ? updatedOrder : o);

  return {
    ...state,
    planets: currentPlanets,
    credits: currentCredits,
    exchangeOrders: updatedExchangeOrders,
    spotExchange: {
      ...curSpot,
      orders: updatedSpotOrders
    },
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'info',
      message: `✏️ Orden Modificada: ${fmt(finalAmount)} ${targetOrder.instrument} @ ${finalPrice} ₢ (Prioridad temporal reiniciada).`,
      timestamp: Date.now()
    }]
  };
};

export const handleDispatchSpotArbitrage = (state, action) => {
  const originId = action.originId || action.planetId || state.currentPlanetId;
  const destId = action.destId || action.destinationPlanetId;
  const instrument = action.instrument || action.resource || 'metal';
  const amount = Math.floor(Number(action.amount) || 0);
  const originPlanet = (state.planets || []).find(p => p.id === originId);
  const destPlanet = (state.planets || []).find(p => p.id === destId);
  const estimate = estimateSpotArbitrage({
    state,
    originPlanet,
    destPlanet,
    instrument,
    amount
  });
  if (!estimate.canDispatch) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 Convoy de arbitraje rechazado: ${estimate.reason || 'Condiciones no cumplidas.'}`,
        timestamp: Date.now()
      }]
    };
  }
  const cargo = { metal: 0, crystal: 0, deuterium: 0, [instrument]: amount };
  const next = handleSendFleet(state, {
    fromId: originPlanet.id,
    to: {
      id: destPlanet.id,
      name: destPlanet.name,
      galaxy: destPlanet.galaxy,
      system: destPlanet.system,
      position: destPlanet.position
    },
    fleet: estimate.fleet,
    missionType: 'transport',
    missionSpeed: 10,
    resources: cargo,
    missionMeta: {
      spotArbitrage: true,
      instrument,
      arbitrageAmount: amount
    }
  });
  if (next === state) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: '🚫 Convoy de arbitraje no despachado.',
        timestamp: Date.now()
      }]
    };
  }
  const lastNote = (next.notifications || [])[next.notifications.length - 1];
  if (lastNote && lastNote.type === 'warning') return next;
  return {
    ...next,
    notifications: [...(next.notifications || []), {
      id: uid(),
      type: 'info',
      message: `🚚 Arbitraje físico: ${fmt(amount)} ${instrument} de ${originPlanet.name} hacia ${destPlanet.name}. Combustible ${fmt(estimate.fuel)} ⚗️. El lote se vende en el libro destino al atracar.`,
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

  // Cálculo de dilución matemática y capitalización robusta (Reglas 4, 6 y 7)
  const exchangePlanet = updatedPlanets.find(p => p.id === targetPlanetId || p.isExchangePlanet);
  let updatedCapitalization = exchangePlanet?.lonjaAutonomousState?.capitalization;
  let sharesEarned = Math.max(1, Math.floor(amount / 25000));
  
  if (updatedCapitalization) {
    const capResult = calculateCapitalContribution({
      currentCapitalization: updatedCapitalization,
      contributorId: 'player',
      contributionValue: amount
    });
    updatedCapitalization = capResult;
    const oldShares = exchangePlanet.lonjaAutonomousState.capitalization.shareholders?.['player']?.ordinaryShares || 100;
    const newShares = capResult.shareholders?.['player']?.ordinaryShares || 100;
    sharesEarned = Math.max(1, newShares - oldShares);
  }

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


export const handleVoteDaoProposal = (state, action) => {
  const { proposalId, voteChoice, planetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const planets = [...(state.planets || [])];
  const pIdx = planets.findIndex(p => p.id === targetPlanetId || p.isExchangePlanet);
  if (pIdx === -1) return state;

  const targetPlanet = planets[pIdx];
  if (!targetPlanet.lonjaAutonomousState) return state;

  const updatedLonja = castDaoVote({
    lonjaState: targetPlanet.lonjaAutonomousState,
    proposalId,
    voterId: 'player',
    voteChoice
  });

  planets[pIdx] = {
    ...targetPlanet,
    lonjaAutonomousState: updatedLonja
  };

  return {
    ...state,
    planets,
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'info',
      message: `🗳️ Voto emitido (${voteChoice}) en la propuesta ${proposalId}.`,
      timestamp: Date.now()
    }]
  };
};

export const handleTradeLonjaShares = (state, action) => {
  const { side, shares, price, planetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const planets = [...(state.planets || [])];
  const pIdx = planets.findIndex(p => p.id === targetPlanetId || p.isExchangePlanet);
  if (pIdx === -1) return state;

  const targetPlanet = planets[pIdx];
  if (!targetPlanet.lonjaAutonomousState) return state;

  const totalCost = shares * price;
  const creditsAvail = state.credits || 0;

  if (side === 'BUY' && creditsAvail < totalCost) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: '🚫 Créditos insuficientes para comprar acciones en el mercado secundario.',
        timestamp: Date.now()
      }]
    };
  }

  const result = placeShareOrder({
    lonjaState: targetPlanet.lonjaAutonomousState,
    traderId: 'player',
    side,
    shares,
    price,
    creditsAvailable: creditsAvail
  });

  if (!result.success) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 ${result.reason}`,
        timestamp: Date.now()
      }]
    };
  }

  planets[pIdx] = {
    ...targetPlanet,
    lonjaAutonomousState: result.lonjaState
  };

  let newCredits = creditsAvail;
  if (side === 'BUY') {
    newCredits -= totalCost;
  }

  const playerOrdinary = result.lonjaState.capitalization?.shareholders?.['player']?.ordinaryShares || 100;

  return {
    ...state,
    credits: newCredits,
    planets,
    playerDaoShares: playerOrdinary,
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `📈 Orden de ${side === 'BUY' ? 'compra' : 'venta'} de ${shares} acciones registrada a ₢ ${fmt(price)} c/u.`,
      timestamp: Date.now()
    }]
  };
};


export const handleDepositToVault = (state, action) => {
  const { resource, amount, planetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const planets = [...(state.planets || [])];
  const pIdx = planets.findIndex(p => p.id === targetPlanetId || p.isExchangePlanet);
  if (pIdx === -1) return state;

  const lonjaPlanet = planets[pIdx];
  if (!lonjaPlanet.lonjaAutonomousState) return state;

  const available = lonjaPlanet.resources?.[resource] || 0;
  if (available < amount) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 Recursos insuficientes en ${lonjaPlanet.name} para depositar en custodia.`,
        timestamp: Date.now()
      }]
    };
  }

  const res = depositToClientVault({
    lonjaState: lonjaPlanet.lonjaAutonomousState,
    clientId: 'player',
    resource,
    amount
  });

  if (!res.success) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 ${res.reason}`,
        timestamp: Date.now()
      }]
    };
  }

  // Deducir del inventario del planeta
  planets[pIdx] = {
    ...lonjaPlanet,
    resources: {
      ...lonjaPlanet.resources,
      [resource]: Math.max(0, available - amount)
    },
    lonjaAutonomousState: res.lonjaState
  };

  return {
    ...state,
    planets,
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `🏦 ${fmt(amount)} de ${resource} depositados bajo custodia en las Bóvedas Subterráneas.`,
      timestamp: Date.now()
    }]
  };
};

export const handleContractFreight = (state, action) => {
  const { resource, amount, destinationPlanetId, planetId } = action;
  const planets = [...(state.planets || [])];
  const lonjaIdx = planets.findIndex(p => p.id === (planetId || state.currentPlanetId) || p.isExchangePlanet);
  const destPlanet = planets.find(p => p.id === destinationPlanetId);

  if (lonjaIdx === -1 || !destPlanet) return state;
  const lonjaPlanet = planets[lonjaIdx];
  if (!lonjaPlanet.lonjaAutonomousState) return state;

  const res = scheduleFreightTransport({
    lonjaState: lonjaPlanet.lonjaAutonomousState,
    clientId: 'player',
    destinationPlanet: destPlanet,
    resource,
    amount,
    distanceParsecs: 12
  });

  if (!res.success) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 ${res.reason}`,
        timestamp: Date.now()
      }]
    };
  }

  const creditsAvail = state.credits || 0;
  if (creditsAvail < res.freightCost) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 Créditos insuficientes para abonar el flete (₢ ${fmt(res.freightCost)}).`,
        timestamp: Date.now()
      }]
    };
  }

  planets[lonjaIdx] = {
    ...lonjaPlanet,
    lonjaAutonomousState: res.lonjaState
  };

  return {
    ...state,
    credits: creditsAvail - res.freightCost,
    planets,
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `🚚 Flete comercial despachado hacia ${destPlanet.name}: ${fmt(amount)} de ${resource} en tránsito.`,
      timestamp: Date.now()
    }]
  };
};
