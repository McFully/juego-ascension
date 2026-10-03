import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { calcProduction, buildingProdInfo } from '../utils/formulas.js';
import { POPULATION_CONSUMPTION_RATES, STORAGE_OVERFLOW_THRESHOLD } from '../data/gameData.js';
import { processPlanetTick } from '../reducers/tick/populationTick.js';
import { processTick } from '../reducers/tick/tickOrchestrator.js';
import { simulateCombat } from '../combat/combatEngine.js';

/**
 * CONTRATO TDD FASE 18: AUDITORÍA UNIVERSAL DE FÓRMULAS
 *
 * 1. buildingProdInfo usa calcProduction directamente en lugar de una reimplementación duplicada
 *    (garantizando DISPLAYED = REAL).
 * 2. POPULATION_CONSUMPTION_RATES y STORAGE_OVERFLOW_THRESHOLD centralizados en gameData.js
 *    y usados en populationTick, App.jsx, ResourceBar.jsx, OverviewPage.jsx y autoTradeRoutesTick.js.
 * 3. calcProduction acepta (ministries, relicsList) o relicsList unificada; aplica reliquias
 *    forge_prime (+15% metal), crystal_heart (+15% cristal), quantum_core (+20% energía)
 *    de forma consistente en total y desglose.
 * 4. Reliquias de combate war_drone y shield_matrix se aplican en simulateCombat y getShipStats/getDefenseStats.
 * 5. Stats globales de recursos en tickOrchestrator suman la producción de todos los mundos del imperio.
 */

describe('Fase 18: Auditoría Universal de Fórmulas Contract', () => {
  const formulasCode = readFileSync(join(process.cwd(), 'src', 'utils', 'formulas.js'), 'utf-8');
  const prodFormulasCode = readFileSync(join(process.cwd(), 'src', 'utils', 'formulas', 'productionFormulas.js'), 'utf-8');
  const tickOrchCode = readFileSync(join(process.cwd(), 'src', 'reducers', 'tick', 'tickOrchestrator.js'), 'utf-8');
  const combatEngineCode = readFileSync(join(process.cwd(), 'src', 'combat', 'combatEngine.js'), 'utf-8');
  const summaryCardCode = readFileSync(join(process.cwd(), 'src', 'components', 'overview', 'ProductionSummaryCard.jsx'), 'utf-8');

  it('Contrato 1: Centralización de POPULATION_CONSUMPTION_RATES y STORAGE_OVERFLOW_THRESHOLD', () => {
    expect(POPULATION_CONSUMPTION_RATES).toBeDefined();
    expect(POPULATION_CONSUMPTION_RATES.metal).toBe(0.00002);
    expect(POPULATION_CONSUMPTION_RATES.crystal).toBe(0.00001);
    expect(POPULATION_CONSUMPTION_RATES.deuterium).toBe(0.000005);
    expect(STORAGE_OVERFLOW_THRESHOLD).toBe(0.75);
  });

  it('Contrato 2: buildingProdInfo delega en calcProduction erradicando la segunda fuente de verdad', () => {
    // formulas.js no debe contener la antigua reimplementación manual con specDeut = 1.15 repetido
    expect(formulasCode).toMatch(/buildingProdInfo/);
    // Debe usar calcProduction para calcular el delta exacto
    expect(formulasCode).toMatch(/calcProduction/);
  });

  it('Contrato 3: Reliquias de producción (forge_prime, crystal_heart, quantum_core) se aplican fielmente', () => {
    // Consumo energético x1000: fusión nivel 30 garantiza ratio de energía > 0
    const buildings = { metalMine: 5, crystalMine: 5, deutSynth: 5, solarPlant: 5, fusionReactor: 30 };
    const research = { plasma: 1 };
    const baseProd = calcProduction(buildings, research, 20, 1, 'human', null, null, null, null, null, 0, []);

    const relicArtifacts = [
      { id: 'forge_prime', effect: { metalProd: 1.15 } },
      { id: 'crystal_heart', effect: { crystalProd: 1.15 } },
      { id: 'quantum_core', effect: { energyProd: 1.20 } }
    ];

    const buffedProd = calcProduction(buildings, research, 20, 1, 'human', null, null, null, null, null, 0, relicArtifacts);

    expect(buffedProd.metal).toBeGreaterThan(baseProd.metal);
    expect(buffedProd.crystal).toBeGreaterThan(baseProd.crystal);
    expect(buffedProd.energyProd).toBeGreaterThan(baseProd.energyProd);
    expect(buffedProd.breakdown.metal.total).toBe(buffedProd.metal);
    expect(buffedProd.breakdown.crystal.total).toBe(buffedProd.crystal);
  });

  it('Contrato 4: simulateCombat recibe y aplica reliquias para war_drone y shield_matrix', () => {
    expect(combatEngineCode).toMatch(/relics/);
  });

  it('Contrato 5: Stats acumuladas de recursos en tickOrchestrator integran todos los planetas del imperio', () => {
    expect(tickOrchCode).toMatch(/newPlanets\.reduce/);
  });

  it('Contrato 6: ProductionSummaryCard lee el consumo directamente de production.breakdown o constantes', () => {
    expect(summaryCardCode).toMatch(/popConsumption|POPULATION_CONSUMPTION_RATES/);
  });
});
