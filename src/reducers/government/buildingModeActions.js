import { updatePlanet, deduct, uid } from '../../core.jsx';

export const handleSetBuildingMode = (state, action) => {
  const { planetId, buildingId, modeId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  return updatePlanet(state, targetPlanetId, p => ({
    ...p,
    buildingModes: {
      ...(p.buildingModes || {}),
      [buildingId]: modeId
    }
  }));
};

export const handleToggleAutomationRestriction = (state, action) => {
  const { planetId, targetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  return updatePlanet(state, targetPlanetId, p => {
    const currentExclusions = p.automatedExclusions || {};
    const isCurrentlyRestricted = Boolean(currentExclusions[targetId]);
    const nextExclusions = { ...currentExclusions };
    if (isCurrentlyRestricted) {
      delete nextExclusions[targetId];
    } else {
      nextExclusions[targetId] = true;
    }
    return {
      ...p,
      automatedExclusions: nextExclusions
    };
  });
};

export const handleExecuteBuildingAction = (state, action) => {
  const { planetId, buildingId, actionId, cost } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const planet = state.planets?.find(p => p.id === targetPlanetId);
  if (!planet) return state;

  let nextRes = { ...planet.resources };
  if (cost) {
    if (cost.metal && (nextRes.metal || 0) < cost.metal) return state;
    if (cost.crystal && (nextRes.crystal || 0) < cost.crystal) return state;
    if (cost.deuterium && (nextRes.deuterium || 0) < cost.deuterium) return state;
    nextRes = deduct(nextRes, cost);
  }

  let bonusMsg = `⚙️ Protocolo ejecutado en ${planet.name}.`;
  if (actionId === 'detonateVein') {
    nextRes.metal = (nextRes.metal || 0) + 1500;
    bonusMsg = `⛏️ Detonación sísmica completada: +1.500 Metal en ${planet.name}.`;
  } else if (actionId === 'harvestGems') {
    nextRes.crystal = (nextRes.crystal || 0) + 1000;
    bonusMsg = `💎 Prismas recolectados: +1.000 Cristal en ${planet.name}.`;
  } else if (actionId === 'purgePlasma') {
    nextRes.deuterium = (nextRes.deuterium || 0) + 600;
    bonusMsg = `⚗️ Purga de plasma completada: +600 Deuterio en ${planet.name}.`;
  } else if (actionId === 'smeltReserves') {
    nextRes.metal = (nextRes.metal || 0) + 2000;
    bonusMsg = `🏭 Colada continua completada: +2.000 Metal en ${planet.name}.`;
  }

  let ns = updatePlanet(state, targetPlanetId, p => ({
    ...p,
    resources: nextRes
  }));

  ns.notifications = [...(ns.notifications || []), {
    id: uid(),
    type: 'info',
    message: bonusMsg,
    timestamp: Date.now()
  }];
  return ns;
};
