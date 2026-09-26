import { clampResources, BIOMES, calcPlanetMaxPop } from '../../core.jsx';

export const processPlanetTick = (planet, prod, storage, state) => {
  let p = planet;
  const demo = p.demographics || { morale: 85, unrest: 3 };
  const isOnStrike = (demo.unrest || 0) >= 60 || (demo.morale || 85) < 30;
  const strikeEfficiency = isOnStrike ? 0.20 : 1.0;

  // Bonificador por Red Maglev Hyperloop
  const hyperloopBoost = (p.buildings?.hyperloopNetwork > 0) ? 1.12 : 1.0;
  const effectiveProdFactor = strikeEfficiency * hyperloopBoost;

  let newRes = {
    metal: Math.min((p.resources.metal || 0) + (prod.metal * effectiveProdFactor) / 3600, storage.metal),
    crystal: Math.min((p.resources.crystal || 0) + (prod.crystal * effectiveProdFactor) / 3600, storage.crystal),
    deuterium: Math.min(Math.max(0, (p.resources.deuterium || 0) + (prod.deuterium * effectiveProdFactor) / 3600), storage.deuterium),
  };
  newRes = clampResources(newRes);

  // Civil Population consumption and growth (reducido un 90%)
  const pop = p.population || 1000;
  const metalCons = pop * 0.00002;
  const crystalCons = pop * 0.00001;
  const deutCons = pop * 0.000005;

  let hasFamine = false;
  if (newRes.metal >= metalCons && newRes.crystal >= crystalCons && newRes.deuterium >= deutCons) {
    newRes.metal -= metalCons;
    newRes.crystal -= crystalCons;
    newRes.deuterium -= deutCons;
  } else {
    hasFamine = true;
    newRes.metal = Math.max(0, newRes.metal - metalCons);
    newRes.crystal = Math.max(0, newRes.crystal - crystalCons);
    newRes.deuterium = Math.max(0, newRes.deuterium - deutCons);
  }

  let nextPop = pop;
  if (!hasFamine) {
    const townHallLvl = p.buildings?.townHall || 0;
    const bioClinicLvl = p.buildings?.bioRegenClinic || 0;
    const hydroLvlB = p.buildings?.urbanHydroponic || 0;
    const bioData = BIOMES[p.biome] || {};
    const growthMod = bioData.growthMod || 1.0;
    
    const maxPop = calcPlanetMaxPop(p);
    
    if (pop < maxPop) {
      const bioLvl = state.research?.orbitalSanitaryBio || 0;
      const hydroLvl = state.research?.multiproposeHydroponic || 0;
      const sleepLvl = state.research?.acceleratedSleepBio || 0;
      const growthMult = (1 + bioLvl * 0.06 + hydroLvl * 0.05 + sleepLvl * 0.03) * growthMod;
      
      const growth = Math.max(1, Math.floor((2 + townHallLvl * 80 + bioClinicLvl * 40 + hydroLvlB * 25) * growthMult));
      nextPop = Math.min(maxPop, pop + growth);
    }
  }

  if (p.specialization === 'commercial') {
    const hasIndustrial = state.planets.some(pp => pp.specialization === 'industrial');
    const hasScientific = state.planets.some(pp => pp.specialization === 'scientific');
    if (hasIndustrial) newRes.metal = Math.min(newRes.metal + Math.floor(prod.metal / 9000), storage.metal);
    if (hasScientific) newRes.deuterium = Math.min(Math.max(0, newRes.deuterium + Math.floor(prod.deuterium / 9000)), storage.deuterium);
  }

  let retrofitTech = { ...p.retrofitTech };
  const research = state?.research || {};
  const fields = ['weapons', 'shields', 'armour', 'combustion', 'impulse', 'hyperspace'];
  let needsUpgrade = false;
  for (const f of fields) {
    if ((retrofitTech[f] || 0) < (research[f] || 0)) {
      needsUpgrade = true;
      break;
    }
  }
  if (needsUpgrade) {
    const upgradeCost = { metal: 2, crystal: 1, deuterium: 0.5 };
    if (newRes.metal >= upgradeCost.metal && newRes.crystal >= upgradeCost.crystal && newRes.deuterium >= upgradeCost.deuterium) {
      newRes.metal -= upgradeCost.metal;
      newRes.crystal -= upgradeCost.crystal;
      newRes.deuterium -= upgradeCost.deuterium;
      for (const f of fields) {
        const currentLvl = retrofitTech[f] || 0;
        const globalLvl = state.research[f] || 0;
        if (currentLvl < globalLvl) {
          retrofitTech[f] = currentLvl + 1;
          break;
        }
      }
    }
  }

  return {
    ...p,
    resources: newRes,
    population: nextPop,
    hasFamine,
    retrofitTech
  };
};

export default processPlanetTick;
