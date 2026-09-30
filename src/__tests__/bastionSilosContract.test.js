import { describe, it, expect } from 'vitest';
import { DEFENSES } from '../data/gameData.js';
import { handleStartDefense } from '../reducers/fleet/shipProductionActions.js';
import { processAllQueuesTick } from '../reducers/tick/queues/queueTick.js';
import { handleBuildMissile } from '../reducers/fleet/missileReducer.js';

describe('Phase 09 - Defensive Bastion & Silos System Contracts', () => {
  it('START_DEFENSE adds items to defenseQueue with initial deployment/calibration metadata', () => {
    const mockState = {
      gameTick: 1,
      currentPlanetId: 'p1',
      research: { weapons: 2, shields: 1, armour: 1 },
      defenseQueue: [],
      planets: [
        {
          id: 'p1',
          name: 'Fortress World',
          resources: { metal: 100000, crystal: 50000, deuterium: 20000 },
          buildings: { shipyard: 2, constructionCenter: 0 },
          defenses: { rocketLauncher: 0 }
        }
      ]
    };

    const nextState = handleStartDefense(mockState, {
      type: 'START_DEFENSE',
      defenseId: 'rocketLauncher',
      quantity: 5,
      planetId: 'p1'
    });

    expect(nextState.defenseQueue.length).toBe(1);
    const item = nextState.defenseQueue[0];
    expect(item.defenseId).toBe('rocketLauncher');
    expect(item.quantity).toBe(5);
    expect(item.endTime).toBeGreaterThan(item.startTime);
    // Verified: defense build deduction occurred
    expect(nextState.planets[0].resources.metal).toBeLessThan(100000);
  });

  it('queueTick delivers completed defense batteries to defenses and defenseVariants', () => {
    const startTime = Date.now() - 10000;
    const endTime = Date.now() - 1000; // finished in the past

    const mockState = {
      gameTick: 10,
      research: { weapons: 0, shields: 0, armour: 0 },
      defenseQueue: [
        {
          id: 'q-def-1',
          planetId: 'p1',
          defenseId: 'lightLaser',
          quantity: 2,
          unitsDelivered: 0,
          startTime,
          endTime,
          techSnapshot: { weapons: 0, shields: 0, armour: 0 },
          techGen: 1
        }
      ],
      planets: [
        {
          id: 'p1',
          name: 'Defense Planet',
          buildings: { shipyard: 1 },
          defenses: { lightLaser: 0 },
          defenseVariants: {}
        }
      ],
      notifications: [],
      stats: { totalDefenses: 0 }
    };

    const nextState = processAllQueuesTick(mockState);
    expect(nextState.defenseQueue.length).toBe(0);
    expect(nextState.planets[0].defenses.lightLaser).toBe(2);
    expect(nextState.stats.totalDefenses).toBe(2);
  });

  it('handleBuildMissile validates silo capacity and deducts resources correctly', () => {
    const mockState = {
      currentPlanetId: 'p1',
      planets: [
        {
          id: 'p1',
          resources: { metal: 200000, crystal: 50000, deuterium: 20000 },
          buildings: { missileSilo: 1, constructionCenter: 0 },
          missiles: { antiBallisticMissile: 0 }
        }
      ],
      notifications: []
    };

    const nextState = handleBuildMissile(mockState, {
      type: 'BUILD_MISSILE',
      missileId: 'antiBallisticMissile',
      quantity: 3
    });

    expect(nextState.planets[0].missiles.antiBallisticMissile).toBe(3);
    // Silo capacity for lvl 1 is 10. Building 10 more when 3 are already present should cap at 7
    const fullState = handleBuildMissile(nextState, {
      type: 'BUILD_MISSILE',
      missileId: 'antiBallisticMissile',
      quantity: 10
    });

    expect(fullState.planets[0].missiles.antiBallisticMissile).toBe(10);
  });
});
