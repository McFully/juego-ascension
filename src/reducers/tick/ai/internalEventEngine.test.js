import { describe, it, expect } from 'vitest';
import { processInternalEvents } from './internalEventEngine.js';

describe('internalEventEngine — Eventos Internos y Estabilidad de Facciones', () => {
  it('no falla con estados vacíos o sin planetas activos', () => {
    const res = processInternalEvents({ aiPlanets: [], galacticEvents: [] }, 10, Date.now());
    expect(res.aiPlanets).toEqual([]);
    expect(res.galacticEvents).toEqual([]);
  });

  it('Rebelión: facción castigada con pérdidas y sin recursos puede sufrir rebelión', () => {
    const unstableFaction = {
      id: 'unstable_1',
      name: 'Imperio Colapsado',
      empireName: 'Imperio Colapsado',
      aiLevel: 3,
      totalWins: 0,
      totalLosses: 8,
      resources: { metal: 500, crystal: 300, deuterium: 100 },
      buildings: { researchLab: 1 },
      fleet: { lightFighter: 20 },
      defenses: { rocketLauncher: 15 },
      profile: { aggressiveness: 0.85, prudence: 0.1, trust: 0.4 },
      memory: {
        pastWars: Array(5).fill({ opponentId: 'rival', won: false, tick: 20 })
      },
      _crisis: { active: true }
    };

    const state = { aiPlanets: [unstableFaction], galacticEvents: [] };
    let triggered = false;

    // Iterar para superar varianza del roll probabilístico
    for (let t = 1; t <= 30; t++) {
      const res = processInternalEvents(state, t * 10, Date.now());
      if (res.galacticEvents.some(e => e.type === 'rebellion')) {
        triggered = true;
        const modified = res.aiPlanets[0];
        expect(modified._rebellion?.active).toBe(true);
        expect(modified.strategicDirective?.directive).toBe('FORTIFY');
        break;
      }
    }

    expect(triggered).toBe(true);
  });

  it('Superciclo Comercial: facción comercial con múltiples rutas experimenta boom de recursos', () => {
    const tradeEmpire = {
      id: 'trade_1',
      name: 'Consorcio Mercante',
      empireName: 'Consorcio Mercante',
      aiLevel: 4,
      resources: { metal: 20000, crystal: 15000, deuterium: 5000 },
      tradeRoutes: [
        { partnerId: 'p1', volume: 1000 },
        { partnerId: 'p2', volume: 1500 },
        { partnerId: 'p3', volume: 800 }
      ],
      profile: { commercialLean: 0.85, prudence: 0.7 },
      memory: {}
    };

    const state = { aiPlanets: [tradeEmpire], galacticEvents: [] };
    let boomTriggered = false;

    for (let t = 1; t <= 30; t++) {
      const res = processInternalEvents(state, t * 10, Date.now());
      if (res.galacticEvents.some(e => e.type === 'boom')) {
        boomTriggered = true;
        const modified = res.aiPlanets[0];
        expect(modified.resources.metal).toBeGreaterThan(20000);
        break;
      }
    }

    expect(boomTriggered).toBe(true);
  });

  it('Avance Científico: facción con labs y directiva TECH logra avance espontáneo', () => {
    const techEmpire = {
      id: 'tech_1',
      name: 'Academia Galáctica',
      empireName: 'Academia Galáctica',
      aiLevel: 5,
      buildings: { researchLab: 6 },
      research: { energyTech: 3, laserTech: 2 },
      strategicDirective: { directive: 'TECH' },
      profile: { techLean: 0.85 },
      memory: {}
    };

    const state = { aiPlanets: [techEmpire], galacticEvents: [] };
    let techTriggered = false;

    for (let t = 1; t <= 30; t++) {
      const res = processInternalEvents(state, t * 10, Date.now());
      if (res.galacticEvents.some(e => e.type === 'tech_breakthrough')) {
        techTriggered = true;
        const modified = res.aiPlanets[0];
        const sum = Object.values(modified.research).reduce((a, b) => a + b, 0);
        expect(sum).toBeGreaterThan(5);
        break;
      }
    }

    expect(techTriggered).toBe(true);
  });
});
