import { updatePlanet } from './core.jsx';
import { RESEARCH, EVENT_REWARD_RANGES } from './data/gameData.js';
import { fmt } from './utils/formulas.js';
import { handleCombatMission } from './missions/combatMission.js';
import { handleExpeditionMission } from './missions/expeditionMission.js';
import {
  handleColonizeMission,
  handleDiplomacyMission,
  handleAllyTradeMission,
  handleEspionageMission,
  handleTransportMission,
  handleTradeSendMission,
  handleTradeReceiveMission,
  handleRecycleMission
} from './missions/diploMission.js';
import { handleEstablishPatrol } from './reducers/fleet/patrolActions.js';

const processMission = (mission, state) => {
  try {
    if (mission.type === 'deploy_patrol') {
      return handleEstablishPatrol(mission, state);
    }
    if (mission.type === 'attack' || mission.type === 'planet_destruction') {
      return handleCombatMission(mission, state);
    }
    if (mission.type === 'colonize') {
      return handleColonizeMission(mission, state);
    }
    if (mission.type === 'diplomacy') {
      return handleDiplomacyMission(mission, state);
    }
    if (mission.type === 'ally_trade') {
      return handleAllyTradeMission(mission, state);
    }
    if (mission.type === 'espionage') {
      return handleEspionageMission(mission, state);
    }
    if (mission.type === 'transport') {
      return handleTransportMission(mission, state);
    }
    if (mission.type === 'trade_send') {
      return handleTradeSendMission(mission, state);
    }
    if (mission.type === 'trade_receive') {
      return handleTradeReceiveMission(mission, state);
    }
    if (mission.type === 'recycle') {
      return handleRecycleMission(mission, state);
    }
    if (mission.type === 'expedition') {
      return handleExpeditionMission(mission, state);
    }
    return { state, type: 'info', message: 'Misión completada' };
  } catch (e) {
    console.error('[Ascensión] processMission top-level error:', e, mission?.type);
    return { state, type: 'error', message: 'Error interno procesando misión', returnFleet: mission?.fleet || {} };
  }
};

const returnFleetToOrigin = (state, mission) => {
  const fleet = mission.fleet || {};
  if (Object.keys(fleet).length === 0) return state;

  const isPlayerOrigin = state.planets.some(p => p.id === mission.from.id);
  if (isPlayerOrigin) {
    if (typeof window !== "undefined" && window.electronAPI && typeof window.electronAPI.dbReturnShipsPlanet === "function") {
      window.electronAPI.dbReturnShipsPlanet({
        missionId: mission.id,
        destinationPlanetId: mission.from.id,
        gameTick: state.gameTick || 0,
        originDesc: `Retorno de misión a [${mission.from.name || mission.from.id}]`
      }).catch(e => console.warn("[Ascensión DB] Error al retornar naves a base:", e));
    }

    return updatePlanet(state, mission.from.id, p => ({
      ...p,
      fleet: Object.entries(fleet).reduce((acc, [id, qty]) => {
        acc[id] = (acc[id] || 0) + qty;
        return acc;
      }, { ...p.fleet }),
    }));
  }

  const isAIOrigin = state.aiPlanets.some(p => p.id === mission.from.id);
  if (isAIOrigin) {
    return {
      ...state,
      aiPlanets: state.aiPlanets.map(p => {
        if (p.id === mission.from.id) {
          return {
            ...p,
            fleet: Object.entries(fleet).reduce((acc, [id, qty]) => {
              acc[id] = (acc[id] || 0) + qty;
              return acc;
            }, { ...(p.fleet || {}) }),
          };
        }
        return p;
      })
    };
  }

  console.warn('[Ascensión] returnFleetToOrigin: origin planet no longer exists', mission.from);
  return state;
};

const processEvent = (event, state) => {
  const planet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  let newState = { ...state };
  let desc = '', type = 'info';

  switch (event.type) {
    case 'resource': {
      const { minMetal, maxMetalVar, minCrystal, maxCrystalVar } = EVENT_REWARD_RANGES.resource;
      const bonus = { metal: minMetal + Math.random() * maxMetalVar, crystal: minCrystal + Math.random() * maxCrystalVar };
      newState = updatePlanet(newState, planet.id, p => ({
        ...p, resources: { ...(p.resources || {}), metal: (p.resources?.metal || 0) + bonus.metal, crystal: (p.resources?.crystal || 0) + bonus.crystal },
      }));
      desc = `+${fmt(bonus.metal)}M, +${fmt(bonus.crystal)}C`;
      type = 'success';
      break;
    }
    case 'trade': {
      const { minDeut, maxDeutVar } = EVENT_REWARD_RANGES.trade;
      const bonus = minDeut + Math.random() * maxDeutVar;
      newState = updatePlanet(newState, planet.id, p => ({
        ...p, resources: { ...(p.resources || {}), deuterium: (p.resources?.deuterium || 0) + bonus },
      }));
      desc = `+${fmt(bonus)} Deuterio`;
      type = 'success';
      break;
    }
    case 'hazard': {
      const { minLoss, maxLossVar } = EVENT_REWARD_RANGES.hazard;
      const loss = minLoss + Math.random() * maxLossVar;
      newState = updatePlanet(newState, planet.id, p => ({
        ...p, resources: {
          ...(p.resources || {}),
          metal: (p.resources?.metal || 0) * (1 - loss),
          crystal: (p.resources?.crystal || 0) * (1 - loss),
          deuterium: (p.resources?.deuterium || 0) * (1 - loss),
        },
      }));
      desc = `-${(loss * 100).toFixed(0)}% recursos`;
      type = 'warning';
      break;
    }
    case 'tech': {
      const techKeys = Object.keys(RESEARCH);
      const randomTech = techKeys[Math.floor(Math.random() * techKeys.length)];
      const currentLvl = state.research[randomTech] || 0;
      newState.research = { ...newState.research, [randomTech]: currentLvl + 1 };
      desc = `+1 nivel en ${RESEARCH[randomTech].name}`;
      type = 'success';
      break;
    }
    default: {
      const { minMetal, maxMetalVar, minCrystal, maxCrystalVar } = EVENT_REWARD_RANGES.defaultReward;
      const bonus = { metal: minMetal + Math.random() * maxMetalVar, crystal: minCrystal + Math.random() * maxCrystalVar };
      newState = updatePlanet(newState, planet.id, p => ({
        ...p, resources: { ...(p.resources || {}), metal: (p.resources?.metal || 0) + bonus.metal, crystal: (p.resources?.crystal || 0) + bonus.crystal },
      }));
      desc = `Hallazgo inesperado: +${fmt(bonus.metal)}M, +${fmt(bonus.crystal)}C`;
      type = 'success';
      break;
    }
  }
  return { state: newState, desc, type };
};

export { processMission, returnFleetToOrigin, processEvent };
