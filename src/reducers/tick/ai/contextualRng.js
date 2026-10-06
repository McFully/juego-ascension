/**
 * contextualRng.js — Sistema de Azar Contextual Ponderado
 * 
 * Fórmula:
 * PROBABILIDAD FINAL = PROBABILIDAD BASE + MODIFICADORES CONTEXTUALES + SESGO DE PERFIL + HISTORIAL
 * 
 * Elimina el azar plano (random() ciego) y garantiza causalidad en cada evento.
 */

export const evaluateContextualRoll = ({
  baseProb = 0.5,
  modifiers = [],
  profileFactor = 0,
  historyFactor = 0,
  noiseFactor = 0.05
}) => {
  // Suma de modificadores ambientales / situacionales
  const totalMod = modifiers.reduce((acc, m) => acc + (Number(m.value) || 0), 0);
  
  // Pequeña varianza contextual realista (+/- noise)
  const noise = (Math.random() * 2 - 1) * noiseFactor;

  const rawProb = baseProb + totalMod + profileFactor + historyFactor + noise;
  
  // Delimitar probabilidad final estricta entre 0.01 y 0.99 (nunca certeza absoluta, nunca imposible)
  const finalProb = Math.max(0.01, Math.min(0.99, rawProb));
  
  const roll = Math.random();
  const success = roll < finalProb;

  return {
    success,
    roll,
    finalProb,
    breakdown: {
      baseProb,
      totalMod,
      profileFactor,
      historyFactor,
      noise
    }
  };
};

import { getPerceivedPower } from './factionProfileManager.js';

/**
 * Evalúa la tensión de guerra contextual entre dos facciones considerando información imperfecta.
 */
export const calculateWarTension = (factionA, factionB, galaxyState) => {
  const profileA = factionA.profile || {};
  const memoryA = factionA.memory || {};

  // Grudge histórico hacia factionB
  const rivalEntry = (memoryA.rivals || []).find(r => r.factionId === factionB.id);
  const grudge = (rivalEntry?.grudge || 0) / 100;

  // Diferencia de poder militar con niebla de guerra (información imperfecta)
  const milA = (factionA.fleet ? Object.values(factionA.fleet).reduce((a, b) => a + b, 0) : 0) * 2 + 
               (factionA.defenses ? Object.values(factionA.defenses).reduce((a, b) => a + b, 0) : 0) + 
               (factionA.aiLevel || 1) * 10;
  const perceivedMilB = getPerceivedPower(factionA, factionB);
  const powerRatio = milA / Math.max(1, perceivedMilB);

  // Modificadores contextuales
  const modifiers = [
    { name: 'aggressiveness', value: (profileA.aggressiveness || 0.5) * 0.2 },
    { name: 'powerAdvantage', value: powerRatio > 1.4 ? 0.15 : powerRatio < 0.7 ? -0.2 : 0 },
    { name: 'grudgeHistory', value: grudge * 0.25 },
    { name: 'borderProximity', value: factionA.galaxy === factionB.galaxy && factionA.system === factionB.system ? 0.1 : 0 },
    { name: 'allianceDeterrent', value: (factionB.allianceIds || []).length > 0 ? -0.15 : 0 }
  ];

  return evaluateContextualRoll({
    baseProb: 0.05,
    modifiers,
    profileFactor: (profileA.expansionLean || 0.4) * 0.1,
    historyFactor: (memoryA.betrayals || []).length * 0.05,
    noiseFactor: 0.03
  });
};
