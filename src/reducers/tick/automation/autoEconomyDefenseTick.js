import {
  DEFENSES, defenseCost, clampResources, deduct, canAfford, meetsResearchReq,
  calcDefenseTime, uid, GAME_SPEED
} from '../../../core.jsx';
import { stampTimeMult } from '../queues/queueTiming.js';

export const processAutoEconomyDefenseTick = (state) => {
  let newState = { ...state };

  // 1. AUTO-ECONOMY
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
      
      const nextBusinesses = {
        ...currentBusinesses,
        [businessType]: (currentBusinesses[businessType] || 0) + 1
      };
      
      return {
        ...planet,
        resources: deduct(planet.resources, cost),
        civilBusinesses: nextBusinesses
      };
    }
    return planet;
  });

  // 2. AUTO-DEFENSE
  newState.planets = newState.planets.map(planet => {
    // Solo si el ministerio de defensa está explícitamente activado en este planeta
    const pDef = planet.ministries?.defense;
    if (!pDef?.automationEnabled) return planet;

    // Regla de viabilidad económica: NO arruinar colonias nacientes
    const b = planet.buildings || {};
    const metalM = b.metalMine || 0;
    const crystalM = b.crystalMine || 0;
    const energyBal = planet.energyBalance ?? 0;
    const res = planet.resources || { metal: 0, crystal: 0, deuterium: 0 };

    // Si la colonia no tiene minas básicas desarrolladas o energía estable, preservar recursos para infraestructura
    if (metalM < 3 || crystalM < 2 || energyBal < 5 || (res.metal || 0) < 5000) {
      return planet;
    }

    const isAlreadyDefendingType = (dId) => newState.defenseQueue && newState.defenseQueue.some(q => q.planetId === planet.id && q.defenseId === dId);
    if (isAlreadyDefendingType('rocketLauncher')) return planet;

    const defenseId = 'rocketLauncher';
    const cost = defenseCost(defenseId, 1, planet.buildings?.constructionCenter || 0);
    if (canAfford(planet.resources, cost) && meetsResearchReq(DEFENSES[defenseId].req, { ...planet.buildings, ...newState.research })) {
      const newRes = clampResources(deduct(planet.resources, cost));
      const defenseTimeVal = calcDefenseTime(defenseId, 1, planet.buildings?.shipyard || 0, planet.buildings?.naniteFactory || 0, GAME_SPEED);
      const startTime = Date.now();
      const endTime = startTime + defenseTimeVal * 1000;

      newState.defenseQueue = [...(newState.defenseQueue || []), stampTimeMult(newState, 'defense', {
        id: uid(),
        planetId: planet.id,
        defenseId,
        quantity: 1,
        startTime,
        endTime,
        auto: true
      })];

      return {
        ...planet,
        resources: newRes
      };
    }
    return planet;
  });

  return newState;
};
