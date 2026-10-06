import { calcDistance, calcFlightTime, calcFuel, fleetSpeed } from './formulas.js';
import {
  getMarketView,
  getOrderBook,
  checkPhysicalAccess,
  INSTRUMENTS
} from './galacticSpotExchange.js';

export const SPOT_CARGO_CAPS = {
  cargoTitan: 500000,
  heavyFreighter: 120000,
  largeCargo: 25000,
  smallCargo: 5000
};

const CARGO_ORDER = ['cargoTitan', 'heavyFreighter', 'largeCargo', 'smallCargo'];

export function marketIsBlockaded(state, planetId) {
  if (!planetId) return false;
  return (state.fleetMissions || []).some((m) => {
    if (m?.returning) return false;
    const hostile = m.type === 'attack' || m.type === 'planet_destruction';
    return hostile && m.to?.id === planetId;
  });
}

export function assignArbitrageFleet(originFleet = {}, amount = 0, isCommercial = false) {
  const mult = isCommercial ? 1.5 : 1;
  const need = Math.max(0, Number(amount) || 0);
  const fleet = {};
  let remaining = need;
  for (const id of CARGO_ORDER) {
    const cap = (SPOT_CARGO_CAPS[id] || 0) * mult;
    const available = Math.max(0, originFleet[id] || 0);
    if (cap <= 0 || available <= 0 || remaining <= 0) continue;
    const used = Math.min(available, Math.ceil(remaining / cap));
    if (used > 0) {
      fleet[id] = used;
      remaining -= used * cap;
    }
  }
  const capacity = CARGO_ORDER.reduce((sum, id) => {
    const cap = (SPOT_CARGO_CAPS[id] || 0) * mult;
    return sum + (fleet[id] || 0) * cap;
  }, 0);
  return { fleet, capacity, remaining: Math.max(0, remaining) };
}

export function getLocalTickerQuotes(exchangeState = {}, marketId = null) {
  const view = getMarketView(exchangeState, marketId);
  const trades = exchangeState.trades || [];
  return INSTRUMENTS.map((inst) => {
    const book = getOrderBook(exchangeState.orders || [], inst, marketId);
    const hasPrint = trades.some(
      (t) => t.instrument === inst && (!marketId || (t.marketId || t.planetId) === marketId)
    );
    const last = Number(view.lastPrices?.[inst] || 0);
    const change = Number(view.stats?.[inst]?.change24h || 0);
    return {
      instrument: inst,
      last: hasPrint && last > 0 ? last : null,
      change24h: hasPrint ? change : null,
      bestBid: book.bestBid,
      bestAsk: book.bestAsk,
      spread: book.spread,
      volume: view.stats?.[inst]?.volume || 0
    };
  });
}

function computeFuelAndTime(origin, dest, fleet, research = {}) {
  const dist = calcDistance(origin, dest);
  const faction = origin.faction || 'human';
  const spd = fleetSpeed(fleet, research, faction);
  if (spd <= 0) return { dist, fuel: 0, flightTime: 0, spd: 0 };
  const driveLevel = Math.max(
    research.combustion || 0,
    research.impulse || 0,
    research.hyperspace || 0
  );
  const safeRange = 2500 + ((research.hyperspace || 0) * 1200) + ((research.impulse || 0) * 400);
  const isOverRange = dist > safeRange;
  const rangeOverheadFactor = isOverRange ? 1 + Math.min(1.5, (dist - safeRange) / safeRange) : 1;
  let fuel = 0;
  for (const [id, qty] of Object.entries(fleet)) {
    fuel += calcFuel(dist, id, qty, driveLevel, research, origin);
  }
  if (isOverRange) fuel = Math.round(fuel * rangeOverheadFactor);
  let flightTime = calcFlightTime(dist, spd, 10);
  if (isOverRange) {
    flightTime = Math.round(flightTime * (1 + (rangeOverheadFactor - 1) * 0.5));
  }
  return { dist, fuel, flightTime, spd };
}

export function estimateSpotArbitrage({
  state,
  originPlanet,
  destPlanet,
  instrument,
  amount
}) {
  const qty = Math.floor(Number(amount) || 0);
  const inst = instrument || 'metal';
  if (!originPlanet) {
    return { canDispatch: false, reason: 'Sin planeta de origen.' };
  }
  const access = checkPhysicalAccess(state, originPlanet.id);
  if (!access.hasAccess) {
    return { canDispatch: false, reason: access.reason, access };
  }
  if (!destPlanet) {
    return { canDispatch: false, reason: 'Elige un mundo destino.', access };
  }
  if (destPlanet.id === originPlanet.id) {
    return { canDispatch: false, reason: 'Origen y destino son el mismo mundo.', access };
  }
  if (marketIsBlockaded(state, destPlanet.id)) {
    return { canDispatch: false, reason: 'Destino bloqueado por flota hostil.', access, blockaded: true };
  }
  if (!INSTRUMENTS.includes(inst) || qty <= 0) {
    return { canDispatch: false, reason: 'Cantidad o recurso inválido.', access };
  }
  const available = originPlanet.resources?.[inst] || 0;
  if (available < qty) {
    return { canDispatch: false, reason: `Inventario insuficiente de ${inst}.`, access, available };
  }
  const assigned = assignArbitrageFleet(
    originPlanet.fleet || {},
    qty,
    originPlanet.specialization === 'commercial'
  );
  if (!assigned.fleet || Object.keys(assigned.fleet).length === 0 || assigned.remaining > 0) {
    return {
      canDispatch: false,
      reason: 'Cargueros insuficientes para el lote.',
      access,
      ...assigned
    };
  }
  const { dist, fuel, flightTime, spd } = computeFuelAndTime(
    originPlanet,
    destPlanet,
    assigned.fleet,
    state.research || {}
  );
  const deutAvailable = originPlanet.resources?.deuterium || 0;
  const deutNeeded = inst === 'deuterium' ? qty + fuel : fuel;
  if (deutAvailable < deutNeeded) {
    return {
      canDispatch: false,
      reason: `Deuterio insuficiente para combustible (${Math.floor(fuel)} ⚗️).`,
      access,
      fleet: assigned.fleet,
      capacity: assigned.capacity,
      fuel,
      flightTime,
      dist
    };
  }
  const originView = getMarketView(state.spotExchange, originPlanet.id);
  const destView = getMarketView(state.spotExchange, destPlanet.id);
  const originLast = originView.lastPrices?.[inst] || null;
  const destLast = destView.lastPrices?.[inst] || null;
  const spread = (originLast > 0 && destLast > 0)
    ? Number((destLast - originLast).toFixed(4))
    : null;
  return {
    canDispatch: true,
    reason: null,
    access,
    fleet: assigned.fleet,
    capacity: assigned.capacity,
    fuel,
    flightTime,
    dist,
    spd,
    originLast,
    destLast,
    spread,
    available
  };
}
