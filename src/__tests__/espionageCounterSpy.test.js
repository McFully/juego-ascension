import { describe, it, expect } from 'vitest';
import { handleEspionageMission } from '../missions/diploMission.js';
import { processAiEspionageTick, AI_ESPIONAGE_MIN_TECH } from '../reducers/tick/ai/aiEspionageTick.js';
import {
  getPlayerEspDefense,
  PATROL_INTERCEPT_BONUS,
  PLAYER_DEFENSE_MAX_REDUCTION,
  countProbes,
  getEspionageMissionCost,
  ESPIONAGE_PHASES,
} from '../utils/espionageFormulas.js';

/**
 * ESPIONAJE CONTRA EL JUGADOR.
 *
 * Antes la IA no espiaba a nadie: el handler solo buscaba en `aiPlanets`, y
 * cinco mecánicas de contraespionaje compradas no protegían de nada porque no
 * existía la amenaza.
 */

const jugador = (extra = {}) => ({
  id: 'p-home',
  name: 'Tierra',
  galaxy: 1, system: 1, position: 1,
  buildings: {},
  ...extra,
});

const faccion = (extra = {}) => ({
  id: 'ai-1',
  name: 'Vanguardia',
  empireName: 'Vanguardia Belicista',
  galaxy: 3, system: 3, position: 3,
  research: { espionage: 6 },
  fleet: { espionageProbe: 4 },
  ...extra,
});

const misionIA = (extra = {}) => ({
  id: 'm-ai',
  type: 'espionage',
  isAI: true,
  from: faccion(),
  to: { galaxy: 1, system: 1, position: 1 },
  fleet: { espionageProbe: 1 },
  departure: 0, arrivalTime: 0, returnTime: 0,
  ...extra,
});

function conRandom(valor, fn) {
  const original = Math.random;
  Math.random = () => valor;
  try { return fn(); } finally { Math.random = original; }
}

describe('defensa del jugador frente al espionaje', () => {
  it('sin nada montado no hay defensa extra', () => {
    const d = getPlayerEspDefense(jugador(), { research: {}, ministries: {} });
    expect(d.defense).toBe(0);
    expect(d.reduction).toBe(0);
  });

  it('el nivel de contraespionaje del Ministerio cuenta', () => {
    const d = getPlayerEspDefense(jugador(), {
      research: {},
      ministries: { intel: { counterIntelLevel: 4, espionageBudget: 0 } },
    });
    expect(d.defense).toBeGreaterThan(0);
  });

  it('hawk_eye protege por los dos lados segun su texto', () => {
    const d = getPlayerEspDefense(jugador(), {
      research: {},
      ministries: { intel: { upgrades: { hawk_eye: 2 }, counterIntelLevel: 0, espionageBudget: 0 } },
    });
    expect(d.defense).toBeGreaterThan(0);
    expect(d.reduction).toBeCloseTo(0.30, 5);
  });

  it('la criptografia cuantica y los silos de sigilo tambien defienden', () => {
    const d = getPlayerEspDefense(jugador(), {
      research: { quantumCrypto: 4, stealthSilos: 4 },
      ministries: { intel: { counterIntelLevel: 0, espionageBudget: 0 } },
    });
    expect(d.defense).toBeGreaterThan(0);
    expect(d.reduction).toBeGreaterThan(0);
  });

  it('la reduccion tiene techo: nunca espiable imposible', () => {
    const d = getPlayerEspDefense(jugador({
      buildings: { earlyWarningSat: 20, phalanxSensors: 20 },
    }), {
      research: { quantumCrypto: 99, stealthSilos: 99 },
      ministries: { intel: { upgrades: { hawk_eye: 99 }, counterIntelLevel: 99, espionageBudget: 0.9 } },
    });
    expect(d.reduction).toBe(PLAYER_DEFENSE_MAX_REDUCTION);
  });

  it('tolera estados vacios', () => {
    expect(() => getPlayerEspDefense(undefined, undefined)).not.toThrow();
  });
});

describe('la IA espia al jugador', () => {
  it('sin deteccion guarda lo aprendido y no avisa', () => {
    const r = conRandom(0.99, () => handleEspionageMission(misionIA(), {
      planets: [jugador()],
      aiPlanets: [faccion()],
      research: {},
      ministries: {},
    }));
    expect(r.state.aiIntel['p-home']).toBeDefined();
    expect(r.state.aiIntel['p-home'].level).toBeDefined();
    expect(r.state.notifications || []).toHaveLength(0);
    expect(r.returnFleet).toEqual({ espionageProbe: 1 });
  });

  it('con deteccion destruye la sonda y avisa', () => {
    const r = conRandom(0.001, () => handleEspionageMission(misionIA(), {
      planets: [jugador()],
      aiPlanets: [faccion()],
      research: {},
      ministries: {},
    }));
    expect(r.returnFleet).toEqual({});
    expect(r.state.notifications).toHaveLength(1);
    expect(r.tacticalEvent.type).toBe('espionage_alert');
    expect(r.state.aiIntel).toBeUndefined();
  });

  it('una patrulla activa intercepta la sonda', () => {
    const sinPatrulla = conRandom(0.30, () => handleEspionageMission(misionIA(), {
      planets: [jugador()], aiPlanets: [faccion()], research: {}, ministries: {},
    }));
    const conPatrulla = conRandom(0.30, () => handleEspionageMission(misionIA(), {
      planets: [jugador()],
      aiPlanets: [faccion()],
      research: {},
      ministries: {},
      patrols: [{ id: 'pat-1', planetId: 'p-home', status: 'active', patrolType: 'orbital', fleet: { lightFighter: 2 } }],
    }));
    expect(PATROL_INTERCEPT_BONUS).toBeGreaterThan(0);
    expect(conPatrulla.state.aiIntel).toBeUndefined();
    expect(sinPatrulla.state.aiIntel).toBeDefined();
  });

  it('mas contraespionaje del jugador significa menos espionaje fructifero', () => {
    const base = { planets: [jugador()], aiPlanets: [faccion()], research: {}, ministries: {} };
    // Se fuerza la misma tirada y solo cambia la defensa.
    const r1 = conRandom(0.30, () => handleEspionageMission(misionIA(), base));
    const r2 = conRandom(0.30, () => handleEspionageMission(misionIA(), {
      ...base,
      research: { quantumCrypto: 10, stealthSilos: 10 },
      ministries: { intel: { upgrades: { hawk_eye: 10 }, counterIntelLevel: 10, espionageBudget: 0.5 } },
    }));
    expect(r1.state.aiIntel).toBeDefined();
    expect(r2.state.aiIntel).toBeUndefined();
  });

  it('una IA sin tecnologia de espionaje no espia', () => {
    const s = processAiEspionageTick({
      gameTick: 90,
      planets: [jugador()],
      aiPlanets: [faccion({ research: { espionage: AI_ESPIONAGE_MIN_TECH - 1 }, fleet: { espionageProbe: 3 } })],
      fleetMissions: [],
    });
    expect(s.fleetMissions).toHaveLength(0);
  });

  it('una IA con tecnologia y sondas lanza una operacion', () => {
    const s = processAiEspionageTick({
      gameTick: 90,
      planets: [jugador()],
      aiPlanets: [faccion()],
      fleetMissions: [],
    });
    expect(s.fleetMissions).toHaveLength(1);
    expect(s.fleetMissions[0].type).toBe('espionage');
    expect(s.fleetMissions[0].isAI).toBe(true);
    expect(s.fleetMissions[0].phase).toBe(ESPIONAGE_PHASES.EN_VUELO);
    expect(s.fleetMissions[0].to.planetId).toBe('p-home');
  });

  it('la sonda sale del almacen de la IA', () => {
    const s = processAiEspionageTick({
      gameTick: 90,
      planets: [jugador()],
      aiPlanets: [faccion({ fleet: { espionageProbe: 2 } })],
      fleetMissions: [],
    });
    expect(countProbes(s.aiPlanets[0].fleet)).toBe(1);
  });

  it('no lanza fuera de su ventana de evaluacion', () => {
    const s = processAiEspionageTick({
      gameTick: 45,
      planets: [jugador()],
      aiPlanets: [faccion()],
      fleetMissions: [],
    });
    expect(s.fleetMissions).toHaveLength(0);
    expect(s.aiPlanets[0].fleet.espionageProbe).toBe(4);
  });

  it('no duplica espia sobre un mundo que ya tiene una sonda en vuelo', () => {
    const yaEnVuelo = {
      id: 'm-previa', type: 'espionage', isAI: true,
      from: { id: 'ai-1' },
      to: { galaxy: 1, system: 1, position: 1, planetId: 'p-home' },
    };
    const s = processAiEspionageTick({
      gameTick: 90,
      planets: [jugador()],
      aiPlanets: [faccion()],
      fleetMissions: [yaEnVuelo],
    });
    expect(s.fleetMissions).toHaveLength(1);
  });

  it('sin mundos del jugador ni de la IA no hace nada', () => {
    expect(processAiEspionageTick({ gameTick: 90, planets: [], aiPlanets: [faccion()], fleetMissions: [] }).fleetMissions).toHaveLength(0);
    expect(processAiEspionageTick({ gameTick: 90, planets: [jugador()], aiPlanets: [], fleetMissions: [] }).fleetMissions).toHaveLength(0);
  });
});

describe('coste operativo del espionaje', () => {
  it('no es gratis: escala con las sondas y la tecnologia', () => {
    const uno = getEspionageMissionCost(1, 0);
    const cinco = getEspionageMissionCost(5, 0);
    expect(cinco.deuterium).toBeGreaterThan(uno.deuterium);
    expect(getEspionageMissionCost(1, 10).deuterium).toBeGreaterThan(uno.deuterium);
    expect(uno.deuterium).toBeGreaterThan(0);
    expect(uno.crystal).toBeGreaterThan(0);
  });

  it('no cobra metal ni valores negativos', () => {
    const coste = getEspionageMissionCost(0, 0);
    expect(coste.metal).toBe(0);
    expect(getEspionageMissionCost(-3, -5).deuterium).toBe(0);
  });
});
