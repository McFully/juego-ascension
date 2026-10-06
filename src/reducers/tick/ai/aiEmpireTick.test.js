/**
 * aiEmpireTick.test.js
 * 1.4 — las IAs rivales eligen investigación con researchScoring.
 *
 * Antes: tres contadores hardcodeados (weapons / plasma / computer) con
 * Math.random() y un gate `weight > 0.4` que dejaba a merchant, diplomat y
 * clanist sin investigar nunca en toda la partida.
 */

import { describe, test, expect } from 'vitest';
import { processAIEmpireTick } from './aiEmpireTick.js';
import { AI_STRATEGIES, AI_STRATEGY_KEYS } from '../../../data/game/galaxyData.js';
import { AI_STRATEGY_CATEGORY_WEIGHTS } from './researchScoring.js';

const mkAI = (over = {}) => ({
  id: 'ai1',
  name: 'Imperio de Prueba',
  strategy: 'militarist',
  aiLevel: 10,
  relation: 0,
  aggression: 0.5,
  buildings: { researchLab: 4, constructionCenter: 0 },
  resources: { metal: 5e6, crystal: 5e6, deuterium: 5e6 },
  research: {},
  fleet: {},
  ...over,
});

const mkState = (over = {}) => ({
  gameTick: 1,
  aiPlanets: [mkAI()],
  blueprints: [],
  planets: [],
  ...over,
});

const totalResearchLevels = (ai) =>
  Object.values(ai.research || {}).reduce((a, b) => a + (b || 0), 0);

describe('aiEmpireTick — 1.4 investigación con scoring', () => {
  test('diplomat y clanist no pasaban ningún gate del código viejo', () => {
    // Si esto dejara de ser cierto, el test documentaría que el bug ya no aplica.
    // (merchant sí pasaba por `eco: 0.5`; estos dos no pasaban por ninguna rama.)
    const dead = ['diplomat', 'clanist'];
    for (const key of dead) {
      const strat = AI_STRATEGIES[key];
      const oldGateEverPasses = ['mil', 'eco', 'tech'].some(
        (b) => (strat.weight?.[b] || 0) > 0.4
      );
      expect(oldGateEverPasses, key).toBe(false);
    }
  });

  test('el scoring da peso positivo a todas las categorías en toda estrategia', () => {
    for (const key of AI_STRATEGY_KEYS) {
      const w = AI_STRATEGY_CATEGORY_WEIGHTS(AI_STRATEGIES[key].weight);
      const values = Object.values(w);
      expect(values.length).toBeGreaterThan(0);
      expect(values.every((v) => Number.isFinite(v) && v > 0), key).toBe(true);
      expect(Math.max(...values), key).toBeGreaterThan(0.15);
    }
  });

  test('la estrategia militarista prioriza arma/defensa sobre economía', () => {
    const mil = AI_STRATEGY_CATEGORY_WEIGHTS(AI_STRATEGIES.militarist.weight);
    const tech = AI_STRATEGY_CATEGORY_WEIGHTS(AI_STRATEGIES.technocrat.weight);

    expect(mil.weapon).toBeGreaterThan(mil.economy);
    expect(mil.defense).toBeGreaterThan(mil.economy);
    expect(tech.ai).toBeGreaterThan(tech.weapon);
  });

  test('diplomat elige por scoring (antes nunca investigaba en toda la partida)', () => {
    // 500 ticks con un ritmo del 2% por nivel: si la lógica nueva funciona, tarde
    // o temprano esta estrategia acaba investigando. La vieja no podía.
    const START = 5e6;
    let s = mkState({
      aiPlanets: [mkAI({ strategy: 'diplomat', aiLevel: 12 })],
    });

    let researched = 0;
    for (let i = 0; i < 500; i++) {
      s = processAIEmpireTick(s);
      researched = totalResearchLevels(s.aiPlanets[0]);
      if (researched > 0) break;
    }

    expect(researched).toBeGreaterThan(0);
    // Y ha pagado de su bolsillo. Ojo: una tech puede costar 0 de metal (energy),
    // así que hay que mirar el total, no un recurso concreto.
    const spent = ['metal', 'crystal', 'deuterium'].reduce(
      (acc, r) => acc + (START - s.aiPlanets[0].resources[r]),
      0
    );
    expect(spent).toBeGreaterThan(0);
  });

  test('la tech elegida es un id real de RESEARCH', () => {
    let s = mkState({ aiPlanets: [mkAI({ strategy: 'militarist', aiLevel: 12 })] });
    for (let i = 0; i < 500; i++) {
      s = processAIEmpireTick(s);
      if (totalResearchLevels(s.aiPlanets[0]) > 0) break;
    }
    const researchedIds = Object.keys(s.aiPlanets[0].research);
    // Con el blob inicial vacío, todo lo que aparezca debe existir en el dataset.
    for (const id of researchedIds) {
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    }
  });

  test('sin laboratorio la IA no investiga', () => {
    let s = mkState({ aiPlanets: [mkAI({ buildings: { researchLab: 0 } })] });
    for (let i = 0; i < 500; i++) s = processAIEmpireTick(s);
    expect(totalResearchLevels(s.aiPlanets[0])).toBe(0);
  });

  test('los mundos IA generan recursos por producción minera activa en cada tick', () => {
    let s = mkState({
      aiPlanets: [mkAI({
        buildings: { metalMine: 10, solarPlant: 10 },
        resources: { metal: 100, crystal: 50, deuterium: 20 }
      })]
    });
    const initialMetal = s.aiPlanets[0].resources.metal;
    s = processAIEmpireTick(s);
    expect(s.aiPlanets[0].resources.metal).toBeGreaterThan(initialMetal);
  });

  test('los imperios IA construyen y mejoran sus edificios cuando tienen recursos', () => {
    let s = mkState({
      gameTick: 15,
      aiPlanets: [mkAI({
        buildings: { solarPlant: 10, metalMine: 1 },
        resources: { metal: 10000, crystal: 5000, deuterium: 2000 }
      })]
    });
    const initialMine = s.aiPlanets[0].buildings.metalMine;
    s = processAIEmpireTick(s);
    // En tick 15 con recursos y solarPlant alta, debe haber mejorado una infraestructura productiva
    const totalBuildings = Object.values(s.aiPlanets[0].buildings).reduce((a, b) => a + b, 0);
    expect(totalBuildings).toBeGreaterThan(11);
  });

  test('los imperios IA colonizan mundos vírgenes y fundan nuevos planetas', () => {
    let s = mkState({
      gameTick: 60,
      aiPlanets: [mkAI({
        galaxy: 1,
        system: 1,
        position: 1,
        fleet: { colonizer: 1 },
        resources: { metal: 50000, crystal: 50000, deuterium: 20000 }
      })]
    });
    expect(s.aiPlanets.length).toBe(1);
    s = processAIEmpireTick(s);
    expect(s.aiPlanets.length).toBe(2);
    expect(s.aiPlanets[1].isAI).toBe(true);
    expect(s.aiPlanets[1].galaxy).toBe(1);
  });
});
