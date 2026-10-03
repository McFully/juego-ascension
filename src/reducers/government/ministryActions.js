import { updatePlanet } from '../../core.jsx';
import { buildPlanetMinistries } from '../../data/ministryState.js';

export const handleAddChatMessage = (state, action) => {
  const { aiId, sender, text } = action;
  const history = state.chatHistory?.[aiId] || [];
  return {
    ...state,
    chatHistory: {
      ...(state.chatHistory || {}),
      [aiId]: [...history, { sender, text, timestamp: Date.now() }].slice(-100)
    }
  };
};

export const handleUpdateMinistryPolicy = (state, action) => {
  const { ministry, key, value, planetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  if (targetPlanetId && state.planets?.some(p => p.id === targetPlanetId)) {
    return updatePlanet(state, targetPlanetId, p => {
      const pMins = p.ministries || buildPlanetMinistries(state.gameMode);
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
};

export const handleAppointMinister = (state, action) => {
  const { ministryId, minister, planetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  if (targetPlanetId && state.planets?.some(p => p.id === targetPlanetId)) {
    return updatePlanet(state, targetPlanetId, p => {
      const pMins = p.ministries || buildPlanetMinistries(state.gameMode);
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
};

export const handleToggleMinistryDirective = (state, action) => {
  const { ministryId, directiveId, planetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  if (targetPlanetId && state.planets?.some(p => p.id === targetPlanetId)) {
    return updatePlanet(state, targetPlanetId, p => {
      const pMins = p.ministries || buildPlanetMinistries(state.gameMode);
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
};

export const handleSetMinistryAutomation = (state, action) => {
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
            automationEnabled: enabled !== undefined ? enabled : !currentMin.automationEnabled
          }
        }
      };
    });
  }
  return {
    ...state,
    ministries: {
      ...state.ministries,
      [ministryId]: {
        ...state.ministries?.[ministryId],
        automationEnabled: enabled !== undefined ? enabled : !state.ministries?.[ministryId]?.automationEnabled
      }
    }
  };
};

export const handleToggleMinistryAutomation = (state, action) => {
  const { ministryId, planetId } = action;
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
            automationEnabled: !currentMin.automationEnabled
          }
        }
      };
    });
  }
  return {
    ...state,
    ministries: {
      ...state.ministries,
      [ministryId]: {
        ...state.ministries?.[ministryId],
        automationEnabled: !state.ministries?.[ministryId]?.automationEnabled
      }
    }
  };
};

export const handleSetMinistryState = (state, action) => {
  const { ministryId, patch, planetId } = action;
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
            ...patch
          }
        }
      };
    });
  }
  return {
    ...state,
    ministries: {
      ...state.ministries,
      [ministryId]: {
        ...state.ministries?.[ministryId],
        ...patch
      }
    }
  };
};

export const handleSetMinistryDoctrine = (state, action) => {
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
};
