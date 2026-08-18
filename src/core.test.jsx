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

describe('Ascensión Core Logic Tests', () => {
  it('should calculate correct building costs dynamically', () => {
    const lvl0Cost = buildingCost('metalMine', 0);
    const lvl1Cost = buildingCost('metalMine', 1);

    expect(lvl0Cost.metal).toBeGreaterThan(0);
    expect(lvl1Cost.metal).toBeGreaterThan(lvl0Cost.metal);
  });

  it('should calculate correct flight times', () => {
    const time = calcFlightTime(100, 100, 10);
    expect(time).toBeGreaterThanOrEqual(10);
  });

  it('should simulate combat correctly', () => {
    const attackerFleet = { lightFighter: 10 };
    const defenderFleet = { lightFighter: 5 };
    const result = simulateCombat(attackerFleet, defenderFleet, {}, {}, {}, 0, 0, 0, 0, 0, 0, []);

    expect(result).toHaveProperty('winner');
    expect(result.rounds).toBeInstanceOf(Array);
  });

  it('should handle gameReducer START_BUILDING action transition', () => {
    const initialState = createInitial('TestPlayer', 'human');
    const planetId = initialState.currentPlanetId;

    // Simulate starting a building build
    const action = { type: 'START_BUILDING', buildingId: 'metalMine' };
    const nextState = gameReducer(initialState, action);

    expect(nextState.buildQueue.length).toBe(1);
    expect(nextState.buildQueue[0].buildingId).toBe('metalMine');
  });

  it('should support autoRetreat and loss tracking in simulateCombat', () => {
    const attackerFleet = { lightFighter: 100 };
    const defenderFleet = { battleship: 50 };
    const result = simulateCombat(attackerFleet, defenderFleet, {}, {}, {}, 6, [], 'human', 'human', true);

    expect(result).toHaveProperty('retreated');
    expect(result).toHaveProperty('atkLosses');
    expect(result).toHaveProperty('defShipLosses');
    if (result.retreated) {
      expect(result.winner).toBe('defender');
    }
  });

  it('should apply tactical formation modifiers in combat simulation', () => {
    const attackerFleet = { lightFighter: 10 };
    const defenderFleet = { lightFighter: 10 };
    const resVanguard = simulateCombat(attackerFleet, defenderFleet, {}, {}, {}, 6, [], 'human', 'human', false, 'vanguard');
    const resArtillery = simulateCombat(attackerFleet, defenderFleet, {}, {}, {}, 6, [], 'human', 'human', false, 'artillery');

    expect(resVanguard).toHaveProperty('winner');
    expect(resArtillery).toHaveProperty('winner');
  });

  it('should apply planetary specialization bonuses to production calculations', () => {
    const buildings = { metalMine: 10, crystalMine: 8, deutSynth: 5, solarPlant: 10 };
    const research = {};
    
    const prodNormal = calcProduction(buildings, research, 20, 1, 'human', null, null, null, null);
    const prodIndustrial = calcProduction(buildings, research, 20, 1, 'human', null, null, null, 'industrial');
    const prodScientific = calcProduction(buildings, research, 20, 1, 'human', null, null, null, 'scientific');

    expect(prodIndustrial.metal).toBeGreaterThan(prodNormal.metal);
    expect(prodScientific.deuterium).toBeGreaterThan(prodNormal.deuterium);
  });

  describe('Galactic Reputation Tests', () => {
    it('should map reputation levels to correct alignment titles', () => {
      expect(getGalacticAlignment(80).title).toBe('Emisario de la Paz');
      expect(getGalacticAlignment(50).title).toBe('Guardián Galáctico');
      expect(getGalacticAlignment(0).title).toBe('Líder Neutral');
      expect(getGalacticAlignment(-50).title).toBe('Pirata del Sector');
      expect(getGalacticAlignment(-90).title).toBe('Azote Estelar');
    });

    it('should discount treaty costs when reputation is high (>= 40)', () => {
      const stateWithHighRep = {
        ...createInitial('TestPlayer', 'human'),
        reputation: 45
      };
      
      // Inject high resources so we can afford PNA
      stateWithHighRep.planets[0].resources = { metal: 100000, crystal: 100000, deuterium: 100000 };
      
      // Mock an AI planet with relation >= 20
      stateWithHighRep.aiPlanets = [{
        id: 'ai-1',
        name: 'AI Test',
        faction: 'human',
        relation: 30,
        pna: false
      }];

      const action = { type: 'DIPLOMACY_TREATY', planetId: 'ai-1', treatyType: 'pna' };
      const nextState = gameReducer(stateWithHighRep, action);

      // Normal cost is 10k Metal, 5k Cristal.
      // With 25% discount, cost is 7500 Metal, 3750 Cristal.
      const planetAfter = nextState.planets[0];
      expect(planetAfter.resources.metal).toBe(100000 - 7500);
      expect(planetAfter.resources.crystal).toBe(100000 - 3750);
    });

    it('should reject peace proposals if reputation is too low (< -40)', () => {
      const stateWithLowRep = {
        ...createInitial('TestPlayer', 'human'),
        reputation: -50
      };

      stateWithLowRep.aiPlanets = [{
        id: 'ai-1',
        name: 'AI Test',
        faction: 'human',
        relation: -80,
        pna: false
      }];

      const action = { type: 'DIPLOMACY_DECLARE_WAR', planetId: 'ai-1', declareWar: false };
      const nextState = gameReducer(stateWithLowRep, action);

      // Should verify that relation has not changed to 0 (peace rejection returned original state structure or rejected notif)
      const targetAI = nextState.aiPlanets.find(p => p.id === 'ai-1');
      expect(targetAI.relation).toBe(-80); // still hostile, peace rejected
      expect(nextState.notifications.some(n => n.message.includes('Proposición de Paz rechazada'))).toBe(true);
    });
  });

  describe('Galaxia y Exploración Tests', () => {
    it('should deterministically generate POIs at coord sets', () => {
      const poi1 = getPOIAtCoordinates(1, 1, 3);
      const poi2 = getPOIAtCoordinates(1, 1, 3);
      expect(poi1).toEqual(poi2); // must be deterministic
    });

    it('should apply wormhole travel modifiers to flight time and fuel', () => {
      const initialState = createInitial('TestPlayer', 'human');
      const startPlanet = initialState.planets[0];
      startPlanet.resources = { metal: 10000, crystal: 10000, deuterium: 10000 };
      startPlanet.fleet = { smallCargo: 5 };

      // Find system coordinates containing a wormhole POI
      let targetCoords = null;
      outer:
      for (let s = 1; s <= 100; s++) {
        for (let p = 1; p <= 15; p++) {
          const poi = getPOIAtCoordinates(1, s, p);
          if (poi && poi.type === 'wormhole') {
            targetCoords = { galaxy: 1, system: s, position: p };
            break outer;
          }
        }
      }

      if (targetCoords) {
        const action = {
          type: 'SEND_FLEET',
          fromId: startPlanet.id,
          to: targetCoords,
          fleet: { smallCargo: 2 },
          missionType: 'expedition',
          missionSpeed: 10
        };

        const nextState = gameReducer(initialState, action);
        const mission = nextState.fleetMissions[nextState.fleetMissions.length - 1];
        
        // Assert that the wormhole was detected and reduced departure fuel / arrival time
        expect(nextState.notifications.some(n => n.message.includes('Agujero de Gusano'))).toBe(true);
        expect(mission.fuel).toBeLessThan(10); // Halved fuel cost
      }
    });

    it('should apply Helium-3 deuterium production boost in calcProduction', () => {
      const buildings = { deutSynth: 5, solarPlant: 10 };
      const research = {};
      
      // Find coordinates containing a helium_belt POI
      let targetCoords = null;
      outer:
      for (let s = 1; s <= 100; s++) {
        for (let p = 1; p <= 15; p++) {
          const poi = getPOIAtCoordinates(1, s, p);
          if (poi && poi.type === 'helium_belt') {
            targetCoords = { galaxy: 1, system: s, position: p };
            break outer;
          }
        }
      }

      if (targetCoords) {
        const prodNormal = calcProduction(buildings, research, 20, 1, 'human', null, null, null, null, null);
        const prodHelium = calcProduction(buildings, research, 20, 1, 'human', null, null, null, null, targetCoords);

        expect(prodHelium.deuterium).toBeGreaterThan(prodNormal.deuterium);
      }
    });
  });

  describe('Custom Ship Modules Tests', () => {
    it('should correctly calculate costs and stats for new modules', () => {
      const baseBp = {
        chassis: 'fighter',
        weapon: 'lightLaser',
        engine: 'basicCombustion',
        shield: 'basicShield',
        modules: []
      };

      const baseCost = calcCustomShipCost(baseBp);
      const baseStats = calcCustomShipStats(baseBp);

      // 1. ionDeflector (+40% shields, +20% crystal cost)
      const ionBp = { ...baseBp, modules: ['ionDeflector'] };
      const ionCost = calcCustomShipCost(ionBp);
      const ionStats = calcCustomShipStats(ionBp);
      expect(ionCost.crystal).toBeGreaterThan(baseCost.crystal);
      expect(ionStats.shd).toBeGreaterThan(baseStats.shd);

      // 2. plasmaInjector (+35% speed, +25% deut cost)
      const plasmaBp = { ...baseBp, modules: ['plasmaInjector'] };
      const plasmaCost = calcCustomShipCost(plasmaBp);
      const plasmaStats = calcCustomShipStats(plasmaBp);
      expect(plasmaCost.deuterium).toBeGreaterThan(baseCost.deuterium);
      expect(plasmaStats.speed).toBeGreaterThan(baseStats.speed);

      // 3. gaussBattery (+50% attack, -15% speed)
      const gaussBp = { ...baseBp, modules: ['gaussBattery'] };
      const gaussStats = calcCustomShipStats(gaussBp);
      expect(gaussStats.atk).toBeGreaterThan(baseStats.atk);
      expect(gaussStats.speed).toBeLessThan(baseStats.speed);
    });
  });

  describe('Audit Critical Fixes & Edge Cases Verification', () => {
    it('should handle RESET_GAME action by returning minimal non-started state', () => {
      const initial = createInitial('AuditPlayer');
      const afterReset = gameReducer(initial, { type: 'RESET_GAME' });
      expect(afterReset.gameStarted).toBe(false);
    });

    it('should handle RESET_GAME on richer state (clears to intro)', () => {
      let state = createInitial('AuditPlayer');
      // Simulate some progress
      state = gameReducer(state, { type: 'START_BUILDING', buildingId: 'metalMine' });
      const after = gameReducer(state, { type: 'RESET_GAME' });
      expect(after.gameStarted).toBe(false);
      expect(after.buildQueue).toBeUndefined(); // minimal
    });

    it('legacy RESET action (case removed) falls through to default and returns unchanged state', () => {
      const initial = createInitial('AuditPlayer');
      const result = gameReducer(initial, { type: 'RESET' });
      expect(result).toBe(initial); // default returns same ref
    });

    it('should block COLONIZE to already occupied player coordinates (reducer validation)', () => {
      const initial = createInitial('AuditPlayer');
      const homeId = initial.currentPlanetId;
      // Give the home planet a colonizer so we pass the fleet check
      const stateWithColonizer = {
        ...initial,
        planets: initial.planets.map(p =>
          p.id === homeId ? { ...p, fleet: { ...p.fleet, colonizer: 1 } } : p
        )
      };
      // Occupy a spot
      const occupiedState = {
        ...stateWithColonizer,
        planets: [
          ...stateWithColonizer.planets,
          { id: 'col1', galaxy: 2, system: 5, position: 7, resources: { metal: 0, crystal: 0, deuterium: 0 } }
        ]
      };
      const result = gameReducer(occupiedState, {
        type: 'COLONIZE',
        to: { galaxy: 2, system: 5, position: 7 }
      });
      // Should not have added a new planet and should have emitted a warning
      expect(result.planets.length).toBe(occupiedState.planets.length);
      expect((result.notifications || []).some(n => (n.message || '').includes('ocupada'))).toBe(true);
    });

    it('should block COLONIZE to AI occupied coordinates', () => {
      const initial = createInitial('AuditPlayer');
      const homeId = initial.currentPlanetId;
      const stateWithColonizer = {
        ...initial,
        planets: initial.planets.map(p =>
          p.id === homeId ? { ...p, fleet: { ...p.fleet, colonizer: 1 } } : p
        ),
        aiPlanets: [
          { id: 'ai1', galaxy: 3, system: 4, position: 2, isVirgin: false }
        ]
      };
      const result = gameReducer(stateWithColonizer, {
        type: 'COLONIZE',
        to: { galaxy: 3, system: 4, position: 2 }
      });
      expect(result.planets.length).toBe(stateWithColonizer.planets.length);
      expect((result.notifications || []).some(n => (n.message || '').includes('ocupada'))).toBe(true);
    });

    it('validateSave rejects invalid saves (version, playerName, planets, gameStarted)', () => {
      expect(validateSave(null).valid).toBe(false);
      expect(validateSave({ version: 1, playerName: 'x', planets: [{}], gameStarted: true }).valid).toBe(false);
      expect(validateSave({ version: 3, playerName: '', planets: [{}], gameStarted: true }).valid).toBe(false);
      expect(validateSave({ version: 3, playerName: 'x', planets: [], gameStarted: true }).valid).toBe(false);
      expect(validateSave({ version: 3, playerName: 'x', planets: [{}], gameStarted: false }).valid).toBe(false);
      expect(validateSave({ version: 3, playerName: 'x', planets: [{}], gameStarted: true }).valid).toBe(true);
    });

    it('LOAD coerces aiPlanets null/undefined (migration safety)', () => {
      const badPayload = {
        version: 3,
        playerName: 'Test',
        planets: [{ id: 'p1', resources: {}, fleet: {}, defenses: {}, buildings: {} }],
        gameStarted: true,
        aiPlanets: null
      };
      const loaded = gameReducer({ gameStarted: false }, { type: 'LOAD', payload: badPayload });
      expect(Array.isArray(loaded.aiPlanets)).toBe(true);
      expect(loaded.aiPlanets.length).toBe(0);
    });

    it('LOAD migrates missing ministries field (migration safety)', () => {
      const payload = {
        version: 3,
        playerName: 'Test',
        planets: [{ id: 'p1', resources: {}, fleet: {}, defenses: {}, buildings: {} }],
        gameStarted: true
        // no ministries
      };
      const loaded = gameReducer({ gameStarted: false }, { type: 'LOAD', payload });
      expect(loaded.ministries).toBeDefined();
      expect(loaded.ministries.economy).toBeDefined();
      expect(loaded.ministries.economy.taxRate).toBe(0.1);
    });

    it('TICK initializes ministries if they are missing in state (defense in depth)', () => {
      const state = createInitial('AuditPlayer', 'human');
      delete state.ministries; // Simulate missing ministries
      
      // Should not throw and should create ministries
      const nextState = gameReducer(state, { type: 'TICK' });
      expect(nextState.ministries).toBeDefined();
      expect(nextState.ministries.economy).toBeDefined();
    });

    it('LOAD with undefined aiPlanets still produces array', () => {
      const payload = {
        version: 3,
        playerName: 'Test',
        planets: [{ id: 'p1' }],
        gameStarted: true
        // no aiPlanets key
      };
      const loaded = gameReducer({ gameStarted: false }, { type: 'LOAD', payload });
      expect(Array.isArray(loaded.aiPlanets)).toBe(true);
    });
  });
});

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

  it('con un Laboratorio nivel 11, una investigación de 2h pasa a durar unos 12 minutos (x10)', () => {
    const oldTime = oldCalcResearchTime(cost, 11);
    expect(oldTime).toBe(7200); // 2 horas = 7200s bajo el sistema anterior

    const newTime = calcResearchTime(cost, 11);
    expect(newTime).toBeGreaterThanOrEqual(700);
    expect(newTime).toBeLessThanOrEqual(780);
    expect(newTime).toBeLessThan(oldTime / 9);      // al menos 9x más rápido
    expect(newTime).toBeGreaterThanOrEqual(oldTime / 11); // sin llegar a ser 11x
  });

  it('sin Laboratorio (nivel 0) no aplica ninguna reducción global x10', () => {
    const smallCost = { metal: 100000, crystal: 100000, deuterium: 0 };
    const oldTime = oldCalcResearchTime(smallCost, 0);
    const newTime = calcResearchTime(smallCost, 0);
    expect(newTime).toBe(oldTime);
  });

  it('la reducción procede del nivel del Laboratorio y aplica en todos los niveles', () => {
    const levels = [1, 3, 5, 8, 11, 15, 20, 30];
    let prevSpeedMult = 0;
    for (const lvl of levels) {
      const oldTime = oldCalcResearchTime(cost, lvl);
      const newTime = calcResearchTime(cost, lvl);
      expect(newTime).toBeLessThan(oldTime); // cada nivel acelera respecto al sistema antiguo
      const speedMult = oldTime / newTime;
      expect(speedMult).toBeGreaterThanOrEqual(6);   // mínimo ~6.5x incluso en nivel 1
      expect(speedMult).toBeLessThanOrEqual(10.5);   // tiende a 10x en niveles altos
      expect(speedMult).toBeGreaterThanOrEqual(prevSpeedMult); // progresión coherente y creciente
      prevSpeedMult = speedMult;
    }
  });

  it('cada incremento de nivel produce una reducción claramente perceptible', () => {
    for (let lvl = 2; lvl <= 30; lvl += 1) {
      const prevTime = calcResearchTime(cost, lvl - 1);
      const time = calcResearchTime(cost, lvl);
      expect(time).toBeLessThan(prevTime);
      expect(prevTime / time).toBeGreaterThanOrEqual(1.025); // al menos ~2.5% por nivel
    }
  });

  it('funciona tanto para investigaciones cortas como largas y respeta el mínimo de 1 segundo', () => {
    const tiny = { metal: 100, crystal: 100, deuterium: 0 };
    const huge = { metal: 5000000, crystal: 4000000, deuterium: 0 };

    const tinyTime = calcResearchTime(tiny, 30);
    expect(tinyTime).toBe(1); // mínimo permitido

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
    it('constructionDiscount divide a la mitad por nivel y aiResearchDiscount es multiplicativo bestial', () => {
      expect(constructionDiscount(0)).toBe(1);
      expect(constructionDiscount(1)).toBeCloseTo(0.5);
      expect(constructionDiscount(2)).toBeCloseTo(0.25);
      expect(constructionDiscount(3)).toBeCloseTo(0.125);
      expect(aiResearchDiscount(0)).toBe(1);
      expect(aiResearchDiscount(1)).toBeCloseTo(0.75);
      expect(aiResearchDiscount(2)).toBeCloseTo(0.5625);
      expect(aiResearchDiscount(5)).toBeCloseTo(0.2373046875);
    });

    it('buildingCost aplica -50%/nivel de Centro de Construcciones', () => {
      const base = buildingCost('metalMine', 0, 0);
      const c1 = buildingCost('metalMine', 0, 1);
      const c2 = buildingCost('metalMine', 0, 2);
      expect(c2.metal).toBeLessThan(c1.metal);
      expect(c1.metal).toBeLessThan(base.metal);
      expect(c1.metal).toBe(Math.floor(base.metal * 0.5));
      expect(c2.metal).toBe(Math.floor(base.metal * 0.25));
    });

    it('shipCost y defenseCost aplican -50%/nivel en naves y defensas', () => {
      const shipBase = shipCost('lightFighter', 1, 0);
      expect(shipCost('lightFighter', 1, 1).metal).toBeCloseTo(shipBase.metal * 0.5);
      expect(shipCost('lightFighter', 3, 2).metal).toBeCloseTo(shipCost('lightFighter', 3, 0).metal * 0.25);
      const defBase = defenseCost('rocketLauncher', 1, 0);
      expect(defenseCost('rocketLauncher', 1, 2).metal).toBeCloseTo(defBase.metal * 0.25);
    });

    it('researchCost aplica IA Estratégica bestial: -25%/nivel y se acumula con CC', () => {
      const base = researchCost('weapons', 0, 0, 0);
      const ai1 = researchCost('weapons', 0, 1, 0);
      const ai2 = researchCost('weapons', 0, 2, 0);
      const ai1cc1 = researchCost('weapons', 0, 1, 1);
      expect(ai1.metal).toBeLessThan(base.metal);
      expect(ai2.metal).toBeLessThan(ai1.metal);
      expect(Math.abs(ai1.metal - base.metal * 0.75)).toBeLessThanOrEqual(1);
      expect(Math.abs(ai2.metal - base.metal * 0.5625)).toBeLessThanOrEqual(1);
      expect(Math.abs(ai1cc1.metal - base.metal * 0.375)).toBeLessThanOrEqual(1);
    });

    it('BUILD_MISSILE cobra el coste descontado por CC (cargo = display)', () => {
      let state = createInitial('TestPlayer', 'human');
      const planet = state.planets.find(p => p.id === state.currentPlanetId);
      planet.resources = { metal: 100000, crystal: 100000, deuterium: 100000 };
      planet.buildings = { ...planet.buildings, missileSilo: 10, constructionCenter: 2 };
      const before = planet.resources.metal;
      const next = gameReducer(state, { type: 'BUILD_MISSILE', missileId: 'interplanetaryMissile', quantity: 2 });
      const planetAfter = next.planets.find(p => p.id === state.currentPlanetId);
      const expected = 12000 * 2 * 0.25;
      expect(planetAfter.resources.metal).toBe(before - expected);
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
      const expected = Math.floor(20000 * 0.25);
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

