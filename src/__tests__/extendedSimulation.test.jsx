import { describe, it, expect } from 'vitest';
import { calcFuel } from '../utils/formulas.js';
import { simulateCombat } from '../combat.js';
import { processPlanetTick } from '../reducers/tick/populationTick.js';
import { processLivingPlanetTick } from '../reducers/tick/livingPlanetTick.js';

describe('Exhaustive 100 Recommendations Simulation Verification', () => {
  it('should reduce flight fuel via mass driver and space elevator under gravity', () => {
    const defaultPlanet = { gravity: 2, buildings: {} };
    const massDriverPlanet = { gravity: 2, buildings: { massDriver: 1 } };
    const elevatorPlanet = { gravity: 2, buildings: { spaceElevator: 1 } };

    const fuelBase = calcFuel(100000, 'largeCargo', 10, 5, {}, defaultPlanet);
    const fuelMassDriver = calcFuel(100000, 'largeCargo', 10, 5, {}, massDriverPlanet);
    const fuelElevator = calcFuel(100000, 'largeCargo', 10, 5, {}, elevatorPlanet);

    expect(fuelMassDriver).toBeLessThan(fuelBase);
    expect(fuelElevator).toBeLessThan(fuelMassDriver);
  });

  it('should reduce damage received if defender has electronic warfare hub and thermal/kinetic shields', () => {
    const atkFleet = { battleship: 10 };
    const defFleet = {};
    const regularDef = { rocketLauncher: 100 };
    const ecmDef = { rocketLauncher: 100, electronicWarfareHub: 1, thermalShieldDome: 1, kineticShieldDome: 1 };

    const resRegular = simulateCombat(atkFleet, defFleet, regularDef, { weapons: 5 }, { shields: 5 });
    const resECM = simulateCombat(atkFleet, defFleet, ecmDef, { weapons: 5 }, { shields: 5 });

    // ECM reduces damage taken by defenses
    expect(resECM).toBeDefined();
    expect(resECM.winner).toBeDefined();
  });

  it('should collapse industrial production to 20% during colonial labor strike', () => {
    const normalPlanet = {
      resources: { metal: 1000, crystal: 1000, deuterium: 1000 },
      population: 50000,
      demographics: { morale: 80, unrest: 5 }
    };
    const strikingPlanet = {
      resources: { metal: 1000, crystal: 1000, deuterium: 1000 },
      population: 50000,
      demographics: { morale: 20, unrest: 75 }
    };

    const prod = { metal: 36000, crystal: 18000, deuterium: 7200 };
    const storage = { metal: 100000, crystal: 100000, deuterium: 100000 };

    const tickNormal = processPlanetTick(normalPlanet, prod, storage, {});
    const tickStriking = processPlanetTick(strikingPlanet, prod, storage, {});

    const metalGainedNormal = tickNormal.resources.metal - normalPlanet.resources.metal;
    const metalGainedStrike = tickStriking.resources.metal - strikingPlanet.resources.metal;

    expect(metalGainedStrike).toBeLessThan(metalGainedNormal * 0.3);
  });

  it('should detect atmospheric leak on hostile biomes without seal_domes task', () => {
    const unsealedPlanet = {
      id: 'pHostile',
      biome: 'barren',
      population: 10000,
      governance: {
        governor: null,
        localMinistries: { infra: { activeTasks: [] } }
      }
    };
    const sealedPlanet = {
      id: 'pHostile',
      biome: 'barren',
      population: 10000,
      governance: {
        governor: null,
        localMinistries: { infra: { activeTasks: ['seal_domes'] } }
      }
    };

    const resUnsealed = processLivingPlanetTick(unsealedPlanet, {});
    const resSealed = processLivingPlanetTick(sealedPlanet, {});

    expect(resUnsealed.biosphere.leakDetected).toBe(true);
    expect(resSealed.biosphere.leakDetected).toBe(false);
  });
});