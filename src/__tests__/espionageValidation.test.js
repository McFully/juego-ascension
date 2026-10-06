import { describe, it, expect } from 'vitest';
import { handleSendFleet } from '../reducers/fleet/fleetMissionActions.js';
import { getEspionageMissionCost, ESPIONAGE_PHASES } from '../utils/espionageFormulas.js';

/**
 * REGLAS DE LANZAMIENTO DE ESPIONAJE.
 *
 * El reducer es la última linea de defensa. Antes solo la interfaz filtraba estas
 * reglas, de modo que un despach desde la consola, un atajo o un doble clic
 * repartido se saltaba todo:
 *   - espionaje sin sondas: se perdian naves en silencio al detectar;
 *   - sondas en misiones de asalto: una sonda no es un caza.
 */

const ORIGEN = {
  id: 'p-home',
  name: 'Tierra',
  galaxy: 1, system: 1, position: 1,
  faction: 'human',
  fleet: { espionageProbe: 6, lightFighter: 10, smallCargo: 4 },
  resources: { metal: 1_000_000, crystal: 500_000, deuterium: 500_000 },
};

function estado(over = {}) {
  return {
    planets: [ORIGEN],
    aiPlanets: [{ id: 'ai-1', galaxy: 1, system: 1, position: 4 }],
    research: { combustion: 4, espionage: 4, hyperspace: 4, impulse: 4 },
    blueprints: [],
    notifications: [],
    fleetMissions: [],
    gameTick: 10,
    relics: [],
    ...over,
  };
}

const lanzar = (state, action) => handleSendFleet(state, {
  fromId: 'p-home',
  to: { galaxy: 1, system: 1, position: 4 },
  missionSpeed: 10,
  formation: 'standard',
  autoRetreat: false,
  ...action,
});

const ultimoAviso = (r) => (r.notifications?.[r.notifications.length - 1]?.message) || '';

describe('espionaje sin sondas no se lanza', () => {
  it('una flota de cazas sola es rechazada', () => {
    const r = lanzar(estado(), { fleet: { lightFighter: 2 }, missionType: 'espionage' });
    expect(r.fleetMissions).toHaveLength(0);
    expect(ultimoAviso(r)).toContain('no llevas ninguna sonda');
  });

  it('una flota vacia es rechazada sin romperse', () => {
    const r = lanzar(estado(), { fleet: {}, missionType: 'espionage' });
    expect(r.fleetMissions).toHaveLength(0);
  });

  it('la regla no toca el resto de misiones', () => {
    const r = lanzar(estado(), { fleet: { lightFighter: 2 }, missionType: 'attack' });
    expect(r.fleetMissions).toHaveLength(1);
  });
});

describe('las sondas no viajan en otras misiones', () => {
  it.each(['attack', 'transport', 'expedition', 'recycle'])(
    'una sonda en %s se rechaza',
    (missionType) => {
      const r = lanzar(estado(), { fleet: { espionageProbe: 1, lightFighter: 1 }, missionType });
      expect(r.fleetMissions).toHaveLength(0);
      expect(ultimoAviso(r)).toContain('no viajan');
    }
  );

  it('las sondas siguen yendo en espionaje', () => {
    const r = lanzar(estado(), { fleet: { espionageProbe: 3 }, missionType: 'espionage' });
    expect(r.fleetMissions).toHaveLength(1);
  });
});

describe('la sonda sale del almacen y la mission queda identificada', () => {
  it('descuenta las sondas del planeta', () => {
    const r = lanzar(estado(), { fleet: { espionageProbe: 3 }, missionType: 'espionage' });
    expect(r.planets[0].fleet.espionageProbe).toBe(3);
  });

  it('no se puede lanzar mas sondas de las que hay', () => {
    const r = lanzar(estado(), { fleet: { espionageProbe: 99 }, missionType: 'espionage' });
    expect(r.fleetMissions).toHaveLength(0);
    expect(r.planets[0].fleet.espionageProbe).toBe(6);
  });

  it('la mission guarda cuantas sondas y en que fase va', () => {
    const r = lanzar(estado(), { fleet: { espionageProbe: 2 }, missionType: 'espionage' });
    expect(r.fleetMissions[0]).toMatchObject({
      type: 'espionage',
      probes: 2,
      phase: ESPIONAGE_PHASES.EN_VUELO,
      isAI: false,
    });
  });

  it('las misiones que no son de espionaje no llevan campos de espionaje', () => {
    const r = lanzar(estado(), { fleet: { lightFighter: 1 }, missionType: 'attack' });
    expect(r.fleetMissions[0].probes).toBeUndefined();
    expect(r.fleetMissions[0].phase).toBeUndefined();
  });
});

describe('el coste operativo se descuenta y se avisa si falta', () => {
  it('descuenta el coste de espionaje ademas del combustible', () => {
    const antes = estado();
    const r = lanzar(antes, { fleet: { espionageProbe: 3 }, missionType: 'espionage' });
    const esperado = getEspionageMissionCost(3, 4);
    expect(r.planets[0].resources.deuterium).toBeLessThan(ORIGEN.resources.deuterium);
    expect(r.planets[0].resources.deuterium).toBeLessThan(
      ORIGEN.resources.deuterium - esperado.deuterium
    );
    expect(r.planets[0].resources.crystal).toBe(ORIGEN.resources.crystal - esperado.crystal);
  });

  it('sin deuterio no se lanza', () => {
    const pobre = estado({
      planets: [{ ...ORIGEN, resources: { metal: 1000, crystal: 1000, deuterium: 0 } }],
    });
    const r = lanzar(pobre, { fleet: { espionageProbe: 1 }, missionType: 'espionage' });
    expect(r.fleetMissions).toHaveLength(0);
    expect(ultimoAviso(r)).toContain('Deuterio insuficiente');
  });

  it('sin cristal no se lanza', () => {
    const pobre = estado({
      planets: [{ ...ORIGEN, resources: { metal: 1000, crystal: 0, deuterium: 500000 } }],
    });
    const r = lanzar(pobre, { fleet: { espionageProbe: 1 }, missionType: 'espionage' });
    expect(r.fleetMissions).toHaveLength(0);
    expect(ultimoAviso(r)).toContain('Cristal insuficiente');
  });

  it('la mission lleva el coste cobrado para poder mostrarlo', () => {
    const r = lanzar(estado(), { fleet: { espionageProbe: 2 }, missionType: 'espionage' });
    expect(r.fleetMissions[0].espionageCost).toEqual(getEspionageMissionCost(2, 4));
  });

  it('un ataque normal no paga el coste de espionaje', () => {
    const r = lanzar(estado(), { fleet: { lightFighter: 1 }, missionType: 'attack' });
    expect(r.planets[0].resources.crystal).toBe(ORIGEN.resources.crystal);
  });
});

describe('doble clic no duplica nada', () => {
  it('no se puede enviar mas sondas de las que quedan', () => {
    // 6 sondas en base. Se envian 4, luego 2. Pedir 4 en el segundo intento
    // cuando solo quedan 2 debe rechazarse entero, no dejar un estado a medias.
    const uno = lanzar(estado(), { fleet: { espionageProbe: 4 }, missionType: 'espionage' });
    const sobra = lanzar(uno, { fleet: { espionageProbe: 4 }, missionType: 'espionage' });
    expect(sobra.fleetMissions).toHaveLength(1);
    expect(sobra.planets[0].fleet.espionageProbe).toBe(2);
  });

  it('dos lanzamientos válidos consumen sondas distintas', () => {
    const uno = lanzar(estado(), { fleet: { espionageProbe: 4 }, missionType: 'espionage' });
    const dos = lanzar(uno, { fleet: { espionageProbe: 2 }, missionType: 'espionage' });
    expect(dos.fleetMissions).toHaveLength(2);
    expect(dos.fleetMissions[0].id).not.toBe(dos.fleetMissions[1].id);
    expect(dos.planets[0].fleet.espionageProbe).toBeUndefined();
  });

  it('un tercer lanzamiento ya no tiene sondas y no cambia nada', () => {
    const uno = lanzar(estado(), { fleet: { espionageProbe: 4 }, missionType: 'espionage' });
    const dos = lanzar(uno, { fleet: { espionageProbe: 2 }, missionType: 'espionage' });
    // Ya no queda ninguna sonda en base. La peticion se rechaza entera: el
    // estado debe quedar exactamente como estaba, sin media mision.
    const tres = lanzar(dos, { fleet: { espionageProbe: 1 }, missionType: 'espionage' });
    expect(tres.fleetMissions).toHaveLength(2);
    expect(tres.planets[0].fleet).toEqual(dos.planets[0].fleet);
    expect(tres.planets[0].resources).toEqual(dos.planets[0].resources);
  });

  it('pedir sondas sin tenerlas da un aviso claro', () => {
    const r = lanzar(estado(), {
      fleet: { espionageProbe: 1, lightFighter: 1 },
      missionType: 'attack',
    });
    // Aqui el rechazo correcto es "las sondas no viajan en un asalto".
    expect(r.fleetMissions).toHaveLength(0);
    expect(ultimoAviso(r)).toContain('no viajan');
  });
});
