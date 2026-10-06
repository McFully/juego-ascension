/**
 * emergentEventEngine.js — Motor de Eventos Emergentes Encadenados (Efecto Mariposa)
 *
 * ARQUITECTURA:
 * Capa 2.5 — entre el Motor Determinista y el Director de IA.
 * No crea recursos de la nada. Sólo redistribuye, penaliza, impulsa o conecta entidades.
 *
 * CADENAS IMPLEMENTADAS:
 * A) Guerra reciente → Crisis económica en el derrotado + Oportunismo vecino
 * B) Colonización en zona disputada → Tensión territorial + posible guerra preventiva
 * C) Facción dominante (nivel >> media) → Formación de coalición de equilibrio
 * D) Múltiples guerras en poco tiempo → Período de caos / Rebelión interna
 * E) Potencia comercial fuerte → Bloqueo económico de rivales
 * F) Avance tecnológico → Carrera armamentista de facciones rivales
 */

import { uid } from '../../../core.jsx';
import { evaluateContextualRoll } from './contextualRng.js';
import { recordFactionMemory } from './factionProfileManager.js';

// Ventana de tiempo (en ticks) para considerar un evento "reciente"
const RECENT_WINDOW = 300;

/**
 * Punto de entrada principal.
 * Se llama desde aiEmpireTick en cada ciclo diplomático (cada ~180 ticks).
 * Devuelve { aiPlanets, galacticEvents } con los efectos aplicados.
 */
export function processEmergentChains(state, tick, now) {
  const aiPlanets = [...(state.aiPlanets || [])];
  const events = state.galacticEvents || [];
  const newEvents = [];

  // Sólo trabajar con planetas activos
  const active = aiPlanets.filter(p => p && !p.isVirgin);
  if (active.length < 2) return { aiPlanets, galacticEvents: events };

  // Índice rápido por id para mutaciones eficientes
  const planetIdx = {};
  aiPlanets.forEach((p, i) => { if (p?.id) planetIdx[p.id] = i; });

  const mutate = (id, patch) => {
    const i = planetIdx[id];
    if (i !== undefined) aiPlanets[i] = { ...aiPlanets[i], ...patch };
  };

  // ── A) CRISIS ECONÓMICA POST-GUERRA ────────────────────────────────────────
  // Si una facción perdió recientemente, puede entrar en crisis que frena su
  // construcción y atrae oportunistas.
  const recentLosers = active.filter(p =>
    (p.totalLosses || 0) > (p.totalWins || 0) &&
    (p.resources?.metal || 0) < 5000 &&
    !(p._crisis?.active)
  );

  for (const loser of recentLosers) {
    const crisisRoll = evaluateContextualRoll({
      baseProb: 0.35,
      modifiers: [
        { name: 'lossRatio', value: Math.min(0.3, ((loser.totalLosses || 0) - (loser.totalWins || 0)) * 0.05) },
        { name: 'lowMetal',  value: (loser.resources?.metal || 0) < 2000 ? 0.15 : 0 }
      ],
      profileFactor: -(loser.profile?.prudence || 0.5) * 0.1,
      historyFactor: 0,
      noiseFactor: 0.05
    });

    if (crisisRoll.success) {
      // Penalización económica temporal: reducir recursos un 30%
      const curRes = loser.resources || {};
      mutate(loser.id, {
        resources: {
          metal:     Math.floor((curRes.metal     || 0) * 0.7),
          crystal:   Math.floor((curRes.crystal   || 0) * 0.7),
          deuterium: Math.floor((curRes.deuterium || 0) * 0.7)
        },
        _crisis: { active: true, type: 'economic', startTick: tick, severity: 'medium' }
      });

      newEvents.push({
        id: uid(), tick, type: 'crisis',
        title: '📉 Crisis Económica',
        desc: `${loser.empireName || loser.name} sufre una crisis post-bélica. Sus reservas colapsan.`,
        source: 'emergent_chain_A',
        timestamp: now
      });

      // B) Oportunistas vecinos (facciones en el mismo sistema o cercanas)
      const opportunists = active.filter(op =>
        op.id !== loser.id &&
        op.galaxy === loser.galaxy &&
        Math.abs((op.system || 0) - (loser.system || 0)) <= 2 &&
        (op.profile?.aggressiveness || 0.5) > 0.55
      );

      for (const op of opportunists.slice(0, 2)) {
        const opportunismRoll = evaluateContextualRoll({
          baseProb: 0.25,
          modifiers: [{ name: 'proximity', value: op.system === loser.system ? 0.2 : 0.05 }],
          profileFactor: (op.profile?.aggressiveness || 0.5) * 0.15,
          historyFactor: ((op.memory?.rivals || []).find(r => r.factionId === loser.id)?.grudge || 0) / 200,
          noiseFactor: 0.04
        });

        if (opportunismRoll.success) {
          // Oportunista saquea una porción de los recursos débiles del derrotado
          const loot = {
            metal:   Math.floor((loser.resources?.metal   || 0) * 0.2),
            crystal: Math.floor((loser.resources?.crystal || 0) * 0.2)
          };
          const iLoser = planetIdx[loser.id];
          const iOp    = planetIdx[op.id];
          if (iLoser !== undefined && iOp !== undefined) {
            mutate(loser.id, {
              resources: {
                metal:     Math.max(0, (aiPlanets[iLoser].resources?.metal     || 0) - loot.metal),
                crystal:   Math.max(0, (aiPlanets[iLoser].resources?.crystal   || 0) - loot.crystal),
                deuterium: aiPlanets[iLoser].resources?.deuterium || 0
              }
            });
            mutate(op.id, {
              resources: {
                metal:     (aiPlanets[iOp].resources?.metal     || 0) + loot.metal,
                crystal:   (aiPlanets[iOp].resources?.crystal   || 0) + loot.crystal,
                deuterium: aiPlanets[iOp].resources?.deuterium || 0
              }
            });
            // El derrotado registra otra traición
            const iL = planetIdx[loser.id];
            if (iL !== undefined) {
              aiPlanets[iL] = recordFactionMemory(aiPlanets[iL], {
                type: 'betrayal', targetId: op.id, targetName: op.empireName || op.name,
                tick, reason: 'opportunistic_raid'
              });
            }
            newEvents.push({
              id: uid(), tick, type: 'raid',
              title: '🦅 Oportunismo Galáctico',
              desc: `${op.empireName || op.name} aprovecha la crisis de ${loser.empireName || loser.name} para saquear sus recursos.`,
              source: 'emergent_chain_A2',
              timestamp: now
            });
          }
        }
      }
    }
  }

  // ── C) EQUILIBRIO DE PODER — COALICIÓN CONTRA POTENCIA DOMINANTE ──────────
  // Si una facción supera en 2.0x el nivel medio del resto (o 1.8x la media global),
  // las demás facciones perciben una amenaza existencial y pueden formar coalición.
  const avgLevel = active.reduce((s, p) => s + (p.aiLevel || 1), 0) / active.length;
  const dominant = active.find(p => {
    const others = active.filter(o => o.id !== p.id);
    const othersAvg = others.length > 0
      ? others.reduce((s, o) => s + (o.aiLevel || 1), 0) / others.length
      : 1;
    return (p.aiLevel || 1) >= othersAvg * 2.0;
  });

  if (dominant) {
    const threatPerceivers = active.filter(p =>
      p.id !== dominant.id &&
      (p.aiLevel || 1) < (dominant.aiLevel || 1) * 0.7
    );

    if (threatPerceivers.length >= 2) {
      const coalitionRoll = evaluateContextualRoll({
        baseProb: 0.30,
        modifiers: [
          { name: 'numThreatened', value: Math.min(0.2, threatPerceivers.length * 0.04) },
          { name: 'dominanceRatio', value: Math.min(0.2, (dominant.aiLevel || 1) / Math.max(1, avgLevel) * 0.05) }
        ],
        profileFactor: 0,
        historyFactor: 0,
        noiseFactor: 0.06
      });

      if (coalitionRoll.success) {
        // Los amenazados mejoran su relación mutua y su actitud defensiva
        const coalition = threatPerceivers.slice(0, 4);
        for (let i = 0; i < coalition.length; i++) {
          for (let j = i + 1; j < coalition.length; j++) {
            const a = coalition[i];
            const b = coalition[j];
            const iA = planetIdx[a.id];
            const iB = planetIdx[b.id];
            if (iA !== undefined) {
              aiPlanets[iA] = recordFactionMemory(aiPlanets[iA], {
                type: 'aid', targetId: b.id, targetName: b.empireName || b.name,
                tick, reason: 'coalition_pact'
              });
              mutate(a.id, {
                relation: Math.min(100, (aiPlanets[iA].relation || 0) + 20),
                strategicDirective: {
                  source: 'local_deterministic',
                  directive: 'FORTIFY',
                  priority: 'HIGH',
                  reasoning: `Coalición defensiva frente al poder de ${dominant.empireName || dominant.name}.`,
                  timestamp: now
                }
              });
            }
            if (iB !== undefined) {
              aiPlanets[iB] = recordFactionMemory(aiPlanets[iB], {
                type: 'aid', targetId: a.id, targetName: a.empireName || a.name,
                tick, reason: 'coalition_pact'
              });
              mutate(b.id, {
                relation: Math.min(100, (aiPlanets[iB].relation || 0) + 20),
                strategicDirective: {
                  source: 'local_deterministic',
                  directive: 'FORTIFY',
                  priority: 'HIGH',
                  reasoning: `Coalición defensiva frente al poder de ${dominant.empireName || dominant.name}.`,
                  timestamp: now
                }
              });
            }
          }
        }

        // La potencia dominante percibe la amenaza y activa postura de guerra
        const iDom = planetIdx[dominant.id];
        if (iDom !== undefined) {
          mutate(dominant.id, {
            strategicDirective: {
              source: 'local_deterministic',
              directive: 'WAR_POSTURE',
              priority: 'HIGH',
              reasoning: 'Múltiples facciones se coaligan en nuestra contra. Preparamos respuesta.',
              timestamp: now
            }
          });
        }

        newEvents.push({
          id: uid(), tick, type: 'coalition',
          title: '🤝 Coalición Defensiva',
          desc: `${coalition.length} facciones forman un bloque defensivo frente al dominio de ${dominant.empireName || dominant.name}.`,
          source: 'emergent_chain_C',
          timestamp: now
        });
      }
    }
  }

  // ── D) PERÍODO DE CAOS — DEMASIADAS GUERRAS RECIENTES ─────────────────────
  // Si hay más de 3 guerras en los últimos 300 ticks, puede producirse
  // un período de inestabilidad que fuerza diplomacia o reduce agresividad.
  const recentWars = events.filter(e => e.type === 'war' && tick - (e.tick || 0) < RECENT_WINDOW);
  if (recentWars.length > 3) {
    const chaosRoll = evaluateContextualRoll({
      baseProb: 0.20,
      modifiers: [{ name: 'warSaturation', value: Math.min(0.25, (recentWars.length - 3) * 0.04) }],
      profileFactor: 0,
      historyFactor: 0,
      noiseFactor: 0.05
    });

    if (chaosRoll.success) {
      // Facciones muy agresivas sufren "war fatigue": reducen agresividad temporalmente
      const warWeary = active.filter(p => (p.profile?.aggressiveness || 0.5) > 0.65);
      for (const w of warWeary.slice(0, 3)) {
        const iW = planetIdx[w.id];
        if (iW !== undefined && aiPlanets[iW].profile) {
          const newProfile = {
            ...aiPlanets[iW].profile,
            aggressiveness: Math.max(0.2, (aiPlanets[iW].profile.aggressiveness || 0.5) - 0.15)
          };
          mutate(w.id, {
            profile: newProfile,
            strategicDirective: {
              source: 'local_deterministic',
              directive: 'TRADE',
              priority: 'MEDIUM',
              reasoning: 'Fatiga bélica. El Imperio necesita recuperarse y estabilizar la economía.',
              timestamp: now
            }
          });
        }
      }

      newEvents.push({
        id: uid(), tick, type: 'chaos',
        title: '😮‍💨 Fatiga Bélica Galáctica',
        desc: `Tras ${recentWars.length} conflictos recientes, varias potencias buscan una tregua para recuperarse.`,
        source: 'emergent_chain_D',
        timestamp: now
      });
    }
  }

  // ── F) CARRERA TECNOLÓGICA ─────────────────────────────────────────────────
  // Si una facción tiene una ventaja tecnológica clara, rivales cercanos
  // activan directiva TECH para no quedarse atrás.
  const techLeaders = active
    .map(p => ({
      p,
      total: Object.values(p.research || {}).reduce((s, v) => s + v, 0)
    }))
    .sort((a, b) => b.total - a.total);

  if (techLeaders.length >= 2) {
    const leader = techLeaders[0];
    const avgTech = techLeaders.reduce((s, x) => s + x.total, 0) / techLeaders.length;

    if (leader.total > avgTech * 1.6) {
      // Las facciones con directiva no-TECH y suficiente lab activan TECH
      const laggards = active.filter(p =>
        p.id !== leader.p.id &&
        (p.buildings?.researchLab || 0) >= 3 &&
        (p.strategicDirective?.directive !== 'TECH') &&
        Object.values(p.research || {}).reduce((s, v) => s + v, 0) < leader.total * 0.6
      );

      for (const lag of laggards.slice(0, 3)) {
        const techRaceRoll = evaluateContextualRoll({
          baseProb: 0.30,
          modifiers: [{ name: 'techGap', value: Math.min(0.2, (leader.total - Object.values(lag.research || {}).reduce((s, v) => s + v, 0)) * 0.002) }],
          profileFactor: (lag.profile?.techLean || 0.4) * 0.15,
          historyFactor: 0,
          noiseFactor: 0.04
        });

        if (techRaceRoll.success) {
          mutate(lag.id, {
            strategicDirective: {
              source: 'local_deterministic',
              directive: 'TECH',
              priority: 'HIGH',
              reasoning: `${leader.p.empireName || leader.p.name} lidera en tecnología. Debemos recuperar terreno.`,
              timestamp: now
            }
          });
        }
      }

      if (laggards.length > 0) {
        newEvents.push({
          id: uid(), tick, type: 'tech_race',
          title: '🔬 Carrera Tecnológica',
          desc: `${leader.p.empireName || leader.p.name} lidera el avance científico galáctico. Otras potencias aceleran su I+D.`,
          source: 'emergent_chain_F',
          timestamp: now
        });
      }
    }
  }

  // ── RECUPERACIÓN DE CRISIS ─────────────────────────────────────────────────
  // Las crisis duran ~180 ticks. Después se auto-desactivan.
  for (const p of active) {
    if (p._crisis?.active && tick - (p._crisis.startTick || 0) > 180) {
      mutate(p.id, { _crisis: { active: false } });
    }
  }

  const allEvents = [...events, ...newEvents].slice(-250);
  return { aiPlanets, galacticEvents: allEvents };
}
