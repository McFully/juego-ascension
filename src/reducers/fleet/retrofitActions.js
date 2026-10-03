import { uid, updatePlanet, canAfford, deduct, calcCustomShipCost } from '../../core.jsx';
import { SHIPS, DEFENSES, GAME_SPEED } from '../../data/gameData.js';
import {
  extractShipTechSnapshot,
  extractDefenseTechSnapshot,
  calculateTechGeneration,
  getVariantKey,
  isVariantOutdated,
  calculateRetrofitUnitCost,
  calculateRetrofitUnitTime
} from '../../utils/formulas/retrofitFormulas.js';
import { stampTimeMult } from '../tick/queues/queueTiming.js';

/**
 * Moderniza una variante de naves específica en el planeta
 */
export const handleRetrofitShipVariant = (state, action) => {
  const { variantKey, count, planetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const planet = state.planets.find(p => p.id === targetPlanetId) || state.planets[0];
  if (!planet) return state;

  let variant = planet.fleetVariants?.[variantKey];
  // Si no existe la variante exacta (por ejemplo, save antiguo/legacy con naves no versionadas)
  if (!variant && variantKey && variantKey.endsWith('__legacy')) {
    const baseId = variantKey.replace('__legacy', '');
    const currentQty = planet.fleet?.[baseId] || 0;
    if (currentQty > 0) {
      variant = {
        baseId,
        variantKey,
        techGen: 1,
        techSnapshot: {},
        count: currentQty
      };
    }
  }

  if (!variant || !variant.count || variant.count <= 0) {
    return {
      ...state,
      notifications: [
        ...(state.notifications || []),
        { id: uid(), type: 'warning', message: '⚠️ No hay unidades disponibles para modernizar en esta dársena.', timestamp: Date.now() }
      ]
    };
  }

  const qtyToRetrofit = Math.min(variant.count, count && count > 0 ? count : variant.count);
  if (qtyToRetrofit <= 0) return state;

  if ((state.retrofitQueue || []).length >= 5) {
    return {
      ...state,
      notifications: [
        ...(state.notifications || []),
        { id: uid(), type: 'warning', message: '⚠️ Dársenas de modernización saturadas (5/5 en curso). Espera a que finalice una orden.', timestamp: Date.now() }
      ]
    };
  }

  const currentTech = extractShipTechSnapshot(state.research || {});
  const unitCost = calculateRetrofitUnitCost(variant.baseId, variant.techSnapshot, currentTech, 'ship');
  const totalCost = {
    metal: unitCost.metal * qtyToRetrofit,
    crystal: unitCost.crystal * qtyToRetrofit,
    deuterium: unitCost.deuterium * qtyToRetrofit
  };

  if (!canAfford(planet.resources, totalCost)) {
    return {
      ...state,
      notifications: [
        ...(state.notifications || []),
        { id: uid(), type: 'warning', message: `⚠️ Recursos insuficientes para modernizar ${qtyToRetrofit}x ${SHIPS[variant.baseId]?.name || variant.baseId}.`, timestamp: Date.now() }
      ]
    };
  }

  const unitTime = calculateRetrofitUnitTime(
    variant.baseId,
    variant.techSnapshot,
    currentTech,
    planet.buildings?.shipyard || 1,
    planet.buildings?.naniteFactory || 0,
    GAME_SPEED,
    'ship'
  );
  const totalTime = Math.max(5, Math.floor(unitTime * qtyToRetrofit));

  // Deducción de recursos y retiro temporal de la variante del planeta
  let newState = updatePlanet(state, planet.id, p => {
    const updatedVariants = { ...(p.fleetVariants || {}) };
    const remaining = variant.count - qtyToRetrofit;
    if (remaining > 0) {
      updatedVariants[variantKey] = { ...variant, count: remaining };
    } else {
      delete updatedVariants[variantKey];
    }

    const updatedFleet = { ...(p.fleet || {}) };
    updatedFleet[variant.baseId] = Math.max(0, (updatedFleet[variant.baseId] || 0) - qtyToRetrofit);

    return {
      ...p,
      resources: deduct(p.resources, totalCost),
      fleet: updatedFleet,
      fleetVariants: updatedVariants
    };
  });

  newState.retrofitQueue = [...(state.retrofitQueue || []), stampTimeMult(newState, 'retrofit', {
    id: uid(),
    planetId: planet.id,
    type: 'ship_variant',
    baseId: variant.baseId,
    quantity: qtyToRetrofit,
    fromVariantKey: variantKey,
    fromVariantSnapshot: variant.techSnapshot,
    fromVariantStats: variant.stats,
    targetTechSnapshot: currentTech,
    targetTechGen: calculateTechGeneration(currentTech),
    unitsDelivered: 0,
    unitCost,
    startTime: Date.now(),
    endTime: Date.now() + totalTime * 1000,
  })];

  newState.notifications = [...(newState.notifications || []), {
    id: uid(),
    type: 'info',
    message: `🔧 Modernizando ${qtyToRetrofit}x ${SHIPS[variant.baseId]?.name || variant.baseId} al estándar de vanguardia`,
    timestamp: Date.now()
  }];

  return newState;
};

/**
 * Moderniza una variante de defensas específica en el planeta
 */
export const handleRetrofitDefenseVariant = (state, action) => {
  const { variantKey, count, planetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const planet = state.planets.find(p => p.id === targetPlanetId) || state.planets[0];
  if (!planet) return state;

  let variant = planet.defenseVariants?.[variantKey];
  if (!variant && variantKey && variantKey.endsWith('__legacy')) {
    const baseId = variantKey.replace('__legacy', '');
    const currentQty = planet.defenses?.[baseId] || 0;
    if (currentQty > 0) {
      variant = {
        baseId,
        variantKey,
        techGen: 1,
        techSnapshot: {},
        count: currentQty
      };
    }
  }

  if (!variant || !variant.count || variant.count <= 0) {
    return {
      ...state,
      notifications: [
        ...(state.notifications || []),
        { id: uid(), type: 'warning', message: '⚠️ No hay baterías defensivas disponibles para calibrar.', timestamp: Date.now() }
      ]
    };
  }

  const qtyToRetrofit = Math.min(variant.count, count && count > 0 ? count : variant.count);
  if (qtyToRetrofit <= 0) return state;

  if ((state.retrofitQueue || []).length >= 5) {
    return {
      ...state,
      notifications: [
        ...(state.notifications || []),
        { id: uid(), type: 'warning', message: '⚠️ Línea de modernización saturada (5/5 en curso). Espera a que termine un ensamblaje.', timestamp: Date.now() }
      ]
    };
  }

  const currentTech = extractDefenseTechSnapshot(state.research || {});
  const unitCost = calculateRetrofitUnitCost(variant.baseId, variant.techSnapshot, currentTech, 'defense');
  const totalCost = {
    metal: unitCost.metal * qtyToRetrofit,
    crystal: unitCost.crystal * qtyToRetrofit,
    deuterium: unitCost.deuterium * qtyToRetrofit
  };

  if (!canAfford(planet.resources, totalCost)) {
    return {
      ...state,
      notifications: [
        ...(state.notifications || []),
        { id: uid(), type: 'warning', message: `⚠️ Recursos insuficientes para calibrar ${qtyToRetrofit}x ${DEFENSES[variant.baseId]?.name || variant.baseId}.`, timestamp: Date.now() }
      ]
    };
  }

  const unitTime = calculateRetrofitUnitTime(
    variant.baseId,
    variant.techSnapshot,
    currentTech,
    planet.buildings?.shipyard || 1,
    planet.buildings?.naniteFactory || 0,
    GAME_SPEED,
    'defense'
  );
  const totalTime = Math.max(5, Math.floor(unitTime * qtyToRetrofit));

  let newState = updatePlanet(state, planet.id, p => {
    const updatedVariants = { ...(p.defenseVariants || {}) };
    const remaining = variant.count - qtyToRetrofit;
    if (remaining > 0) {
      updatedVariants[variantKey] = { ...variant, count: remaining };
    } else {
      delete updatedVariants[variantKey];
    }

    const updatedDefenses = { ...(p.defenses || {}) };
    updatedDefenses[variant.baseId] = Math.max(0, (updatedDefenses[variant.baseId] || 0) - qtyToRetrofit);

    return {
      ...p,
      resources: deduct(p.resources, totalCost),
      defenses: updatedDefenses,
      defenseVariants: updatedVariants
    };
  });

  newState.retrofitQueue = [...(state.retrofitQueue || []), stampTimeMult(newState, 'retrofit', {
    id: uid(),
    planetId: planet.id,
    type: 'defense_variant',
    baseId: variant.baseId,
    quantity: qtyToRetrofit,
    fromVariantKey: variantKey,
    fromVariantSnapshot: variant.techSnapshot,
    fromVariantStats: variant.stats,
    targetTechSnapshot: currentTech,
    targetTechGen: calculateTechGeneration(currentTech),
    unitsDelivered: 0,
    unitCost,
    startTime: Date.now(),
    endTime: Date.now() + totalTime * 1000,
  })];

  newState.notifications = [...(newState.notifications || []), {
    id: uid(),
    type: 'info',
    message: `🔧 Modernizando ${qtyToRetrofit}x ${DEFENSES[variant.baseId]?.name || variant.baseId} al estándar de vanguardia`,
    timestamp: Date.now()
  }];

  return newState;
};

/**
 * Cancela una modernización en cola devolviendo el 50% de recursos restantes y restaurando las unidades no procesadas
 */
export const handleCancelRetrofitQueue = (state, action) => {
  const { queueId } = action;
  const item = (state.retrofitQueue || []).find(q => q.id === queueId);
  if (!item) return state;

  const delivered = item.unitsDelivered || 0;
  const remainingQty = Math.max(0, item.quantity - delivered);

  let newState = {
    ...state,
    retrofitQueue: (state.retrofitQueue || []).filter(q => q.id !== queueId)
  };

  if (remainingQty > 0) {
    const refundFactor = 0.5;
    const unitCost = item.unitCost || { metal: 0, crystal: 0, deuterium: 0 };
    const refund = {
      metal: Math.floor(unitCost.metal * remainingQty * refundFactor),
      crystal: Math.floor(unitCost.crystal * remainingQty * refundFactor),
      deuterium: Math.floor(unitCost.deuterium * remainingQty * refundFactor)
    };

    newState = updatePlanet(newState, item.planetId, p => {
      if (item.type === 'ship_variant') {
        const variants = { ...(p.fleetVariants || {}) };
        const key = item.fromVariantKey;
        const existing = variants[key] || {
          baseId: item.baseId,
          variantKey: key,
          techGen: calculateTechGeneration(item.fromVariantSnapshot || {}),
          techSnapshot: item.fromVariantSnapshot || {},
          stats: item.fromVariantStats,
          count: 0
        };
        existing.count = (existing.count || 0) + remainingQty;
        variants[key] = existing;

        const fleet = { ...(p.fleet || {}) };
        fleet[item.baseId] = (fleet[item.baseId] || 0) + remainingQty;

        return {
          ...p,
          fleet,
          fleetVariants: variants,
          resources: {
            metal: (p.resources?.metal || 0) + refund.metal,
            crystal: (p.resources?.crystal || 0) + refund.crystal,
            deuterium: (p.resources?.deuterium || 0) + refund.deuterium
          }
        };
      } else if (item.type === 'defense_variant') {
        const variants = { ...(p.defenseVariants || {}) };
        const key = item.fromVariantKey;
        const existing = variants[key] || {
          baseId: item.baseId,
          variantKey: key,
          techGen: calculateTechGeneration(item.fromVariantSnapshot || {}),
          techSnapshot: item.fromVariantSnapshot || {},
          stats: item.fromVariantStats,
          count: 0
        };
        existing.count = (existing.count || 0) + remainingQty;
        variants[key] = existing;

        const defenses = { ...(p.defenses || {}) };
        defenses[item.baseId] = (defenses[item.baseId] || 0) + remainingQty;

        return {
          ...p,
          defenses,
          defenseVariants: variants,
          resources: {
            metal: (p.resources?.metal || 0) + refund.metal,
            crystal: (p.resources?.crystal || 0) + refund.crystal,
            deuterium: (p.resources?.deuterium || 0) + refund.deuterium
          }
        };
      }
      return p;
    });

    newState.notifications = [...(newState.notifications || []), {
      id: uid(),
      type: 'warning',
      message: `✕ Cancelada modernización de ${remainingQty}x unidades (Reembolso 50%)`,
      timestamp: Date.now()
    }];
  }

  return newState;
};

/**
 * Moderniza todas las naves obsoletas posibles del planeta en lote
 */
export const handleRetrofitAllFleet = (state, action) => {
  const planet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!planet) return state;

  const currentTech = extractShipTechSnapshot(state.research || {});
  const obsoleteVariants = Object.values(planet.fleetVariants || {})
    .filter(v => v && v.count > 0 && isVariantOutdated(v.techSnapshot, currentTech, 'ship'));

  if (obsoleteVariants.length === 0) return state;

  let tempState = state;
  for (const v of obsoleteVariants) {
    tempState = handleRetrofitShipVariant(tempState, { variantKey: v.variantKey, count: v.count });
  }
  return tempState;
};

/**
 * Moderniza todas las defensas obsoletas posibles del planeta en lote
 */
export const handleRetrofitAllDefenses = (state, action) => {
  const planet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!planet) return state;

  const currentTech = extractDefenseTechSnapshot(state.research || {});
  const obsoleteVariants = Object.values(planet.defenseVariants || {})
    .filter(v => v && v.count > 0 && isVariantOutdated(v.techSnapshot, currentTech, 'defense'));

  if (obsoleteVariants.length === 0) return state;

  let tempState = state;
  for (const v of obsoleteVariants) {
    tempState = handleRetrofitDefenseVariant(tempState, { variantKey: v.variantKey, count: v.count });
  }
  return tempState;
};

// Mantener compatibilidad con llamadas existentes
export const handleRetrofitFleet = handleRetrofitAllFleet;
export const handleRetrofitDefenses = handleRetrofitAllDefenses;
