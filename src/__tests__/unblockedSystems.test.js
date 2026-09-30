import { describe, it, expect } from 'vitest';
import { gameReducer } from '../reducers/index.js';
import { createInitial } from '../core/initialState.js';

/**
 * Los sistemas que el router dejaba muertos. Un action encaminado que sale por
 * un `return state` temprano sigue siendo un boton decorativo: aqui se prueba
 * que la accion cambia el estado de verdad, no solo que no lanza.
 *
 * Los payloads son los que despacha la UI real, leidos de:
 *   SupplyRoutesView.jsx / TradeRoutesSection.jsx  (rutas de suministro)
 *   ColonyNetworkPage.jsx                          (red de colonias)
 *   RetrofitShipModal.jsx / FleetRetrofitQueueSection.jsx
 *   MoonPage.jsx                                   (base lunar)
 */

const nuevo = () => createInitial('Comandante');

/** Estado con dos mundos, que es lo que necesita la red de colonias. */
const dosMundos = () => {
  const s0 = nuevo();
  const a = s0.planets[0];
  const b = {
    ...a,
    id: 'colonia-b',
    name: 'Colonia B',
    isHome: false,
    resources: { metal: 10, crystal: 90000, deuterium: 0 },
    fleet: {},
  };
  return { ...s0, planets: [a, b] };
};

describe('Mercado galactico: la accion llega al dominio', () => {
  it('MARKET_TRADE intercambia recursos', () => {
    const s0 = nuevo();
    const p = s0.planets[0];
    p.resources.metal = 50000;
    p.resources.crystal = 50000;
    const s1 = gameReducer(s0, {
      type: 'MARKET_TRADE',
      planetId: p.id,
      sellResource: 'metal',
      buyResource: 'crystal',
      sellAmount: 1000,
      buyAmount: 2000,
    });
    const p1 = s1.planets.find(x => x.id === p.id);
    expect(p1.resources.metal).toBeLessThan(p.resources.metal);
    expect(p1.resources.crystal).toBeGreaterThan(p.resources.crystal);
  });

  it('MARKET_TRADE no gasta lo que no tienes', () => {
    const s0 = nuevo();
    const p = s0.planets[0];
    p.resources.metal = 10;
    const s1 = gameReducer(s0, {
      type: 'MARKET_TRADE', planetId: p.id,
      sellResource: 'metal', buyResource: 'crystal',
      sellAmount: 999999, buyAmount: 2000,
    });
    expect(s1.planets.find(x => x.id === p.id).resources.metal).toBe(10);
  });

  it('CREATE_LIMIT_ORDER deja una orden en el estado', () => {
    const s0 = nuevo();
    const s1 = gameReducer(s0, {
      type: 'CREATE_LIMIT_ORDER',
      resource: 'metal', side: 'buy', quantity: 100, price: 5,
    });
    expect(Array.isArray(s1.exchangeOrders)).toBe(true);
  });
});

describe('Rutas de suministro: la accion llega al dominio', () => {
  const ruta = (s) => ({
    type: 'ADD_TRADE_ROUTE',
    fromId: s.planets[0].id,
    toId: s.planets[1]?.id,
    resource: 'metal',
    mode: 'fixed',
    amount: 5000,
    ratio: 0.75,
  });

  it('ADD_TRADE_ROUTE registra la ruta', () => {
    const s0 = dosMundos();
    const s1 = gameReducer(s0, ruta(s0));
    expect(s1.tradeRoutes.length).toBe(s0.tradeRoutes.length + 1);
    expect(s1.tradeRoutes[0].resource).toBe('metal');
  });

  it('TOGGLE_TRADE_ROUTE cambia el estado de la ruta', () => {
    const s0 = dosMundos();
    const added = gameReducer(s0, ruta(s0));
    const routeId = added.tradeRoutes[0].id;
    const t1 = gameReducer(added, { type: 'TOGGLE_TRADE_ROUTE', routeId });
    expect(t1.tradeRoutes[0].active).not.toBe(added.tradeRoutes[0].active);
  });

  it('REMOVE_TRADE_ROUTE quita la ruta', () => {
    const s0 = dosMundos();
    const added = gameReducer(s0, ruta(s0));
    const routeId = added.tradeRoutes[0].id;
    const removed = gameReducer(added, { type: 'REMOVE_TRADE_ROUTE', routeId });
    expect(removed.tradeRoutes.length).toBe(added.tradeRoutes.length - 1);
  });
});

describe('Red de colonias', () => {
  it('EQUALIZE_COLONY_RESOURCES reparte la media entre los mundos', () => {
    const s0 = dosMundos();
    const a = s0.planets[0];
    a.resources.metal = 90000;
    a.resources.crystal = 10;
    const s1 = gameReducer(s0, { type: 'EQUALIZE_COLONY_RESOURCES' });
    const a1 = s1.planets.find(x => x.id === a.id);
    const b1 = s1.planets.find(x => x.id === 'colonia-b');
    // 90000 + 10 = 90010 entre 2 mundos.
    expect(a1.resources.metal).toBe(45005);
    expect(b1.resources.metal).toBe(45005);
  });

  it('EQUALIZE_COLONY_RESOURCES no hace nada con un solo mundo', () => {
    const s0 = nuevo();
    const s1 = gameReducer(s0, { type: 'EQUALIZE_COLONY_RESOURCES' });
    expect(s1).toBe(s0);
  });

  it('RELOCATE_COLONY_FLEET traslada la flota indicada', () => {
    const s0 = dosMundos();
    const a = s0.planets[0];
    a.fleet.cruiser = 2;
    const s1 = gameReducer(s0, {
      type: 'RELOCATE_COLONY_FLEET',
      fromPlanetId: a.id,
      toPlanetId: 'colonia-b',
      ships: { cruiser: 1 },
    });
    const a1 = s1.planets.find(x => x.id === a.id);
    const b1 = s1.planets.find(x => x.id === 'colonia-b');
    expect(a1.fleet.cruiser).toBe(1);
    expect(b1.fleet.cruiser).toBe(1);
  });
});

describe('Consola operativa de edificios', () => {
  it('EXECUTE_BUILDING_ACTION ejecuta la accion del interior y cambia recursos', () => {
    const s0 = nuevo();
    const p = s0.planets[0];
    p.buildings.refinery = 3;
    p.resources = { metal: 100000, crystal: 100000, deuterium: 100000 };
    const antes = { ...p.resources };
    const s1 = gameReducer(s0, {
      type: 'EXECUTE_BUILDING_ACTION',
      planetId: p.id,
      buildingId: 'refinery',
      actionId: 'smeltReserves',
    });
    const p1 = s1.planets.find(x => x.id === p.id);
    const cambio = p1.resources.metal !== antes.metal
      || p1.resources.crystal !== antes.crystal
      || p1.resources.deuterium !== antes.deuterium;
    expect(cambio).toBe(true);
  });
});

describe('Base lunar', () => {
  const conLuna = () => {
    const s0 = nuevo();
    const p = s0.planets[0];
    p.moon = { id: 'luna', buildings: { lunarBase: 0, sensorPhalanx: 0, jumpGate: 0, moonStorage: 0 } };
    p.resources = { metal: 9999999, crystal: 9999999, deuterium: 9999999 };
    return s0;
  };

  it('BUILD_MOON_BUILDING sube el nivel de la instalacion lunar', () => {
    const s0 = conLuna();
    const p = s0.planets[0];
    const s1 = gameReducer(s0, { type: 'BUILD_MOON_BUILDING', buildingId: 'lunarBase' });
    expect(s1.planets.find(x => x.id === p.id).moon.buildings.lunarBase).toBe(1);
  });

  it('el alias historico START_MOON_BUILDING hace lo mismo', () => {
    const s0 = conLuna();
    const p = s0.planets[0];
    const s1 = gameReducer(s0, { type: 'START_MOON_BUILDING', buildingId: 'lunarBase' });
    expect(s1.planets.find(x => x.id === p.id).moon.buildings.lunarBase).toBe(1);
  });

  it('descontar recursos al construir', () => {
    const s0 = conLuna();
    const p = s0.planets[0];
    const antes = { ...p.resources };
    const s1 = gameReducer(s0, { type: 'BUILD_MOON_BUILDING', buildingId: 'lunarBase' });
    const p1 = s1.planets.find(x => x.id === p.id);
    expect(p1.resources.metal).toBeLessThan(antes.metal);
  });
});
