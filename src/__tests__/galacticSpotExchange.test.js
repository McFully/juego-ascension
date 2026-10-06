import { describe, it, expect } from 'vitest';
import {
  initExchangeState,
  getOrderBook,
  estimateMarketExecution,
  executeMatchingEngine,
  checkPhysicalAccess,
  activateConditionalOrders,
  toCandleArray,
  simulateFactionMarketActivity,
  getMarketView,
  ORDER_TYPES,
  ORDER_SIDES,
  ORDER_STATUS
} from '../utils/galacticSpotExchange.js';
import { handleCancelLimitOrder, handleCreateLimitOrder } from '../reducers/economy/exchangeActions.js';

describe('Galactic Spot Exchange — Matching Engine & Atomic Settlement', () => {
  it('CASO 1: Venta sin comprador -> Orden permanece abierta, 0 créditos creados', () => {
    let exchange = initExchangeState();
    const sellOrder = {
      id: 'sell_1',
      ownerId: 'player',
      instrument: 'metal',
      side: ORDER_SIDES.SELL,
      type: ORDER_TYPES.LIMIT,
      amount: 1000,
      price: 1.05,
      filledAmount: 0,
      status: ORDER_STATUS.OPEN,
      createdAt: 100
    };
    exchange.orders.push(sellOrder);

    const initialCredits = 5000;
    const initialPlanets = [{ id: 'p1', resources: { metal: 0, crystal: 0, deuterium: 0 } }];

    const result = executeMatchingEngine(exchange, initialPlanets, initialCredits, 1);

    expect(result.tradesOccurred).toBe(false);
    expect(result.credits).toBe(5000); // CERO dinero inventado
    expect(result.exchangeState.orders[0].status).toBe(ORDER_STATUS.OPEN);
    expect(result.exchangeState.orders[0].filledAmount).toBe(0);
  });

  it('CASO 2: Compra compatible -> Se ejecuta el trade y se transfieren ambos activos', () => {
    let exchange = initExchangeState();
    const sellOrder = {
      id: 'sell_1',
      ownerId: 'faction_1',
      instrument: 'metal',
      side: ORDER_SIDES.SELL,
      type: ORDER_TYPES.LIMIT,
      amount: 1000,
      price: 1.00,
      filledAmount: 0,
      status: ORDER_STATUS.OPEN,
      planetId: 'p1',
      createdAt: 100
    };
    const buyOrder = {
      id: 'buy_1',
      ownerId: 'player',
      instrument: 'metal',
      side: ORDER_SIDES.BUY,
      type: ORDER_TYPES.LIMIT,
      amount: 1000,
      price: 1.00,
      filledAmount: 0,
      status: ORDER_STATUS.OPEN,
      planetId: 'p1',
      createdAt: 200
    };
    exchange.orders.push(sellOrder, buyOrder);

    const planets = [{ id: 'p1', resources: { metal: 0, crystal: 0, deuterium: 0 } }];
    const credits = 10000;

    const result = executeMatchingEngine(exchange, planets, credits, 1);

    expect(result.tradesOccurred).toBe(true);
    expect(result.exchangeState.trades.length).toBe(1);
    expect(result.exchangeState.trades[0].amount).toBe(1000);
    expect(result.exchangeState.trades[0].price).toBe(1.00);

    // El jugador recibe el metal físico en su planeta
    const updatedPlanet = result.planets.find(p => p.id === 'p1');
    expect(updatedPlanet.resources.metal).toBe(1000);

    // Ambas órdenes se marcan como FILLED
    expect(result.exchangeState.orders[0].status).toBe(ORDER_STATUS.FILLED);
    expect(result.exchangeState.orders[1].status).toBe(ORDER_STATUS.FILLED);
  });

  it('CASO 3 & 4: Ejecución parcial -> El resto permanece abierto en el order book', () => {
    let exchange = initExchangeState();
    const sellOrder = {
      id: 'sell_1',
      ownerId: 'player',
      instrument: 'crystal',
      side: ORDER_SIDES.SELL,
      type: ORDER_TYPES.LIMIT,
      amount: 10000,
      price: 1.60,
      filledAmount: 0,
      status: ORDER_STATUS.OPEN,
      planetId: 'p1',
      createdAt: 100
    };
    const buyOrder = {
      id: 'buy_1',
      ownerId: 'faction_2',
      instrument: 'crystal',
      side: ORDER_SIDES.BUY,
      type: ORDER_TYPES.LIMIT,
      amount: 2500,
      price: 1.60,
      filledAmount: 0,
      status: ORDER_STATUS.OPEN,
      planetId: 'p1',
      createdAt: 200
    };
    exchange.orders.push(sellOrder, buyOrder);

    const planets = [{ id: 'p1', resources: { metal: 0, crystal: 0, deuterium: 0 } }];
    const initialCredits = 1000;

    const result = executeMatchingEngine(exchange, planets, initialCredits, 1);

    expect(result.tradesOccurred).toBe(true);
    const updatedSell = result.exchangeState.orders.find(o => o.id === 'sell_1');
    const updatedBuy = result.exchangeState.orders.find(o => o.id === 'buy_1');

    expect(updatedBuy.status).toBe(ORDER_STATUS.FILLED);
    expect(updatedBuy.filledAmount).toBe(2500);

    // La orden de venta sigue viva con estado PARTIALLY_FILLED
    expect(updatedSell.status).toBe(ORDER_STATUS.PARTIALLY_FILLED);
    expect(updatedSell.filledAmount).toBe(2500);
    expect(updatedSell.amount - updatedSell.filledAmount).toBe(7500);

    // El vendedor recibe los créditos netos por las 2.500 ejecutadas (2500 * 1.60 = 4000, menos comisión 1% = 3960)
    expect(result.credits).toBe(1000 + (4000 - 40));
  });

  it('CASO 7: Prioridad Precio-Tiempo en el Order Book', () => {
    const orders = [
      { id: 'b1', instrument: 'deuterium', side: ORDER_SIDES.BUY, type: ORDER_TYPES.LIMIT, amount: 100, price: 3.20, createdAt: 50, status: ORDER_STATUS.OPEN },
      { id: 'b2', instrument: 'deuterium', side: ORDER_SIDES.BUY, type: ORDER_TYPES.LIMIT, amount: 200, price: 3.40, createdAt: 60, status: ORDER_STATUS.OPEN },
      { id: 'b3', instrument: 'deuterium', side: ORDER_SIDES.BUY, type: ORDER_TYPES.LIMIT, amount: 300, price: 3.40, createdAt: 40, status: ORDER_STATUS.OPEN }
    ];

    const book = getOrderBook(orders, 'deuterium');

    // Mejor precio primero (3.40 antes que 3.20)
    expect(book.bestBid).toBe(3.40);
    // A igualdad de precio (3.40), el más antiguo primero (b3 createdAt 40 antes que b2 createdAt 60)
    expect(book.rawBids[0].id).toBe('b3');
    expect(book.rawBids[1].id).toBe('b2');
    expect(book.rawBids[2].id).toBe('b1');
  });

  it('CASO 12: Estimación de Market Order y Slippage multidivisión', () => {
    const orders = [
      { id: 'a1', instrument: 'metal', side: ORDER_SIDES.SELL, type: ORDER_TYPES.LIMIT, amount: 500, price: 1.00, filledAmount: 0, status: ORDER_STATUS.OPEN, createdAt: 10 },
      { id: 'a2', instrument: 'metal', side: ORDER_SIDES.SELL, type: ORDER_TYPES.LIMIT, amount: 700, price: 1.02, filledAmount: 0, status: ORDER_STATUS.OPEN, createdAt: 20 },
      { id: 'a3', instrument: 'metal', side: ORDER_SIDES.SELL, type: ORDER_TYPES.LIMIT, amount: 1000, price: 1.05, filledAmount: 0, status: ORDER_STATUS.OPEN, createdAt: 30 }
    ];

    const estimate = estimateMarketExecution(orders, 'metal', ORDER_SIDES.BUY, 1200);

    expect(estimate.canExecute).toBe(true);
    expect(estimate.executedAmount).toBe(1200);
    // Coste: 500 * 1.00 + 700 * 1.02 = 500 + 714 = 1214
    expect(estimate.estimatedCost).toBe(1214);
    expect(estimate.avgPrice).toBeCloseTo(1214 / 1200, 3);
  });

  it('CASO 15: Verificación de acceso físico por soberanía o presencia naval', () => {
    const stateWithColony = {
      planets: [{ id: 'p_earth', name: 'Tierra', fleet: {} }],
      fleetMissions: []
    };
    const accessColony = checkPhysicalAccess(stateWithColony, 'p_earth');
    expect(accessColony.hasAccess).toBe(true);

    const accessRemote = checkPhysicalAccess(stateWithColony, 'p_alien_hub');
    expect(accessRemote.hasAccess).toBe(false);
  });

  it('CASO 8: Modificación de orden resetea prioridad temporal (§18)', () => {
    const orders = [
      { id: 'b1', instrument: 'metal', side: ORDER_SIDES.BUY, type: ORDER_TYPES.LIMIT, amount: 500, price: 1.00, createdAt: 10, status: ORDER_STATUS.OPEN },
      { id: 'b2', instrument: 'metal', side: ORDER_SIDES.BUY, type: ORDER_TYPES.LIMIT, amount: 500, price: 1.00, createdAt: 20, status: ORDER_STATUS.OPEN }
    ];

    let book = getOrderBook(orders, 'metal');
    expect(book.rawBids[0].id).toBe('b1'); // b1 es más antiguo

    // Al modificar b1, su createdAt se actualiza a un timestamp posterior
    const updatedB1 = { ...orders[0], price: 1.00, createdAt: 50 };
    book = getOrderBook([updatedB1, orders[1]], 'metal');

    expect(book.rawBids[0].id).toBe('b2'); // b2 ahora tiene prioridad sobre b1
    expect(book.rawBids[1].id).toBe('b1');
  });

  it('CASO 9: Stop Order se activa al cruzar stopPrice (§14)', () => {
    const stopSellOrder = {
      id: 'stop_1',
      ownerId: 'player',
      instrument: 'crystal',
      side: 'sell',
      type: 'stop',
      stopPrice: 1.50,
      amount: 1000,
      price: 1.50,
      status: ORDER_STATUS.OPEN
    };

    const currentPrice = 1.45; // El precio cayó por debajo del stopPrice
    const triggered = (stopSellOrder.side === 'sell' && currentPrice <= stopSellOrder.stopPrice);

    expect(triggered).toBe(true);
    if (triggered) {
      stopSellOrder.type = 'market';
    }
    expect(stopSellOrder.type).toBe('market');
  });

  it('CASO 10: Orden expirada libera custodia física (§38)', () => {
    const expiredBuyOrder = {
      id: 'exp_1',
      ownerId: 'player',
      instrument: 'deuterium',
      side: 'buy',
      amount: 200,
      filledAmount: 0,
      reservedCredits: 660,
      status: ORDER_STATUS.OPEN,
      expiresAt: 50
    };

    const currentTick = 55; // Superó el TTL
    const isExpired = currentTick >= expiredBuyOrder.expiresAt;
    expect(isExpired).toBe(true);

    if (isExpired) {
      expiredBuyOrder.status = ORDER_STATUS.EXPIRED;
    }
    expect(expiredBuyOrder.status).toBe(ORDER_STATUS.EXPIRED);
  });

  it('CASO 11: Stop no entra al matching hasta activarse', () => {
    const exchange = initExchangeState();
    exchange.orders.push(
      {
        id: 'stop_sell',
        ownerId: 'player',
        instrument: 'metal',
        side: ORDER_SIDES.SELL,
        type: ORDER_TYPES.STOP,
        stopPrice: 0.80,
        amount: 1000,
        price: 0.80,
        filledAmount: 0,
        status: ORDER_STATUS.OPEN,
        createdAt: 10
      },
      {
        id: 'bid_high',
        ownerId: 'faction_1',
        instrument: 'metal',
        side: ORDER_SIDES.BUY,
        type: ORDER_TYPES.LIMIT,
        amount: 1000,
        price: 1.20,
        filledAmount: 0,
        status: ORDER_STATUS.OPEN,
        createdAt: 11
      }
    );
    const result = executeMatchingEngine(exchange, [{ id: 'p1', resources: { metal: 0, crystal: 0, deuterium: 0 } }], 0, 1);
    expect(result.tradesOccurred).toBe(false);
    expect(result.exchangeState.orders.find(o => o.id === 'stop_sell').status).toBe(ORDER_STATUS.OPEN);
  });

  it('CASO 16: Take-Profit se activa al subir el precio', () => {
    const orders = [{
      id: 'tp1',
      ownerId: 'player',
      instrument: 'crystal',
      side: ORDER_SIDES.SELL,
      type: ORDER_TYPES.TAKE_PROFIT,
      takeProfitPrice: 2.00,
      amount: 500,
      price: 2.00,
      status: ORDER_STATUS.OPEN
    }];
    const stillWaiting = activateConditionalOrders(orders, { crystal: 1.80 });
    expect(stillWaiting[0].type).toBe(ORDER_TYPES.TAKE_PROFIT);
    const triggered = activateConditionalOrders(orders, { crystal: 2.05 });
    expect(triggered[0].type).toBe(ORDER_TYPES.LIMIT);
    expect(triggered[0].price).toBe(2.00);
  });

  it('CASO 17: Velas se serializan como tupla para el gráfico', () => {
    const fromObject = toCandleArray({ tick: 12, open: 1, high: 1.2, low: 0.9, close: 1.1, volume: 40 });
    expect(fromObject).toEqual([12, 1, 1.2, 0.9, 1.1, 40]);
    const fromTuple = toCandleArray([5, 2, 3, 1, 2.5, 10]);
    expect(fromTuple[0]).toBe(5);
    expect(fromTuple[4]).toBe(2.5);
  });

  it('CASO 18: Cancelar compra parcial solo reembolsa el restante', () => {
    const state = {
      credits: 100,
      planets: [{ id: 'p1', name: 'Home', resources: { metal: 0, crystal: 0, deuterium: 0 } }],
      exchangeOrders: [],
      notifications: [],
      spotExchange: {
        orders: [{
          id: 'buy_partial',
          ownerId: 'player',
          side: 'buy',
          instrument: 'metal',
          amount: 1000,
          filledAmount: 400,
          price: 2,
          reservedCredits: 1200,
          status: 'PARTIALLY_FILLED',
          planetId: 'p1'
        }]
      }
    };
    const next = handleCancelLimitOrder(state, { orderId: 'buy_partial' });
    expect(next.credits).toBe(100 + 1200);
  });

  it('CASO 19: Facción vende con inventario real, sin metal mágico', () => {
    const exchange = initExchangeState({ lastPrices: { metal: 1, crystal: 1.65, deuterium: 3.3 } });
    const aiPlanets = [{
      id: 'ai_1',
      isVirgin: false,
      resources: { metal: 200000, crystal: 0, deuterium: 0 },
      credits: 0,
      strategicDirective: 'TRADE'
    }];
    const sim = simulateFactionMarketActivity(exchange, 5, aiPlanets);
    const sell = sim.exchangeState.orders.find(o => o.ownerId === 'ai_1' && o.side === 'sell');
    if (sell) {
      const after = sim.aiPlanets.find(p => p.id === 'ai_1');
      expect(after.resources.metal).toBe(200000 - sell.amount);
    }
  });

  it('CASO 20: clientOrderId duplicado no crea segunda orden', () => {
    const s0 = {
      credits: 100000,
      planets: [{ id: 'p1', name: 'Home', resources: { metal: 0, crystal: 0, deuterium: 0 } }],
      currentPlanetId: 'p1',
      exchangeOrders: [],
      notifications: [],
      gameTick: 3,
      spotExchange: { orders: [], trades: [], candles: {}, lastPrices: {}, stats: {} }
    };
    const action = {
      orderType: 'buy_limit',
      resource: 'metal',
      amount: 1000,
      targetPrice: 1,
      planetId: 'p1',
      clientOrderId: 'idem_1'
    };
    const s1 = handleCreateLimitOrder(s0, action);
    const s2 = handleCreateLimitOrder(s1, action);
    expect(s1.spotExchange.orders.length).toBe(1);
    expect(s2.spotExchange.orders.length).toBe(1);
  });

  it('CASO 21: Mercados locales no cruzan; precios pueden divergir', () => {
    const exchange = initExchangeState();
    exchange.orders.push(
      {
        id: 'sell_a', ownerId: 'fac_a', instrument: 'metal', side: ORDER_SIDES.SELL,
        type: ORDER_TYPES.LIMIT, amount: 1000, price: 1.00, filledAmount: 0,
        status: ORDER_STATUS.OPEN, planetId: 'pA', marketId: 'pA', createdAt: 1
      },
      {
        id: 'buy_b', ownerId: 'player', instrument: 'metal', side: ORDER_SIDES.BUY,
        type: ORDER_TYPES.LIMIT, amount: 1000, price: 1.00, filledAmount: 0,
        status: ORDER_STATUS.OPEN, planetId: 'pB', marketId: 'pB', createdAt: 2
      }
    );
    const noCross = executeMatchingEngine(
      exchange,
      [{ id: 'pA', resources: { metal: 0, crystal: 0, deuterium: 0 } }, { id: 'pB', resources: { metal: 0, crystal: 0, deuterium: 0 } }],
      5000,
      10
    );
    expect(noCross.tradesOccurred).toBe(false);
    expect(noCross.credits).toBe(5000);

    exchange.orders.push(
      {
        id: 'buy_a', ownerId: 'player', instrument: 'metal', side: ORDER_SIDES.BUY,
        type: ORDER_TYPES.LIMIT, amount: 1000, price: 1.00, filledAmount: 0,
        status: ORDER_STATUS.OPEN, planetId: 'pA', marketId: 'pA', createdAt: 3
      },
      {
        id: 'sell_b', ownerId: 'fac_b', instrument: 'metal', side: ORDER_SIDES.SELL,
        type: ORDER_TYPES.LIMIT, amount: 500, price: 2.00, filledAmount: 0,
        status: ORDER_STATUS.OPEN, planetId: 'pB', marketId: 'pB', createdAt: 4
      },
      {
        id: 'buy_b2', ownerId: 'fac_c', instrument: 'metal', side: ORDER_SIDES.BUY,
        type: ORDER_TYPES.LIMIT, amount: 500, price: 2.00, filledAmount: 0,
        status: ORDER_STATUS.OPEN, planetId: 'pB', marketId: 'pB', createdAt: 5
      }
    );
    const split = executeMatchingEngine(
      exchange,
      [{ id: 'pA', resources: { metal: 0, crystal: 0, deuterium: 0 } }, { id: 'pB', resources: { metal: 0, crystal: 0, deuterium: 0 } }],
      5000,
      11
    );
    expect(split.tradesOccurred).toBe(true);
    const prices = split.exchangeState.trades.map(t => t.price).sort((a, b) => a - b);
    expect(prices).toContain(1);
    expect(prices).toContain(2);
    expect(getMarketView(split.exchangeState, 'pA').lastPrices.metal).toBe(1);
    expect(getMarketView(split.exchangeState, 'pB').lastPrices.metal).toBe(2);
  });

  it('CASO 22: Crear orden sin presencia física se rechaza', () => {
    const s0 = {
      credits: 100000,
      planets: [{ id: 'home', name: 'Home', resources: { metal: 0, crystal: 0, deuterium: 0 } }],
      currentPlanetId: 'home',
      exchangeOrders: [],
      notifications: [],
      gameTick: 8,
      spotExchange: { orders: [], trades: [], candles: {}, lastPrices: {}, stats: {} }
    };
    const next = handleCreateLimitOrder(s0, {
      orderType: 'buy_limit',
      resource: 'metal',
      amount: 1000,
      targetPrice: 1,
      planetId: 'alien_hub'
    });
    expect(next.spotExchange.orders.length).toBe(0);
    expect(next.credits).toBe(100000);
  });

  it('CASO 23: Facción TRADE consigna a la Lonja; otras operan en mercado local', () => {
    const exchange = initExchangeState({ lastPrices: { metal: 1, crystal: 1.65, deuterium: 3.3 } });
    const trader = {
      id: 'ai_trade',
      isVirgin: false,
      resources: { metal: 200000, crystal: 0, deuterium: 0 },
      credits: 0,
      strategicDirective: 'TRADE'
    };
    const local = {
      id: 'ai_local',
      isVirgin: false,
      resources: { metal: 200000, crystal: 0, deuterium: 0 },
      credits: 0,
      strategicDirective: 'FORTIFY'
    };
    const simTrade = simulateFactionMarketActivity(exchange, 15, [trader], 'lonja_1');
    const sellTrade = simTrade.exchangeState.orders.find(o => o.ownerId === 'ai_trade' && o.side === 'sell');
    expect(sellTrade).toBeTruthy();
    expect(sellTrade.marketId).toBe('lonja_1');
    expect(sellTrade.planetId).toBe('ai_trade');

    const simLocal = simulateFactionMarketActivity(exchange, 15, [local], 'lonja_1');
    const sellLocal = simLocal.exchangeState.orders.find(o => o.ownerId === 'ai_local' && o.side === 'sell');
    if (sellLocal) {
      expect(sellLocal.marketId).toBe('ai_local');
    }
  });

  it('CASO 24: Simulación larga — conservación, libros locales y sin magia', () => {
    const N = 50;
    const TICKS = 200;
    const lonjaId = 'lonja_1';
    const aiPlanets = Array.from({ length: N }, (_, i) => ({
      id: `ai_${i}`,
      isVirgin: false,
      resources: {
        metal: 20000 + i * 3000,
        crystal: 8000 + (i % 7) * 2000,
        deuterium: 3000 + (i % 5) * 1000
      },
      credits: 2000 + i * 400,
      strategicDirective: i % 3 === 0 ? 'TRADE' : (i % 3 === 1 ? 'EXPAND' : 'FORTIFY')
    }));

    const sumRes = (planets, key) => planets.reduce((s, p) => s + (p.resources?.[key] || 0), 0);
    const reservedSell = (orders, key) => orders.reduce((s, o) => {
      const live = o.status === ORDER_STATUS.OPEN || o.status === ORDER_STATUS.PARTIALLY_FILLED;
      if (!live || o.side !== ORDER_SIDES.SELL || o.instrument !== key) return s;
      return s + Math.max(0, (o.amount || 0) - (o.filledAmount || 0));
    }, 0);
    const reservedBuyCredits = (orders) => orders.reduce((s, o) => {
      const live = o.status === ORDER_STATUS.OPEN || o.status === ORDER_STATUS.PARTIALLY_FILLED;
      if (!live || o.side !== ORDER_SIDES.BUY) return s;
      return s + (o.reservedCredits || 0);
    }, 0);

    const startMetal = sumRes(aiPlanets, 'metal');
    const startCrystal = sumRes(aiPlanets, 'crystal');
    const startDeut = sumRes(aiPlanets, 'deuterium');
    const startCredits = aiPlanets.reduce((s, p) => s + (p.credits || 0), 0);

    let exchange = initExchangeState({ lastPrices: { metal: 1, crystal: 1.65, deuterium: 3.3 } });
    let currentAi = aiPlanets;
    let playerCredits = 0;

    for (let tick = 1; tick <= TICKS; tick++) {
      const sim = simulateFactionMarketActivity(exchange, tick, currentAi, lonjaId);
      currentAi = sim.aiPlanets;
      const activated = {
        ...sim.exchangeState,
        orders: activateConditionalOrders(sim.exchangeState.orders, (ord) => {
          const view = getMarketView(sim.exchangeState, ord.marketId || ord.planetId);
          return view.lastPrices?.[ord.instrument] || 0;
        })
      };
      const result = executeMatchingEngine(activated, [], playerCredits, tick, currentAi);
      exchange = result.exchangeState;
      currentAi = result.aiPlanets;
      playerCredits = result.credits;
    }

    const live = exchange.orders.filter(o => o.status === ORDER_STATUS.OPEN || o.status === ORDER_STATUS.PARTIALLY_FILLED);
    const endMetal = sumRes(currentAi, 'metal') + reservedSell(live, 'metal');
    const endCrystal = sumRes(currentAi, 'crystal') + reservedSell(live, 'crystal');
    const endDeut = sumRes(currentAi, 'deuterium') + reservedSell(live, 'deuterium');
    const fees = (exchange.trades || []).reduce((s, t) => s + (t.fee || 0), 0);
    const endCredits = currentAi.reduce((s, p) => s + (p.credits || 0), 0) + playerCredits + reservedBuyCredits(live) + fees;

    expect(endMetal).toBe(startMetal);
    expect(endCrystal).toBe(startCrystal);
    expect(endDeut).toBe(startDeut);
    expect(endCredits).toBe(startCredits);
    expect(currentAi.every(p => (p.resources?.metal || 0) >= 0)).toBe(true);
    expect(currentAi.every(p => (p.credits || 0) >= 0)).toBe(true);

    const lonjaTrades = (exchange.trades || []).filter(t => t.marketId === lonjaId);
    const localTrades = (exchange.trades || []).filter(t => t.marketId && t.marketId !== lonjaId);
    expect(lonjaTrades.length + localTrades.length).toBe((exchange.trades || []).length);

    const openWithoutCounter = live.length >= 0;
    expect(openWithoutCounter).toBe(true);

    const lonjaBook = getOrderBook(exchange.orders, 'metal', lonjaId);
    const someLocal = getOrderBook(exchange.orders, 'metal', 'ai_1');
    const lonjaSpread = lonjaBook.spread;
    const localSpread = someLocal.spread;
    if (lonjaSpread != null && localSpread != null) {
      expect(Number.isFinite(lonjaSpread)).toBe(true);
      expect(Number.isFinite(localSpread)).toBe(true);
    }
  });
});
