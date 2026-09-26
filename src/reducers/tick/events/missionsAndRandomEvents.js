import { ARTIFACTS, uid, updatePlanet, calcDistance, calcFlightTime, fleetSpeed } from '../../../core.jsx';
import { EVENTS } from '../../../data/gameData.js';
import { processMission, returnFleetToOrigin, processEvent } from '../../../missions.jsx';

export const processFleetMissions = (newState) => {
  if (Array.isArray(newState.fleetMissions) && newState.fleetMissions.length > 0) {
    const ongoingMissions = [];
    for (const m of newState.fleetMissions) {
      if (m.returning) {
        if (Date.now() >= m.returnTime) {
          newState = returnFleetToOrigin(newState, m);
          newState.notifications = [...(newState.notifications || []), {
            id: uid(), type: 'info', message: `🚀 Flota regresó a ${m.from.name || 'origen'}`, timestamp: Date.now(),
          }];
        } else {
          ongoingMissions.push(m);
        }
      } else if (Date.now() >= m.arrivalTime) {
        if (m.type === 'ally_reinforce') {
          newState = updatePlanet(newState, m.to.id, p => ({
            ...p,
            fleet: Object.entries(m.fleet).reduce((acc, [id, qty]) => {
              acc[id] = (acc[id] || 0) + qty;
              return acc;
            }, { ...p.fleet }),
          }));
          newState.notifications = [...newState.notifications, { id: uid(), type: 'success', message: `🚀 Refuerzos aliados llegaron a ${m.to.name}`, timestamp: Date.now() }];
          
          const retreatDist = calcDistance(m.to, m.from);
          const retreatSpd = fleetSpeed(m.fleet, m.from.research || {}, m.from.faction || 'human');
          if (retreatSpd > 0) {
            const retreatTime = calcFlightTime(retreatDist, retreatSpd, 10);
            ongoingMissions.push({
              ...m,
              fleet: m.fleet,
              returning: true,
              returnDeparture: Date.now(),
              returnTime: Date.now() + retreatTime * 1000,
            });
          }
          continue;
        }

        let result;
        try {
          result = processMission(m, newState);
        } catch (e) {
          console.error('[Ascensión] processMission error:', e, m);
          result = { state: newState, type: 'error', message: 'Error procesando misión', returnFleet: m.fleet || {} };
        }
        newState = result.state;

        const returnFleet = result.returnFleet || {};
        if (Object.keys(returnFleet).length > 0) {
          const dist = calcDistance(m.from, m.to);
          if (!m.isAI) {
            const playerFaction = newState.planets.find(p => p.id === m.from.id)?.faction || 'human';
            const spd = fleetSpeed(returnFleet, newState.research, playerFaction, newState.relics || []);
            if (spd > 0) {
              const flightTime = calcFlightTime(dist, spd, 10);
              ongoingMissions.push({
                ...m,
                fleet: returnFleet,
                returning: true,
                returnDeparture: Date.now(),
                returnTime: Date.now() + flightTime * 1000,
              });
            }
          } else if (m.type === 'trade_receive') {
            const aiFaction = newState.aiPlanets.find(p => p.id === m.from.id)?.faction || 'human';
            const spd = fleetSpeed(returnFleet, m.from.research || {}, aiFaction);
            if (spd > 0) {
              const flightTime = calcFlightTime(dist, spd, 10);
              ongoingMissions.push({
                ...m,
                fleet: returnFleet,
                returning: true,
                returnDeparture: Date.now(),
                returnTime: Date.now() + flightTime * 1000,
              });
            }
          }
        }

        if (m.type === 'expedition') {
          newState.stats = { ...newState.stats, expeditionsCompleted: (newState.stats.expeditionsCompleted || 0) + 1 };
          if (result.foundArtifact) {
            newState.stats = { ...newState.stats, artifactsFound: (newState.stats.artifactsFound || 0) + 1 };
            const ownedRelics = newState.relics || [];
            const undiscovered = ARTIFACTS.filter(a => !ownedRelics.some(r => r.id === a.id));
            if (undiscovered.length > 0) {
              const pick = undiscovered[Math.floor(Math.random() * undiscovered.length)];
              newState.relics = [...ownedRelics, { ...pick, active: true, discoveredAt: Date.now() }];
              newState.notifications = [...(newState.notifications || []), {
                id: uid(), type: 'success', message: `🏺 ¡Descubierto Artefacto Antiguo: ${pick.name}! ${pick.desc}`,
                timestamp: Date.now()
              }];
            }
          }
        }

        newState.notifications = [...(newState.notifications || []), {
          id: uid(), type: result.type, message: result.message, timestamp: Date.now(),
        }];
      } else {
        ongoingMissions.push(m);
      }
    }
    newState.fleetMissions = ongoingMissions;
  }

  // Random events
  if (Math.random() < 0.008) {
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    const effect = processEvent(event, newState);
    newState = effect.state;
    const currentEvents = [...(newState.events || []), { ...event, timestamp: Date.now(), effect: effect.desc }];
    newState.events = currentEvents.length > 30 ? currentEvents.slice(-30) : currentEvents;
    newState.notifications = [...(newState.notifications || []), {
      id: uid(), type: effect.type, message: `${event.icon} ${event.name}: ${effect.desc}`, timestamp: Date.now(),
    }];
  }

  return newState;
};
