import {
  updatePlanet, uid, constructionDiscount, canAfford, deduct, meetsResearchReq
} from '../../core.jsx';
import { MOON_BUILDINGS } from '../../data/gameData.js';

export const handleBuildMoonBuilding = (state, action) => {
  const { buildingId } = action;
  const planet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!planet || !planet.moon) return state;
  const b = MOON_BUILDINGS[buildingId];
  if (!b) return state;
  const lvl = planet.moon.buildings[buildingId] || 0;
  const mDisc = constructionDiscount(planet.buildings?.constructionCenter || 0);
  const cost = { metal: Math.floor(b.cost.m * Math.pow(b.factor, lvl) * mDisc), crystal: Math.floor(b.cost.c * Math.pow(b.factor, lvl) * mDisc), deuterium: Math.floor((b.cost.d || 0) * Math.pow(b.factor, lvl) * mDisc) };
  if (!canAfford(planet.resources, cost)) return state;
  if (!meetsResearchReq(b.req, { ...planet.moon.buildings, ...planet.buildings, ...state.research })) return state;
  if (b.max && lvl >= b.max) return state;
  
  const newRes = deduct(planet.resources, cost);
  let newState = updatePlanet(state, planet.id, p => ({
    ...p, resources: newRes,
    moon: { ...p.moon, buildings: { ...(p.moon?.buildings || {}), [buildingId]: lvl + 1 } },
  }));
  return newState;
};

export const handleJumpGateTransfer = (state, action) => {
  const { fromPlanetId, toPlanetId, fleet } = action;
  const fromPlanet = state.planets.find(p => p.id === fromPlanetId);
  const toPlanet = state.planets.find(p => p.id === toPlanetId);
  if (!fromPlanet?.moon?.buildings?.jumpGate || !toPlanet?.moon?.buildings?.jumpGate) {
    return {
      ...state,
      notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: '🌀 Ambos planetas deben poseer una Puerta de Salto activa en la luna.', timestamp: Date.now() }]
    };
  }
  if (!fleet || Object.keys(fleet).length === 0) return state;
  for (const [id, qty] of Object.entries(fleet)) {
    if ((fromPlanet.fleet[id] || 0) < qty) {
      return {
        ...state,
        notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: '⚠️ No tienes suficientes naves para realizar el salto.', timestamp: Date.now() }]
      };
    }
  }
  let newState = updatePlanet(state, fromPlanetId, p => ({
    ...p,
    fleet: Object.entries(fleet).reduce((acc, [id, qty]) => {
      const remaining = (acc[id] || 0) - qty;
      if (remaining <= 0) delete acc[id]; else acc[id] = remaining;
      return acc;
    }, { ...p.fleet }),
  }));
  newState = updatePlanet(newState, toPlanetId, p => ({
    ...p,
    fleet: Object.entries(fleet).reduce((acc, [id, qty]) => {
      acc[id] = (acc[id] || 0) + qty;
      return acc;
    }, { ...p.fleet }),
  }));
  newState.notifications = [...newState.notifications, { id: uid(), type: 'info', message: `🌀 Salto completado de ${fromPlanet.name} a ${toPlanet.name}`, timestamp: Date.now() }];
  return newState;
};
