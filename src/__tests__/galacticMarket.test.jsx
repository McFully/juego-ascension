import { describe, it, expect } from 'vitest';
import { economyReducer } from '../reducers/economyReducer.js';
import { USED_SHIPS_CATALOG, BLACK_MARKET_CATALOG } from '../data/galacticMarketData.js';

describe('Galactic Market Reducer and Business Logic', () => {
  const baseState = {
    currentPlanetId: 'p1',
    planets: [
      {
        id: 'p1',
        name: 'Tierra Prime',
        resources: { metal: 100000, crystal: 50000, deuterium: 20000 },
        fleet: { smallCargo: 2 },
        defenses: {}
      }
    ],
    influence: 100,
    notifications: []
  };

  it('debe comprar un lote de naves de ocasión incorporándolas al hangar y deduciendo recursos', () => {
    const lot = USED_SHIPS_CATALOG[0]; // smallCargo x5
    const action = {
      type: 'MARKET_BUY_USED_SHIPS',
      planetId: 'p1',
      lot,
      cost: lot.cost
    };

    const nextState = economyReducer(baseState, action);
    const planet = nextState.planets[0];

    expect(planet.fleet.smallCargo).toBe(7); // 2 previas + 5 del lote
    expect(planet.resources.metal).toBe(100000 - lot.cost.metal);
    expect(planet.resources.crystal).toBe(50000 - lot.cost.crystal);
  });

  it('debe desguazar naves recuperando recursos al 75% del valor base', () => {
    const action = {
      type: 'MARKET_SCRAP_SHIPS',
      planetId: 'p1',
      shipId: 'smallCargo',
      quantity: 1,
      returnResources: { metal: 1500, crystal: 1500, deuterium: 0 }
    };

    const nextState = economyReducer(baseState, action);
    const planet = nextState.planets[0];

    expect(planet.fleet.smallCargo).toBe(1); // 2 - 1
    expect(planet.resources.metal).toBe(101500);
    expect(planet.resources.crystal).toBe(51500);
  });

  it('debe procesar un artículo del mercado negro otorgando cargamentos o defensas', () => {
    const item = BLACK_MARKET_CATALOG[1]; // bm_military_surplus_crate (heavyFighter x6, heavyLaser x4)
    const action = {
      type: 'MARKET_BUY_BLACK_MARKET',
      planetId: 'p1',
      item,
      cost: item.cost
    };

    const nextState = economyReducer(baseState, action);
    const planet = nextState.planets[0];

    expect(planet.fleet.heavyFighter).toBe(6);
    expect(planet.defenses.heavyLaser).toBe(4);
    expect(planet.resources.metal).toBe(100000 - item.cost.metal);
  });
});
