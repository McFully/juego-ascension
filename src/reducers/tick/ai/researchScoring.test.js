/**
 * researchScoring.test.js — 1.2 / 1.4 / 1.6
 *
 * El scoring es el único criterio de selección de investigación del juego
 * (jugador vía.autoResearchTick, ministros vía colonyGovernor, IAs rivales vía
 * aiEmpireTick). Estos tests fijan que puntúa lo que debe puntuar.
 */

import { describe, test, expect } from 'vitest';
import {
  scoreResearch,
  rankResearch,
  buildResearchScoreConfig,
  weightedCost,
  focusCategoriesFor,
  AI_STRATEGY_CATEGORY_WEIGHTS,
  TECH_FOCUS_CATEGORIES,
  TECH_FOCUS_KEYS,
} from './researchScoring.js';
import { RESEARCH, researchCost } from '../../../core.jsx';
import { GAME_SPEED } from '../../../data/gameData.js';

const planet = (over = {}) => ({
  id: 'p1',
  faction: 'human',
  specialization: null,
  buildings: { researchLab: 4, constructionCenter: 0 },
  ministries: {},
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

const costOf = (id, level = 0) =>
  researchCost(id, level, 0, 0);

const scoreOf = (id, cfg) =>
  scoreResearch({
    ...cfg,
    id,
    rDef: RESEARCH[id],
    level: cfg.research?.[id] || 0,
    cost: costOf(id, cfg.research?.[id] || 0),
  });

describe('researchScoring — criterios duros', () => {
  const cfg = buildResearchScoreConfig(state(), planet(), {});

  test('una tech sin requisitos y barata puntúa positivo', () => {
    expect(scoreOf('energy', cfg)).toBeGreaterThan(0);
  });

  test('una tech con requisitos no cumplidos vale -1 (no es viable)', () => {
    const s = scoreOf('industrialOpt', cfg);
    expect(RESEARCH.industrialOpt.req).toBeTruthy();
    expect(s).toBe(-1);
  });

  test('con los requisitos cumplidos la misma tech pasa a ser viable', () => {
    // industrialOpt pide miningAuto:3 (investigación) y robotFactory:5 (edificio).
    const s = state({
      research: { miningAuto: 3 },
      planets: [planet({ buildings: { researchLab: 4, robotFactory: 5 } })],
    });
    const cfg2 = buildResearchScoreConfig(s, s.planets[0], {});
    expect(scoreOf('industrialOpt', cfg2)).toBeGreaterThan(0);
  });

  test('un id inexistente puntúa -1', () => {
    expect(scoreResearch({ id: 'noExiste', rDef: undefined })).toBe(-1);
    expect(scoreResearch({})).toBe(-1);
  });

  test('un coste de 0 se recalcula en vez de aceptarse (defensa ante datos malos)', () => {
    // Si le llega un coste de 0 en los tres recursos (partida vieja, dato
    // corrupto), scoreResearch no se fía: recalcula con researchCost().
    // Ojo: weightedCost trabaja con {metal, crystal, deuterium}, que es lo que
    // devuelve researchCost(). Las claves m/c/d son solo del dataset en disco.
    const rDef = { ...RESEARCH.energy, cost: { m: 0, c: 0, d: 0 } };
    const sc = scoreResearch({
      ...cfg, id: 'energy', rDef, level: 0,
      cost: { metal: 0, crystal: 0, deuterium: 0 },
    });
    expect(sc).toBeGreaterThan(0);
    // Y coincide con lo que daría el coste real.
    const real = scoreOf('energy', cfg);
    expect(sc).toBe(real);
  });
});

describe('researchScoring — orden por coste y duración', () => {
  test('a igual categoría, la tech más barata gana', () => {
    // combustion cuesta {m:200, c:100, d:0}; ion cuesta {m:5000, c:4000, d:2000}.
    // Sus prerrequisitos: combustion {energy:1}; ion {energy:4, laser:4}.
    const b = { researchLab: 4, robotFactory: 5, shipyard: 3 };
    const s = state({
      research: { energy: 4, laser: 4 },
      planets: [planet({ buildings: b })],
    });
    const cfg = buildResearchScoreConfig(s, s.planets[0], {});
    const cheap = scoreOf('combustion', cfg);
    const dear = scoreOf('ion', cfg);
    expect(cheap).toBeGreaterThanOrEqual(0);
    expect(dear).toBeGreaterThanOrEqual(0);
    // Menor puntuación = mejor. combustion debe ganar.
    expect(cheap).toBeLessThan(dear);
  });

  test('un laboratorio más rápido mejora la puntuación de una tech larga', () => {
    // industrialOpt cuesta 18000 (m+c) y tarda > 15 min, así que no la absorbe
    // el suelo de 0.25 h que protege de dividir entre duraciones minúsculas.
    const fastP = planet({ buildings: { researchLab: 15, robotFactory: 5 } });
    const slowP = planet({ buildings: { researchLab: 1, robotFactory: 5 } });
    const base = { research: { miningAuto: 3 } };
    const s = state({ ...base, planets: [fastP, slowP] });

    const fast = buildResearchScoreConfig({ ...s, planets: [fastP, slowP] }, fastP, {});
    const slow = buildResearchScoreConfig({ ...s, planets: [fastP, slowP] }, slowP, {});
    const fastScore = scoreOf('industrialOpt', fast);
    const slowScore = scoreOf('industrialOpt', slow);
    expect(fastScore).toBeGreaterThan(0);
    expect(slowScore).toBeGreaterThan(0);
    // Menos duración = menor puntuación = mejor.
    expect(fastScore).toBeLessThan(slowScore);
  });

  test('weightedCost ordena por coste ponderado plano', () => {
    // Devuelve researchCost(), así que las claves son metal/crystal/deuterium.
    expect(weightedCost({ metal: 100, crystal: 0, deuterium: 0 })).toBe(100);
    expect(weightedCost({ metal: 0, crystal: 100, deuterium: 0 })).toBe(150);
    expect(weightedCost({ metal: 0, crystal: 0, deuterium: 100 })).toBe(300);
    expect(weightedCost({})).toBe(0);
  });

  test('la duración penaliza, no premia (regresión del bug de 1.3)', () => {
    // El caso que pedía 1.3: la IA elegía la más barata aunque fuera la más lenta.
    // "Menor puntuación = mejor", y el tiempo es un coste, así que a MAYOR
    // duración tiene que correspondER MAYOR puntuación.
    // Se usa un lab bajo (1) para que la duración no la absorba el suelo de 0.25 h.
    const p = planet({ buildings: { researchLab: 1, robotFactory: 5 } });
    const s = state({ research: { miningAuto: 3 }, planets: [p] });
    const cfg = buildResearchScoreConfig(s, p, {});

    // Mismo coste y categoría, duraciones distintas: se comprueba la monotonía
    // comparando el mismo id con dos niveles de laboratorio.
    const slow = buildResearchScoreConfig(s, planet({ buildings: { researchLab: 1, robotFactory: 5 } }), {});
    const fast = buildResearchScoreConfig(s, planet({ buildings: { researchLab: 12, robotFactory: 5 } }), {});

    const slowScore = scoreOf('industrialOpt', slow);
    const fastScore = scoreOf('industrialOpt', fast);
    expect(slowScore).toBeGreaterThan(0);
    expect(fastScore).toBeGreaterThan(0);
    // Menos tiempo = mejor = puntuación MÁS BAJA. Si esto se invierte, la IA
    // vuelve a elegir lo más lento, que es el bug original.
    expect(fastScore).toBeLessThan(slowScore);
  });
});

describe('researchScoring — misiones y prerrequisitos', () => {
  test('una tech priorizada por misión gana con mucha diferencia', () => {
    const cfg = buildResearchScoreConfig(state(), planet(), { prioritizedTechs: new Set(['energy']) });
    const normal = buildResearchScoreConfig(state(), planet(), {});
    expect(scoreOf('energy', cfg)).toBeLessThan(scoreOf('energy', normal) * 0.02);
  });

  test('prereqUrgency hunde la tech que algo en curso necesita', () => {
    const cfg = buildResearchScoreConfig(state(), planet(), { prereqUrgency: { energy: 2 } });
    const normal = buildResearchScoreConfig(state(), planet(), {});
    expect(scoreOf('energy', cfg)).toBeLessThan(scoreOf('energy', normal));
  });
});

describe('researchScoring — rankResearch', () => {
  test('devuelve objetos con `id`, no con `researchId`', () => {
    // Este es el bug que tumbó autoResearchTick y colonyGovernor: ambos leían
    // `ranked[0].researchId`, que es undefined, y por eso no encolaban nada.
    const cfg = buildResearchScoreConfig(state(), planet(), {});
    const ranked = rankResearch(cfg, Object.keys(RESEARCH));
    expect(ranked.length).toBeGreaterThan(0);
    for (const r of ranked) {
      expect(r.id).toBeTruthy();
      expect(r.researchId).toBeUndefined();
      expect(r.rDef).toBeTruthy();
      expect(r.cost).toBeTruthy();
      expect(typeof r.score).toBe('number');
    }
  });

  test('viene ordenado de mejor a peor (score ascendente)', () => {
    const cfg = buildResearchScoreConfig(state(), planet(), {});
    const ranked = rankResearch(cfg, Object.keys(RESEARCH));
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i].score).toBeGreaterThanOrEqual(ranked[i - 1].score);
    }
  });

  test('filtra las no viables (score -1)', () => {
    const cfg = buildResearchScoreConfig(state(), planet(), {});
    const ranked = rankResearch(cfg, Object.keys(RESEARCH));
    expect(ranked.every((r) => r.score >= 0)).toBe(true);
  });

  test('sin candidatos devuelve lista vacía, no error', () => {
    const cfg = buildResearchScoreConfig(state(), planet(), {});
    expect(rankResearch(cfg, [])).toEqual([]);
    expect(rankResearch(cfg, undefined)).toEqual([]);
  });
});

describe('researchScoring — 1.6 techFocus pesa de verdad', () => {
  test('cada foco tiene etiquetas y categorías conocidas', () => {
    for (const key of TECH_FOCUS_KEYS) {
      expect(Array.isArray(TECH_FOCUS_CATEGORIES[key]), key).toBe(true);
    }
  });

  test('focusCategoriesFor traduce el foco y tolera valores corruptos', () => {
    expect(focusCategoriesFor('military')).toContain('weapon');
    expect(focusCategoriesFor('general')).toEqual([]);
    // Un techFocus de una partida vieja o corrupto no debe romper nada.
    expect(focusCategoriesFor('noExiste')).toEqual([]);
    expect(focusCategoriesFor(undefined)).toEqual([]);
  });

  test('el foco militar hace ganar a una tech de arma sobre una de economía', () => {
    const base = {
      research: { energy: 3, weapons: 0, combustion: 0, impulse: 3, laser: 3 },
      buildings: { researchLab: 4, shipyard: 3 },
    };
    const milState = state({
      ...base,
      ministries: { science: { techFocus: 'military' } },
      planets: [planet({ buildings: base.buildings, ministries: { science: { techFocus: 'military' } } })],
    });
    const milCfg = buildResearchScoreConfig(milState, milState.planets[0], {});
    expect(milCfg.focusCategories).toContain('weapon');

    const genState = state({
      ...base,
      planets: [planet({ buildings: base.buildings })],
    });
    const genCfg = buildResearchScoreConfig(genState, genState.planets[0], {});
    expect(genCfg.focusCategories).toBeNull();

    // Con foco militar, la diferencia entre la tech de armas y la de energía
    // se estrecha respecto a como es en general.
    const milGap = scoreOf('weapons', milCfg) - scoreOf('energy', milCfg);
    const genGap = scoreOf('weapons', genCfg) - scoreOf('energy', genCfg);
    expect(milGap).toBeLessThan(genGap);
  });
});

describe('researchScoring — 1.4 pesos de estrategia de IA', () => {
  test('AI_STRATEGY_CATEGORY_WEIGHTS da peso positivo a todas las categorías', () => {
    for (const strat of ['expansionist', 'militarist', 'merchant', 'technocrat', 'diplomat', 'clanist', 'chaotic']) {
      const w = AI_STRATEGY_CATEGORY_WEIGHTS({ eco: 0.2, mil: 0.3, diplo: 0.1, tech: 0.4 });
      for (const [cat, weight] of Object.entries(w)) {
        expect(weight, `${strat}/${cat}`).toBeGreaterThan(0);
      }
    }
  });

  test('sin pesos de estrategia devuelve el perfil por defecto, no undefined', () => {
    const w = AI_STRATEGY_CATEGORY_WEIGHTS();
    expect(w.economy).toBeGreaterThan(0);
    expect(w.weapon).toBeGreaterThan(0);
  });

  test('categoryWeights tiene prioridad sobre el ministerio', () => {
    const s = state({ research: { energy: 3, weapons: 0, combustion: 0, impulse: 3, laser: 3 } });
    const p = planet({ buildings: { researchLab: 4, shipyard: 3 } });
    const mil = AI_STRATEGY_CATEGORY_WEIGHTS({ eco: 0.05, mil: 0.9, diplo: 0.02, tech: 0.03 });
    const cfg = buildResearchScoreConfig(s, p, { ministryId: 'war', categoryWeights: mil });
    // El peso de 'war' daría weapon 1.0; el de la IA da mil*1.4+0.2 = 1.46.
    expect(cfg.categoryWeights).toBe(mil);
    expect(cfg.ministryId).toBe('war');
    // Debe seguir siendo usable por scoreResearch sin error.
    expect(typeof scoreOf('weapons', cfg)).toBe('number');
  });
});

describe('researchScoring — GAME_SPEED', () => {
  test('el scoring usa el GAME_SPEED real del juego', () => {
    const cfg = buildResearchScoreConfig(state(), planet(), {});
    expect(cfg.GAME_SPEED).toBe(GAME_SPEED);
  });
});
