import { describe, it, expect } from 'vitest';
import {
  assignArbitrageFleet,
  estimateSpotArbitrage,
  getLocalTickerQuotes,
  marketIsBlockaded
} from '../utils/spotArbitrage.js';
import { handleDispatchSpotArbitrage } from '../reducers/economy/exchangeActions.js';
import { handleTransportMission } from '../missions/diploMission.js';

const origin = {
  id: 'pA',
  name: 'Origen',
  galaxy: 1,
  system: 1,
  position: 1,
  faction: 'human',
  resources: { metal: 50000, crystal: 10000, deuterium: 8000 },
  fleet: { largeCargo: 4, smallCargo: 2 },
  buildings: {}
};
const dest = {
  id: 'pB',
  name: 'Destino',
  galaxy: 1,
  system: 1,
  position: 8,
  faction: 'human',
  resources: { metal: 0, crystal: 0, deuterium: 0 },
  fleet: {},
  buildings: {}
};

const baseState = {
  currentPlanetId: 'pA',
  planets: [origin, dest],
  research: { combustion: 2 },
  fleetMissions: [],
  notifications: [],
  credits: 1000,
  spotExchange: {
    orders: [],
    trades: [
      { instrument: 'metal', marketId: 'pA', planetId: 'pA', price: 1.1 },
      { instrument: 'metal', marketId: 'pB', planetId: 'pB', price: 1.4 }
    ],
    lastPrices: { metal: 1.1, crystal: 1.65, deuterium: 3.3 },
    markets: {
      pA: { lastPrices: { metal: 1.1, crystal: 1.65, deuterium: 3.3 }, candles: {}, stats: { metal: { change24h: 2.5, volume: 10 } } },
      pB: { lastPrices: { metal: 1.4, crystal: 1.65, deuterium: 3.3 }, candles: {}, stats: { metal: { change24h: -1, volume: 4 } } }
    }
  }
};

describe('Arbitraje físico Spot', () => {
  it('asigna cargueros según capacidad real', () => {
    const assigned = assignArbitrageFleet({ largeCargo: 2, smallCargo: 3 }, 30000, false);
    expect(assigned.remaining).toBe(0);
    expect(assigned.capacity).toBeGreaterThanOrEqual(30000);
    expect((assigned.fleet.largeCargo || 0) + (assigned.fleet.smallCargo || 0)).toBeGreaterThan(0);
  });

  it('ticker usa el print local, no cifras fijas', () => {
    const quotes = getLocalTickerQuotes(baseState.spotExchange, 'pA');
    const metal = quotes.find(q => q.instrument === 'metal');
    expect(metal.last).toBe(1.1);
    expect(metal.change24h).toBe(2.5);
    const destQ = getLocalTickerQuotes(baseState.spotExchange, 'pB').find(q => q.instrument === 'metal');
    expect(destQ.last).toBe(1.4);
  });

  it('estima spread entre mercados y exige combustible y bodega', () => {
    const est = estimateSpotArbitrage({
      state: baseState,
      originPlanet: origin,
      destPlanet: dest,
      instrument: 'metal',
      amount: 20000
    });
    expect(est.canDispatch).toBe(true);
    expect(est.spread).toBeCloseTo(0.3, 5);
    expect(est.fuel).toBeGreaterThan(0);
    expect(est.flightTime).toBeGreaterThan(0);
  });

  it('rechaza destino bloqueado', () => {
    expect(marketIsBlockaded({
      fleetMissions: [{ type: 'attack', to: { id: 'pB' }, returning: false }]
    }, 'pB')).toBe(true);
  });

  it('despachar convoy quita inventario y naves del origen, destino intacto', () => {
    const next = handleDispatchSpotArbitrage(baseState, {
      originId: 'pA',
      destId: 'pB',
      instrument: 'metal',
      amount: 20000
    });
    const from = next.planets.find(p => p.id === 'pA');
    const to = next.planets.find(p => p.id === 'pB');
    expect(from.resources.metal).toBe(30000);
    expect(to.resources.metal).toBe(0);
    expect((from.fleet.largeCargo || 0)).toBeLessThan(4);
    const mission = (next.fleetMissions || []).find(m => m.spotArbitrage);
    expect(mission).toBeTruthy();
    expect(mission.type).toBe('transport');
    expect(mission.resources.metal).toBe(20000);
    expect(mission.fuel).toBeGreaterThan(0);
  });

  it('al atracar el transporte entrega el metal en destino', () => {
    const delivered = handleTransportMission({
      from: { id: 'pA', name: 'Origen' },
      to: { id: 'pB', name: 'Destino', galaxy: 1, system: 2, position: 3 },
      resources: { metal: 5000, crystal: 0, deuterium: 0 },
      fleet: { largeCargo: 1 }
    }, baseState);
    const to = delivered.state.planets.find(p => p.id === 'pB');
    expect(to.resources.metal).toBe(5000);
    expect(delivered.type).toBe('success');
  });
});
