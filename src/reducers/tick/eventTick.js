import { NARRATIVE_EVENTS, uid } from '../../core.jsx';

export const processNarrativeEvents = (newState, now) => {
  if (newState.gameTick > 0 && newState.gameTick % 60 === 0 && !newState.activeEvent && !newState.activeFirstContact && !newState.activeTransmission) {
    for (const event of NARRATIVE_EVENTS) {
      const alreadyFired = newState.adventureLogs?.some(log => log.eventId === event.id);
      if (!alreadyFired && event.triggerCondition(newState)) {
        newState.activeEvent = {
          ...event,
          timestamp: now
        };
        newState.notifications = [...(newState.notifications || []), {
          id: uid(),
          type: event.type === 'crisis' ? 'error' : 'info',
          message: `📡 TRANSMISIÓN URGENTE: ${event.title}. Requiere tu atención inmediata en Visión General.`,
          timestamp: now
        }];
        break; // Only trigger one event per minute max
      }
    }
  }
  return newState;
};

export { processFleetMissions } from './events/missionsAndRandomEvents.js';
export { processGalacticCouncilAndCrises, processCrisisAndVictory } from './events/councilAndCrises.js';
export { processNotificationsAndFirstContact } from './events/transmissionsAndFirstContact.js';

