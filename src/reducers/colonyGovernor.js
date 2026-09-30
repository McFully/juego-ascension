import { canAfford, buildingCost, calcBuildTime, meetsResearchReq, researchCost } from '../utils/formulas.js';
import { BUILDINGS, RESEARCH } from '../core.jsx';
import { logTelemetry } from '../utils/telemetry.js';
import { MINISTRY_MAPPING } from '../data/buildingOperationsData.js';
import { CANDIDATES_POOL } from '../data/governmentPoliciesData.js';
import { rankResearch, ministryHasViableResearch, buildResearchScoreConfig } from '../reducers/tick/ai/researchScoring.js';

import { MINISTRY_BUILDING_REQS, isMinistryUnlocked, buildPlanetMinistries } from '../data/ministryState.js';

/**
 * 1.6-6 — Puntúa a los candidatos de un ministerio para el planeta concreto.
 *
 * Antes `full_auto` invertía a `candidates[0]`: el primero del array, siempre el
 * mismo, sin mirar nada. Ahora gana quien compensa el punto débil real del
 * planeta: si va justo de energía, un `energyBoost` vale más que un `metalProd`.
 *
 * Los candidatos sin bonus reconocido se quedan en 0.6, así que siguen siendo
 * elegibles pero no ganan por defecto.
 */
const NEUTRAL_CANDIDATE_SCORE = 0.6;

export const scoreMinisterCandidate = (candidate, planet) => {
  const res = planet?.resources || {};
  const b = planet?.buildings || {};
  const energyBal = planet?.energyBalance ?? planet?.production?.energyBalance ?? 0;

  // 0..1 de "cuánto nos duele". Normalizado a propósito: solo importa el orden.
  const need = {
    // Déficit de recurso concreto.
    metalProd: 1 - Math.min(1, (res.metal || 0) / 5e6),
    crystalProd: 1 - Math.min(1, (res.crystal || 0) / 3e6),
    deutProd: 1 - Math.min(1, (res.deuterium || 0) / 1.5e6),
    creditsProd: (res.credits || 0) < 1e4 ? 0.9 : 0.3,
    // Energía: lo más urgente de todo, es lo que frena la producción entera.
    energyBoost: energyBal < 0 ? 1 : energyBal < 100 ? 0.7 : 0.15,
    fusionBoost: (b.fusionReactor || 0) > 0 ? (energyBal < 50 ? 0.9 : 0.2) : 0.1,
    // Kolas: si algo está saturado, acortar el tiempo de algo compensa.
    buildTime: (planet?._buildQueueSaturation || 0),
    researchSpeed: (planet?._researchQueueSaturation || 0),
    shipCostReduction: (planet?._buildQueueSaturation || 0) * 0.7,
    cargoCapacity: 0.4,
    transportSpeed: 0.4,
    // Seguridad: si hay ataque entrante, sube.
    fleetAttack: (planet?._incomingAttacks || 0) > 0 ? 1 : 0.2,
    counterEspionage: (planet?._incomingAttacks || 0) > 0 ? 0.8 : 0.35,
    activeEspionage: 0.4,
    // Orden interno.
    popGrowth: (planet?.happiness ?? 100) < 60 ? 0.8 : 0.3,
    happinessBoost: (planet?.happiness ?? 100) < 60 ? 0.85 : 0.3,
    socialUnity: (planet?.happiness ?? 100) < 50 ? 0.9 : 0.25,
    stabilityBoost: 0.4,
    orderBoost: 0.45,
    influenceGain: 0.35,
    researchSpeedBonus: 0.5,
    fusionResearch: 0.5,
    dockingBoost: 0.4,
  };
  return need[candidate?.bonus] ?? NEUTRAL_CANDIDATE_SCORE;
};

/** Elige el mejor candidato disponible para el planeta. Empate: el del array. */
export const pickBestCandidate = (candidates, planet) => {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  let best = null;
  let bestScore = -Infinity;
  for (const c of candidates) {
    const s = scoreMinisterCandidate(c, planet);
    if (s > bestScore) {
      bestScore = s;
      best = c;
    }
  }
  return best;
};

/**
 * Motor de Gobernanza y Delegación Colonial Autónoma.
 * Soporta tres directrices configurables:
 * 1. 'autonomous_only': Solo gestiona ministerios con ministro asignado Y activos en autónomo.
 * 2. 'assigned_all': Gestiona ministerios con ministro asignado (estén o no en autónomo manual).
 * 3. 'full_auto': El Gobernador asigna el mejor ministro a cada ministerio desbloqueado por infraestructura,
 *    los activa en autónomo y los gestiona integralmente en tiempo real.
 */
export const processColonyGovernor = (state, dispatch) => {
  if (!state || !state.planets) return;

  state.planets.forEach(planet => {
    const isGovernorActive = Boolean(planet.autoGovernance);
    const directiveMode = planet.governorDirectiveMode || 'autonomous_only';
    const currentPlanetQueue = (state.buildQueue || []).filter(q => q.planetId === planet.id);
    const res = planet.resources || { metal: 0, crystal: 0, deuterium: 0 };
    const b = planet.buildings || {};
    const research = state.research || {};
    // Cada planeta arranca con su gabinete en blanco: el gobernador de un mundo
    // no puede nombrar ministros ni tocar programas de otro.
    const planetMinistries = planet.ministries || buildPlanetMinistries(state.gameMode);

    // Contexto para puntuar candidatos (1.6-6): saturación de colas e invasiones.
    const planetWithContext = {
      ...planet,
      _buildQueueSaturation: Math.min(1, currentPlanetQueue.length / 8),
      _researchQueueSaturation: Math.min(1, (state.researchQueue || []).length / 8),
      _incomingAttacks: (state.fleetMissions || [])
        .filter(m => m.type === 'attack' && m.isAI && m.targetPlanetId === planet.id).length,
    };

    // =========================================================================
    // MODO 3 ('full_auto'): Investidura, coordinación y optimización de ministros
    // =========================================================================
    if (isGovernorActive && directiveMode === 'full_auto') {
      Object.keys(MINISTRY_MAPPING).forEach(minId => {
        // 1.6-3 — El desbloqueo sale de la fuente compartida, que cubre los 17
        // ministerios. Antes solo 6 tenían requisito y los otros 11 se invertían
        // en `full_auto` sin que el jugador hubiera construido nada.
        const isUnlocked = isMinistryUnlocked(minId, b);

        if (isUnlocked) {
          const currentMinData = planetMinistries[minId] || {};
          // Si el ministerio no tiene ministro o no está en autónomo, asignar el mejor disponible
          if (!currentMinData.minister || !currentMinData.automationEnabled) {
            const candidates = CANDIDATES_POOL[minId] || [];
            if (candidates.length > 0) {
              // 1.6-6 — Puntuar por lo que el planeta necesita, no el primero del array.
              const bestCandidate = currentMinData.minister || pickBestCandidate(candidates, planetWithContext);
              dispatch({
                type: 'APPOINT_MINISTER',
                ministryId: minId,
                minister: bestCandidate,
                planetId: planet.id
              });
              if (!currentMinData.automationEnabled) {
                dispatch({
                  type: 'SET_MINISTRY_AUTOMATION',
                  ministryId: minId,
                  planetId: planet.id,
                  enabled: true
                });
              }
              logTelemetry('INFO', `Gobernador Colonial (${planet.name}): Ministro investido automáticamente para ${minId}`, {
                minister: bestCandidate.name,
                directiveMode
              });
            }
          }
        }
      });
    }

    // =========================================================================
    // FILTRADO DE MINISTERIOS SEGÚN LA DIRECTRIZ SELECCIONADA O AUTONOMÍA MANUAL
    // =========================================================================
    let activeAutonomousMinistries = Object.entries(planetMinistries).filter(([minId, minData]) => {
      if (!MINISTRY_MAPPING[minId]) return false;

      // Comprobar si está desbloqueado por infraestructura
      const req = MINISTRY_BUILDING_REQS[minId];
      if (req && (b[req.id] || 0) < 1) return false;

      // Si el Gobernador está activo, aplica las directrices gubernamentales
      if (isGovernorActive) {
        if (directiveMode === 'autonomous_only') {
          // Directriz 1: Ministro asignado Y activado en modo autónomo
          return Boolean(minData?.minister && minData?.automationEnabled);
        } else if (directiveMode === 'assigned_all') {
          // Directriz 2: Ministro asignado (esté o no activo previamente)
          return Boolean(minData?.minister);
        } else if (directiveMode === 'full_auto') {
          // Directriz 3: Autónomo pleno con titular o asignado por el gobernador
          return Boolean(minData?.minister);
        }
      }

      // Si el Gobernador NO está activo, funciona si el ministerio específico está en autónomo
      return Boolean(minData?.automationEnabled);
    });

    if (activeAutonomousMinistries.length === 0) return;

    // ORQUESTADOR COLONIAL: Jerarquizar ministerios según la necesidad real del planeta:
    // 1. Si la energía es deficitaria o precaria (< 50), el Ministerio de Energía toma máxima prioridad.
    // 2. Si la energía está cubierta pero los almacenes o minas están descompensados, Recursos e Infraestructura toman el relevo.
    const energyBal = planet.energyBalance ?? 0;

    activeAutonomousMinistries.sort(([minA], [minB]) => {
      if (energyBal < 50) {
        if (minA === 'energy') return -1;
        if (minB === 'energy') return 1;
      }
      if (minA === 'resources' && minB !== 'energy') return -1;
      if (minB === 'resources' && minA !== 'energy') return 1;
      if (minA === 'infra') return -1;
      if (minB === 'infra') return 1;
      return 0;
    });

    // 1.2-d — La cola de investigación es GLOBAL (tope de 8) pero se recorría
    // siempre en el mismo orden: energy → resources → infra se comían los 8
    // huecos y ciencia/innovación/cibernética se quedaban sin nada, para siempre.
    //
    // Rotar el orden por tick reparte el primer turno entre todos. Cada
    // ministerio conserva su prioridad DENTRO de su turno, así que una energía
    // deficiente sigue yendo antes que nada: lo que cambia es a quién le toca
    // elegir primero, no qué se elige.
    const rot = (state.gameTick || 0) % activeAutonomousMinistries.length;
    if (rot > 0) {
      activeAutonomousMinistries = [
        ...activeAutonomousMinistries.slice(rot),
        ...activeAutonomousMinistries.slice(0, rot),
      ];
    }

    // El tope se cuenta sobre un contador local. Antes se consultaba
    // `state.researchQueue.length`, que es la foto ANTERIOR al tick y no cambia
    // dentro del bucle: la comprobación era siempre la misma y el recorte real
    // lo hacía `researchReducer`, que rechaza en silencio. Con el contador, el
    // bucle se detiene de verdad y no se mima un trabajo que se va a rechazar.
    let researchSlots = Math.max(0, 8 - (state.researchQueue || []).length);
    let buildSlots = Math.max(0, 8 - currentPlanetQueue.length);

    activeAutonomousMinistries.forEach(([minId, minData]) => {
      const mapping = MINISTRY_MAPPING[minId];
      if (!mapping) return;

      // Autogestión de Edificios del Ministerio
      if (buildSlots > 0 && mapping.buildings && mapping.buildings.length > 0) {
        let sortedBuildings = [...mapping.buildings];

        // LÓGICA ESPECIALIZADA POR MINISTERIO:
        if (minId === 'energy') {
          // Si el balance energético es negativo o bajo (< 50)
          const energyBal = planet.energyBalance ?? 0;
          const solarLvl = b.solarPlant || 0;
          const fusionLvl = b.fusionReactor || 0;

          sortedBuildings.sort((a, bId) => {
            // Si la energía está en déficit o solar ya tiene nivel >= 10, fusionReactor tiene máxima prioridad
            if (energyBal < 50 || solarLvl >= 10) {
              if (a === 'fusionReactor' && bId !== 'fusionReactor') return -1;
              if (bId === 'fusionReactor' && a !== 'fusionReactor') return 1;
            }
            // Después reactores avanzados / cuánticos si están disponibles
            const priorityOrder = ['fusionReactor', 'quantumReactor', 'darkMatterPlant', 'orbitalEnergy', 'geoPlant', 'solarPlant'];
            const idxA = priorityOrder.indexOf(a);
            const idxB = priorityOrder.indexOf(bId);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            return (b[a] || 0) - (b[bId] || 0);
          });

          // Si hay superávit amplio de energía (> 200) y solar >= 15 y fusión >= 5, no sobre-construir energía a lo loco
          if (energyBal > 200 && solarLvl >= 15 && fusionLvl >= 5) {
            sortedBuildings = []; // Pausa de energía para no despilfarrar recursos si sobra energía
          }
        } else if (minId === 'resources') {
          // Ministerio de Recursos: Mantener ratio equilibrado Metal (3) : Cristal (2) : Deuterio (1)
          const ml = b.metalMine || 0;
          const cl = b.crystalMine || 0;
          const dl = b.deutSynth || 0;

          sortedBuildings.sort((a, bId) => {
            // Priorizar según desequilibrio
            const getScore = (id) => {
              if (id === 'metalMine') return ml - cl * 1.2;
              if (id === 'crystalMine') return cl - dl * 1.2;
              if (id === 'deutSynth') return dl - Math.min(ml, cl) * 0.8;
              return 0;
            };
            return getScore(a) - getScore(bId);
          });
        } else if (minId === 'infra') {
          // Infraestructuras: Priorizar Centro de Construcción y Robots para reducir tiempos futuros
          const priority = ['constructionCenter', 'robotFactory', 'naniteFactory', 'researchLab', 'shipyard'];
          sortedBuildings.sort((a, bId) => {
            const idxA = priority.indexOf(a);
            const idxB = priority.indexOf(bId);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            return (b[a] || 0) - (b[bId] || 0);
          });
        }

        // Evaluar candidatos viables
        for (const buildingId of sortedBuildings) {
          // Veto del jugador: Si está marcado en las exclusiones de automatización de este planeta, el ministro lo ignora
          if (planet.automatedExclusions?.[buildingId]) continue;

          const def = BUILDINGS[buildingId];
          if (!def) continue;

          // Si requiere edificación madre (ej: researchLab, shipyard)
          if (mapping.parentRequiredBuilding && (b[mapping.parentRequiredBuilding] || 0) < 1) continue;

          const meets = meetsResearchReq(def.req, { ...b, ...research });
          if (!meets) continue;

          const lvl = b[buildingId] || 0;
          if (lvl >= 30) continue;

          const cost = buildingCost(buildingId, lvl, b.constructionCenter || 0);
          if (canAfford(res, cost)) {
              dispatch({ type: 'START_BUILDING', buildingId, planetId: planet.id });
              buildSlots--;
              logTelemetry('INFO', `Agente Ministerial (${minId}): Obra inteligente iniciada`, { planetId: planet.id, buildingId, level: lvl + 1 });
              break;
            }
        }
      }

      // Autogestión de Investigaciones del Ministerio (máximo 8 en cola global)
      if (researchSlots > 0 && mapping.research && mapping.research.length > 0) {
        if ((b.researchLab || 0) >= 1) {
          // Usar scoring real en lugar de orden fijo
          const scoreConfig = buildResearchScoreConfig(state, planet, {
            ministryId: minId,
            exclude: planet.automatedExclusions,
          });
          const ranked = rankResearch(scoreConfig, mapping.research);
          for (const { id: researchId, score } of ranked) {
            // Veto del jugador
            if (planet.automatedExclusions?.[researchId]) continue;

            const rDef = RESEARCH[researchId];
            if (!rDef) continue;
            const rLvl = research[researchId] || 0;
            const meetsR = meetsResearchReq(rDef.req, { ...b, ...research });
            if (!meetsR) continue;

            const rCost = researchCost(researchId, rLvl, research?.aiStrategy || 0, b.constructionCenter || 0);
            if (canAfford(res, rCost)) {
              dispatch({ type: 'START_RESEARCH', researchId, planetId: planet.id });
              researchSlots--;
              logTelemetry('INFO', `Agente Ministerial (${minId}): I+D iniciada (score ${score.toFixed(1)})`, { planetId: planet.id, researchId, level: rLvl + 1 });
              break;
            }
          }
        }
      }

      // 1.2-d — Sin presupuesto no queda nadie, ni de paso ni pormegollón.
      if (buildSlots <= 0 && researchSlots <= 0) return;
    });
  });
};

