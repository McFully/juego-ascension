import {
  updatePlanet, fmt, uid
} from '../../core.jsx';
import { SHIPS, DEFENSES } from '../../data/gameData.js';
import { canColonizeNewPlanet, getMaxPlanets, getUsedColonySlots } from '../../utils/formulas.js';

export const handleAbandonPlanet = (state, action) => {
  const { planetId } = action;
  const planet = state.planets.find(p => p.id === planetId);
  if (!planet || planet.isHome) return state;
  if (state.planets.length <= 1) return state;

  const homePlanet = state.planets.find(p => p.isHome) || state.planets.find(p => p.id !== planetId);
  if (homePlanet) {
    let newState = updatePlanet(state, homePlanet.id, p => ({
      ...p,
      fleet: Object.fromEntries(
        Object.entries({ ...p.fleet, ...planet.fleet }).map(([k, v]) => [k, (p.fleet[k] || 0) + (planet.fleet[k] || 0)])
      ),
    }));
    newState.planets = newState.planets.filter(p => p.id !== planetId);
    if (newState.currentPlanetId === planetId) {
      newState.currentPlanetId = homePlanet.id;
    }
    newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'warning', message: `🚩 Colonia ${planet.name} abandonada. Flota repatriada a ${homePlanet.name}.`, timestamp: Date.now() }];
    return newState;
  }
  return state;
};

export const handleScrapShips = (state, action) => {
  const { planetId, shipId, quantity } = action;
  const planet = state.planets.find(p => p.id === planetId);
  if (!planet || quantity <= 0) return state;
  const available = planet.fleet[shipId] || 0;
  if (available < quantity) return state;

  const s = SHIPS[shipId];
  if (!s) return state;

  const refund = {
    metal: Math.floor((s.cost.m || 0) * 0.35 * quantity),
    crystal: Math.floor((s.cost.c || 0) * 0.35 * quantity),
    deuterium: Math.floor((s.cost.d || 0) * 0.35 * quantity),
  };
  const crewReturned = (s.crew || 0) * quantity;

  let newState = updatePlanet(state, planetId, p => {
    const newF = { ...p.fleet };
    newF[shipId] = (newF[shipId] || 0) - quantity;
    if (newF[shipId] <= 0) delete newF[shipId];
    return {
      ...p,
      population: (p.population || 0) + crewReturned,
      fleet: newF,
      resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium + refund.deuterium }
    };
  });

  // Reflejar desguace en SQLite
  if (typeof window !== "undefined" && window.electronAPI && typeof window.electronAPI.dbScrapShips === "function") {
    window.electronAPI.dbScrapShips({
      planetId,
      chassisId: shipId,
      quantity,
      gameTick: state.gameTick || 0
    }).catch(e => console.warn("[Ascensión DB] Error al desguazar naves en SQLite:", e));
  }

  newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'info', message: `♻️ ${quantity}x ${s.name} desguazados. Recuperaste ${fmt(refund.metal)}M`, timestamp: Date.now() }];
  return newState;
};

export const handleScrapDefenses = (state, action) => {
  const { planetId, defenseId, quantity } = action;
  const planet = state.planets.find(p => p.id === planetId);
  if (!planet || quantity <= 0) return state;
  const available = planet.defenses[defenseId] || 0;
  if (available < quantity) return state;

  const d = DEFENSES[defenseId];
  if (!d) return state;

  const refund = {
    metal: Math.floor((d.cost.m || 0) * 0.35 * quantity),
    crystal: Math.floor((d.cost.c || 0) * 0.35 * quantity),
    deuterium: Math.floor((d.cost.d || 0) * 0.35 * quantity),
  };

  let newState = updatePlanet(state, planetId, p => {
    const newD = { ...p.defenses };
    newD[defenseId] = (newD[defenseId] || 0) - quantity;
    if (newD[defenseId] <= 0) delete newD[defenseId];
    return { ...p, defenses: newD, resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium + refund.deuterium } };
  });
  newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'info', message: `♻️ ${quantity}x ${d.name} retirados. Recuperaste ${fmt(refund.metal)}M`, timestamp: Date.now() }];
  return newState;
};

export const handleColonize = (state, action) => {
  const { to } = action;
  if (!to || !to.galaxy || !to.system || !to.position) return state;

  const occupiedByPlayer = state.planets.some(p => p.galaxy === to.galaxy && p.system === to.system && p.position === to.position);
  if (occupiedByPlayer) {
    return { ...state, notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: `🚫 Coordenadas [${to.galaxy}:${to.system}:${to.position}] ya ocupadas por una colonia tuya.`, timestamp: Date.now() }] };
  }
  const occupiedByAI = state.aiPlanets.some(p => p.galaxy === to.galaxy && p.system === to.system && p.position === to.position);
  if (occupiedByAI) {
    return { ...state, notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: `🚫 Coordenadas [${to.galaxy}:${to.system}:${to.position}] ya ocupadas por otro imperio.`, timestamp: Date.now() }] };
  }

  if (!canColonizeNewPlanet(state)) {
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
          message: `🚫 Límite imperial alcanzado (${usedP}/${maxP} mundos). Requiere investigar mayor nivel de Astrofísica.`,
          timestamp: Date.now()
        }
      ]
    };
  }
  const originPlanet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!originPlanet) return state;
  const colonizerCount = originPlanet.fleet.colonizer || 0;
  if (colonizerCount < 1) return state;
  const colonizerCost = SHIPS.colonizer?.cost || { m: 5000, c: 10000, d: 5000 };
  const refund = { metal: Math.floor(colonizerCost.m * 0.3), crystal: Math.floor(colonizerCost.c * 0.3), deuterium: Math.floor((colonizerCost.d || 0) * 0.3) };
  let newState = updatePlanet(state, originPlanet.id, p => {
    const newFleet = { ...p.fleet };
    newFleet.colonizer = (newFleet.colonizer || 0) - 1;
    if (newFleet.colonizer <= 0) delete newFleet.colonizer;
    return { ...p, fleet: newFleet, resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium + refund.deuterium } };
  });
  const extraFields = (state.research?.advColonization || 0) * 2;
  const initialPop = 2000; // Capacidad estándar embarcada por el colonizador

  const newPlanetId = uid();
  const newPlanet = {
    id: newPlanetId,
    name: `Colonia ${to.galaxy}:${to.system}:${to.position}`,
    galaxy: to.galaxy, system: to.system, position: to.position,
    isHome: false,
    biome: 'temperate',
    planetSize: 100 + Math.floor(Math.random() * 100) + extraFields,
    gravity: Math.ceil(Math.random() * 5),
    trait: null,
    specialization: null,
    faction: originPlanet.faction || 'human',
    population: initialPop,
    autoTrade: false,
    buildings: { metalMine: 0, crystalMine: 0, deutSynth: 0, solarPlant: 0, fusionReactor: 0, robotFactory: 0, shipyard: 0, researchLab: 0, missileSilo: 0, naniteFactory: 0, terraformer: 0, allianceDepot: 0, moonBase: 0, sensorPhalanx: 0, jumpGate: 0 },
    resources: { metal: 800, crystal: 500, deuterium: 200 },
    fleet: {},
    defenses: {},
    retrofitTech: { weapons: 0, shields: 0, armour: 0, combustion: 0, impulse: 0, hyperspace: 0 },
  };
  newState.planets = [...newState.planets, newPlanet];
  newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: `🚀 Nueva colonia establecida en [${to.galaxy}:${to.system}:${to.position}] con ${initialPop.toLocaleString()} colonos pioneros (+${extraFields} campos por Colonización Avanzada)`, timestamp: Date.now() }];
  return newState;
};
