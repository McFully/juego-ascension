import {
  updatePlanet, fmt, uid, constructionDiscount, canAfford, deduct
} from '../../core.jsx';
import { MISSILES, DEFENSES } from '../../data/gameData.js';

export const handleBuildMissile = (state, action) => {
  const { missileId, quantity } = action;
  const planet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!planet) return state;
  const siloLevel = planet.buildings.missileSilo || 0;
  if (siloLevel < 1) return state;
  const m = MISSILES[missileId];
  if (!m) return state;
  const maxMissiles = siloLevel * 10;
  const currentTotalUsed = Object.values(planet.missiles || {}).reduce((a, b) => a + b, 0);
  const spaceAvailable = Math.max(0, maxMissiles - currentTotalUsed);
  if (spaceAvailable <= 0) {
    return {
      ...state,
      notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: '🎯 Silo de Misiles al máximo de capacidad.', timestamp: Date.now() }]
    };
  }
  const actualQty = Math.min(quantity, spaceAvailable);
  const missileDisc = constructionDiscount(planet.buildings?.constructionCenter || 0);
  const cost = { metal: m.cost.m * actualQty * missileDisc, crystal: m.cost.c * actualQty * missileDisc, deuterium: (m.cost.d || 0) * actualQty * missileDisc };
  if (!canAfford(planet.resources, cost)) return state;

  const newRes = deduct(planet.resources, cost);
  let newState = updatePlanet(state, planet.id, p => ({
    ...p, resources: newRes,
    missiles: { ...(p.missiles || {}), [missileId]: ((p.missiles || {})[missileId] || 0) + actualQty },
  }));
  newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: `☄️ ${actualQty}x ${m.name} construidos`, timestamp: Date.now() }];
  return newState;
};

export const handleLaunchMissile = (state, action) => {
  const { targetGalaxy, targetSystem, targetPosition, quantity } = action;
  const planet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!planet) return state;
  const have = (planet.missiles || {}).interplanetaryMissile || 0;
  if (have < quantity) return state;

  // Find target
  const target = state.aiPlanets.find(p => p.galaxy === targetGalaxy && p.system === targetSystem && p.position === targetPosition);
  if (!target) return state;

  // Auto-ABM: target may fire ABMs
  let missilesHit = quantity;
  const targetABMs = (target.missiles || {}).antiBallisticMissile || 0;
  if (targetABMs > 0) {
    const abmDestroy = Math.min(targetABMs, Math.ceil(quantity * 0.7 + Math.random() * 0.3 * quantity));
    missilesHit = Math.max(0, quantity - abmDestroy);
    let newAIPlanets = state.aiPlanets.map(p => {
      if (p.id === target.id) {
        const miss = { ...(p.missiles || {}) };
        miss.antiBallisticMissile = Math.max(0, (miss.antiBallisticMissile || 0) - abmDestroy);
        if (miss.antiBallisticMissile <= 0) delete miss.antiBallisticMissile;
        return { ...p, missiles: miss };
      }
      return p;
    });
    let newState1 = { ...state, aiPlanets: newAIPlanets };
    if (missilesHit <= 0) {
      newState1 = updatePlanet(newState1, planet.id, p => ({
        ...p, missiles: { ...p.missiles, interplanetaryMissile: Math.max(0, (p.missiles?.interplanetaryMissile || 0) - quantity) }
      }));
      newState1.notifications = [...(newState1.notifications || []), { id: uid(), type: 'warning', message: `🛡️ Misiles antibalísticos destruyeron todos tus misiles`, timestamp: Date.now() }];
      return newState1;
    }
  }

  // Apply missile damage to target
  const dmgPerMissile = MISSILES.interplanetaryMissile.atk;
  const totalDmg = dmgPerMissile * missilesHit;
  let newAIPlanets2 = state.aiPlanets.map(p => {
    if (p.id === target.id) {
      // Damage defenses first, then buildings
      let remainingDmg = totalDmg;
      const newDefenses = { ...(p.defenses || {}) };
      const defOrder = ['smallShieldDome', 'largeShieldDome', 'plasmaTurret', 'gaussCannon', 'ionCannon', 'heavyLaser', 'lightLaser', 'rocketLauncher'];
      for (const defId of defOrder) {
        if (remainingDmg <= 0) break;
        const qty = newDefenses[defId] || 0;
        if (qty > 0) {
          const defHull = (DEFENSES[defId]?.hull || 100);
          const destroyed = Math.min(qty, Math.ceil(remainingDmg / defHull));
          newDefenses[defId] = qty - destroyed;
          if (newDefenses[defId] <= 0) delete newDefenses[defId];
          remainingDmg -= destroyed * defHull;
        }
      }
      // Damage random buildings
      const newBuildings = { ...(p.buildings || {}) };
      const bldIds = Object.keys(newBuildings).filter(k => newBuildings[k] > 0);
      while (remainingDmg > 0 && bldIds.length > 0) {
        const idx = Math.floor(Math.random() * bldIds.length);
        const bldId = bldIds[idx];
        const lvl = newBuildings[bldId];
        const reduction = Math.max(0, Math.min(lvl, Math.ceil(remainingDmg / 5000)));
        newBuildings[bldId] = lvl - reduction;
        if (newBuildings[bldId] <= 0) delete newBuildings[bldId];
        remainingDmg -= reduction * 5000;
        bldIds.splice(idx, 1);
      }
      return { ...p, defenses: newDefenses, buildings: newBuildings };
    }
    return p;
  });

  // Deduct missiles from player
  let newState = { ...state, aiPlanets: newAIPlanets2 };
  newState = updatePlanet(newState, planet.id, p => ({
    ...p, missiles: { ...p.missiles, interplanetaryMissile: Math.max(0, (p.missiles?.interplanetaryMissile || 0) - quantity) }
  }));
  const msg = targetABMs > 0
    ? `☄️ Misil impactó ${target.name}. ${missilesHit}/${quantity} superaron ABMs. Daño: ${fmt(totalDmg)}`
    : `☄️ Misil impactó ${target.name}. Daño: ${fmt(totalDmg)}`;
  newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: msg, timestamp: Date.now() }];
  return newState;
};

export const ORDNANCE_BATCHES = {
  heavyMissiles: {
    id: 'heavyMissiles',
    name: 'Cohetes Pesados',
    icon: '🚀',
    batchSize: 50,
    cost: { metal: 2500, crystal: 500, deuterium: 250 },
    creditsCost: 50,
    usedBy: 'Lanzamisiles, Cruceros y Bombarderos'
  },
  kineticShells: {
    id: 'kineticShells',
    name: 'Obuses Cinéticos Gauss',
    icon: '🎯',
    batchSize: 100,
    cost: { metal: 4000, crystal: 1000, deuterium: 200 },
    creditsCost: 80,
    usedBy: 'Cañones Gauss y Acorazados'
  },
  plasmaCells: {
    id: 'plasmaCells',
    name: 'Células de Plasma',
    icon: '🟣',
    batchSize: 50,
    cost: { metal: 2000, crystal: 3000, deuterium: 1500 },
    creditsCost: 120,
    usedBy: 'Torres de Plasma y Destructores'
  }
};

export const handleBuildOrdnance = (state, action) => {
  const { ammoType, batches = 1 } = action;
  const planet = state.planets.find(p => p.id === (action.planetId || state.currentPlanetId)) || state.planets[0];
  if (!planet) return state;

  const spec = ORDNANCE_BATCHES[ammoType];
  if (!spec) return state;

  const qtyBatches = Math.max(1, Math.floor(Number(batches) || 1));
  const disc = constructionDiscount(planet.buildings?.constructionCenter || 0);
  const totalCost = {
    metal: Math.floor(spec.cost.metal * qtyBatches * disc),
    crystal: Math.floor(spec.cost.crystal * qtyBatches * disc),
    deuterium: Math.floor(spec.cost.deuterium * qtyBatches * disc),
  };
  const totalCredits = Math.floor((spec.creditsCost || 0) * qtyBatches);

  if (!canAfford(planet.resources, totalCost) || (state.credits ?? 0) < totalCredits) {
    return {
      ...state,
      notifications: [
        ...(state.notifications || []),
        {
          id: uid(),
          type: 'warning',
          message: (state.credits ?? 0) < totalCredits
            ? `💸 Créditos insuficientes para fabricar ${spec.name} (Requiere ${totalCredits} Cr).`
            : `⚠️ Recursos insuficientes en ${planet.name} para fabricar ${spec.name}.`,
          timestamp: Date.now()
        }
      ]
    };
  }

  const totalUnitsAdded = spec.batchSize * qtyBatches;
  const newRes = deduct(planet.resources, totalCost);
  const currentArsenal = planet.arsenal || { heavyMissiles: 100, kineticShells: 500, plasmaCells: 250 };

  let newState = updatePlanet(state, planet.id, p => ({
    ...p,
    resources: newRes,
    arsenal: {
      ...currentArsenal,
      [ammoType]: (currentArsenal[ammoType] ?? 0) + totalUnitsAdded
    }
  }));

  newState.credits = Math.max(0, (state.credits ?? 0) - totalCredits);
  newState.notifications = [
    ...(newState.notifications || []),
    {
      id: uid(),
      type: 'success',
      message: `${spec.icon} Polvorín abastecido: +${totalUnitsAdded} ${spec.name} en ${planet.name}.`,
      timestamp: Date.now()
    }
  ];
  return newState;
};

