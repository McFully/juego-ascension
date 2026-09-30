import {
  BUILDINGS, RESEARCH, SHIPS, DEFENSES,
  uid, researchCost, clampResources, meetsResearchReq, updatePlanet
} from '../../../core.jsx';
import { getShipStats, getDefenseStats } from '../../../utils/formulas/combatFormulas.js';
import {
  extractShipTechSnapshot, extractDefenseTechSnapshot, calculateTechGeneration,
  getVariantKey, calculateRetrofitUnitCost, calculateRetrofitUnitTime
} from '../../../utils/formulas/retrofitFormulas.js';
import { generateRegistryCode } from '../../../utils/shipRegistryBridge.js';

export const processAllQueuesTick = (state) => {
  let newState = { ...state };
  const now = Date.now();

  // 1. Retrofit queue (unit-by-unit progressive delivery)
  const newRetrofitQueue = [];
  for (const item of state.retrofitQueue || []) {
    if (item.type === 'ship_variant') {
      const totalDuration = item.endTime - item.startTime;
      const totalQty = item.quantity;
      if (totalQty <= 0 || totalDuration <= 0) continue;

      const unitTime = totalDuration / totalQty;
      const elapsedTime = now - item.startTime;
      const completedUnits = Math.min(totalQty, Math.floor(elapsedTime / unitTime));
      const newlyCompleted = completedUnits - (item.unitsDelivered || 0);

      if (newlyCompleted > 0) {
        const pTarget = newState.planets?.find(pl => pl.id === item.planetId);
        const techSnap = item.targetTechSnapshot || extractShipTechSnapshot(newState.research || {});
        const techGen = item.targetTechGen || calculateTechGeneration(techSnap);
        const variantKey = getVariantKey(item.baseId, techGen);
        const calculatedStats = getShipStats(item.baseId, techSnap, newState.blueprints, 'human', pTarget?.buildings || {}) || SHIPS[item.baseId];

        newState = updatePlanet(newState, item.planetId, p => {
          const updatedVariants = { ...(p.fleetVariants || {}) };
          const targetVariant = updatedVariants[variantKey] || {
            baseId: item.baseId,
            variantKey,
            techGen,
            techSnapshot: techSnap,
            stats: calculatedStats,
            count: 0
          };
          targetVariant.count = (targetVariant.count || 0) + newlyCompleted;
          targetVariant.stats = calculatedStats;
          updatedVariants[variantKey] = targetVariant;

          const updatedFleet = { ...(p.fleet || {}) };
          updatedFleet[item.baseId] = (updatedFleet[item.baseId] || 0) + newlyCompleted;

          return {
            ...p,
            fleet: updatedFleet,
            fleetVariants: updatedVariants
          };
        });

        newState.notifications = [...(newState.notifications || []), {
          id: uid(),
          type: 'success',
          message: `🔧 ${newlyCompleted}x ${SHIPS[item.baseId]?.name || item.baseId} modernizado(s) con éxito a Mk.${techGen}`,
          timestamp: now
        }];
      }

      if (completedUnits < totalQty && now < item.endTime) {
        newRetrofitQueue.push({ ...item, unitsDelivered: completedUnits });
      }
    } else if (item.type === 'defense_variant') {
      const totalDuration = item.endTime - item.startTime;
      const totalQty = item.quantity;
      if (totalQty <= 0 || totalDuration <= 0) continue;

      const unitTime = totalDuration / totalQty;
      const elapsedTime = now - item.startTime;
      const completedUnits = Math.min(totalQty, Math.floor(elapsedTime / unitTime));
      const newlyCompleted = completedUnits - (item.unitsDelivered || 0);

      if (newlyCompleted > 0) {
        const pTarget = newState.planets?.find(pl => pl.id === item.planetId);
        const techSnap = item.targetTechSnapshot || extractDefenseTechSnapshot(newState.research || {});
        const techGen = item.targetTechGen || calculateTechGeneration(techSnap);
        const variantKey = getVariantKey(item.baseId, techGen);
        const calculatedStats = getDefenseStats(item.baseId, techSnap, 'human', pTarget?.buildings || {}) || DEFENSES[item.baseId];

        newState = updatePlanet(newState, item.planetId, p => {
          const updatedVariants = { ...(p.defenseVariants || {}) };
          const targetVariant = updatedVariants[variantKey] || {
            baseId: item.baseId,
            variantKey,
            techGen,
            techSnapshot: techSnap,
            stats: calculatedStats,
            count: 0
          };
          targetVariant.count = (targetVariant.count || 0) + newlyCompleted;
          targetVariant.stats = calculatedStats;
          updatedVariants[variantKey] = targetVariant;

          const updatedDefenses = { ...(p.defenses || {}) };
          updatedDefenses[item.baseId] = (updatedDefenses[item.baseId] || 0) + newlyCompleted;

          return {
            ...p,
            defenses: updatedDefenses,
            defenseVariants: updatedVariants
          };
        });

        newState.notifications = [...(newState.notifications || []), {
          id: uid(),
          type: 'success',
          message: `🛡️ ${newlyCompleted}x ${DEFENSES[item.baseId]?.name || item.baseId} modernizado(s) con éxito a Mk.${techGen}`,
          timestamp: now
        }];
      }

      if (completedUnits < totalQty && now < item.endTime) {
        newRetrofitQueue.push({ ...item, unitsDelivered: completedUnits });
      }
    } else if (now >= item.endTime) {
      if (item.type === 'fleet') {
        newState = updatePlanet(newState, item.planetId, p => ({
          ...p,
          fleet: Object.entries(item.fleetSnapshot).reduce((acc, [id, qty]) => { acc[id] = (acc[id] || 0) + qty; return acc; }, { ...p.fleet }),
          retrofitTech: { weapons: state.research.weapons || 0, shields: state.research.shields || 0, armour: state.research.armour || 0, combustion: state.research.combustion || 0, impulse: state.research.impulse || 0, hyperspace: state.research.hyperspace || 0 },
        }));
        newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: `🔧 Modernización de flota completada`, timestamp: now }];
      } else if (item.type === 'defense') {
        newState = updatePlanet(newState, item.planetId, p => ({
          ...p,
          defenses: Object.entries(item.defenseSnapshot).reduce((acc, [id, qty]) => { acc[id] = (acc[id] || 0) + qty; return acc; }, { ...p.defenses }),
          retrofitTech: { weapons: state.research.weapons || 0, shields: state.research.shields || 0, armour: state.research.armour || 0 },
        }));
        newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: `🛡️ Modernización de defensas completada`, timestamp: now }];
      }
    } else {
      newRetrofitQueue.push(item);
    }
  }
  newState.retrofitQueue = newRetrofitQueue;

  // 2. Build queue
  const newBuildQueue = [];
  for (const item of state.buildQueue || []) {
    const validTimes = !isNaN(item.endTime) && !isNaN(item.startTime) && item.endTime > item.startTime;
    if (!validTimes) {
      console.warn('[Ascensión] Elemento de construcción corrupto detectado y purgado:', item);
      continue;
    }

    if (now >= item.endTime) {
      const planet = newState.planets?.find(p => p.id === item.planetId);
      const oldLevel = planet?.buildings?.[item.buildingId] || 0;
      newState = updatePlanet(newState, item.planetId, p => ({
        ...p,
        buildings: { ...p.buildings, [item.buildingId]: (p.buildings[item.buildingId] || 0) + 1 },
      }));
      if (!item.auto) {
        newState.notifications = [...(newState.notifications || []), {
          id: uid(), type: 'success', message: `🏗️ ${BUILDINGS[item.buildingId]?.name || item.buildingId} mejorado a nivel ${oldLevel + 1}`, timestamp: now,
        }];
      }
      newState.stats = { ...newState.stats, totalBuildings: (newState.stats?.totalBuildings || 0) + 1 };
    } else {
      newBuildQueue.push(item);
    }
  }
  newState.buildQueue = newBuildQueue;

  // 3. Research queue
  const newResearchQueue = [];
  for (const item of state.researchQueue || []) {
    const validTimes = !isNaN(item.endTime) && !isNaN(item.startTime) && item.endTime > item.startTime;
    if (!validTimes) {
      console.warn('[Ascensión] Elemento de investigación corrupto detectado y purgado:', item);
      continue;
    }

    if (now >= item.endTime) {
      const rDef = RESEARCH[item.researchId];
      const ownerPlanet = newState.planets?.find(pl => pl.id === item.planetId)
        || newState.planets?.find(pl => pl.id === newState.currentPlanetId);
      const reqCtx = { ...(ownerPlanet?.buildings || {}), ...(newState.research || {}) };
      const reqMet = !rDef || !rDef.req || meetsResearchReq(rDef.req, reqCtx);
      if (!reqMet) {
        const p = newState.planets?.find(pl => pl.id === item.planetId);
        if (p) {
          const refundCost = researchCost(item.researchId, (newState.research?.[item.researchId] || 0), newState.research?.aiStrategy || 0, p.buildings?.constructionCenter || 0);
          newState = updatePlanet(newState, item.planetId, pl => ({
            ...pl,
            resources: clampResources({
              metal: (pl.resources?.metal || 0) + refundCost.metal,
              crystal: (pl.resources?.crystal || 0) + refundCost.crystal,
              deuterium: (pl.resources?.deuterium || 0) + refundCost.deuterium,
            }),
          }));
        }
        newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'warning', message: `🔬 Investigación "${rDef?.name || item.researchId}" cancelada: requisitos no cumplidos. Recursos reembolsados.`, timestamp: now }];
        continue;
      }
      const oldLevel = state.research?.[item.researchId] || 0;
      newState.research = { ...newState.research, [item.researchId]: oldLevel + 1 };
      const newLvl = oldLevel + 1;
      newState.stats = { ...newState.stats, totalResearch: (newState.stats?.totalResearch || 0) + 1, maxTechLevel: Math.max(newState.stats?.maxTechLevel || 0, newLvl) };
      if (!item.auto) {
        newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: `🔬 ${rDef?.name || item.researchId} nivel ${newLvl}`, timestamp: now }];
      }
      continue;
    }
    newResearchQueue.push(item);
  }
  newState.researchQueue = newResearchQueue;

  // 4. Ship queue (unit-by-unit)
  const newShipQueue = [];
  for (const item of state.shipQueue || []) {
    const totalDuration = item.endTime - item.startTime;
    const totalQty = item.quantity;
    if (totalQty <= 0 || totalDuration <= 0) continue;

    const unitTime = totalDuration / totalQty;
    const elapsedTime = now - item.startTime;
    const completedUnits = Math.min(totalQty, Math.floor(elapsedTime / unitTime));
    const newlyCompleted = completedUnits - (item.unitsDelivered || 0);

    if (newlyCompleted > 0) {
      const pTarget = newState.planets?.find(pl => pl.id === item.planetId);
      const techSnap = item.techSnapshot || extractShipTechSnapshot(newState.research || {});
      const techGen = item.techGen || calculateTechGeneration(techSnap);
      const variantKey = getVariantKey(item.shipId, techGen);
      const calculatedStats = getShipStats(item.shipId, techSnap, newState.blueprints, 'human', pTarget?.buildings || {}) || SHIPS[item.shipId];

      // Disparar registro atómico de entidades con matrícula única en SQLite
      if (typeof window !== "undefined" && window.electronAPI && typeof window.electronAPI.dbInsertShips === "function") {
        const shipsToInsert = [];
        const isCapital = ["cruiser", "battleship", "bomber", "destroyer", "deathstar", "planetDestroyer"].includes(item.shipId) || item.shipId.startsWith("custom_");
        const category = isCapital ? "capital" : (["espionageProbe", "smallCargo", "largeCargo", "colonizer", "recycler"].includes(item.shipId) ? "civil" : "swarm");
        const faction = pTarget?.faction || "HUM";

        for (let i = 0; i < newlyCompleted; i++) {
          const shipSeq = (state.gameTick || 0) * 1000 + (item.completed || 0) + i + 1;
          const shipId = `shp_${item.planetId}_${item.shipId}_${state.gameTick || 0}_${item.startTime || 0}_${i}`;
          const regCode = generateRegistryCode(faction, item.planetId, item.shipId, shipSeq);
          shipsToInsert.push({
            id: shipId,
            registry_code: regCode,
            custom_name: null,
            chassis_id: item.shipId,
            class_category: category,
            origin_planet_id: item.planetId,
            origin_tick: state.gameTick || 0,
            owner_id: "player",
            controller_id: "player",
            status: "docked",
            current_planet_id: item.planetId,
            current_fleet_id: null,
            hull_percent: 1.0,
            veterancy_level: 0,
            kills_count: 0,
            battles_survived: 0,
            tech_generation: techGen,
            metadata_json: JSON.stringify({ techSnapshot: techSnap })
          });
        }
        window.electronAPI.dbInsertShips(shipsToInsert).catch(e => console.warn("[Ascensión DB] Error al registrar naves:", e));
      }

      newState = updatePlanet(newState, item.planetId, p => {
        const existingFleetVariants = { ...(p.fleetVariants || {}) };
        const currentVariant = existingFleetVariants[variantKey] || {
          baseId: item.shipId,
          variantKey,
          techGen,
          techSnapshot: techSnap,
          stats: calculatedStats,
          count: 0
        };
        currentVariant.count = (currentVariant.count || 0) + newlyCompleted;
        existingFleetVariants[variantKey] = currentVariant;

        return {
          ...p,
          fleet: { ...p.fleet, [item.shipId]: (p.fleet?.[item.shipId] || 0) + newlyCompleted },
          fleetVariants: existingFleetVariants
        };
      });

      newState.notifications = [...(newState.notifications || []), {
        id: uid(), type: 'success', message: `🚀 ${newlyCompleted}x ${SHIPS[item.shipId]?.name || item.shipId} Mk.${techGen} listo(s)`, timestamp: now,
      }];
      newState.stats = { ...newState.stats, totalShips: (newState.stats?.totalShips || 0) + newlyCompleted };
    }

    if (completedUnits < totalQty && now < item.endTime) {
      newShipQueue.push({ ...item, unitsDelivered: completedUnits });
    }
  }
  newState.shipQueue = newShipQueue;

  // 5. Defense queue (unit-by-unit)
  const newDefenseQueue = [];
  for (const item of state.defenseQueue || []) {
    const totalDuration = item.endTime - item.startTime;
    const totalQty = item.quantity;
    if (totalQty <= 0 || totalDuration <= 0) continue;

    const unitTime = totalDuration / totalQty;
    const elapsedTime = now - item.startTime;
    const completedUnits = Math.min(totalQty, Math.floor(elapsedTime / unitTime));
    const newlyCompleted = completedUnits - (item.unitsDelivered || 0);

    if (newlyCompleted > 0) {
      const pTarget = newState.planets?.find(pl => pl.id === item.planetId);
      const techSnap = item.techSnapshot || extractDefenseTechSnapshot(newState.research || {});
      const techGen = item.techGen || calculateTechGeneration(techSnap);
      const variantKey = getVariantKey(item.defenseId, techGen);
      const calculatedStats = getDefenseStats(item.defenseId, techSnap, 'human', pTarget?.buildings || {}) || DEFENSES[item.defenseId];

      newState = updatePlanet(newState, item.planetId, p => {
        const existingDefenseVariants = { ...(p.defenseVariants || {}) };
        const currentVariant = existingDefenseVariants[variantKey] || {
          baseId: item.defenseId,
          variantKey,
          techGen,
          techSnapshot: techSnap,
          stats: calculatedStats,
          count: 0
        };
        currentVariant.count = (currentVariant.count || 0) + newlyCompleted;
        existingDefenseVariants[variantKey] = currentVariant;

        return {
          ...p,
          defenses: { ...p.defenses, [item.defenseId]: (p.defenses?.[item.defenseId] || 0) + newlyCompleted },
          defenseVariants: existingDefenseVariants
        };
      });

      if (!item.auto) {
        newState.notifications = [...(newState.notifications || []), {
          id: uid(), type: 'success', message: `🛡️ ${newlyCompleted}x ${DEFENSES[item.defenseId]?.name || item.defenseId} Mk.${techGen} construido(s)`, timestamp: now,
        }];
      }
      newState.stats = { ...newState.stats, totalDefenses: (newState.stats?.totalDefenses || 0) + newlyCompleted };
    }

    if (completedUnits < totalQty && now < item.endTime) {
      newDefenseQueue.push({ ...item, unitsDelivered: completedUnits });
    }
  }
  newState.defenseQueue = newDefenseQueue;

  // 6. Custom ship queue
  const newCustomQueue = [];
  let customNotifSent = false;
  for (const item of state.customShipQueue || []) {
    if (now >= item.endTime) {
      const bp = state.blueprints.find(b => b.id === item.blueprintId);
      if (bp) {
        newState = updatePlanet(newState, item.planetId, p => ({
          ...p,
          fleet: { ...p.fleet, ['custom_' + bp.id]: (p.fleet['custom_' + bp.id] || 0) + item.quantity },
        }));
      }
      if (!customNotifSent) {
        newState.notifications = [...(newState.notifications || []), {
          id: uid(), type: 'success', message: `🔧 ${item.quantity}x nave personalizada lista`, timestamp: now,
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
