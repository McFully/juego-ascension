import {
  TICK_MS,
  STORAGE_BASE,
  GAME_SPEED,
  BUILDINGS as BASE_BUILDINGS,
  RESEARCH as BASE_RESEARCH,
  SHIPS,
  DEFENSES,
  SHIP_CHASSIS,
  SHIP_WEAPONS,
  SHIP_ENGINES,
  SHIP_SHIELDS,
  SHIP_MODULES,
  FACTIONS,
  BIOMES,
  GRAVITY_LEVELS,
  PLANET_TRAITS
} from '../data/gameData.js';
import { EXPANDED_BUILDINGS, EXPANDED_RESEARCH } from '../data/expandedContent.js';

// ============ DATOS FUSIONADOS (fuente única) ============
const BUILDINGS = { ...BASE_BUILDINGS, ...EXPANDED_BUILDINGS };
const RESEARCH = { ...BASE_RESEARCH, ...EXPANDED_RESEARCH };

// ============ UTILIDADES ============
export const fmt = (n, opts = {}) => {
  if (n == null || isNaN(n)) return '0';
  const num = Math.floor(n);
  
  if (opts.full || num < 10000) {
    return num.toLocaleString();
  }
  
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toLocaleString();
};

export const fmtTime = (sec) => {
  if (sec <= 0) return '0s';
  sec = Math.floor(sec);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export const uid = () => Math.random().toString(36).slice(2, 11);

export const getGalacticAlignment = (reputation) => {
  const r = reputation || 0;
  if (r > 70) return { title: 'Emisario de la Paz', color: 'text-emerald-400', icon: 'auto_awesome' };
  if (r >= 30) return { title: 'Guardián Galáctico', color: 'text-cyan-400', icon: 'shield' };
  if (r >= -30) return { title: 'Líder Neutral', color: 'text-slate-400', icon: 'balance' };
  if (r >= -70) return { title: 'Pirata del Sector', color: 'text-amber-500', icon: 'sailing' };
  return { title: 'Azote Estelar', color: 'text-rose-500', icon: 'skull' };
};

export const getPOIAtCoordinates = (galaxy, system, position) => {
  const seed = (galaxy * 10000) + (system * 100) + position;
  const hash = Math.sin(seed) * 10000;
  const rand = hash - Math.floor(hash);

  if (rand < 0.15) {
    if (rand < 0.05) {
      return {
        type: 'wormhole',
        name: 'Agujero de Gusano',
        icon: '🌀',
        desc: 'Una singularidad estable que pliega el espacio-tiempo. Los viajes hacia este sistema consumen un 50% menos de Deuterio y tardan un 50% menos.'
      };
    } else if (rand < 0.10) {
      return {
        type: 'helium_belt',
        name: 'Cinturón de Helio-3',
        icon: '🌌',
        desc: 'Una densa corriente de gases interestelares ricos en Helio-3. La producción de Deuterio en las colonias fundadas aquí aumenta un 50%.'
      };
    } else {
      return {
        type: 'precursor_ruins',
        name: 'Ruinas Ancestrales',
        icon: '🏛️',
        desc: 'Estructuras abandonadas de una civilización extinta altamente avanzada. Las expediciones a este sistema tienen el doble de probabilidad de encontrar tecnología o naves abandonadas.'
      };
    }
  }
  return null;
};

// ============ FÓRMULAS ============
export const buildingCost = (id, lvl, constructionCenterLvl = 0) => {
  const b = BUILDINGS[id];
  const COST_MULT = 1; // coste base completo (100%)
  const discount = constructionDiscount(constructionCenterLvl);
  return {
    metal: Math.floor(b.cost.m * Math.pow(b.factor, lvl) * COST_MULT * discount),
    crystal: Math.floor(b.cost.c * Math.pow(b.factor, lvl) * COST_MULT * discount),
    deuterium: Math.floor((b.cost.d || 0) * Math.pow(b.factor, lvl) * COST_MULT * discount),
  };
};

export const constructionDiscount = (constructionCenterLvl = 0) => Math.pow(0.5, constructionCenterLvl || 0); // Divide a la mitad los recursos de TODAS las tarjetas por cada nivel de Centro de Construcciones
export const aiResearchDiscount = (aiStrategyLvl = 0) => Math.pow(0.75, aiStrategyLvl || 0); // Descuento bestial por nivel de IA Estratégica

export const researchCost = (id, lvl, aiStrategyLvl = 0, constructionCenterLvl = 0) => {
  const r = RESEARCH[id];
  const COST_MULT = 1; // coste base completo (100%)
  const discount = aiResearchDiscount(aiStrategyLvl) * constructionDiscount(constructionCenterLvl);
  return {
    metal: Math.floor(r.cost.m * Math.pow(r.factor, lvl) * COST_MULT * discount),
    crystal: Math.floor(r.cost.c * Math.pow(r.factor, lvl) * COST_MULT * discount),
    deuterium: Math.floor((r.cost.d || 0) * Math.pow(r.factor, lvl) * COST_MULT * discount),
  };
};

export const shipCost = (id, qty = 1, constructionCenterLvl = 0) => {
  const d = constructionDiscount(constructionCenterLvl);
  return {
    metal: SHIPS[id].cost.m * qty * d,
    crystal: SHIPS[id].cost.c * qty * d,
    deuterium: (SHIPS[id].cost.d || 0) * qty * d,
  };
};

export const defenseCost = (id, qty = 1, constructionCenterLvl = 0) => {
  const d = constructionDiscount(constructionCenterLvl);
  return {
    metal: DEFENSES[id].cost.m * qty * d,
    crystal: DEFENSES[id].cost.c * qty * d,
    deuterium: (DEFENSES[id].cost.d || 0) * qty * d,
  };
};

export const canAfford = (res, cost) => {
  if ((cost.metal || 0) < 0 || (cost.crystal || 0) < 0 || (cost.deuterium || 0) < 0) return false;
  return (res.metal || 0) >= (cost.metal || 0) &&
         (res.crystal || 0) >= (cost.crystal || 0) &&
         (res.deuterium || 0) >= (cost.deuterium || 0);
};

export const deduct = (res, cost) => ({
  metal: Math.max(0, (res.metal || 0) - (cost.metal || 0)),
  crystal: Math.max(0, (res.crystal || 0) - (cost.crystal || 0)),
  deuterium: Math.max(0, (res.deuterium || 0) - (cost.deuterium || 0)),
});

export const calcResourceValueForAI = (aiPlanet, offer) => {
  let metalWeight = 1.0;
  let crystalWeight = 2.0;
  let deutWeight = 4.0;
  let influenceWeight = 15.0;

  if (aiPlanet.biome === 'volcanic' || aiPlanet.biome === 'desert') {
    deutWeight *= 1.8;
    crystalWeight *= 1.2;
  } else if (aiPlanet.biome === 'ice' || aiPlanet.biome === 'frozen') {
    metalWeight *= 1.6;
  } else if (aiPlanet.biome === 'gas' || aiPlanet.biome === 'oceanic') {
    metalWeight *= 1.5;
    crystalWeight *= 1.5;
  }

  if (aiPlanet.strategy === 'militarist' || aiPlanet.strategy === 'expansionist') {
    metalWeight *= 1.3;
    deutWeight *= 1.4;
  } else if (aiPlanet.strategy === 'technocrat') {
    crystalWeight *= 1.6;
  } else if (aiPlanet.strategy === 'merchant') {
    influenceWeight *= 0.8;
  } else if (aiPlanet.strategy === 'diplomat') {
    influenceWeight *= 1.5;
  }

  const rel = aiPlanet.relation || 0;
  let relFactor = 1.0;
  if (rel >= 60) relFactor = 0.85;
  else if (rel <= -30) relFactor = 1.3;

  const rawValue = (offer.metal || 0) * metalWeight +
                    (offer.crystal || 0) * crystalWeight +
                    (offer.deuterium || 0) * deutWeight +
                    (offer.influence || 0) * influenceWeight;

  return rawValue * relFactor;
};

export const clampResources = (res) => ({
  metal: Math.max(0, res.metal || 0),
  crystal: Math.max(0, res.crystal || 0),
  deuterium: Math.max(0, res.deuterium || 0),
});

export const meetsReq = (req, research) => {
  if (!req) return true;
  return Object.entries(req).every(([k, v]) => (research[k] || 0) >= v);
};

export const storageCapacity = (level) => Math.floor(STORAGE_BASE * 2.5 * Math.exp(20 * level / 33));

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
    const eff = trait.effect ? trait.effect({}) : {};
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

  const plasmaBonus = 1 + pl * 0.10; // +10% por nivel de tecnología plasma
  const miningAutoBonus = 1 + (research.miningAuto || 0) * 0.10; // +10% por nivel de automatización minera
  const aiProdBonus = 1 + (research.aiProd || 0) * 0.10; // +10% por nivel de IA de producción
  
  // === INTEGRACIÓN DE MINISTROS Y DIRECTIVAS ===
  let govMetalMult = 1.0;
  let govCrystalMult = 1.0;
  let govDeutMult = 1.0;

  if (relics && typeof relics === 'object') {
    // Si relics pasa el objeto state o mins
    const mins = relics.ministries || {};
    const ecoMinister = mins.economy?.minister;
    const ecoDirs = mins.economy?.directives || {};
    const ecoUpgrades = relics.ministryUpgrades?.economy || {};

    if (ecoMinister?.bonus === 'metalProd') govMetalMult += 0.15;
    if (ecoDirs.dir_pyme) govCrystalMult += 0.10;
    if (ecoDirs.dir_heavy) { govMetalMult += 0.15; }
    
    // Programas de economía (mining_subsidy, deep_mines)
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

  // === RECOMPENSAS ADICIONALES DE EDIFICIOS EXPANDIDOS (RECURSOS) ===
  const vacuumForgeLvl = buildings.vacuumForge || 0;
  const slagRecyclerLvl = buildings.slagRecycler || 0;
  const automatedMineLvl = buildings.automatedMine || 0;
  const spaceElevatorLvl = buildings.spaceElevator || 0;
  metalProd += (800 * vacuumForgeLvl + 200 * slagRecyclerLvl + 1200 * automatedMineLvl + 2000 * spaceElevatorLvl) * speed * productionFactor;

  const siliconPurifierLvl = buildings.siliconPurifier || 0;
  crystalProd += (700 * siliconPurifierLvl) * speed * productionFactor;

  const heliumExtractorLvl = buildings.heliumExtractor || 0;
  const catalyticDeutLvl = buildings.catalyticDeut || 0;
  deutProd += (600 * heliumExtractorLvl + 500 * catalyticDeutLvl) * speed * productionFactor;

  // === RECOMPENSAS ADICIONALES DE EDIFICIOS EXPANDIDOS (CIVILES Y GOBIERNO) ===
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

  // === RECOMPENSAS DE INVESTIGACIONES EXPANDIDAS (PRODUCCIÓN & RECURSOS) ===
  const quantumNetworksLvl = research.quantumNetworks || 0;
  const cognitiveNetLvl = research.cognitiveNetwork || 0;
  const cyberIntegLvl = research.cyberIntegration || 0;
  const quantumCryptoLvl = research.quantumCrypto || 0;
  const expResearchProdBoost = 1 + quantumNetworksLvl * 0.10 + cognitiveNetLvl * 0.05 + cyberIntegLvl * 0.08 + quantumCryptoLvl * 0.03;
  metalProd *= expResearchProdBoost;
  crystalProd *= expResearchProdBoost;
  deutProd *= expResearchProdBoost;

  if (coords && coords.galaxy && coords.system && coords.position) {
    const poi = getPOIAtCoordinates(coords.galaxy, coords.system, coords.position);
    if (poi && poi.type === 'helium_belt') {
      deutProd *= 1.5;
    }
  }

  const energySaver = Math.max(0.2, 1 - (research.quantumEnergy || 0) * 0.10);
  const vacuumForgeCons = vacuumForgeLvl * 40;
  const siliconPurifierCons = siliconPurifierLvl * 40;
  const heliumExtractorCons = heliumExtractorLvl * 35;
  const catalyticDeutCons = catalyticDeutLvl * 45;
  const slagRecyclerCons = slagRecyclerLvl * 15;
  const automatedMineCons = automatedMineLvl * 80;
  const expandedEnergyCons = vacuumForgeCons + siliconPurifierCons + heliumExtractorCons + catalyticDeutCons + slagRecyclerCons + automatedMineCons;
  
  let energyCons = Math.floor(((10 * ml * Math.pow(1.1, ml) + 10 * cl * Math.pow(1.1, cl) + 20 * dl * Math.pow(1.1, dl)) * energySaver) + expandedEnergyCons);

  if (specialization === 'industrial') {
    metalProd *= 1.22;
    crystalProd *= 1.22;
    energyCons = Math.floor(energyCons * 1.12);
  } else if (specialization === 'scientific') {
    deutProd *= 1.15;
    metalProd *= 0.90;
  } else if (specialization === 'military') {
    metalProd *= 0.90;
    crystalProd *= 0.90;
    deutProd *= 0.90;
  } else if (specialization === 'commercial') {
    metalProd *= 1.05;
    crystalProd *= 1.05;
    deutProd *= 1.05;
  }

  const civEnergyMult = (1 + (buildings.healthCenter || 0) * 0.03 + (buildings.civilPowerGrid || 0) * 0.04);
  const energyTechMult = (1 + (research.energy || 0) * 0.10 + (research.fusionMagnetic || 0) * 0.05 + (research.highTempSuperconduct || 0) * 0.06); // +10% de energía global por cada nivel de investigación en Energía
  const advReactorsMult = (1 + (research.advReactors || 0) * 0.15 + (research.plasmaResonance || 0) * 0.08); // +15% por nivel de Reactores Avanzados en Fusión

  const solarEnergyVal = Math.floor(20 * sl * Math.pow(1.1, sl) * energyTechMult);
  const fusionEnergyVal = Math.floor(1000 * fl * Math.pow(1.1, fl) * energyTechMult * advReactorsMult);
  const hydroGeoLvl = buildings.hydrothermalGeothermal || 0;
  const rtgLvl = research.rtgGenerator || 0;
  const rtgBonus = 1 + rtgLvl * 0.05;
  const energyProd = Math.floor((solarEnergyVal + fusionEnergyVal + (30 * gel * Math.pow(1.1, gel) + 120 * hydroGeoLvl * Math.pow(1.1, hydroGeoLvl) + 100 * oel * Math.pow(1.1, oel) + 200 * qrl * Math.pow(1.1, qrl) + 500 * dmp * Math.pow(1.15, dmp))) * energyBonus * civEnergyMult * rtgBonus);
  const leisureEfficiency = Math.max(0.8, 1 - (buildings.leisureCenter || 0) * 0.01 - (buildings.holographicLeisure || 0) * 0.01);
  const adjustedEnergyCons = Math.floor(energyCons * leisureEfficiency);
  const ratio = adjustedEnergyCons > 0 ? Math.min(1, energyProd / adjustedEnergyCons) : 1;

  const fusionCons = fl > 0 ? Math.floor(10 * fl * Math.pow(1.1, fl)) : 0;

  // Apply relic bonuses
  const relicMetalMult = (relics || []).reduce((acc, r) => r.effect?.metalProd ? acc * r.effect.metalProd : acc, 1);
  const relicCrystalMult = (relics || []).reduce((acc, r) => r.effect?.crystalProd ? acc * r.effect.crystalProd : acc, 1);
  const relicEnergyMult = (relics || []).reduce((acc, r) => r.effect?.energyProd ? acc * r.effect.energyProd : acc, 1);
  const relicBuildSpeed = (relics || []).reduce((acc, r) => r.effect?.buildSpeed ? acc * r.effect.buildSpeed : acc, 1);

  const applyRounding = (v) => Math.round(v);

  return {
    metal: applyRounding(metalProd * ratio * relicMetalMult),
    crystal: applyRounding(crystalProd * ratio * relicCrystalMult),
    deuterium: applyRounding(Math.max(0, deutProd * ratio - fusionCons)),
    energyProd: Math.floor(energyProd * relicEnergyMult), energyCons, energyBalance: Math.floor(energyProd * relicEnergyMult) - energyCons, ratio,
    relicBuildSpeed,
  };
};

export const calcStorage = (buildings, research = {}) => {
  const b = buildings || {};
  const r = research || {};
  const syncedMult = 1 + (r.syncedInventory || 0) * 0.10;
  return {
    metal: Math.floor((storageCapacity(b.metalStorage || 0) + (b.metalMegaStorage || 0) * 500000) * syncedMult),
    crystal: Math.floor((storageCapacity(b.crystalStorage || 0) + (b.crystalMegaStorage || 0) * 500000) * syncedMult),
    deuterium: Math.floor((storageCapacity(b.deutStorage || 0) + (b.deutMegaStorage || 0) * 300000) * syncedMult),
  };
};

export const shipTimeBonus = (b) => 1 + (b.logiCenter || 0) * 0.05 + (b.industrialComplex || 0) * 0.03 + (b.modularFactory || 0) * 0.04 + (b.spacePort || 0) * 0.03 + (b.stealthHangars || 0) * 0.05 + (b.merchantHangar || 0) * 0.04;
export const researchTimeBonus = (b, r = {}) => {
  const buildings = b || {};
  const research = r || {};
  return 1 + (buildings.advResearchCenter || 0) * 0.08 + (buildings.aiCore || 0) * 0.05 + (buildings.nanoCenter || 0) * 0.06 + (buildings.expLab || 0) * 0.07 + (buildings.galacticMarket || 0) * 0.02 + (buildings.quantumSupercomputer || 0) * 0.10 + (buildings.particleAccelerator || 0) * 0.12 + (buildings.centralAiResearch || 0) * 0.15 + (research.quantumNetworks || 0) * 0.05 + (research.cyberIntegration || 0) * 0.05;
};
export const LAB_RESEARCH_BONUS_MULT = 10;

export const calcCustomShipCost = (blueprint, constructionCenterLvl = 0) => {
  const chassis = SHIP_CHASSIS[blueprint.chassis];
  const weapon = SHIP_WEAPONS[blueprint.weapon];
  const engine = SHIP_ENGINES[blueprint.engine];
  const shield = SHIP_SHIELDS[blueprint.shield];
  const mods = (blueprint.modules || []).map(m => SHIP_MODULES[m]);
  if (!chassis) return { metal: 0, crystal: 0, deuterium: 0 };
  let metal = chassis.cost.m, crystal = chassis.cost.c, deut = chassis.cost.d;
  if (weapon) { metal += weapon.cost.m; crystal += weapon.cost.c; deut += weapon.cost.d; }
  if (engine) { metal += engine.cost.m; crystal += engine.cost.c; deut += engine.cost.d; }
  if (shield) { metal += shield.cost.m; crystal += shield.cost.c; deut += shield.cost.d; }
  mods.forEach(m => { if (m) { metal += m.cost.m; crystal += m.cost.c; deut += m.cost.d; } });

  if (blueprint.modules?.includes('ionDeflector')) {
    crystal = Math.round(crystal * 1.20);
  }
  if (blueprint.modules?.includes('plasmaInjector')) {
    deut = Math.round(deut * 1.25);
  }

  const d = constructionDiscount(constructionCenterLvl);
  return { metal: metal * d, crystal: crystal * d, deuterium: deut * d };
};

export const calcCustomShipTime = (blueprint, shipyard, nanite, speed = 1, bonus = 1) => {
  const cost = calcCustomShipCost(blueprint);
  const totalCost = cost.metal + cost.crystal;
  const shipyardReduction = 1 + shipyard * 0.5;
  const t = (totalCost / (2500 * shipyardReduction * (1 + nanite * 0.5) * speed * bonus)) * 3600;
  return Math.max(1, Math.floor(t));
};

export const calcCustomShipStats = (blueprint) => {
  const chassis = SHIP_CHASSIS[blueprint.chassis];
  const weapon = SHIP_WEAPONS[blueprint.weapon];
  const engine = SHIP_ENGINES[blueprint.engine];
  const shield = SHIP_SHIELDS[blueprint.shield];
  const mods = (blueprint.modules || []).map(m => SHIP_MODULES[m]);
  if (!chassis) return { atk: 0, shd: 0, hull: 0, speed: 0, cargo: 0, energy: 0, slotsUsed: 0, slotsMax: 0 };
  let atk = weapon?.atk || 0, shd = shield?.shd || 0;
  let hull = chassis.hull, speed = engine?.speed || 1000, cargo = chassis.cargo;
  let energy = (weapon?.energy || 0) + (engine?.energy || 0) + (shield?.energy || 0);
  let slotsUsed = (weapon?.slots || 0) + (engine?.slots || 0) + (shield?.slots || 0);
  let stealth = 0;
  mods.forEach(m => {
    if (!m) return;
    slotsUsed += m.slots;
    if (m.bonus) {
      if (m.bonus.hull) hull += m.bonus.hull;
      if (m.bonus.cargo) cargo += m.bonus.cargo;
      if (m.bonus.speed) speed += m.bonus.speed;
      if (m.bonus.atk) atk += m.bonus.atk;
      if (m.bonus.shd) shd += m.bonus.shd;
      if (m.bonus.energy) energy += m.bonus.energy;
      if (m.bonus.stealth) stealth += m.bonus.stealth;
    }
  });

  if (blueprint.modules?.includes('ionDeflector')) {
    shd = Math.round(shd * 1.40);
  }
  if (blueprint.modules?.includes('plasmaInjector')) {
    speed = Math.round(speed * 1.35);
  }
  if (blueprint.modules?.includes('gaussBattery')) {
    atk = Math.round(atk * 1.50);
    speed = Math.round(speed * 0.85);
  }
  if (blueprint.modules?.includes('stealthModule')) {
    speed = Math.round(speed * 0.92);
  }
  if (blueprint.modules?.includes('tradeModule')) {
    cargo = Math.round(cargo * 1.5);
  }

  return { atk, shd, hull, speed, cargo, energy, slotsUsed, slotsMax: chassis.slots, stealth };
};

export const buildingProdInfo = (id, lvl, research = {}, temp = 20, speed = GAME_SPEED, planet = {}) => {
  const b = BUILDINGS[id];
  if (!b) return null;
  
  const pl = research.plasma || 0;
  const miningAuto = research.miningAuto || 0;
  const aiProd = research.aiProd || 0;
  const globalTechMult = (1 + pl * 0.10) * (1 + miningAuto * 0.10) * (1 + aiProd * 0.10);

  // Bonus/malus planetarios e imperiales idénticos a calcProduction
  let prodBonus = (FACTIONS[planet.faction] || FACTIONS.human).bonuses.production || 1.0;
  if (planet.buildings) {
    prodBonus *= (1 + (planet.buildings.geneticLab || 0) * 0.02);
    prodBonus *= (1 + (planet.buildings.townHall || 0) * 0.015);
    prodBonus *= (1 + (planet.buildings.leisureCenter || 0) * 0.01);
  }
  const biomeBonusMetal = planet.biome ? (BIOMES[planet.biome]?.metalBonus || 0) : 0;
  const biomeBonusCrystal = planet.biome ? (BIOMES[planet.biome]?.crystalBonus || 0) : 0;
  const biomeBonusDeuterium = planet.biome ? (BIOMES[planet.biome]?.deuteriumBonus || 0) : 0;
  const gravProdMult = planet.gravity ? (1 + Math.max(-0.2, Math.min(0.2, (1.0 - planet.gravity) * 0.1))) : 1;

  let traitMalus = 0;
  if (planet.trait) {
    const eff = PLANET_TRAITS[planet.trait]?.effect || {};
    traitMalus = eff.malus || 0;
  }
  const productionFactor = Math.max(0, (1 - (planet.taxRate || 0)));

  let specMetal = 1.0;
  let specCrystal = 1.0;
  let specDeut = 1.0;

  if (planet.specialization === 'industrial') {
    specMetal = 1.22;
    specCrystal = 1.22;
  } else if (planet.specialization === 'scientific') {
    specDeut = 1.15;
    specMetal = 0.90;
  } else if (planet.specialization === 'military') {
    specMetal = 0.90;
    specCrystal = 0.90;
    specDeut = 0.90;
  } else if (planet.specialization === 'commercial') {
    specMetal = 1.05;
    specCrystal = 1.05;
    specDeut = 1.05;
  }

  // Calcular la producción energética total y ratio de energía actual del planeta
  const sl = planet.buildings?.solarPlant || 0;
  const fl = planet.buildings?.fusionReactor || 0;
  const gel = planet.buildings?.geoPlant || 0;
  const oel = planet.buildings?.orbitalEnergy || 0;
  const qrl = planet.buildings?.quantumReactor || 0;
  const dmp = planet.buildings?.darkMatterPlant || 0;
  const ml = planet.buildings?.metalMine || 0;
  const cl = planet.buildings?.crystalMine || 0;
  const dl = planet.buildings?.deutSynth || 0;

  const energyTechMult = (1 + (research.energy || 0) * 0.10);
  const advReactorsMult = (1 + (research.advReactors || 0) * 0.15);
  const solarEnergyVal = Math.floor(20 * sl * Math.pow(1.1, sl) * energyTechMult);
  const fusionEnergyVal = Math.floor(1000 * fl * Math.pow(1.1, fl) * energyTechMult * advReactorsMult);
  const energyBonus = (FACTIONS[planet.faction] || FACTIONS.human).bonuses.energy || 1.0;
  const civEnergyMult = (1 + (planet.buildings?.healthCenter || 0) * 0.03);
  const energyProd = Math.floor((solarEnergyVal + fusionEnergyVal + (30 * gel * Math.pow(1.1, gel) + 100 * oel * Math.pow(1.1, oel) + 200 * qrl * Math.pow(1.1, qrl) + 500 * dmp * Math.pow(1.15, dmp))) * energyBonus * civEnergyMult);

  const energySaver = Math.max(0.2, 1 - (research.quantumEnergy || 0) * 0.10);
  const energyCons = Math.floor((10 * ml * Math.pow(1.1, ml) + 10 * cl * Math.pow(1.1, cl) + 20 * dl * Math.pow(1.1, dl)) * energySaver);
  const leisureEfficiency = Math.max(0.8, 1 - (planet.buildings?.leisureCenter || 0) * 0.01);
  const adjustedEnergyCons = Math.floor(energyCons * leisureEfficiency);
  const ratio = adjustedEnergyCons > 0 ? Math.min(1, energyProd / adjustedEnergyCons) : 1;

  const compute = (l) => {
    if (b.prod === 'metal') {
      const base = (b.baseProd ? b.baseProd * 1.5 : 45);
      const energy = Math.abs(b.energy || 10);
      const metalProd = base * speed * l * Math.pow(1.1, l) * productionFactor * globalTechMult * prodBonus * (1 + biomeBonusMetal - traitMalus) * gravProdMult * specMetal * ratio;
      return {
        type: 'mine',
        resource: 'metal',
        resourceIcon: '⛏️',
        prod: l > 0 ? Math.round(metalProd) : 0,
        cons: l > 0 ? Math.floor(energy * l * Math.pow(1.1, l)) : 0,
        consType: 'energy',
        consIcon: '⚡',
      };
    }
    if (b.prod === 'crystal') {
      const base = (b.baseProd ? b.baseProd * 1.5 : 30);
      const energy = Math.abs(b.energy || 10);
      const crystalProd = base * speed * l * Math.pow(1.1, l) * productionFactor * globalTechMult * prodBonus * (1 + biomeBonusCrystal - traitMalus) * gravProdMult * specCrystal * ratio;
      return {
        type: 'mine',
        resource: 'crystal',
        resourceIcon: '💎',
        prod: l > 0 ? Math.round(crystalProd) : 0,
        cons: l > 0 ? Math.floor(energy * l * Math.pow(1.1, l)) : 0,
        consType: 'energy',
        consIcon: '⚡',
      };
    }
    if (b.prod === 'deuterium') {
      const base = (b.baseProd ? b.baseProd * 1.5 : 22.5);
      const energy = Math.abs(b.energy || 20);
      const tempFactor = 0.7 + temp * 0.006;
      let deutProd = base * speed * l * Math.pow(1.1, l) * Math.max(0.5, Math.min(1.3, tempFactor)) * productionFactor * globalTechMult * prodBonus * (1 + biomeBonusDeuterium - traitMalus) * gravProdMult * specDeut * ratio;
      if (planet.galaxy && planet.system && planet.position) {
        const poi = getPOIAtCoordinates(planet.galaxy, planet.system, planet.position);
        if (poi && poi.type === 'helium_belt') deutProd *= 1.5;
      }
      return {
        type: 'mine',
        resource: 'deuterium',
        resourceIcon: '⚗️',
        prod: l > 0 ? Math.round(deutProd) : 0,
        cons: l > 0 ? Math.floor(energy * l * Math.pow(1.1, l)) : 0,
        consType: 'energy',
        consIcon: '⚡',
      };
    }
    if (b.energyGen) {
      return {
        type: 'power',
        resource: 'energy',
        resourceIcon: '⚡',
        prod: l > 0 ? Math.floor(b.energyGen * l * Math.pow(1.1, l)) : 0,
        cons: l > 0 && b.deutCons ? Math.floor(b.deutCons * l * Math.pow(1.1, l)) : 0,
        consType: b.deutCons ? 'deuterium' : null,
        consIcon: b.deutCons ? '⚗️' : null,
      };
    }
    if (b.cat === 'storage') {
      return {
        type: 'storage',
        resource: 'capacity',
        resourceIcon: '📦',
        capacity: l > 0 ? storageCapacity(l) : 0,
      };
    }
    if (b.cat === 'civil' || b.cat === 'government') {
      return {
        type: 'civil',
        resource: 'colonia',
        resourceIcon: '🏛️',
        desc: b.desc || 'Mejora calidad de vida y administración.',
      };
    }
    return { type: 'facility' };
  };
  const current = compute(lvl);
  const next = compute(lvl + 1);
  const result = { current, next, kind: current.type };
  if (current.prod !== undefined) {
    result.deltaProd = next.prod - current.prod;
    result.deltaCons = next.cons - current.cons;
  }
  if (current.capacity !== undefined) {
    result.deltaCapacity = next.capacity - current.capacity;
  }
  return result;
};

export const buildingProdDisplay = (id, lvl, research, temp = 20, speed = GAME_SPEED) => {
  const info = buildingProdInfo(id, lvl, research, temp, speed);
  if (!info) return '';
  const c = info.current;
  if (c.type === 'mine' || c.type === 'power') {
    let s = `${c.resourceIcon} +${fmt(c.prod)}/h`;
    if (c.cons > 0) s += ` | ${c.consIcon} -${fmt(c.cons)}/h`;
    return s;
  }
  if (c.type === 'storage') return `📦 Capacidad: ${fmt(c.capacity)}`;
  if (c.type === 'civil') return `🏛️ ${c.desc || 'Mejora colonial'}`;
  return '';
};

export const calcBuildTime = (cost, robot, nanite, speed = 1, construction = 0, mins = {}, research = {}, buildings = {}, relics = []) => {
  const conscription = mins?.defense?.conscriptionLevel || 'volunteer';
  let conscriptionBonus = 1.0;
  if (conscription === 'mandated') conscriptionBonus = 1.15;

  const infraMinister = mins?.infra?.minister;
  const infraDirs = mins?.infra?.directives || {};
  let govBuildSpeedMult = 1.0;
  if (infraMinister?.bonus === 'buildTime') govBuildSpeedMult += 0.12;
  if (infraDirs?.dir_rapid) govBuildSpeedMult += 0.15;

  const relicBuildMult = (relics || []).reduce((acc, r) => r.effect?.buildSpeed ? acc * r.effect.buildSpeed : acc, 1);

  const r = (research && Object.keys(research).length > 0) ? research : (mins?.research || {});
  const b = buildings || {};
  const fullAutoLvl = r.fullAuto || 0;
  const molecularVaporDepLvl = r.molecularVaporDep || 0;
  const adaptiveModularArchLvl = r.adaptiveModularArch || 0;
  const courtLvl = b.colonySupremeCourt || 0;
  const buildSpeedMult = 1 + fullAutoLvl * 0.05 + molecularVaporDepLvl * 0.03 + adaptiveModularArchLvl * 0.05 + courtLvl * 0.05;

  const t = ((cost.metal + cost.crystal) / (2500 * (1 + robot * 1.5625) * (1 + nanite * 0.5) * (1 + construction * 1.5625) * speed * conscriptionBonus * govBuildSpeedMult * relicBuildMult * buildSpeedMult)) * 3600;
  return Math.max(1, Math.floor(t));
};

export const calcResearchTime = (cost, lab, speed = 1, bonus = 1, mins = {}, research = {}) => {
  const grants = mins?.science?.researchGrants || 0.05;
  const grantBonus = 1 + (grants * 2);

  const sciMinister = mins?.science?.minister;
  let sciMinisterBonus = 1.0;
  if (sciMinister?.bonus === 'researchSpeed') sciMinisterBonus += 0.15;

  const r = (research && Object.keys(research).length > 0) ? research : (mins?.research || {});
  const opticalLvl = r.synchronousOptical || 0;
  const opticalBonus = 1 + opticalLvl * 0.03;

  const labReduction = 1 + lab * 1.5625 * LAB_RESEARCH_BONUS_MULT;
  const t = ((cost.metal + cost.crystal) / (1000 * labReduction * speed * bonus * grantBonus * sciMinisterBonus * opticalBonus)) * 3600;
  return Math.max(1, Math.floor(t));
};

export const calcShipTime = (id, qty, shipyard, nanite, speed = 1, bonus = 1, mins = {}) => {
  const s = SHIPS[id];
  const cost = s.cost.m + s.cost.c;
  
  const conscription = mins.defense?.conscriptionLevel || 'volunteer';
  let conscriptionBonus = 1.0;
  if (conscription === 'mandated') conscriptionBonus = 1.15;

  const shipyardReduction = 1 + shipyard * 0.5;
  const t = (cost / (2500 * shipyardReduction * (1 + nanite * 0.5) * speed * bonus * conscriptionBonus)) * 3600 * qty;
  return Math.max(1, Math.floor(t));
};

export const calcDefenseTime = (id, qty, shipyard, nanite, speed = 1, bonus = 1) => {
  const d = DEFENSES[id];
  const cost = d.cost.m + d.cost.c;
  const shipyardReduction = 1 + shipyard * 0.5;
  const t = (cost / (2500 * shipyardReduction * (1 + nanite * 0.5) * speed * bonus)) * 3600 * qty;
  return Math.max(1, Math.floor(t));
};

export const calcDistance = (a, b) => {
  if (a.galaxy !== b.galaxy) return 20000 * Math.abs(a.galaxy - b.galaxy);
  if (a.system !== b.system) return 2700 + 95 * Math.abs(a.system - b.system);
  return 5 + 5 * Math.abs(a.position - b.position);
};

export const calcFlightTime = (dist, speed, missionSpeed = 10, research = {}) => {
  const cartography = research?.galacticCartography || 0;
  const exploration = research?.dimensionalExploration || 0;
  const gravityCurrents = research?.gravityCurrents || 0;
  const compression = research?.hyperspaceCompression || 0;

  let speedMult = 1 + (cartography + exploration) * 0.05;

  if (dist <= 2700) {
    speedMult += gravityCurrents * 0.06;
  }
  if (dist > 20000) {
    speedMult += compression * 0.05;
  }

  const baseTime = (4743416 * Math.sqrt(dist)) / Math.max(1, speed * speedMult);
  const scaledTime = baseTime / (missionSpeed / 10);
  return Math.max(10, Math.round(scaledTime));
};

export const calcFuel = (dist, shipId, qty, driveLevel, research = {}) => {
  const s = SHIPS[shipId];
  const speedBonus = 1 + driveLevel * 0.1;
  let fuelMult = 1.0;
  fuelMult -= (research.deuteriumLiquidCell || 0) * 0.04;
  fuelMult -= (research.magnetohydrodynamics || 0) * 0.05;
  fuelMult -= (research.solarPropulsionFreight || 0) * 0.06;
  fuelMult = Math.max(0.2, fuelMult);
  return Math.max(1, Math.floor(dist / 35000 * (s.fuel * qty) * Math.pow(speedBonus, -2) * fuelMult));
};

export const shipSpeed = (id, research, factionKey = 'human') => {
  const fact = FACTIONS[factionKey] || FACTIONS.human;
  const speedBonus = fact.bonuses.speed || 1.0;
  if (id.startsWith('custom_')) {
    return Math.floor(5000 * speedBonus);
  }
  const s = SHIPS[id];
  let bonus = 0;
  if (s.drive === 'combustion') bonus = (research.combustion || 0) * 0.1;
  else if (s.drive === 'impulse') bonus = (research.impulse || 0) * 0.2;
  else if (s.drive === 'hyperspace') bonus = (research.hyperspace || 0) * 0.3;

  let alcubierreBonus = 0;
  if (['cruiser', 'battleship', 'bomber', 'destroyer', 'deathstar'].includes(id)) {
    alcubierreBonus = (research.alcubierreDrive || 0) * 0.20;
  }

  return Math.floor(s.speed * (1 + bonus + alcubierreBonus) * speedBonus);
};

export const fleetSpeed = (fleet, research, factionKey = 'human', relics = []) => {
  let minSpeed = Infinity;
  for (const [id, qty] of Object.entries(fleet)) {
    if (qty > 0) minSpeed = Math.min(minSpeed, shipSpeed(id, research, factionKey));
  }
  const relicSpeedMult = (relics || []).reduce((acc, r) => r.effect?.fleetSpeed ? acc * r.effect.fleetSpeed : acc, 1);
  return minSpeed === Infinity ? 0 : Math.floor(minSpeed * relicSpeedMult);
};

export const getDefenseStats = (id, tech, factionKey = 'human', buildings = {}, relics = []) => {
  const d = DEFENSES[id];
  if (!d) return null;
  const fact = FACTIONS[factionKey] || FACTIONS.human;
  let atkMult = fact.bonuses.attack || 1.0;
  let defMult = fact.bonuses.defense || 1.0;
  const relicShdMult = (relics || []).reduce((acc, r) => r.effect?.defShd ? acc * r.effect.defShd : acc, 1);
  defMult *= relicShdMult;
  const resMult = fact.bonuses.resistance || 1.0;
  const milAcademy = (buildings.militaryAcademy || 0) * 0.03;
  atkMult *= (1 + milAcademy);

  const hullBonus = 1 + (tech?.armour || 0) * 0.08 + (tech?.nanoRepair || 0) * 0.03;
  const shdBonus = 1 + (tech?.shields || 0) * 0.1 + (tech?.galacticCrypto || 0) * 0.02 + (tech?.aiStrategy || 0) * 0.03;
  const atkBonus = 1 + (tech?.weapons || 0) * 0.1 + (tech?.aiTactics || 0) * 0.02 + (tech?.aiMilitary || 0) * 0.03 + (tech?.gaussRailgunAccel || 0) * 0.10;

  return {
    hull: d.hull * hullBonus * resMult,
    shd: d.shd * shdBonus * defMult,
    atk: d.atk * atkBonus * atkMult,
  };
};

export const getEffectiveTech = (planet, globalResearch) => {
  if (planet && planet.retrofitTech && Object.keys(planet.retrofitTech).length > 0) {
    return planet.retrofitTech;
  }
  return {};
};

export const isOutdated = (planet, globalResearch) => {
  if (!planet || !globalResearch) return false;
  const t = planet.retrofitTech || {};
  return (globalResearch.weapons || 0) > (t.weapons || 0) ||
    (globalResearch.shields || 0) > (t.shields || 0) ||
    (globalResearch.armour || 0) > (t.armour || 0) ||
    (globalResearch.combustion || 0) > (t.combustion || 0) ||
    (globalResearch.impulse || 0) > (t.impulse || 0) ||
    (globalResearch.hyperspace || 0) > (t.hyperspace || 0);
};

export const getShipStats = (id, tech, blueprints, factionKey = 'human', buildings = {}, relics = []) => {
  const fact = FACTIONS[factionKey] || FACTIONS.human;
  let atkMult = fact.bonuses.attack || 1.0;
  const milAcademy = (buildings.militaryAcademy || 0) * 0.03;
  atkMult *= (1 + milAcademy);
  const relicAtkMult = (relics || []).reduce((acc, r) => r.effect?.fleetAtk ? acc * r.effect.fleetAtk : acc, 1);
  atkMult *= relicAtkMult;
  const defMult = fact.bonuses.defense || 1.0;
  const resMult = fact.bonuses.resistance || 1.0;
  const speedBonus = fact.bonuses.speed || 1.0;

  let hullBonus = 1 + (tech?.armour || 0) * 0.08 + (tech?.nanoRepair || 0) * 0.03 + (tech?.latticeMaterials || 0) * 0.05 + (tech?.nanobotRepairSwarms || 0) * 0.02;
  const shdBonus = 1 + (tech?.shields || 0) * 0.1 + (tech?.galacticCrypto || 0) * 0.02 + (tech?.aiStrategy || 0) * 0.03;
  let atkBonus = 1 + (tech?.weapons || 0) * 0.1 + (tech?.aiTactics || 0) * 0.02 + (tech?.aiMilitary || 0) * 0.03;

  if (['smallCargo', 'lightFighter', 'espionageProbe'].includes(id)) {
    hullBonus += (tech?.grapheneTitanium || 0) * 0.08;
  }
  if (id === 'lightFighter') {
    atkBonus += (tech?.geneticWarAlgorithm || 0) * 0.04;
  }

  let cargoMult = 1.0;
  if (['smallCargo', 'largeCargo'].includes(id)) {
    cargoMult += (tech?.orbitalLogisticExpert || 0) * 0.10 + (tech?.molecularCargoCompress || 0) * 0.15;
  }

  if (id.startsWith('custom_')) {
    const bp = blueprints?.find(b => id === 'custom_' + b.id);
    if (bp) {
      const s = calcCustomShipStats(bp);
      const shd = s.shd * shdBonus * defMult;
      const atk = s.atk * atkBonus * atkMult;
      const hull = s.hull * hullBonus * resMult;

      let driveBonus = 0;
      if (bp.engine === 'basicCombustion' || bp.engine === 'advCombustion') {
        driveBonus = (tech?.combustion || 0) * 0.10;
      } else if (bp.engine === 'basicImpulse' || bp.engine === 'advImpulse') {
        driveBonus = (tech?.impulse || 0) * 0.20;
      } else if (bp.engine === 'hyperDrive') {
        driveBonus = (tech?.hyperspace || 0) * 0.30;
      } else if (bp.engine === 'quantumEngine') {
        driveBonus = (tech?.quantumDrive || 0) * 0.15;
      }

      const dimExplorationMult = 1 + (tech?.dimensionalExploration || 0) * 0.05;
      const speed = Math.floor(s.speed * (1 + driveBonus) * speedBonus * dimExplorationMult);

      return { hull, shd, atk, speed, cargo: Math.floor(s.cargo * cargoMult), fuel: 10, rapid: {} };
    }
  }
  const ship = SHIPS[id];
  if (!ship) return null;
  return {
    hull: ship.hull * hullBonus * resMult,
    shd: ship.shd * shdBonus * defMult,
    atk: ship.atk * atkBonus * atkMult,
    speed: shipSpeed(id, tech || {}, factionKey), cargo: Math.floor(ship.cargo * cargoMult), fuel: ship.fuel, rapid: ship.rapid || {},
  };
};

export const researchEffectInfo = (id, lvl) => {
  const r = RESEARCH[id];
  if (!r) return null;
  const result = { current: { effect: r.effect || 'Tecnología' }, next: { effect: r.effect || 'Tecnología' }, kind: 'research' };
  if (id === 'aiStrategy') {
    const cur = (1 - aiResearchDiscount(lvl)) * 100;
    const nxt = (1 - aiResearchDiscount(lvl + 1)) * 100;
    result.current.bonus = Math.round(cur * 100) / 100;
    result.next.bonus = Math.round(nxt * 100) / 100;
    result.delta = Math.round((nxt - cur) * 100) / 100;
    result.unit = '%';
    return result;
  }
  if (r.perLevel) {
    const values = Object.values(r.perLevel);
    const keys = Object.keys(r.perLevel);
    const stepPct = values[0] || 10;
    
    // Multiplicador absoluto (1.00x base, +0.10x por nivel)
    const curMult = (1 + (lvl * stepPct) / 100).toFixed(2);
    const nxtMult = (1 + ((lvl + 1) * stepPct) / 100).toFixed(2);
    
    result.current.bonus = (lvl * stepPct);
    result.next.bonus = ((lvl + 1) * stepPct);
    result.current.mult = `${curMult}x`;
    result.next.mult = `${nxtMult}x`;
    result.delta = stepPct;
    result.unit = r.unit || '%';
    if (keys[0]) result.current.bonusType = keys[0];
  }
  return result;
};
