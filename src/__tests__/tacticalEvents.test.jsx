import { describe, it, expect } from 'vitest';
import { handleColonizeMission, handleTransportMission, handleRecycleMission, handleEspionageMission } from '../missions/diploMission.js';
import { handleCombatMission } from '../missions/combatMission.js';
import { handleExpeditionMission } from '../missions/expeditionMission.js';
import { processTick } from '../reducers/tick/tickOrchestrator.js';
import { eventReducer } from '../reducers/eventReducer.js';

describe('Tactical Events Overlay System', () => {
  it('genera un tacticalEvent detallado al colonizar un nuevo planeta con éxito', () => {
    const initialState = {
      planets: [
        { id: 'home', name: 'Capital', galaxy: 1, system: 1, position: 1, resources: { metal: 1000, crystal: 1000, deuterium: 500 } }
      ],
      aiPlanets: [],
      research: { astrophysics: 5 },
      stats: { coloniesFounded: 0 }
    };

    const colonizeMission = {
      from: { id: 'home', name: 'Capital' },
      to: { galaxy: 1, system: 2, position: 4 },
      fleet: { colonizer: 1, smallCargo: 2 }
    };

    const res = handleColonizeMission(colonizeMission, initialState);
    expect(res.type).toBe('success');
    expect(res.tacticalEvent).toBeDefined();
    expect(res.tacticalEvent.type).toBe('colonize');
    expect(res.tacticalEvent.title).toBe('¡Nueva Colonia Fundada!');
    expect(res.tacticalEvent.planetDetails).toBeDefined();
    expect(res.tacticalEvent.planetDetails.biome).toBeDefined();
    expect(res.tacticalEvent.ministryId).toBe('civics');
    expect(res.state.planets.length).toBe(2);
  });

  it('genera un tacticalEvent con manifiesto de recursos y cartera de transporte al completar un transporte', () => {
    const initialState = {
      planets: [
        { id: 'p1', name: 'Mundo Uno', galaxy: 1, system: 1, position: 1, resources: { metal: 100, crystal: 50, deuterium: 20 } },
        { id: 'p2', name: 'Colonia Minera', galaxy: 1, system: 1, position: 2, resources: { metal: 500, crystal: 200, deuterium: 100 } }
      ]
    };

    const transportMission = {
      from: { id: 'p1', name: 'Mundo Uno' },
      to: { galaxy: 1, system: 1, position: 2 },
      resources: { metal: 25000, crystal: 12000, deuterium: 5000 },
      fleet: { largeCargo: 5 }
    };

    const res = handleTransportMission(transportMission, initialState);
    expect(res.type).toBe('success');
    expect(res.tacticalEvent).toBeDefined();
    expect(res.tacticalEvent.type).toBe('transport');
    expect(res.tacticalEvent.ministryId).toBe('transport');
    expect(res.tacticalEvent.resources.metal).toBe(25000);
    expect(res.tacticalEvent.resources.crystal).toBe(12000);
    expect(res.tacticalEvent.resources.deuterium).toBe(5000);
    expect(res.tacticalEvent.targetPlanetId).toBe('p2');
  });

  it('genera un tacticalEvent detallado en un asalto de combate con bajas y resultado', () => {
    const initialState = {
      playerName: 'Comandante',
      planets: [
        { id: 'p1', name: 'Base Militar', galaxy: 1, system: 1, position: 1, resources: { metal: 10000, crystal: 5000, deuterium: 2000 }, fleet: {} }
      ],
      aiPlanets: [
        { id: 'ai-1', name: 'Colonia Kaelish', galaxy: 1, system: 1, position: 2, resources: { metal: 100000, crystal: 50000, deuterium: 20000 }, fleet: { lightFighter: 5 }, defenses: {} }
      ],
      research: { weapons: 5, shields: 5, armour: 5 },
      stats: { combatsWon: 0, combatsLost: 0, combatsDraw: 0 }
    };

    const attackMission = {
      isAI: false,
      from: { id: 'p1', name: 'Base Militar', research: { weapons: 5, shields: 5, armour: 5 } },
      to: { galaxy: 1, system: 1, position: 2 },
      fleet: { battleship: 20, cruiser: 10 }
    };

    const res = handleCombatMission(attackMission, initialState);
    expect(res.tacticalEvent).toBeDefined();
    expect(res.tacticalEvent.type).toBe('combat');
    expect(res.tacticalEvent.image).toBeDefined();
    expect(res.tacticalEvent.losses).toBeDefined();
    expect(res.tacticalEvent.ministryId).toBe('defense');
  });

  it('genera un tacticalEvent de espionaje al escanear un planeta objetivo', () => {
    const initialState = {
      playerName: 'Comandante',
      planets: [
        { id: 'p1', name: 'Base', galaxy: 1, system: 1, position: 1, research: { espionage: 10 } }
      ],
      aiPlanets: [
        { id: 'ai-1', name: 'Mundo Espiado', galaxy: 1, system: 1, position: 3, resources: { metal: 5000, crystal: 3000, deuterium: 1000 }, espDefenseLvl: 0 }
      ],
      spyReports: []
    };

    const spyMission = {
      from: { id: 'p1', name: 'Base', research: { espionage: 10 } },
      to: { galaxy: 1, system: 1, position: 3 },
      fleet: { espionageProbe: 3 }
    };

    const res = handleEspionageMission(spyMission, initialState);
    expect(res.tacticalEvent).toBeDefined();
    expect(res.tacticalEvent.type).toBe('espionage');
    expect(res.tacticalEvent.image).toBe('Centro de Espionaje.webp');
  });

  it('genera un tacticalEvent de retorno cuando los cargueros regresan al planeta de origen', () => {
    const pastTime = Date.now() - 1000;
    const stateWithReturningFleet = {
      gameTick: 10,
      lastTick: pastTime - 1000,
      currentPlanetId: 'p1',
      planets: [
        { 
          id: 'p1', 
          name: 'Mundo Origen', 
          galaxy: 1, 
          system: 1, 
          position: 1, 
          resources: { metal: 1000, crystal: 1000, deuterium: 500 },
          buildings: {},
          fleet: { smallCargo: 0 } 
        }
      ],
      aiPlanets: [],
      fleetMissions: [
        {
          id: 'miss-return-1',
          type: 'transport',
          isAI: false,
          returning: true,
          returnTime: pastTime,
          from: { id: 'p1', name: 'Mundo Origen' },
          to: { galaxy: 1, system: 1, position: 2 },
          fleet: { smallCargo: 10 }
        }
      ],
      tacticalEvents: [],
      buildQueue: [],
      researchQueue: [],
      shipQueue: [],
      defenseQueue: [],
      retrofitQueue: [],
      customShipQueue: [],
      research: {},
      stats: { playTime: 10, metalGathered: 0, crystalGathered: 0, deuteriumGathered: 0 }
    };

    const nextState = processTick(stateWithReturningFleet);
    expect(nextState.tacticalEvents.length).toBeGreaterThan(0);
    const retEvent = nextState.tacticalEvents.find(e => e.type === 'transport_return');
    expect(retEvent).toBeDefined();
    expect(retEvent.title).toBe('Retorno Logístico Completado');
    expect(retEvent.returnedFleet.smallCargo).toBe(10);
  });

  it('permite descartar eventos tácticos individualmente o todos a la vez vía eventReducer', () => {
    const stateWithEvents = {
      tacticalEvents: [
        { id: 'evt-1', title: 'Evento 1', type: 'colonize' },
        { id: 'evt-2', title: 'Evento 2', type: 'transport' }
      ]
    };

    const stateAfterSingleDismiss = eventReducer(stateWithEvents, {
      type: 'DISMISS_TACTICAL_EVENT',
      payload: 'evt-1'
    });
    expect(stateAfterSingleDismiss.tacticalEvents.length).toBe(1);
    expect(stateAfterSingleDismiss.tacticalEvents[0].id).toBe('evt-2');

    const stateAfterDismissAll = eventReducer(stateWithEvents, {
      type: 'DISMISS_ALL_TACTICAL_EVENTS'
    });
    expect(stateAfterDismissAll.tacticalEvents.length).toBe(0);
  });
});
