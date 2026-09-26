import { describe, it, expect } from 'vitest';
import { processLivingPlanetTick } from '../reducers/tick/livingPlanetTick.js';
import { systemReducer } from '../reducers/systemReducer.js';

describe('Living Planet & Governance Simulation Engine', () => {
  it('should initialize biosphere, thermalGrid, demographics and governance if absent', () => {
    const planet = {
      id: 'p1',
      name: 'Test Prime',
      biome: 'temperate',
      population: 50000,
      buildings: { metalMine: 5, crystalMine: 3 }
    };

    const updated = processLivingPlanetTick(planet, {});

    expect(updated.biosphere).toBeDefined();
    expect(updated.biosphere.pressureAtm).toBe(1.0);
    expect(updated.biosphere.o2Level).toBe(0.21);
    expect(updated.thermalGrid).toBeDefined();
    expect(updated.thermalGrid.heatGeneratedMW).toBeGreaterThan(0);
    expect(updated.demographics).toBeDefined();
    expect(updated.demographics.primaryLabor).toBe(25000);
    expect(updated.governance).toBeDefined();
  });

  it('should dissipate heat based on biome capacity and ministerial radiator arrays', () => {
    const planet = {
      id: 'p1',
      name: 'Frozen Outpost',
      biome: 'frozen',
      population: 20000,
      buildings: { metalMine: 10, fusionReactor: 2 },
      governance: {
        governor: null,
        localMinistries: {
          energy: { budgetShare: 0.2, activeTasks: ['radiator_arrays'] }
        }
      }
    };

    const updated = processLivingPlanetTick(planet, {});

    // Frozen biome dissipation is 9000. With radiator_arrays (+25%), dissipation is 11250.
    expect(updated.thermalGrid.heatDissipatedMW).toBe(11250);
  });

  it('should handle governor and local ministerial subtask actions in systemReducer', () => {
    const initialState = {
      gameStarted: true,
      currentPlanetId: 'p1',
      planets: [
        {
          id: 'p1',
          name: 'Capital World',
          governance: {
            governor: null,
            localMinistries: {
              infra: { budgetShare: 0.20, activeTasks: [] }
            }
          }
        }
      ]
    };

    // 1. Assign governor
    const governorTrait = { id: 'technocrat_pragmatic', name: 'Tecnócrata Pragmático' };
    const stateWithGov = systemReducer(initialState, {
      type: 'SET_PLANET_GOVERNOR',
      payload: { planetId: 'p1', governor: governorTrait }
    });
    expect(stateWithGov.planets[0].governance.governor.id).toBe('technocrat_pragmatic');

    // 2. Toggle ministerial task
    const stateWithTask = systemReducer(stateWithGov, {
      type: 'TOGGLE_LOCAL_MINISTERIAL_SUBTASK',
      payload: { planetId: 'p1', ministryKey: 'infra', taskId: 'seal_domes' }
    });
    expect(stateWithTask.planets[0].governance.localMinistries.infra.activeTasks).toContain('seal_domes');

    // 3. Toggle off
    const stateTaskToggledOff = systemReducer(stateWithTask, {
      type: 'TOGGLE_LOCAL_MINISTERIAL_SUBTASK',
      payload: { planetId: 'p1', ministryKey: 'infra', taskId: 'seal_domes' }
    });
    expect(stateTaskToggledOff.planets[0].governance.localMinistries.infra.activeTasks).not.toContain('seal_domes');
  });
});