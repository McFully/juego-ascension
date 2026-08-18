import {
  NARRATIVE_EVENTS, EVENTS, ARTIFACTS, uid, updatePlanet, shouldKeepNotification,
  calcProduction, calcDistance, calcFlightTime, fleetSpeed
} from '../../core.jsx';
import { processMission, returnFleetToOrigin, processEvent } from '../../missions.jsx';

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

export const processGalacticCouncilAndCrises = (newState) => {
  // Galactic Council
  if (newState.gameTick % 400 === 0 && (newState.aiPlanets || []).length >= 3) {
    const council = newState.galacticCouncil || { resolutionsPassed: [], influenceHistory: [] };
    const session = council.currentSession || { id: uid(), tick: newState.gameTick, proposals: [], votes: {} };

    if (Math.random() < 0.6 && (session.proposals || []).length < 2) {
      const ai = newState.aiPlanets[Math.floor(Math.random() * newState.aiPlanets.length)];
      session.proposals = [...(session.proposals || []), {
        id: uid(), title: `Propuesta de ${ai.name}`, effect: { type: 'DIPLOMATIC_BOOST' }, proposer: ai.id
      }];
    }

    (newState.aiPlanets || []).forEach(ai => {
      (session.proposals || []).forEach(p => {
        if (!session.votes[p.id]) session.votes[p.id] = {};
        const rel = ai.relation || 0;
        const vote = rel > 10 ? 'yes' : (rel < -20 ? 'no' : 'abstain');
        session.votes[p.id][ai.id] = vote;
      });
    });

    (session.proposals || []).forEach(p => {
      const v = session.votes[p.id] || {};
      const yesCount = Object.values(v).filter(x => x === 'yes').length;
      if (yesCount > (Object.keys(v).length / 2)) {
        newState.influence = (newState.influence || 0) + 10;
        newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: `🌌 Dictamen del Consejo aprobado: ${p.title}`, timestamp: Date.now() }];
        (newState.galacticCouncil.resolutionsPassed || []).push(p);
      }
    });

    newState.galacticCouncil = { ...council, lastSessionTick: newState.gameTick, currentSession: null, influenceHistory: [...(council.influenceHistory || []), { tick: newState.gameTick, val: newState.influence }] };
  }

  // Periodic Galactic Crises
  if ((newState.research?.diplomacy || 0) >= 2 && newState.gameTick % 250 === 0 && Math.random() < 0.5 && (newState.activeCrises || []).length < 2) {
    const crisisTypes = [
      { title: 'Crisis de Recursos', desc: 'Escasez afecta producción.', options: [ {text: 'Compartir recursos (-influencia)', effect:{influence:-15}}, {text: 'Ignorar (pérdida de relación)', effect:{rel:-10}} ] },
      { title: 'Rebelión en Colonia IA', desc: 'Una IA menor se rebela.', options: [ {text: 'Sofocar (gasta flota)', effect:{shipsLoss: true}}, {text: 'Negociar (gana influencia)', effect:{influence:+10}} ] },
      { title: 'Embargo Comercial', desc: 'Bloqueo en rutas.', options: [ {text: 'Romper embargo (-rel con todos)', effect:{relAll:-5}}, {text: 'Negociar paz', effect:{influence:+5}} ] }
    ];
    const c = crisisTypes[Math.floor(Math.random()*crisisTypes.length)];
    newState.activeCrises = [...(newState.activeCrises || []), {
      id: uid(),
      title: c.title,
      description: c.desc,
      options: c.options,
      aiInvolved: []
    }];
    newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'warn', message: `⚠️ Nueva crisis: ${c.title}`, timestamp: Date.now() }];
  }

  return newState;
};

export const processNotificationsAndFirstContact = (newState) => {
  // Auto-expire notifications
  newState.notifications = (newState.notifications || []).map(n => {
    if (n.expiresAt && Date.now() > n.expiresAt) {
      return { ...n, expired: true, read: true };
    }
    return n;
  });

  // First contact trigger
  const undiscoveredAIs = (newState.aiPlanets || []).filter(p => !p.discovered);
  if (!newState.activeFirstContact && !newState.activeEvent && !newState.activeTransmission && undiscoveredAIs.length > 0) {
    const hasDiploCenter = newState.planets.some(p => (p.buildings?.diploCenter || 0) >= 1);
    const hasResearchLab = newState.planets.some(p => (p.buildings?.researchLab || 0) >= 1);
    
    let shouldTrigger = false;
    if (newState.gameTick === 10) {
      shouldTrigger = true;
    } else if (newState.gameTick % 120 === 0) {
      let chance = 0.15;
      if (hasResearchLab) chance += 0.10;
      if (hasDiploCenter) chance += 0.25;
      if (Math.random() < chance) {
        shouldTrigger = true;
      }
    }
    
    if (shouldTrigger) {
      const targetAI = undiscoveredAIs[Math.floor(Math.random() * undiscoveredAIs.length)];
      newState.activeFirstContact = {
        id: targetAI.id,
        faction: targetAI.faction,
        empireName: targetAI.empireName,
        name: targetAI.name,
        aiType: targetAI.aiType,
      };
    }
  }

  // Proactive transmissions
  if (!newState.activeFirstContact && !newState.activeTransmission && !newState.activeEvent && newState.gameTick > 30 && newState.gameTick % 80 === 0) {
    const discoveredAIs = (newState.aiPlanets || []).filter(p => p.discovered);
    if (discoveredAIs.length > 0) {
      const homePlanet = newState.planets[0];
      const storage = calcStorage(homePlanet.buildings);
      const resources = homePlanet.resources || { metal: 0, crystal: 0, deuterium: 0 };
      const metalFull = resources.metal > storage.metal * 0.95;
      const crystalFull = resources.crystal > storage.crystal * 0.95;
      
      if ((metalFull || crystalFull) && Math.random() < 0.4) {
        const aiMerchant = discoveredAIs.find(ai => ai.strategy === 'merchant' || ai.aiPersonality === 'mercantilista') || discoveredAIs[0];
        newState.activeTransmission = {
          id: uid(),
          type: 'excess_resources',
          aiId: aiMerchant.id,
          faction: aiMerchant.faction,
          name: aiMerchant.name,
          message: `Saludos, Comandante. Nuestros escáneres mercantiles detectan que tus depósitos de ${metalFull ? 'Metal' : 'Cristal'} en ${homePlanet.name} están a rebosar. Te proponemos comprar tu excedente: te damos 40 puntos de Influencia a cambio de ${metalFull ? '25K Metal' : '15K Cristal'}. ¿Trato hecho?`,
          options: [
            {
              text: `✅ Vender excedente (Obtener +40 Influencia)`,
              action: {
                type: 'DIPLOMACY_TRADE_EXCESS',
                payload: {
                  aiId: aiMerchant.id,
                  resource: metalFull ? 'metal' : 'crystal',
                  qty: metalFull ? 25000 : 15000,
                  influenceReward: 40
                }
              }
            },
            {
              text: '❌ Rechazar propuesta comercial.',
              action: { type: 'DIPLOMACY_CLOSE_TRANSMISSION' }
            }
          ]
        };
      } else {
        const playerShips = homePlanet.fleet || {};
        const getScore = (f) => (f.lightFighter || 0) * 1 + (f.cruiser || 0) * 4 + (f.battleship || 0) * 15 + (f.destroyer || 0) * 40;
        const pScore = getScore(playerShips);
        const aiHostile = discoveredAIs.find(ai => (ai.strategy === 'militarist' || ai.strategy === 'expansionist' || ai.aiPersonality === 'bélico') && (ai.relation || 0) < 0);
        
        if (aiHostile && pScore < 10 && Math.random() < 0.3) {
          newState.activeTransmission = {
            id: uid(),
            type: 'militaristic_threat',
            aiId: aiHostile.id,
            faction: aiHostile.faction,
            name: aiHostile.name,
            message: `¡Humano! Tus débiles defensas planetarias y la ausencia de una flota en condiciones son una ofensa a nuestra soberanía. Exigimos un tributo de 10K Metal y 5K Cristal para garantizar tu seguridad en el sector. ¿Vas a pagar o prefieres conocer la ira de nuestras flotas?`,
            options: [
              {
                text: `💰 Pagar Tributo (-10K Metal, -5K Cristal)`,
                action: {
                  type: 'DIPLOMACY_PAY_TRIBUTO_THREAT',
                  payload: {
                    aiId: aiHostile.id,
                    cost: { metal: 10000, crystal: 5000 }
                  }
                }
              },
              {
                text: '⚔️ Desafiar su ultimátum y prepararse.',
                action: {
                  type: 'DIPLOMACY_REJECT_TRIBUTO_THREAT',
                  payload: {
                    aiId: aiHostile.id
                  }
                }
              }
            ]
          };
        }
      }
    }
  }

  // Diplomatic event proposals from AI
  if (!newState.activeFirstContact && !newState.activeTransmission && !newState.activeEvent && newState.gameTick > 100 && newState.gameTick % 120 === 0 && Math.random() < 0.5) {
    const discoveredAIs = (newState.aiPlanets || []).filter(p => p.discovered && p.id !== 'crisis_invaders');
    const candidates = discoveredAIs.filter(ai => {
      const rel = ai.relation || 0;
      const hasPna = ai.pna || ai.activePacts?.includes('pna');
      const hasAlliance = ai.alliance || ai.activePacts?.includes('alliance');
      const hasTrade = ai.trade || ai.activePacts?.includes('trade');
      if (rel >= 30 && !hasPna && Math.random() < 0.15) return 'pna';
      if (rel >= 40 && !hasTrade && Math.random() < 0.15) return 'trade';
      if (rel >= 60 && !hasAlliance && Math.random() < 0.1) return 'alliance';
      if (rel < -20 && (ai.strategy === 'militarist' || ai.strategy === 'expansionist') && Math.random() < 0.12) return 'demand';
      return null;
    });

    if (candidates.length > 0) {
      const ai = candidates[Math.floor(Math.random() * candidates.length)];
      const rel = ai.relation || 0;
      const treatMap = { pna: 'Pacto de No Agresión', trade: 'Acuerdo Comercial', alliance: 'Alianza Militar' };

      if (rel >= 30) {
        const tt = rel >= 60 ? 'alliance' : (rel >= 40 ? 'trade' : 'pna');
        if (!ai[tt] && !ai.activePacts?.includes(tt)) {
          const treatyName = treatMap[tt];
          newState.activeTransmission = {
            id: uid(),
            type: 'diplo_proposal_' + tt,
            aiId: ai.id,
            faction: ai.faction,
            name: ai.name,
            message: `${ai.empireName} te extiende una oferta formal: deseamos firmar un ${treatyName} con tu imperio. ¿Aceptas esta propuesta para fortalecer nuestros lazos?`,
            options: [
              {
                text: `✅ Aceptar ${treatyName} (Relación +10)`,
                action: { type: 'DIPLOMACY_ACCEPT_PROPOSAL', payload: { aiId: ai.id, treatyType: tt } }
              },
              {
                text: '❌ Rechazar propuesta.',
                action: { type: 'DIPLOMACY_CLOSE_TRANSMISSION' }
              }
            ]
          };
        }
      } else if (rel < -20) {
        newState.activeTransmission = {
          id: uid(),
          type: 'diplo_demand',
          aiId: ai.id,
          faction: ai.faction,
          name: ai.name,
          message: `${ai.empireName} exige tu sumisión. Entréganos 15K Metal y 8K Cristal como tributo o nuestras flotas arrasarán tus colonias.`,
          options: [
            {
              text: '💰 Pagar tributo (15K M, 8K C, Rel +5)',
              action: { type: 'DIPLOMACY_PAY_TRIBUTO_THREAT', payload: { aiId: ai.id, cost: { metal: 15000, crystal: 8000 } } }
            },
            {
              text: '⚔️ Desafiar y preparar defensa.',
              action: { type: 'DIPLOMACY_REJECT_TRIBUTO_THREAT', payload: { aiId: ai.id } }
            }
          ]
        };
      }
    }
  }

  // AI betrayal: break pact if relation drops too low
  if (newState.gameTick > 200 && newState.gameTick % 150 === 0 && Math.random() < 0.08) {
    const aiWithPacts = (newState.aiPlanets || []).filter(p => p.discovered && (p.pna || p.alliance || p.trade) && (p.relation || 0) < -10);
    if (aiWithPacts.length > 0) {
      const ai = aiWithPacts[Math.floor(Math.random() * aiWithPacts.length)];
      const pactType = ai.alliance ? 'alliance' : (ai.trade ? 'trade' : 'pna');
      const pactNames = { alliance: 'Alianza Militar', trade: 'Acuerdo Comercial', pna: 'Pacto de No Agresión' };
      newState.activeTransmission = {
        id: uid(),
        type: 'diplo_betrayal',
        aiId: ai.id,
        faction: ai.faction,
        name: ai.name,
        message: `¡${ai.empireName} ha roto unilateralmente el ${pactNames[pactType]}! Denuncian que hemos violado los términos del acuerdo. Las relaciones se deterioran gravemente.`,
        options: [
          {
            text: '😤 Denunciar su traición (Rel -20)',
            action: { type: 'DIPLOMACY_BETRAYAL_RESPONSE', payload: { aiId: ai.id, pactType, response: 'denounce' } }
          },
          {
            text: '😐 Aceptar la ruptura con dignidad (Rel -10)',
            action: { type: 'DIPLOMACY_BETRAYAL_RESPONSE', payload: { aiId: ai.id, pactType, response: 'accept' } }
          }
        ]
      };
    }
  }

  return newState;
};

export const processCrisisAndVictory = (newState, prodCache) => {
  // End-Game Crisis
  if (newState.gameTick >= 1200 && !newState.finalCrisis) {
    const invaderEmpire = {
      id: 'crisis_invaders',
      name: 'Colectivo Kaelish',
      empireName: 'Los Invasores Kaelish',
      faction: 'cyborg',
      isAI: true,
      aiLevel: 15,
      relation: -100,
      discovered: true,
      strategy: 'chaotic',
      aiPersonality: 'bélico',
      aggression: 1.0,
      riskTolerance: 1.0,
      lossTolerance: 1.0,
      galaxy: 5,
      system: 5,
      position: 5,
      fleet: {
        lightFighter: 1500,
        heavyFighter: 800,
        cruiser: 400,
        battleship: 200,
        bomber: 100,
        destroyer: 50,
        deathstar: 5,
        planetDestroyer: 1
      },
      defenses: {
        rocketLauncher: 100,
        plasmaTurret: 20
      },
      resources: { metal: 5000000, crystal: 3000000, deuterium: 1000000 }
    };
    
    newState.finalCrisis = {
      active: true,
      phase: 1,
      ticksActive: 0,
      warningSent: true
    };
    
    newState.aiPlanets = [...(newState.aiPlanets || []), invaderEmpire];
    newState.notifications = [...(newState.notifications || []), {
      id: uid(),
      type: 'error',
      message: `🚨 ALERTA ROJA: Anomalía hiperespacial masiva detectada. ¡Los Invasores Kaelish han entrado en la galaxia! Sus flotas destruirán todo a su paso.`,
      timestamp: Date.now()
    }];
  }

  if (newState.finalCrisis && newState.finalCrisis.active) {
    newState.finalCrisis.ticksActive += 1;
    if (newState.finalCrisis.ticksActive % 80 === 0) {
      const invader = newState.aiPlanets.find(ai => ai.id === 'crisis_invaders');
      if (invader) {
        const playerPlanets = newState.planets;
        const otherAIs = newState.aiPlanets.filter(ai => ai.id !== 'crisis_invaders');
        const allPossibleTargets = [...playerPlanets, ...otherAIs];
        
        if (allPossibleTargets.length > 0) {
          const target = allPossibleTargets[Math.floor(Math.random() * allPossibleTargets.length)];
          const strikeFleet = {
            lightFighter: 200,
            heavyFighter: 100,
            cruiser: 50,
            battleship: 20,
            destroyer: 5
          };
          const dist = calcDistance(invader, target);
          const arrivalTime = Date.now() + calcFlightTime(dist, 10000, 10) * 1000;
          
          newState.fleetMissions = [...(newState.fleetMissions || []), {
            id: uid(),
            type: 'attack',
            from: invader,
            to: { id: target.id, name: target.name || target.empireName, galaxy: target.galaxy, system: target.system, position: target.position },
            fleet: strikeFleet,
            departure: Date.now(),
            arrivalTime,
            isAI: true,
            isCrisis: true
          }];
          
          newState.notifications = [...(newState.notifications || []), {
            id: uid(),
            type: 'error',
            message: `⚠️ DETECTADA FLOTA KAELISH: Una avanzadilla de invasores se dirige a ${target.name || target.empireName}`,
            timestamp: Date.now()
          }];
        }
      }
    }
  }

  // Victory Conditions removed for endless exploration

  return newState;
};
