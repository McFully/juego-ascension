import { uid, fmt } from '../../utils/formulas.js';
import { MARKET_BASE_VALUES } from '../../data/galacticMarketData.js';

/**
 * processExchangeOrdersTick — Procesa las órdenes Limit activas y cobra tarifas de parking en el Planeta Lonja.
 * Se ejecuta en cada ciclo de tick.
 */
export const processExchangeOrdersTick = (state) => {
  const exchangePlanet = (state.planets || []).find(p => p.isExchangePlanet);
  if (!exchangePlanet) return state;

  const orders = state.exchangeOrders || [];
  if (orders.length === 0) return state;

  let newState = { ...state };
  let currentCredits = newState.credits || 0;
  let remainingOrders = [];
  let notifications = [...(newState.notifications || [])];
  let dividendPoolDelta = 0;

  // Precios de mercado actuales (con leve fluctuación pseudo-orgánica basada en el tick)
  const tickFactor = 1 + (Math.sin((state.gameTick || 0) * 0.05) * 0.04);
  const currentPrices = {
    metal: Number(((MARKET_BASE_VALUES.metal || 1.0) * tickFactor).toFixed(2)),
    crystal: Number(((MARKET_BASE_VALUES.crystal || 1.65) * tickFactor).toFixed(2)),
    deuterium: Number(((MARKET_BASE_VALUES.deuterium || 3.3) * tickFactor).toFixed(2))
  };

  const docksLevel = exchangePlanet.buildings?.exchangeDocks || 1;
  const parkingFeePerTick = Math.max(10, Math.floor(50 / docksLevel)); // Más nivel de docks = menor coste de parking

  for (const order of orders) {
    // 1. Cobro de tarifa de parking si tiene naves atracadas
    if (order.hasParkedShip && currentCredits >= parkingFeePerTick) {
      currentCredits -= parkingFeePerTick;
      dividendPoolDelta += parkingFeePerTick; // Las tarifas de parking van al pozo del DAO
    }

    const marketPrice = currentPrices[order.resource] || 1;
    let isTriggered = false;

    // 2. Condición de disparo
    if (order.type === 'buy_limit' && marketPrice <= order.targetPrice) {
      // Se compra al precio objetivo o mejor
      isTriggered = true;
      const totalCost = Math.floor(order.amount * marketPrice);
      // Los créditos ya fueron bloqueados o se pagan ahora
      const targetPlanet = newState.planets.find(p => p.id === (order.destinationPlanetId || exchangePlanet.id)) || exchangePlanet;
      
      targetPlanet.resources = {
        ...targetPlanet.resources,
        [order.resource]: (targetPlanet.resources[order.resource] || 0) + order.amount
      };

      // Si sobró saldo respecto al precio reservado, se le devuelve al jugador
      const refund = Math.max(0, (order.reservedCredits || totalCost) - totalCost);
      currentCredits += refund;

      // Comisión al DAO (2%)
      const fee = Math.floor(totalCost * 0.02);
      dividendPoolDelta += fee;

      notifications.push({
        id: uid(),
        type: 'success',
        message: `📈 Orden Limit Ejecutada: Se compraron ${fmt(order.amount)} de ${order.resource} a ${marketPrice} ₢ en la Lonja. Nave liberada de atraque.`,
        timestamp: Date.now()
      });
    } else if (order.type === 'sell_limit' && marketPrice >= order.targetPrice) {
      // Se vende al precio objetivo o mejor
      isTriggered = true;
      const grossCredits = Math.floor(order.amount * marketPrice);
      const fee = Math.floor(grossCredits * 0.02);
      const netCredits = grossCredits - fee;

      currentCredits += netCredits;
      dividendPoolDelta += fee;

      notifications.push({
        id: uid(),
        type: 'success',
        message: `📉 Orden Limit Ejecutada: Se vendieron ${fmt(order.amount)} de ${order.resource} a ${marketPrice} ₢ en la Lonja (+${fmt(netCredits)} ₢ netos).`,
        timestamp: Date.now()
      });
    }

    if (!isTriggered) {
      remainingOrders.push(order);
    }
  }

  newState.credits = currentCredits;
  newState.exchangeOrders = remainingOrders;
  newState.notifications = notifications;
  newState.daoDividendPool = (newState.daoDividendPool || 250000) + dividendPoolDelta;

  return newState;
};
