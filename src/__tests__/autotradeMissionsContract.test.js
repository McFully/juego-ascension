import { describe, it, expect } from 'vitest';
import { economyReducer } from '../reducers/economyReducer.js';
import { processAutoTradeRoutesTick } from '../reducers/tick/automation/autoTradeRoutesTick.js';
import { MISSIONS } from '../data/missionsData.js';

describe('Phase 12: Autotrade and Chapter 6 Missions Contract', () => {
  it('PLANET_TOGGLE_AUTOTRADE toggles autoTrade state on colonies', () => {
    const state = {
      planets: [
        { id: 'home', isHome: true, autoTrade: false },
        { id: 'colony-1', isHome: false, autoTrade: false }
      ]
    };

    const nextState = economyReducer(state, {
      type: 'PLANET_TOGGLE_AUTOTRADE',
      planetId: 'colony-1'
    });

    const colony = nextState.planets.find(p => p.id === 'colony-1');
    expect(colony.autoTrade).toBe(true);

    const revertedState = economyReducer(nextState, {
      type: 'PLANET_TOGGLE_AUTOTRADE',
      planetId: 'colony-1'
    });
    expect(revertedState.planets.find(p => p.id === 'colony-1').autoTrade).toBe(false);
  });

  it('autoTradeRoutesTick uses large cargos optimally without wasting small cargos', () => {
    // 1 large cargo (25k cap) and 1 small cargo (5k cap).
    // Total capacity = 30k.
    // Colony has 28k excess resources (> 5000 threshold).
    // It should take 1 largeCargo (25k) and 1 smallCargo (3k remaining), using BOTH cargueros.
    const state = {
      gameTick: 1,
      research: { combustionDrive: 5 },
      planets: [
        {
          id: 'capital',
          isHome: true,
          galaxy: 1,
          system: 1,
          position: 1,
          resources: { metal: 0, crystal: 0, deuterium: 0 },
          buildings: { metalStorage: 5 }
        },
        {
          id: 'colony-1',
          isHome: false,
          name: 'Colonia Minera',
          autoTrade: true,
          galaxy: 1,
          system: 1,
          position: 2,
          // Storage default 12,500. 75% = 9,375.
          // Resources 37,375 => excess = 28,000.
          resources: { metal: 37375, crystal: 0, deuterium: 0 },
          buildings: { metalMine: 5 },
          fleet: { largeCargo: 1, smallCargo: 1 }
        }
      ],
      fleetMissions: [],
      notifications: []
    };

    const nextState = processAutoTradeRoutesTick(state);
    expect(nextState.fleetMissions).toHaveLength(1);
    const mission = nextState.fleetMissions[0];
    expect(mission.type).toBe('transport');
    // Both largeCargo and smallCargo must be used to transport 28,000
    expect(mission.fleet.largeCargo).toBe(1);
    expect(mission.fleet.smallCargo).toBe(1);

    const colony = nextState.planets.find(p => p.id === 'colony-1');
    expect(colony.fleet.largeCargo).toBeUndefined();
    expect(colony.fleet.smallCargo).toBeUndefined();
  });

  it('missions m6_3_autotrade and hardened m6_4_supply_route check criteria correctly', () => {
    const m6_3 = MISSIONS.find(m => m.id === 'm6_3_autotrade');
    const m6_4 = MISSIONS.find(m => m.id === 'm6_4_supply_route');

    expect(m6_3).toBeDefined();
    expect(m6_4).toBeDefined();

    // m6_3: returns true when any non-home planet has autoTrade: true
    const stateNoAutoTrade = {
      planets: [{ id: 'c1', isHome: false, autoTrade: false }]
    };
    const stateWithAutoTrade = {
      planets: [{ id: 'c1', isHome: false, autoTrade: true }]
    };
    expect(m6_3.check(stateNoAutoTrade, stateNoAutoTrade.planets[0])).toBe(false);
    expect(m6_3.check(stateWithAutoTrade, stateWithAutoTrade.planets[0])).toBe(true);

    // m6_4: hardened requirement - route must be active AND executed (deliveriesCount >= 1 or active)
    const stateNoRoutes = { tradeRoutes: [] };
    const stateUnexecutedRoute = {
      tradeRoutes: [{ id: 'r1', active: false, deliveriesCount: 0 }]
    };
    const stateExecutedRoute = {
      tradeRoutes: [{ id: 'r1', active: true, deliveriesCount: 1 }]
    };

    expect(m6_4.check(stateNoRoutes, null)).toBe(false);
    expect(m6_4.check(stateUnexecutedRoute, null)).toBe(false);
    expect(m6_4.check(stateExecutedRoute, null)).toBe(true);
  });
});
