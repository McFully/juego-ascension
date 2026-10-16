import { clampResources, BIOMES, calcPlanetMaxPop, POPULATION_CONSUMPTION_RATES } from '../../core.jsx';

export const processPlanetTick = (planet, prod, storage, state) => {
  let p = planet;
  const demo = p.demographics || { morale: 85, unrest: 3 };
  const isOnStrike = (demo.unrest || 0) >= 60 || (demo.morale || 85) < 30;
  const strikeEfficiency = isOnStrike ? 0.20 : 1.0;

  // Bonificador por Red Maglev Hyperloop
  const hyperloopBoost = (p.buildings?.hyperloopNetwork > 0) ? 1.12 : 1.0;

  // Lógica de Escoria y Bloqueo Fabril por Saturación:
  // Si el almacén de escoria se llena al 100% y no se procesa, las fábricas colapsan y se paran.
  const currentSlag = p.resources?.slag || 0;
  const slagStorageCap = storage.slag || 100000;
  const isSlagSaturated = currentSlag >= slagStorageCap;
  
  // Si la escoria está saturada, la producción fabril/minera se paraliza por completo
  const slagFactoryPenalty = isSlagSaturated ? 0 : 1.0;
  const effectiveProdFactor = strikeEfficiency * hyperloopBoost * slagFactoryPenalty;

  // Variación horaria de escoria: prod.slagNet (generación bruta - reciclaje activo)
  const slagNetPerHour = prod.slagNet !== undefined ? prod.slagNet : (prod.slag || 0);
  let nextSlag;
  if (currentSlag <= 0 && slagNetPerHour <= 0) {
    nextSlag = 0;
  } else {
    nextSlag = Math.max(0, Math.min(currentSlag + (slagNetPerHour * strikeEfficiency * hyperloopBoost) / 3600, slagStorageCap));
    if (nextSlag < 0.001) nextSlag = 0;
  }

  let newRes = {
    metal: Math.min((p.resources.metal || 0) + (prod.metal * effectiveProdFactor) / 3600, storage.metal),
    crystal: Math.min((p.resources.crystal || 0) + (prod.crystal * effectiveProdFactor) / 3600, storage.crystal),
    deuterium: Math.min(Math.max(0, (p.resources.deuterium || 0) + (prod.deuterium * effectiveProdFactor) / 3600), storage.deuterium),
    slag: nextSlag,
  };
  newRes = clampResources(newRes);

  // Soporte Vital Orgánico: provisto por Invernaderos Urbanos, Depuradoras de Agua, Acuíferos y Drones Agrícolas
  const pop = p.population || 1000;
  const hydroBuildings = p.buildings?.urbanHydroponic || 0;
  const waterBuildings = p.buildings?.waterTreatmentPlant || 0;
  const aquiferBuildings = p.buildings?.deepAquiferDrill || 0;
  const hydroTech = state?.research?.multiproposeHydroponic || 0;
  const agriDroneTech = state?.research?.automatedAgriDrones || 0;
  const bioTech = state?.research?.orbitalSanitaryBio || 0;
  const sleepTech = state?.research?.acceleratedSleepBio || 0;

  // Capacidad de soporte vital hídrico y calórico básico más infraestructuras
  // Base incrementada a 100.000 para permitir colonias iniciales y medianas sin hambruna prematura
  const baseVitalSupport = 100000;
  const agriMultiplier = 1 + (agriDroneTech * 0.20);
  const vitalSupportCap = baseVitalSupport + ((hydroBuildings * 40000) * agriMultiplier) + (waterBuildings * 50000) + (aquiferBuildings * 80000) + (hydroTech * 20000);
  const isVitalDeficit = pop > vitalSupportCap;
  const hasFamine = isVitalDeficit;

  let nextPop = pop;
  if (!isVitalDeficit) {
    const townHallLvl = p.buildings?.townHall || 0;
    const bioClinicLvl = p.buildings?.bioRegenClinic || 0;
    const bioData = BIOMES[p.biome] || {};
    const growthMod = bioData.growthMod || 1.0;
    const maxPop = calcPlanetMaxPop(p);
    
    if (pop < maxPop) {
      const growthMult = (1 + bioTech * 0.06 + hydroTech * 0.05 + sleepTech * 0.03) * growthMod;
      const growth = Math.max(1, Math.floor((2 + townHallLvl * 80 + bioClinicLvl * 40 + hydroBuildings * 25) * growthMult));
      nextPop = Math.min(maxPop, pop + growth);
    }
  } else {
    // Si la población excede el soporte vital, se detiene el crecimiento y hay leve decrecimiento
    nextPop = Math.max(100, Math.floor(pop * 0.9995));
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
