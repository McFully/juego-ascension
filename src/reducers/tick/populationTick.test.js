import { describe, it, expect } from 'vitest';
import { processPlanetTick } from './populationTick.js';

describe('processPlanetTick', () => {
  const mockProd = { metal: 3600, crystal: 3600, deuterium: 3600 };
  const mockStorage = { metal: 100000, crystal: 100000, deuterium: 100000 };
  const mockState = {
    research: {},
    planets: []
  };

  it('handles colony population growth with sufficient resources', () => {
    const planet = {
      id: 'p1',
      resources: { metal: 5000, crystal: 5000, deuterium: 5000 },
      population: 1000,
      buildings: {},
      retrofitTech: {}
    };
    const updated = processPlanetTick(planet, mockProd, mockStorage, mockState);
    expect(updated).toBeDefined();
    expect(updated.population).toBeGreaterThanOrEqual(1000);
    expect(updated.resources.metal).toBeGreaterThan(0);
  });

  it('handles famine when resources are insufficient', () => {
    const planet = {
      id: 'p2',
      resources: { metal: 0, crystal: 0, deuterium: 0 },
      population: 50000,
      buildings: {},
      retrofitTech: {}
    };
    const updated = processPlanetTick(planet, { metal: 0, crystal: 0, deuterium: 0 }, mockStorage, mockState);
    expect(updated).toBeDefined();
    expect(updated.resources.metal).toBe(0);
  });
});
