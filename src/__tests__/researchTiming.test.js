/**
 * researchTiming.test.js
 * El tiempo de investigación se calculaba en tres sitios que discrepaban.
 * Ahora hay UNO. Estos tests fijan el comportamiento correcto.
 */

import { describe, test, expect } from 'vitest';
import {
  calcPlanetResearchTime,
  researchTimeMultFor,
} from '../utils/formulas/researchTiming.js';
import { researchTimeBonus, calcResearchTime, researchCost } from '../utils/formulas.js';
import { GAME_SPEED, FACTIONS } from '../core.jsx';
import { stampTimeMult } from '../reducers/tick/queues/queueTiming.js';
import { processAutoResearchTick } from '../reducers/tick/automation/autoResearchTick.js';

const COST = { metal: 10000, crystal: 8000, deuterium: 0 };

const planet = (over = {}) => ({
  id: 'p1', faction: 'human', specialization: null,
  buildings: { researchLab: 4 }, ministries: {},
  resources: { metal: 1e9, crystal: 1e9, deuterium: 1e9 },
  ...over,
});

const state = (over = {}) => ({
  currentPlanetId: 'p1',
  research: {},
  ministries: {},
  researchQueue: [],
  planets: [planet()],
  ...over,
});

describe('researchTiming — source of truth', () => {
  test('devuelve un tiempo positivo y en segundos', () => {
    const t = calcPlanetResearchTime(state(), planet(), COST);
    expect(t).toBeGreaterThan(0);
    expect(Number.isFinite(t)).toBe(true);
  });

  test('NO duplica el 1 de researchTimeBonus (el bug de autoResearchTick)', () => {
    // researchTimeBonus ya devuelve 1 + aceleradores.
    const b = { researchLab: 4, advResearchCenter: 10 };
    const raw = researchTimeBonus(b, {});           // 1 + 0.8 = 1.8
    expect(raw).toBeCloseTo(1.8, 5);

    const t = calcPlanetResearchTime(state(), planet({ buildings: b }), COST);
    // El manual correcto debe incluir faction bonus (human = 1.10) y grants (0.05 default)
    const factionBonus = 1.10;
    const grantBonus = 1 + 0.05 * 2;
    const correcto = calcResearchTime(COST, 4, GAME_SPEED, raw * factionBonus, {}, {}) / grantBonus * grantBonus; // simplifica: factor * grantBonus
    // Mejor: llamar a calcResearchTime con el factor completo (incluye faction) y grants
    const manual = calcResearchTime(COST, 4, GAME_SPEED, raw * factionBonus, { science: { researchGrants: 0.05 } }, {});
    expect(t).toBe(manual);
  });

  test('aplica TODOS los aceleradores de edificios', () => {
    const base = calcPlanetResearchTime(state(), planet({ buildings: { researchLab: 4 } }), COST);
    for (const b of ['advResearchCenter', 'aiCore', 'nanoCenter', 'expLab',
      'galacticMarket', 'quantumSupercomputer', 'particleAccelerator', 'centralAiResearch']) {
      const t = calcPlanetResearchTime(state(), planet({ buildings: { researchLab: 4, [b]: 10 } }), COST);
      expect(t).toBeLessThan(base);
    }
  });

  test('aplica las techs de investigación que antes se ignoraban', () => {
    const s0 = state({ research: {} });
    const s1 = state({ research: { quantumNetworks: 5 } });
    expect(calcPlanetResearchTime(s1, planet(), COST))
      .toBeLessThan(calcPlanetResearchTime(s0, planet(), COST));
  });

  test('synchronousOptical acelera (antes researchReducer lo ignoraba)', () => {
    const s0 = state({ research: {} });
    const s1 = state({ research: { synchronousOptical: 10 } });
    expect(calcPlanetResearchTime(s1, planet(), COST))
      .toBeLessThan(calcPlanetResearchTime(s0, planet(), COST));
  });

  test('el ministro de ciencia con researchSpeed acelera', () => {
    const s0 = state();
    const s1 = state();
    const p = planet({ ministries: { science: { minister: { bonus: 'researchSpeed' } } } });
    expect(calcPlanetResearchTime(s1, p, COST))
      .toBeLessThan(calcPlanetResearchTime(s0, planet(), COST));
  });

  test('researchGrants del ministerio aceleran', () => {
    const p0 = planet({ ministries: { science: { researchGrants: 0.0 } } });
    const p1 = planet({ ministries: { science: { researchGrants: 0.5 } } });
    expect(calcPlanetResearchTime(state(), p1, COST))
      .toBeLessThan(calcPlanetResearchTime(state(), p0, COST));
  });

  test('los grants se aplican UNA sola vez', () => {
    // El bug duplicaba los grants: a mano y dentro de calcResearchTime
    const grants = 0.5;
    const p = planet({ ministries: { science: { researchGrants: grants } } });
    const t = calcPlanetResearchTime(state(), p, COST);
    // Incluir faction bonus (human = 1.10) en el manual para igualar al helper
    const factionBonus = 1.10;
    const raw = researchTimeBonus({ researchLab: 4 }, {});
    const esperado = calcResearchTime(COST, 4, GAME_SPEED, raw * factionBonus, { science: { researchGrants: grants } }, {});
    expect(t).toBe(esperado);
  });

  test('la facción y la especialización también cuentan', () => {
    const base = calcPlanetResearchTime(state(), planet(), COST);
    const sci = calcPlanetResearchTime(state(), planet({ specialization: 'scientific' }), COST);
    expect(sci).toBeLessThan(base);

    const otra = calcPlanetResearchTime(
      state(),
      planet({ faction: Object.keys({ human: 1 })[0] === 'human' ? 'terran' : 'human' }),
      COST
    );
    expect(Number.isFinite(otra)).toBe(true);
  });
});

describe('researchTiming — el multiplicador de sondeo', () => {
  test('researchTimeMultFor devuelve null sin planeta', () => {
    expect(researchTimeMultFor(state(), null)).toBeNull();
  });

  test('el multiplicador es un FACTOR: más edificios = menor valor', () => {
    const bajo = researchTimeMultFor(state(), planet({ buildings: { researchLab: 1 } }));
    const alto = researchTimeMultFor(state(), planet({ buildings: { researchLab: 10 } }));
    expect(alto).toBeLessThan(bajo);
  });

  test('el cociente de sondeos predice el de duraciones reales', () => {
    const pBajo = planet({ buildings: { researchLab: 2 } });
    const pAlto = planet({ buildings: { researchLab: 8 } });
    const realRatio = calcPlanetResearchTime(state(), pBajo, COST) / calcPlanetResearchTime(state(), pAlto, COST);
    const probeRatio = researchTimeMultFor(state(), pBajo) / researchTimeMultFor(state(), pAlto);
    expect(probeRatio).toBeCloseTo(realRatio, 1);
  });

  test('lo que se estampa coincide con lo que se recalcula', () => {
    const s = state();
    const item = stampTimeMult(s, 'research', { planetId: 'p1', researchId: 'energy' });
    expect(item.timeMult).toBe(researchTimeMultFor(s, s.planets[0]));
  });
});

describe('researchTiming — autoResearchTick usa el helper único', () => {
  test('la cola automática se estampa con timeMult', () => {
    const s = state({
      research: { energy: 0 },
      planets: [planet({
        buildings: { researchLab: 4 },
        ministries: { science: { automationEnabled: true, researchGrants: 0.05 } },
      })],
    });
    const out = processAutoResearchTick(s);
    expect(out.researchQueue.length).toBe(1);
    expect(out.researchQueue[0].timeMult).toBeGreaterThan(0);
  });

  test('el tiempo de la cola automática coincide con el del helper', () => {
    const s = state({
      research: { energy: 0 },
      planets: [planet({
        buildings: { researchLab: 4 },
        ministries: { science: { automationEnabled: true, researchGrants: 0.05 } },
      })],
    });
    const out = processAutoResearchTick(s);
    const item = out.researchQueue[0];
    const cost = researchCost(item.researchId, 0, 0, 0);
    // Usar el estado de SALIDA (out) que tiene el planeta con los recursos ya descontados
    // y los mismos edificios/ministerios. Coincide con lo que usó autoResearchTick.
    const esperado = calcPlanetResearchTime(out, out.planets[0], cost);
    expect((item.endTime - item.startTime) / 1000).toBe(esperado);
  });
});
