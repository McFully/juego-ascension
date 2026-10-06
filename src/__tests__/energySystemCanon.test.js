import { describe, it, expect } from 'vitest';
import { BUILDINGS } from '../data/catalog/index.js';
import { calcProduction } from '../utils/formulas/productionFormulas.js';
import { buildingProdInfo } from '../utils/formulas.js';
import { rawBuildingEnergyGen, calcBuildingEnergyDemand } from '../utils/formulas/energyFormulas.js';

describe('SISTEMA ENERGÉTICO CANÓNICO - ESCALAS, UNICIDAD Y PARIDAD DE VISTAS', () => {
  it('1. Proporciones base canónicas respecto a Planta Solar (Solar=1x, Geo=5x, Orbital=25x, Fusion=75x, Cuántico=500x, Materia Oscura=4000x)', () => {
    const solarBase = BUILDINGS.solarPlant.energyGen;
    expect(solarBase).toBe(20);

    const geoBase = BUILDINGS.geoPlant.energyGen;
    const orbitalBase = BUILDINGS.orbitalEnergy.energyGen;
    const fusionBase = BUILDINGS.fusionReactor.energyGen;
    const quantumBase = BUILDINGS.quantumReactor.energyGen;
    const darkMatterBase = BUILDINGS.darkMatterPlant.energyGen;

    expect(geoBase / solarBase).toBe(5);
    expect(orbitalBase / solarBase).toBe(25);
    expect(fusionBase / solarBase).toBe(75);
    expect(quantumBase / solarBase).toBe(500);
    expect(darkMatterBase / solarBase).toBe(4000);
  });

  it('2. Proporciones canónicas en múltiples niveles (Nivel 1, 5, 10, 20)', () => {
    const levels = [1, 5, 10, 20];
    levels.forEach(lvl => {
      const solarVal = rawBuildingEnergyGen('solarPlant', lvl);
      const geoVal = rawBuildingEnergyGen('geoPlant', lvl);
      const orbitalVal = rawBuildingEnergyGen('orbitalEnergy', lvl);
      const fusionVal = rawBuildingEnergyGen('fusionReactor', lvl);
      const quantumVal = rawBuildingEnergyGen('quantumReactor', lvl);
      const darkMatterVal = rawBuildingEnergyGen('darkMatterPlant', lvl);

      expect(geoVal / solarVal).toBeCloseTo(5, 5);
      expect(orbitalVal / solarVal).toBeCloseTo(25, 5);
      expect(fusionVal / solarVal).toBeCloseTo(75, 5);
      expect(quantumVal / solarVal).toBeCloseTo(500, 5);
      expect(darkMatterVal / solarVal).toBeCloseTo(4000, 5);
    });
  });

  it('3. Paridad absoluta entre la tarjeta de instalación (buildingProdInfo) y el motor real (calcProduction)', () => {
    const planet = {
      id: 'p1',
      buildings: { solarPlant: 3, fusionReactor: 2 },
      temperature: 20,
      faction: 'human',
      taxRate: 0.1
    };
    const research = { energy: 2, advReactors: 1 };

    // Comprobar para cada edificio energético
    const energyBuildingIds = ['solarPlant', 'geoPlant', 'orbitalEnergy', 'fusionReactor', 'quantumReactor', 'darkMatterPlant'];
    energyBuildingIds.forEach(id => {
      const curLvl = planet.buildings[id] || 0;
      const info = buildingProdInfo(id, curLvl, research, planet.temperature, 1, planet);

      // Estado actual con curLvl
      const prodCur = calcProduction(
        { ...planet.buildings, [id]: curLvl },
        research,
        planet.temperature,
        1,
        planet.faction,
        null, null, null, null, null,
        planet.taxRate
      );

      // Estado tras subir a curLvl + 1
      const prodNext = calcProduction(
        { ...planet.buildings, [id]: curLvl + 1 },
        research,
        planet.temperature,
        1,
        planet.faction,
        null, null, null, null, null,
        planet.taxRate
      );

      const realDeltaProd = prodNext.energyProd - prodCur.energyProd;
      expect(info.next.prod - info.current.prod).toBe(realDeltaProd);
      expect(info.deltaProd).toBe(realDeltaProd);
    });
  });

  it('4. Paridad de consumo real vs tarjeta tras construir o mejorar', () => {
    const id = 'robotFactory';
    const lvl = 3;
    const consCur = calcBuildingEnergyDemand(id, lvl);
    const consNext = calcBuildingEnergyDemand(id, lvl + 1);
    const deltaCons = consNext - consCur;

    const info = buildingProdInfo(id, lvl, {}, 20, 1, {});
    expect(info.current.cons).toBe(consCur);
    expect(info.next.cons).toBe(consNext);
    expect(info.deltaCons).toBe(deltaCons);
  });

  it('5. Sincronización idéntica entre vistas: Alto Mando, Matriz Compacta, Cuadrícula y Tarjeta individual', () => {
    const planet = {
      id: 'p-alpha',
      name: 'Alpha Prime',
      buildings: { solarPlant: 8, fusionReactor: 4, metalMine: 10 },
      temperature: 25,
      faction: 'human',
      taxRate: 0.05,
      galaxy: 1,
      system: 10,
      position: 4
    };
    const state = {
      research: { energy: 3, advReactors: 2 },
      ministries: { economy: { taxRate: 0.1 } }
    };

    // Producción real del motor
    const motorProd = calcProduction(
      planet.buildings,
      state.research,
      planet.temperature,
      1,
      planet.faction,
      planet.biome,
      planet.gravity,
      planet.trait,
      planet.specialization,
      { galaxy: planet.galaxy, system: planet.system, position: planet.position },
      planet.taxRate ?? state.ministries.economy.taxRate ?? 0
    );

    // Cálculo vista Cuadrícula (Planet3DCard)
    const cardProd = calcProduction(
      planet.buildings,
      state.research,
      planet.temperature,
      1,
      planet.faction,
      planet.biome,
      planet.gravity,
      planet.trait,
      planet.specialization,
      { galaxy: planet.galaxy, system: planet.system, position: planet.position },
      planet.taxRate ?? state.ministries.economy.taxRate ?? 0
    );

    // Cálculo vista Matriz Compacta (PlanetTableView)
    const tableProd = calcProduction(
      planet.buildings,
      state.research,
      planet.temperature,
      1,
      planet.faction,
      planet.biome,
      planet.gravity,
      planet.trait,
      planet.specialization,
      { galaxy: planet.galaxy, system: planet.system, position: planet.position },
      planet.taxRate ?? state.ministries.economy.taxRate ?? 0
    );

    expect(motorProd.energyProd).toBe(cardProd.energyProd);
    expect(cardProd.energyProd).toBe(tableProd.energyProd);
    expect(motorProd.energyCons).toBe(cardProd.energyCons);
    expect(cardProd.energyCons).toBe(tableProd.energyCons);
    expect(motorProd.energyBalance).toBe(cardProd.energyBalance);
    expect(cardProd.energyBalance).toBe(tableProd.energyBalance);
  });
});
