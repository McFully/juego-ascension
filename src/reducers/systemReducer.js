import { updatePlanet } from '../core.jsx';
import { migrateLoadState } from './loadMigrator.js';
import { processTick } from './tick/tickOrchestrator.js';


export const systemReducer = (state, action) => {
  switch (action.type) {
    case 'RESET_GAME': {
      return {
        gameStarted: false,
        playerName: state.playerName,
        avatarUrl: state.avatarUrl,
        credits: state.credits,
      };
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

    // Senado Planetario: pacto tributario local.
    // Limite de la UI: 0% - 50%. El limite se repite aqui para que el dominio
    // no dependa de que la UI lo respete.
    case 'SET_PLANET_TAX_RATE': {
      const { planetId, taxRate } = action;
      if (!planetId || typeof taxRate !== 'number' || Number.isNaN(taxRate)) return state;
      const clamped = Math.max(0, Math.min(0.5, taxRate));
      return updatePlanet(state, planetId, p => ({ ...p, taxRate: clamped }));
    }

    // Senado Planetario: edictos locales (subsidios, festival, ley marcial).
    case 'TOGGLE_PLANET_LOCAL_DIRECTIVE': {
      const { planetId, directive } = action;
      if (!planetId || !directive) return state;
      return updatePlanet(state, planetId, p => {
        const directives = p.localDirectives || {};
        return {
          ...p,
          localDirectives: {
            ...directives,
            [directive]: !directives[directive],
          },
        };
      });
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

    case 'SET_TUTORIAL_COMPLETE': {
      return { ...state, showTutorial: false, tutorialCompleted: true };
    }

    case 'DISMISS_VICTORY_OVERLAY': {
      return { ...state, victory: null, gameOver: null };
    }

    case 'RENAME_PLANET': {
      const { planetId, name } = action;
      if (!name || !planetId) return state;
      return updatePlanet(state, planetId, p => ({
        ...p,
        name: name.trim()
      }));
    }

    case 'SET_PLAYER_PROFILE': {
      const { playerName, avatarUrl } = action.payload || {};
      return {
        ...state,
        playerName: playerName !== undefined ? playerName : state.playerName,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : state.avatarUrl
      };
    }

    default:
      return state;
  }
};

