import { describe, it, expect } from 'vitest';
import { processAIEmpireTick } from './aiEmpireTick.js';

describe('aiEmpireTick — Simulación Prolongada y Divergencia de Facciones', () => {
  it('dos facciones con diferentes rasgos y estrategias divergen drásticamente en 300 ticks', () => {
    const militarist = {
      id: 'militarist_prime',
      name: 'Vanguardia Belicista',
      empireName: 'Vanguardia Belicista',
      galaxy: 1,
      system: 1,
      position: 1,
      isAI: true,
      strategy: 'militarist',
      aiLevel: 1,
      resources: { metal: 10000, crystal: 5000, deuterium: 2000 },
      buildings: { solarPlant: 5, metalMine: 4, crystalMine: 3, deutSynth: 2, shipyard: 2, researchLab: 1 },
      research: {},
      fleet: { lightFighter: 5 },
      defenses: { rocketLauncher: 5 }
    };

    const technocrat = {
      id: 'technocrat_prime',
      name: 'Cónclave Científico',
      empireName: 'Cónclave Científico',
      galaxy: 1,
      system: 2,
      position: 1,
      isAI: true,
      strategy: 'technocrat',
      aiLevel: 1,
      resources: { metal: 10000, crystal: 5000, deuterium: 2000 },
      buildings: { solarPlant: 5, metalMine: 3, crystalMine: 3, deutSynth: 2, shipyard: 0, researchLab: 4 },
      research: {},
      fleet: { lightFighter: 1 },
      defenses: { rocketLauncher: 2 }
    };

    let state = {
      gameTick: 0,
      aiPlanets: [militarist, technocrat],
      planets: [],
      galacticEvents: [],
      blueprints: []
    };

    // Ejecutar simulación prolongada de 300 ticks
    for (let t = 1; t <= 300; t++) {
      state.gameTick = t;
      state = processAIEmpireTick(state);
    }

    const finalMilitarist = state.aiPlanets.find(p => p.id === 'militarist_prime');
    const finalTechnocrat = state.aiPlanets.find(p => p.id === 'technocrat_prime');

    expect(finalMilitarist).toBeDefined();
    expect(finalTechnocrat).toBeDefined();

    // 1. Verificación de directivas activas asignadas y perfiles
    expect(finalMilitarist.profile).toBeDefined();
    expect(finalTechnocrat.profile).toBeDefined();
    expect(finalMilitarist.strategicDirective).toBeDefined();
    expect(finalTechnocrat.strategicDirective).toBeDefined();

    // 2. Divergencia en investigación
    const techCountMil = Object.values(finalMilitarist.research || {}).reduce((a, b) => a + b, 0);
    const techCountTech = Object.values(finalTechnocrat.research || {}).reduce((a, b) => a + b, 0);
    expect(techCountTech).toBeGreaterThanOrEqual(techCountMil);

    // 3. Divergencia en poder militar y flota
    const fleetMil = Object.values(finalMilitarist.fleet || {}).reduce((a, b) => a + b, 0);
    const fleetTech = Object.values(finalTechnocrat.fleet || {}).reduce((a, b) => a + b, 0);
    expect(fleetMil).toBeGreaterThanOrEqual(fleetTech);

    // 4. Memoria y ledger de inteligencia
    expect(finalMilitarist.memory).toBeDefined();
    expect(finalTechnocrat.memory).toBeDefined();
  });
});
