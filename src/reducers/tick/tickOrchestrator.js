import {
  GAME_SPEED, NARRATIVE_EVENTS, EVENTS,
  checkAchievements, checkMissions, uid,
  calcProduction, calcStorage, calcDistance, calcFlightTime, fleetSpeed
} from '../../core.jsx';
import { processMission, returnFleetToOrigin, processEvent } from '../../missions.jsx';
import { processPlanetTick } from './populationTick.js';
import { processLivingPlanetTick } from './livingPlanetTick.js';
import { ensureMinistries, processMinistriesTick } from './ministries/ministryTick.js';
import { processAllQueuesTick } from './queues/queueTick.js';
import { reconcileQueueTimings } from './queues/queueTiming.js';
import { processAIEmpireTick } from './ai/aiEmpireTick.js';
import { eventReducer } from '../eventReducer.js';
import { processFederationTick } from './ai/federationTick.js';
import { ESPIONAGE_PHASES } from '../../utils/espionageFormulas.js';
import { processAiEspionageTick } from './ai/aiEspionageTick.js';
import { processDialogueTransmissionTick } from './events/dialogueTransmissionTick.js';
import { processPatrolsTick } from './patrolTick.js';
import { processAutoBuildTick } from './automation/autoBuildTick.js';
import { processAutoEconomyDefenseTick } from './automation/autoEconomyDefenseTick.js';
import { processAutoTradeRoutesTick } from './automation/autoTradeRoutesTick.js';
import { processAutoResearchTick } from './automation/autoResearchTick.js';
import { processExchangeOrdersTick } from './exchangeOrdersTick.js';
import { processPirateRaidTick } from './pirateRaidTick.js';
import { processWorldAlertsTick } from './worldAlertTick.js';
import { createFleetReturnEvent, appendFleetReturnTacticalEvent } from './fleetReturnEvents.js';
import { processBankLiquidation } from '../../utils/galacticBankCore.js';

export const processTick = (state) => {
  const now = Date.now();
  let newState = { ...state, gameTick: state.gameTick + 1, lastTick: now };

  // 1. Hardening & Ministries setup
  newState = ensureMinistries(newState);

  // 1.1 3.6 — Estados continuos del mundo, anotados en la bandeja.
  newState = processWorldAlertsTick(newState, now);

  // 2. Narrative events check
  // 3.6 — La guarda ya no mira slots efímeros (`activeEvent` etc.), que con 3.4
  // dejan de montarse: si se apoyara en ellos, se podrían encadenar ilimitadas
  // narrativas con decisión pendiente. Ahora pregunta al log, que es donde vive
  // de verdad lo que el jugador aún no ha mirado.
  const hayDecisionPendiente = (newState.tacticalEventLog || []).some(e => !e.read && e.requiresDecision);

  if (newState.gameTick > 0 && newState.gameTick % 60 === 0 && !hayDecisionPendiente) {
    for (const event of NARRATIVE_EVENTS) {
      if (!newState.triggeredNarrativeEvents?.includes(event.id) && event.triggerCondition(newState)) {
        const { triggerCondition, ...serializableEvent } = event;
        newState.activeEvent = serializableEvent;
        newState.triggeredNarrativeEvents = [...(newState.triggeredNarrativeEvents || []), event.id];
        // La narrativa va también a la bandeja: ya no se abre sola, y si el
        // jugador no la mira, se queda ahí con el contador en rojo.
        newState = eventReducer(newState, {
          type: 'APPEND_TACTICAL_EVENT_LOG',
          payload: { ...serializableEvent, kind: 'narrative', read: false, priority: 'alta' },
        });
        newState.notifications = [...(newState.notifications || []), {
          id: uid(),
          type: event.type === 'crisis' ? 'error' : 'info',
          message: `📡 TRANSMISIÓN URGENTE: ${event.title}. Requiere tu atención en el Registro Táctico.`,
          timestamp: now
        }];
        break;
      }
    }
  }

  // 3. Cache production and storage
  const prodCache = new Map();
  const storageCache = new Map();
  for (const planet of state.planets) {
    let prod;
    try {
      // Fuente de verdad del impuesto: el pacto tributario del propio planeta
      // (Senado Planetario). El impuesto del Ministerio de Economía es solo el
      // respaldo para mundos que aún no han fijado pacto local.
      const planetTax = planet.taxRate ?? state.ministries?.economy?.taxRate ?? 0;
      prod = calcProduction(planet.buildings, state.research, planet.temperature, GAME_SPEED, planet.faction || 'human', planet.biome, planet.gravity, planet.trait, planet.specialization, { galaxy: planet.galaxy, system: planet.system, position: planet.position }, planetTax);
    } catch (e) {
      console.error('[Ascensión] calcProduction in TICK error:', e, planet.id);
      prod = { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0, ratio: 1 };
    }
    prodCache.set(planet.id, prod);
    storageCache.set(planet.id, calcStorage(planet.buildings));
  }

  // 4. Planets simulation tick
  const newPlanets = state.planets.map(planet => {
    const prod = prodCache.get(planet.id) || { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0, ratio: 1 };
    const storage = storageCache.get(planet.id) || { metal: 0, crystal: 0, deuterium: 0 };
    const popPlanet = processPlanetTick(planet, prod, storage, state);
    return processLivingPlanetTick(popPlanet, state);
  });
  newState.planets = newPlanets;

  // 5. Ministry tick logic
  newState = processMinistriesTick(newState, newPlanets, prodCache);

  // 6. Stats update: acumula producción global de todo el imperio (Fase 18)
  const currentStats = newState.stats || {};
  const globalGathered = newPlanets.reduce((acc, p) => {
    const pProd = prodCache.get(p.id) || { metal: 0, crystal: 0, deuterium: 0 };
    acc.metal += (pProd.metal || 0) / 3600;
    acc.crystal += (pProd.crystal || 0) / 3600;
    acc.deuterium += (pProd.deuterium || 0) / 3600;
    return acc;
  }, { metal: 0, crystal: 0, deuterium: 0 });

  newState.stats = {
    ...currentStats,
    playTime: (currentStats.playTime || 0) + 1,
    metalGathered: (currentStats.metalGathered || 0) + globalGathered.metal,
    crystalGathered: (currentStats.crystalGathered || 0) + globalGathered.crystal,
    deuteriumGathered: (currentStats.deuteriumGathered || 0) + globalGathered.deuterium,
  };

  // 7. Queues processing (build, research, retrofit, ships, defenses, custom)
  newState = processAllQueuesTick(newState);

  // 7.1 Reajuste de tiempos: si en este tick se mejoró un edificio o una tech que
  //     reduce tiempos (laboratorio, fábrica de robots/nanobots, astillero, centro de
  //     construcción...), lo que quedaba de las operaciones EN CURSO se acorta.
  newState = reconcileQueueTimings(newState);

  // 8. Fleet missions processing
  if (Array.isArray(state.fleetMissions) && state.fleetMissions.length > 0) {
    const ongoingMissions = [];
    for (const m of state.fleetMissions) {
      if (m.returning) {
        if (now >= m.returnTime) {
          newState = returnFleetToOrigin(newState, m);
          newState.notifications = [...(newState.notifications || []), {
            id: uid(), type: 'info', message: `🚀 Flota regresó a ${m.from.name || 'origen'}`, timestamp: now,
          }];

          // Si es una misión del jugador, generar tarjeta modal de retorno táctico
          if (!m.isAI && !m.autoRoute) {
            const returnEvent = createFleetReturnEvent(m, newState);
            if (returnEvent) {
              newState = appendFleetReturnTacticalEvent(newState, returnEvent);
            }
          }
        } else {
          ongoingMissions.push(m);
        }
      } else if (now >= m.arrivalTime) {
        if (m.type === 'ally_reinforce') {
          const targetPlanet = newState.planets.find(p => p.id === m.to.id);
          if (targetPlanet) {
            targetPlanet.fleet = Object.entries(m.fleet).reduce((acc, [id, qty]) => {
              acc[id] = (acc[id] || 0) + qty;
              return acc;
            }, { ...targetPlanet.fleet });
          }
          newState.notifications = [...newState.notifications, { id: uid(), type: 'success', message: `🚀 Refuerzos aliados llegaron a ${m.to.name}`, timestamp: now }];
          const retreatDist = calcDistance(m.to, m.from);
          const retreatSpd = fleetSpeed(m.fleet, m.from.research || {}, m.from.faction || 'human');
          if (retreatSpd > 0) {
            const retreatTime = calcFlightTime(retreatDist, retreatSpd, 10, m.from.research || {});
            ongoingMissions.push({
              ...m, fleet: m.fleet, returning: true, returnDeparture: now, returnTime: now + retreatTime * 1000,
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
            const spd = fleetSpeed(returnFleet, newState.research, playerFaction);
            if (spd > 0) {
              const flightTime = calcFlightTime(dist, spd, 10, newState.research);
              ongoingMissions.push({
                ...m, fleet: returnFleet, returning: true, returnDeparture: now, returnTime: now + flightTime * 1000,
                ...(m.type === 'espionage' ? { phase: ESPIONAGE_PHASES.REGRESANDO } : {}),
              });
            }
          } else if (m.isAI && (m.type === 'trade_receive' || m.type === 'espionage')) {
            const aiFaction = newState.aiPlanets.find(p => p.id === m.from.id)?.faction || 'human';
            const spd = fleetSpeed(returnFleet, m.from.research || {}, aiFaction);
            if (spd > 0) {
              const flightTime = calcFlightTime(dist, spd, 10, m.from.research || {});
              ongoingMissions.push({
                ...m, fleet: returnFleet, returning: true, returnDeparture: now, returnTime: now + flightTime * 1000,
                ...(m.type === 'espionage' ? { phase: ESPIONAGE_PHASES.REGRESANDO } : {}),
              });
            }
          }
        }

        if (m.type === 'expedition') {
          newState.stats = { ...newState.stats, expeditionsCompleted: (newState.stats.expeditionsCompleted || 0) + 1 };
          if (result.foundArtifact) {
            newState.stats = { ...newState.stats, artifactsFound: (newState.stats.artifactsFound || 0) + 1 };
          }
        }

        if (!m.autoRoute) {
          newState.notifications = [...(newState.notifications || []), {
            id: uid(), type: result.type, message: result.message, timestamp: now,
          }];
          if (result.tacticalEvent) {
            let enrichedEvent = { ...result.tacticalEvent };
            if (enrichedEvent.ministryId) {
              const currentPl = newState.planets?.find(p => p.id === (enrichedEvent.targetPlanetId || newState.currentPlanetId)) || newState.planets?.[0];
              const assignedMinister = currentPl?.ministries?.[enrichedEvent.ministryId]?.minister || newState.ministries?.[enrichedEvent.ministryId]?.minister || null;
              if (assignedMinister) {
                enrichedEvent.minister = assignedMinister;
              }
            }
            newState.tacticalEvents = [...(newState.tacticalEvents || []), enrichedEvent];
            // 3.3 — además va al registro persistente. `tacticalEvents` es la cola
            // de lo no leído (sigue alimentando el overlay hasta que 3.4 lo
            // desmonte); el log es el histórico que sostiene la bandeja.
            newState = eventReducer(newState, {
              type: 'APPEND_TACTICAL_EVENT_LOG',
              payload: { ...enrichedEvent, kind: 'tactical', read: false },
            });
          }
        }
      } else {
        ongoingMissions.push(m);
      }
    }
    newState.fleetMissions = ongoingMissions;
  }

  // 8.1 Procesamiento del ciclo de patrullas orbitales y del sistema
  newState = processPatrolsTick(newState, now);

  // 9. Random events
  if (Math.random() < 0.008) {
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    const effect = processEvent(event, newState);
    newState = effect.state;
    const currentEvents = [...(newState.events || []), { ...event, timestamp: now, effect: effect.desc }];
    newState.events = currentEvents.length > 30 ? currentEvents.slice(-30) : currentEvents;
    newState.notifications = [...(newState.notifications || []), {
      id: uid(), type: effect.type, message: `${event.icon} ${event.name}: ${effect.desc}`, timestamp: now,
    }];
  }

  // 10. Simulación de IA y federaciones
  newState = processAIEmpireTick(newState);
  newState = processFederationTick(newState, state);
  // La IA espía tus mundos: sin esto, `hawk_eye`, `counterIntelLevel`,
  // `espionageBudget`, `quantumCrypto` y `stealthSilos` no protegen de nada.
  newState = processAiEspionageTick(newState);

  // 11. Automatizaciones escalonadas (Alternancia en ticks pares e impares)
  // Ticks pares: Autogestión económica, defensiva y construcción
  if (newState.gameTick % 2 === 0) {
    newState = processAutoBuildTick(newState, prodCache, storageCache);
    newState = processAutoEconomyDefenseTick(newState);
  } else {
    // Ticks impares: Rutas comerciales automáticas e investigación automática
    newState = processAutoTradeRoutesTick(newState);
    newState = processAutoResearchTick(newState);
  }

  // 12. Vencimiento de tratados diplomáticos (Fase armónica cada 3 ticks)
  if (newState.gameTick % 3 === 0 && newState.aiPlanets && newState.aiPlanets.length > 0) {
    newState.aiPlanets = newState.aiPlanets.map(p => {
      let updated = { ...p };
      if (updated.pna && updated.pnaTicks > 0) {
        updated.pnaTicks = Math.max(0, updated.pnaTicks - 3);
        if (updated.pnaTicks === 0) {
          updated.pna = false;
          newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'warning', message: `📜 El Pacto de No Agresión con ${updated.name} ha expirado.`, timestamp: now }];
        }
      }
      if (updated.alliance && updated.allianceTicks > 0) {
        updated.allianceTicks = Math.max(0, updated.allianceTicks - 3);
        if (updated.allianceTicks === 0) {
          updated.alliance = false;
          newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'warning', message: `📜 La Alianza Militar con ${updated.name} ha expirado.`, timestamp: now }];
        }
      }
      if (updated.trade && updated.tradeTicks > 0) {
        updated.tradeTicks = Math.max(0, updated.tradeTicks - 3);
        updated.relation = Math.min(100, (updated.relation || 0) + 0.3);
        if (updated.tradeTicks === 0) {
          updated.trade = false;
          newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'warning', message: `📜 El Acuerdo de Comercio Forzado con ${updated.name} ha expirado.`, timestamp: now }];
        }
      }
      return updated;
    });
  }

  // 12.5. Órdenes Limit y tarifas de parking de la Lonja Galáctica
  newState = processExchangeOrdersTick(newState);

  // 12.6. Amenaza pirata y asaltos corsarios a la Lonja Galáctica
  newState = processPirateRaidTick(newState);

  // 12.7. Rutas comerciales bilaterales: devengo pasivo de dividendos mercantiles
  if (Array.isArray(newState.bilateralTradeRoutes) && newState.bilateralTradeRoutes.length > 0) {
    const totalRouteDividends = newState.bilateralTradeRoutes.reduce((acc, r) => acc + (r.rewardCredits || 150), 0);
    newState.credits = (newState.credits || 0) + totalRouteDividends;
  }

  // 12.8. Liquidación diaria de intereses de la Banca Galáctica
  if (newState.galacticBank) {
    const nextLiq = newState.galacticBank.nextLiquidation || 0;
    if (now >= nextLiq && nextLiq > 0) {
      const { bankState: updatedBank, liquidationsCount, totalYield } = processBankLiquidation(newState.galacticBank, now);
      if (liquidationsCount > 0) {
        newState.galacticBank = updatedBank;
        newState.notifications = [...(newState.notifications || []), {
          id: uid(),
          type: 'info',
          message: `🏦 BANCA GALÁCTICA: Cierre de ciclo diario completado (${liquidationsCount} liquidación/es procesada/s).`,
          timestamp: now,
        }];
      }
    }
  }

  // 13. Diálogos y transmisiones proactivas
  newState = processDialogueTransmissionTick(newState);

  // 14. Logros y misiones (Fase armónica cada 2 ticks para aligerar chequeos de matrices)
  if (newState.gameTick % 2 === 0) {
    newState = checkAchievements(newState);
    newState = checkMissions(newState);
  }

  // 15. Poda higiénica de notificaciones y eventos para evitar hinchazón de memoria
  if (Array.isArray(newState.notifications) && newState.notifications.length > 50) {
    newState.notifications = newState.notifications.slice(-50);
  }
  if (Array.isArray(newState.events) && newState.events.length > 25) {
    newState.events = newState.events.slice(-25);
  }

  // 16. 3.4 — Vuelco a la bandeja de los slots de comunicación que nadie ha mirado.
  //
  // Hay ocho sitios repartidos (transmissionsAndFirstContact, dialogueTransmissionTick,
  // el paso 2 de más arriba…) que aún escriben en `activeEvent`,
  // `activeFirstContact` y `activeTransmission`. Con 3.4 esos overlays ya no se
  // montan, así que un mensaje que landing en cualquiera de ellos se quedaría
  // invisible para siempre. En vez de editar los ocho (y arriesgar la lógica de
  // aparición), se normaliza aquí: al final de cada tick, cualquier slot
  // pendiente entra en el log y se vacía el slot.
  //
  // Así la bandeja es la única puerta de entrada, y el `id` estable hace que
  // volcar el mismo mensaje dos ticks seguidos no duplique la entrada.
  for (const { slot, kind, clearAction } of [
    { slot: 'activeEvent', kind: 'narrative', clearAction: 'CLEAR_ACTIVE_EVENT' },
    { slot: 'activeFirstContact', kind: 'firstContact', clearAction: 'DISMISS_FIRST_CONTACT' },
    { slot: 'activeTransmission', kind: 'transmission', clearAction: 'DISMISS_TRANSMISSION' },
  ]) {
    const pending = newState[slot];
    if (pending) {
      newState = eventReducer(newState, {
        type: 'APPEND_TACTICAL_EVENT_LOG',
        payload: { ...pending, kind, read: false, priority: pending.options ? 'alta' : 'media' },
      });
      newState = eventReducer(newState, { type: clearAction });
    }
  }
  // Poda del log: el histórico no crece sin límite, pero tampoco se pierde lo
  // reciente. 300 entradas ≈ varios días de partida.
  if (Array.isArray(newState.tacticalEventLog) && newState.tacticalEventLog.length > 300) {
    newState.tacticalEventLog = newState.tacticalEventLog.slice(-300);
  }

  return newState;
};

