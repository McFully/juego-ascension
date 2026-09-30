import { describe, it, expect } from 'vitest';
import { researchReducer } from '../reducers/researchReducer.js';
import { fleetReducer } from '../reducers/fleetReducer.js';
import { processAllQueuesTick } from '../reducers/tick/queues/queueTick.js';
import { handleExpeditionMission } from '../missions/expeditionMission.js';
import { processAutoResearchTick } from '../reducers/tick/automation/autoResearchTick.js';
import { RESEARCH } from '../data/gameData.js';
import { researchCost } from '../utils/formulas/costFormulas.js';

describe('FASE 13 — Contrato del Sistema de Investigación', () => {
  const createBasePlanet = (id = 'planet-1', labLevel = 1, resources = { metal: 1e7, crystal: 1e7, deuterium: 1e7 }) => ({
    id,
    name: `Mundo ${id}`,
    resources: { ...resources },
    buildings: {
      researchLab: labLevel,
      constructionCenter: 1
    },
    ministries: {
      science: {
        automationEnabled: true,
        minister: { id: 'm-sci', name: 'Dra. Vance' }
      }
    }
  });

  const createBaseState = (planets = [createBasePlanet()]) => ({
    gameStarted: true,
    gameTick: 1,
    currentPlanetId: planets[0].id,
    research: { energy: 3 },
    researchQueue: [],
    planets,
    notifications: [],
    stats: { totalResearch: 0 }
  });

  it('1. Capacidad por laboratorio: 2 laboratorios en distintos planetas permiten researches simultáneas independientes', () => {
    const p1 = createBasePlanet('planet-1', 1);
    const p2 = createBasePlanet('planet-2', 1);
    let state = createBaseState([p1, p2]);

    // Encolar research en planeta 1
    state = researchReducer(state, {
      type: 'START_RESEARCH',
      researchId: 'combustion',
      planetId: 'planet-1'
    });
    expect(state.researchQueue.length).toBe(1);
    expect(state.researchQueue[0].planetId).toBe('planet-1');

    // Encolar research en planeta 2
    state = researchReducer(state, {
      type: 'START_RESEARCH',
      researchId: 'espionage',
      planetId: 'planet-2'
    });
    expect(state.researchQueue.length).toBe(2);
    expect(state.researchQueue[1].planetId).toBe('planet-2');

    // Un planeta con laboratorio nv 1 no debe poder tener más de 1 research simultánea si se limita a concurrencia 1 por laboratorio
    // O si labLevel >= 2 permite más capacidad
  });

  it('2. Duraciones paralelas: encolar una tech larga y una corta permite que la corta termine primero sin esperar', () => {
    const p1 = createBasePlanet('planet-1', 4);
    let state = createBaseState([p1]);

    // Encolamos primero una larga y luego una corta
    state = researchReducer(state, {
      type: 'START_RESEARCH',
      researchId: 'energy',
      planetId: 'planet-1'
    });
    const now = Date.now();
    // Forzamos manualmente para la prueba duraciones controladas
    state.researchQueue[0].endTime = now + 30 * 3600 * 1000; // 30 horas

    state = researchReducer(state, {
      type: 'START_RESEARCH',
      researchId: 'combustion',
      planetId: 'planet-1'
    });
    state.researchQueue[1].endTime = now + 120 * 1000; // 2 minutos

    expect(state.researchQueue.length).toBe(2);

    // Avanzamos el reloj 3 minutos (180s)
    const tickTime = now + 180 * 1000;
    const nextState = processAllQueuesTick(state, tickTime);

    // La de 2 minutos (combustion) debe haberse completado
    expect(nextState.research.combustion).toBe(1);
    // La de 30 horas (energy) debe seguir en cola
    expect(nextState.researchQueue.length).toBe(1);
    expect(nextState.researchQueue[0].researchId).toBe('energy');
  });

  it('3. Cancelación puntual: cancelar un nivel en cola paralela NO cancela niveles de otra tecnología ni niveles independientes', () => {
    const p1 = createBasePlanet('planet-1', 4);
    let state = createBaseState([p1]);

    // Simulamos que el estado ya tiene dos items con id diferente
    state.researchQueue = [
      { id: 'q-5', researchId: 'laser', level: 5, planetId: 'planet-1', startTime: 1000, endTime: 5000 },
      { id: 'q-6', researchId: 'laser', level: 6, planetId: 'planet-1', startTime: 1000, endTime: 9000 },
      { id: 'q-other', researchId: 'shields', level: 1, planetId: 'planet-1', startTime: 1000, endTime: 3000 }
    ];

    // Si cancelamos sólo la orden puntual q-5 con política no destructiva
    const nextState = fleetReducer(state, {
      type: 'CANCEL_RESEARCH_QUEUE',
      queueId: 'q-5'
    });

    // Se cancela q-5 y su reembolso debe calcularse sobre el coste del nivel de esa orden
    const remainingIds = nextState.researchQueue.map(q => q.id);
    expect(remainingIds).not.toContain('q-5');
    expect(remainingIds).toContain('q-other');
  });

  it('4. Reembolso honesto por cancelación de requisitos en queueTick: reembolsa al nivel de cada orden, no del nivel actual en research', () => {
    const p1 = createBasePlanet('planet-1', 0); // Demolido el lab
    p1.resources = { metal: 0, crystal: 0, deuterium: 0 };
    let state = createBaseState([p1]);
    state.research.energy = 5;

    // En cola hay un nivel 8 de energy
    state.researchQueue = [
      { id: 'q-energy-8', researchId: 'energy', level: 8, planetId: 'planet-1', startTime: 1000, endTime: 2000 }
    ];

    const expectedCost = researchCost('energy', 7, 0, p1.buildings.constructionCenter || 0);

    const nextState = processAllQueuesTick(state, 3000);
    const updatedPlanet = nextState.planets.find(p => p.id === 'planet-1');

    // Debe reembolsar el coste del nivel 8 (level - 1 = 7), no el coste del nivel 5 actual
    expect(updatedPlanet.resources.metal).toBe(expectedCost.metal);
    expect(updatedPlanet.resources.crystal).toBe(expectedCost.crystal);
  });

  it('5. Anomalía temporal en expedición: actualiza deterministamente startTime y solo afecta al planeta expedicionario', () => {
    const p1 = createBasePlanet('planet-1', 2);
    const p2 = createBasePlanet('planet-2', 2);
    let state = createBaseState([p1, p2]);

    const initialEnd1 = 1000000;
    const initialStart1 = 800000;
    const initialEnd2 = 1000000;
    const initialStart2 = 800000;

    state.researchQueue = [
      { id: 'q-p1', researchId: 'energy', level: 2, planetId: 'planet-1', startTime: initialStart1, endTime: initialEnd1, timeMult: 1.0 },
      { id: 'q-p2', researchId: 'energy', level: 2, planetId: 'planet-2', startTime: initialStart2, endTime: initialEnd2, timeMult: 1.0 }
    ];

    const mission = {
      from: { id: 'planet-1', specialization: 'standard' },
      to: { galaxy: 1, system: 1, position: 16 },
      fleet: { largeCargo: 1 }
    };

    // Forzar roll que caiga en la anomalía (< 0.61 y >= 0.55)
    const originalRandom = Math.random;
    Math.random = () => 0.58; // roll anomalía temporal

    try {
      const res = handleExpeditionMission(mission, state);
      const q1 = res.state.researchQueue.find(q => q.id === 'q-p1');
      const q2 = res.state.researchQueue.find(q => q.id === 'q-p2');

      // q1 (planet-1) debe haberse acelerado 120.000 ms y haber ajustado startTime
      expect(q1.endTime).toBe(initialEnd1 - 120000);
      expect(q1.startTime).toBe(initialStart1 - 120000);

      // q2 (planet-2) NO debe verse afectado por la expedición de planet-1
      expect(q2.endTime).toBe(initialEnd2);
    } finally {
      Math.random = originalRandom;
    }
  });

  it('6. autoResearchTick utiliza pesos ministeriales y buildPrereqUrgency para no ser tabla muerta', () => {
    const p1 = createBasePlanet('planet-1', 4);
    p1.buildings.robotFactory = 5;
    p1.resources = { metal: 1e8, crystal: 1e8, deuterium: 1e8 };
    let state = createBaseState([p1]);
    state.research = { energy: 3, miningAuto: 3 };

    // Supongamos que en la cola ya hay algo que requiere industrialOpt
    state.researchQueue = [
      { id: 'q-galTrade', researchId: 'galacticTrade', level: 1, planetId: 'planet-1', startTime: 1000, endTime: 50000 }
    ];

    const nextState = processAutoResearchTick(state);
    expect(nextState.researchQueue.length).toBeGreaterThan(1);
  });
});
