import {
  calcDistance,
  fleetSpeed,
  calcFlightTime,
  updatePlanet,
  uid,
  MISSIONS
} from '../../core.jsx';
import { returnFleetToOrigin } from '../../missions.jsx';

export const handleCancelMission = (state, action) => {
  const { missionId } = action;
  const mission = state.fleetMissions.find(m => m.id === missionId);
  if (!mission) return state;
  let newState = returnFleetToOrigin(state, mission);
  newState.fleetMissions = state.fleetMissions.filter(m => m.id !== missionId);
  newState.notifications = [...newState.notifications, { id: uid(), type: 'info', message: `🚀 Misión cancelada, flota regresó a ${mission.from.name || 'origen'}`, timestamp: Date.now() }];
  return newState;
};

export const handleRequestReinforcements = (state, action) => {
  const { targetPlanetId } = action;
  const targetPlanet = state.planets.find(p => p.id === targetPlanetId);
  if (!targetPlanet) return state;

  const nearbyAI = state.aiPlanets.filter(p => p.galaxy === targetPlanet.galaxy && p.fleet && Object.values(p.fleet).some(v => v > 5));
  if (nearbyAI.length === 0) {
    return { ...state, notifications: [...state.notifications, { id: uid(), type: 'warning', message: '⚠️ No hay aliados cercanos disponibles', timestamp: Date.now() }] };
  }

  const ally = nearbyAI[Math.floor(Math.random() * nearbyAI.length)];
  const reinforcementFleet = {};
  for (const [id, qty] of Object.entries(ally.fleet)) {
    const sendQty = Math.floor(qty * 0.3);
    if (sendQty > 0) reinforcementFleet[id] = sendQty;
  }
  if (Object.keys(reinforcementFleet).length === 0) {
    return { ...state, notifications: [...state.notifications, { id: uid(), type: 'warning', message: '⚠️ El aliado no tiene naves disponibles', timestamp: Date.now() }] };
  }

  const newAIPlanets = state.aiPlanets.map(p => p.id === ally.id ? {
    ...p,
    fleet: Object.entries(reinforcementFleet).reduce((acc, [id, qty]) => {
      acc[id] = Math.max(0, (acc[id] || 0) - qty);
      if (acc[id] <= 0) delete acc[id];
      return acc;
    }, { ...p.fleet }),
  } : p);

  const dist = calcDistance(ally, targetPlanet);
  const spd = fleetSpeed(reinforcementFleet, ally.research || {}, ally.faction || 'human');
  const flightTime = calcFlightTime(dist, spd, 10);

  let newState = { ...state, aiPlanets: newAIPlanets };
  newState.fleetMissions = [...(newState.fleetMissions || []), {
    id: uid(), type: 'ally_reinforce', from: ally, to: targetPlanet, fleet: reinforcementFleet,
    departure: Date.now(), arrivalTime: Date.now() + flightTime * 1000,
    returnTime: Date.now() + flightTime * 2000,
    isAI: false,
  }];
  newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: `🤝 Aliado envió refuerzos desde [${ally.galaxy}:${ally.system}:${ally.position}]`, timestamp: Date.now() }];
  return newState;
};

export const handleStartMission = (state, action) => {
  const { missionId } = action;
  if (state.activeMissions.includes(missionId) || state.completedMissions.includes(missionId)) return state;
  return { ...state, activeMissions: [...state.activeMissions, missionId] };
};

export const handleCompleteMission = (state, action, getCurrentPlanet) => {
  const { missionId } = action;
  if (!state.activeMissions.includes(missionId) || state.completedMissions.includes(missionId)) return state;
  
  const m = MISSIONS.find(m => m.id === missionId);
  if (!m) return state;

  const planet = getCurrentPlanet();
  if (!planet) return state;

  let newState = updatePlanet(state, planet.id, p => ({
    ...p,
    resources: {
      metal: p.resources.metal + (m.reward.metal || 0),
      crystal: p.resources.crystal + (m.reward.crystal || 0),
      deuterium: p.resources.deuterium + (m.reward.deuterium || 0)
    }
  }));

  newState.activeMissions = newState.activeMissions.filter(id => id !== missionId);
  newState.completedMissions = [...newState.completedMissions, missionId];
  
  newState.notifications = [...(newState.notifications || []), {
    id: uid(),
    type: 'success',
    message: `🎯 ¡Misión Cumplida! ${m.icon} ${m.name}. Recompensa: ${m.rewardDesc}`,
    timestamp: Date.now(),
    isMission: true
  }];
  return newState;
};

export const handleAddPatricianTradeRoute = (state, action) => {
  const routes = state.tradeRoutes || [];
  if (routes.length >= 10 || !action.route) return state;
  return {
    ...state,
    tradeRoutes: [...routes, action.route],
    notifications: [
      ...(state.notifications || []),
      {
        id: uid(),
        type: 'success',
        message: `🚚 Convoy comercial bilateral establecido entre los puertos asignados.`,
        timestamp: Date.now()
      }
    ]
  };
};
