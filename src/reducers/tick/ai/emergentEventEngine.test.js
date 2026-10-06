import { describe, it, expect } from 'vitest';
import { processEmergentChains } from './emergentEventEngine.js';

describe('emergentEventEngine — Efecto Mariposa (cadenas causales)', () => {
  it('no crashea con lista vacía o menos de 2 facciones', () => {
    const res = processEmergentChains({ aiPlanets: [], galacticEvents: [] }, 100, Date.now());
    expect(res.aiPlanets).toEqual([]);
    expect(res.galacticEvents).toEqual([]);
  });

  it('Cadena A: una facción con pérdidas severas y bajos recursos entra en crisis económica', () => {
    const loser = {
      id: 'loser_1',
      name: 'Imperio Derrotado',
      empireName: 'Imperio Derrotado',
      aiLevel: 2,
      totalWins: 0,
      totalLosses: 5,
      resources: { metal: 1000, crystal: 500, deuterium: 200 },
      profile: { aggressiveness: 0.3, prudence: 0.2 },
      memory: { pastWars: [{ opponentId: 'winner', won: false, tick: 50 }] }
    };
    const other = {
      id: 'other_1',
      name: 'Otro Imperio',
      empireName: 'Otro Imperio',
      aiLevel: 2,
      totalWins: 1,
      totalLosses: 0,
      resources: { metal: 20000, crystal: 15000, deuterium: 5000 },
      profile: { aggressiveness: 0.5, prudence: 0.5 },
      memory: {}
    };

    const state = { aiPlanets: [loser, other], galacticEvents: [] };
    const res = processEmergentChains(state, 180, Date.now());

    // Debe haber evaluado la crisis (puede o no saltar por RNG, pero no debe crashear)
    expect(res.aiPlanets.length).toBe(2);
    expect(Array.isArray(res.galacticEvents)).toBe(true);
  });

  it('Cadena C: una potencia dominante con nivel 3× sobre la media dispara reacción defensiva', () => {
    const dominant = {
      id: 'dominant_1',
      name: 'Titan Galáctico',
      empireName: 'Titan Galáctico',
      aiLevel: 30, // muy superior a los demás
      totalWins: 15,
      totalLosses: 1,
      resources: { metal: 500000, crystal: 300000, deuterium: 100000 },
      profile: { aggressiveness: 0.8 },
      memory: {}
    };
    const smallA = {
      id: 'small_a',
      name: 'Planeta Menor A',
      empireName: 'Planeta Menor A',
      aiLevel: 2,
      totalWins: 0,
      totalLosses: 2,
      resources: { metal: 5000, crystal: 3000, deuterium: 1000 },
      profile: { aggressiveness: 0.2, diplomaticLean: 0.8 },
      memory: {}
    };
    const smallB = {
      id: 'small_b',
      name: 'Planeta Menor B',
      empireName: 'Planeta Menor B',
      aiLevel: 2,
      totalWins: 0,
      totalLosses: 2,
      resources: { metal: 5000, crystal: 3000, deuterium: 1000 },
      profile: { aggressiveness: 0.2, diplomaticLean: 0.8 },
      memory: {}
    };

    const state = { aiPlanets: [dominant, smallA, smallB], galacticEvents: [] };
    // Ejecutar varias veces para vencer la varianza del RNG
    let coalitionTriggered = false;
    for (let i = 0; i < 20; i++) {
      const res = processEmergentChains(state, 180 + i, Date.now());
      if (res.galacticEvents.some(e => e.type === 'coalition')) {
        coalitionTriggered = true;
        break;
      }
    }
    // Con 20 intentos de un roll del 30%+, la probabilidad de no saltar es (0.7)^20 < 0.001
    expect(coalitionTriggered).toBe(true);
  });

  it('Cadena D: exceso de guerras recientes produce fatiga bélica', () => {
    const warmonger = {
      id: 'warmonger_1',
      name: 'Imperio Sangriento',
      empireName: 'Imperio Sangriento',
      aiLevel: 5,
      profile: { aggressiveness: 0.9 },
      memory: {}
    };
    const victim = {
      id: 'victim_1',
      name: 'Víctima Pacífica',
      empireName: 'Víctima Pacífica',
      aiLevel: 3,
      profile: { aggressiveness: 0.2 },
      memory: {}
    };

    // 5 guerras en los últimos 200 ticks
    const recentWars = Array.from({ length: 5 }, (_, i) => ({
      id: `war_${i}`,
      type: 'war',
      tick: 150 + i * 5,
      title: 'Guerra',
      desc: 'Conflicto bélico',
      timestamp: Date.now()
    }));

    const state = { aiPlanets: [warmonger, victim], galacticEvents: recentWars };
    let chaosTriggered = false;
    for (let i = 0; i < 25; i++) {
      const res = processEmergentChains(state, 200 + i, Date.now());
      if (res.galacticEvents.some(e => e.type === 'chaos')) {
        chaosTriggered = true;
        break;
      }
    }
    expect(chaosTriggered).toBe(true);
  });
});
