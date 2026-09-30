import { describe, it, expect } from 'vitest';
import { handleProcessTradeRoutes } from '../reducers/fleet/tradeRouteReducer.js';
import { processAutoTradeRoutesTick } from '../reducers/tick/automation/autoTradeRoutesTick.js';
import { handleTransportMission } from '../missions/diploMission.js';

describe('Phase 11: Real Supply Routes Contract', () => {
  const createMockState = () => ({
    gameTick: 10,
    research: { combustionDrive: 5 },
    tradeRoutes: [
      {
        id: 'route-alpha',
        fromId: 'colony-1',
        toId: 'capital-1',
        resource: 'metal',
        mode: 'fixed',
        amount: 5000,
        intervalDays: 1,
        lastProcessed: 0,
        active: true,
        assignedShips: { smallCargo: 1, largeCargo: 0 }
      }
    ],
    planets: [
      {
        id: 'colony-1',
        name: 'Minera Uno',
        galaxy: 1,
        system: 1,
        position: 2,
        isHome: false,
        resources: { metal: 20000, crystal: 10000, deuterium: 5000 },
        buildings: { metalMine: 10, metalStorage: 5 },
        fleet: { smallCargo: 5, largeCargo: 2 }
      },
      {
        id: 'capital-1',
        name: 'Capital Prime',
        galaxy: 1,
        system: 1,
        position: 1,
        isHome: true,
        resources: { metal: 5000, crystal: 5000, deuterium: 5000 },
        buildings: { metalStorage: 5, crystalStorage: 5, deutTank: 5 },
        fleet: {}
      }
    ],
    fleetMissions: [],
    notifications: []
  });

  it('PROCESS_TRADE_ROUTES dispatches real transport fleet mission and deducts ships & cargo from origin', () => {
    const initialState = createMockState();
    const resultState = handleProcessTradeRoutes(initialState, { type: 'PROCESS_TRADE_ROUTES' });

    // 1. Must NOT immediately increase destination planet resources (no instant teleportation)
    const destPlanet = resultState.planets.find(p => p.id === 'capital-1');
    expect(destPlanet.resources.metal).toBe(5000);

    // 2. Must deduct resources and cargo ships from origin planet
    const originPlanet = resultState.planets.find(p => p.id === 'colony-1');
    expect(originPlanet.resources.metal).toBe(15000); // 20000 - 5000
    expect(originPlanet.fleet.smallCargo).toBe(4); // 5 - 1 assigned ship used

    // 3. Must create a real fleet mission of type transport
    expect(resultState.fleetMissions).toHaveLength(1);
    const mission = resultState.fleetMissions[0];
    expect(mission.type).toBe('transport');
    expect(mission.from.id).toBe('colony-1');
    expect(mission.to.id).toBe('capital-1');
    expect(mission.resources.metal).toBe(5000);
    expect(mission.fleet.smallCargo).toBe(1);
    expect(mission.arrivalTime).toBeGreaterThan(Date.now() - 1000);
  });

  it('autoTradeRoutesTick also dispatches a real transport mission and updates route lastProcessed', () => {
    const initialState = createMockState();
    const resultState = processAutoTradeRoutesTick(initialState);

    expect(resultState.fleetMissions).toHaveLength(1);
    const mission = resultState.fleetMissions[0];
    expect(mission.type).toBe('transport');
    expect(mission.resources.metal).toBe(5000);

    const updatedRoute = resultState.tradeRoutes.find(r => r.id === 'route-alpha');
    expect(updatedRoute.lastProcessed).toBeGreaterThan(0);
  });

  it('handleTransportMission respects destination storage limits and returns convoy fleet', () => {
    const state = {
      planets: [
        {
          id: 'capital-1',
          name: 'Capital Prime',
          galaxy: 1,
          system: 1,
          position: 1,
          resources: { metal: 95000, crystal: 1000, deuterium: 1000 },
          buildings: { metalStorage: 1 } // Max storage 100,000 (base 100k + bonus)
        }
      ]
    };

    const mission = {
      id: 'mission-test',
      from: { id: 'colony-1', name: 'Minera Uno' },
      to: { id: 'capital-1', galaxy: 1, system: 1, position: 1 },
      resources: { metal: 20000, crystal: 0, deuterium: 0 },
      fleet: { smallCargo: 4 }
    };

    const result = handleTransportMission(mission, state);
    const updatedTarget = result.state.planets.find(p => p.id === 'capital-1');

    // Almacén base para metalStorage 1 es 100k (o 100k * 1.5). No debe exceder la capacidad del almacén
    expect(result.type).toBe('success');
    expect(result.returnFleet).toEqual({ smallCargo: 4 });
    expect(updatedTarget.resources.metal).toBeLessThanOrEqual(100000);
  });
});
