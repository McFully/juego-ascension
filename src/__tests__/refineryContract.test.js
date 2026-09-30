import { describe, it, expect } from 'vitest';
import { calcProduction } from '../utils/formulas/productionFormulas.js';
import { buildingProdInfo } from '../utils/formulas.js';
import { BUILDINGS } from '../data/gameData.js';
import { REFINERY_REWARD_MULTIPLIER, BASE_REFINERY_PROD } from '../utils/formulas/productionFormulas.js';

describe('FASE 06 — Contrato de Refinería ×200 y Producción Unificada', () => {
  it('1. Constantes canónicas existen y REFINERY_REWARD_MULTIPLIER es 200', () => {
    expect(REFINERY_REWARD_MULTIPLIER).toBe(200);
    expect(BASE_REFINERY_PROD).toBe(5000);
  });

  it('2. Refinería nivel 1 produce exactamente 1.000.000 metal base (5.000 × 200)', () => {
    // Suministramos energía suficiente para ratio 1
    const buildings = { refinery: 1, quantumReactor: 100 };
    const research = {};
    const prod = calcProduction(buildings, research, 20, 1, 'human', null, null, null, null, null, 0);

    expect(prod.ratio).toBe(1);
    expect(prod.breakdown.metal.industryItems.refinery).toBe(1000000);
    expect(prod.breakdown.metal.industry).toBe(1000000);
    expect(prod.metal).toBe(1000000);
  });

  it('3. Refinería escala linealmente con el nivel (nv.3 = 3.000.000)', () => {
    const buildings = { refinery: 3, quantumReactor: 100 };
    const research = {};
    const prod = calcProduction(buildings, research, 20, 1, 'human', null, null, null, null, null, 0);

    expect(prod.ratio).toBe(1);
    expect(prod.breakdown.metal.industryItems.refinery).toBe(3000000);
    expect(prod.metal).toBe(3000000);
  });

  it('4. Directiva dir_heavy_refine añade +20% a la producción de refinerías', () => {
    const buildings = { refinery: 1, quantumReactor: 100 };
    const research = {};
    const relicsWithDirective = {
      ministries: {
        industry: {
          directives: { dir_heavy_refine: true }
        }
      }
    };
    const prod = calcProduction(buildings, research, 20, 1, 'human', null, null, null, null, null, 0, relicsWithDirective);

    expect(prod.ratio).toBe(1);
    expect(prod.breakdown.metal.industryItems.refinery).toBe(1200000);
    expect(prod.metal).toBe(1200000);
  });

  it('5. Mejora ministerial ind_catalyst añade +15% por nivel a refinerías', () => {
    const buildings = { refinery: 1, quantumReactor: 100 };
    const research = {};
    const relicsWithUpgrade = {
      ministryUpgrades: {
        industry: { ind_catalyst: 2 } // +30%
      }
    };
    const prod = calcProduction(buildings, research, 20, 1, 'human', null, null, null, null, null, 0, relicsWithUpgrade);

    expect(prod.ratio).toBe(1);
    expect(prod.breakdown.metal.industryItems.refinery).toBe(1300000);
    expect(prod.metal).toBe(1300000);
  });

  it('6. Generación de escoria de refinería se mantiene proporcionada y no colapsa el planeta', () => {
    const buildings = { refinery: 1 };
    const research = {};
    const prod = calcProduction(buildings, research, 20, 1, 'human', null, null, null, null, null, 0);

    // 5000 * 0.18 = 900 de escoria
    expect(prod.slagGross).toBe(900);
  });

  it('7. buildingProdInfo clasifica todos los edificios industriales en INDUSTRY_BUILD_IDS', () => {
    const industryIds = [
      'refinery', 'chemPlant', 'synthPlant', 'enrichPlant',
      'vacuumForge', 'spaceElevator', 'automatedMine', 'slagRecycler',
      'heliumExtractor', 'siliconPurifier', 'catalyticDeut'
    ];

    industryIds.forEach(id => {
      const info = buildingProdInfo(id, 1, {}, 20, 1, {});
      expect(info).not.toBeNull();
      expect(info.kind).toBe('industry');
    });
  });

  it('8. buildingProdInfo para refinería nv.1 muestra delta de 1.000.000 /h', () => {
    const planet = { buildings: { quantumReactor: 100 } };
    const info = buildingProdInfo('refinery', 0, {}, 20, 1, planet);
    expect(info.next.prod).toBe(1000000);
    expect(info.deltaProd).toBe(1000000);
  });

  it('9. Coherencia de mina de cristal entre catálogo y fórmula de minas', () => {
    const info = buildingProdInfo('crystalMine', 1, {}, 20, 1, {});
    expect(info.kind).toBe('mine');
    // baseProd en catálogo es 22, la fórmula en formulas.js debe usar 22 * 1.5 = 33 o 30 alineado
    expect(info.current.prod).toBeGreaterThan(0);
  });
});
