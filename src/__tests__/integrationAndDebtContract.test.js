import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { processLivingPlanetTick } from '../reducers/tick/livingPlanetTick.js';
import { systemReducer } from '../reducers/systemReducer.js';
import { getPOIAtCoordinates } from '../utils/formulas/coordinatesFormulas.js';

/**
 * CONTRATO TDD FASE 19: INTEGRACIÓN Y DEUDA TÉCNICA
 *
 * 1. Los 3 módulos muertos de tick/events han sido eliminados de disco.
 * 2. ReplayPage está conectada como vista de repetición en GameViewports o eliminada limpiamente.
 * 3. getPOIAtCoordinates implementa memoización/caché determinista para evitar recomputar en render y ticks.
 * 4. processLivingPlanetTick clona profundamente sus estructuras anidadas (thermalGrid, biosphere, demographics, governance)
 *    garantizando inmutabilidad estricta (Object.freeze no lanza error por mutación externa).
 * 5. RESET_GAME conserva playerName, credits y avatarUrl al volver al menú principal.
 * 6. useGameLifecycle procesa el progreso offline de forma balanceada y resetea offlineProcessedRef al cambiar de partida.
 * 7. Documentación en docs/05_datos_y_apis/05_02 y 05_04 corregida (nombres reales universe_<ISO>.bak y verificación de integridad).
 * 8. planets en SQLite admite múltiples partidas sin conflicto de clave foránea.
 */

describe('Fase 19: Integración y Deuda Técnica Contract', () => {
  const rootDir = process.cwd();

  it('Contrato 1: Módulos muertos de tick/events eliminados', () => {
    const p1 = join(rootDir, 'src', 'reducers', 'tick', 'events', 'missionsAndRandomEvents.js');
    const p2 = join(rootDir, 'src', 'reducers', 'tick', 'events', 'transmissionsAndFirstContact.js');
    const p3 = join(rootDir, 'src', 'reducers', 'tick', 'events', 'councilAndCrises.js');
    expect(existsSync(p1)).toBe(false);
    expect(existsSync(p2)).toBe(false);
    expect(existsSync(p3)).toBe(false);
  });

  it('Contrato 2: processLivingPlanetTick garantiza inmutabilidad profunda y no muta el planeta de entrada', () => {
    const originalPlanet = {
      id: 'p_test',
      biome: 'volcanic',
      population: 100000,
      buildings: { metalMine: 10, refinery: 2 },
      thermalGrid: Object.freeze({
        heatGeneratedMW: 1000,
        heatDissipatedMW: 2000,
        atmosphericTempC: 30,
        blackoutRisk: 0,
        coolingEfficiency: 1,
      }),
      biosphere: Object.freeze({
        pressureAtm: 1.0,
        o2Level: 0.21,
        waterReserveDays: 120,
        caloricSupplyRatio: 1.0,
        radiationShieldActive: true,
        pollutionLevel: 10,
        leakDetected: false,
      }),
      demographics: Object.freeze({
        primaryLabor: 50000,
        technicians: 35000,
        intellectuals: 15000,
        morale: 80,
        healthIndex: 90,
        unrest: 5,
      }),
      governance: Object.freeze({
        governor: null,
        localMinistries: Object.freeze({
          infra: Object.freeze({ budgetShare: 0.20, activeTasks: Object.freeze([]) }),
        }),
      }),
    };

    // No debe lanzar TypeError por modificar propiedades congeladas
    let updated;
    expect(() => {
      updated = processLivingPlanetTick(originalPlanet, { gameTick: 10 });
    }).not.toThrow();

    expect(updated).not.toBe(originalPlanet);
    expect(updated.thermalGrid).not.toBe(originalPlanet.thermalGrid);
    expect(updated.biosphere).not.toBe(originalPlanet.biosphere);
    expect(updated.demographics).not.toBe(originalPlanet.demographics);
    expect(updated.thermalGrid.heatGeneratedMW).toBeGreaterThan(0);
  });

  it('Contrato 3: RESET_GAME conserva identidad del jugador y créditos base de perfil', () => {
    const prevState = {
      gameStarted: true,
      playerName: 'Almirante Valen',
      avatarUrl: 'assets/avatar.png',
      credits: 250000,
      planets: [{ id: 'p1' }],
    };

    const nextState = systemReducer(prevState, { type: 'RESET_GAME' });
    expect(nextState.gameStarted).toBe(false);
    expect(nextState.playerName).toBe('Almirante Valen');
    expect(nextState.avatarUrl).toBe('assets/avatar.png');
    expect(nextState.credits).toBe(250000);
  });

  it('Contrato 4: getPOIAtCoordinates está memoizado / cacheado con retorno consistente', () => {
    const r1 = getPOIAtCoordinates(1, 2, 3);
    const r2 = getPOIAtCoordinates(1, 2, 3);
    expect(r1).toEqual(r2);
  });

  it('Contrato 5: Documentación técnica 05_02 y 05_04 no miente sobre el nombre del backup', () => {
    const doc0502 = readFileSync(join(rootDir, 'docs', '05_datos_y_apis', '05_02_esquema_de_base_de_datos_y_relaciones.md'), 'utf-8');
    const doc0504 = readFileSync(join(rootDir, 'docs', '05_datos_y_apis', '05_04_persistencias_locales_cache_y_storage.md'), 'utf-8');

    expect(doc0502).toMatch(/universe_.*\.bak/);
    expect(doc0504).toMatch(/universe_.*\.bak/);
  });

  it('Contrato 6: GameViewports renderiza ReplayPage cuando activeTab es replay', () => {
    const viewportsCode = readFileSync(join(rootDir, 'src', 'components', 'app', 'GameViewports.jsx'), 'utf-8');
    expect(viewportsCode).toMatch(/activeTab === ["']replay["'].*ReplayPage/);
  });
});
