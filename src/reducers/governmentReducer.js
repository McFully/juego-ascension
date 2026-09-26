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
import { MINISTRY_MAPPING } from '../data/buildingOperationsData.js';
import { CANDIDATES_POOL } from '../data/governmentPoliciesData.js';
import { MINISTRY_BUILDING_REQS } from './colonyGovernor.js';

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
          const shouldAuto = Boolean(p.autoGovernance && minister);
          return {
            ...p,
            ministries: {
              ...pMins,
              [ministryId]: {
                ...(pMins[ministryId] || {}),
                minister: minister,
                automationEnabled: shouldAuto ? true : (pMins[ministryId]?.automationEnabled || false)
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

    case 'SET_MINISTRY_AUTOMATION': {
      const { ministryId, planetId, enabled } = action;
      const targetPlanetId = planetId || state.currentPlanetId;
      if (targetPlanetId && state.planets?.some(p => p.id === targetPlanetId)) {
        return updatePlanet(state, targetPlanetId, p => {
          const pMins = p.ministries || {};
          const currentMin = pMins[ministryId] || {};
          return {
            ...p,
            ministries: {
              ...pMins,
              [ministryId]: {
                ...currentMin,
                automationEnabled: enabled !== undefined ? Boolean(enabled) : true
              }
            }
          };
        });
      }
      const currentMin = state.ministries?.[ministryId] || {};
      return {
        ...state,
        ministries: {
          ...(state.ministries || {}),
          [ministryId]: {
            ...currentMin,
            automationEnabled: enabled !== undefined ? Boolean(enabled) : true
          }
        }
      };
    }

    case 'TOGGLE_MINISTRY_AUTOMATION': {
      const { ministryId, planetId } = action;
      const targetPlanetId = planetId || state.currentPlanetId;
      if (targetPlanetId && state.planets?.some(p => p.id === targetPlanetId)) {
        return updatePlanet(state, targetPlanetId, p => {
          const pMins = p.ministries || {};
          const currentMin = pMins[ministryId] || {};
          const currentVal = Boolean(currentMin.automationEnabled);
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
      const currentVal = Boolean(currentMin.automationEnabled);
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

    case 'SET_PLANET_GOVERNOR_DIRECTIVE_MODE': {
      const { planetId, directiveMode } = action;
      const targetPlanetId = planetId || state.currentPlanetId;
      const effectiveMode = directiveMode || 'autonomous_only';
      return updatePlanet(state, targetPlanetId, p => {
        const currentMinistries = p.ministries || state.ministries || {};
        const updatedMinistries = { ...currentMinistries };
        const b = p.buildings || {};

        if (p.autoGovernance && effectiveMode === 'full_auto') {
          Object.keys(MINISTRY_MAPPING).forEach(mId => {
            const req = MINISTRY_BUILDING_REQS[mId];
            const isUnlocked = !req || ((b[req.id] || 0) >= 1);
            if (isUnlocked) {
              const currentMin = updatedMinistries[mId] || {};
              const candidates = CANDIDATES_POOL[mId] || [];
              const assignedMinister = currentMin.minister || (candidates.length > 0 ? candidates[0] : null);
              updatedMinistries[mId] = {
                ...currentMin,
                minister: assignedMinister,
                automationEnabled: true
              };
            }
          });
        }

        return {
          ...p,
          governorDirectiveMode: effectiveMode,
          ministries: updatedMinistries
        };
      });
    }

    case 'SET_PLANET_AUTO_GOVERNANCE': {
      const { planetId, autoGovernance, directiveMode } = action;
      const targetPlanetId = planetId || state.currentPlanetId;
      const planet = state.planets.find(p => p.id === targetPlanetId);
      const newAutoGov = autoGovernance !== undefined ? autoGovernance : !planet?.autoGovernance;
      const effectiveMode = directiveMode || planet?.governorDirectiveMode || 'autonomous_only';

      return updatePlanet(state, targetPlanetId, p => {
        const currentMinistries = p.ministries || state.ministries || {};
        const updatedMinistries = { ...currentMinistries };
        const b = p.buildings || {};

        if (newAutoGov) {
          if (effectiveMode === 'full_auto') {
            // En modo full_auto se invisten todos los ministerios desbloqueados y se ponen en autónomo
            Object.keys(MINISTRY_MAPPING).forEach(mId => {
              const req = MINISTRY_BUILDING_REQS[mId];
              const isUnlocked = !req || ((b[req.id] || 0) >= 1);
              if (isUnlocked) {
                const currentMin = updatedMinistries[mId] || {};
                const candidates = CANDIDATES_POOL[mId] || [];
                const assignedMinister = currentMin.minister || (candidates.length > 0 ? candidates[0] : null);
                updatedMinistries[mId] = {
                  ...currentMin,
                  minister: assignedMinister,
                  automationEnabled: true
                };
              }
            });
          } else if (effectiveMode === 'assigned_all') {
            // En modo assigned_all se activan todos los que tengan ministro asignado
            Object.entries(updatedMinistries).forEach(([mId, mData]) => {
              if (mData?.minister) {
                updatedMinistries[mId] = { ...mData, automationEnabled: true };
              }
            });
          } else {
            // Modo autonomous_only: Respeta los que ya tuvieran automationEnabled o ministro
            Object.entries(updatedMinistries).forEach(([mId, mData]) => {
              if (mData?.minister && mData?.automationEnabled) {
                updatedMinistries[mId] = { ...mData, automationEnabled: true };
              }
            });
          }
        } else {
          // Si se desactiva el gobernador, se pausa la automatización autónoma global
          Object.keys(updatedMinistries).forEach(mId => {
            updatedMinistries[mId] = { ...updatedMinistries[mId], automationEnabled: false };
          });
        }

        return {
          ...p,
          autoGovernance: newAutoGov,
          governorDirectiveMode: effectiveMode,
          ministries: updatedMinistries
        };
      });
    }

    case 'SET_EMPEROR_DIRECTIVE_MODE': {
      const { directiveMode } = action;
      const effectiveMode = directiveMode || 'autonomous_only';
      const updatedPlanets = (state.planets || []).map(p => {
        const currentMinistries = p.ministries || state.ministries || {};
        const updatedMinistries = { ...currentMinistries };
        const b = p.buildings || {};

        if (p.autoGovernance && effectiveMode === 'full_auto') {
          Object.keys(MINISTRY_MAPPING).forEach(mId => {
            const req = MINISTRY_BUILDING_REQS[mId];
            const isUnlocked = !req || ((b[req.id] || 0) >= 1);
            if (isUnlocked) {
              const currentMin = updatedMinistries[mId] || {};
              const candidates = CANDIDATES_POOL[mId] || [];
              const assignedMinister = currentMin.minister || (candidates.length > 0 ? candidates[0] : null);
              updatedMinistries[mId] = {
                ...currentMin,
                minister: assignedMinister,
                automationEnabled: true
              };
            }
          });
        }

        return {
          ...p,
          governorDirectiveMode: effectiveMode,
          ministries: updatedMinistries
        };
      });
      return {
        ...state,
        emperorDirectiveMode: effectiveMode,
        planets: updatedPlanets
      };
    }

    case 'SET_EMPEROR_AUTO_GOVERNANCE': {
      const { autoGovernance, directiveMode } = action;
      const planets = state.planets || [];
      const allActive = planets.length > 0 && planets.every(p => Boolean(p.autoGovernance));
      const targetActive = autoGovernance !== undefined ? autoGovernance : !allActive;
      const effectiveMode = directiveMode || state.emperorDirectiveMode || 'autonomous_only';

      const updatedPlanets = planets.map(p => {
        const currentMinistries = p.ministries || state.ministries || {};
        const updatedMinistries = { ...currentMinistries };
        const b = p.buildings || {};

        if (targetActive) {
          if (effectiveMode === 'full_auto') {
            // Investidura y activación total en todas las colonias del imperio
            Object.keys(MINISTRY_MAPPING).forEach(mId => {
              const req = MINISTRY_BUILDING_REQS[mId];
              const isUnlocked = !req || ((b[req.id] || 0) >= 1);
              if (isUnlocked) {
                const currentMin = updatedMinistries[mId] || {};
                const candidates = CANDIDATES_POOL[mId] || [];
                const assignedMinister = currentMin.minister || (candidates.length > 0 ? candidates[0] : null);
                updatedMinistries[mId] = {
                  ...currentMin,
                  minister: assignedMinister,
                  automationEnabled: true
                };
              }
            });
          } else if (effectiveMode === 'assigned_all') {
            Object.entries(updatedMinistries).forEach(([mId, mData]) => {
              if (mData?.minister) {
                updatedMinistries[mId] = { ...mData, automationEnabled: true };
              }
            });
          } else {
            Object.entries(updatedMinistries).forEach(([mId, mData]) => {
              if (mData?.minister && mData?.automationEnabled) {
                updatedMinistries[mId] = { ...mData, automationEnabled: true };
              }
            });
          }
        } else {
          Object.keys(updatedMinistries).forEach(mId => {
            updatedMinistries[mId] = { ...updatedMinistries[mId], automationEnabled: false };
          });
        }

        return {
          ...p,
          autoGovernance: targetActive,
          governorDirectiveMode: effectiveMode,
          ministries: updatedMinistries
        };
      });

      return {
        ...state,
        emperorAutoGovernance: targetActive,
        emperorDirectiveMode: effectiveMode,
        planets: updatedPlanets
      };
    }

    case 'SET_BUILDING_MODE': {
      const { planetId, buildingId, modeId } = action;
      const targetPlanetId = planetId || state.currentPlanetId;
      return updatePlanet(state, targetPlanetId, p => ({
        ...p,
        buildingModes: {
          ...(p.buildingModes || {}),
          [buildingId]: modeId
        }
      }));
    }

    case 'TOGGLE_AUTOMATION_RESTRICTION': {
      const { planetId, targetId } = action;
      const targetPlanetId = planetId || state.currentPlanetId;
      return updatePlanet(state, targetPlanetId, p => {
        const currentExclusions = p.automatedExclusions || {};
        const isCurrentlyRestricted = Boolean(currentExclusions[targetId]);
        const nextExclusions = { ...currentExclusions };
        if (isCurrentlyRestricted) {
          delete nextExclusions[targetId];
        } else {
          nextExclusions[targetId] = true;
        }
        return {
          ...p,
          automatedExclusions: nextExclusions
        };
      });
    }

    case 'EXECUTE_BUILDING_ACTION': {
      const { planetId, buildingId, actionId, cost } = action;
      const targetPlanetId = planetId || state.currentPlanetId;
      const planet = state.planets?.find(p => p.id === targetPlanetId);
      if (!planet) return state;

      let nextRes = { ...planet.resources };
      if (cost) {
        if (cost.metal && (nextRes.metal || 0) < cost.metal) return state;
        if (cost.crystal && (nextRes.crystal || 0) < cost.crystal) return state;
        if (cost.deuterium && (nextRes.deuterium || 0) < cost.deuterium) return state;
        nextRes = deduct(nextRes, cost);
      }

      // Efectos inmediatos de ciertas acciones
      let bonusMsg = `⚙️ Protocolo ejecutado en ${planet.name}.`;
      if (actionId === 'detonateVein') {
        nextRes.metal = (nextRes.metal || 0) + 1500;
        bonusMsg = `⛏️ Detonación sísmica completada: +1.500 Metal en ${planet.name}.`;
      } else if (actionId === 'harvestGems') {
        nextRes.crystal = (nextRes.crystal || 0) + 1000;
        bonusMsg = `💎 Prismas recolectados: +1.000 Cristal en ${planet.name}.`;
      } else if (actionId === 'purgePlasma') {
        nextRes.deuterium = (nextRes.deuterium || 0) + 600;
        bonusMsg = `⚗️ Purga de plasma completada: +600 Deuterio en ${planet.name}.`;
      } else if (actionId === 'smeltReserves') {
        nextRes.metal = (nextRes.metal || 0) + 2000;
        bonusMsg = `🏭 Colada continua completada: +2.000 Metal en ${planet.name}.`;
      }

      let ns = updatePlanet(state, targetPlanetId, p => ({
        ...p,
        resources: nextRes
      }));

      ns.notifications = [...(ns.notifications || []), {
        id: uid(),
        type: 'info',
        message: bonusMsg,
        timestamp: Date.now()
      }];
      return ns;
    }

    case 'SET_MINISTRY_DOCTRINE': {
      const { planetId, ministryId, doctrineId, budget } = action;
      const targetPlanetId = planetId || state.currentPlanetId;
      return updatePlanet(state, targetPlanetId, p => {
        const pMins = p.ministries || {};
        return {
          ...p,
          ministries: {
            ...pMins,
            [ministryId]: {
              ...(pMins[ministryId] || {}),
              activeDoctrine: doctrineId,
              budget: budget !== undefined ? budget : (pMins[ministryId]?.budget || 1000)
            }
          }
        };
      });
    }

    default:
      return state;
  }
};
