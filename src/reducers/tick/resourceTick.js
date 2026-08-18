import {
  GAME_SPEED, BUILDINGS, RESEARCH, SHIPS, DEFENSES,
  uid, updatePlanet, clampResources
} from '../../core.jsx';

export const processPlayerPlanets = (newState, prodCache, storageCache) => {
  newState.planets = newState.planets.map(planet => {
    let p = planet;
    const prod = prodCache.get(p.id) || { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0, ratio: 1 };
    const storage = storageCache.get(p.id) || { metal: 0, crystal: 0, deuterium: 0 };
    let newRes = {
      metal: Math.min((p.resources.metal || 0) + prod.metal / 3600, storage.metal),
      crystal: Math.min((p.resources.crystal || 0) + prod.crystal / 3600, storage.crystal),
      deuterium: Math.min(Math.max(0, (p.resources.deuterium || 0) + prod.deuterium / 3600), storage.deuterium),
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
      const healthCenterLvl = p.buildings?.healthCenter || 0;
      const arcologyLvl = p.buildings?.arcologyAlpha || 0;
      const bioClinicLvl = p.buildings?.bioRegenClinic || 0;
      const maxPop = 10000 + healthCenterLvl * 50000 + arcologyLvl * 10000 + bioClinicLvl * 8000;
      if (pop < maxPop) {
        const bioLvl = state.research?.orbitalSanitaryBio || 0;
        const hydroLvl = state.research?.multiproposeHydroponic || 0;
        const sleepLvl = state.research?.acceleratedSleepBio || 0;
        const growthMult = 1 + bioLvl * 0.06 + hydroLvl * 0.05 + sleepLvl * 0.03;
        const growth = Math.floor((10 + townHallLvl * 50) * growthMult);
        nextPop = Math.min(maxPop, pop + growth);
      }
    }

    if (p.specialization === 'commercial') {
      const hasIndustrial = newState.planets.some(pp => pp.specialization === 'industrial');
      const hasScientific = newState.planets.some(pp => pp.specialization === 'scientific');
      if (hasIndustrial) newRes.metal = Math.min(newRes.metal + Math.floor(prod.metal / 9000), storage.metal);
      if (hasScientific) newRes.deuterium = Math.min(Math.max(0, newRes.deuterium + Math.floor(prod.deuterium / 9000)), storage.deuterium);
    }

    let retrofitTech = { ...p.retrofitTech };
    const fields = ['weapons', 'shields', 'armour', 'combustion', 'impulse', 'hyperspace'];
    let needsUpgrade = false;
    for (const f of fields) {
      if ((retrofitTech[f] || 0) < (newState.research[f] || 0)) {
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
          const globalLvl = newState.research[f] || 0;
          if (currentLvl < globalLvl) {
            retrofitTech[f] = currentLvl + 1;
            break;
          }
        }
      }
    }
    return { ...p, resources: newRes, population: nextPop, retrofitTech };
  });
  return newState;
};

export const processMinistries = (newState, prodCache) => {
  const mins = newState.ministries || {};
  const taxRate = mins.economy?.taxRate || 0.1;
  const totalMetalProd = newState.planets.reduce((acc, p) => {
    const pp = prodCache.get(p.id);
    return acc + ((pp ? pp.metal : 0) / 3600);
  }, 0);
  let businessTaxIncome = 0;
  newState.planets.forEach(p => {
    const b = p.civilBusinesses || { lowClass: 0, midClass: 0, highClass: 0 };
    businessTaxIncome += (b.lowClass || 0) * 5 + (b.midClass || 0) * 15 + (b.highClass || 0) * 50;
  });
  const taxIncome = totalMetalProd * taxRate * 2.0 + businessTaxIncome;
  newState.ministries = {
    ...newState.ministries,
    economy: {
      ...newState.ministries.economy,
      treasury: (mins.economy.treasury || 0) + taxIncome,
      gdp: totalMetalProd * 3600,
    }
  };
  const unity = mins.culture?.socialUnity || 80;
  const propaganda = mins.culture?.propagandaLevel || 1;
  if (newState.gameTick % 60 === 0) {
    const hasAlliances = (newState.aiPlanets || []).some(ai => ai.alliance);
    const repGrowth = (unity > 70 ? 0.1 : 0) + (hasAlliances ? 0.2 : 0);
    newState.reputation = Math.min(100, (newState.reputation || 0) + repGrowth);
    const infGrowth = 1 + (propaganda * 0.5) + (unity > 90 ? 1 : 0);
    newState.influence = (newState.influence || 0) + infGrowth;
  }
  return newState;
};

export const processQueues = (newState) => {
  // Retrofit queue
  const newRetrofitQueue = [];
  for (const item of newState.retrofitQueue || []) {
    if (Date.now() >= item.endTime) {
      if (item.type === 'fleet') {
        newState = updatePlanet(newState, item.planetId, p => ({
          ...p,
          fleet: Object.entries(item.fleetSnapshot).reduce((acc, [id, qty]) => { acc[id] = (acc[id] || 0) + qty; return acc; }, { ...p.fleet }),
          retrofitTech: { weapons: newState.research.weapons || 0, shields: newState.research.shields || 0, armour: newState.research.armour || 0, combustion: newState.research.combustion || 0, impulse: newState.research.impulse || 0, hyperspace: newState.research.hyperspace || 0 },
        }));
      } else if (item.type === 'defense') {
        newState = updatePlanet(newState, item.planetId, p => ({
          ...p,
          defenses: Object.entries(item.defenseSnapshot).reduce((acc, [id, qty]) => { acc[id] = (acc[id] || 0) + qty; return acc; }, { ...p.defenses }),
          retrofitTech: { weapons: newState.research.weapons || 0, shields: newState.research.shields || 0, armour: newState.research.armour || 0 },
        }));
      }
      newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: `🔧 Modernización completada en ${item.planetId === newState.currentPlanetId ? 'planeta actual' : 'colonia'}`, timestamp: Date.now() }];
    } else {
      newRetrofitQueue.push(item);
    }
  }
  newState.retrofitQueue = newRetrofitQueue;

  // Build queue
  const newBuildQueue = [];
  for (const item of newState.buildQueue) {
    if (Date.now() >= item.endTime) {
      const planet = newState.planets.find(p => p.id === item.planetId);
      const oldLevel = planet?.buildings?.[item.buildingId] || 0;
      newState = updatePlanet(newState, item.planetId, p => ({
        ...p,
        buildings: { ...p.buildings, [item.buildingId]: (p.buildings[item.buildingId] || 0) + 1 },
      }));
      if (!item.auto) {
        newState.notifications = [...newState.notifications, {
          id: uid(), type: 'success', message: `🏗️ ${BUILDINGS[item.buildingId].name} mejorado a nivel ${oldLevel + 1}`, timestamp: Date.now(),
        }];
      }
      newState.stats = { ...newState.stats, totalBuildings: newState.stats.totalBuildings + 1 };
    } else {
      newBuildQueue.push(item);
    }
  }
  newState.buildQueue = newBuildQueue;

  // Research queue
  const newResearchQueue = [];
  for (const item of newState.researchQueue) {
    if (Date.now() >= item.endTime) {
      const oldLevel = newState.research[item.researchId] || 0;
      newState.research = { ...newState.research, [item.researchId]: oldLevel + 1 };
      const newLvl = oldLevel + 1;
      newState.stats = { ...newState.stats, totalResearch: newState.stats.totalResearch + 1, maxTechLevel: Math.max(newState.stats.maxTechLevel || 0, newLvl) };
      if (!item.auto) {
        newState.notifications = [...(newState.notifications || []), {
          id: uid(), type: 'success', message: `🔬 ${RESEARCH[item.researchId].name} nivel ${newLvl}`, timestamp: Date.now(),
        }];
      }
    } else {
      newResearchQueue.push(item);
    }
  }
  newState.researchQueue = newResearchQueue;

  // Apply tech immediately to retrofitTech
  newState.planets = newState.planets.map(p => {
    const retrofitFields = ['weapons','shields','armour','combustion','impulse','hyperspace'];
    const newRetrofit = { ...(p.retrofitTech || {}) };
    let changed = false;
    for (const f of retrofitFields) {
      if ((newRetrofit[f] || 0) < (newState.research[f] || 0)) {
        newRetrofit[f] = newState.research[f] || 0;
        changed = true;
      }
    }
    return changed ? { ...p, retrofitTech: newRetrofit } : p;
  });

  // Ship queue - unidad por unidad
  const newShipQueue = [];
  for (const item of newState.shipQueue) {
    const now = Date.now();
    const totalDuration = item.endTime - item.startTime;
    const totalQty = item.quantity;
    if (totalQty <= 0 || totalDuration <= 0) continue;

    const unitTime = totalDuration / totalQty;
    const elapsedTime = now - item.startTime;
    const completedUnits = Math.min(totalQty, Math.floor(elapsedTime / unitTime));
    const newlyCompleted = completedUnits - (item.unitsDelivered || 0);

    if (newlyCompleted > 0) {
      newState = updatePlanet(newState, item.planetId, p => ({
        ...p,
        fleet: { ...p.fleet, [item.shipId]: (p.fleet[item.shipId] || 0) + newlyCompleted },
      }));
      newState.notifications = [...(newState.notifications || []), {
        id: uid(), type: 'success', message: `🚀 ${newlyCompleted}x ${SHIPS[item.shipId]?.name || item.shipId} listo(s)`, timestamp: Date.now(),
      }];
      newState.stats = { ...newState.stats, totalShips: newState.stats.totalShips + newlyCompleted };
    }

    if (completedUnits >= totalQty || now >= item.endTime) {
      // Completada toda la tanda
    } else {
      newShipQueue.push({
        ...item,
        unitsDelivered: completedUnits
      });
    }
  }
  newState.shipQueue = newShipQueue;

  // Defense queue - unidad por unidad
  const newDefenseQueue = [];
  for (const item of newState.defenseQueue) {
    const now = Date.now();
    const totalDuration = item.endTime - item.startTime;
    const totalQty = item.quantity;
    if (totalQty <= 0 || totalDuration <= 0) continue;

    const unitTime = totalDuration / totalQty;
    const elapsedTime = now - item.startTime;
    const completedUnits = Math.min(totalQty, Math.floor(elapsedTime / unitTime));
    const newlyCompleted = completedUnits - (item.unitsDelivered || 0);

    if (newlyCompleted > 0) {
      newState = updatePlanet(newState, item.planetId, p => ({
        ...p,
        defenses: { ...p.defenses, [item.defenseId]: (p.defenses[item.defenseId] || 0) + newlyCompleted },
      }));
      if (!item.auto) {
        newState.notifications = [...(newState.notifications || []), {
          id: uid(), type: 'success', message: `🛡️ ${newlyCompleted}x ${DEFENSES[item.defenseId]?.name || item.defenseId} construido(s)`, timestamp: Date.now(),
        }];
      }
      newState.stats = { ...newState.stats, totalDefenses: newState.stats.totalDefenses + newlyCompleted };
    }

    if (completedUnits >= totalQty || now >= item.endTime) {
      // Completada toda la tanda
    } else {
      newDefenseQueue.push({
        ...item,
        unitsDelivered: completedUnits
      });
    }
  }
  newState.defenseQueue = newDefenseQueue;

  // Custom ship queue
  const newCustomQueue = [];
  let customNotifSent = false;
  for (const item of newState.customShipQueue || []) {
    if (Date.now() >= item.endTime) {
      const bp = newState.blueprints.find(b => b.id === item.blueprintId);
      if (bp) {
        newState = updatePlanet(newState, item.planetId, p => ({
          ...p,
          fleet: { ...p.fleet, ['custom_' + bp.id]: (p.fleet['custom_' + bp.id] || 0) + item.quantity },
        }));
      }
      if (!customNotifSent) {
        newState.notifications = [...(newState.notifications || []), {
          id: uid(), type: 'success', message: `🔧 ${item.quantity}x nave personalizada lista`, timestamp: Date.now(),
        }];
        customNotifSent = true;
      }
    } else {
      newCustomQueue.push(item);
    }
  }
  newState.customShipQueue = newCustomQueue;

  return newState;
};
