/**
 * queueTiming.test.js
 * Reajuste del tiempo restante cuando suben edificios o techs que reducen tiempos.
 *
 * Idea central que se verifica aquí: como todas las fórmulas de tiempo del juego son
 * multiplicativas respecto a `cost`, el cociente entre dos sondeos con coste fijo es
 * el cociente entre las duraciones reales. Eso permite reajustar sin reimplementar
 * ninguna fórmula.
 */

import { describe, test, expect } from 'vitest';
import { GAME_SPEED, researchTimeBonus, calcResearchTime, shipTimeBonus } from '../utils/formulas.js';
import {
  reconcileQueueTimings,
  timeMultFor,
  stampTimeMult,
} from '../reducers/tick/queues/queueTiming.js';

const HOUR = 3600 * 1000;

const makeState = () => ({
  gameTick: 100,
  currentPlanetId: 'p1',
  research: {},
  blueprints: [],
  relics: [],
  ministries: {},
  researchQueue: [],
  buildQueue: [],
  shipQueue: [],
  defenseQueue: [],
  customShipQueue: [],
  retrofitQueue: [],
  planets: [{
    id: 'p1',
    name: 'Alfa',
    faction: 'human',
    buildings: {
      researchLab: 1, robotFactory: 0, naniteFactory: 0,
      constructionCenter: 0, shipyard: 1,
    },
    resources: { metal: 1e9, crystal: 1e9, deuterium: 1e9 },
    ministries: {},
  }],
});

/**
 * Encola un item estampándolo con el estado ACTUAL, y luego aplica la mejora.
 * Devuelve el item estampado (con su timeMult original) para poder comparar.
 */
const enqueueThenUpgrade = (kind, queueKey, item, upgrade) => {
  const state = makeState();
  const stamped = stampTimeMult(state, kind, item);
  state[queueKey] = [stamped];
  upgrade(state.planets[0].buildings, state);
  return { state, stamped };
};

describe('queueTiming — estampa del multiplicador', () => {
  test('stampTimeMult graba un multiplicador positivo al encolar', () => {
    const state = makeState();
    const item = stampTimeMult(state, 'research', {
      id: 'x', planetId: 'p1', startTime: Date.now(), endTime: Date.now() + HOUR,
    });
    expect(item.timeMult).toBeGreaterThan(0);
  });

  test('timeMultFor devuelve null si no hay planeta', () => {
    const sinPlanetas = makeState();
    sinPlanetas.planets = [];
    expect(timeMultFor(sinPlanetas, 'research', { planetId: 'nope' })).toBeNull();
  });

  test('timeMultFor devuelve null para un tipo de cola desconocido', () => {
    expect(timeMultFor(makeState(), 'inventado', { planetId: 'p1' })).toBeNull();
  });

  test('los tipos de cola reales producen multiplicador', () => {
    const state = makeState();
    for (const kind of ['build', 'research', 'ship', 'defense', 'retrofit']) {
      expect(timeMultFor(state, kind, { planetId: 'p1', baseId: 'cruiser', type: 'ship_variant' }))
        .toBeGreaterThan(0);
    }
  });
});

describe('queueTiming — investigación se acorta al subir el laboratorio', () => {
  test('de nv.1 a nv.3 reduce el endTime en la proporción de la fórmula', () => {
    const T0 = Date.now();
    const { state } = enqueueThenUpgrade('research', 'researchQueue', {
      id: 'r1', researchId: 'galacticTrade', planetId: 'p1',
      startTime: T0, endTime: T0 + 2 * HOUR,
    }, (b) => { b.researchLab = 3; });

    const item = reconcileQueueTimings(state).researchQueue[0];
    expect(item).toBeDefined();
    expect(item.endTime).toBeLessThan(T0 + 2 * HOUR);

    // labReduction = 1 + lab*0.5 : 1.5 -> 2.5, luego 2h * 1.5/2.5 = 1.2h
    expect((item.endTime - T0) / HOUR).toBeCloseTo(1.2, 1);
  });

  test('el progreso ya realizado no se rehace: startTime intacto yendTime futuro', () => {
    const T0 = Date.now() - 60 * 60 * 1000; // empezó hace 1 hora
    const { state } = enqueueThenUpgrade('research', 'researchQueue', {
      id: 'r1', researchId: 'galacticTrade', planetId: 'p1',
      startTime: T0, endTime: T0 + 2 * HOUR,
    }, (b) => { b.researchLab = 3; });

    const item = reconcileQueueTimings(state).researchQueue[0];
    expect(item.startTime).toBe(T0);
    expect(item.endTime).toBeGreaterThan(Date.now());
    // Quedaba 1h, ahora debe quedar menos de 1h
    expect(item.endTime - Date.now()).toBeLessThan(HOUR);
  });

  test('subir advResearchCenter (researchTimeBonus) también acorta', () => {
    const T0 = Date.now();
    const { state } = enqueueThenUpgrade('research', 'researchQueue', {
      id: 'r2', researchId: 'aiTactics', planetId: 'p1',
      startTime: T0, endTime: T0 + 3 * HOUR,
    }, (b) => { b.advResearchCenter = 5; });

    // sanity: el bonus de edificios sube de verdad
    expect(researchTimeBonus(state.planets[0].buildings))
      .toBeGreaterThan(researchTimeBonus({ researchLab: 1 }));

    const item = reconcileQueueTimings(state).researchQueue[0];
    expect(item.endTime).toBeLessThan(T0 + 3 * HOUR);
  });
});

describe('queueTiming — construcción con fábrica de robots y de nanobots', () => {
  test('subir robotFactory + naniteFactory + constructionCenter acorta la cola de obra', () => {
    const T0 = Date.now();
    const { state } = enqueueThenUpgrade('build', 'buildQueue', {
      id: 'b1', buildingId: 'metalMine', planetId: 'p1',
      startTime: T0, endTime: T0 + 4 * HOUR,
    }, (b) => { b.robotFactory = 4; b.naniteFactory = 3; b.constructionCenter = 2; });

    const item = reconcileQueueTimings(state).buildQueue[0];
    expect(item.endTime).toBeLessThan(T0 + 4 * HOUR);
  });

  test('subir solo naniteFactory acorta, pero menos que robotFactory', () => {
    const T0 = Date.now();
    const nano = enqueueThenUpgrade('build', 'buildQueue', {
      id: 'bn', buildingId: 'metalMine', planetId: 'p1', startTime: T0, endTime: T0 + 4 * HOUR,
    }, (b) => { b.naniteFactory = 10; });
    const robot = enqueueThenUpgrade('build', 'buildQueue', {
      id: 'br', buildingId: 'metalMine', planetId: 'p1', startTime: T0, endTime: T0 + 4 * HOUR,
    }, (b) => { b.robotFactory = 10; });

    const nanoItem = reconcileQueueTimings(nano.state).buildQueue[0];
    const robotItem = reconcileQueueTimings(robot.state).buildQueue[0];
    // robotFactory pesa 1.5625/nv frente a naniteFactory 0.5/nv
    expect(robotItem.endTime).toBeLessThan(nanoItem.endTime);
  });
});

describe('queueTiming — naves y defensas con el astillero', () => {
  test('subir shipyard acorta la cola de naves y conserva quantity', () => {
    const T0 = Date.now();
    const { state } = enqueueThenUpgrade('ship', 'shipQueue', {
      id: 's1', shipId: 'cruiser', planetId: 'p1', quantity: 3,
      startTime: T0, endTime: T0 + 5 * HOUR,
    }, (b) => { b.shipyard = 5; });

    const item = reconcileQueueTimings(state).shipQueue[0];
    expect(item.endTime).toBeLessThan(T0 + 5 * HOUR);
    expect(item.quantity).toBe(3);
  });

  test('subir shipyard + naniteFactory acorta la cola de defensas', () => {
    const T0 = Date.now();
    const { state } = enqueueThenUpgrade('defense', 'defenseQueue', {
      id: 'd1', defenseId: 'plasmaTurret', planetId: 'p1', quantity: 2,
      startTime: T0, endTime: T0 + 2 * HOUR,
    }, (b) => { b.shipyard = 4; b.naniteFactory = 2; });

    const item = reconcileQueueTimings(state).defenseQueue[0];
    expect(item.endTime).toBeLessThan(T0 + 2 * HOUR);
  });

  test('subir logiCenter (shipTimeBonus) acorta la cola de naves', () => {
    const T0 = Date.now();
    const { state } = enqueueThenUpgrade('ship', 'shipQueue', {
      id: 's2', shipId: 'cruiser', planetId: 'p1', quantity: 1,
      startTime: T0, endTime: T0 + 3 * HOUR,
    }, (b) => { b.logiCenter = 6; });

    expect(shipTimeBonus(state.planets[0].buildings)).toBeGreaterThan(1);
    const item = reconcileQueueTimings(state).shipQueue[0];
    expect(item.endTime).toBeLessThan(T0 + 3 * HOUR);
  });
});

describe('queueTiming — casos límite y robustez', () => {
  test('ignora operaciones ya terminadas', () => {
    const T0 = Date.now() - 10 * HOUR;
    const { state } = enqueueThenUpgrade('research', 'researchQueue', {
      id: 'r3', researchId: 'energy', planetId: 'p1', startTime: T0, endTime: T0 + HOUR,
    }, (b) => { b.researchLab = 9; });

    const item = reconcileQueueTimings(state).researchQueue[0];
    expect(item.endTime).toBe(T0 + HOUR);
  });

  test('backfillea items heredados sin timeMult sin mover su endTime', () => {
    const T0 = Date.now();
    const state = makeState();
    state.researchQueue = [{
      id: 'legacy', researchId: 'energy', planetId: 'p1', startTime: T0, endTime: T0 + HOUR,
    }];
    state.planets[0].buildings.researchLab = 9;

    const out = reconcileQueueTimings(state);
    // Recibe el multiplicador de REFERENCIA (con el lab ya a 9)...
    expect(out.researchQueue[0].timeMult).toBeGreaterThan(0);
    // ...pero su endTime no se altera, porque aún no hay con qué compararlo
    expect(out.researchQueue[0].endTime).toBe(T0 + HOUR);
  });

  test('tras el backfill, el siguiente cambio de bonus sí reajusta', () => {
    const T0 = Date.now();
    const state = makeState();
    state.researchQueue = [{
      id: 'legacy', researchId: 'energy', planetId: 'p1', startTime: T0, endTime: T0 + HOUR,
    }];

    // Tick 1: el lab está a 5, se graba ese multiplicador como referencia
    state.planets[0].buildings.researchLab = 5;
    const once = reconcileQueueTimings(state);
    expect(once.researchQueue[0].endTime).toBe(T0 + HOUR);
    const multAt5 = once.researchQueue[0].timeMult;

    // Tick 2: el lab sube a 10, ahora sí hay contra qué comparar
    const up = { ...once, planets: once.planets.map(p => ({ ...p, buildings: { ...p.buildings, researchLab: 10 } })) };
    const item = reconcileQueueTimings(up).researchQueue[0];

    expect(item.timeMult).toBeLessThan(multAt5); // lab más alto = sondeo más rápido
    expect(item.endTime).toBeLessThan(T0 + HOUR);
  });

  test('no rompe con items corruptos (null, NaN, campos inválidos)', () => {
    const state = makeState();
    state.researchQueue = [
      null,
      { id: 'x', endTime: 'NaN', startTime: 5, timeMult: 10 },
      { id: 'y', researchId: 'energy', planetId: 'p1', startTime: Date.now(), endTime: Date.now() + HOUR, timeMult: 10 },
    ];
    expect(reconcileQueueTimings(state).researchQueue.length).toBe(3);
  });

  test('no produce ruido si el multiplicador no ha cambiado', () => {
    const T0 = Date.now();
    const { state } = enqueueThenUpgrade('research', 'researchQueue', {
      id: 'r5', researchId: 'energy', planetId: 'p1', startTime: T0, endTime: T0 + HOUR,
    }, () => {});

    const item = reconcileQueueTimings(state).researchQueue[0];
    expect(item.endTime).toBe(T0 + HOUR);
  });

  test('nunca deja la duración por debajo del tiempo ya transcurrido', () => {
    const T0 = Date.now();
    const { state } = enqueueThenUpgrade('research', 'researchQueue', {
      id: 'r6', researchId: 'energy', planetId: 'p1', startTime: T0, endTime: T0 + 2000,
    }, (b) => { b.researchLab = 1000; });

    const item = reconcileQueueTimings(state).researchQueue[0];
    expect(Number.isFinite(item.endTime)).toBe(true);
    expect(item.endTime).toBeGreaterThanOrEqual(item.startTime);
  });

  test('no toca operaciones de OTRO planeta', () => {
    const T0 = Date.now();
    const state = makeState();
    state.planets.push({
      id: 'p2', name: 'Beta', faction: 'human',
      buildings: { researchLab: 1 },
      resources: { metal: 1e9, crystal: 1e9, deuterium: 1e9 },
      ministries: {},
    });
    state.researchQueue = [
      stampTimeMult(state, 'research', { id: 'a', researchId: 'energy', planetId: 'p1', startTime: T0, endTime: T0 + HOUR }),
      stampTimeMult(state, 'research', { id: 'b', researchId: 'energy', planetId: 'p2', startTime: T0, endTime: T0 + HOUR }),
    ];
    state.planets[0].buildings.researchLab = 5; // solo p1

    const out = reconcileQueueTimings(state);
    expect(out.researchQueue[0].endTime).toBeLessThan(T0 + HOUR); // p1 se acorta
    expect(out.researchQueue[1].endTime).toBe(T0 + HOUR);        // p2 intacto
  });

  test('reajustar dos veces seguidas es idempotente', () => {
    const T0 = Date.now();
    const { state } = enqueueThenUpgrade('research', 'researchQueue', {
      id: 'r7', researchId: 'energy', planetId: 'p1', startTime: T0, endTime: T0 + 2 * HOUR,
    }, (b) => { b.researchLab = 4; });

    const once = reconcileQueueTimings(state);
    const twice = reconcileQueueTimings(once);
    expect(twice.researchQueue[0].endTime).toBe(once.researchQueue[0].endTime);
  });
});

describe('queueTiming — el sondeo es coherente con la fórmula real', () => {
  test('el cociente de sondeos predice el de duraciones reales (investigación)', () => {
    const lo = { researchLab: 2 };
    const hi = { researchLab: 8 };
    const cost = { metal: 5000, crystal: 4000, deuterium: 2000 };
    const probe = { metal: 1000, crystal: 1000, deuterium: 0 };

    const realRatio =
      calcResearchTime(cost, lo.researchLab, GAME_SPEED, researchTimeBonus(lo), {}, {}) /
      calcResearchTime(cost, hi.researchLab, GAME_SPEED, researchTimeBonus(hi), {}, {});

    const probeRatio =
      calcResearchTime(probe, lo.researchLab, GAME_SPEED, researchTimeBonus(lo), {}, {}) /
      calcResearchTime(probe, hi.researchLab, GAME_SPEED, researchTimeBonus(hi), {}, {});

    expect(probeRatio).toBeCloseTo(realRatio, 2);
  });

  test('el ajuste real coincide con la predicción del sondeo (construcción)', () => {
    const T0 = Date.now();
    const { state, stamped } = enqueueThenUpgrade('build', 'buildQueue', {
      id: 'b9', buildingId: 'metalMine', planetId: 'p1', startTime: T0, endTime: T0 + 4 * HOUR,
    }, (b) => { b.robotFactory = 5; });

    const newMult = timeMultFor(state, 'build', { planetId: 'p1', buildingId: 'metalMine' });
    const item = reconcileQueueTimings(state).buildQueue[0];
    // El sondeo devuelve la duración: mult mayor = más lento, luego la duración
    // escala con multNuevo / multViejo.
    const predicted = 4 * HOUR * (newMult / stamped.timeMult);
    expect(item.endTime - T0).toBeCloseTo(predicted, -3);
  });
});
