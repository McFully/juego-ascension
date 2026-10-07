import { processMarketMakerTick } from '../../utils/galacticLonjaMarketMaker.js';
import { recordTreasuryLedger, assessLonjaHealth } from '../../utils/galacticLonjaAutonomousCore.js';
import { uid, fmt } from '../../utils/formulas.js';
import {
  executeMatchingEngine,
  initExchangeState,
  ORDER_STATUS,
  activateConditionalOrders,
  simulateFactionMarketActivity,
  getMarketView,
  resolveMarketId
} from '../../utils/galacticSpotExchange.js';

/**
 * processExchangeOrdersTick — Matching real por tick.
 * Facciones colocan órdenes; el motor liquida. Cobra parking en la Lonja.
 */
export const processExchangeOrdersTick = (state) => {
  const exchangePlanet = (state.planets || []).find(p => p.isExchangePlanet);
  const currentTick = state.gameTick || 0;

  let spotState = initExchangeState(state.spotExchange);

  if (state.exchangeOrders && state.exchangeOrders.length > 0) {
    const existingIds = new Set((spotState.orders || []).map(o => o.id));
    for (const legacyOrder of state.exchangeOrders) {
      if (!existingIds.has(legacyOrder.id)) {
        spotState.orders.push({
          ...legacyOrder,
          ownerId: legacyOrder.ownerId || 'player',
          instrument: legacyOrder.instrument || legacyOrder.resource,
          side: legacyOrder.side || (legacyOrder.type === 'buy_limit' ? 'buy' : 'sell'),
          type: legacyOrder.type?.includes('limit') ? 'limit' : (legacyOrder.spotOrderType || legacyOrder.type || 'limit'),
          price: legacyOrder.price || legacyOrder.targetPrice,
          filledAmount: legacyOrder.filledAmount || 0,
          status: legacyOrder.status || 'OPEN'
        });
      }
    }
  }

  // 1. Market Maker Autónomo con respaldo real (Fase 07)
  if (exchangePlanet && exchangePlanet.lonjaAutonomousState) {
    const mmResult = processMarketMakerTick({
      lonjaPlanet: exchangePlanet,
      spotState,
      tick: currentTick
    });
    spotState = mmResult.spotState;
    const epIdx = (state.planets || []).findIndex(p => p.id === exchangePlanet.id);
    if (epIdx !== -1 && state.planets) {
      state.planets[epIdx] = mmResult.lonjaPlanet;
    }
  }

  const factionSim = simulateFactionMarketActivity(
    spotState,
    currentTick,
    state.aiPlanets || [],
    exchangePlanet?.id || null
  );
  spotState = factionSim.exchangeState;
  let currentAiPlanets = factionSim.aiPlanets;

  let currentCredits = state.credits || 0;
  let currentPlanets = state.planets ? [...state.planets] : [];
  let dividendPoolDelta = 0;
  if (exchangePlanet) {
    const docksLevel = exchangePlanet.buildings?.exchangeDocks || 1;
    const parkingFeePerTick = Math.max(10, Math.floor(50 / docksLevel));

    for (const ord of spotState.orders) {
      if (ord.ownerId === 'player' && ord.hasParkedShip && ord.status === 'OPEN' && currentCredits >= parkingFeePerTick) {
        currentCredits -= parkingFeePerTick;
        dividendPoolDelta += parkingFeePerTick;
      }
    }
  }

  spotState = {
    ...spotState,
    orders: activateConditionalOrders(spotState.orders, (ord) => {
      const view = getMarketView(spotState, resolveMarketId(ord));
      return view.lastPrices?.[ord.instrument] || 0;
    })
  };

  const newNotifications = [...(state.notifications || [])];
  spotState.orders = (spotState.orders || []).map(ord => {
    if (ord.status !== ORDER_STATUS.OPEN && ord.status !== ORDER_STATUS.PARTIALLY_FILLED) return ord;
    if (!ord.expiresAt) return ord;
    if (currentTick < ord.expiresAt) return ord;

    const remaining = (ord.amount || 0) - (ord.filledAmount || 0);
    if (ord.ownerId === 'player') {
      if (ord.side === 'buy') {
        const refund = ord.reservedCredits != null
          ? ord.reservedCredits
          : Math.floor((ord.reservedCredits || 0) * (remaining / (ord.amount || 1)));
        currentCredits += refund;
        newNotifications.push({
          id: uid(),
          type: 'warning',
          message: `⏰ Orden expirada: ${fmt(remaining)} de ${ord.instrument} (BUY). Reembolso: ${fmt(refund)} ₢.`,
          timestamp: Date.now()
        });
      } else if (ord.side === 'sell' && remaining > 0) {
        const srcPlanetIdx = currentPlanets.findIndex(p => p.id === ord.planetId);
        if (srcPlanetIdx >= 0) {
          const p = { ...currentPlanets[srcPlanetIdx] };
          p.resources = { ...(p.resources || {}) };
          p.resources[ord.instrument] = (p.resources[ord.instrument] || 0) + remaining;
          currentPlanets[srcPlanetIdx] = p;
        }
        newNotifications.push({
          id: uid(),
          type: 'warning',
          message: `⏰ Orden expirada: ${fmt(remaining)} de ${ord.instrument} (SELL) devueltos al planeta.`,
          timestamp: Date.now()
        });
      }
    }
    return { ...ord, status: ORDER_STATUS.EXPIRED };
  });

  const matchResult = executeMatchingEngine(
    spotState,
    currentPlanets,
    currentCredits,
    currentTick,
    currentAiPlanets
  );

  if (matchResult.tradesOccurred) {
    const playerTrades = (matchResult.exchangeState.trades || []).filter(
      t => t.tick === currentTick && (t.buyerId === 'player' || t.sellerId === 'player')
    );

    for (const trade of playerTrades) {
      const isBuy = trade.buyerId === 'player';
      newNotifications.push({
        id: uid(),
        type: 'success',
        message: isBuy
          ? `📈 Ejecución Spot: Comprados ${fmt(trade.amount)} de ${trade.instrument} @ ${trade.price} ₢ en la Lonja.`
          : `📉 Ejecución Spot: Vendidos ${fmt(trade.amount)} de ${trade.instrument} @ ${trade.price} ₢ (+${fmt(trade.total - trade.fee)} ₢ netos).`,
        timestamp: Date.now()
      });
      dividendPoolDelta += trade.fee;
    }
  }

  const playerOpenOrders = (matchResult.exchangeState.orders || []).filter(
    o => o.ownerId === 'player' && (o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED')
  );

  // Actualizar tesorería, comisiones y salud de la entidad autónoma Lonja (Reglas 17, 19, 21 y 22)
  const finalPlanets = (matchResult.planets || []).map(p => {
    if (p.isExchangePlanet && p.lonjaAutonomousState) {
      let t = p.lonjaAutonomousState.treasury;
      if (dividendPoolDelta > 0) {
        t = {
          ...t,
          credits: (t.credits || 0) + dividendPoolDelta,
          distributableProfits: (t.distributableProfits || 0) + Math.floor(dividendPoolDelta * (t.dividendDistributionRate || 0.30))
        };
        t = recordTreasuryLedger(t, {
          origin: 'spot_commissions',
          destination: 'lonja_treasury',
          concept: 'Comisiones de trading spot recaudadas en tick ' + currentTick,
          amount: dividendPoolDelta
        });
      }
      const newHealth = assessLonjaHealth(t);
      return {
        ...p,
        lonjaAutonomousState: {
          ...p.lonjaAutonomousState,
          treasury: t,
          healthState: newHealth
        }
      };
    }
    return p;
  });

  return {
    ...state,
    planets: finalPlanets,
    aiPlanets: matchResult.aiPlanets && matchResult.aiPlanets.length > 0 ? matchResult.aiPlanets : currentAiPlanets,
    credits: matchResult.credits,
    exchangeOrders: playerOpenOrders,
    spotExchange: matchResult.exchangeState,
    notifications: newNotifications,
    daoDividendPool: (state.daoDividendPool || 250000) + dividendPoolDelta
  };
};
