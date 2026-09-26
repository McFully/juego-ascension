import { uid, calcDistance, calcFlightTime } from '../../../core.jsx';
import { IMPERIAL_SENATE_BILLS, COLONY_DEMAND_TYPES } from '../../../data/imperialCouncilData.js';

export const processGalacticCouncilAndCrises = (newState) => {
  // Hito de la República Imperial (10+ planetas)
  const planetCount = (newState.planets || []).length;
  if (planetCount >= 10 && !newState.imperialCouncilUnlocked) {
    newState.imperialCouncilUnlocked = true;
    newState.notifications = [
      ...(newState.notifications || []),
      {
        id: uid(),
        type: 'success',
        message: '🏛️ ¡Hito Imperial alcanzado! Al gobernar 10 o más mundos, se proclama la Alta República Imperial. El Consejo Imperial asume el control ministerial unificado.',
        timestamp: Date.now()
      }
    ];
  }

  // --- PULSO POLÍTICO INTERNO DE LA REPÚBLICA (10+ PLANETAS) ---
  if (newState.imperialCouncilUnlocked || planetCount >= 10) {
    const council = newState.imperialCouncil || { ministers: {}, activeBills: [], passedBills: [], colonyDemands: [] };

    // 1. Proyectos de ley periódicos en el Senado cada 200 ticks
    if (newState.gameTick % 200 === 0 && (council.activeBills || []).length < 2) {
      const availableBills = IMPERIAL_SENATE_BILLS.filter(
        b => !(council.activeBills || []).some(ab => ab.id === b.id) &&
             !(council.passedBills || []).some(pb => pb.id === pb.id)
      );
      if (availableBills.length > 0) {
        const nextBill = availableBills[Math.floor(Math.random() * availableBills.length)];
        council.activeBills = [...(council.activeBills || []), nextBill];
        newState.notifications = [
          ...(newState.notifications || []),
          {
            id: uid(),
            type: 'info',
            message: `🏛️ Nuevo proyecto en el Senado Imperial: "${nextBill.title}". Los representantes planetarios deliberan.`,
            timestamp: Date.now()
          }
        ];
      }
    }

    // 2. Generación de Demandas Coloniales cada 150 ticks
    if (newState.gameTick % 150 === 0 && (council.colonyDemands || []).length < 3) {
      const nonHomePlanets = (newState.planets || []).filter(p => !p.isHome);
      if (nonHomePlanets.length > 0) {
        const targetPlanet = nonHomePlanets[Math.floor(Math.random() * nonHomePlanets.length)];
        const demandKeys = Object.keys(COLONY_DEMAND_TYPES);
        const demandTypeKey = demandKeys[Math.floor(Math.random() * demandKeys.length)];
        const def = COLONY_DEMAND_TYPES[demandTypeKey];

        const newDemand = {
          id: uid(),
          typeKey: demandTypeKey,
          title: def.title,
          icon: def.icon,
          desc: def.desc,
          reqRes: def.reqRes,
          penalty: def.penalty,
          reward: def.reward,
          targetPlanetId: targetPlanet.id,
          planetName: targetPlanet.name,
          spawnTick: newState.gameTick
        };

        council.colonyDemands = [...(council.colonyDemands || []), newDemand];
        newState.notifications = [
          ...(newState.notifications || []),
          {
            id: uid(),
            type: 'warning',
            message: `📦 Petición colonial urgente desde ${targetPlanet.name}: ${def.title}.`,
            timestamp: Date.now()
          }
        ];
      }
    }

    newState.imperialCouncil = council;
  }

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

  return newState;
};
