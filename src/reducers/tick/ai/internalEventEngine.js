/**
 * internalEventEngine.js — Motor de eventos internos de facción
 *
 * Simula la inestabilidad y dinamismo interno de cada facción:
 * rebeliones, crisis políticas, golpes de estado, booms económicos
 * y avances tecnológicos espontáneos.
 *
 * PRINCIPIO: No crea recursos de la nada ni destruye save-states.
 * Ajusta perfil, directiva, recursos y memoria. El motor determinista
 * del juego valida siempre el estado final.
 */

import { uid } from '../../../core.jsx';
import { evaluateContextualRoll } from './contextualRng.js';
import { recordFactionMemory } from './factionProfileManager.js';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Punto de entrada — llama a todos los motores internos.
 * Devuelve { aiPlanets, galacticEvents } modificados.
 */
export function processInternalEvents(state, tick, now) {
  let aiPlanets = [...(state.aiPlanets || [])];
  const events = state.galacticEvents || [];
  const newEvents = [];

  const active = aiPlanets.filter(p => p && !p.isVirgin);
  if (active.length === 0) return { aiPlanets, galacticEvents: events };

  const planetIdx = {};
  aiPlanets.forEach((p, i) => { if (p?.id) planetIdx[p.id] = i; });

  const mutate = (id, patch) => {
    const i = planetIdx[id];
    if (i !== undefined) aiPlanets[i] = { ...aiPlanets[i], ...patch };
  };

  for (const planet of active) {
    // ── 1. REBELIÓN INTERNA ─────────────────────────────────────────────────
    // Facciones con muchas pérdidas, bajos recursos y alta agresividad interna
    // pueden sufrir una rebelión que reduce su capacidad militar y cambia directiva.
    const lossRatio = (planet.totalLosses || 0) / Math.max(1, (planet.totalWins || 0) + (planet.totalLosses || 0));
    const lowRes = (planet.resources?.metal || 0) < 3000 || (planet.resources?.crystal || 0) < 2000;
    const highAggr = (planet.profile?.aggressiveness || 0.5) > 0.7;

    if (!(planet._rebellion?.active)) {
      const rebellionRoll = evaluateContextualRoll({
        baseProb: 0.04,
        modifiers: [
          { name: 'lossRatio',  value: lossRatio > 0.6 ? 0.12 : 0 },
          { name: 'lowRes',     value: lowRes ? 0.08 : 0 },
          { name: 'highAggr',   value: highAggr ? 0.05 : 0 },
          { name: 'inCrisis',   value: planet._crisis?.active ? 0.10 : 0 }
        ],
        profileFactor: -(planet.profile?.prudence || 0.5) * 0.08,
        historyFactor:  (planet.memory?.pastWars || []).filter(w => !w.won).length * 0.03,
        noiseFactor:    0.03
      });

      if (rebellionRoll.success) {
        // Reducir flota y defensas en 25%, bajar agresividad temporalmente
        const newFleet = {};
        for (const [k, v] of Object.entries(planet.fleet || {})) {
          newFleet[k] = Math.max(0, Math.floor(v * 0.75));
        }
        const newDef = {};
        for (const [k, v] of Object.entries(planet.defenses || {})) {
          newDef[k] = Math.max(0, Math.floor(v * 0.75));
        }
        const newProfile = {
          ...(planet.profile || {}),
          aggressiveness: clamp((planet.profile?.aggressiveness || 0.5) - 0.20, 0.1, 1),
          trust:          clamp((planet.profile?.trust || 0.5) - 0.15, 0.05, 1)
        };
        const dir = {
          source: 'local_deterministic',
          directive: 'FORTIFY',
          priority: 'CRITICAL',
          reasoning: 'Rebelión interna. Consolidación y pacificación forzada.',
          timestamp: now
        };

        const updated = recordFactionMemory({ ...planet }, {
          type: 'betrayal', targetId: 'internal_rebellion', targetName: 'Rebelión Interna',
          tick, reason: 'civil_unrest'
        });

        mutate(planet.id, {
          ...updated,
          fleet: newFleet,
          defenses: newDef,
          profile: newProfile,
          strategicDirective: dir,
          _rebellion: { active: true, startTick: tick, severity: 'medium' }
        });

        newEvents.push({
          id: uid(), tick, type: 'rebellion',
          title: '🔥 Rebelión Interna',
          desc: `Estallido civil en ${planet.empireName || planet.name}. Flota reducida. Mando en crisis. Directiva: FORTIFY.`,
          source: 'internal_event',
          timestamp: now
        });
        continue; // no procesar otros eventos internos si hay rebelión activa
      }
    }

    // Recuperación de rebelión tras ~150 ticks
    if (planet._rebellion?.active && tick - (planet._rebellion.startTick || 0) > 150) {
      mutate(planet.id, {
        _rebellion: { active: false },
        profile: {
          ...(planet.profile || {}),
          aggressiveness: clamp((planet.profile?.aggressiveness || 0.3) + 0.10, 0.1, 1)
        }
      });
    }

    // ── 2. CRISIS POLÍTICA / CAMBIO DE LIDERAZGO ───────────────────────────
    // Si una facción ha sufrido múltiples traiciones y perdió guerras,
    // puede haber un golpe de estado que resetea parcialmente su perfil.
    const betrayalCount = (planet.memory?.betrayals || []).length;
    const warLossCount = (planet.memory?.pastWars || []).filter(w => !w.won).length;

    if (!(planet._coup?.active) && betrayalCount >= 3 && warLossCount >= 2) {
      const coupRoll = evaluateContextualRoll({
        baseProb: 0.06,
        modifiers: [
          { name: 'betrayals', value: Math.min(0.15, betrayalCount * 0.03) },
          { name: 'losses',    value: Math.min(0.10, warLossCount * 0.02) }
        ],
        profileFactor:  (planet.profile?.loyalty || 0.6) * -0.12,
        historyFactor:  0,
        noiseFactor:    0.04
      });

      if (coupRoll.success) {
        // Nuevo liderazgo: randomizar moderadamente algunos rasgos del perfil
        const shift = () => clamp((Math.random() * 0.4) - 0.2, -0.25, 0.25);
        const newProfile = {
          ...(planet.profile || {}),
          aggressiveness:  clamp((planet.profile?.aggressiveness || 0.5) + shift(), 0.1, 1),
          diplomaticLean:  clamp((planet.profile?.diplomaticLean || 0.4) + shift(), 0.1, 1),
          expansionLean:   clamp((planet.profile?.expansionLean  || 0.4) + shift(), 0.1, 1),
          loyalty:         clamp((planet.profile?.loyalty        || 0.6) - 0.20, 0.1, 1),
          trust:           clamp((planet.profile?.trust          || 0.5) - 0.25, 0.05, 1),
          shortTermGoal:   'Consolidar nuevo gobierno',
          longTermGoal:    'Restaurar la estabilidad y el poder'
        };

        // La nueva directiva depende de cuál rasgo quedó más alto
        const newDir = newProfile.aggressiveness > 0.65 ? 'MILITARIZE'
          : newProfile.diplomaticLean > 0.6 ? 'TRADE'
          : newProfile.expansionLean > 0.6  ? 'EXPAND'
          : 'FORTIFY';

        mutate(planet.id, {
          profile: newProfile,
          strategicDirective: {
            source: 'local_deterministic',
            directive: newDir,
            priority: 'HIGH',
            reasoning: 'Golpe de estado. Nuevo liderazgo con agenda diferente.',
            timestamp: now
          },
          _coup: { active: true, startTick: tick },
          memory: {
            ...(planet.memory || {}),
            betrayals: [], // limpiar rencores del gobierno anterior
            strategicNotes: [
              ...((planet.memory?.strategicNotes || []).slice(-3)),
              `[Tick ${tick}] Golpe de estado. Perfil recalibrado. Nueva directiva: ${newDir}.`
            ]
          }
        });

        newEvents.push({
          id: uid(), tick, type: 'coup',
          title: '👑 Golpe de Estado',
          desc: `${planet.empireName || planet.name} sufre un cambio de gobierno tras ${betrayalCount} traiciones. Nueva directiva: ${newDir}.`,
          source: 'internal_event',
          timestamp: now
        });
        continue;
      }
    }

    // Golpe resuelto tras 100 ticks
    if (planet._coup?.active && tick - (planet._coup.startTick || 0) > 100) {
      mutate(planet.id, { _coup: { active: false } });
    }

    // ── 3. BOOM ECONÓMICO / SUPERCICLO COMERCIAL ───────────────────────────
    // Facciones con muchas rutas de comercio y alta inclinación comercial
    // pueden experimentar un boom que multiplica sus reservas.
    const tradeRoutes = (planet.tradeRoutes || []).length;
    const commercialLean = planet.profile?.commercialLean || 0.45;

    if (tradeRoutes >= 2 && commercialLean > 0.55) {
      const boomRoll = evaluateContextualRoll({
        baseProb: 0.05,
        modifiers: [
          { name: 'tradeRoutes',   value: Math.min(0.12, tradeRoutes * 0.03) },
          { name: 'commercialLean', value: commercialLean * 0.08 }
        ],
        profileFactor: 0,
        historyFactor: 0,
        noiseFactor:   0.03
      });

      if (boomRoll.success) {
        const bonus = 1.3 + commercialLean * 0.4; // entre 1.3x y 1.74x
        const cur = planet.resources || {};
        mutate(planet.id, {
          resources: {
            metal:     Math.floor((cur.metal     || 0) * bonus),
            crystal:   Math.floor((cur.crystal   || 0) * bonus),
            deuterium: Math.floor((cur.deuterium || 0) * bonus)
          }
        });

        newEvents.push({
          id: uid(), tick, type: 'boom',
          title: '📈 Superciclo Comercial',
          desc: `${planet.empireName || planet.name} experimenta un boom económico. Sus reservas aumentan ${Math.round((bonus - 1) * 100)}%.`,
          source: 'internal_event',
          timestamp: now
        });
      }
    }

    // ── 4. AVANCE TECNOLÓGICO ESPONTÁNEO ───────────────────────────────────
    // Facciones con alta inclinación tecnológica y directiva TECH
    // pueden dar un salto inesperado en investigación.
    const techLean = planet.profile?.techLean || 0.4;
    const isTechDirective = planet.strategicDirective?.directive === 'TECH';
    const labLvl = planet.buildings?.researchLab || 0;

    if (techLean > 0.6 && isTechDirective && labLvl >= 4) {
      const breakthroughRoll = evaluateContextualRoll({
        baseProb: 0.04,
        modifiers: [
          { name: 'techLean', value: (techLean - 0.6) * 0.2 },
          { name: 'labLevel', value: Math.min(0.10, labLvl * 0.015) }
        ],
        profileFactor: 0,
        historyFactor: 0,
        noiseFactor:   0.03
      });

      if (breakthroughRoll.success) {
        // Avanzar 2 niveles en una rama de investigación aleatoria
        const resKeys = Object.keys(planet.research || {});
        if (resKeys.length > 0) {
          const target = resKeys[Math.floor(Math.random() * resKeys.length)];
          const newResearch = { ...(planet.research || {}) };
          newResearch[target] = Math.min(25, (newResearch[target] || 0) + 2);
          mutate(planet.id, { research: newResearch });

          newEvents.push({
            id: uid(), tick, type: 'tech_breakthrough',
            title: '🔬 Avance Científico Espontáneo',
            desc: `${planet.empireName || planet.name} logra un salto inesperado en I+D. ${target} avanza 2 niveles.`,
            source: 'internal_event',
            timestamp: now
          });
        }
      }
    }
  }

  const allEvents = [...events, ...newEvents].slice(-300);
  return { aiPlanets, galacticEvents: allEvents };
}
