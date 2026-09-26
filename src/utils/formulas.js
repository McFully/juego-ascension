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
import { calcBuildingEnergyDemand } from './formulas/productionFormulas.js';

export { calcBuildingEnergyDemand };

// ============ RE-EXPORTS DESDE SUBMÓDULOS MODULARES ============
export {
  constructionDiscount,
  aiResearchDiscount,
  calcRequiredPopulation,
  buildingCost,
  researchCost,
  shipCost,
  defenseCost,
  canAfford,
  deduct,
  calcCustomShipCost,
  calcCustomShipTime,
  calcCustomShipStats,
  calcBuildTime,
  calcResearchTime,
  calcShipTime,
  calcDefenseTime
} from './formulas/costFormulas.js';

export {
  calcDistance,
  calcFlightTime,
  calcFuel,
  shipSpeed,
  fleetSpeed
} from './formulas/flightFormulas.js';

export {
  SHIP_TECH_KEYS,
  DEFENSE_TECH_KEYS,
  extractShipTechSnapshot,
  extractDefenseTechSnapshot,
  calculateTechGeneration,
  getVariantKey,
  isVariantOutdated,
  calculateRetrofitUnitCost,
  calculateRetrofitUnitTime
} from './formulas/retrofitFormulas.js';

export {
  getDefenseStats,
  getEffectiveTech,
  isOutdated,
  getShipStats
} from './formulas/combatFormulas.js';

export {
  calcPlanetMaxPop,
  storageCapacity,
  calcStorage,
  shipTimeBonus,
  researchTimeBonus,
  LAB_RESEARCH_BONUS_MULT,
  calcProduction
} from './formulas/productionFormulas.js';

import { storageCapacity, calcProduction } from './formulas/productionFormulas.js';
import { aiResearchDiscount } from './formulas/costFormulas.js';

// ============ DATOS FUSIONADOS ============
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

export const buildingProdInfo = (id, lvl, research = {}, temp = 20, speed = GAME_SPEED, planet = {}) => {
  const b = BUILDINGS[id];
  if (!b) return null;
  
  const pl = research.plasma || 0;
  const miningAuto = research.miningAuto || 0;
  const aiProd = research.aiProd || 0;
  const globalTechMult = (1 + pl * 0.10) * (1 + miningAuto * 0.10) * (1 + aiProd * 0.10);

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

  const prodCalculated = calcProduction(
    planet.buildings || {},
    research,
    temp,
    speed,
    planet.faction || 'human',
    planet.biome,
    planet.gravity,
    planet.trait ? { effect: () => PLANET_TRAITS[planet.trait]?.effect || {} } : null,
    planet.specialization,
    planet.galaxy ? { galaxy: planet.galaxy, system: planet.system, position: planet.position } : null,
    planet.taxRate || 0
  );
  const ratio = prodCalculated.ratio ?? 1;

  // Builds de industria del Ministerio (Instalaciones): el contador real usa la
  // fórmula lineal de calcProduction (NO la exponencial de mina). Tarjeta honesta
  // = delta real que el contador aplicará al pasar de lvl-1 a lvl (y de lvl a lvl+1),
  // recalculando calcProduction con el ratio de energía del planeta.
  const INDUSTRY_BUILD_IDS = ['refinery', 'chemPlant', 'synthPlant', 'enrichPlant'];
  const isIndustry = INDUSTRY_BUILD_IDS.includes(id);
  if (isIndustry) {
    const industrySim = (buildingLvl) => {
      const targetBuildings = { ...(planet.buildings || {}), [id]: buildingLvl };
      return calcProduction(
        targetBuildings,
        research,
        temp,
        speed,
        planet.faction || 'human',
        planet.biome,
        planet.gravity,
        planet.trait ? { effect: () => PLANET_TRAITS[planet.trait]?.effect || {} } : null,
        planet.specialization,
        planet.galaxy ? { galaxy: planet.galaxy, system: planet.system, position: planet.position } : null,
        planet.taxRate || 0
      );
    };
    const resource = b.prod === 'metal' ? 'metal' : b.prod === 'crystal' ? 'crystal' : 'deuterium';
    const resourceIcon = b.prod === 'metal' ? '⛏️' : b.prod === 'crystal' ? '💎' : '⚗️';
    const resourceLabel = b.prod === 'metal' ? 'Metal' : b.prod === 'crystal' ? 'Cristal' : 'Deuterio';
    const atLvl = lvl > 0 ? industrySim(lvl)[resource] - industrySim(0)[resource] : 0;
    const atNext = industrySim(lvl + 1)[resource] - industrySim(0)[resource];
    const consCurrent = lvl > 0 ? calcBuildingEnergyDemand(id, lvl) : 0;
    const consNext = calcBuildingEnergyDemand(id, lvl + 1);
    const current = { type: 'industry', resource: resourceLabel, resourceIcon, prod: Math.round(atLvl), cons: consCurrent, consType: 'energy', consIcon: '⚡' };
    const next = { type: 'industry', resource: resourceLabel, resourceIcon, prod: Math.round(atNext), cons: consNext, consType: 'energy', consIcon: '⚡' };
    return { current, next, kind: 'industry', deltaProd: next.prod - current.prod, deltaCons: next.cons - current.cons };
  }

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
      const cons = l > 0 && b.energy ? calcBuildingEnergyDemand(id, l) : 0;
      return {
        type: 'storage',
        resource: 'capacity',
        resourceIcon: '📦',
        capacity: l > 0 ? storageCapacity(l) : 0,
        cons,
        consType: b.energy ? 'energy' : null,
        consIcon: b.energy ? '⚡' : null,
      };
    }
    if (b.cat === 'civil' || b.cat === 'government') {
      const cons = l > 0 && b.energy ? calcBuildingEnergyDemand(id, l) : 0;
      return {
        type: b.cat,
        resource: 'colonia',
        resourceIcon: '🏛️',
        desc: b.desc || 'Mejora calidad de vida y administración.',
        cons,
        consType: b.energy ? 'energy' : null,
        consIcon: b.energy ? '⚡' : null,
      };
    }
    const facilityCons = l > 0 && b.energy ? calcBuildingEnergyDemand(id, l) : 0;
    return {
      type: 'facility',
      cons: facilityCons,
      consType: b.energy ? 'energy' : null,
      consIcon: b.energy ? '⚡' : null,
    };
  };
  const current = compute(lvl);
  const next = compute(lvl + 1);
  const result = { current, next, kind: current.type };
  if (current.prod !== undefined) {
    result.deltaProd = next.prod - current.prod;
  }
  if (current.cons !== undefined && next.cons !== undefined) {
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
  if (id === 'astrophysics') {
    const curMax = 1 + Math.ceil(lvl / 2);
    const nxtMax = 1 + Math.ceil((lvl + 1) / 2);
    result.current.effect = `Capacidad del Imperio: ${curMax} mundos (Base 1 + ${curMax - 1} colonias)`;
    result.next.effect = `Capacidad del Imperio: ${nxtMax} mundos (Base 1 + ${nxtMax - 1} colonias)`;
    result.current.bonus = curMax;
    result.next.bonus = nxtMax;
    result.delta = nxtMax - curMax;
    result.unit = ' mundos';
    return result;
  }
  if (r.perLevel) {
    const values = Object.values(r.perLevel);
    const keys = Object.keys(r.perLevel);
    const stepPct = values[0] || 10;
    
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

// ============ CAPACIDAD COLONIAL Y ASTROFÍSICA ============
export const getMaxPlanets = (astroLevel = 0) => {
  const lvl = Math.max(0, parseInt(astroLevel, 10) || 0);
  return 1 + Math.ceil(lvl / 2);
};

export const getRequiredAstroLevelForPlanets = (totalPlanetsNeeded = 1) => {
  if (totalPlanetsNeeded <= 1) return 0;
  const extraNeeded = totalPlanetsNeeded - 1;
  return (extraNeeded * 2) - 1;
};

export const getUsedColonySlots = (state) => {
  if (!state) return 1;
  const colonizedCount = (state.planets || []).length;
  const inFlightColonizations = (state.fleetMissions || []).filter(
    m => m.type === 'colonize' && !m.isReturning
  ).length;
  return colonizedCount + inFlightColonizations;
};

export const canColonizeNewPlanet = (state) => {
  if (!state) return false;
  const astroLvl = state.research?.astrophysics || 0;
  const maxPlanets = getMaxPlanets(astroLvl);
  const usedSlots = getUsedColonySlots(state);
  return usedSlots < maxPlanets;
};

export const migrateLegacyColonization = (state) => {
  if (!state) return state;
  const currentPlanetsCount = (state.planets || []).length;
  const inFlightColonizations = (state.fleetMissions || []).filter(
    m => m.type === 'colonize' && !m.isReturning
  ).length;
  const totalOccupiedOrEnRoute = currentPlanetsCount + inFlightColonizations;

  const currentAstro = state.research?.astrophysics || 0;
  const requiredAstro = getRequiredAstroLevelForPlanets(totalOccupiedOrEnRoute);

  if (currentAstro < requiredAstro) {
    return {
      ...state,
      research: {
        ...(state.research || {}),
        astrophysics: requiredAstro
      },
      stats: {
        ...(state.stats || {}),
        totalResearch: Math.max(state.stats?.totalResearch || 0, (state.stats?.totalResearch || 0) + (requiredAstro - currentAstro)),
        maxTechLevel: Math.max(state.stats?.maxTechLevel || 0, requiredAstro)
      },
      notifications: [
        ...(state.notifications || []),
        {
          id: uid(),
          type: 'success',
          message: `📜 Amnistía Imperial: Se ha homologado tu Astrofísica a Nivel ${requiredAstro} para certificar tus ${totalOccupiedOrEnRoute} mundos y expediciones en curso sin pérdidas.`,
          timestamp: Date.now()
        }
      ]
    };
  }

  return state;
};

