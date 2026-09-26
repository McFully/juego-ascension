import { updatePlanet } from '../core.jsx';
import { migrateLoadState } from './loadMigrator.js';
import { processTick } from './tick/tickOrchestrator.js';


export const systemReducer = (state, action) => {
  switch (action.type) {
    case 'RESET_GAME': {
      return { gameStarted: false };
    }
    case 'LOAD': {
      return migrateLoadState(action.payload);
    }
    case 'TICK': {
      return processTick(state);
    }
    case 'APPLY_TICK_STATE': {
      return action.payload;
    }

    case 'SET_PLANET_GOVERNOR': {
      const { planetId, governor } = action.payload;
      return updatePlanet(state, planetId, p => ({
        ...p,
        governance: {
          ...(p.governance || {}),
          governor,
        }
      }));
    }

    case 'ASSIGN_LOCAL_MINISTRY_BUDGET': {
      const { planetId, ministryKey, budgetShare } = action.payload;
      return updatePlanet(state, planetId, p => {
        const gov = p.governance || { localMinistries: {} };
        const mins = gov.localMinistries || {};
        return {
          ...p,
          governance: {
            ...gov,
            localMinistries: {
              ...mins,
              [ministryKey]: {
                ...(mins[ministryKey] || { activeTasks: [] }),
                budgetShare: Math.max(0, Math.min(1.0, budgetShare)),
              }
            }
          }
        };
      });
    }

    case 'TOGGLE_LOCAL_MINISTERIAL_SUBTASK': {
      const { planetId, ministryKey, taskId } = action.payload;
      return updatePlanet(state, planetId, p => {
        const gov = p.governance || { localMinistries: {} };
        const mins = gov.localMinistries || {};
        const min = mins[ministryKey] || { budgetShare: 0.20, activeTasks: [] };
        const currentTasks = Array.isArray(min.activeTasks) ? min.activeTasks : [];
        const isSelected = currentTasks.includes(taskId);
        const newTasks = isSelected
          ? currentTasks.filter(id => id !== taskId)
          : [...currentTasks, taskId];

        return {
          ...p,
          governance: {
            ...gov,
            localMinistries: {
              ...mins,
              [ministryKey]: {
                ...min,
                activeTasks: newTasks,
              }
            }
          }
        };
      });
    }

    default:
      return state;
  }
};

