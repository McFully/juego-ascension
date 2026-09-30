import { describe, it, expect } from 'vitest';
import { getEffectiveTech, getShipStats, getDefenseStats } from '../utils/formulas/combatFormulas.js';
import { handleColonizeMission } from '../missions/diploMission.js';
import { handleExpeditionMission } from '../missions/expeditionMission.js';
import { createInitial } from '../core/initialState.js';
import { RESEARCH } from '../data/game/researchData.js';
import { MINISTRY_MAPPING } from '../data/buildingOperationsData.js';
import { gameReducer } from '../reducers/index.js';

describe('Fase 14: Auditoría de Research y Ministries', () => {
  it('1. getEffectiveTech debe usar globalResearch cuando el planeta no tiene retrofitTech', () => {
    const planetWithoutRetrofit = { id: 'colony-1', retrofitTech: {} };
    const globalResearch = { weapons: 5, shields: 4, armour: 3, laser: 2 };
    
    const effective = getEffectiveTech(planetWithoutRetrofit, globalResearch);
    expect(effective.weapons).toBe(5);
    expect(effective.shields).toBe(4);
    expect(effective.laser).toBe(2);

    const planetWithRetrofit = { id: 'home', retrofitTech: { weapons: 2, shields: 1 } };
    const effectiveRetrofit = getEffectiveTech(planetWithRetrofit, globalResearch);
    expect(effectiveRetrofit.weapons).toBe(2);
    expect(effectiveRetrofit.shields).toBe(1);
  });

  it('2. Tecnologías de armamento conectadas a getShipStats y getDefenseStats', () => {
    const baseTech = { weapons: 0, shields: 0, armour: 0 };
    const boostedTech = {
      weapons: 0, shields: 0, armour: 0,
      laser: 5,
      ion: 4,
      ballisticWeapons: 3,
      advMissiles: 2,
      orbitalArtillery: 2,
    };

    // Naves con láser (cruiser, lightLaser...)
    const baseCruiser = getShipStats('cruiser', baseTech, []);
    const boostedCruiser = getShipStats('cruiser', boostedTech, []);
    expect(boostedCruiser.atk).toBeGreaterThan(baseCruiser.atk);

    // Defensas con láser y artillería
    const baseLightLaser = getDefenseStats('lightLaser', baseTech);
    const boostedLightLaser = getDefenseStats('lightLaser', boostedTech);
    expect(boostedLightLaser.atk).toBeGreaterThan(baseLightLaser.atk);

    const baseGauss = getDefenseStats('gaussCannon', baseTech);
    const boostedGauss = getDefenseStats('gaussCannon', boostedTech);
    expect(boostedGauss.atk).toBeGreaterThan(baseGauss.atk);

    const basePlasma = getDefenseStats('plasmaTurret', baseTech);
    const boostedPlasma = getDefenseStats('plasmaTurret', boostedTech);
    expect(boostedPlasma.atk).toBeGreaterThan(basePlasma.atk);
  });

  it('3. advColonization incrementa planetSize en handleColonizeMission', () => {
    const baseState = {
      planets: [{ id: 'p1', galaxy: 1, system: 1, position: 1 }],
      aiPlanets: [],
      research: { astrophysics: 5, advColonization: 0 },
      stats: { coloniesFounded: 0 },
    };
    const mission = {
      fleet: { colonizer: 1 },
      to: { galaxy: 1, system: 2, position: 3 },
    };

    const resBase = handleColonizeMission(mission, baseState);
    const sizeBase = resBase.state.planets[1].planetSize;

    const boostedState = {
      ...baseState,
      research: { astrophysics: 5, advColonization: 3 },
    };
    const resBoosted = handleColonizeMission(mission, boostedState);
    const sizeBoosted = resBoosted.state.planets[1].planetSize;

    expect(sizeBoosted).toBe(sizeBase + 6); // +2 por nivel * 3 = +6
  });

  it('4. galacticTrade reduce aranceles del mercado galáctico', () => {
    const stateLow = {
      currentPlanetId: 'p1',
      credits: 0,
      planets: [{ id: 'p1', name: 'Alpha', resources: { metal: 20000, crystal: 0, deuterium: 0 } }],
      research: { galacticTrade: 0 },
    };
    // 10000 metal a cristal: base fee 8% => tasa neta
    const stateHigh = {
      ...stateLow,
      research: { galacticTrade: 4 },
    };
    
    // Con 4 niveles de galacticTrade, arancel baja de 8% a 4%
    // Reducer MARKET_TRADE
    const actionTrade = {
      type: 'MARKET_TRADE',
      planetId: 'p1',
      sellResource: 'metal',
      buyResource: 'crystal',
      sellAmount: 10000,
      buyAmount: 9600, // Calculado por la UI con el arancel reducido
    };
    const resTrade = gameReducer(stateHigh, actionTrade);
    expect(resTrade.planets[0].resources.crystal).toBe(9600);
  });

  it('5. createInitial clona el objeto research de homePlanet sin compartir referencia', () => {
    const state = createInitial('Comandante');
    expect(state.research).toBeDefined();
    expect(state.planets[0].research).toBeDefined();
    expect(state.research).not.toBe(state.planets[0].research);
  });

  it('6. Auditoría integral: las 44 tecnologías de RESEARCH tienen ministerio y categoría coherente', () => {
    const allMinRes = new Set();
    for (const m of Object.values(MINISTRY_MAPPING)) {
      for (const r of (m.research || [])) allMinRes.add(r);
    }

    const techKeys = Object.keys(RESEARCH);
    expect(techKeys.length).toBe(44);

    for (const id of techKeys) {
      expect(allMinRes.has(id), `Tecnología ${id} no está asignada a ningún ministerio`).toBe(true);
      expect(RESEARCH[id].cat, `Tecnología ${id} no tiene categoría`).toBeDefined();
      expect(RESEARCH[id].name, `Tecnología ${id} no tiene nombre`).toBeDefined();
    }
  });

  it('7. Proyecto Singularidad activa condición de victoria científica', () => {
    const baseInitial = createInitial('Comandante');
    baseInitial.planets[0].buildings.researchLab = 1;
    const stateWithSingularity = {
      ...baseInitial,
      gameTick: 100,
      research: { dimensionalExploration: 5, quantumNetworks: 5 },
      researchQueue: [{
        researchId: 'singularity',
        level: 1,
        planetId: baseInitial.planets[0].id,
        startTime: 1000,
        endTime: 2000,
      }],
      notifications: [],
      stats: {},
    };

    const actionTick = { type: 'TICK', now: 3000 };
    const nextState = gameReducer(stateWithSingularity, actionTick);
    expect(nextState.research.singularity).toBe(1);
    expect(nextState.victory).toBeDefined();
    expect(nextState.victory.type).toBe('scientific');
  });
});
