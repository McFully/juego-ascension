import {
  uid, updatePlanet, canAfford, deduct, calcDistance, calcFlightTime, calcFuel, fleetSpeed, getPOIAtCoordinates
} from '../../core.jsx';
import { canColonizeNewPlanet, getMaxPlanets, getUsedColonySlots } from '../../utils/formulas.js';
import { canShipReachTarget } from '../../utils/fleetClassification.js';
import { SHIPS } from '../../data/gameData.js';
import { INTEL_SHIP_IDS } from '../../data/game/shipsData.js';
import { countProbes, getEspionageMissionCost, ESPIONAGE_PHASES } from '../../utils/espionageFormulas.js';

export const handleSendFleet = (state, action) => {
  const { fromId, to, fleet, missionType, missionSpeed = 10, resources = null, autoRetreat = false, formation = 'standard' } = action;

  if (missionType === 'colonize' && !canColonizeNewPlanet(state)) {
    const astroLvl = state.research?.astrophysics || 0;
    const maxP = getMaxPlanets(astroLvl);
    const usedP = getUsedColonySlots(state);
    return {
      ...state,
      notifications: [
        ...(state.notifications || []),
        {
          id: uid(),
          type: 'warning',
          message: `🚫 Misión abortada: Capacidad colonial completa (${usedP}/${maxP} mundos). Desarrolla Astrofísica para expandirte.`,
          timestamp: Date.now()
        }
      ]
    };
  }

  const from = state.planets.find(p => p.id === fromId);
  if (!from) return state;

// Espionaje sin sonda no es espionaje. Antes solo lo filtraba la interfaz, de
  // modo que una flota sin sondas con deteccion las borraba sin combate.
  const espionageProbes = missionType === 'espionage' ? countProbes(fleet) : 0;
  if (missionType === 'espionage' && espionageProbes <= 0) {
    return {
      ...state,
      notifications: [
        ...(state.notifications || []),
        {
          id: uid(),
          type: 'warning',
          message: '🚫 Misión de espionaje rechazada: no llevas ninguna sonda a bordo.',
          timestamp: Date.now()
        }
      ]
    };
  }

  // Al reves: una sonda en una misión de asalto o transporte. Antes se perdia
  // sola: `expeditionMission` las contaba como "naves pequeñas" destruibles y en
  // cualquier otra mision no habia nada que dijera que una sonda no es un caza.
  if (missionType !== 'espionage') {
    const sondasDeMas = fleet
      ? Object.entries(fleet).reduce((acc, [id, qty]) => acc + (INTEL_SHIP_IDS.has(id) ? qty : 0), 0)
      : 0;
    if (sondasDeMas > 0) {
      return {
        ...state,
        notifications: [
          ...(state.notifications || []),
          {
            id: uid(),
            type: 'warning',
            message: '🚫 Misión rechazada: las sondas de espionaje no viajan en misiones de combate, transporte ni expedición.',
            timestamp: Date.now()
          }
        ]
      };
    }
  }

  const destPoi = getPOIAtCoordinates(to.galaxy, to.system, to.position);
  const isWormhole = destPoi && destPoi.type === 'wormhole';

  // Validación de alcance según propulsión (Combustión: mismo sistema | Impulso: misma galaxia | Hiperespacio: universo)
  // Los agujeros de gusano puentean el espacio y permiten entrada a cualquier nave
  if (!isWormhole) {
    for (const [id, qty] of Object.entries(fleet)) {
      if (qty > 0 && !canShipReachTarget(id, from, to, SHIPS)) {
        const s = SHIPS[id];
        const isSameGalaxy = from.galaxy === to.galaxy;
        const rangeMsg = !isSameGalaxy 
          ? `no posee motor hiperespacial para saltos intergalácticos` 
          : `posee motor de combustión y solo puede operar en el sistema solar local`;
        return {
          ...state,
          notifications: [
            ...(state.notifications || []),
            {
              id: uid(),
              type: 'warning',
              message: `🚫 Misión rechazada: La nave "${s?.name || id}" ${rangeMsg}.`,
              timestamp: Date.now()
            }
          ]
        };
      }
    }
  }

  // Validate ships exist
  for (const [id, qty] of Object.entries(fleet)) {
    if (qty < 0 || (from.fleet[id] || 0) < qty) return state;
  }
  // Deduct ships
  const newFleet = { ...from.fleet };
  for (const [id, qty] of Object.entries(fleet)) {
    newFleet[id] = (newFleet[id] || 0) - qty;
    if (newFleet[id] <= 0) delete newFleet[id];
  }
  // Deduct resources if transport
  let newResources = { ...from.resources };
  if (resources) {
    if ((resources.metal || 0) < 0 || (resources.crystal || 0) < 0 || (resources.deuterium || 0) < 0) return state;
    if (!canAfford(newResources, resources)) return state;
    newResources = deduct(newResources, resources);
  }
  // Calculate fuel
  const dist = calcDistance(from, to);

  const playerFaction = from.faction || 'human';
  let spd = fleetSpeed(fleet, state.research, playerFaction, state.relics || []);
  if (spd === 0) return state;
  if (formation === 'vanguard') spd *= 1.20;
  else if (formation === 'artillery') spd *= 0.85;
  else if (formation === 'escort') spd *= 1.05;
  else if (formation === 'raider') spd *= 1.10;

  const driveLevel = Math.max(
    state.research.combustion || 0,
    state.research.impulse || 0,
    state.research.hyperspace || 0
  );

  // Punto 33: Rango de salto por hiperespacio con degradación logística
  // El alcance operativo óptimo escala con la investigación de hiperespacio e impulso
  const safeRange = 2500 + ((state.research.hyperspace || 0) * 1200) + ((state.research.impulse || 0) * 400);
  const isOverRange = dist > safeRange && !isWormhole;
  const rangeOverheadFactor = isOverRange ? 1 + Math.min(1.5, (dist - safeRange) / safeRange) : 1;

  let totalFuel = 0;
  for (const [id, qty] of Object.entries(fleet)) {
    totalFuel += calcFuel(dist, id, qty, driveLevel, state.research, from);
  }
  if (isOverRange) {
    totalFuel = Math.round(totalFuel * rangeOverheadFactor);
  }
  if (isWormhole) {
    totalFuel = Math.max(1, Math.floor(totalFuel * 0.5));
  }
  // Coste operativo propio del espionaje, aparte del combustible del viaje.
  // Antes una operacion de espionaje no costaba nada.
  const espionageCost = espionageProbes > 0
    ? getEspionageMissionCost(espionageProbes, state.research?.espionage || 0)
    : { metal: 0, crystal: 0, deuterium: 0 };

  const requiredDeuterium = totalFuel + espionageCost.deuterium;
  const requiredCrystal = espionageCost.crystal;

  if (newResources.deuterium < requiredDeuterium) {
    return {
      ...state,
      notifications: [
        ...(state.notifications || []),
        {
          id: uid(),
          type: 'warning',
          message: `🚫 Deuterio insuficiente para la misión: Requiere ${requiredDeuterium} de Deuterio (Disponible: ${Math.floor(newResources.deuterium)}).`,
          timestamp: Date.now()
        }
      ]
    };
  }
  if (newResources.crystal < requiredCrystal) {
    return {
      ...state,
      notifications: [
        ...(state.notifications || []),
        {
          id: uid(),
          type: 'warning',
          message: `🚫 Cristal insuficiente para la misión: Requiere ${requiredCrystal} de Cristal (Disponible: ${Math.floor(newResources.crystal)}).`,
          timestamp: Date.now()
        }
      ]
    };
  }
  newResources.deuterium -= requiredDeuterium;
  newResources.crystal -= requiredCrystal;

  let flightTime = calcFlightTime(dist, spd, missionSpeed);
  if (isOverRange) {
    flightTime = Math.round(flightTime * (1 + (rangeOverheadFactor - 1) * 0.5));
  }
  if (isWormhole) {
    flightTime = Math.max(10, Math.round(flightTime * 0.5));
  }
  const arrivalTime = Date.now() + flightTime * 1000;
  const returnTime = arrivalTime + flightTime * 1000;
  const missionId = uid();

  // Asignar cascos y matrículas en SQLite a la misión en vuelo
  if (typeof window !== "undefined" && window.electronAPI && typeof window.electronAPI.dbAssignShipsMission === "function") {
    window.electronAPI.dbAssignShipsMission({
      planetId: fromId,
      fleetCounts: fleet,
      missionId,
      gameTick: state.gameTick || 0,
      destinationDesc: `[${to.galaxy}:${to.system}:${to.position}] (${missionType})`
    }).catch(e => console.warn("[Ascensión DB] Error al asignar naves a misión:", e));
  }

  let newState = updatePlanet(state, fromId, p => ({ ...p, fleet: newFleet, resources: newResources }));
  newState.fleetMissions = [...(state.fleetMissions || []), {
    id: missionId, type: missionType, from, to, fleet, resources, fuel: totalFuel,
    departure: Date.now(), arrivalTime, returnTime, isAI: false, autoRetreat, formation,
    ...(missionType === 'espionage' ? { probes: espionageProbes, phase: ESPIONAGE_PHASES.EN_VUELO, espionageCost } : {}),
    ...(action.missionMeta || {})
  }];
  newState.notifications = [...newState.notifications, {
    id: uid(), type: 'info', message: `🚀 Flota enviada a [${to.galaxy}:${to.system}:${to.position}]${isWormhole ? ' a través de Agujero de Gusano' : ''}`, timestamp: Date.now(),
  }];
  return newState;
};
