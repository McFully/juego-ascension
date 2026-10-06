/**
 * Galactic Spot Exchange — matching determinista y liquidación atómica.
 * Sin creación artificial de dinero ni recursos.
 */

export const INSTRUMENTS = ['metal', 'crystal', 'deuterium'];
export const FEE_RATE = 0.01;

export const ORDER_TYPES = {
  MARKET: 'market',
  LIMIT: 'limit',
  STOP: 'stop',
  STOP_LIMIT: 'stop_limit',
  TAKE_PROFIT: 'take_profit'
};

export const ORDER_SIDES = {
  BUY: 'buy',
  SELL: 'sell'
};

export const ORDER_STATUS = {
  OPEN: 'OPEN',
  PARTIALLY_FILLED: 'PARTIALLY_FILLED',
  FILLED: 'FILLED',
  CANCELLED: 'CANCELLED',
  TRIGGERED: 'TRIGGERED',
  EXPIRED: 'EXPIRED'
};

const INITIAL_PRICES = {
  metal: 1.00,
  crystal: 1.65,
  deuterium: 3.30
};

const DEFAULT_MARKET = 'galactic';

function defaultStats() {
  return {
    metal: { high: 1.05, low: 0.95, volume: 0, change24h: 0, vwap: 1.00 },
    crystal: { high: 1.70, low: 1.60, volume: 0, change24h: 0, vwap: 1.65 },
    deuterium: { high: 3.40, low: 3.20, volume: 0, change24h: 0, vwap: 3.30 }
  };
}

function emptyMarketSlice(seedPrices = INITIAL_PRICES) {
  return {
    lastPrices: { ...INITIAL_PRICES, ...(seedPrices || {}) },
    candles: { metal: [], crystal: [], deuterium: [] },
    stats: defaultStats()
  };
}

function cloneMarketSlice(slice) {
  const src = slice || emptyMarketSlice();
  return {
    lastPrices: { ...INITIAL_PRICES, ...(src.lastPrices || {}) },
    candles: {
      metal: [...(src.candles?.metal || [])],
      crystal: [...(src.candles?.crystal || [])],
      deuterium: [...(src.candles?.deuterium || [])]
    },
    stats: { ...(src.stats || defaultStats()) }
  };
}

/** Mercado de una orden. Sin magia: A no cruza con B. */
export function resolveMarketId(order) {
  return order?.marketId || order?.planetId || DEFAULT_MARKET;
}

export function getMarketView(exchangeState = {}, marketId = DEFAULT_MARKET) {
  const mid = marketId || DEFAULT_MARKET;
  const markets = exchangeState.markets || {};
  if (markets[mid]) return cloneMarketSlice(markets[mid]);
  if (mid === DEFAULT_MARKET || !markets[DEFAULT_MARKET]) {
    if (exchangeState.lastPrices && typeof exchangeState.lastPrices.metal === 'number') {
      return cloneMarketSlice({
        lastPrices: exchangeState.lastPrices,
        candles: exchangeState.candles,
        stats: exchangeState.stats
      });
    }
  }
  return emptyMarketSlice();
}

export function initExchangeState(existing = {}) {
  const markets = (existing.markets && typeof existing.markets === 'object')
    ? { ...existing.markets }
    : {};
  if (Object.keys(markets).length === 0) {
    markets[DEFAULT_MARKET] = emptyMarketSlice(existing.lastPrices);
    if (existing.candles) markets[DEFAULT_MARKET].candles = {
      metal: [...(existing.candles.metal || [])],
      crystal: [...(existing.candles.crystal || [])],
      deuterium: [...(existing.candles.deuterium || [])]
    };
    if (existing.stats) markets[DEFAULT_MARKET].stats = { ...existing.stats };
  }
  const primary = markets[DEFAULT_MARKET] || markets[Object.keys(markets)[0]] || emptyMarketSlice(existing.lastPrices);
  return {
    orders: existing.orders || [],
    trades: existing.trades || [],
    markets,
    candles: existing.candles || { ...primary.candles },
    lastPrices: existing.lastPrices || { ...primary.lastPrices },
    stats: existing.stats || { ...primary.stats }
  };
}

export function isMatchableOrder(order) {
  if (!order) return false;
  const live = order.status === ORDER_STATUS.OPEN || order.status === ORDER_STATUS.PARTIALLY_FILLED;
  return live && (order.type === ORDER_TYPES.LIMIT || order.type === ORDER_TYPES.MARKET);
}

/** Velas: objeto {tick,open,high,low,close,volume} o tupla [t,o,h,l,c,v]. */
export function toCandleArray(c) {
  if (!c) return null;
  if (Array.isArray(c)) return [c[0] || 0, c[1] || 0, c[2] || 0, c[3] || 0, c[4] || 0, c[5] || 0];
  return [
    c.tick ?? c.time ?? 0,
    Number(c.open) || 0,
    Number(c.high) || 0,
    Number(c.low) || 0,
    Number(c.close) || 0,
    Number(c.volume) || 0
  ];
}

export function checkPhysicalAccess(state, planetId) {
  if (!planetId) return { hasAccess: false, reason: 'Planeta no especificado' };

  const planet = (state.planets || []).find(p => p.id === planetId);
  if (!planet) return { hasAccess: false, reason: 'Planeta no encontrado' };

  const isColony = (state.planets || []).some(p => p.id === planetId);
  if (isColony) {
    return { hasAccess: true, reason: 'Soberanía Imperial directa en este mundo.' };
  }

  const hasLocalFleet = planet.fleet && Object.values(planet.fleet).some(qty => Number(qty) > 0);
  if (hasLocalFleet) {
    return { hasAccess: true, reason: 'Presencia naval acreditada en muelle orbital.' };
  }

  const hasActiveMission = (state.fleetMissions || []).some(
    m => (m.targetPlanetId === planetId || m.originPlanetId === planetId) && m.status === 'in_orbit'
  );
  if (hasActiveMission) {
    return { hasAccess: true, reason: 'Flota en órbita activa sobre la Lonja.' };
  }

  return {
    hasAccess: false,
    reason: 'Acceso denegado: se requiere presencia física (colonia o nave atracada) para operar el parqué spot.'
  };
}

export function getOrderBook(orders = [], instrument, marketPlanetId = null) {
  const activeOrders = orders.filter(o =>
    o.instrument === instrument &&
    isMatchableOrder(o) &&
    (!marketPlanetId || resolveMarketId(o) === marketPlanetId)
  );

  const bids = activeOrders
    .filter(o => o.side === ORDER_SIDES.BUY)
    .sort((a, b) => (b.price - a.price) || (a.createdAt - b.createdAt));

  const asks = activeOrders
    .filter(o => o.side === ORDER_SIDES.SELL)
    .sort((a, b) => (a.price - b.price) || (a.createdAt - b.createdAt));

  const aggregate = (list) => {
    const map = new Map();
    let cumulative = 0;
    for (const ord of list) {
      const remaining = (ord.amount || 0) - (ord.filledAmount || 0);
      if (remaining <= 0) continue;
      const key = Number(ord.price);
      const cur = map.get(key) || { price: key, amount: 0, ordersCount: 0, total: 0 };
      cur.amount += remaining;
      cur.ordersCount += 1;
      cur.total += remaining * key;
      map.set(key, cur);
    }
    const result = Array.from(map.values());
    result.forEach(level => {
      cumulative += level.amount;
      level.cumulative = cumulative;
    });
    return result;
  };

  const bestBid = bids.length > 0 ? bids[0].price : null;
  const bestAsk = asks.length > 0 ? asks[0].price : null;
  const spread = (bestBid != null && bestAsk != null)
    ? Number(Math.max(0, bestAsk - bestBid).toFixed(4))
    : null;

  return {
    rawBids: bids,
    rawAsks: asks,
    bids: aggregate(bids),
    asks: aggregate(asks),
    bestBid,
    bestAsk,
    spread
  };
}

export function estimateMarketExecution(orders = [], instrument, side, amount, marketPlanetId = null) {
  if (amount <= 0) return { canExecute: false, estimatedCost: 0, avgPrice: 0, slippage: 0, fills: [] };

  const book = getOrderBook(orders, instrument, marketPlanetId);
  const counterBook = side === ORDER_SIDES.BUY ? book.rawAsks : book.rawBids;

  let remaining = amount;
  let totalCost = 0;
  const fills = [];

  for (const counterOrder of counterBook) {
    const available = (counterOrder.amount || 0) - (counterOrder.filledAmount || 0);
    const take = Math.min(remaining, available);
    if (take > 0) {
      totalCost += take * counterOrder.price;
      fills.push({ price: counterOrder.price, amount: take });
      remaining -= take;
    }
    if (remaining <= 0) break;
  }

  const executedAmount = amount - remaining;
  const avgPrice = executedAmount > 0 ? totalCost / executedAmount : 0;
  const initialPrice = counterBook[0]?.price || avgPrice;
  const slippage = initialPrice > 0 ? Math.abs((avgPrice - initialPrice) / initialPrice) * 100 : 0;

  return {
    canExecute: remaining === 0,
    partiallyExecutable: executedAmount > 0 && remaining > 0,
    executedAmount,
    remainingAmount: remaining,
    estimatedCost: totalCost,
    avgPrice: Number(avgPrice.toFixed(4)),
    slippage: Number(slippage.toFixed(2)),
    fills
  };
}

export function activateConditionalOrders(orders = [], lastPrices = {}) {
  return (orders || []).map(ord => {
    if (!ord || (ord.status !== ORDER_STATUS.OPEN && ord.status !== ORDER_STATUS.PARTIALLY_FILLED)) {
      return ord;
    }
    const lastP = typeof lastPrices === 'function'
      ? Number(lastPrices(ord) || 0)
      : Number(lastPrices[ord.instrument] || 0);
    if (lastP <= 0) return ord;

    if (ord.type === ORDER_TYPES.STOP || ord.type === ORDER_TYPES.STOP_LIMIT) {
      const stopP = Number(ord.stopPrice) || 0;
      if (stopP <= 0) return ord;
      const triggered =
        (ord.side === ORDER_SIDES.SELL && lastP <= stopP) ||
        (ord.side === ORDER_SIDES.BUY && lastP >= stopP);
      if (!triggered) return ord;
      if (ord.type === ORDER_TYPES.STOP_LIMIT) {
        const limit = Number(ord.limitPrice) || stopP;
        return { ...ord, type: ORDER_TYPES.LIMIT, price: limit, targetPrice: limit };
      }
      return { ...ord, type: ORDER_TYPES.MARKET };
    }

    if (ord.type === ORDER_TYPES.TAKE_PROFIT) {
      const tp = Number(ord.takeProfitPrice || ord.stopPrice || ord.price) || 0;
      if (tp <= 0) return ord;
      const triggered =
        (ord.side === ORDER_SIDES.SELL && lastP >= tp) ||
        (ord.side === ORDER_SIDES.BUY && lastP <= tp);
      if (!triggered) return ord;
      return { ...ord, type: ORDER_TYPES.LIMIT, price: tp, targetPrice: tp };
    }

    return ord;
  });
}

function resolveExecutionPrice(bid, ask) {
  const bidMarket = bid.type === ORDER_TYPES.MARKET;
  const askMarket = ask.type === ORDER_TYPES.MARKET;
  if (bidMarket && !askMarket) return ask.price;
  if (askMarket && !bidMarket) return bid.price;
  if (bidMarket && askMarket) return ask.price;
  return (bid.createdAt <= ask.createdAt) ? bid.price : ask.price;
}

function clonePlanet(p) {
  return {
    ...p,
    resources: { ...(p.resources || { metal: 0, crystal: 0, deuterium: 0 }) }
  };
}

function creditEntity(ownerId, planetId, deltaCredits, playerCredits, planetMap, aiMap) {
  if (!deltaCredits) return playerCredits;
  if (ownerId === 'player') return playerCredits + deltaCredits;
  const key = planetId || ownerId;
  const ai = aiMap.get(key) || (ownerId ? aiMap.get(ownerId) : null);
  if (ai) {
    ai.credits = (ai.credits || 0) + deltaCredits;
  }
  return playerCredits;
}

function deliverResource(ownerId, planetId, instrument, qty, planetMap, aiMap) {
  if (qty <= 0) return;
  if (ownerId === 'player') {
    const dest = planetMap.get(planetId);
    if (dest) dest.resources[instrument] = (dest.resources[instrument] || 0) + qty;
    return;
  }
  const key = planetId || ownerId;
  const ai = aiMap.get(key) || (ownerId ? aiMap.get(ownerId) : null);
  if (ai) {
    ai.resources = ai.resources || { metal: 0, crystal: 0, deuterium: 0 };
    ai.resources[instrument] = (ai.resources[instrument] || 0) + qty;
  }
}

/**
 * Matching precio-tiempo. Solo órdenes limit/market. Stop/TP esperan activación.
 */
export function executeMatchingEngine(exchangeState, planets = [], credits = 0, currentTick = 0, aiPlanets = []) {
  let updatedOrders = (exchangeState.orders || []).map(o => ({ ...o }));
  let updatedTrades = [...(exchangeState.trades || [])];
  const markets = {};
  const existingMarkets = exchangeState.markets || {};
  for (const key of Object.keys(existingMarkets)) {
    markets[key] = cloneMarketSlice(existingMarkets[key]);
  }
  if (Object.keys(markets).length === 0 && exchangeState.lastPrices) {
    markets[DEFAULT_MARKET] = cloneMarketSlice({
      lastPrices: exchangeState.lastPrices,
      candles: exchangeState.candles,
      stats: exchangeState.stats
    });
  }

  const planetMap = new Map((planets || []).map(p => [p.id, clonePlanet(p)]));
  const aiMap = new Map((aiPlanets || []).map(p => [p.id, clonePlanet(p)]));
  let updatedCredits = credits;
  let tradesOccurred = false;
  let tradeSeq = 0;

  const marketIds = [...new Set(updatedOrders.map(resolveMarketId))];
  for (const mid of marketIds) {
    if (!markets[mid]) markets[mid] = emptyMarketSlice();
  }

  for (const instrument of INSTRUMENTS) {
    for (const marketId of marketIds) {
    const slice = markets[marketId];
    let matching = true;
    let guard = 0;

    while (matching && guard < 200) {
      guard += 1;
      const activeBids = updatedOrders
        .filter(o => o.instrument === instrument && o.side === ORDER_SIDES.BUY && isMatchableOrder(o) && resolveMarketId(o) === marketId)
        .sort((a, b) => (b.price - a.price) || (a.createdAt - b.createdAt));
      const activeAsks = updatedOrders
        .filter(o => o.instrument === instrument && o.side === ORDER_SIDES.SELL && isMatchableOrder(o) && resolveMarketId(o) === marketId)
        .sort((a, b) => (a.price - b.price) || (a.createdAt - b.createdAt));

      if (activeBids.length === 0 || activeAsks.length === 0) {
        matching = false;
        break;
      }

      const bestBid = activeBids[0];
      const bestAsk = activeAsks[0];
      const isMarketBuy = bestBid.type === ORDER_TYPES.MARKET;
      const isMarketSell = bestAsk.type === ORDER_TYPES.MARKET;

      if (!isMarketBuy && !isMarketSell && bestBid.price < bestAsk.price) {
        matching = false;
        break;
      }

      const executionPrice = resolveExecutionPrice(bestBid, bestAsk);
      const bidRemaining = (bestBid.amount || 0) - (bestBid.filledAmount || 0);
      const askRemaining = (bestAsk.amount || 0) - (bestAsk.filledAmount || 0);
      const matchQty = Math.min(bidRemaining, askRemaining);
      if (matchQty <= 0) {
        matching = false;
        break;
      }

      const tradeValue = Math.floor(matchQty * executionPrice);
      const fee = Math.floor(tradeValue * FEE_RATE);
      const netProceeds = tradeValue - fee;

      if (bestBid.ownerId === 'player') {
        const reservedRelease = Math.floor(matchQty * (bestBid.price || executionPrice));
        bestBid.reservedCredits = Math.max(0, (bestBid.reservedCredits || 0) - reservedRelease);
        const refund = Math.max(0, Math.floor(matchQty * ((bestBid.price || executionPrice) - executionPrice)));
        updatedCredits += refund;
      } else {
        const reservedRelease = Math.floor(matchQty * (bestBid.price || executionPrice));
        bestBid.reservedCredits = Math.max(0, (bestBid.reservedCredits || 0) - reservedRelease);
        const refund = Math.max(0, Math.floor(matchQty * ((bestBid.price || executionPrice) - executionPrice)));
        updatedCredits = creditEntity(bestBid.ownerId, bestBid.planetId, refund, updatedCredits, planetMap, aiMap);
      }

      deliverResource(bestBid.ownerId, bestBid.planetId, instrument, matchQty, planetMap, aiMap);
      updatedCredits = creditEntity(bestAsk.ownerId, bestAsk.planetId, netProceeds, updatedCredits, planetMap, aiMap);

      bestBid.filledAmount = (bestBid.filledAmount || 0) + matchQty;
      bestAsk.filledAmount = (bestAsk.filledAmount || 0) + matchQty;
      bestBid.status = bestBid.filledAmount >= bestBid.amount ? ORDER_STATUS.FILLED : ORDER_STATUS.PARTIALLY_FILLED;
      bestAsk.status = bestAsk.filledAmount >= bestAsk.amount ? ORDER_STATUS.FILLED : ORDER_STATUS.PARTIALLY_FILLED;
      if (bestAsk.reservedResourceAmount != null) {
        bestAsk.reservedResourceAmount = Math.max(0, (bestAsk.reservedResourceAmount || 0) - matchQty);
      }

      tradeSeq += 1;
      const tradeRecord = {
        id: `tr_${currentTick}_${bestBid.id}_${bestAsk.id}_${tradeSeq}`,
        instrument,
        marketId,
        price: executionPrice,
        amount: matchQty,
        total: tradeValue,
        fee,
        buyerId: bestBid.ownerId,
        sellerId: bestAsk.ownerId,
        buyOrderId: bestBid.id,
        sellOrderId: bestAsk.id,
        planetId: bestBid.planetId || bestAsk.planetId,
        timestamp: currentTick,
        tick: currentTick,
        status: 'SETTLED'
      };

      updatedTrades.unshift(tradeRecord);
      if (updatedTrades.length > 500) updatedTrades.pop();

      slice.lastPrices[instrument] = executionPrice;

      const candles = slice.candles[instrument] || [];
      const currentCandle = candles[candles.length - 1];
      if (!currentCandle || (currentCandle.tick ?? currentCandle.time) !== currentTick) {
        candles.push({
          tick: currentTick,
          time: currentTick,
          open: executionPrice,
          high: executionPrice,
          low: executionPrice,
          close: executionPrice,
          volume: matchQty
        });
        if (candles.length > 100) candles.shift();
      } else {
        currentCandle.high = Math.max(currentCandle.high, executionPrice);
        currentCandle.low = Math.min(currentCandle.low, executionPrice);
        currentCandle.close = executionPrice;
        currentCandle.volume += matchQty;
      }
      slice.candles[instrument] = candles;

      const st = { ...(slice.stats[instrument] || { high: executionPrice, low: executionPrice, volume: 0, change24h: 0, vwap: executionPrice }) };
      st.high = Math.max(st.high || executionPrice, executionPrice);
      st.low = Math.min(st.low || executionPrice, executionPrice);
      const prevVol = st.volume || 0;
      const prevVwap = st.vwap || executionPrice;
      st.volume = prevVol + matchQty;
      st.vwap = st.volume > 0
        ? Number((((prevVwap * prevVol) + (executionPrice * matchQty)) / st.volume).toFixed(4))
        : executionPrice;
      const openRef = st.open24h || candles[0]?.open || executionPrice;
      st.open24h = openRef;
      st.change24h = openRef > 0 ? Number((((executionPrice - openRef) / openRef) * 100).toFixed(2)) : 0;
      slice.stats[instrument] = st;
      markets[marketId] = slice;

      tradesOccurred = true;
    }
    }
  }

  const primary = markets[DEFAULT_MARKET] || markets[marketIds[0]] || emptyMarketSlice(exchangeState.lastPrices);
  return {
    exchangeState: {
      orders: updatedOrders,
      trades: updatedTrades,
      markets,
      lastPrices: { ...primary.lastPrices },
      candles: {
        metal: [...(primary.candles.metal || [])],
        crystal: [...(primary.candles.crystal || [])],
        deuterium: [...(primary.candles.deuterium || [])]
      },
      stats: { ...primary.stats }
    },
    planets: Array.from(planetMap.values()),
    aiPlanets: Array.from(aiMap.values()),
    credits: updatedCredits,
    tradesOccurred
  };
}

function det01(tick, salt) {
  const x = Math.sin((tick + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Facciones colocan órdenes con inventario/créditos reales. El matching decide.
 */
export function simulateFactionMarketActivity(exchangeState, tick, aiPlanets = [], lonjaMarketId = null) {
  let orders = [...(exchangeState.orders || [])];
  const planets = (aiPlanets || []).map(p => clonePlanet(p));
  const planetById = new Map(planets.map(p => [p.id, p]));

  const kept = [];
  for (const o of orders) {
    const age = tick - (o.tickCreated || 0);
    const isFaction = o.ownerId && o.ownerId !== 'player';
    const live = o.status === ORDER_STATUS.OPEN || o.status === ORDER_STATUS.PARTIALLY_FILLED;
    if (isFaction && live && age >= 300) {
      const remaining = (o.amount || 0) - (o.filledAmount || 0);
      const host = planetById.get(o.planetId) || planetById.get(o.ownerId);
      if (host && remaining > 0) {
        if (o.side === ORDER_SIDES.SELL) {
          host.resources[o.instrument] = (host.resources[o.instrument] || 0) + remaining;
        } else if (o.reservedCredits > 0) {
          const refund = Math.floor((o.reservedCredits || 0) * (remaining / (o.amount || 1)));
          host.credits = (host.credits || 0) + refund;
        }
      }
      kept.push({ ...o, status: ORDER_STATUS.EXPIRED });
      continue;
    }
    kept.push(o);
  }
  orders = kept;

  if (tick % 5 !== 0) {
    return { exchangeState: { ...exchangeState, orders }, aiPlanets: planets };
  }

  const livePlanets = planets.filter(p => p && !p.isVirgin && p.id);
  if (livePlanets.length === 0) {
    return { exchangeState: { ...exchangeState, orders }, aiPlanets: planets };
  }

  const inst = INSTRUMENTS[tick % INSTRUMENTS.length];
  const planet = livePlanets[tick % livePlanets.length];
  const surplus = planet.resources?.[inst] || 0;
  const directive = planet.strategicDirective?.directive || planet.strategicDirective || '';
  const wantsTrade = directive === 'TRADE' || directive === 'EXPAND';
  const marketId = (wantsTrade && lonjaMarketId) ? lonjaMarketId : planet.id;
  const lastP = getMarketView(exchangeState, marketId).lastPrices?.[inst] || INITIAL_PRICES[inst] || 1;

  const existingLive = orders.some(o =>
    o.ownerId === planet.id && o.instrument === inst &&
    (o.status === ORDER_STATUS.OPEN || o.status === ORDER_STATUS.PARTIALLY_FILLED)
  );
  if (existingLive) {
    return { exchangeState: { ...exchangeState, orders }, aiPlanets: planets };
  }

  const sellBias = surplus > 80000 || wantsTrade;
  const buyBias = surplus < 25000 && (planet.credits || 0) > 1000;
  const doSell = surplus >= 5000 && (wantsTrade || (sellBias && det01(tick, 3) > 0.35));

  if (doSell) {
    const amount = Math.max(1000, Math.min(Math.floor(surplus * 0.08), 120000));
    const price = Number(Math.max(0.1, lastP * (1.01 + det01(tick, 7) * 0.04)).toFixed(2));
    planet.resources[inst] = Math.max(0, surplus - amount);
    orders.push({
      id: `fac_${planet.id}_${tick}_${inst}_s`,
      ownerId: planet.id,
      instrument: inst,
      side: ORDER_SIDES.SELL,
      type: ORDER_TYPES.LIMIT,
      resource: inst,
      amount,
      price,
      targetPrice: price,
      filledAmount: 0,
      status: ORDER_STATUS.OPEN,
      reservedResource: inst,
      reservedResourceAmount: amount,
      planetId: planet.id,
      marketId,
      tickCreated: tick,
      createdAt: tick
    });
  } else if (buyBias) {
    const price = Number(Math.max(0.1, lastP * (0.96 - det01(tick, 11) * 0.03)).toFixed(2));
    const amount = 20000;
    const cost = Math.floor(amount * price);
    if ((planet.credits || 0) >= cost && cost > 0) {
      planet.credits = (planet.credits || 0) - cost;
      orders.push({
        id: `fac_${planet.id}_${tick}_${inst}_b`,
        ownerId: planet.id,
        instrument: inst,
        side: ORDER_SIDES.BUY,
        type: ORDER_TYPES.LIMIT,
        resource: inst,
        amount,
        price,
        targetPrice: price,
        filledAmount: 0,
        status: ORDER_STATUS.OPEN,
        reservedCredits: cost,
        planetId: planet.id,
        marketId,
        tickCreated: tick,
        createdAt: tick
      });
    }
  }

  return { exchangeState: { ...exchangeState, orders }, aiPlanets: planets };
}
