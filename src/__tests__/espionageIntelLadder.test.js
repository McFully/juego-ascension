import { describe, it, expect } from 'vitest';
import { handleEspionageMission } from '../missions/diploMission.js';
import { INTEL_SHIP_IDS } from '../data/game/shipsData.js';
import { getEffectiveTech } from '../utils/formulas/combatFormulas.js';

/**
 * ESCALERA DE INTELIGENCIA DE ESPIONAJE.
 *
 * Antes, `handleEspionageMission` leia el nivel de espionaje de
 * `mission.from.research`, que en una partida real esta vacio: la investigacion
 * vive en `state.research`. El resultado era `spyTech = 0` siempre, y de los
 * cinco niveles solo eran alcanzables `blocked` y `low`. `medium`, `high` y
 * `full` eran codigo muerto, con ellos el bonus de combate de
 * `combatMission` y casi todo lo que el jugador paga.
 *
 * El test que existia (`tacticalEvents.test.js`) tapaba el fallo inyectando
 * `research: { espionage: 10 }` en el planeta a mano: exactamente el estado que
 * el juego nunca produce.
 */

const MISSION = {
  id: 'm1',
  type: 'espionage',
  from: { id: 'p-home', name: 'Tierra', galaxy: 1, system: 1, position: 1 },
  to: { galaxy: 2, system: 2, position: 2 },
  fleet: { espionageProbe: 3 },
  departure: 0,
  arrivalTime: 0,
  returnTime: 0,
  isAI: false,
};

function objetivo(espDefenseLvl) {
  return {
    id: 'ai-1',
    name: 'Naxos',
    galaxy: 2, system: 2, position: 2,
    isAI: true,
    aiLevel: 10,
    espDefenseLvl,
    resources: { metal: 50000, crystal: 40000, deuterium: 30000 },
    buildings: { metalMine: 10, crystalMine: 9 },
    fleet: { lightFighter: 40, cruiser: 8 },
    defenses: { rocketLauncher: 30, lightLaser: 20 },
    research: { weapons: 6, shields: 5 },
    relation: 0,
  };
}

/** Espionaje sin deteccion: se fija Math.random para que el resultado sea estable. */
function espiar(state, espDefenseLvl) {
  const original = Math.random;
  Math.random = () => 0.99;
  try {
    return handleEspionageMission(MISSION, {
      ...state,
      gameTick: 1000,
      aiPlanets: [objetivo(espDefenseLvl)],
    });
  } finally {
    Math.random = original;
  }
}

function stateCon(spyTech) {
  return {
    planets: [MISSION.from],
    aiPlanets: [],
    research: { espionage: spyTech },
  };
}

describe('escalera de inteligencia de espionaje', () => {
  it('la sonda de espionaje es una nave de inteligencia', () => {
    expect(INTEL_SHIP_IDS.has('espionageProbe')).toBe(true);
  });

  it('el nivel de espionaje sale de la investigacion global, no del planeta', () => {
    // El planeta origen NO lleva `research`. Si se leyera de ahi seria 0.
    expect(MISSION.from.research).toBeUndefined();
    expect(getEffectiveTech(MISSION.from, { espionage: 9 })?.espionage).toBe(9);
  });

  it('sin tecnologia solo se alcanzan los niveles bajos', () => {
    const state = stateCon(0);
    const r = espiar(state, 2);
    const report = r.state.spyReports[r.state.spyReports.length - 1];
    expect(['blocked', 'low']).toContain(report.intelLevel);
    expect(['medium', 'high', 'full']).not.toContain(report.intelLevel);
  });

  it('con tecnologia suficiente se alcanza el nivel medio', () => {
    // espDefenseLvl 2 + espionage 4 = techDiff 2, dentro del tramo 'medium'.
    const report = espiar(stateCon(4), 2).state.spyReports.slice(-1)[0];
    expect(report.intelLevel).toBe('medium');
    // Con ruido, pero debe ser un numero real y no texto enmascarado.
    expect(typeof report.resources.metal).toBe('number');
    expect(report.resources.metal).toBeGreaterThanOrEqual(Math.floor(50000 * 0.7));
    expect(report.resources.metal).toBeLessThanOrEqual(50000);
  });

  it('con mucha tecnologia se alcanza el nivel alto y revela exacto', () => {
    // techDiff 5, dentro del tramo 'high'.
    const report = espiar(stateCon(7), 2).state.spyReports.slice(-1)[0];
    expect(report.intelLevel).toBe('high');
    expect(report.resources.metal).toBe(50000);
    expect(report.buildings).toEqual({ metalMine: 10, crystalMine: 9 });
    expect(report.fleet.lightFighter).toBe(40);
    expect(report.extendedInfo.researchSnapshot).toEqual({ weapons: 6, shields: 5 });
  });

  it('con tecnologia por encima del techo se alcanza el nivel completo', () => {
    const report = espiar(stateCon(9), 2).state.spyReports.slice(-1)[0];
    expect(report.intelLevel).toBe('full');
    expect(report.extendedInfo.researchSnapshot).toEqual({ weapons: 6, shields: 5 });
    expect(report.extendedInfo).toHaveProperty('behaviorPrediction');
    expect(report.extendedInfo).toHaveProperty('expansionPattern');
  });

  it('el nivel sube al investigar: cada escalon compra un nivel mas', () => {
    const niveles = [0, 4, 7, 9].map(spyTech => {
      const r = espiar(stateCon(spyTech), 2);
      return r.state.spyReports[r.state.spyReports.length - 1].intelLevel;
    });
    expect(niveles).toEqual(['low', 'medium', 'high', 'full']);
  });

  it('una defensa fuerte mantiene el nivel bajo', () => {
    const report = espiar(stateCon(3), 14).state.spyReports.slice(-1)[0];
    expect(report.intelLevel).toBe('blocked');
  });

  it('el informe guarda el objetivo para poder consultarlo despues', () => {
    const report = espiar(stateCon(9), 2).state.spyReports.slice(-1)[0];
    expect(report.targetId).toBe('ai-1');
    expect(report.targetName).toBe('Naxos');
    expect(report.coords).toEqual({ galaxy: 2, system: 2, position: 2 });
    expect(report.timestamp).toBeGreaterThan(0);
  });

  it('el historico esta acotado a 50 informes', () => {
    let state = { ...stateCon(9), aiPlanets: [objetivo(2)], spyReports: [] };
    for (let i = 0; i < 60; i++) {
      const r = handleEspionageMission({ ...MISSION, id: `m${i}` }, state);
      state = r.state;
    }
    expect(state.spyReports).toHaveLength(50);
  });

  it('la sonda vuelve si la operacion tiene exito', () => {
    const r = espiar(stateCon(9), 2);
    expect(r.returnFleet).toEqual({ espionageProbe: 3 });
  });
});
