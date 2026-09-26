import { describe, it, expect, vi } from 'vitest';
import { processColonyGovernor } from '../reducers/colonyGovernor.js';
import { processAutoBuildTick } from '../reducers/tick/automation/autoBuildTick.js';

describe('Motor de Gobernador Colonial Estricto', () => {
  it('NO debe iniciar ninguna obra ni investigación si autoGovernance está activo pero todos los ministerios están vacantes', () => {
    const dispatch = vi.fn();
    const state = {
      buildQueue: [],
      researchQueue: [],
      planets: [
        {
          id: 'planet-1',
          name: 'Colonia Alfa',
          autoGovernance: true,
          resources: { metal: 50000, crystal: 50000, deuterium: 50000 },
          buildings: { solarPlant: 1, metalMine: 1 },
          ministries: {
            infra: { minister: null, automationEnabled: false },
            resources: { minister: null, automationEnabled: false },
            energy: { minister: null, automationEnabled: false },
            science: { minister: null, automationEnabled: false }
          }
        }
      ]
    };

    processColonyGovernor(state, dispatch);

    // No debe haberse despachado ninguna acción de construcción o investigación
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('SÍ debe permitir que un ministerio con ministro investido y autónomo construya sus propios edificios', () => {
    const dispatch = vi.fn();
    const state = {
      buildQueue: [],
      researchQueue: [],
      planets: [
        {
          id: 'planet-1',
          name: 'Colonia Alfa',
          autoGovernance: true,
          resources: { metal: 50000, crystal: 50000, deuterium: 50000 },
          buildings: { solarPlant: 1, metalMine: 1 },
          ministries: {
            infra: { minister: null, automationEnabled: false },
            resources: { minister: { id: 'cand-1', name: 'Ministro Minero' }, automationEnabled: true },
            energy: { minister: null, automationEnabled: false }
          }
        }
      ]
    };

    processColonyGovernor(state, dispatch);

    // Debe haber despachado al menos una obra perteneciente a Recursos
    expect(dispatch).toHaveBeenCalled();
    const action = dispatch.mock.calls[0][0];
    expect(action.type).toBe('START_BUILDING');
  });

  it('Directriz 1 (autonomous_only): NO gestiona ministerios asignados si automationEnabled es false', () => {
    const dispatch = vi.fn();
    const state = {
      buildQueue: [],
      researchQueue: [],
      planets: [
        {
          id: 'planet-1',
          name: 'Colonia Alfa',
          autoGovernance: true,
          governorDirectiveMode: 'autonomous_only',
          resources: { metal: 50000, crystal: 50000, deuterium: 50000 },
          buildings: { solarPlant: 1, metalMine: 1 },
          ministries: {
            resources: { minister: { id: 'cand-1', name: 'Ministro Minero' }, automationEnabled: false }
          }
        }
      ]
    };

    processColonyGovernor(state, dispatch);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('Directriz 2 (assigned_all): SÍ gestiona ministerios asignados aunque automationEnabled sea false', () => {
    const dispatch = vi.fn();
    const state = {
      buildQueue: [],
      researchQueue: [],
      planets: [
        {
          id: 'planet-1',
          name: 'Colonia Alfa',
          autoGovernance: true,
          governorDirectiveMode: 'assigned_all',
          resources: { metal: 50000, crystal: 50000, deuterium: 50000 },
          buildings: { solarPlant: 1, metalMine: 1 },
          ministries: {
            resources: { minister: { id: 'cand-1', name: 'Ministro Minero' }, automationEnabled: false }
          }
        }
      ]
    };

    processColonyGovernor(state, dispatch);
    expect(dispatch).toHaveBeenCalled();
    expect(dispatch.mock.calls.some(c => c[0].type === 'START_BUILDING')).toBe(true);
  });

  it('Directriz 3 (full_auto): Inviste automáticamente a ministros en ministerios desbloqueados y los activa', () => {
    const dispatch = vi.fn();
    const state = {
      buildQueue: [],
      researchQueue: [],
      planets: [
        {
          id: 'planet-1',
          name: 'Colonia Alfa',
          autoGovernance: true,
          governorDirectiveMode: 'full_auto',
          resources: { metal: 50000, crystal: 50000, deuterium: 50000 },
          buildings: { solarPlant: 1, metalMine: 1, researchLab: 1 },
          ministries: {
            infra: { minister: null, automationEnabled: false },
            resources: { minister: null, automationEnabled: false },
            science: { minister: null, automationEnabled: false }
          }
        }
      ]
    };

    processColonyGovernor(state, dispatch);
    // Debe haber despachado nombramientos de ministros (APPOINT_MINISTER)
    const appointCalls = dispatch.mock.calls.filter(c => c[0].type === 'APPOINT_MINISTER');
    expect(appointCalls.length).toBeGreaterThan(0);
    // Para ciencia (ya que tiene researchLab construido), debe haberse investido a un candidato
    expect(appointCalls.some(c => c[0].ministryId === 'science')).toBe(true);

    // Debe haber despachado activación de automatización (SET_MINISTRY_AUTOMATION)
    const autoCalls = dispatch.mock.calls.filter(c => c[0].type === 'SET_MINISTRY_AUTOMATION');
    expect(autoCalls.length).toBeGreaterThan(0);
    expect(autoCalls.some(c => c[0].ministryId === 'science' && c[0].enabled === true)).toBe(true);
  });

  it('VETO ESTRICTO: NO debe construir un edificio si el jugador ha vetado su automatización en automatedExclusions', () => {
    const dispatch = vi.fn();
    const state = {
      buildQueue: [],
      researchQueue: [],
      planets: [
        {
          id: 'planet-1',
          name: 'Colonia Alfa',
          autoGovernance: true,
          resources: { metal: 50000, crystal: 50000, deuterium: 50000 },
          buildings: { solarPlant: 1, metalMine: 1 },
          automatedExclusions: {
            crystalMine: true // Veto explícito del jugador a la mina de cristal
          },
          ministries: {
            resources: { minister: { id: 'cand-1', name: 'Capataz Darek Vorn' }, automationEnabled: true }
          }
        }
      ]
    };

    processColonyGovernor(state, dispatch);

    // Debe haber iniciado una obra, pero NUNCA crystalMine
    expect(dispatch).toHaveBeenCalled();
    const buildCalls = dispatch.mock.calls.filter(c => c[0].type === 'START_BUILDING');
    expect(buildCalls.length).toBeGreaterThan(0);
    const builtIds = buildCalls.map(c => c[0].buildingId);
    expect(builtIds).not.toContain('crystalMine');
  });

  it('VETO TOTAL: Si todos los edificios viables del ministerio están vetados, el ministro no construye nada', () => {
    const dispatch = vi.fn();
    const state = {
      buildQueue: [],
      researchQueue: [],
      planets: [
        {
          id: 'planet-1',
          name: 'Colonia Alfa',
          autoGovernance: true,
          resources: { metal: 50000, crystal: 50000, deuterium: 50000 },
          buildings: { solarPlant: 1, metalMine: 1 },
          automatedExclusions: {
            metalMine: true,
            crystalMine: true,
            deutSynth: true
          },
          ministries: {
            resources: { minister: { id: 'cand-1', name: 'Capataz Darek Vorn' }, automationEnabled: true }
          }
        }
      ]
    };

    processColonyGovernor(state, dispatch);

    const buildCalls = dispatch.mock.calls.filter(c => c[0].type === 'START_BUILDING');
    expect(buildCalls.length).toBe(0);
  });

  it('VETO IRREFUTABLE EN TICK DE AUTO-BUILD: autoBuildTick respeta estrictamente automatedExclusions bajo cualquier modo de IA', () => {
    const state = {
      buildQueue: [],
      research: {},
      planets: [
        {
          id: 'planet-1',
          name: 'Colonia Alfa',
          autoGovernance: true,
          governorDirectiveMode: 'full_auto',
          population: 5000,
          resources: { metal: 100000, crystal: 100000, deuterium: 100000 },
          buildings: { solarPlant: 10, metalMine: 5, crystalMine: 5 },
          automatedExclusions: {
            metalMine: true,
            crystalMine: true,
            deutSynth: true
          },
          ministries: {
            resources: { minister: { id: 'cand-1', name: 'Capataz Darek Vorn' }, automationEnabled: true }
          }
        }
      ]
    };

    const prodCache = new Map();
    prodCache.set('planet-1', { metal: 500, crystal: 300, deuterium: 100, energyBalance: 50, ratio: 1 });
    const storageCache = new Map();
    storageCache.set('planet-1', { metal: 500000, crystal: 500000, deuterium: 500000 });

    const nextState = processAutoBuildTick(state, prodCache, storageCache);
    const queuedBuildingIds = nextState.buildQueue.map(q => q.buildingId);
    expect(queuedBuildingIds).not.toContain('metalMine');
    expect(queuedBuildingIds).not.toContain('crystalMine');
    expect(queuedBuildingIds).not.toContain('deutSynth');
  });
});

