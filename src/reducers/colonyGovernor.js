import { canAfford, buildingCost, calcBuildTime, meetsReq, researchCost } from '../utils/formulas.js';
import { BUILDINGS, RESEARCH } from '../core.jsx';
import { logTelemetry } from '../utils/telemetry.js';
import { MINISTRY_MAPPING } from '../data/buildingOperationsData.js';
import { CANDIDATES_POOL } from '../data/governmentPoliciesData.js';

// Requisitos de infraestructura previa para operar cada sede ministerial
export const MINISTRY_BUILDING_REQS = {
  science: { id: 'researchLab', name: 'Laboratorio de Investigación' },
  war: { id: 'shipyard', name: 'Astillero Orbital' },
  cybernetics: { id: 'researchLab', name: 'Laboratorio de Investigación' },
  innovation: { id: 'naniteFactory', name: 'Fábrica de Nanitas' },
  industry: { id: 'robotFactory', name: 'Fábrica de Robots' },
  transport: { id: 'spacePort', name: 'Puerto Espacial' },
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
    const planetMinistries = planet.ministries || state.ministries || {};

    // =========================================================================
    // MODO 3 ('full_auto'): Investidura, coordinación y optimización de ministros
    // =========================================================================
    if (isGovernorActive && directiveMode === 'full_auto') {
      Object.keys(MINISTRY_MAPPING).forEach(minId => {
        const req = MINISTRY_BUILDING_REQS[minId];
        const isUnlocked = !req || ((b[req.id] || 0) >= 1);

        if (isUnlocked) {
          const currentMinData = planetMinistries[minId] || {};
          // Si el ministerio no tiene ministro o no está en autónomo, asignar el mejor disponible
          if (!currentMinData.minister || !currentMinData.automationEnabled) {
            const candidates = CANDIDATES_POOL[minId] || [];
            if (candidates.length > 0) {
              const bestCandidate = currentMinData.minister || candidates[0];
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
    const activeAutonomousMinistries = Object.entries(planetMinistries).filter(([minId, minData]) => {
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

    activeAutonomousMinistries.forEach(([minId, minData]) => {
      const mapping = MINISTRY_MAPPING[minId];
      if (!mapping) return;

      // Autogestión de Edificios del Ministerio
      if (currentPlanetQueue.length < 8 && mapping.buildings && mapping.buildings.length > 0) {
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

          const meets = meetsReq(def.req, { ...b, ...research });
          if (!meets) continue;

          const lvl = b[buildingId] || 0;
          if (lvl >= 30) continue;

          const cost = buildingCost(buildingId, lvl, b.constructionCenter || 0);
          if (canAfford(res, cost)) {
            dispatch({ type: 'START_BUILDING', buildingId, planetId: planet.id });
            logTelemetry('INFO', `Agente Ministerial (${minId}): Obra inteligente iniciada`, { planetId: planet.id, buildingId, level: lvl + 1 });
            break;
          }
        }
      }

      // Autogestión de Investigaciones del Ministerio (máximo 8 en cola global)
      if ((state.researchQueue || []).length < 8 && mapping.research && mapping.research.length > 0) {
        if ((b.researchLab || 0) >= 1) {
          for (const resId of mapping.research) {
            // Veto del jugador: Si la investigación está excluida, el ministro la ignora
            if (planet.automatedExclusions?.[resId]) continue;

            const rDef = RESEARCH[resId];
            if (!rDef) continue;
            const rLvl = research[resId] || 0;
            const meetsR = meetsReq(rDef.req, { ...b, ...research });
            if (!meetsR) continue;

            const rCost = researchCost ? researchCost(resId, rLvl, b.researchLab || 0) : {};
            if (canAfford(res, rCost)) {
              dispatch({ type: 'START_RESEARCH', researchId: resId, planetId: planet.id });
              logTelemetry('INFO', `Agente Ministerial (${minId}): I+D iniciada`, { planetId: planet.id, resId, level: rLvl + 1 });
              break;
            }
          }
        }
      }
    });
  });
};

