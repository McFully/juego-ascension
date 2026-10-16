import { updatePlanet, deduct, uid } from '../../core.jsx';
import { MINISTRY_MAPPING } from '../../data/buildingOperationsData.js';
import { CANDIDATES_POOL } from '../../data/governmentPoliciesData.js';
import { MINISTRY_BUILDING_REQS, buildPlanetMinistries } from '../../data/ministryState.js';

export const handleBuyCivilBusiness = (state, action) => {
  const { planetId, businessType, cost } = action;
  const planet = state.planets.find(p => p.id === planetId);
  if (!planet || !cost) return state;

  if (planet.resources.metal < cost.metal || planet.resources.crystal < cost.crystal || planet.resources.deuterium < cost.deuterium) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `⚠️ Recursos insuficientes en ${planet.name} para establecer este negocio civil.`,
        timestamp: Date.now()
      }]
    };
  }

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
};

export const handleSetPlanetGovernorDirectiveMode = (state, action) => {
  const { planetId, directiveMode } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const effectiveMode = directiveMode || 'autonomous_only';
  return updatePlanet(state, targetPlanetId, p => {
    const currentMinistries = p.ministries || buildPlanetMinistries(state.gameMode);
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
};

export const handleSetPlanetAutoGovernance = (state, action) => {
  const { planetId, autoGovernance, directiveMode } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const planet = state.planets.find(p => p.id === targetPlanetId);
  const newAutoGov = autoGovernance !== undefined ? autoGovernance : !planet?.autoGovernance;
  const effectiveMode = directiveMode || planet?.governorDirectiveMode || 'autonomous_only';

  return updatePlanet(state, targetPlanetId, p => {
    const currentMinistries = p.ministries || buildPlanetMinistries(state.gameMode);
    const updatedMinistries = { ...currentMinistries };
    const b = p.buildings || {};

    if (newAutoGov) {
      if (effectiveMode === 'full_auto') {
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
      autoGovernance: newAutoGov,
      governorDirectiveMode: effectiveMode,
      ministries: updatedMinistries
    };
  });
};

export const handleSetEmperorDirectiveMode = (state, action) => {
  const { directiveMode } = action;
  const effectiveMode = directiveMode || 'autonomous_only';
  const updatedPlanets = (state.planets || []).map(p => {
    const currentMinistries = p.ministries || buildPlanetMinistries(state.gameMode);
    const updatedMinistries = { ...currentMinistries };
    const b = p.buildings || {};

    if (state.emperorAutoGovernance && effectiveMode === 'full_auto') {
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
};

export const handleSetEmperorAutoGovernance = (state, action) => {
  const { autoGovernance, directiveMode } = action;
  const targetActive = autoGovernance !== undefined ? autoGovernance : !state.emperorAutoGovernance;
  const effectiveMode = directiveMode || state.emperorDirectiveMode || 'autonomous_only';

  const updatedPlanets = (state.planets || []).map(p => {
    const currentMinistries = p.ministries || buildPlanetMinistries(state.gameMode);
    const updatedMinistries = { ...currentMinistries };
    const b = p.buildings || {};

    if (targetActive) {
      if (effectiveMode === 'full_auto') {
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
};

export { handleExecuteSenateDecree } from './senateDecretActions.js';
