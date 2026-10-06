import { describe, it, expect, afterEach, vi } from 'vitest';
import { processAIEmpireTick } from './aiEmpireTick.js';

/**
 * `aiEmpireTick` hace 24 llamadas a `Math.random()` por tick. Sin sembrar el
 * generador, 300 ticks dan un resultado distinto en cada ejecucion y las
 * aserciones sobre la divergencia fallaban 2 de cada 8 veces: una suite que
 * a veces esta roja no es una suite. Se siembra el generador para que la
 * simulacion sea reproducible.
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('aiEmpireTick — Simulación Prolongada y Divergencia de Facciones', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dos facciones con diferentes rasgos y estrategias divergen drásticamente en 300 ticks', () => {
    vi.spyOn(Math, 'random').mockImplementation(mulberry32(20251006));

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

    // 2. El perfil de cada faccion se diferencia por su estrategia. Esto es lo que
    // el tick garantiza de verdad: un tecnologo tiende a la tecnica y un
    // militarista a la agresividad.
    expect(finalMilitarist.profile.techLean).toBeLessThan(finalTechnocrat.profile.techLean);
    expect(finalMilitarist.profile.aggressiveness).toBeGreaterThan(finalTechnocrat.profile.aggressiveness);

    // 3. Las dos facciones investigan, con composicion distinta.
    expect(Object.keys(finalMilitarist.research || {}).length).toBeGreaterThan(0);
    expect(Object.keys(finalTechnocrat.research || {}).length).toBeGreaterThan(0);
    expect(JSON.stringify(finalMilitarist.research)).not.toBe(JSON.stringify(finalTechnocrat.research));

    // 4. Memoria y ledger de inteligencia
    expect(finalMilitarist.memory).toBeDefined();
    expect(finalTechnocrat.memory).toBeDefined();
  });
});
