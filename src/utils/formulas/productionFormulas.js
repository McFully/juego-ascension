import {
  STORAGE_BASE,
  GAME_SPEED,
  BUILDINGS as BASE_BUILDINGS,
  FACTIONS,
  BIOMES,
  GRAVITY_LEVELS,
  PLANET_TRAITS
} from '../../data/gameData.js';
import { EXPANDED_BUILDINGS } from '../../data/expandedContent.js';
import { getPOIAtCoordinates } from './coordinatesFormulas.js';

const BUILDINGS = { ...BASE_BUILDINGS, ...EXPANDED_BUILDINGS };

export const calcBuildingEnergyDemand = (id, lvl) => {
  if (!lvl || lvl <= 0) return 0;
  const b = BUILDINGS[id];
  if (!b || !b.energy) return 0;
  const base = Math.abs(b.energy);
  const factor = b.energyFactor || ((b.cat === 'civil' || b.cat === 'government') ? 1.04 : 1.0);
  if (factor > 1) {
    return Math.floor(base * lvl * Math.pow(factor, lvl));
  }
  return Math.floor(base * lvl);
};

export const calcPlanetMaxPop = (planet) => {
  if (!planet) return 5000;
  const b = planet.buildings || {};
  const prefabLvl = b.prefabHousingUnit || 0;
  const healthCenterLvl = b.healthCenter || 0;
  const bioClinicLvl = b.bioRegenClinic || 0;
  const hydroLvlB = b.urbanHydroponic || 0;
  const waterLvl = b.waterTreatmentPlant || 0;
  const communityLvl = b.communityCenter || 0;
  const biomeDomeLvl = b.biomeDomeSimulation || 0;
  const arcologyLvl = b.arcologyAlpha || 0;

  const bioData = (planet.biome && BIOMES[planet.biome]) ? BIOMES[planet.biome] : {};
  const spaceMod = bioData.buildSpaceMod || 1.0;

  const baseMaxPop = (
    5000 +
    prefabLvl * 12000 +
    healthCenterLvl * 25000 +
    bioClinicLvl * 40000 +
    hydroLvlB * 10000 +
    waterLvl * 10000 +
    communityLvl * 8000 +
    biomeDomeLvl * 80000 +
    arcologyLvl * 200000
  );
  return Math.floor(baseMaxPop * spaceMod);
};

export const storageCapacity = (level) => Math.floor(STORAGE_BASE * 2.5 * Math.exp(20 * level / 33));

export const calcStorage = (buildings, research = {}) => {
  const b = buildings || {};
  const r = research || {};
  const syncedMult = 1 + (r.syncedInventory || 0) * 0.10;
  return {
    metal: Math.floor((storageCapacity(b.metalStorage || 0) + (b.metalMegaStorage || 0) * 500000) * syncedMult),
    crystal: Math.floor((storageCapacity(b.crystalStorage || 0) + (b.crystalMegaStorage || 0) * 500000) * syncedMult),
    deuterium: Math.floor((storageCapacity(b.deutStorage || 0) + (b.deutMegaStorage || 0) * 300000) * syncedMult),
    slag: Math.floor((100000 + (b.metalStorage || 0) * 20000 + (b.metalMegaStorage || 0) * 200000) * syncedMult),
  };
};

export const shipTimeBonus = (b) => 1 + (b.logiCenter || 0) * 0.05 + (b.industrialComplex || 0) * 0.03 + (b.modularFactory || 0) * 0.04 + (b.spacePort || 0) * 0.03 + (b.stealthHangars || 0) * 0.05 + (b.merchantHangar || 0) * 0.04;

export const researchTimeBonus = (b, r = {}) => {
  const buildings = b || {};
  const research = r || {};
  return 1 + (buildings.advResearchCenter || 0) * 0.08 + (buildings.aiCore || 0) * 0.05 + (buildings.nanoCenter || 0) * 0.06 + (buildings.expLab || 0) * 0.07 + (buildings.galacticMarket || 0) * 0.02 + (buildings.quantumSupercomputer || 0) * 0.10 + (buildings.particleAccelerator || 0) * 0.12 + (buildings.centralAiResearch || 0) * 0.15 + (research.quantumNetworks || 0) * 0.05 + (research.cyberIntegration || 0) * 0.05;
};

export const LAB_RESEARCH_BONUS_MULT = 10;

export const calcProduction = (buildings, research, temp, speed = 1, factionKey = 'human', biomeKey = null, gravityIdx = null, trait = null, specialization = null, coords = null, taxRate = 0, relics = []) => {
  const ml = buildings.metalMine || 0;
  const cl = buildings.crystalMine || 0;
  const dl = buildings.deutSynth || 0;
  const sl = buildings.solarPlant || 0;
  const fl = buildings.fusionReactor || 0;
  const gel = buildings.geoPlant || 0;
  const oel = buildings.orbitalEnergy || 0;
  const qrl = buildings.quantumReactor || 0;
  const dmp = buildings.darkMatterPlant || 0;
  const pl = research.plasma || 0;

  const fact = FACTIONS[factionKey] || FACTIONS.human;
  let prodBonus = fact.bonuses.production || 1.0;
  const energyBonus = fact.bonuses.energy || 1.0;
  prodBonus *= (1 + (buildings.geneticLab || 0) * 0.02);
  prodBonus *= (1 + (buildings.townHall || 0) * 0.015);
  prodBonus *= (1 + (buildings.leisureCenter || 0) * 0.01);

  let biomeBonusMetal = 0, biomeBonusCrystal = 0, biomeBonusDeuterium = 0;
  if (biomeKey && BIOMES[biomeKey]) {
    const bio = BIOMES[biomeKey];
    biomeBonusMetal = bio.bonus?.metal || 0;
    biomeBonusMetal += bio.penalty?.metal || 0;
    biomeBonusCrystal = bio.bonus?.crystal || 0;
    biomeBonusCrystal += bio.penalty?.crystal || 0;
    biomeBonusDeuterium = bio.bonus?.deuterium || 0;
    biomeBonusDeuterium += bio.penalty?.deuterium || 0;
  }

  let gravProdMult = 1;
  if (gravityIdx !== null && gravityIdx !== undefined) {
    const idx = Math.floor(Number(gravityIdx));
    if (idx >= 0 && idx < GRAVITY_LEVELS.length) {
      const gLevel = GRAVITY_LEVELS[idx];
      if (gLevel && gLevel.mult) {
        gravProdMult = gLevel.mult.prod;
      }
    }
  }

  let traitBonusMetal = 0, traitBonusCrystal = 0, traitBonusDeuterium = 0, traitMalus = 0;
  if (trait) {
    const eff = trait.effect ? (typeof trait.effect === 'function' ? trait.effect({}) : trait.effect) : {};
    traitBonusMetal = eff.metal || 0;
    traitBonusCrystal = eff.crystal || 0;
    traitBonusDeuterium = eff.deuterium || 0;
    traitMalus = eff.malus || 0;
  }

  const productionFactor = Math.max(0, (1 - (taxRate || 0)));

  const metalBase = 45 * speed * ml * Math.pow(1.1, ml) * productionFactor;
  const crystalBase = 30 * speed * cl * Math.pow(1.1, cl) * productionFactor;
  const tempFactor = 0.7 + (temp || 0) * 0.006;
  const deutBase = 22.5 * speed * dl * Math.pow(1.1, dl) * Math.max(0.5, Math.min(1.3, tempFactor)) * productionFactor;

  const plasmaBonus = 1 + pl * 0.10;
  const miningAutoBonus = 1 + (research.miningAuto || 0) * 0.10;
  const aiProdBonus = 1 + (research.aiProd || 0) * 0.10;
  
  let govMetalMult = 1.0;
  let govCrystalMult = 1.0;
  let govDeutMult = 1.0;

  if (relics && typeof relics === 'object') {
    const mins = relics.ministries || {};
    const ecoMinister = mins.economy?.minister;
    const ecoDirs = mins.economy?.directives || {};
    const ecoUpgrades = relics.ministryUpgrades?.economy || {};

    if (ecoMinister?.bonus === 'metalProd') govMetalMult += 0.15;
    if (ecoDirs.dir_pyme) govCrystalMult += 0.10;
    if (ecoDirs.dir_heavy) { govMetalMult += 0.15; }
    
    if (ecoUpgrades.mining_subsidy) govMetalMult += ecoUpgrades.mining_subsidy * 0.10;
    const infraUpgrades = relics.ministryUpgrades?.infra || {};
    if (infraUpgrades.deep_mines) {
      govMetalMult += infraUpgrades.deep_mines * 0.12;
      govCrystalMult += infraUpgrades.deep_mines * 0.12;
      govDeutMult += infraUpgrades.deep_mines * 0.12;
    }
  }

  const globalTechMult = plasmaBonus * miningAutoBonus * aiProdBonus;

  let metalProd = metalBase * globalTechMult * prodBonus * govMetalMult * (1 + biomeBonusMetal - traitMalus) * gravProdMult;
  let crystalProd = crystalBase * globalTechMult * prodBonus * govCrystalMult * (1 + biomeBonusCrystal - traitMalus) * gravProdMult;
  let deutProd = deutBase * globalTechMult * prodBonus * govDeutMult * (1 + biomeBonusDeuterium - traitMalus) * gravProdMult;

  const refineryLvl = buildings.refinery || 0;
  const vacuumForgeLvl = buildings.vacuumForge || 0;
  const slagRecyclerLvl = buildings.slagRecycler || 0;
  const urbanRecyclerLvl = buildings.urbanGarbageRecycler || 0;
  const automatedMineLvl = buildings.automatedMine || 0;
  const spaceElevatorLvl = buildings.spaceElevator || 0;
  const hyperloopLvl = buildings.hyperloopNetwork || 0;
  const hyperloopMult = 1 + hyperloopLvl * 0.12;

  // Generación bruta horaria de escoria industrial y minera
  const slagFromMetalMine = (metalBase * 0.15);
  const slagFromCrystalMine = (crystalBase * 0.10);
  const slagFromRefinery = (5000 * refineryLvl * 0.18);
  const slagFromVacuumForge = (800 * vacuumForgeLvl * 0.12);
  const slagFromAutomatedMine = (1200 * automatedMineLvl * 0.20);
  const slagFromChemPlant = ((buildings.chemPlant || 0) * 4000 * 0.08);
  const slagFromSiliconPurifier = ((buildings.siliconPurifier || 0) * 700 * 0.08);

  const grossSlagPerHour = Math.round(
    (slagFromMetalMine + slagFromCrystalMine + slagFromRefinery + slagFromVacuumForge + slagFromAutomatedMine + slagFromChemPlant + slagFromSiliconPurifier)
    * speed * productionFactor * hyperloopMult
  );

  // Capacidad de reciclaje activa (slagRecycler y urbanGarbageRecycler)
  const slagRecyclerCap = Math.round(1500 * slagRecyclerLvl * Math.pow(1.15, slagRecyclerLvl));
  const urbanRecyclerCap = Math.round(500 * urbanRecyclerLvl * 1.1);
  const maxRecycleCapPerHour = Math.round((slagRecyclerCap + urbanRecyclerCap) * speed);

  // Tasa de reciclaje efectiva:
  // Si la capacidad excede la generación bruta horaria, el reciclador procesa la generación y consume stock acumulado hasta agotar o satisfacer capacidad
  const effectiveRecyclePerHour = Math.min(grossSlagPerHour, maxRecycleCapPerHour);
  const netSlagPerHour = grossSlagPerHour - maxRecycleCapPerHour;

  // Revalorización circular: 70% a Metal, 25% a Cristal
  const recycledMetalBonus = Math.round(effectiveRecyclePerHour * 0.70);
  const recycledCrystalBonus = Math.round(effectiveRecyclePerHour * 0.25);

  const industryMetalBase = (5000 * refineryLvl + 800 * vacuumForgeLvl + 1200 * automatedMineLvl + 2000 * spaceElevatorLvl) * speed * productionFactor * hyperloopMult + recycledMetalBonus;
  metalProd += industryMetalBase;

  const chemPlantLvl = buildings.chemPlant || 0;
  const siliconPurifierLvl = buildings.siliconPurifier || 0;
  const industryCrystalBase = (4000 * chemPlantLvl + 700 * siliconPurifierLvl) * speed * productionFactor * hyperloopMult + recycledCrystalBonus;
  crystalProd += industryCrystalBase;

  const synthPlantLvl = buildings.synthPlant || 0;
  const enrichPlantLvl = buildings.enrichPlant || 0;
  const heliumExtractorLvl = buildings.heliumExtractor || 0;
  const catalyticDeutLvl = buildings.catalyticDeut || 0;
  const industryDeutBase = (2500 * synthPlantLvl + 3500 * enrichPlantLvl + 600 * heliumExtractorLvl + 500 * catalyticDeutLvl) * speed * productionFactor * hyperloopMult;
  deutProd += industryDeutBase;

  const arcologyLvl = buildings.arcologyAlpha || 0;
  const urbanHydroLvl = buildings.urbanHydroponic || 0;
  const holoLeisureLvl = buildings.holographicLeisure || 0;
  const ecoParkLvl = buildings.geosphericEcoPark || 0;
  const govPalaceLvl = buildings.sectorGovPalace || 0;
  const councilChamberLvl = buildings.councilChamber || 0;
  const resourceAllocLvl = buildings.resourceAllocationMinistry || 0;

  const civProdBoost = 1 + arcologyLvl * 0.02 + urbanHydroLvl * 0.015 + holoLeisureLvl * 0.01 + ecoParkLvl * 0.01 + govPalaceLvl * 0.02 + councilChamberLvl * 0.015 + resourceAllocLvl * 0.025;
  metalProd *= civProdBoost;
  crystalProd *= civProdBoost;
  deutProd *= civProdBoost;

  const quantumNetworksLvl = research.quantumNetworks || 0;
  const cognitiveNetLvl = research.cognitiveNetwork || 0;
  const cyberIntegLvl = research.cyberIntegration || 0;
  const quantumCryptoLvl = research.quantumCrypto || 0;
  const expResearchProdBoost = 1 + quantumNetworksLvl * 0.10 + cognitiveNetLvl * 0.05 + cyberIntegLvl * 0.08 + quantumCryptoLvl * 0.03;
  metalProd *= expResearchProdBoost;
  crystalProd *= expResearchProdBoost;
  deutProd *= expResearchProdBoost;

  let heliumBeltMult = 1.0;
  if (coords && coords.galaxy && coords.system && coords.position) {
    const poi = getPOIAtCoordinates(coords.galaxy, coords.system, coords.position);
    if (poi && poi.type === 'helium_belt') {
      heliumBeltMult = 1.5;
      deutProd *= 1.5;
    }
  }

  const energySaver = Math.max(0.2, 1 - (research.quantumEnergy || 0) * 0.10);

  // Consumo dinámico e integral de todos los edificios en el planeta
  let totalRawEnergyCons = 0;
  for (const [bId, bLvl] of Object.entries(buildings)) {
    if (bLvl > 0 && BUILDINGS[bId]?.energy) {
      totalRawEnergyCons += calcBuildingEnergyDemand(bId, bLvl);
    }
  }

  let energyCons = Math.floor(totalRawEnergyCons * energySaver);

  let specMetalMult = 1.0;
  let specCrystalMult = 1.0;
  let specDeutMult = 1.0;

  if (specialization === 'industrial') {
    specMetalMult = 1.22;
    specCrystalMult = 1.22;
    metalProd *= 1.22;
    crystalProd *= 1.22;
    energyCons = Math.floor(energyCons * 1.12);
  } else if (specialization === 'scientific') {
    specDeutMult = 1.15;
    specMetalMult = 0.90;
    deutProd *= 1.15;
    metalProd *= 0.90;
  } else if (specialization === 'military') {
    specMetalMult = 0.90;
    specCrystalMult = 0.90;
    specDeutMult = 0.90;
    metalProd *= 0.90;
    crystalProd *= 0.90;
    deutProd *= 0.90;
  } else if (specialization === 'commercial') {
    specMetalMult = 1.05;
    specCrystalMult = 1.05;
    specDeutMult = 1.05;
    metalProd *= 1.05;
    crystalProd *= 1.05;
    deutProd *= 1.05;
  }

  const civEnergyMult = (1 + (buildings.healthCenter || 0) * 0.03 + (buildings.civilPowerGrid || 0) * 0.04);
  const energyTechMult = (1 + (research.energy || 0) * 0.10 + (research.fusionMagnetic || 0) * 0.05 + (research.highTempSuperconduct || 0) * 0.06);
  const advReactorsMult = (1 + (research.advReactors || 0) * 0.15 + (research.plasmaResonance || 0) * 0.08);

  const solarEnergyVal = Math.floor(20 * sl * Math.pow(1.1, sl) * energyTechMult);
  const fusionEnergyVal = Math.floor(1000 * fl * Math.pow(1.1, fl) * energyTechMult * advReactorsMult);
  const hydroGeoLvl = buildings.hydrothermalGeothermal || 0;
  const rtgLvl = research.rtgGenerator || 0;
  const rtgBonus = 1 + rtgLvl * 0.05;
  const energyProd = Math.floor((solarEnergyVal + fusionEnergyVal + (75 * gel * Math.pow(1.1, gel) + 120 * hydroGeoLvl * Math.pow(1.1, hydroGeoLvl) + 100 * oel * Math.pow(1.1, oel) + 200 * qrl * Math.pow(1.1, qrl) + 500 * dmp * Math.pow(1.15, dmp))) * energyBonus * civEnergyMult * rtgBonus);
  const leisureEfficiency = Math.max(0.8, 1 - (buildings.leisureCenter || 0) * 0.01 - (buildings.holographicLeisure || 0) * 0.01);
  const adjustedEnergyCons = Math.floor(energyCons * leisureEfficiency);
  const ratio = adjustedEnergyCons > 0 ? Math.min(1, energyProd / adjustedEnergyCons) : 1;

  const fusionCons = fl > 0 ? Math.floor(10 * fl * Math.pow(1.1, fl)) : 0;

  const relicMetalMult = (relics || []).reduce((acc, r) => r.effect?.metalProd ? acc * r.effect.metalProd : acc, 1);
  const relicCrystalMult = (relics || []).reduce((acc, r) => r.effect?.crystalProd ? acc * r.effect.crystalProd : acc, 1);
  const relicEnergyMult = (relics || []).reduce((acc, r) => r.effect?.energyProd ? acc * r.effect.energyProd : acc, 1);
  const relicBuildSpeed = (relics || []).reduce((acc, r) => r.effect?.buildSpeed ? acc * r.effect.buildSpeed : acc, 1);

  const applyRounding = (v) => Math.round(v);

  const finalMetal = applyRounding(metalProd * ratio * relicMetalMult);
  const finalCrystal = applyRounding(crystalProd * ratio * relicCrystalMult);
  const finalDeut = applyRounding(Math.max(0, deutProd * ratio - fusionCons));
  const finalEnergyProd = Math.floor(energyProd * relicEnergyMult);

  const mineMetalFinal = applyRounding(metalBase * globalTechMult * prodBonus * govMetalMult * (1 + biomeBonusMetal - traitMalus) * gravProdMult * civProdBoost * expResearchProdBoost * specMetalMult * ratio * relicMetalMult);
  const industryMetalFinal = applyRounding(industryMetalBase * civProdBoost * expResearchProdBoost * specMetalMult * ratio * relicMetalMult);

  const mineCrystalFinal = applyRounding(crystalBase * globalTechMult * prodBonus * govCrystalMult * (1 + biomeBonusCrystal - traitMalus) * gravProdMult * civProdBoost * expResearchProdBoost * specCrystalMult * ratio * relicCrystalMult);
  const industryCrystalFinal = applyRounding(industryCrystalBase * civProdBoost * expResearchProdBoost * specCrystalMult * ratio * relicCrystalMult);

  const mineDeutFinal = applyRounding(deutBase * globalTechMult * prodBonus * govDeutMult * (1 + biomeBonusDeuterium - traitMalus) * gravProdMult * heliumBeltMult * civProdBoost * expResearchProdBoost * specDeutMult * ratio);
  const industryDeutFinal = applyRounding(industryDeutBase * civProdBoost * expResearchProdBoost * specDeutMult * ratio);

  return {
    metal: finalMetal,
    crystal: finalCrystal,
    deuterium: finalDeut,
    slag: netSlagPerHour,
    slagNet: netSlagPerHour,
    slagGross: grossSlagPerHour,
    slagRecycled: effectiveRecyclePerHour,
    recycledMetal: recycledMetalBonus,
    recycledCrystal: recycledCrystalBonus,
    ecoSustainability: grossSlagPerHour > 0 ? Math.min(100, Math.round((effectiveRecyclePerHour / grossSlagPerHour) * 100)) : 100,
    energyProd: finalEnergyProd,
    energyCons,
    energyBalance: finalEnergyProd - energyCons,
    ratio,
    relicBuildSpeed,
    breakdown: {
      metal: {
        baseMine: Math.round(metalBase),
        mineTotal: mineMetalFinal,
        industry: Math.round(industryMetalBase),
        industryTotal: industryMetalFinal,
        techMult: globalTechMult * expResearchProdBoost,
        govMult: govMetalMult,
        factionMult: prodBonus,
        civMult: civProdBoost,
        biomeMult: (1 + biomeBonusMetal - traitMalus) * gravProdMult,
        specMult: specMetalMult,
        ratio,
        relicMult: relicMetalMult,
        recycledSlagBonus: recycledMetalBonus,
        slagGenerated: Math.round(slagFromMetalMine * speed * productionFactor * hyperloopMult),
        total: finalMetal,
        industryItems: {
          refinery: Math.round(5000 * refineryLvl * speed * productionFactor * hyperloopMult),
          vacuumForge: Math.round(800 * vacuumForgeLvl * speed * productionFactor * hyperloopMult),
          automatedMine: Math.round(1200 * automatedMineLvl * speed * productionFactor * hyperloopMult),
          spaceElevator: Math.round(2000 * spaceElevatorLvl * speed * productionFactor * hyperloopMult)
        },
        details: {
          mineLevel: ml,
          refinery: refineryLvl,
          vacuumForge: vacuumForgeLvl,
          slagRecycler: slagRecyclerLvl,
          automatedMine: automatedMineLvl,
          spaceElevator: spaceElevatorLvl
        }
      },
      crystal: {
        baseMine: Math.round(crystalBase),
        mineTotal: mineCrystalFinal,
        industry: Math.round(industryCrystalBase),
        industryTotal: industryCrystalFinal,
        techMult: globalTechMult * expResearchProdBoost,
        govMult: govCrystalMult,
        factionMult: prodBonus,
        civMult: civProdBoost,
        biomeMult: (1 + biomeBonusCrystal - traitMalus) * gravProdMult,
        specMult: specCrystalMult,
        ratio,
        relicMult: relicCrystalMult,
        recycledSlagBonus: recycledCrystalBonus,
        slagGenerated: Math.round(slagFromCrystalMine * speed * productionFactor * hyperloopMult),
        total: finalCrystal,
        industryItems: {
          chemPlant: Math.round(4000 * chemPlantLvl * speed * productionFactor * hyperloopMult),
          siliconPurifier: Math.round(700 * siliconPurifierLvl * speed * productionFactor * hyperloopMult)
        },
        details: {
          mineLevel: cl,
          chemPlant: chemPlantLvl,
          siliconPurifier: siliconPurifierLvl
        }
      },
      deuterium: {
        baseMine: Math.round(deutBase),
        mineTotal: mineDeutFinal,
        industry: Math.round(industryDeutBase),
        industryTotal: industryDeutFinal,
        techMult: globalTechMult * expResearchProdBoost,
        govMult: govDeutMult,
        factionMult: prodBonus,
        civMult: civProdBoost,
        biomeMult: (1 + biomeBonusDeuterium - traitMalus) * gravProdMult,
        specMult: specDeutMult,
        fusionDeduction: fusionCons,
        ratio,
        slagGenerated: 0,
        total: finalDeut,
        industryItems: {
          synthPlant: Math.round(2500 * synthPlantLvl * speed * productionFactor * hyperloopMult),
          enrichPlant: Math.round(3500 * enrichPlantLvl * speed * productionFactor * hyperloopMult),
          heliumExtractor: Math.round(600 * heliumExtractorLvl * speed * productionFactor * hyperloopMult),
          catalyticDeut: Math.round(500 * catalyticDeutLvl * speed * productionFactor * hyperloopMult)
        },
        details: {
          mineLevel: dl,
          synthPlant: synthPlantLvl,
          enrichPlant: enrichPlantLvl,
          heliumExtractor: heliumExtractorLvl,
          catalyticDeut: catalyticDeutLvl
        }
      },
      slag: {
        total: netSlagPerHour,
        generation: grossSlagPerHour,
        recycleRate: effectiveRecyclePerHour,
        maxRecycleCap: maxRecycleCapPerHour,
        recycledMetal: recycledMetalBonus,
        recycledCrystal: recycledCrystalBonus,
        ecoSustainability: grossSlagPerHour > 0 ? Math.min(100, Math.round((effectiveRecyclePerHour / grossSlagPerHour) * 100)) : 100,
        details: {
          slagRecycler: slagRecyclerLvl,
          urbanRecycler: urbanRecyclerLvl,
          slagFromMetalMine: Math.round(slagFromMetalMine * speed * productionFactor * hyperloopMult),
          slagFromCrystalMine: Math.round(slagFromCrystalMine * speed * productionFactor * hyperloopMult),
          slagFromIndustry: Math.round((slagFromRefinery + slagFromVacuumForge + slagFromAutomatedMine + slagFromChemPlant + slagFromSiliconPurifier) * speed * productionFactor * hyperloopMult)
        }
      },
      energy: {
        solar: solarEnergyVal,
        fusion: fusionEnergyVal,
        others: finalEnergyProd - (solarEnergyVal + fusionEnergyVal),
        totalProd: finalEnergyProd,
        totalCons: energyCons,
        ratio
      }
    }
  };
};
