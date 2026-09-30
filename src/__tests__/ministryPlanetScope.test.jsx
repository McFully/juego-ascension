import { describe, it, expect, beforeEach } from 'vitest';
import { eventReducer } from '../reducers/eventReducer.js';
import { governmentReducer } from '../reducers/governmentReducer.js';
import { migrateLoadState } from '../reducers/loadMigrator.js';
import { buildPlanetMinistries } from '../data/ministryState.js';

/**
 * Los ministerios son del planeta. Estas pruebas fijan esa frontera: nada de
 * lo que se hace en el gabinete de un mundo puede aparecer en otro.
 */

const makePlanet = (id, name, extra = {}) => ({
  id,
  name,
  galaxy: 1,
  system: 1,
  position: 1,
  biome: 'temperate',
  planetSize: 100,
  gravity: 2,
  population: 1000,
  resources: { metal: 100000, crystal: 100000, deuterium: 100000, slag: 0 },
  buildings: {},
  fleet: {},
  defenses: {},
  missiles: {},
  ministries: buildPlanetMinistries('standard'),
  ministryUpgrades: {},
  ...extra
});

const makeEmpire = (extra = {}) => ({
  version: 4,
  playerName: 'Comandante',
  gameMode: 'standard',
  currentPlanetId: 'p-a',
  influence: 1000,
  gameTick: 0,
  ministries: buildPlanetMinistries('standard'),
  planets: [makePlanet('p-a', 'Alfa'), makePlanet('p-b', 'Beta')],
  ...extra
});

describe('independencia de gabinetes entre mundos', () => {
  it('nombrar un ministro no aparece en otro mundo', () => {
    const state = makeEmpire();
    const next = governmentReducer(state, {
      type: 'APPOINT_MINISTER',
      ministryId: 'economy',
      minister: { id: 'm-1', name: 'Ministro de Alfa' },
      planetId: 'p-a'
    });

    const alfa = next.planets.find(p => p.id === 'p-a');
    const beta = next.planets.find(p => p.id === 'p-b');

    expect(alfa.ministries.economy.minister?.name).toBe('Ministro de Alfa');
    expect(beta.ministries.economy.minister).toBeFalsy();
  });

  it('un planeta sin gabinete previo arranca en blanco, no con el gabinete de otro', () => {
    const state = makeEmpire();
    const next = governmentReducer(state, {
      type: 'APPOINT_MINISTER',
      ministryId: 'war',
      minister: { id: 'm-2', name: 'Gobernador Militar' },
      planetId: 'p-a'
    });

    const betaSinGabinete = {
      ...next,
      planets: next.planets.map(p => (p.id === 'p-b' ? { ...p, ministries: undefined } : p))
    };

    const siguiente = governmentReducer(betaSinGabinete, {
      type: 'SET_MINISTRY_STATE',
      ministryId: 'war',
      patch: { patrolIntensity: 3 },
      planetId: 'p-b'
    });

    const beta = siguiente.planets.find(p => p.id === 'p-b');
    const alfa = siguiente.planets.find(p => p.id === 'p-a');

    expect(beta.ministries.war.patrolIntensity).toBe(3);
    expect(beta.ministries.war.minister).toBeFalsy();
    expect(alfa.ministries.war.minister?.name).toBe('Gobernador Militar');
  });

  it('una directiva de un mundo no se propaga a los demás', () => {
    const state = makeEmpire();
    const next = governmentReducer(state, {
      type: 'TOGGLE_MINISTRY_DIRECTIVE',
      ministryId: 'economy',
      directiveId: ' austerity',
      planetId: 'p-a'
    });

    const alfa = next.planets.find(p => p.id === 'p-a');
    const beta = next.planets.find(p => p.id === 'p-b');

    expect(alfa.ministries.economy.directives?.[' austerity']).toBe(true);
    expect(beta.ministries.economy.directives?.[' austerity']).toBeUndefined();
  });
});

describe('independencia de programas de ministerio', () => {
  it('subir un programa solo sube el nivel en el mundo que lo financia', () => {
    const state = makeEmpire();
    const next = eventReducer(state, {
      type: 'MINISTRY_PROJECT',
      ministryId: 'science',
      planetId: 'p-a',
      cost: { metal: 100 },
      effect: { programId: 'research_grants', level: 1 }
    });

    const alfa = next.planets.find(p => p.id === 'p-a');
    const beta = next.planets.find(p => p.id === 'p-b');

    expect(alfa.ministryUpgrades.science.research_grants).toBe(1);
    expect(beta.ministryUpgrades.science).toBeUndefined();
    expect(next.ministryUpgrades).toBeUndefined();
  });

  it('descontar el coste sale del mundo que paga', () => {
    const state = makeEmpire();
    const next = eventReducer(state, {
      type: 'MINISTRY_PROJECT',
      ministryId: 'economy',
      planetId: 'p-b',
      cost: { metal: 250 },
      effect: { programId: 'tax_reform', level: 1 }
    });

    const alfa = next.planets.find(p => p.id === 'p-a');
    const beta = next.planets.find(p => p.id === 'p-b');

    expect(beta.resources.metal).toBe(99750);
    expect(alfa.resources.metal).toBe(100000);
  });

  it('el mismo programa en dos mundos tiene niveles distintos', () => {
    const state = makeEmpire();
    const uno = eventReducer(state, {
      type: 'MINISTRY_PROJECT',
      ministryId: 'defense',
      planetId: 'p-a',
      cost: { metal: 10 },
      effect: { programId: 'silos', level: 1 }
    });
    const dos = eventReducer(uno, {
      type: 'MINISTRY_PROJECT',
      ministryId: 'defense',
      planetId: 'p-a',
      cost: { metal: 10 },
      effect: { programId: 'silos', level: 2 }
    });

    const alfa = dos.planets.find(p => p.id === 'p-a');
    const beta = dos.planets.find(p => p.id === 'p-b');

    expect(alfa.ministryUpgrades.defense.silos).toBe(2);
    expect(beta.ministryUpgrades.defense).toBeUndefined();
  });
});

describe('migración de partidas v4 al gabinete por planeta', () => {
  beforeEach(() => {
    // sanity: el helper existe y devuelve los 17 ministerios
    expect(Object.keys(buildPlanetMinistries('standard')).length).toBeGreaterThan(10);
  });

  it('los programas globales heredados pasan al planeta activo y el estado global desaparece', () => {
    const raw = {
      version: 4,
      playerName: 'Comandante',
      gameStarted: true,
      gameMode: 'standard',
      currentPlanetId: 'p-a',
      planets: [
        { id: 'p-a', name: 'Alfa', resources: {} },
        { id: 'p-b', name: 'Beta', resources: {} }
      ],
      ministryUpgrades: {
        science: { research_grants: 3 }
      }
    };

    const migrated = migrateLoadState(raw);

    expect(migrated.ministryUpgrades).toBeUndefined();
    const alfa = migrated.planets.find(p => p.id === 'p-a');
    const beta = migrated.planets.find(p => p.id === 'p-b');
    expect(alfa.ministryUpgrades.science.research_grants).toBe(3);
    expect(beta.ministryUpgrades).toEqual({});
  });

  it('cada planeta recibe su gabinete completo tras cargar', () => {
    const raw = {
      version: 4,
      playerName: 'Comandante',
      gameStarted: true,
      currentPlanetId: 'p-a',
      planets: [
        { id: 'p-a', name: 'Alfa', resources: {} },
        { id: 'p-b', name: 'Beta', resources: {} }
      ]
    };

    const migrated = migrateLoadState(raw);
    for (const planet of migrated.planets) {
      expect(planet.ministries.economy).toBeDefined();
      expect(planet.ministries.economy.minister).toBeFalsy();
      expect(planet.ministryUpgrades).toEqual({});
    }
  });
});