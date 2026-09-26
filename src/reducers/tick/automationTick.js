import {
  BUILDINGS, RESEARCH, DEFENSES, uid, clampResources, deduct, canAfford,
  meetsReq, calcStorage, buildingCost, researchCost, defenseCost,
  calcBuildTime, calcResearchTime, calcDefenseTime, researchTimeBonus,
  calcDistance, fleetSpeed, calcFlightTime, fmt, GAME_SPEED
} from '../../core.jsx';

export const processAutoTrade = (newState) => {
  const capital = newState.planets.find(pl => pl.isHome);
  if (!capital) return newState;

  newState.planets = newState.planets.map(colony => {
    if (colony.isHome || !colony.autoTrade) return colony;

    const storage = calcStorage(colony.buildings);
    const excess = {
      metal: Math.max(0, colony.resources.metal - storage.metal * 0.75),
      crystal: Math.max(0, colony.resources.crystal - storage.crystal * 0.75),
      deuterium: Math.max(0, colony.resources.deuterium - storage.deuterium * 0.75),
    };
    const totalExcess = excess.metal + excess.crystal + excess.deuterium;
    if (totalExcess <= 5000) return colony;

    const smallCargos = colony.fleet?.smallCargo || 0;
    const largeCargos = colony.fleet?.largeCargo || 0;
    if (smallCargos === 0 && largeCargos === 0) return colony;

    const isCommercial = colony.specialization === 'commercial';
    const cargoMult = isCommercial ? 1.5 : 1.0;
    const smallCap = 5000 * cargoMult;
    const largeCap = 25000 * cargoMult;

    let availableCapacity = smallCargos * smallCap + largeCargos * largeCap;
    let actualToSend = Math.min(totalExcess, availableCapacity);

    let largeNeeded = Math.min(largeCargos, Math.floor(actualToSend / largeCap));
    let remainder = actualToSend - largeNeeded * largeCap;
    let smallNeeded = Math.min(smallCargos, Math.ceil(remainder / smallCap));

    if (largeNeeded === 0 && smallNeeded === 0) return colony;

    const dispatchedFleet = {};
    if (smallNeeded > 0) dispatchedFleet.smallCargo = smallNeeded;
    if (largeNeeded > 0) dispatchedFleet.largeCargo = largeNeeded;

    const fraction = Math.min(1, actualToSend / totalExcess);
    const metalToSend = Math.floor(excess.metal * fraction);
    const crystalToSend = Math.floor(excess.crystal * fraction);
    const deutToSend = Math.floor(excess.deuterium * fraction);

    const updatedColony = {
      ...colony,
      resources: {
        ...colony.resources,
        metal: colony.resources.metal - metalToSend,
        crystal: colony.resources.crystal - crystalToSend,
        deuterium: colony.resources.deuterium - deutToSend,
      },
      fleet: {
        ...colony.fleet,
        smallCargo: smallCargos - (dispatchedFleet.smallCargo || 0),
        largeCargo: largeCargos - (dispatchedFleet.largeCargo || 0),
      }
    };

    const dist = calcDistance(colony, capital);
    const playerFaction = colony.faction || 'human';
    const spd = fleetSpeed(dispatchedFleet, newState.research, playerFaction);
    const flightTime = calcFlightTime(dist, spd, 10, newState.research);
    const arrivalTime = Date.now() + flightTime * 1000;
    const returnTime = arrivalTime + flightTime * 1000;

    newState.fleetMissions = [...(newState.fleetMissions || []), {
      id: uid(),
      type: 'transport',
      from: { id: colony.id, name: colony.name, galaxy: colony.galaxy, system: colony.system, position: colony.position, specialization: colony.specialization },
      to: { id: capital.id, name: capital.name, galaxy: capital.galaxy, system: capital.system, position: capital.position },
      fleet: dispatchedFleet,
      resources: { metal: metalToSend, crystal: crystalToSend, deuterium: deutToSend },
      fuel: 0,
      departure: Date.now(),
      arrivalTime,
      returnTime,
      isAI: false,
      autoRoute: true
    }];

    newState.notifications = [...(newState.notifications || []), {
      id: uid(),
      type: 'info',
      message: `🚚 Auto-Ruta: Despegó convoy desde ${colony.name} hacia capital llevando ${fmt(metalToSend)}M, ${fmt(crystalToSend)}C, ${fmt(deutToSend)}D`,
      timestamp: Date.now()
    }];
    return updatedColony;
  });

  return newState;
};

export const processAutoResearch = (newState) => {
  for (const cp of newState.planets) {
    const cpScience = cp.ministries?.science || newState.ministries?.science;
    if (!cpScience?.automationEnabled) continue;

    const isAlreadyResearchingType = (rId) => (newState.researchQueue || []).some(q => q.researchId === rId);
    let cheapestResearch = null;
    let lowestCostValue = Infinity;
    
    for (const [id, r] of Object.entries(RESEARCH)) {
      if (isAlreadyResearchingType(id)) continue;
      
      const currentLvl = newState.research[id] || 0;
      const cost = researchCost(id, currentLvl, newState.research?.aiStrategy || 0, cp.buildings?.constructionCenter || 0);
      const costSum = (cost.metal || 0) + (cost.crystal || 0) * 1.5 + (cost.deuterium || 0) * 3;
      if (costSum < lowestCostValue && canAfford(cp.resources, cost) && meetsReq(r.req, { ...cp.buildings, ...newState.research })) {
        cheapestResearch = id;
        lowestCostValue = costSum;
      }
    }
    
    if (cheapestResearch) {
      const currentLvl = newState.research[cheapestResearch] || 0;
      const targetLvl = currentLvl + 1;
      const cost = researchCost(cheapestResearch, currentLvl, newState.research?.aiStrategy || 0, cp.buildings?.constructionCenter || 0);
      const newRes = clampResources(deduct(cp.resources, cost));
      newState.planets = newState.planets.map(p => p.id === cp.id ? { ...p, resources: newRes } : p);
      
      const speedBonus = researchTimeBonus(cp.buildings, newState.research);
      const totalSpeedMultiplier = (1 + speedBonus) * (1 + (cpScience?.researchGrants || 0.05));
      const researchTimeVal = calcResearchTime(cost, cp.buildings?.researchLab || 0, GAME_SPEED, totalSpeedMultiplier, newState.research);
      
      const startTime = Date.now();
      const endTime = startTime + researchTimeVal * 1000;
      
      newState.researchQueue = [...(newState.researchQueue || []), {
        id: uid(),
        planetId: cp.id,
        researchId: cheapestResearch,
        startTime,
        endTime,
        level: targetLvl,
        auto: true
      }];
    }
  }
  return newState;
};

export const processAutoBuildAndDefenses = (newState, prodCache, storageCache) => {
  // Auto-build
  newState.planets = newState.planets.map(planet => {
    const pInfra = planet.ministries?.infra || newState.ministries?.infra;
    const pScience = planet.ministries?.science || newState.ministries?.science;
    const isAutoManageActive = pInfra?.automationEnabled || pScience?.directives?.dir_ai_trust;
    if (!isAutoManageActive) return planet;

    const isAlreadyBuildingType = (bId) => newState.buildQueue.some(q => q.planetId === planet.id && q.buildingId === bId);
    const prod = prodCache.get(planet.id) || { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0, ratio: 1 };
    const storage = storageCache.get(planet.id) || { metal: 0, crystal: 0, deuterium: 0 };
    const buildings = planet.buildings || {};

    const candidates = [];
    const currentEnergyBalance = prod.energyBalance || 0;
    const energyNeed = currentEnergyBalance < 20;
    const solarLevel = buildings.solarPlant || 0;
    const useFusionFirst = solarLevel >= 10;

    if (energyNeed) {
      const energySources = useFusionFirst
        ? ['fusionReactor', 'geoPlant', 'orbitalEnergy', 'quantumReactor']
        : ['solarPlant', 'fusionReactor', 'geoPlant', 'orbitalEnergy'];
      for (const pId of energySources) {
        if (isAlreadyBuildingType(pId)) continue;
        if (meetsReq(BUILDINGS[pId] ? BUILDINGS[pId].req : null, { ...planet.buildings, ...newState.research })) {
          candidates.push(pId);
          break;
        }
      }
    }
    
    if (planet.resources.metal > storage.metal * 0.85 && !isAlreadyBuildingType('metalStorage')) candidates.push('metalStorage');
    if (planet.resources.crystal > storage.crystal * 0.85 && !isAlreadyBuildingType('crystalStorage')) candidates.push('crystalStorage');
    if (planet.resources.deuterium > storage.deuterium * 0.85 && !isAlreadyBuildingType('deutStorage')) candidates.push('deutStorage');
    
    const rFactory = buildings.robotFactory || 0;
    const mMine = buildings.metalMine || 0;
    const cMine = buildings.crystalMine || 0;
    const dSynth = buildings.deutSynth || 0;
    const rLab = buildings.researchLab || 0;
    
    if (rFactory < 15 && rFactory < Math.floor(mMine / 2.5) + 1 && !isAlreadyBuildingType('robotFactory')) candidates.push('robotFactory');
    if (rLab < 12 && rLab < Math.floor(cMine / 2) && !isAlreadyBuildingType('researchLab')) candidates.push('researchLab');
    
    if (!energyNeed || currentEnergyBalance >= 10) {
      if (mMine <= cMine + 3 && !isAlreadyBuildingType('metalMine')) candidates.push('metalMine');
      if (cMine <= dSynth + 2 && !isAlreadyBuildingType('crystalMine')) candidates.push('crystalMine');
      if (dSynth <= cMine - 2 && !isAlreadyBuildingType('deutSynth')) candidates.push('deutSynth');
    }
    
    if (currentEnergyBalance >= 5) {
      if (!isAlreadyBuildingType('metalMine')) candidates.push('metalMine');
      if (!isAlreadyBuildingType('crystalMine')) candidates.push('crystalMine');
      if (!isAlreadyBuildingType('deutSynth')) candidates.push('deutSynth');
    }

    let didQueue = false;
    for (const bId of candidates) {
      if (didQueue) break;
      const targetLvl = (buildings[bId] || 0) + 1;
      const cost = buildingCost(bId, targetLvl - 1, buildings?.constructionCenter || 0);
      if (BUILDINGS[bId] && canAfford(planet.resources, cost) && meetsReq(BUILDINGS[bId].req, { ...planet.buildings, ...newState.research })) {
        const newRes = clampResources(deduct(planet.resources, cost));
        const buildTimeVal = calcBuildTime(cost, buildings.robotFactory || 0, buildings.naniteFactory || 0, GAME_SPEED, buildings.constructionCenter || 0, {}, newState.research, buildings);
        const startTime = Date.now();
        const endTime = startTime + buildTimeVal * 1000;

        newState.buildQueue = [...newState.buildQueue, {
          id: uid(),
          planetId: planet.id,
          buildingId: bId,
          startTime,
          endTime,
          level: targetLvl,
          auto: true
        }];
        didQueue = true;
        return { ...planet, resources: newRes };
      }
    }
    return planet;
  });

  // Auto-economy
  newState.planets = newState.planets.map(planet => {
    const pEco = planet.ministries?.economy || newState.ministries?.economy;
    if (!pEco?.automationEnabled) return planet;

    const cost = { metal: 20000, crystal: 10000, deuterium: 5000 };
    if (canAfford(planet.resources, cost)) {
      const currentBusinesses = planet.civilBusinesses || { lowClass: 0, midClass: 0, highClass: 0 };
      let businessType = 'lowClass';
      if ((currentBusinesses.lowClass || 0) > (currentBusinesses.midClass || 0) * 2) {
        businessType = 'midClass';
      }
      if ((currentBusinesses.midClass || 0) > (currentBusinesses.highClass || 0) * 2) {
        businessType = 'highClass';
      }
      return {
        ...planet,
        resources: deduct(planet.resources, cost),
        civilBusinesses: {
          ...currentBusinesses,
          [businessType]: (currentBusinesses[businessType] || 0) + 1
        }
      };
    }
    return planet;
  });

  // Auto-defense
  newState.planets = newState.planets.map(planet => {
    const pDef = planet.ministries?.defense || newState.ministries?.defense;
    if (!pDef?.automationEnabled) return planet;

    const isAlreadyDefending = newState.defenseQueue && newState.defenseQueue.some(q => q.planetId === planet.id && q.defenseId === 'rocketLauncher');
    if (isAlreadyDefending) return planet;

    const defenseId = 'rocketLauncher';
    const cost = defenseCost(defenseId, 1, planet.buildings?.constructionCenter || 0);
    if (canAfford(planet.resources, cost) && meetsReq(DEFENSES[defenseId].req, { ...planet.buildings, ...newState.research })) {
      const newRes = clampResources(deduct(planet.resources, cost));
      const defenseTimeVal = calcDefenseTime(defenseId, 1, planet.buildings?.shipyard || 0, planet.buildings?.naniteFactory || 0, GAME_SPEED);
      const startTime = Date.now();
      const endTime = startTime + defenseTimeVal * 1000;

      newState.defenseQueue = [...(newState.defenseQueue || []), {
        id: uid(),
        planetId: planet.id,
        defenseId,
        quantity: 1,
        startTime,
        endTime,
        auto: true
      }];

      return {
        ...planet,
        resources: newRes
      };
    }
    return planet;
  });

  return newState;
};
