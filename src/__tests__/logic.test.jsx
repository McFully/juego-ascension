import { describe, it, expect } from 'vitest';
import { gameReducer, createInitial, calcFlightTime } from '../core.jsx';

describe('Ascensión Logic and Trade Overhaul Tests', () => {
  it('should calculate building and research queues level and costs sequentially (No spam exploit)', () => {
    const state = createInitial('TestPlayer', 'human');
    const planetId = state.currentPlanetId;
    
    // Give player ample resources to queue multiple levels of metalMine
    state.planets[0].resources = { metal: 1000000, crystal: 1000000, deuterium: 1000000 };
    
    const initialLvl = state.planets[0].buildings.metalMine || 0; // Starts at 2

    // Queue level initialLvl -> initialLvl + 1 (3)
    let nextState = gameReducer(state, { type: 'START_BUILDING', buildingId: 'metalMine' });
    expect(nextState.buildQueue.length).toBe(1);
    expect(nextState.buildQueue[0].level).toBe(initialLvl + 1); // target level 3
    
    // Queue level initialLvl + 1 -> initialLvl + 2 (4)
    nextState = gameReducer(nextState, { type: 'START_BUILDING', buildingId: 'metalMine' });
    expect(nextState.buildQueue.length).toBe(2);
    expect(nextState.buildQueue[1].level).toBe(initialLvl + 2); // target level 4
    expect(nextState.buildQueue[1].startTime).toBeGreaterThanOrEqual(nextState.buildQueue[0].startTime); // parallel independent start time
    
    // Queue level initialLvl + 2 -> initialLvl + 3 (5)
    nextState = gameReducer(nextState, { type: 'START_BUILDING', buildingId: 'metalMine' });
    expect(nextState.buildQueue.length).toBe(3);
    expect(nextState.buildQueue[2].level).toBe(initialLvl + 3);
  });

  it('should validate AI trade exchange ratio according to personality strategy', () => {
    const state = createInitial('TestPlayer', 'human');
    
    // Setup player resources
    state.planets[0].resources = { metal: 100000, crystal: 100000, deuterium: 100000 };
    // Add cargo ships to both player and AI so transport capacity is not the bottleneck
    state.planets[0].fleet = { smallCargo: 50, largeCargo: 10 };
    
    // Setup AI planet
    const aiPlanet = {
      id: 'ai-1',
      name: 'Imperio Alpha',
      galaxy: 1, system: 10, position: 5,
      resources: { metal: 200000, crystal: 100000, deuterium: 50000 },
      fleet: { smallCargo: 50, largeCargo: 10 },
      aiPersonality: 'bélico',
      strategy: 'militarist',
      research: {}
    };
    state.aiPlanets = [aiPlanet];
    
    // 1. Extreme unfavorable trade (militarist AI expects ratio >= 1.25, player offers 1 metal for 50000 deuterium)
    const badTradeAction = {
      type: 'DIPLOMACY_TRADE',
      planetId: 'ai-1',
      giveRes: { metal: 1, crystal: 0, deuterium: 0 },
      takeRes: { metal: 0, crystal: 0, deuterium: 50000 }
    };
    
    let resultState = gameReducer(state, badTradeAction);
    const lastNotif = resultState.notifications[resultState.notifications.length - 1];
    expect(lastNotif.message).toContain('rechaza el trato por ser comercialmente desfavorable');
    expect(resultState.fleetMissions.length).toBe(0); // Trade blocked
  });

  it('should validate AI has the actual physical reserves for a trade', () => {
    const state = createInitial('TestPlayer', 'human');
    state.planets[0].resources = { metal: 100000, crystal: 100000, deuterium: 100000 };
    state.planets[0].fleet = { smallCargo: 50, largeCargo: 10 };

    const aiPlanet = {
      id: 'ai-1',
      name: 'Imperio Alpha',
      galaxy: 1, system: 10, position: 5,
      resources: { metal: 10, crystal: 10, deuterium: 10 }, // Tiny reserves!
      fleet: { smallCargo: 50, largeCargo: 10 },
      aiPersonality: 'mercantilista',
      research: {}
    };
    state.aiPlanets = [aiPlanet];

    // Player offers lots of resources, but asks for 50000 metal (AI only has 10)
    const reservesTradeAction = {
      type: 'DIPLOMACY_TRADE',
      planetId: 'ai-1',
      giveRes: { metal: 50000, crystal: 50000, deuterium: 50000 },
      takeRes: { metal: 50000, crystal: 0, deuterium: 0 }
    };

    let resultState = gameReducer(state, reservesTradeAction);
    const lastNotif = resultState.notifications[resultState.notifications.length - 1];
    expect(lastNotif.message).toContain('no dispone de suficientes reservas físicas');
    expect(resultState.fleetMissions.length).toBe(0);
  });

  it('should block trade and complain if cargo capacities are insufficient', () => {
    const state = createInitial('TestPlayer', 'human');
    state.planets[0].resources = { metal: 100000, crystal: 100000, deuterium: 100000 };
    state.planets[0].fleet = { smallCargo: 0, largeCargo: 0 }; // Player has NO cargo ships!

    const aiPlanet = {
      id: 'ai-1',
      name: 'Imperio Alpha',
      galaxy: 1, system: 10, position: 5,
      resources: { metal: 100000, crystal: 100000, deuterium: 100000 },
      fleet: { smallCargo: 50, largeCargo: 10 },
      aiPersonality: 'mercantilista',
      research: {}
    };
    state.aiPlanets = [aiPlanet];

    // Try a perfectly balanced trade, but player has no cargos to carry it
    const tradeAction = {
      type: 'DIPLOMACY_TRADE',
      planetId: 'ai-1',
      giveRes: { metal: 10000, crystal: 0, deuterium: 0 },
      takeRes: { metal: 10000, crystal: 0, deuterium: 0 }
    };

    let resultState = gameReducer(state, tradeAction);
    const lastNotif = resultState.notifications[resultState.notifications.length - 1];
    expect(lastNotif.message).toContain('No tienes suficiente capacidad de carga');
    expect(resultState.fleetMissions.length).toBe(0);
  });

  it('should successfully dispatch physical cargo trade missions on agreement', () => {
    const state = createInitial('TestPlayer', 'human');
    state.planets[0].resources = { metal: 100000, crystal: 100000, deuterium: 100000 };
    state.planets[0].fleet = { smallCargo: 10, largeCargo: 2 }; // Has cargos!

    const aiPlanet = {
      id: 'ai-1',
      name: 'Imperio Alpha',
      galaxy: 1, system: 10, position: 5,
      resources: { metal: 100000, crystal: 100000, deuterium: 100000 },
      fleet: { smallCargo: 10, largeCargo: 2 },
      aiPersonality: 'mercantilista',
      research: {}
    };
    state.aiPlanets = [aiPlanet];

    // Perfect balanced trade
    const tradeAction = {
      type: 'DIPLOMACY_TRADE',
      planetId: 'ai-1',
      giveRes: { metal: 10000, crystal: 0, deuterium: 0 },
      takeRes: { metal: 10000, crystal: 0, deuterium: 0 }
    };

    let resultState = gameReducer(state, tradeAction);
    const lastNotif = resultState.notifications[resultState.notifications.length - 1];
    expect(lastNotif.message).toContain('Acuerdo comercial firmado');
    expect(resultState.fleetMissions.length).toBe(2); // trade_send & trade_receive

    // Check that player and AI planet resources/fleets were deducted
    const updatedPlayer = resultState.planets[0];
    const updatedAI = resultState.aiPlanets[0];
    
    expect(updatedPlayer.resources.metal).toBe(90000); // giveRes deducted
    expect(updatedAI.resources.metal).toBe(90000); // takeRes deducted
    
    // Check that cargos were deducted from fleets to fly the missions
    expect(updatedPlayer.fleet.largeCargo).toBeLessThan(2);
    expect(updatedAI.fleet.largeCargo).toBeLessThan(2);
  });

  it('should process trade missions upon arrival and correctly return cargo fleets', () => {
    const state = createInitial('TestPlayer', 'human');
    state.planets[0].resources = { metal: 100000, crystal: 100000, deuterium: 100000 };
    state.planets[0].fleet = { smallCargo: 10, largeCargo: 2 };
    state.planets[0].buildings = { ...state.planets[0].buildings, metalStorage: 10, crystalStorage: 10, deuteriumStorage: 10 };

    const aiPlanet = {
      id: 'ai-1',
      name: 'Imperio Alpha',
      galaxy: 1, system: 10, position: 5,
      resources: { metal: 100000, crystal: 100000, deuterium: 100000 },
      fleet: { smallCargo: 10, largeCargo: 2 },
      buildings: { metalStorage: 10, crystalStorage: 10, deuteriumStorage: 10 },
      aiPersonality: 'mercantilista',
      strategy: 'merchant',
      research: {}
    };
    state.aiPlanets = [aiPlanet];

    const tradeAction = {
      type: 'DIPLOMACY_TRADE',
      planetId: 'ai-1',
      giveRes: { metal: 10000, crystal: 0, deuterium: 0 },
      takeRes: { metal: 10000, crystal: 0, deuterium: 0 }
    };

    let resultState = gameReducer(state, tradeAction);
    
    // Fast-forward time to make both missions arrive
    resultState.fleetMissions = resultState.fleetMissions.map(m => ({
      ...m,
      arrivalTime: Date.now() - 1000, // arrived in the past
      returnTime: Date.now() + 1000000, // will return in the future
    }));

    // Trigger tick
    let afterTickState = gameReducer(resultState, { type: 'TICK' });
    
    // Check that resources were delivered
    const playerPlanet = afterTickState.planets[0];
    const aiColony = afterTickState.aiPlanets[0];
    
    expect(playerPlanet.resources.metal).toBeGreaterThanOrEqual(100000);
    expect(aiColony.resources.metal).toBeGreaterThanOrEqual(100000);

    // Check that fleets are now returning
    expect(afterTickState.fleetMissions.length).toBe(2);
    expect(afterTickState.fleetMissions[0].returning).toBe(true);
    expect(afterTickState.fleetMissions[1].returning).toBe(true);

    // Fast-forward to return completion
    afterTickState.fleetMissions = afterTickState.fleetMissions.map(m => ({
      ...m,
      returnTime: Date.now() - 1000,
    }));

    // Trigger another tick
    let finalState = gameReducer(afterTickState, { type: 'TICK' });
    
    // Check that all cargos returned to their origins
    expect(finalState.fleetMissions.length).toBe(0);
    expect(finalState.planets[0].fleet.largeCargo).toBe(2);
    expect(finalState.aiPlanets[0].fleet.largeCargo).toBe(2);
  });

  it('should calculate lightFighter travel time between adjacent planets as exactly 1200 seconds and scale appropriately', () => {
    const timeAdjacent = calcFlightTime(10, 12500, 10);
    expect(timeAdjacent).toBe(1200); // Exactly 20 minutes (1200s)!

    // Scale check: higher speed (e.g. 25000 due to upgrades) should take half the time
    const timeUpgraded = calcFlightTime(10, 25000, 10);
    expect(timeUpgraded).toBe(600); // 10 minutes!
  });

  it('should allow player to form federation alone and let allies join via ticks if relations are high', () => {
    let state = createInitial('TestPlayer', 'human');
    state.influence = 100;
    state.aiPlanets = [
      { id: 'ai-1', name: 'Imperio Alpha', relation: 80, isVirgin: false }
    ];
    
    // Form federation alone
    state = gameReducer(state, { type: 'FORM_FEDERATION', name: 'Alianza Terrestre', memberIds: [] });
    expect(state.federations.length).toBe(1);
    expect(state.federations[0].members).toContain('player');
    expect(state.influence).toBe(20);

    // Simulate ticks to let the ally join the federation
    const originalRandom = Math.random;
    Math.random = () => 0.01; // Force join probability check
    
    state.gameTick = 180;
    let tickedState = gameReducer(state, { type: 'TICK' });
    
    Math.random = originalRandom; // Restore original random
    
    expect(tickedState.federations[0].members).toContain('ai-1');
  });
});
