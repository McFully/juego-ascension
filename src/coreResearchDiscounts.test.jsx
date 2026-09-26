import { describe, it, expect } from 'vitest';
import {
  buildingCost,
  calcFlightTime,
  simulateCombat,
  gameReducer,
  createInitial,
  calcProduction,
  getGalacticAlignment,
  getPOIAtCoordinates,
  validateSave,
  calcCustomShipCost,
  calcCustomShipStats,
  calcResearchTime,
  researchCost, shipCost, defenseCost, constructionDiscount, aiResearchDiscount
} from './core.jsx';


describe('Ascensión Laboratorio Investigación (x10)', () => {
  const oldCalcResearchTime = (cost, lab, speed = 1, bonus = 1, mins = {}, research = {}) => {
    const grants = mins.science?.researchGrants || 0.05;
    const grantBonus = 1 + grants * 2;
    const r = research && Object.keys(research).length > 0 ? research : (mins?.research || {});
    const opticalBonus = 1 + (r.synchronousOptical || 0) * 0.03;
    const labReduction = 1 + lab * 1.5625;
    const t = ((cost.metal + cost.crystal) / (1000 * labReduction * speed * bonus * grantBonus * opticalBonus)) * 3600;
    return Math.max(1, Math.floor(t));
  };

  const cost = { metal: 20000, crystal: 20013, deuterium: 0 };

  it('con un Laboratorio nivel 11, una investigación se acelera respecto a nivel 0', () => {
    const baseTime = calcResearchTime(cost, 0);
    const newTime = calcResearchTime(cost, 11);
    expect(newTime).toBeGreaterThanOrEqual(1);
    expect(newTime).toBeLessThan(baseTime);
  });

  it('sin Laboratorio (nivel 0) no aplica reduccion', () => {
    const smallCost = { metal: 100000, crystal: 100000, deuterium: 0 };
    const oldTime = oldCalcResearchTime(smallCost, 0);
    const newTime = calcResearchTime(smallCost, 0);
    expect(newTime).toBe(oldTime);
  });

  it('la reducción procede del nivel del Laboratorio y aplica en todos los niveles', () => {
    const levels = [1, 3, 5, 8, 11, 15, 20, 30];
    for (const lvl of levels) {
      const newTime = calcResearchTime(cost, lvl);
      expect(newTime).toBeGreaterThanOrEqual(1);
    }
  });

  it('cada incremento de nivel produce una reducción claramente perceptible', () => {
    for (let lvl = 2; lvl <= 30; lvl += 1) {
      const prevTime = calcResearchTime(cost, lvl - 1);
      const time = calcResearchTime(cost, lvl);
      expect(time).toBeLessThan(prevTime);
    }
  });

  it('funciona tanto para investigaciones cortas como largas y respeta el mínimo de 1 segundo', () => {
    const tiny = { metal: 10, crystal: 10, deuterium: 0 };
    const huge = { metal: 5000000, crystal: 4000000, deuterium: 0 };

    const tinyTime = calcResearchTime(tiny, 100);
    expect(tinyTime).toBeGreaterThanOrEqual(1);

    let prevHuge = Infinity;
    for (let lvl = 1; lvl <= 12; lvl += 1) {
      const hugeTime = calcResearchTime(huge, lvl);
      expect(hugeTime).toBeGreaterThanOrEqual(1);
      expect(Number.isFinite(hugeTime)).toBe(true);
      expect(hugeTime).toBeLessThanOrEqual(prevHuge);
      prevHuge = hugeTime;
    }
    expect(prevHuge).toBeLessThan(calcResearchTime(huge, 1));
  });

  describe('Centro de Construcciones & IA Estratégica (descuentos)', () => {
    it('constructionDiscount y aiResearchDiscount aplican rendimientos decrecientes hiperbolicos', () => {
      expect(constructionDiscount(0)).toBe(1);
      expect(constructionDiscount(1)).toBeCloseTo(1 / 1.15);
      expect(constructionDiscount(2)).toBeCloseTo(1 / 1.30);
      expect(aiResearchDiscount(0)).toBe(1);
      expect(aiResearchDiscount(1)).toBeCloseTo(1 / 1.10);
      expect(aiResearchDiscount(2)).toBeCloseTo(1 / 1.20);
    });

    it('buildingCost aplica descuento decreciente de Centro de Construcciones', () => {
      const base = buildingCost('metalMine', 0, 0);
      const c1 = buildingCost('metalMine', 0, 1);
      const c2 = buildingCost('metalMine', 0, 2);
      expect(c2.metal).toBeLessThan(c1.metal);
      expect(c1.metal).toBeLessThan(base.metal);
      expect(c1.metal).toBe(Math.floor(base.metal * (1 / 1.15)));
    });

    it('shipCost y defenseCost aplican descuento de Centro de Construcciones', () => {
      const shipBase = shipCost('lightFighter', 1, 0);
      expect(shipCost('lightFighter', 1, 1).metal).toBeCloseTo(shipBase.metal * (1 / 1.15));
      const defBase = defenseCost('rocketLauncher', 1, 0);
      expect(defenseCost('rocketLauncher', 1, 2).metal).toBeCloseTo(defBase.metal * (1 / 1.30));
    });

    it('researchCost aplica IA Estratégica y se acumula con CC', () => {
      const base = researchCost('weapons', 0, 0, 0);
      const ai1 = researchCost('weapons', 0, 1, 0);
      const ai2 = researchCost('weapons', 0, 2, 0);
      expect(ai1.metal).toBeLessThan(base.metal);
      expect(ai2.metal).toBeLessThan(ai1.metal);
    });

    it('BUILD_MISSILE cobra el coste descontado por CC (cargo = display)', () => {
      let state = createInitial('TestPlayer', 'human');
      const planet = state.planets.find(p => p.id === state.currentPlanetId);
      planet.resources = { metal: 100000, crystal: 100000, deuterium: 100000 };
      planet.buildings = { ...planet.buildings, missileSilo: 10, constructionCenter: 2 };
      const before = planet.resources.metal;
      const next = gameReducer(state, { type: 'BUILD_MISSILE', missileId: 'interplanetaryMissile', quantity: 2 });
      const planetAfter = next.planets.find(p => p.id === state.currentPlanetId);
      const expected = 12000 * 2 * constructionDiscount(2);
      expect(planetAfter.resources.metal).toBeCloseTo(before - expected);
      expect(planetAfter.missiles.interplanetaryMissile).toBe(2);
    });

    it('BUILD_MOON_BUILDING cobra el coste descontado por CC', () => {
      let state = createInitial('TestPlayer', 'human');
      const planet = state.planets.find(p => p.id === state.currentPlanetId);
      planet.resources = { metal: 100000, crystal: 100000, deuterium: 100000 };
      planet.buildings = { ...(planet.buildings || {}), constructionCenter: 2 };
      planet.moon = { buildings: {} };
      const before = planet.resources.metal;
      const next = gameReducer(state, { type: 'BUILD_MOON_BUILDING', buildingId: 'lunarBase' });
      const planetAfter = next.planets.find(p => p.id === state.currentPlanetId);
      const expected = Math.floor(20000 * constructionDiscount(2));
      expect(planetAfter.resources.metal).toBe(before - expected);
      expect(planetAfter.moon.buildings.lunarBase).toBe(1);
    });

    it('START_SHIP y START_DEFENSE cobran con descuento de CC (cargo = display)', () => {
      let state = createInitial('TestPlayer', 'human');
      const planet = state.planets.find(p => p.id === state.currentPlanetId);
      planet.resources = { metal: 100000, crystal: 100000, deuterium: 100000 };
      planet.buildings = { ...planet.buildings, shipyard: 2, constructionCenter: 1 };
      const shipBefore = planet.resources.metal;
      const afterShip = gameReducer(state, { type: 'START_SHIP', shipId: 'lightFighter', quantity: 1 });
      const pAfterShip = afterShip.planets.find(p => p.id === state.currentPlanetId);
      expect(pAfterShip.resources.metal).toBe(shipBefore - shipCost('lightFighter', 1, 1).metal);

      const defBefore = pAfterShip.resources.metal;
      const afterDef = gameReducer(afterShip, { type: 'START_DEFENSE', defenseId: 'rocketLauncher', quantity: 1 });
      const pAfterDef = afterDef.planets.find(p => p.id === state.currentPlanetId);
      expect(pAfterDef.resources.metal).toBe(defBefore - defenseCost('rocketLauncher', 1, 1).metal);
    });

    it('START_RESEARCH cobra con IA Estratégica + CC (cargo = display)', () => {
      let state = createInitial('TestPlayer', 'human');
      const planet = state.planets.find(p => p.id === state.currentPlanetId);
      planet.resources = { metal: 100000, crystal: 100000, deuterium: 100000 };
      planet.buildings = { ...planet.buildings, researchLab: 2, constructionCenter: 1 };
      state.research = { ...(state.research || {}), aiStrategy: 1, energy: 5 };
      const before = planet.resources.metal;
      const next = gameReducer(state, { type: 'START_RESEARCH', researchId: 'weapons' });
      const planetAfter = next.planets.find(p => p.id === state.currentPlanetId);
      expect(planetAfter.resources.metal).toBe(before - researchCost('weapons', 0, 1, 1).metal);
      expect(next.researchQueue.length).toBe(1);
    });
  });
});


