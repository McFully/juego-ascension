import {
  BUILDINGS as BASE_BUILDINGS,
  RESEARCH as BASE_RESEARCH,
  SHIPS,
  DEFENSES,
  SHIP_CHASSIS,
  SHIP_WEAPONS,
  SHIP_ENGINES,
  SHIP_SHIELDS,
  SHIP_MODULES
} from '../../data/gameData.js';
import { EXPANDED_BUILDINGS, EXPANDED_RESEARCH } from '../../data/expandedContent.js';

const BUILDINGS = { ...BASE_BUILDINGS, ...EXPANDED_BUILDINGS };
const RESEARCH = { ...BASE_RESEARCH, ...EXPANDED_RESEARCH };

export const constructionDiscount = (constructionCenterLvl = 0) => 1 / (1 + 0.15 * (constructionCenterLvl || 0));
export const aiResearchDiscount = (aiStrategyLvl = 0) => 1 / (1 + 0.10 * (aiStrategyLvl || 0));

export const calcRequiredPopulation = (id, targetLvl) => {
  if (!targetLvl || targetLvl <= 0) return 0;
  // Curva escalonada progresiva:
  // Niveles 1 a 10: cuadrática suave (Nivel 1: ~100, Nivel 10: ~3.000)
  // Niveles 11 a 30: progresión industrial (Nivel 20: ~25.000, Nivel 30: ~85.000)
  // Niveles 31 a 50: escala metropolitana (Nivel 40: ~260.000, Nivel 50: ~680.000)
  // Niveles 51+: megaestructuras planetarias (Nivel 63: ~1.850.000)
  if (targetLvl <= 10) {
    return Math.floor(targetLvl * 80 + Math.pow(targetLvl, 2) * 22);
  }
  if (targetLvl <= 30) {
    return Math.floor(3000 + (targetLvl - 10) * 1200 + Math.pow(targetLvl - 10, 2) * 145);
  }
  if (targetLvl <= 50) {
    return Math.floor(85000 + (targetLvl - 30) * 8000 + Math.pow(targetLvl - 30, 2) * 1050);
  }
  // targetLvl > 50:
  return Math.floor(680000 + (targetLvl - 50) * 35000 + Math.pow(targetLvl - 50, 2) * 4200);
};

export const buildingCost = (id, lvl, constructionCenterLvl = 0) => {
  const b = BUILDINGS[id];
  if (!b || !b.cost) {
    return { metal: 0, crystal: 0, deuterium: 0 };
  }
  const COST_MULT = 1;
  const discount = constructionDiscount(constructionCenterLvl);
  return {
    metal: Math.floor((b.cost.m || 0) * Math.pow(b.factor || 1.5, lvl) * COST_MULT * discount),
    crystal: Math.floor((b.cost.c || 0) * Math.pow(b.factor || 1.5, lvl) * COST_MULT * discount),
    deuterium: Math.floor((b.cost.d || 0) * Math.pow(b.factor || 1.5, lvl) * COST_MULT * discount),
  };
};

export const researchCost = (id, lvl, aiStrategyLvl = 0, constructionCenterLvl = 0) => {
  const r = RESEARCH[id];
  if (!r || !r.cost) {
    return { metal: 0, crystal: 0, deuterium: 0 };
  }
  const COST_MULT = 1;
  const discount = aiResearchDiscount(aiStrategyLvl) * constructionDiscount(constructionCenterLvl);
  return {
    metal: Math.floor((r.cost.m || 0) * Math.pow(r.factor || 2, lvl) * COST_MULT * discount),
    crystal: Math.floor((r.cost.c || 0) * Math.pow(r.factor || 2, lvl) * COST_MULT * discount),
    deuterium: Math.floor((r.cost.d || 0) * Math.pow(r.factor || 2, lvl) * COST_MULT * discount),
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
  const industrialOptLvl = r.industrialOpt || 0;
  const courtLvl = b.colonySupremeCourt || 0;
  const buildSpeedMult = 1 + fullAutoLvl * 0.05 + molecularVaporDepLvl * 0.03 + adaptiveModularArchLvl * 0.05 + industrialOptLvl * 0.10 + courtLvl * 0.05;

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

  const labReduction = 1 + lab * 0.5;
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
