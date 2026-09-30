import { describe, it, expect, vi } from 'vitest';
import { processColonyGovernor, scoreMinisterCandidate, pickBestCandidate } from '../reducers/colonyGovernor.js';
import { processAutoBuildTick } from '../reducers/tick/automation/autoBuildTick.js';
import { MINISTRY_MAPPING } from '../data/buildingOperationsData.js';
import {
  buildMinistriesState,
  MINISTRY_BUILDING_REQS,
  isMinistryUnlocked,
} from '../data/ministryState.js';
import { ensureMinistries, processMinistriesTick } from '../reducers/tick/ministries/ministryTick.js';

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

describe('1.2-d — la cola global de 8 reparte entre ministerios', () => {
  // El síntoma era que energy → resources → infra se comían los 8 huecos y
  // ciencia/innovación/cibernética se quedaban sin investigar nunca.
  const stateWith = (ministryIds, over = {}) => ({
    gameTick: 0,
    // `energy: 1` es el prerrequisito real: la tech más barata de ciencia es
    // `combustion`, que exige energy:1. En una partida recién empezada, energía
    // investiga primero y ya el tick siguiente ciencia tiene algo viable.
    research: { energy: 1 },
    buildQueue: [],
    researchQueue: [],
    currentPlanetId: 'planet-1',
    planets: [
      {
        id: 'planet-1',
        name: 'Colonia Alfa',
        autoGovernance: false,
        energyBalance: 999, // energía sobrada: no debe forzar al de energía
        resources: { metal: 5e7, crystal: 5e7, deuterium: 5e7 },
        buildings: { researchLab: 4, constructionCenter: 1 },
        ministries: Object.fromEntries(
          ministryIds.map(id => [id, { minister: { id: 'c1', name: 'Ministro' }, automationEnabled: true }])
        ),
        ...over,
      },
    ],
  });

  it('con 2 ministerios activos, ambos consiguen investigar', () => {
    const dispatch = vi.fn();
    processColonyGovernor(stateWith(['energy', 'science']), dispatch);

    const research = dispatch.mock.calls.filter(c => c[0].type === 'START_RESEARCH');
    expect(research.length).toBe(2);

    // Y son techs de ministerios DISTINTOS: si ambos fueran energy, uno se quedaría fuera.
    const ids = research.map(c => c[0].researchId);
    expect(new Set(ids).size).toBe(2);
  });

  it('la rotación reparte el primer turno entre ministerios a lo largo de los ticks', () => {
    // energy y science son los dos que tienen tech viable en este escenario
    // (innovation y war aún no: sus prerrequisitos no se cumplen). Con la
    // cola a 4 de 8 caben los dos, así que se registra qué ministerio elige
    // primero: si el orden fuera fijo, siempre sería el mismo.
    const primeroCadaTick = (gameTick) => {
      const dispatch = vi.fn();
      const s = stateWith(['energy', 'science']);
      s.gameTick = gameTick;
      s.researchQueue = new Array(4).fill({}); // 4 ocupados, quedan 4 huecos
      processColonyGovernor(s, dispatch);
      const research = dispatch.mock.calls.filter(c => c[0].type === 'START_RESEARCH');
      // `mock.calls` guarda arrays de argumentos: la acción va en [0].
      return research[0]?.[0]?.researchId;
    };

    const picks = [0, 1, 2, 3].map(primeroCadaTick);
    // No todos los ticks empiezan por el mismo ministerio: la cola no la acapara uno.
    expect(new Set(picks).size).toBeGreaterThan(1);
  });

  it('nunca se superan los 8 huecos de la cola en un tick', () => {
    const dispatch = vi.fn();
    // 6 ministerios con laboratorio, cola vacía: el tope de 8 debe mandar.
    const s = stateWith(['energy', 'resources', 'infra', 'science', 'innovation', 'war']);
    processColonyGovernor(s, dispatch);
    expect(dispatch.mock.calls.filter(c => c[0].type === 'START_RESEARCH').length).toBeLessThanOrEqual(8);
  });

  it('con la cola ya llena, no se despacha ninguna investigación', () => {
    const dispatch = vi.fn();
    const s = stateWith(['energy', 'science', 'innovation', 'war']);
    s.researchQueue = new Array(8).fill({});
    processColonyGovernor(s, dispatch);
    expect(dispatch.mock.calls.filter(c => c[0].type === 'START_RESEARCH').length).toBe(0);
  });

  it('un ministerio sin laboratorio no consume hueco', () => {
    const dispatch = vi.fn();
    const s = stateWith(['energy', 'science']);
    s.planets[0].buildings = { researchLab: 0, constructionCenter: 1 };
    processColonyGovernor(s, dispatch);
    expect(dispatch.mock.calls.filter(c => c[0].type === 'START_RESEARCH').length).toBe(0);
  });
});

describe('1.6-6 — full_auto elige al ministro que compensa, no al primero', () => {
  it('un planeta sin energía elige a quien mejore la energía, no al candidates[0]', () => {
    const crisis = {
      id: 'p1', name: 'Crisis', autoGovernance: true, governorDirectiveMode: 'full_auto',
      energyBalance: -80, // déficit: lo más urgente
      resources: { metal: 5e6, crystal: 3e6, deuterium: 2e6 },
      buildings: { researchLab: 4, robotFactory: 5, shipyard: 3, solarPlant: 1 },
      ministries: {},
    };
    expect(scoreMinisterCandidate({ bonus: 'energyBoost' }, crisis))
      .toBeGreaterThan(scoreMinisterCandidate({ bonus: 'metalProd' }, crisis));
  });

  it('un planeta con energía de sobra prioriza producción sobre energía', () => {
    const holgado = {
      id: 'p1', name: 'Holgado', autoGovernance: true, governorDirectiveMode: 'full_auto',
      energyBalance: 500,
      resources: { metal: 1e6, crystal: 1e6, deuterium: 1e6 },
      buildings: { solarPlant: 15, fusionReactor: 5 },
      ministries: {},
    };
    expect(scoreMinisterCandidate({ bonus: 'metalProd' }, holgado))
      .toBeGreaterThan(scoreMinisterCandidate({ bonus: 'energyBoost' }, holgado));
  });

  it('una invasión entrante sube a los candidatos de defensa', () => {
    const base = {
      id: 'p1', name: 'X', energyBalance: 300,
      resources: { metal: 5e6, crystal: 3e6, deuterium: 2e6 },
      buildings: {}, ministries: {},
    };
    const tranquilo = scoreMinisterCandidate({ bonus: 'fleetAttack' }, base);
    const amenazado = scoreMinisterCandidate(
      { bonus: 'fleetAttack' },
      { ...base, _incomingAttacks: 2 }
    );
    expect(amenazado).toBeGreaterThan(tranquilo);
  });

  it('pickBestCandidate devuelve el de mayor puntuación, no el primero', () => {
    const pool = [{ name: 'A', bonus: 'metalProd' }, { name: 'B', bonus: 'energyBoost' }];
    const conCrisis = { id: 'p1', energyBalance: -50, resources: { metal: 9e6, crystal: 9e6, deuterium: 9e6 } };
    expect(pickBestCandidate(pool, conCrisis).name).toBe('B');

    const conAbundancia = { id: 'p1', energyBalance: 900, resources: { metal: 0, crystal: 9e6, deuterium: 9e6 } };
    expect(pickBestCandidate(pool, conAbundancia).name).toBe('A');
  });

  it('pickBestCandidate tolera pool vacío o nulo', () => {
    expect(pickBestCandidate([], {})).toBeNull();
    expect(pickBestCandidate(null, {})).toBeNull();
  });

  it('un candidato sin bonus conocido no revienta y queda en valor neutro', () => {
    const s = scoreMinisterCandidate({ name: 'X' }, { id: 'p1' });
    expect(Number.isFinite(s)).toBe(true);
    expect(s).toBeGreaterThan(0);
  });
});

describe('1.6-2 / 1.6-3 — ministerios y requisitos desde una sola fuente', () => {
  it('los 17 ministerios de MINISTRY_MAPPING nacen con estado', () => {
    const mins = buildMinistriesState();
    const ids = Object.keys(MINISTRY_MAPPING);
    expect(ids.length).toBeGreaterThan(6); // el bug era que solo había 6
    for (const id of ids) {
      expect(mins[id], `falta estado de ${id}`).toBeTruthy();
      expect(mins[id].automationEnabled, id).toBe(false);
    }
  });

  it('conserva lo que la partida ya tenía ajustado', () => {
    const mins = buildMinistriesState({
      economy: { taxRate: 0.42, automationEnabled: true },
      science: { techFocus: 'military' },
    });
    expect(mins.economy.taxRate).toBe(0.42);
    expect(mins.economy.automationEnabled).toBe(true);
    expect(mins.science.techFocus).toBe('military');
  });

  it('ensureMinistries completa una partida vieja sin perder lo suyo', () => {
    const s = ensureMinistries({
      ministries: { economy: { taxRate: 0.25, automationEnabled: true } },
    });
    expect(s.ministries.economy.taxRate).toBe(0.25);
    expect(s.ministries.economy.automationEnabled).toBe(true);
    // Y los que faltaban ahora existen:
    expect(s.ministries.science.automationEnabled).toBe(false);
    expect(Object.keys(s.ministries).length).toBe(Object.keys(MINISTRY_MAPPING).length);
  });

  it('un ministerio que solo investiga no tiene requisito de senda artificial', () => {
    // La regla es "fuente única", no "todos necesitan laboratorio". Recursos
    // construye minas: exigirle un laboratorio le quitaría también eso, y
    // `colonyGovernor` ya comprueba el laboratorio justo antes de investigar.
    expect(isMinistryUnlocked('resources', { metalMine: 3 })).toBe(true);
    expect(MINISTRY_BUILDING_REQS.resources).toBeUndefined();
  });

  it('un requisito declarado en MINISTRY_MAPPING se respeta', () => {
    // science declara parentRequiredBuilding en el propio mapeo: la fuente
    // compartida lo lee, en vez de duplicarlo en otro mapa.
    expect(MINISTRY_MAPPING.science.parentRequiredBuilding).toBe('researchLab');
    expect(MINISTRY_BUILDING_REQS.science.id).toBe('researchLab');
    expect(isMinistryUnlocked('science', {})).toBe(false);
    expect(isMinistryUnlocked('science', { researchLab: 1 })).toBe(true);
  });

  it('un requisito propio específico manda sobre el laboratorio', () => {
    expect(MINISTRY_BUILDING_REQS.war.id).toBe('shipyard');
    expect(MINISTRY_BUILDING_REQS.innovation.id).toBe('naniteFactory');
    expect(MINISTRY_BUILDING_REQS.industry.id).toBe('robotFactory');
    expect(MINISTRY_BUILDING_REQS.transport.id).toBe('spacePort');
  });

  it('con el edificio puesto, todos los ministerios con requisito se desbloquean', () => {
    const todos = {
      researchLab: 3, shipyard: 2, naniteFactory: 2, robotFactory: 2, spacePort: 1,
    };
    for (const id of Object.keys(MINISTRY_BUILDING_REQS)) {
      expect(isMinistryUnlocked(id, todos), id).toBe(true);
    }
  });
});

describe('1.6-7 — avisar de la automatización activa sin ministro', () => {
  // `economy` y `culture` los necesita el tick para el treasury y la unidad
  // social, así que se parte de un estado realista.
  const tick = (extra, over = {}) => processMinistriesTick({
    gameTick: 1,
    ministries: {
      economy: { taxRate: 0.1, treasury: 1000 },
      culture: { socialUnity: 80, propagandaLevel: 1 },
      ...extra,
    },
    notifications: [],
    research: {},
    aiPlanets: [],
    ...over,
  }, [{ id: 'p1' }], new Map([['p1', { metal: 100, crystal: 50, deuterium: 20 }]]));

  it('avisa si hay autónomo activado y ningún ministro', () => {
    const out = tick({ science: { automationEnabled: true, minister: null } });
    expect(out.notifications).toHaveLength(1);
    expect(out.notifications[0].type).toBe('warning');
    expect(out.notifications[0].message).toMatch(/sin ministro/i);
  });

  it('NO avisa si el autónomo está desactivado (es la opción normal al empezar)', () => {
    const out = tick({ science: { automationEnabled: false, minister: null } });
    expect(out.notifications).toHaveLength(0);
  });

  it('NO avisa si hay autónomo Y ministro', () => {
    const out = tick({ science: { automationEnabled: true, minister: { name: 'Doctora Vega' } } });
    expect(out.notifications).toHaveLength(0);
  });

  it('no repite el aviso cada tick (sería spam)', () => {
    const primero = tick({ science: { automationEnabled: true, minister: null } });
    expect(primero.notifications).toHaveLength(1);
    const segundo = tick({ science: { automationEnabled: true, minister: null } },
      { ministryNoopWarnings: primero.ministryNoopWarnings });
    expect(segundo.notifications).toHaveLength(0);
  });

  it('vuelve a avisar si el jugador lo nombra y luego lo deja solo otra vez', () => {
    let out = tick({ science: { automationEnabled: true, minister: null } });
    expect(out.notifications).toHaveLength(1);

    out = tick({ science: { automationEnabled: true, minister: { name: 'Vega' } } },
      { ministryNoopWarnings: out.ministryNoopWarnings });
    expect(out.ministryNoopWarnings.science).toBeUndefined();

    out = tick({ science: { automationEnabled: true, minister: null } },
      { ministryNoopWarnings: out.ministryNoopWarnings });
    expect(out.notifications).toHaveLength(1);
  });

  it('el aviso nombra el ministerio, no solo un código', () => {
    const out = tick({ science: { automationEnabled: true, minister: null } });
    expect(out.notifications[0].message).toContain('Ciencia');
  });
});

