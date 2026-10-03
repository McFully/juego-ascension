import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { calcBuildTime, calcDefenseTime, calcCustomShipTime, calcShipTime } from '../utils/formulas/costFormulas.js';
import { calcEffectiveBuildTime } from '../utils/formulas/buildTiming.js';
import { calcRemainingSeconds, calcTotalSeconds } from '../utils/formulas/timingHelpers.js';
import { backfillQueueTimeMults } from '../reducers/tick/queues/queueTiming.js';

describe('FASE 05 — Contrato de Fuente Única de Duraciones', () => {
  describe('1. Wrapper unificado calcEffectiveBuildTime', () => {
    it('calcula la misma duración exacta recibiendo un objeto con cost, planet y state', () => {
      const planet = {
        buildings: { robotFactory: 2, naniteFactory: 1, constructionCenter: 2, colonySupremeCourt: 1 },
        ministries: {
          defense: { conscriptionLevel: 'mandated' },
          infra: { minister: { bonus: 'buildTime' }, directives: { dir_rapid: true } }
        }
      };
      const state = {
        research: { fullAuto: 2, molecularVaporDep: 1, adaptiveModularArch: 1, industrialOpt: 1 },
        relics: [{ effect: { buildSpeed: 1.1 } }]
      };
      const cost = { metal: 5000, crystal: 3000, deuterium: 1000 };

      const manualTime = calcBuildTime(
        cost,
        planet.buildings.robotFactory,
        planet.buildings.naniteFactory,
        1, // speed
        planet.buildings.constructionCenter,
        planet.ministries,
        state.research,
        planet.buildings,
        state.relics
      );

      const wrappedTime = calcEffectiveBuildTime({ cost, planet, state, speed: 1 });
      expect(wrappedTime).toBe(manualTime);
      expect(wrappedTime).toBeGreaterThan(0);
    });

    it('economyReducer.js usa calcEffectiveBuildTime y pasa el planeta y estado completo', () => {
      const src = fs.readFileSync(path.resolve(__dirname, '../reducers/economyReducer.js'), 'utf-8');
      expect(src).toMatch(/calcEffectiveBuildTime\(\{[\s\S]*?cost,[\s\S]*?planet,[\s\S]*?state/);
    });

    it('autoBuildTick.js usa calcEffectiveBuildTime para encolar obras automáticas', () => {
      const src = fs.readFileSync(path.resolve(__dirname, '../reducers/tick/automation/autoBuildTick.js'), 'utf-8');
      expect(src).toMatch(/calcEffectiveBuildTime\(\{[\s\S]*?cost,[\s\S]*?planet,[\s\S]*?state/);
      expect(src).not.toMatch(/calcBuildTime\(/);
    });

    it('MinistryBuildingsSection.jsx usa calcEffectiveBuildTime en las tarjetas de edificio', () => {
      const src = fs.readFileSync(path.resolve(__dirname, '../components/government/MinistryBuildingsSection.jsx'), 'utf-8');
      expect(src).toMatch(/calcEffectiveBuildTime/);
    });

    it('queueTiming.js usa calcEffectiveBuildTime en case build', () => {
      const src = fs.readFileSync(path.resolve(__dirname, '../reducers/tick/queues/queueTiming.js'), 'utf-8');
      expect(src).toMatch(/calcEffectiveBuildTime/);
    });
  });

  describe('2. Eliminación de código muerto y consistencia de retorno', () => {
    it('automationTick.js ha sido eliminado del repositorio', () => {
      const filePath = path.resolve(__dirname, '../reducers/tick/automationTick.js');
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('backfillQueueTimeMults devuelve consistentemente { state, stamped: 0 } ante entrada inválida', () => {
      const resNull = backfillQueueTimeMults(null);
      expect(resNull).toEqual({ state: null, stamped: 0 });

      const resEmpty = backfillQueueTimeMults({});
      expect(resEmpty).toEqual({ state: {}, stamped: 0 });
    });
  });

  describe('3. Unificación de investigación: MinistryResearchSection', () => {
    it('MinistryResearchSection.jsx usa calcPlanetResearchTime en vez de calcResearchTime crudo', () => {
      const src = fs.readFileSync(path.resolve(__dirname, '../components/government/MinistryResearchSection.jsx'), 'utf-8');
      expect(src).toMatch(/calcPlanetResearchTime\(\s*state,\s*currentPlanet,\s*cost\s*\)/);
    });
  });

  describe('4. Conscription y centro de construcción en defensas y custom ships', () => {
    it('calcDefenseTime acepta mins y aplica el conscriptionBonus mandated', () => {
      const timeVolunteer = calcDefenseTime('rocketLauncher', 10, 1, 0, 1, 1, { defense: { conscriptionLevel: 'volunteer' } });
      const timeMandated = calcDefenseTime('rocketLauncher', 10, 1, 0, 1, 1, { defense: { conscriptionLevel: 'mandated' } });
      expect(timeMandated).toBeLessThan(timeVolunteer);
    });

    it('calcCustomShipTime acepta constructionCenterLvl y mins', () => {
      const bp = { chassis: 'cruiserH', weapon: 'plasmaCannon', engine: 'basicImpulse', shield: 'advShield', modules: [] };
      const timeNoDiscount = calcCustomShipTime(bp, 1, 0, 1, 1, 0, { defense: { conscriptionLevel: 'volunteer' } });
      const timeWithDiscount = calcCustomShipTime(bp, 1, 0, 1, 1, 5, { defense: { conscriptionLevel: 'mandated' } });
      expect(timeWithDiscount).toBeLessThan(timeNoDiscount);
    });

    it('queueTiming.js aplica el bonus militar en case ship y case defense', () => {
      const src = fs.readFileSync(path.resolve(__dirname, '../reducers/tick/queues/queueTiming.js'), 'utf-8');
      const shipMatch = src.match(/case 'ship':([\s\S]*?)case 'defense':/);
      expect(shipMatch[1]).toMatch(/specialization === 'military'/);
      const defMatch = src.match(/case 'defense':([\s\S]*?)case 'customShip':/);
      expect(defMatch[1]).toMatch(/specialization === 'military'/);
    });
  });

  describe('5. Countdown helper centralizado', () => {
    it('calcRemainingSeconds y calcTotalSeconds calculan correctamente tiempos no negativos', () => {
      const now = 1000000;
      expect(calcRemainingSeconds(now + 45000, now)).toBe(45);
      expect(calcRemainingSeconds(now - 10000, now)).toBe(0);
      expect(calcTotalSeconds(now, now + 120000)).toBe(120);
      expect(calcTotalSeconds(now, now)).toBe(1); // mínimo 1
    });
  });
});
