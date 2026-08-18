import {
  GAME_SPEED, FACTIONS, BUILDINGS, RESEARCH, SHIPS, DEFENSES,
  MOON_BUILDINGS, MISSIONS, MISSILES, BIOME_KEYS, AI_STRATEGIES,
  NARRATIVE_EVENTS, EVENTS, checkAchievements, checkMissions, clampResources,
  fmt, uid, buildingCost, researchCost, shipCost, defenseCost, canAfford, deduct,
  calcResourceValueForAI, meetsReq, calcProduction, calcStorage, shipTimeBonus,
  researchTimeBonus, calcCustomShipCost, calcCustomShipTime, calcBuildTime,
  calcResearchTime, calcShipTime, calcDefenseTime, calcDistance, calcFlightTime,
  calcFuel, fleetSpeed, getPOIAtCoordinates, getVirginPlanet,
  updatePlanet, shouldKeepNotification
} from '../core.jsx';
import { processMission, returnFleetToOrigin, processEvent } from '../missions.jsx';


export const governmentReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_CHAT_MESSAGE': {
      const { aiId, sender, text } = action;
      const history = state.chatHistory?.[aiId] || [];
      return {
        ...state,
        chatHistory: {
          ...(state.chatHistory || {}),
          [aiId]: [...history, { sender, text, timestamp: Date.now() }].slice(-100)
        }
      };
    }

    case 'UPDATE_MINISTRY_POLICY': {
      const { ministry, key, value, planetId } = action;
      const targetPlanetId = planetId || state.currentPlanetId;
      if (targetPlanetId && state.planets?.some(p => p.id === targetPlanetId)) {
        return updatePlanet(state, targetPlanetId, p => {
          const pMins = p.ministries || state.ministries || {};
          return {
            ...p,
            ministries: {
              ...pMins,
              [ministry]: {
                ...(pMins[ministry] || {}),
                [key]: value
              }
            }
          };
        });
      }
      return {
        ...state,
        ministries: {
          ...state.ministries,
          [ministry]: {
            ...state.ministries[ministry],
            [key]: value
          }
        }
      };
    }

    case 'APPOINT_MINISTER': {
      const { ministryId, minister, planetId } = action;
      const targetPlanetId = planetId || state.currentPlanetId;
      if (targetPlanetId && state.planets?.some(p => p.id === targetPlanetId)) {
        return updatePlanet(state, targetPlanetId, p => {
          const pMins = p.ministries || state.ministries || {};
          return {
            ...p,
            ministries: {
              ...pMins,
              [ministryId]: {
                ...(pMins[ministryId] || {}),
                minister: minister
              }
            }
          };
        });
      }
      return {
        ...state,
        ministries: {
          ...(state.ministries || {}),
          [ministryId]: {
            ...(state.ministries?.[ministryId] || {}),
            minister: minister
          }
        }
      };
    }

    case 'TOGGLE_MINISTRY_DIRECTIVE': {
      const { ministryId, directiveId, planetId } = action;
      const targetPlanetId = planetId || state.currentPlanetId;
      if (targetPlanetId && state.planets?.some(p => p.id === targetPlanetId)) {
        return updatePlanet(state, targetPlanetId, p => {
          const pMins = p.ministries || state.ministries || {};
          const currentMin = pMins[ministryId] || {};
          const currentDirs = currentMin.directives || {};
          const nextVal = !currentDirs[directiveId];
          return {
            ...p,
            ministries: {
              ...pMins,
              [ministryId]: {
                ...currentMin,
                directives: {
                  ...currentDirs,
                  [directiveId]: nextVal
                }
              }
            }
          };
        });
      }
      const currentMin = state.ministries?.[ministryId] || {};
      const currentDirs = currentMin.directives || {};
      const nextVal = !currentDirs[directiveId];
      return {
        ...state,
        ministries: {
          ...(state.ministries || {}),
          [ministryId]: {
            ...currentMin,
            directives: {
              ...currentDirs,
              [directiveId]: nextVal
            }
          }
        }
      };
    }

    case 'TOGGLE_MINISTRY_AUTOMATION': {
      const { ministryId, planetId } = action;
      const targetPlanetId = planetId || state.currentPlanetId;
      if (targetPlanetId && state.planets?.some(p => p.id === targetPlanetId)) {
        return updatePlanet(state, targetPlanetId, p => {
          const pMins = p.ministries || state.ministries || {};
          const currentMin = pMins[ministryId] || {};
          const currentVal = currentMin.automationEnabled || false;
          return {
            ...p,
            ministries: {
              ...pMins,
              [ministryId]: {
                ...currentMin,
                automationEnabled: !currentVal
              }
            }
          };
        });
      }
      const currentMin = state.ministries?.[ministryId] || {};
      const currentVal = currentMin.automationEnabled || false;
      return {
        ...state,
        ministries: {
          ...(state.ministries || {}),
          [ministryId]: {
            ...currentMin,
            automationEnabled: !currentVal
          }
        }
      };
    }

    case 'BUY_CIVIL_BUSINESS': {
      const { planetId, businessType, cost } = action;
      const planet = state.planets.find(p => p.id === planetId);
      if (!planet) return state;
      if (!canAfford(planet.resources, cost)) return state;

      const currentBusinesses = planet.civilBusinesses || { lowClass: 0, midClass: 0, highClass: 0 };
      const nextBusinesses = {
        ...currentBusinesses,
        [businessType]: (currentBusinesses[businessType] || 0) + 1
      };

      let newState = updatePlanet(state, planetId, p => ({
        ...p,
        resources: deduct(p.resources, cost),
        civilBusinesses: nextBusinesses
      }));

      newState.notifications = [...(newState.notifications || []), {
        id: uid(),
        type: 'success',
        message: `💼 Negocio Civil establecido en ${planet.name}. Aumenta la recaudación de impuestos.`,
        timestamp: Date.now()
      }];
      return newState;
    }

    default:
      return state;
  }
};
