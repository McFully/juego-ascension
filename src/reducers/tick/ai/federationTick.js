import { uid } from '../../../core.jsx';

export const processFederationTick = (newState, previousState = newState) => {
  if ((previousState.gameTick > 0 && previousState.gameTick % 180 === 0) || (newState.gameTick > 0 && newState.gameTick % 180 === 0)) {
    if (newState.federations && newState.federations.length > 0) {
    newState.federations = newState.federations.map(fed => {
      if (fed.members.includes('player')) {
        const potentialJoins = newState.aiPlanets.filter(ai => (ai.relation || 0) >= 60 && !fed.members.includes(ai.id));
        let newMembers = [...fed.members];
        let joinedNames = [];
        potentialJoins.forEach(ai => {
          if (Math.random() < 0.25) {
            newMembers.push(ai.id);
            joinedNames.push(ai.empireName || ai.name);
          }
        });
        if (joinedNames.length > 0) {
          newState.notifications = [...(newState.notifications || []), {
            id: uid(),
            type: 'success',
            message: `🤝 ${joinedNames.join(', ')} se ha(n) unido a la ${fed.name}.`,
            timestamp: Date.now()
          }];
        }
        return { ...fed, members: newMembers };
      }
      return fed;
    });
    }
  }
  return newState;
};
