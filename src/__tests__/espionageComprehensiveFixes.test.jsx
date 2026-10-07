import React from 'react';
import { describe, it, expect } from 'vitest';
import { EspionageBriefPanel } from '../components/fleet/EspionageBriefPanel.jsx';
import { handleEspionageMission } from '../missions/diploMission.js';
import { handleCombatMission } from '../missions/combatMission.js';

describe('Espionage E2E and Component Real Verification', () => {
  const dummyState = {
    gameTick: 10,
    currentPlanetId: 'p1',
    planets: [
      {
        id: 'p1',
        name: 'Terra',
        galaxy: 1,
        system: 1,
        position: 1,
        faction: 'human',
        resources: { metal: 50000, crystal: 50000, deuterium: 50000 },
        fleet: { espionageProbe: 5, lightFighter: 10 },
        ministryUpgrades: { intel: { hawk_eye: 2, sleeper_net: 1, quantum_scrambler: 1 } },
        buildings: { spyCenter: 2 },
      }
    ],
    aiPlanets: [
      {
        id: 'ai-1',
        name: 'Nexus Alpha',
        galaxy: 1,
        system: 2,
        position: 3,
        faction: 'cyber',
        aiLevel: 2,
        resources: { metal: 100000, crystal: 80000, deuterium: 30000 },
        fleet: { lightFighter: 5 },
        defenses: { rocketLauncher: 2 },
        buildings: { earlyWarningSat: 1 },
        research: { espionage: 2 }
      },
      {
        id: 'ai-2',
        name: 'Nexus Beta',
        galaxy: 2,
        system: 4,
        position: 5,
        faction: 'cyber',
        aiLevel: 3,
        resources: { metal: 200000, crystal: 150000, deuterium: 60000 },
        fleet: { lightFighter: 15 },
        defenses: { lightLaser: 5 },
        research: { espionage: 4 }
      }
    ],
    research: { espionage: 3, galacticCrypto: 2 },
    spyReports: [],
    planetIntel: {},
    patrols: [
      {
        id: 'pat-1',
        status: 'active',
        planetId: 'p1',
        patrolType: 'orbital',
        fleet: { lightFighter: 4 }
      }
    ]
  };

  it('EspionageBriefPanel ejecuta su lógica de render sin ReferenceError y genera el árbol esperado', () => {
    const currentPlanet = dummyState.planets[0];
    const target = { galaxy: 1, system: 2, position: 3, isAI: true };
    const selectedShips = { espionageProbe: 2 };
    const fmt = (n) => String(n);

    // Ejecución directa de la función del componente
    const element = EspionageBriefPanel({
      state: dummyState,
      currentPlanet,
      target,
      selectedShips,
      fmt
    });

    expect(element).toBeDefined();
    expect(element.type).toBe('section');
  });

  it('Test de Objetivos Múltiples: Espiar A y B independientemente no altera los bonus entre sí', () => {
    const missionA = {
      id: 'm-spy-a',
      type: 'espionage',
      from: dummyState.planets[0],
      to: { galaxy: 1, system: 2, position: 3 },
      fleet: { espionageProbe: 2 },
      isAI: false
    };

    const missionB = {
      id: 'm-spy-b',
      type: 'espionage',
      from: dummyState.planets[0],
      to: { galaxy: 2, system: 4, position: 5 },
      fleet: { espionageProbe: 2 },
      isAI: false
    };

    // 1. Espiar A
    const resA = handleEspionageMission(missionA, dummyState);
    expect(resA.state.planetIntel['ai-1']).toBeDefined();

    // 2. Espiar B
    const resB = handleEspionageMission(missionB, resA.state);
    expect(resB.state.planetIntel['ai-2']).toBeDefined();

    // 3. Atacar A usando la inteligencia de A, no el último informe global
    const attackA = {
      id: 'm-atk-a',
      type: 'attack',
      from: dummyState.planets[0],
      to: { galaxy: 1, system: 2, position: 3 },
      fleet: { lightFighter: 10 },
      isAI: false
    };

    const combatResA = handleCombatMission(attackA, resB.state);
    expect(combatResA.state.combatLog).toBeDefined();
    expect(combatResA.state.combatLog.length).toBeGreaterThan(0);
  });

  it('Test de Unknown: información exacta previa no se destruye ante un informe desconocido', () => {
    const target = dummyState.aiPlanets[0];
    const initialIntelState = {
      ...dummyState,
      planetIntel: {
        'ai-1': {
          id: target.id,
          name: target.name,
          coords: { galaxy: target.galaxy, system: target.system, position: target.position },
          level: 'high',
          at: Date.now() - 1000,
          reports: 1,
          resources: { metal: 100000, crystal: 80000, deuterium: 30000 },
          buildings: { earlyWarningSat: 1 },
          fleet: { lightFighter: 5 },
          defenses: { rocketLauncher: 2 }
        }
      }
    };

    // Espionaje con tecnología muy baja frente a alta defensa => intelLevel: 'blocked' (???)
    const blockedMission = {
      id: 'm-spy-blocked',
      type: 'espionage',
      from: { ...dummyState.planets[0], research: { espionage: 0 } },
      to: { galaxy: 1, system: 2, position: 3 },
      fleet: { espionageProbe: 1 },
      isAI: false
    };

    const stateBlocked = {
      ...initialIntelState,
      research: { espionage: 0 },
      aiPlanets: [{ ...target, buildings: { earlyWarningSat: 20, phalanxSensors: 20 }, research: { espionage: 15 } }]
    };

    const result = handleEspionageMission(blockedMission, stateBlocked);
    const updatedIntel = result.state.planetIntel['ai-1'];

    // Se debe conservar la información exacta
    expect(updatedIntel.level).toBe('high');
    expect(updatedIntel.resources.metal).toBe(100000);
    expect(updatedIntel.fleet.lightFighter).toBe(5);
    expect(updatedIntel.defenses.rocketLauncher).toBe(2);
    expect(updatedIntel.reports).toBe(2);
  });

  it('Test de Intercepción Real: una patrulla armada intercepta una sonda enemiga y combate en órbita', () => {
    const aiSpyMission = {
      id: 'm-ai-spy',
      type: 'espionage',
      from: dummyState.aiPlanets[0],
      to: { galaxy: 1, system: 1, position: 1 },
      fleet: { espionageProbe: 1 },
      isAI: true
    };

    // Forzar detección para probar la resolución de combate e intercepción
    const originalRandom = Math.random;
    Math.random = () => 0.01; // < detectionChance => detectado
    try {
      const res = handleEspionageMission(aiSpyMission, dummyState);
      expect(res.type).toBe('warning');
      expect(res.returnFleet).toEqual({});
      expect(res.state.notifications.some(n => n.message.includes('Espía neutralizado'))).toBe(true);
      expect(res.state.notifications.some(n => n.message.includes('patrulla interceptó'))).toBe(true);
    } finally {
      Math.random = originalRandom;
    }
  });
});
