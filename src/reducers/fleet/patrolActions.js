import {
  uid, updatePlanet, calcFuel, calcDistance, calcFlightTime, fleetSpeed,
  getEffectiveTech, simulateCombat, fmt
} from '../../core.jsx';
import { eventReducer } from '../eventReducer.js';

/**
 * Reducer para gestionar despliegues, retornos, refuerzos e intercepciones de Patrullas
 * (Orbital y de Sistema Solar), tanto locales como remotas.
 */

export const handleDeployPatrol = (state, action) => {
  const {
    planetId,          // Planeta origen donde están las naves
    targetPlanetId,    // Planeta destino a proteger (puede ser el mismo u otra colonia)
    fleet,
    patrolType = 'orbital',
    durationHours = 0
  } = action;

  const originPlanet = state.planets.find(p => p.id === planetId);
  if (!originPlanet) return state;

  const targetPlanet = targetPlanetId
    ? state.planets.find(p => p.id === targetPlanetId) || originPlanet
    : originPlanet;

  const isRemote = originPlanet.id !== targetPlanet.id;

  // Validar naves disponibles
  for (const [id, qty] of Object.entries(fleet || {})) {
    if (qty <= 0 || (originPlanet.fleet[id] || 0) < qty) return state;
  }
  const cleanFleet = Object.fromEntries(Object.entries(fleet).filter(([, q]) => q > 0));
  if (Object.keys(cleanFleet).length === 0) return state;

  // Deducir naves del planeta de origen
  const newOriginFleet = { ...originPlanet.fleet };
  for (const [id, qty] of Object.entries(cleanFleet)) {
    newOriginFleet[id] = (newOriginFleet[id] || 0) - qty;
    if (newOriginFleet[id] <= 0) delete newOriginFleet[id];
  }

  const driveLevel = Math.max(
    state.research?.combustion || 0,
    state.research?.impulse || 0,
    state.research?.hyperspace || 0
  );

  // Calcular combustible
  let hourlyFuel = 0;
  for (const [id, qty] of Object.entries(cleanFleet)) {
    const baseUnitFuel = calcFuel(patrolType === 'system' ? 100 : 25, id, 1, driveLevel, state.research || {}, targetPlanet);
    hourlyFuel += Math.max(1, Math.round(baseUnitFuel * 0.15)) * qty;
  }

  let travelFuel = 0;
  let flightTime = 0;

  if (isRemote) {
    const dist = calcDistance(originPlanet, targetPlanet);
    const spd = fleetSpeed(cleanFleet, state.research, originPlanet.faction || 'human');
    flightTime = calcFlightTime(dist, spd, 10, state.research);
    for (const [id, qty] of Object.entries(cleanFleet)) {
      travelFuel += calcFuel(dist, id, qty, driveLevel, state.research, originPlanet);
    }
  }

  const initialFuel = Math.round(hourlyFuel * 1.5) + travelFuel;

  if ((originPlanet.resources?.deuterium || 0) < initialFuel) {
    return {
      ...state,
      notifications: [
        ...(state.notifications || []),
        {
          id: uid(),
          type: 'warning',
          message: `🚫 Combustible insuficiente: Se requieren ${initialFuel} de Deuterio para desplegar la patrulla ${isRemote ? 'hacia ' + targetPlanet.name : ''}.`,
          timestamp: Date.now()
        }
      ]
    };
  }

  const newResources = {
    ...originPlanet.resources,
    deuterium: originPlanet.resources.deuterium - initialFuel
  };

  const now = Date.now();

  let newState = updatePlanet(state, originPlanet.id, p => ({
    ...p,
    fleet: newOriginFleet,
    resources: newResources
  }));

  if (isRemote) {
    // Se envía como misión de tránsito hacia la colonia remota
    const arrivalTime = now + flightTime * 1000;
    const patrolMission = {
      id: uid(),
      type: 'deploy_patrol',
      from: originPlanet,
      to: targetPlanet,
      homePlanetId: originPlanet.id,
      targetPlanetId: targetPlanet.id,
      fleet: cleanFleet,
      patrolType,
      durationHours,
      hourlyFuel,
      fuel: initialFuel,
      departure: now,
      arrivalTime,
      returnTime: arrivalTime,
      isAI: false
    };

    newState.fleetMissions = [...(newState.fleetMissions || []), patrolMission];
    newState.notifications = [
      ...(newState.notifications || []),
      {
        id: uid(),
        type: 'info',
        message: `🚀 Escuadrón de patrulla en ruta desde ${originPlanet.name} hacia ${targetPlanet.name} [ETA: ${Math.round(flightTime)}s].`,
        timestamp: now
      }
    ];
    return newState;
  }

  // Despliegue local inmediato
  const expiresAt = durationHours > 0 ? now + (durationHours * 3600 * 1000) : null;
  const newPatrol = {
    id: uid(),
    planetId: targetPlanet.id,
    planetName: targetPlanet.name,
    homePlanetId: originPlanet.id,
    galaxy: targetPlanet.galaxy,
    system: targetPlanet.system,
    position: targetPlanet.position,
    patrolType,
    fleet: cleanFleet,
    deployedAt: now,
    expiresAt,
    hourlyFuel,
    lastFuelDeduction: now,
    status: 'active'
  };

  newState.patrols = [...(newState.patrols || []), newPatrol];
  newState.notifications = [
    ...(newState.notifications || []),
    {
      id: uid(),
      type: 'info',
      message: `🛡️ ${patrolType === 'orbital' ? 'Patrulla Orbital' : 'Policía de Sistema'} desplegada en ${targetPlanet.name} [${targetPlanet.galaxy}:${targetPlanet.system}:${targetPlanet.position}].`,
      timestamp: now
    }
  ];

  return newState;
};

export const handleEstablishPatrol = (mission, state) => {
  const targetPlanet = state.planets.find(p => p.id === mission.targetPlanetId) || state.planets.find(p => p.galaxy === mission.to?.galaxy && p.system === mission.to?.system && p.position === mission.to?.position);
  if (!targetPlanet) {
    return {
      state,
      type: 'warning',
      message: `🚫 Planeta objetivo no encontrado para establecer patrulla. La flota regresa a ${mission.from?.name || 'origen'}.`,
      returnFleet: mission.fleet
    };
  }

  const now = Date.now();
  const expiresAt = mission.durationHours > 0 ? now + (mission.durationHours * 3600 * 1000) : null;

  const newPatrol = {
    id: uid(),
    planetId: targetPlanet.id,
    planetName: targetPlanet.name,
    homePlanetId: mission.homePlanetId || mission.from?.id,
    galaxy: targetPlanet.galaxy,
    system: targetPlanet.system,
    position: targetPlanet.position,
    patrolType: mission.patrolType || 'orbital',
    fleet: mission.fleet || {},
    deployedAt: now,
    expiresAt,
    hourlyFuel: mission.hourlyFuel || 10,
    lastFuelDeduction: now,
    status: 'active'
  };

  const newState = {
    ...state,
    patrols: [...(state.patrols || []), newPatrol]
  };

  return {
    state: newState,
    type: 'success',
    message: `🛡️ La flota ha llegado a destino y establecido ${newPatrol.patrolType === 'orbital' ? 'Patrulla Orbital' : 'Policía de Sistema'} en ${targetPlanet.name}.`,
    returnFleet: {}
  };
};

export const handleRecallPatrol = (state, action) => {
  const { patrolId } = action;
  const patrol = (state.patrols || []).find(p => p.id === patrolId);
  if (!patrol) return state;

  const returnTargetId = patrol.homePlanetId || patrol.planetId;
  const returnPlanet = state.planets.find(p => p.id === returnTargetId) || state.planets.find(p => p.id === patrol.planetId);
  if (!returnPlanet) return state;

  const returnedFleet = { ...returnPlanet.fleet };
  for (const [id, qty] of Object.entries(patrol.fleet || {})) {
    returnedFleet[id] = (returnedFleet[id] || 0) + qty;
  }

  let newState = updatePlanet(state, returnPlanet.id, p => ({
    ...p,
    fleet: returnedFleet
  }));

  newState.patrols = (newState.patrols || []).filter(p => p.id !== patrolId);
  newState.notifications = [
    ...(newState.notifications || []),
    {
      id: uid(),
      type: 'info',
      message: `⚓ Patrulla de ${patrol.planetName} ha regresado a las dársenas de ${returnPlanet.name}.`,
      timestamp: Date.now()
    }
  ];

  return newState;
};

export const handleReinforcePatrol = (state, action) => {
  const { patrolId, shipsToAdd } = action;
  const patrol = (state.patrols || []).find(p => p.id === patrolId);
  if (!patrol) return state;

  const currentPlanet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!currentPlanet) return state;

  const cleanAdd = Object.fromEntries(Object.entries(shipsToAdd || {}).filter(([, q]) => q > 0));
  if (Object.keys(cleanAdd).length === 0) return state;

  for (const [id, qty] of Object.entries(cleanAdd)) {
    if ((currentPlanet.fleet[id] || 0) < qty) return state;
  }

  const newPlanetFleet = { ...currentPlanet.fleet };
  const newPatrolFleet = { ...patrol.fleet };

  for (const [id, qty] of Object.entries(cleanAdd)) {
    newPlanetFleet[id] = (newPlanetFleet[id] || 0) - qty;
    if (newPlanetFleet[id] <= 0) delete newPlanetFleet[id];
    newPatrolFleet[id] = (newPatrolFleet[id] || 0) + qty;
  }

  const driveLevel = Math.max(
    state.research?.combustion || 0,
    state.research?.impulse || 0,
    state.research?.hyperspace || 0
  );

  let additionalHourlyFuel = 0;
  for (const [id, qty] of Object.entries(cleanAdd)) {
    const baseUnitFuel = calcFuel(patrol.patrolType === 'system' ? 100 : 25, id, 1, driveLevel, state.research || {}, currentPlanet);
    additionalHourlyFuel += Math.max(1, Math.round(baseUnitFuel * 0.15)) * qty;
  }

  let newState = updatePlanet(state, currentPlanet.id, p => ({
    ...p,
    fleet: newPlanetFleet
  }));

  newState.patrols = (newState.patrols || []).map(p => {
    if (p.id !== patrolId) return p;
    return {
      ...p,
      fleet: newPatrolFleet,
      hourlyFuel: (p.hourlyFuel || 0) + additionalHourlyFuel
    };
  });

  newState.notifications = [
    ...(newState.notifications || []),
    {
      id: uid(),
      type: 'info',
      message: `➕ Refuerzos incorporados a la patrulla de ${patrol.planetName}.`,
      timestamp: Date.now()
    }
  ];

  return newState;
};

/**
 * Intercepción anticipada de una invasión hostil en ruta mediante una patrulla activa.
 */
export const handleInterceptInvasion = (state, action) => {
  const { invasionId, patrolId } = action;
  const invasion = (state.fleetMissions || []).find(m => m.id === invasionId);
  const patrol = (state.patrols || []).find(p => p.id === patrolId);

  if (!invasion || !patrol) return state;

  const targetPlanet = state.planets.find(p => p.id === invasion.toPlanetId) || state.planets.find(p => p.galaxy === invasion.to?.galaxy && p.system === invasion.to?.system && p.position === invasion.to?.position);
  if (!targetPlanet) return state;

  const attackerTech = invasion.from?.research || {};
  const defenderTech = getEffectiveTech(targetPlanet, state.research);
  const atkFaction = invasion.from?.faction || 'human';
  const defFaction = targetPlanet.faction || 'human';

  let result;
  try {
    result = simulateCombat(
      invasion.fleet || {},
      patrol.fleet || {},
      {}, // Sin defensas de superficie: combate en órbita alta
      attackerTech,
      defenderTech,
      6,
      state.blueprints,
      atkFaction,
      defFaction,
      false,
      'standard',
      0.15 // Bonus táctico por intercepción anticipada
    );
  } catch (e) {
    console.error('[Ascensión] Error en simulateCombat durante intercepción anticipada:', e);
    return state;
  }

  const atkLostTotal = Object.values(result.atkLosses || {}).reduce((a, b) => a + b, 0);
  const defLostTotal = Object.values(result.defShipLosses || {}).reduce((a, b) => a + b, 0);

  let newState = { ...state };
  let type = 'info';
  let message = '';

  // Actualizar escombros espaciales
  const currentDebris = newState.debrisField || { metal: 0, crystal: 0 };
  newState.debrisField = {
    metal: currentDebris.metal + (result.debris?.metal || 0),
    crystal: currentDebris.crystal + (result.debris?.crystal || 0)
  };

  if (result.winner === 'defender') {
    // ¡Victoria total en el espacio exterior! Invasión completamente abortada
    newState.stats = { ...newState.stats, combatsWon: (newState.stats?.combatsWon || 0) + 1 };
    newState.fleetMissions = (newState.fleetMissions || []).filter(m => m.id !== invasionId);

    // Supervivientes de la patrulla
    const patrolSurvivors = result.defShipSurvivors || {};
    if (Object.keys(patrolSurvivors).length > 0) {
      newState.patrols = (newState.patrols || []).map(p => p.id === patrolId ? { ...p, fleet: patrolSurvivors } : p);
    } else {
      newState.patrols = (newState.patrols || []).filter(p => p.id !== patrolId);
    }

    type = 'success';
    message = `⚡ ¡INTERCEPCIÓN ANTICIPADA EXITOSA! Tu ${patrol.patrolType === 'orbital' ? 'Patrulla Orbital' : 'Policía de Sistema'} ha aniquilado la flota invasora en órbita alta antes de que alcanzara ${targetPlanet.name}.`;
  } else if (result.winner === 'attacker') {
    // La patrulla fue superada, pero desgastó al invasor antes de su llegada a tierra
    newState.stats = { ...newState.stats, combatsLost: (newState.stats?.combatsLost || 0) + 1 };
    newState.patrols = (newState.patrols || []).filter(p => p.id !== patrolId);

    // Actualizar la flota atacante con las bajas sufridas para el impacto final
    newState.fleetMissions = (newState.fleetMissions || []).map(m => {
      if (m.id !== invasionId) return m;
      return {
        ...m,
        fleet: result.atkSurvivors || {}
      };
    });

    type = 'warning';
    message = `⚠️ Intercepción heroica: Tu patrulla fue destruida en órbita alta, pero causó graves bajas a la flota enemiga (${atkLostTotal} naves derribadas) antes del descenso a ${targetPlanet.name}.`;
  } else {
    // Tablas: ambos bandos se desgastan
    newState.stats = { ...newState.stats, combatsDraw: (newState.stats?.combatsDraw || 0) + 1 };
    const patrolSurvivors = result.defShipSurvivors || {};
    if (Object.keys(patrolSurvivors).length > 0) {
      newState.patrols = (newState.patrols || []).map(p => p.id === patrolId ? { ...p, fleet: patrolSurvivors } : p);
    } else {
      newState.patrols = (newState.patrols || []).filter(p => p.id !== patrolId);
    }

    newState.fleetMissions = (newState.fleetMissions || []).map(m => {
      if (m.id !== invasionId) return m;
      return { ...m, fleet: result.atkSurvivors || {} };
    });

    type = 'info';
    message = `🤝 Choque anticipado en órbita alta en tablas. El enemigo proseguirá hacia el planeta con fuerzas mermadas.`;
  }

  // Generar Evento Táctico para la tripulación
  const isWin = result.winner === 'defender';
  const tacticalEvent = {
    id: uid(),
    type: 'combat',
    combatResult: isWin ? 'victory' : result.winner === 'attacker' ? 'defeat' : 'draw',
    title: isWin ? '¡Intercepción Anticipada Triunfal!' : '¡Combate en Órbita Alta!',
    subtitle: `Sector exterior de ${targetPlanet.name} [${targetPlanet.galaxy}:${targetPlanet.system}:${targetPlanet.position}]`,
    description: isWin
      ? `La patrulla interceptó el vector de aproximación hostil y destruyó las naves enemigas en el vacío espacial antes de que pudieran iniciar el bombardeo.`
      : `Choque violento en el espacio exterior contra la fuerza de invasión enemiga. Se han registrado escombros y telemetría de combate.`,
    image: isWin ? 'Nave de Batalla.webp' : 'Crucero.webp',
    debris: result.debris,
    losses: {
      playerLosses: defLostTotal,
      enemyLosses: atkLostTotal
    },
    targetPlanetId: targetPlanet.id,
    ministryId: 'defense',
    ministryName: 'Ministerio de Defensa y Operaciones Navales',
    voiceText: isWin
      ? `Victoria confirmada en el sector exterior de ${targetPlanet.name}. Amenaza neutralizada.`
      : `Alerta: Choque orbital anticipado registrado en ${targetPlanet.name}.`
  };

  newState.tacticalEvents = [...(newState.tacticalEvents || []), tacticalEvent];
  // 3.3 — también al registro persistente de la bandeja.
  newState = eventReducer(newState, {
    type: 'APPEND_TACTICAL_EVENT_LOG',
    payload: { ...tacticalEvent, kind: 'tactical', read: false, priority: 'alta' },
  });
  newState.notifications = [
    ...(newState.notifications || []),
    {
      id: uid(),
      type,
      message,
      timestamp: Date.now()
    }
  ];

  return newState;
};
