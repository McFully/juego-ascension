import { uid, calcDistance } from '../../../core.jsx';

/**
 * Normaliza y devuelve el perfil psicopolítico y de memoria de una facción IA.
 * Si la facción aún no dispone de memoria o rasgos extendidos, los genera
 * de forma determinista basándose en su estrategia inicial.
 */
export const ensureFactionProfile = (ai) => {
  if (!ai) return null;
  const strat = ai.strategy || 'balanced';

  // Rasgos de personalidad y sesgos estratégicos
  const profile = ai.profile || {
    aggressiveness: ai.aggression !== undefined ? ai.aggression : (strat === 'militarist' ? 0.8 : strat === 'expansionist' ? 0.65 : 0.35),
    prudence: strat === 'technocrat' || strat === 'diplomat' ? 0.75 : strat === 'militarist' ? 0.3 : 0.5,
    ambition: strat === 'expansionist' || strat === 'militarist' ? 0.85 : 0.5,
    riskTolerance: ai.riskTolerance !== undefined ? ai.riskTolerance : (strat === 'chaotic' ? 0.9 : 0.45),
    diplomaticLean: strat === 'diplomat' ? 0.85 : strat === 'merchant' ? 0.65 : strat === 'militarist' ? 0.15 : 0.4,
    commercialLean: strat === 'merchant' ? 0.9 : 0.45,
    expansionLean: strat === 'expansionist' ? 0.9 : 0.4,
    techLean: strat === 'technocrat' ? 0.95 : 0.4,
    loyalty: strat === 'diplomat' ? 0.85 : strat === 'chaotic' ? 0.15 : 0.6,
    trust: strat === 'diplomat' ? 0.7 : strat === 'militarist' ? 0.3 : 0.5,
    shortTermGoal: 'consolidate', // 'expand' | 'militarize' | 'trade' | 'tech' | 'recover' | 'consolidate'
    longTermGoal: strat === 'expansionist' ? 'domination' : strat === 'technocrat' ? 'ascension' : strat === 'merchant' ? 'monopoly' : 'survival',
  };

  // Memoria episódica histórica
  const memory = ai.memory || {
    rivals: [],        // [{ factionId, empireName, grudge: 0..100, reason }]
    allies: [],        // [{ factionId, empireName, affinity: 0..100, establishedTick }]
    betrayals: [],     // [{ factionId, tick, context }]
    aidReceived: [],   // [{ factionId, tick, amount }]
    pastWars: [],      // [{ opponentId, won: boolean, tick, casualties }]
    pastTreaties: [],  // [{ type, partnerId, broken: boolean }]
    recentCrises: [],  // [{ type, tick, severity }]
    strategicNotes: [] // Resúmenes de IA / directivas estratégicas
  };

  // Información imperfecta o estimaciones sobre otros
  const intelLedger = ai.intelLedger || {};

  return {
    ...ai,
    profile,
    memory,
    intelLedger
  };
};

/**
 * Añade un recuerdo a la memoria de la facción y ajusta su confianza/rencor.
 */
export const recordFactionMemory = (faction, event) => {
  const current = ensureFactionProfile(faction);
  const mem = { ...current.memory };

  if (event.type === 'betrayal') {
    mem.betrayals = [
      ...(mem.betrayals || []).slice(-10),
      { factionId: event.targetId, tick: event.tick, context: event.reason, timestamp: Date.now() }
    ];
    // Aumentar rencor
    const existingRival = (mem.rivals || []).find(r => r.factionId === event.targetId);
    if (existingRival) {
      existingRival.grudge = Math.min(100, existingRival.grudge + 35);
    } else {
      mem.rivals = [...(mem.rivals || []), { factionId: event.targetId, empireName: event.targetName, grudge: 60, reason: event.reason }];
    }
    // Disminuir confianza
    current.profile.trust = Math.max(0.05, current.profile.trust - 0.25);
  } else if (event.type === 'aid') {
    mem.aidReceived = [
      ...(mem.aidReceived || []).slice(-10),
      { factionId: event.targetId, tick: event.tick, context: event.reason, timestamp: Date.now() }
    ];
    current.profile.trust = Math.min(0.95, current.profile.trust + 0.15);
  } else if (event.type === 'war_ended') {
    mem.pastWars = [
      ...(mem.pastWars || []).slice(-15),
      { opponentId: event.targetId, won: event.won, tick: event.tick, timestamp: Date.now() }
    ];
  }

  return {
    ...current,
    memory: mem
  };
};

/**
 * Información imperfecta: Actualiza o calcula el poder militar percibido de un objetivo.
 * Las facciones no conocen el estado 100% exacto del enemigo;
 * estiman con error probabilístico y desfase temporal.
 */
export const getPerceivedPower = (observer, target) => {
  if (!observer || !target) return 10;
  const ledger = observer.intelLedger || {};
  const intel = ledger[target.id];

  const actualFleet = target.fleet ? Object.values(target.fleet).reduce((a, b) => a + b, 0) : 0;
  const actualDef = target.defenses ? Object.values(target.defenses).reduce((a, b) => a + b, 0) : 0;
  const actualPower = actualFleet * 2 + actualDef + (target.aiLevel || 1) * 10;

  // Si ya tenemos intel reciente y con baja incertidumbre, usamos la estimación
  if (intel && intel.perceivedPower !== undefined) {
    return Math.max(1, intel.perceivedPower);
  }

  // Si no hay intel, generar una estimación con niebla de guerra (+/- 35% de desviación)
  const espLvl = observer.buildings?.researchLab || 1;
  const errorMargin = Math.max(0.1, 0.45 - espLvl * 0.03); // a más lab, mejor precisión
  const noise = 1 + (Math.random() * 2 - 1) * errorMargin;
  return Math.max(1, Math.round(actualPower * noise));
};

export const updateIntelLedger = (observer, target, tick) => {
  const current = ensureFactionProfile(observer);
  const ledger = { ...(current.intelLedger || {}) };

  const perceivedPower = getPerceivedPower(observer, target);
  ledger[target.id] = {
    targetId: target.id,
    empireName: target.empireName || target.name,
    perceivedPower,
    lastUpdatedTick: tick,
    threatLevel: perceivedPower > (observer.aiLevel || 1) * 20 ? 'HIGH' : 'MODERATE'
  };

  return {
    ...current,
    intelLedger: ledger
  };
};
