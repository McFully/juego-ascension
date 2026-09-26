import { uid, canAfford, deduct, updatePlanet } from '../../core.jsx';

export const handleCouncilProposeResolution = (state, action) => {
  const { title, effect, cost } = action;
  if (!state.galacticCouncil || (state.influence || 0) < (cost || 20)) return state;
  const session = state.galacticCouncil.currentSession || {
    id: uid(),
    tick: state.gameTick,
    proposals: [],
    votes: {}
  };
  const proposal = {
    id: uid(),
    title,
    effect,
    proposer: 'player',
    votes: {}
  };
  session.proposals = [...(session.proposals || []), proposal];
  return {
    ...state,
    influence: (state.influence || 0) - (cost || 20),
    galacticCouncil: { ...state.galacticCouncil, currentSession: session }
  };
};

export const handleCouncilVote = (state, action) => {
  const { proposalId, vote } = action;
  const session = state.galacticCouncil?.currentSession;
  if (!session) return state;
  const newVotes = { ...(session.votes || {}), [proposalId]: { ...(session.votes?.[proposalId] || {}), player: vote } };
  return {
    ...state,
    galacticCouncil: {
      ...state.galacticCouncil,
      currentSession: { ...session, votes: newVotes }
    }
  };
};

export const handleFormFederation = (state, action) => {
  const { name, memberIds } = action;
  const finalMembers = [...new Set(['player', ...(memberIds || [])])];
  if ((state.influence || 0) < 80 || finalMembers.length < 1) return state;
  const newFed = {
    id: uid(),
    name: name || 'Nueva Federación',
    members: finalMembers,
    leader: 'player',
    level: 1,
    createdTick: state.gameTick,
    bonuses: { production: 0.05, defense: 0.1 }
  };
  return {
    ...state,
    influence: (state.influence || 0) - 80,
    federations: [...(state.federations || []), newFed]
  };
};

export const handleContributeToFederalFleet = (state, action) => {
  const { resources, ships } = action;
  const planet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!planet) return state;
  
  if (resources && !canAfford(planet.resources, resources)) return state;
  
  if (ships) {
    for (const [id, qty] of Object.entries(ships)) {
      if (qty < 0 || (planet.fleet[id] || 0) < qty) return state;
    }
  }
  
  let newResources = planet.resources;
  if (resources) {
    newResources = deduct(newResources, resources);
  }
  
  const newFleet = { ...planet.fleet };
  if (ships) {
    for (const [id, qty] of Object.entries(ships)) {
      newFleet[id] = (newFleet[id] || 0) - qty;
      if (newFleet[id] <= 0) delete newFleet[id];
    }
  }
  
  let newState = updatePlanet(state, planet.id, p => ({
    ...p,
    resources: newResources,
    fleet: newFleet
  }));
  
  const oldShips = newState.federalFleet?.ships || {};
  const newFedShips = { ...oldShips };
  if (ships) {
    for (const [id, qty] of Object.entries(ships)) {
      newFedShips[id] = (newFedShips[id] || 0) + qty;
    }
  }
  
  const contrib = state.federalFleet?.contributions?.player || { metal: 0, crystal: 0, deuterium: 0, ships: {} };
  const newContrib = {
    metal: contrib.metal + (resources?.metal || 0),
    crystal: contrib.crystal + (resources?.crystal || 0),
    deuterium: contrib.deuterium + (resources?.deuterium || 0),
    ships: { ...contrib.ships }
  };
  if (ships) {
    Object.entries(ships).forEach(([id, qty]) => {
      newContrib.ships[id] = (newContrib.ships[id] || 0) + qty;
    });
  }

  newState.federalFleet = {
    metal: (state.federalFleet?.metal || 0) + (resources?.metal || 0),
    crystal: (state.federalFleet?.crystal || 0) + (resources?.crystal || 0),
    deuterium: (state.federalFleet?.deuterium || 0) + (resources?.deuterium || 0),
    ships: newFedShips,
    contributions: {
      ...(state.federalFleet?.contributions || {}),
      player: newContrib
    }
  };
  
  newState.notifications = [...(newState.notifications || []), {
    id: uid(),
    type: 'success',
    message: `🤝 Has contribuido con recursos y/o naves al Ejército Federal. Aportes registrados.`,
    timestamp: Date.now()
  }];
  
  return newState;
};
