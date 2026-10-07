import { updatePlanet, getVirginPlanet } from '../core.jsx';
import { SHIPS } from '../data/gameData.js';
import { fmt, uid, getMaxPlanets, calcStorage, getEffectiveTech } from '../utils/formulas.js';
import { simulateCombat } from '../combat.js';
export { handleColonizeMission } from './colonizeMission.js';
import {
  getTargetEspDefense,
  getFactionEspionageMult,
  getEspionageCountermeasures,
  getFleetStealth,
  computeEspionageDetection,
  applyIntelCeiling,
  getIntelCeilingBonus,
  getFactionEspionageDiffBonus,
  getPlayerEspDefense,
  PATROL_INTERCEPT_BONUS,
  bestIntelLevel,
} from '../utils/espionageFormulas.js';



export const handleDiplomacyMission = (mission, state) => {
  const target = state.aiPlanets.find(p => p.galaxy === mission.to.galaxy && p.system === mission.to.system && p.position === mission.to.position);
  let newState = { ...state };
  if (target) {
    const diploLvl = mission.from.buildings?.diploCenter || 0;
    const boost = 15 + diploLvl * 3;
    newState.aiPlanets = state.aiPlanets.map(p => p.id === target.id ? { ...p, relation: Math.min(100, (p.relation || 0) + boost) } : p);
    return { state: newState, type: 'success', message: `🤝 Delegación diplomática llegó a ${target.name}. Relación mejorada en +${boost} (Total: ${Math.min(100, (target.relation || 0) + boost)})`, returnFleet: mission.fleet };
  }
  return { state: newState, type: 'warning', message: `🤝 Imperio no encontrado en [${mission.to.galaxy}:${mission.to.system}:${mission.to.position}], misión cancelada`, returnFleet: mission.fleet };
};

export const handleAllyTradeMission = (mission, state) => {
  const target = state.planets.find(p => p.galaxy === mission.to.galaxy && p.system === mission.to.system && p.position === mission.to.position);
  let newState = { ...state };
  if (target) {
    const gift = mission.resources || { metal: 20000, crystal: 10000, deuterium: 5000 };
    newState = updatePlanet(newState, target.id, p => ({
      ...p,
      resources: {
        metal: p.resources.metal + gift.metal,
        crystal: p.resources.crystal + gift.crystal,
        deuterium: p.resources.deuterium + gift.deuterium,
      },
    }));
    return { state: newState, type: 'success', message: `🤝 Flota comercial aliada llegó a ${target.name} trayendo regalos: +${fmt(gift.metal)}M, +${fmt(gift.crystal)}C, +${fmt(gift.deuterium)}D`, returnFleet: {} };
  }
  return { state: newState, type: 'info', message: `🤝 Flota mercantil se retiró.`, returnFleet: {} };
};

/**
 * ESPIONAJE CONTRA EL JUGADOR.
 *
 * El camino inverso: una IA lanza sondas a uno de tus mundos. Si tu
 * contraespionaje las detecta, avisa y las destruye. Si no, la IA se queda con
 * los datos y usa ese conocimiento en su próximo ataque (ver `combatMission`).
 *
 * Aquí es donde por fin tienen efecto `hawk_eye`, `counterIntelLevel`,
 * `espionageBudget`, `quantumCrypto` y `stealthSilos`: cinco mecánicas
 * compradas que hasta ahora no protegían de nada porque nadie espiaba.
 */
const resolveAiEspionageMission = (mission, state, targetPlanet) => {
  const spyTech = mission.from?.research?.espionage || 0;
  const playerDefense = getPlayerEspDefense(targetPlanet, state);
  const rawDiff = spyTech - playerDefense.defense;

  // Patrulla orbital o de sistema: interceptar sondas con su flota real
  const patrol = (state.patrols || []).find(p =>
    (p.status === 'active') &&
    ((p.planetId && p.planetId === targetPlanet.id) ||
      (p.galaxy === targetPlanet.galaxy && p.system === targetPlanet.system))
  );

  const patrolBonus = patrol ? PATROL_INTERCEPT_BONUS : 0;
  const patrolFleetCount = patrol?.fleet ? Object.values(patrol.fleet).reduce((a, b) => a + b, 0) : 0;

  let detectionChance = computeEspionageDetection({
    techDiff: rawDiff,
    countermeasures: {},
    stealth: getFleetStealth(mission.fleet, state.blueprints || []),
  });
  detectionChance = Math.max(0, Math.min(1, (detectionChance * (1 - playerDefense.reduction)) + patrolBonus));

  const detected = Math.random() < detectionChance;
  let newState = { ...state };

  if (detected) {
    let combatLogMsg = '';
    // Si hay una patrulla en la zona con naves de combate, se resuelve escaramuza espacial real
    if (patrol && patrolFleetCount > 0) {
      try {
        const combatRes = simulateCombat(
          mission.fleet || {},
          patrol.fleet || {},
          {}, // Sin defensas terrestres en combate de órbita
          mission.from?.research || {},
          getEffectiveTech(targetPlanet, state.research),
          4,
          state.blueprints || [],
          mission.from?.faction || 'human',
          targetPlanet.faction || 'human',
          false,
          'standard',
          0.10
        );

        // Actualizar pérdidas en la patrulla defensora
        const patrolSurvivors = combatRes.defShipSurvivors || {};
        if (Object.keys(patrolSurvivors).length > 0) {
          newState.patrols = (newState.patrols || []).map(p => p.id === patrol.id ? { ...p, fleet: patrolSurvivors } : p);
        } else {
          newState.patrols = (newState.patrols || []).filter(p => p.id !== patrol.id);
        }

        // Escombros
        const currentDebris = newState.debrisField || { metal: 0, crystal: 0 };
        newState.debrisField = {
          metal: currentDebris.metal + (combatRes.debris?.metal || 0),
          crystal: currentDebris.crystal + (combatRes.debris?.crystal || 0),
        };
        combatLogMsg = ` Tu patrulla interceptó y entabló combate espacial.`;
      } catch (err) {
        console.warn('[Ascensión] Error simulando combate de intercepción de sonda:', err);
      }
    }

    newState.notifications = [...(newState.notifications || []), {
      id: uid(),
      type: 'warning',
      message: `🕵️ Espía neutralizado sobre ${targetPlanet.name}${patrol ? ` (interceptado por tu patrulla)` : ''}.${combatLogMsg}`,
      timestamp: Date.now()
    }];

    return {
      state: newState,
      type: 'warning',
      message: `🕵️ Espía de ${mission.from?.empireName || mission.from?.name || 'una facción'} neutralizado sobre ${targetPlanet.name}`,
      returnFleet: {},
      tacticalEvent: {
        id: uid(),
        type: 'espionage_alert',
        title: '¡Espía Enemigo Neutralizado!',
        subtitle: `Sonda interceptada sobre ${targetPlanet.name} [${targetPlanet.galaxy}:${targetPlanet.system}:${targetPlanet.position}]`,
        description: `La contraespionaje de ${targetPlanet.name} detectó la sonda ${patrol ? 'y tu patrulla la interceptó en órbita' : 'antes de que pudiera transmitir'}. El espía enemigo ha sido destruido.${combatLogMsg}`,
        image: 'Centro de Espionaje.webp',
        targetPlanetId: targetPlanet.id,
        ministryId: 'intel',
        ministryName: 'Ministerio de Inteligencia',
        voiceText: `Alerta: sonda enemiga neutralizada sobre ${targetPlanet.name}.`
      }
    };
  }

  // Espionaje exitoso: la IA guarda lo aprendido. No se avisa al jugador, que es
  // justo lo que hace que la contraespionaje importa.
  const ledger = { ...(state.aiIntel || {}) };
  ledger[targetPlanet.id] = {
    level: rawDiff >= 6 ? 'high' : rawDiff >= 1 ? 'medium' : 'low',
    at: Date.now(),
    spyTech,
  };
  newState.aiIntel = ledger;

  return {
    state: newState,
    type: 'info',
    message: `🕵️ Informe de espionaje completado sobre ${targetPlanet.name}`,
    returnFleet: mission.fleet || {},
  };
};

export const handleEspionageMission = (mission, state) => {
  const coordsMatch = (p) =>
    p.galaxy === mission.to.galaxy && p.system === mission.to.system && p.position === mission.to.position;
  const target = mission.isAI
    ? (state.planets || []).find(coordsMatch)
    : (state.aiPlanets || []).find(coordsMatch);
  let newState = { ...state };

  if (target && mission.isAI) {
    return resolveAiEspionageMission(mission, state, target);
  }

  if (target) {
    // La investigacion vive en `state.research`, no en el planeta: leer
    // `mission.from.research` daba siempre 0 y dejo inalcanzables los niveles
    // `medium`, `high` y `full`, con ellos el bonus de combate. El mismo
    // patrón que usa `combatMission` para el defensor.
    const spyTech = getEffectiveTech(mission.from, state.research)?.espionage || 0;

    // `espDefenseLvl` era un numero sorteado al generar la galaxia y congelado
    // para siempre. Ahora la defensa sale de lo que el objetivo tiene montado.
    const targetEspDef = getTargetEspDefense(target);
    const rawDiff = spyTech - targetEspDef;

    const countermeasures = getEspionageCountermeasures(mission.from, state);
    const stealth = getFleetStealth(mission.fleet, state.blueprints || []);
    const factionMult = getFactionEspionageMult(mission.from?.faction || 'human');

    // `sleeper_net` ("+10% Intel Máxima de IAs por nivel") baja el listón para
    // saltar de `high` a `full`, que pedia techDiff > 6. El bonus de facción
    // suma escalones por el mismo lado: espia mejor, no se esconde mejor.
    const techDiff = applyIntelCeiling(
      rawDiff,
      getIntelCeilingBonus(state) + getFactionEspionageDiffBonus(factionMult)
    );

    const detectionChance = computeEspionageDetection({
      techDiff: rawDiff,
      countermeasures,
      stealth,
    });
    const detected = Math.random() < detectionChance;

    if (detected) {
      let newRelation = Math.max(-100, (target.relation || 0) - 20);
      let isWar = false;
      let pnaVal = target.pna;
      let allianceVal = target.alliance;
      let tradeVal = target.trade;
      if (newRelation <= -50) {
        newRelation = -100;
        isWar = true;
        pnaVal = false;
        allianceVal = false;
        tradeVal = false;
      }

      newState.reputation = Math.max(-100, (state.reputation || 0) - 5);
      newState.aiPlanets = state.aiPlanets.map(p => p.id === target.id ? {
        ...p,
        relation: newRelation,
        pna: pnaVal,
        alliance: allianceVal,
        trade: tradeVal
      } : p);

      newState.notifications = [...(newState.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `⚠️ Sonda de espionaje detectada y destruida por ${target.name}. Relación reducida en -20.`,
        timestamp: Date.now()
      }];

      if (isWar && (target.pna || target.alliance || target.trade)) {
        newState.notifications = [...(newState.notifications || []), {
          id: uid(),
          type: 'error',
          message: `⚠️ Tratados cancelados con ${target.name} debido a hostilidades. ¡Se ha declarado la guerra!`,
          timestamp: Date.now()
        }];
      }

      // Registrar informe bloqueado/interceptado en spyReports y planetIntel
      const blockedReport = {
        id: uid(), timestamp: Date.now(),
        targetId: target.id,
        targetName: target.name,
        target: { name: target.name, galaxy: target.galaxy, system: target.system, position: target.position },
        coords: { galaxy: target.galaxy, system: target.system, position: target.position },
        intelLevel: 'blocked',
        resources: { metal: '???', crystal: '???', deuterium: '???' },
        buildings: null,
        fleet: null,
        defenses: null,
        extendedInfo: null,
      };
      const curReports = [...(newState.spyReports || []), blockedReport];
      newState.spyReports = curReports.length > 50 ? curReports.slice(-50) : curReports;

      const intelLedger = { ...(newState.planetIntel || {}) };
      const previo = intelLedger[target.id];
      intelLedger[target.id] = {
        id: target.id,
        name: target.name,
        coords: { galaxy: target.galaxy, system: target.system, position: target.position },
        level: previo?.level || 'blocked',
        at: blockedReport.timestamp,
        reports: (previo?.reports || 0) + 1,
        resources: previo?.resources || null,
        buildings: previo?.buildings || null,
        fleet: previo?.fleet || null,
        defenses: previo?.defenses || null,
        researchSnapshot: previo?.researchSnapshot || null,
        behaviorPrediction: previo?.behaviorPrediction || null,
      };
      newState.planetIntel = intelLedger;

      return { 
        state: newState, 
        type: 'warning', 
        message: `👁️ Sonda de espionaje detectada y neutralizada por ${target.name}`, 
        returnFleet: {},
        tacticalEvent: {
          id: uid(),
          type: 'espionage_alert',
          title: '¡Sonda de Espionaje Detectada!',
          subtitle: `Pérdida de señal en ${target.name} [${target.galaxy}:${target.system}:${target.position}]`,
          description: `Las contramedidas electrónicas de ${target.name} interceptaron y destruyeron la sonda antes de que pudiera transmitir la telemetría completa. Las relaciones diplomáticas han empeorado.`,
          image: 'Centro de Espionaje.webp',
          targetPlanetId: mission.from.id,
          ministryId: 'defense',
          ministryName: 'Ministerio de Defensa e Inteligencia',
          voiceText: `Alerta: Sonda de espionaje neutralizada por ${target.name}. Se ha perdido el enlace táctico.`
        }
      };
    }

    let intelLevel = 'basic';
    let reportResources = null;
    let reportFleet = null;
    let reportDefenses = null;
    let reportBuildings = null;
    let extendedInfo = null;

    if (techDiff <= -3) {
      intelLevel = 'blocked';
      reportResources = { metal: '???', crystal: '???', deuterium: '???' };
      reportFleet = { lightFighter: '???' };
      reportDefenses = { rocketLauncher: '???' };
    } else if (techDiff <= 0) {
      intelLevel = 'low';
      const fleetPresent = Object.entries(target.fleet || {}).filter(([,q]) => q > 0).length > 0;
      reportResources = { metal: 'parcial', crystal: 'parcial', deuterium: 'parcial' };
      reportFleet = fleetPresent ? { estimated: true } : { none: true };
    } else if (techDiff <= 3) {
      intelLevel = 'medium';
      reportResources = {
        metal: Math.floor((target.resources?.metal || 0) * (0.7 + Math.random() * 0.3)),
        crystal: Math.floor((target.resources?.crystal || 0) * (0.7 + Math.random() * 0.3)),
        deuterium: Math.floor((target.resources?.deuterium || 0) * (0.7 + Math.random() * 0.3)),
      };
      reportFleet = { ...target.fleet };
      for (const key of Object.keys(reportFleet)) {
        reportFleet[key] = Math.floor(reportFleet[key] * (0.6 + Math.random() * 0.4));
      }
      reportDefenses = { ...target.defenses };
      for (const key of Object.keys(reportDefenses)) {
        reportDefenses[key] = Math.floor(reportDefenses[key] * (0.5 + Math.random() * 0.5));
      }
    } else if (techDiff <= 6) {
      intelLevel = 'high';
      reportResources = { ...target.resources };
      reportFleet = { ...target.fleet };
      reportDefenses = { ...target.defenses };
      reportBuildings = { ...target.buildings };
      extendedInfo = target.research ? { researchSnapshot: { ...target.research } } : null;
    } else {
      intelLevel = 'full';
      reportResources = { ...target.resources };
      reportFleet = { ...target.fleet };
      reportDefenses = { ...target.defenses };
      reportBuildings = { ...target.buildings };
      extendedInfo = {
        strategy: target.strategy,
        aggression: target.aggression,
        totalWins: target.totalWins || 0,
        totalLosses: target.totalLosses || 0,
        planetsConquered: target.planetsConquered || 0,
        planetsLost: target.planetsLost || 0,
        activityRecent: state.gameTick - (target.lastStrategyChange || 0) < 600 ? 'alta' : 'normal',
        expansionPattern: target.planetsConquered > target.planetsLost ? 'expansionista' : 'defensivo',
        behaviorPrediction: target.aggression > 0.6 ? 'probable ataque' : (target.diploTendency > 0.5 ? 'probable diplomacia' : 'incierto'),
        researchSnapshot: target.research ? { ...target.research } : null,
      };
    }

    const report = {
      id: uid(), timestamp: Date.now(),
      targetId: target.id,
      targetName: target.name,
      target: { name: target.name, galaxy: target.galaxy, system: target.system, position: target.position },
      coords: { galaxy: target.galaxy, system: target.system, position: target.position },
      intelLevel,
      resources: reportResources,
      buildings: reportBuildings,
      fleet: reportFleet,
      defenses: reportDefenses,
      extendedInfo,
    };
    const sr = [...(newState.spyReports || []), report];
    newState.spyReports = sr.length > 50 ? sr.slice(-50) : sr;

    // Lo que el jugador SABE de cada mundo, acumulado. `spyReports` es un
    // historial que se descarta a los 50; esto responde a otra pregunta: qué se
    // sabe de este planeta concreto y qué sigue sin saberse.
    // REGLA: Los datos exactos ya conocidos jamás son destruidos por '???' o 'parcial'.
    const intelLedger = { ...(newState.planetIntel || {}) };
    const previo = intelLedger[target.id];

    const mergeResources = (prevRes, newRes) => {
      if (!newRes) return prevRes ?? null;
      if (!prevRes) return newRes;
      if (typeof prevRes.metal === 'number') {
        if (typeof newRes.metal === 'number') return newRes;
        return prevRes;
      }
      return newRes;
    };

    const mergeStructures = (prevVal, newVal) => {
      if (!newVal) return prevVal ?? null;
      if (!prevVal) return newVal;
      const isUnknown = Object.values(newVal).every(v => v === '???');
      if (isUnknown) return prevVal;
      const hasConcrete = Object.values(prevVal).some(v => typeof v === 'number');
      const newHasConcrete = Object.values(newVal).some(v => typeof v === 'number');
      if (hasConcrete && !newHasConcrete) return prevVal;
      return newVal;
    };

    intelLedger[target.id] = {
      id: target.id,
      name: target.name,
      coords: { galaxy: target.galaxy, system: target.system, position: target.position },
      level: bestIntelLevel(previo?.level, report.intelLevel),
      at: report.timestamp,
      reports: (previo?.reports || 0) + 1,
      resources: mergeResources(previo?.resources, report.resources),
      buildings: mergeStructures(previo?.buildings, report.buildings),
      fleet: mergeStructures(previo?.fleet, report.fleet),
      defenses: mergeStructures(previo?.defenses, report.defenses),
      researchSnapshot: report.extendedInfo?.researchSnapshot ?? previo?.researchSnapshot ?? null,
      behaviorPrediction: report.extendedInfo?.behaviorPrediction ?? previo?.behaviorPrediction ?? null,
    };
    newState.planetIntel = intelLedger;
    return { 
      state: newState, 
      type: 'info', 
      message: `👁️ ${intelLevel === 'blocked' ? 'Espionaje bloqueado' : `Informe de espionaje (${intelLevel}) de ${target.name}`}`, 
      returnFleet: mission.fleet,
      tacticalEvent: {
        id: uid(),
        type: 'espionage',
        title: 'Informe de Espionaje Orbital',
        subtitle: `${target.name} [${target.galaxy}:${target.system}:${target.position}] • Nivel: ${intelLevel.toUpperCase()}`,
        description: `Las sondas de reconocimiento han transmitido el escaneo espectral del objetivo. Los datos de telemetría y sensores han sido procesados por el centro de inteligencia.`,
        resources: typeof reportResources?.metal === 'number' ? reportResources : null,
        targetPlanetId: mission.from.id,
        image: 'Centro de Espionaje.webp',
        ministryId: 'defense',
        ministryName: 'Ministerio de Defensa e Inteligencia',
        voiceText: `Transmisión de espionaje recibida desde ${target.name}. Nivel de inteligencia: ${intelLevel}.`
      }
    };
  }
  return { state: newState, type: 'warning', message: `👁️ No hay nada en [${mission.to.galaxy}:${mission.to.system}:${mission.to.position}]`, returnFleet: mission.fleet };
};

export const handleTransportMission = (mission, state) => {
  const target = state.planets.find(p => (
    (mission.to.id && p.id === mission.to.id) ||
    (p.galaxy === mission.to.galaxy && p.system === mission.to.system && p.position === mission.to.position)
  ));
  let newState = { ...state };
  if (target) {
    const storage = calcStorage(target.buildings, state.research || {});
    const maxMetal = storage.metal || 100000;
    const maxCrystal = storage.crystal || 100000;
    const maxDeut = storage.deuterium || 100000;

    const currentM = target.resources?.metal || 0;
    const currentC = target.resources?.crystal || 0;
    const currentD = target.resources?.deuterium || 0;

    const deliveredMetal = Math.min(mission.resources?.metal || 0, Math.max(0, maxMetal - currentM));
    const deliveredCrystal = Math.min(mission.resources?.crystal || 0, Math.max(0, maxCrystal - currentC));
    const deliveredDeut = Math.min(mission.resources?.deuterium || 0, Math.max(0, maxDeut - currentD));

    newState = updatePlanet(newState, target.id, p => ({
      ...p,
      resources: {
        ...p.resources,
        metal: (p.resources?.metal || 0) + deliveredMetal,
        crystal: (p.resources?.crystal || 0) + deliveredCrystal,
        deuterium: (p.resources?.deuterium || 0) + deliveredDeut,
      },
    }));
    return { 
      state: newState, 
      type: 'success', 
      message: `📦 Transporte completado a ${target.name}`, 
      returnFleet: mission.fleet,
      tacticalEvent: {
        id: uid(),
        type: 'transport',
        title: 'Cargamento Entregado con Éxito',
        subtitle: `Destino: ${target.name} [${target.galaxy}:${target.system}:${target.position}]`,
        description: `El convoy logístico procedente de ${mission.from?.name || 'la base'} ha entrado en la órbita de ${target.name} y ha transferido los suministros a los almacenes del planeta.`,
        resources: {
          metal: mission.resources?.metal || deliveredMetal,
          crystal: mission.resources?.crystal || deliveredCrystal,
          deuterium: mission.resources?.deuterium || deliveredDeut,
          deliveredMetal,
          deliveredCrystal,
          deliveredDeut
        },
        targetPlanetId: target.id,
        image: 'largeCargo',
        ministryId: 'transport',
        ministryName: 'Ministerio de Transporte y Tránsito',
        voiceText: `Transporte completado con éxito en ${target.name}. Suministros transferidos.`
      }
    };
  }
  return { state: newState, type: 'warning', message: `📦 Destino no encontrado, flota regresando`, returnFleet: mission.fleet };
};

export const handleTradeSendMission = (mission, state) => {
  const target = state.aiPlanets.find(p => p.id === mission.to.id);
  let newState = { ...state };
  if (target) {
    newState.aiPlanets = state.aiPlanets.map(p => {
      if (p.id === target.id) {
        return {
          ...p,
          resources: {
            metal: (p.resources?.metal || 0) + (mission.resources?.metal || 0),
            crystal: (p.resources?.crystal || 0) + (mission.resources?.crystal || 0),
            deuterium: (p.resources?.deuterium || 0) + (mission.resources?.deuterium || 0),
          }
        };
      }
      return p;
    });
    return { state: newState, type: 'success', message: `📦 Tus cargueras entregaron los recursos a ${target.name}. Iniciando viaje de retorno.`, returnFleet: mission.fleet };
  }
  return { state: newState, type: 'warning', message: `📦 Destino de comercio de la IA no encontrado, cargueras retornando`, returnFleet: mission.fleet };
};

export const handleTradeReceiveMission = (mission, state) => {
  const target = state.planets.find(p => p.id === mission.to.id);
  let newState = { ...state };
  if (target) {
    newState = updatePlanet(newState, target.id, p => ({
      ...p,
      resources: {
        metal: p.resources.metal + (mission.resources?.metal || 0),
        crystal: p.resources.crystal + (mission.resources?.crystal || 0),
        deuterium: p.resources.deuterium + (mission.resources?.deuterium || 0),
      }
    }));
    return { state: newState, type: 'success', message: `📦 Los cargueros de ${mission.from.name} entregaron recursos en tu planeta ${target.name}.`, returnFleet: mission.fleet };
  }
  return { state: newState, type: 'warning', message: `📦 Planeta destino no existe, cargueros de la IA retornando`, returnFleet: mission.fleet };
};

export const handleRecycleMission = (mission, state) => {
  const fleet = mission.fleet;
  const debris = state.debrisField || { metal: 0, crystal: 0 };
  const isCommercial = mission.from.specialization === 'commercial';
  const cargoMultiplier = isCommercial ? 1.5 : 1.0;
  const maxCargo = Object.entries(fleet).reduce((acc, [id, qty]) => acc + (SHIPS[id]?.cargo || 0) * qty * cargoMultiplier, 0);
  const collected = {
    metal: Math.min(debris.metal, maxCargo / 2),
    crystal: Math.min(debris.crystal, maxCargo / 2),
  };
  let newState = updatePlanet(state, mission.from.id, p => ({
    ...p,
    resources: {
      metal: p.resources.metal + collected.metal,
      crystal: p.resources.crystal + collected.crystal,
      deuterium: p.resources.deuterium,
    },
  }));
  newState.debrisField = {
    metal: debris.metal - collected.metal,
    crystal: debris.crystal - collected.crystal,
  };
  return { 
    state: newState, 
    type: 'success', 
    message: `♻️ Reciclado: ${fmt(collected.metal)}M, ${fmt(collected.crystal)}C`, 
    returnFleet: mission.fleet,
    tacticalEvent: {
      id: uid(),
      type: 'recycle',
      title: 'Manifiesto de Reciclaje Orbital',
      subtitle: `Flota de Recicladores • ${mission.from?.name || 'Base'}`,
      description: `Las tripulaciones de reciclaje han terminado de procesar el campo de escombros orbital. Los metales y cristales recuperados han sido cargados en los depósitos y la flota emprende el viaje de vuelta.`,
      resources: {
        metal: collected.metal,
        crystal: collected.crystal,
        deuterium: 0,
      },
      targetPlanetId: mission.from.id,
      image: 'recycler',
      ministryId: 'resources',
      ministryName: 'Ministerio de Recursos y Minería',
      voiceText: `Operación de reciclaje completada. Escombros procesados y asegurados.`
    }
  };
};
