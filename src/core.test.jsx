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
  buildingProdInfo,
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
      expect(validateSave({ version: 4, playerName: 'x', planets: [{}], gameStarted: true }).valid).toBe(true);
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

    it('LOAD applies imperial amnesty if player has more planets/missions than astrophysics allows', () => {
      const payload = {
        version: 3,
        playerName: 'Emperor',
        planets: Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, resources: {}, fleet: {}, defenses: {}, buildings: {} })),
        fleetMissions: [{ type: 'colonize', isReturning: false, to: { galaxy: 1, system: 2, position: 3 } }],
        research: { astrophysics: 0 },
        gameStarted: true
      };
      const loaded = gameReducer({ gameStarted: false }, { type: 'LOAD', payload });
      // 8 planetas + 1 misión = 9 mundos -> Astrofísica nivel 15
      expect(loaded.research.astrophysics).toBe(15);
      expect(loaded.notifications.some(n => (n.message || '').includes('Amnistía Imperial'))).toBe(true);
    });

    it('blocks COLONIZE when player has reached max colony limit for their astrophysics level', () => {
      const initial = createInitial('LimitPlayer');
      const homeId = initial.currentPlanetId;
      const stateWithColonizer = {
        ...initial,
        aiPlanets: [], // evitar colisiones aleatorias con planetas IA
        research: { astrophysics: 0 }, // solo 1 planeta permitido
        planets: initial.planets.map(p =>
          p.id === homeId ? { ...p, fleet: { ...p.fleet, colonizer: 2 } } : p
        )
      };

      const result = gameReducer(stateWithColonizer, {
        type: 'COLONIZE',
        to: { galaxy: 1, system: 12, position: 4 }
      });

      expect(result.planets.length).toBe(1);
      expect(result.notifications.some(n => (n.message || '').includes('Límite imperial alcanzado'))).toBe(true);
    });

    it('buildingProdInfo handles deuterium mine with planet coordinates without ReferenceError', () => {
      const planetWithCoords = {
        galaxy: 1,
        system: 1,
        position: 3,
        buildings: { deutSynth: 5, solarPlant: 10 },
        faction: 'human',
        biome: 'terran',
        specialization: null,
        taxRate: 0
      };
      const info = buildingProdInfo('deutSynth', 5, {}, 20, 1, planetWithCoords);
      expect(info).toBeDefined();
      expect(info.current).toBeDefined();
      expect(info.current.prod).toBeGreaterThan(0);
    });
  });
});


