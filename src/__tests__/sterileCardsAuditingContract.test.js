import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PLANET_SPECIALIZATION_COSTS, EVENT_REWARD_RANGES } from '../data/gameData.js';
import { economyReducer } from '../reducers/economyReducer.js';

/**
 * CONTRATO TDD FASE 17: AUDITORÍA DE CARDS ESTÉRILES, NÚMEROS MÁGICOS Y ROBUSTEZ.
 *
 * 1. Centralización de costes de especialización planetaria en gameData.js (PLANET_SPECIALIZATION_COSTS)
 *    y consumición unificada en economyReducer y PlanetarySpecializationCard.
 * 2. ResearchPage debe conectar el veto de automatización con ItemCard pasando isAutoRestricted
 *    y onToggleAutoRestriction.
 * 3. ActionCardTile no debe fallar en silencio si type="custom" o no hay onClick, y debe proveer
 *    feedback auditivo y fallback a navegación si targetScreen está definido.
 * 4. GovernmentBreadcrumbs debe emitir feedback auditivo táctico al interactuar con el avatar/nombre
 *    de un ministro incluso si no cuenta con voiceId configurado.
 * 5. EVENT_REWARD_RANGES centralizado en gameData.js y consumido en missions.jsx erradicando números mágicos.
 */

describe('Fase 17: Auditoría de Cards Estériles, Números Mágicos y Robustez Contract', () => {
  const researchPageCode = readFileSync(
    join(process.cwd(), 'src', 'pages', 'ResearchPage.jsx'),
    'utf-8'
  );
  const actionCardCode = readFileSync(
    join(process.cwd(), 'src', 'components', 'ui', 'ActionCardTile.jsx'),
    'utf-8'
  );
  const govBreadcrumbsCode = readFileSync(
    join(process.cwd(), 'src', 'components', 'government', 'GovernmentBreadcrumbs.jsx'),
    'utf-8'
  );
  const specCardCode = readFileSync(
    join(process.cwd(), 'src', 'components', 'overview', 'PlanetarySpecializationCard.jsx'),
    'utf-8'
  );
  const missionsCode = readFileSync(
    join(process.cwd(), 'src', 'missions.jsx'),
    'utf-8'
  );

  it('Contrato 1: Centralización y consumo de PLANET_SPECIALIZATION_COSTS', () => {
    expect(PLANET_SPECIALIZATION_COSTS).toBeDefined();
    expect(PLANET_SPECIALIZATION_COSTS.industrial).toEqual({ metal: 10000, crystal: 10000, deuterium: 0 });
    expect(PLANET_SPECIALIZATION_COSTS.scientific).toEqual({ metal: 15000, crystal: 10000, deuterium: 5000 });
    expect(PLANET_SPECIALIZATION_COSTS.military).toEqual({ metal: 10000, crystal: 15000, deuterium: 5000 });
    expect(PLANET_SPECIALIZATION_COSTS.commercial).toEqual({ metal: 12000, crystal: 12000, deuterium: 2000 });

    // economyReducer debe aplicar estos costes
    const baseState = {
      planets: [
        {
          id: 'p1',
          name: 'Principal',
          resources: { metal: 20000, crystal: 20000, deuterium: 10000 },
          specialization: null
        }
      ],
      currentPlanetId: 'p1'
    };

    const nextState = economyReducer(baseState, {
      type: 'PLANET_SPECIALIZE',
      planetId: 'p1',
      specialization: 'scientific'
    });

    expect(nextState.planets[0].specialization).toBe('scientific');
    expect(nextState.planets[0].resources.metal).toBe(20000 - PLANET_SPECIALIZATION_COSTS.scientific.metal);
    expect(nextState.planets[0].resources.crystal).toBe(20000 - PLANET_SPECIALIZATION_COSTS.scientific.crystal);
    expect(nextState.planets[0].resources.deuterium).toBe(10000 - PLANET_SPECIALIZATION_COSTS.scientific.deuterium);

    // PlanetarySpecializationCard debe importar o usar PLANET_SPECIALIZATION_COSTS
    expect(specCardCode).toMatch(/PLANET_SPECIALIZATION_COSTS/);
  });

  it('Contrato 2: ResearchPage conecta el veto de automatización (ItemCard)', () => {
    expect(researchPageCode).toMatch(/isAutoRestricted=\{Boolean\(currentPlanet\?.automatedExclusions\?\.\[id\]\)\}/);
    expect(researchPageCode).toMatch(/TOGGLE_AUTOMATION_RESTRICTION/);
  });

  it('Contrato 3: ActionCardTile tiene fallback seguro para navegación y sonido táctil', () => {
    // Si no hay onClick, si tiene targetScreen navega a él
    expect(actionCardCode).toMatch(/nav\.navigateTo\(targetScreen/);
    expect(actionCardCode).toMatch(/playSfx\(["']click["']\)/);
  });

  it('Contrato 4: GovernmentBreadcrumbs provee feedback sonoro al hacer clic en ministro sin voiceId', () => {
    expect(govBreadcrumbsCode).toMatch(/playVoice\(minister\.voiceId\)/);
    expect(govBreadcrumbsCode).toMatch(/window\.playSfx\(['"]click['"]\)/);
  });

  it('Contrato 5: EVENT_REWARD_RANGES centralizado y consumido en missions.jsx', () => {
    expect(EVENT_REWARD_RANGES).toBeDefined();
    expect(EVENT_REWARD_RANGES.resource).toBeDefined();
    expect(EVENT_REWARD_RANGES.trade).toBeDefined();
    expect(EVENT_REWARD_RANGES.hazard).toBeDefined();
    expect(missionsCode).toMatch(/EVENT_REWARD_RANGES/);
  });
});
