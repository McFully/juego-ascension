import {
  checkAchievements, checkMissions, getVirginPlanet,
  updatePlanet, shouldKeepNotification,
  clampResources, fmt, uid, buildingCost, researchCost, shipCost, defenseCost,
  canAfford, deduct, calcResourceValueForAI, meetsReq, calcProduction, calcStorage,
  shipTimeBonus, researchTimeBonus, calcCustomShipCost, calcCustomShipTime, calcBuildTime,
  calcResearchTime, calcShipTime, calcDefenseTime, calcDistance, calcFlightTime,
  calcFuel, fleetSpeed, getPOIAtCoordinates
} from '../core.jsx';
import {
  GAME_SPEED, FACTIONS, BUILDINGS, RESEARCH, SHIPS, DEFENSES,
  MOON_BUILDINGS, MISSIONS, MISSILES, BIOME_KEYS, AI_STRATEGIES,
  NARRATIVE_EVENTS, EVENTS
} from '../data/gameData.js';
import { processMission, returnFleetToOrigin, processEvent } from '../missions.jsx';


/**
 * 3.3 — Normaliza una entrada del registro táctico.
 *
 * Cada communication entrante (informe de misión, narrativa, primer contacto,
 * transmisión, crisis) acaba con la misma forma, para que la bandeja pueda
 * ordenarlas, contarlas y abrirlas sin conocer el origen.
 *
 * `read` viaja EN la entrada: es lo que permite "marcar leído" sin borrar, que es
 * justo lo que `state.notifications` no puede hacer (allí `read` se ponía a
 *_true_ en bloque y se perdía el historial).
 */
const VALID_PRIORITIES = ['baja', 'media', 'alta', 'critica'];

const normalizeLogEntry = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const options = Array.isArray(raw.options) && raw.options.length > 0 ? raw.options : null;

  return {
    // Conserva los campos que cada generador ya produce (manifiesto, bajas,
    // escombros, ficha de planeta,returnedFleet...) y añade los nuevos.
    ...raw,
    id: raw.id || uid(),
    kind: raw.kind || 'tactical',
    type: raw.type || 'info',
    title: raw.title || raw.text || 'Comunicación entrante',
    subtitle: raw.subtitle || '',
    description: raw.description || '',
    read: Boolean(raw.read),
    receivedAt: raw.receivedAt || Date.now(),
    options,
    // Una entrada con opciones sin resolver es una decisión pendiente: no se
    // descarta sola y el contador va en rojo.
    requiresDecision: Boolean(options) || Boolean(raw.requiresDecision),
    priority: VALID_PRIORITIES.includes(raw.priority) ? raw.priority : 'media',
  };
};

export const eventReducer = (state, action) => {
  const getCurrentPlanet = () => state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  let newState = { ...state };

  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const type = action.payload?.type || action.ntype || 'info';
      const message = action.payload?.message || action.message || '';
      return {
        ...state,
        notifications: [...(state.notifications || []), { id: uid(), type, message, timestamp: Date.now() }].slice(-100)
      };
    }

    case 'DISMISS_NOTIF':
      return { ...state, notifications: (state.notifications || []).filter(n => n.id !== action.payload) };
    
    case 'MARK_ALL_NOTIF_READ':
      return { ...state, notifications: (state.notifications || []).map(n => ({ ...n, read: true })) };

    case 'RESOLVE_CRISIS': {
      const { crisisId, choice } = action;
      const crisis = (state.activeCrises || []).find(c => c.id === crisisId);
      if (!crisis) return state;
      const opt = crisis.options?.[choice];
      if (!opt) return state;
      let workingState = { ...state, activeCrises: (state.activeCrises || []).filter(c => c.id !== crisisId) };
      const eff = opt.effect || opt;
      if (eff.reputation) workingState.reputation = Math.min(100, Math.max(-100, (workingState.reputation || 0) + eff.reputation));
      if (eff.influence) workingState.influence = (workingState.influence || 0) + eff.influence;
      if (eff.rel || eff.relAll) {
        const delta = eff.relAll || eff.rel;
        workingState.aiPlanets = workingState.aiPlanets.map(a => ({...a, relation: Math.max(-100, (a.relation||0) + delta ) }));
      }
      if (eff.shipsLoss && workingState.planets.length > 0) {
        const homeId = workingState.planets[0].id;
        workingState = updatePlanet(workingState, homeId, p => {
          const fleet = { ...(p.fleet || {}) };
          Object.keys(fleet).forEach(k => { if (fleet[k] > 0) fleet[k] = Math.max(0, Math.floor(fleet[k] * 0.8)); });
          return { ...p, fleet };
        });
      }
      workingState.notifications = [...(workingState.notifications || []), {
        id: uid(), type: 'info', message: `📜 Crisis resuelta: ${crisis.title} — ${opt.text || ''}`, timestamp: Date.now()
      }];
      return workingState;
    }

    // 3.1 — Cada case toca SOLO su propio slot. Antes los tres borrados
    // (CLEAR_ACTIVE_EVENT / DISMISS_FIRST_CONTACT / DISMISS_TRANSMISSION) limpiaban
    // los tres campos, así que descartar uno se llevaba por delante un mensaje
    // pendiente que nadie había leído.
    case 'CLEAR_ACTIVE_EVENT':
      return { ...state, activeEvent: null };

    case 'DISMISS_FIRST_CONTACT':
      return { ...state, activeFirstContact: null };

    case 'DISMISS_TRANSMISSION':
      return { ...state, activeTransmission: null };

    case 'DISMISS_TACTICAL_EVENT': {
      const eventId = action.payload || action.id;
      return {
        ...state,
        tacticalEvents: (state.tacticalEvents || []).filter(e => e.id !== eventId)
      };
    }

    case 'DISMISS_ALL_TACTICAL_EVENTS':
      return {
        ...state,
        tacticalEvents: []
      };

    // --- 3.5-c Bandeja de comunicaciones ---------------------------------
    // `tacticalEventLog` es el histórico persistente: no se vacía al descartar.
    // `read` va en la entrada; la verdad del contador es contar los !read.

    case 'MARK_TACTICAL_EVENT_READ': {
      const eventId = action.payload || action.id;
      if (!eventId) return state;
      return {
        ...state,
        tacticalEventLog: (state.tacticalEventLog || []).map(e =>
          e.id === eventId ? { ...e, read: true } : e
        )
      };
    }

    case 'MARK_ALL_TACTICAL_EVENTS_READ':
      return {
        ...state,
        tacticalEventLog: (state.tacticalEventLog || []).map(e => ({ ...e, read: true }))
      };

    case 'CLEAR_READ_TACTICAL_EVENTS':
      return {
        ...state,
        tacticalEventLog: (state.tacticalEventLog || []).filter(e => !e.read)
      };

    case 'APPEND_TACTICAL_EVENT_LOG': {
      // Punto único de entrada al log. Lo usan el orquestador y las facciones
      // para no duplicar la normalización de la entrada.
      const entry = normalizeLogEntry(action.payload || action.entry);
      if (!entry) return state;
      const log = [...(state.tacticalEventLog || [])];
      // Un id repetido no debe crear dos entradas.
      if (log.some(e => e.id === entry.id)) return state;
      log.push(entry);
      return { ...state, tacticalEventLog: log };
    }

    case 'RESOLVE_DECISION_EVENT': {
      const { option } = action;
      const planet = getCurrentPlanet();
      if (!planet || !state.activeEvent) return state;

      const ev = state.activeEvent;
      const opt = ev.options[option];

      // 3.1 — igual que arriba: solo se vacía el slot de la narrativa.
      let workingState = { ...state, activeEvent: null };

      // Apply resource changes to current planet
      if (opt.cost) {
        workingState = updatePlanet(workingState, planet.id, p => ({
          ...p,
          resources: {
            metal: Math.max(0, p.resources.metal + (opt.cost.metal || 0)),
            crystal: Math.max(0, p.resources.crystal + (opt.cost.crystal || 0)),
            deuterium: Math.max(0, p.resources.deuterium + (opt.cost.deuterium || 0)),
          }
        }));
      }

      // Apply ship changes
      if (opt.ships) {
        workingState = updatePlanet(workingState, planet.id, p => {
          const fleet = { ...p.fleet };
          Object.entries(opt.ships).forEach(([id, q]) => {
            fleet[id] = (fleet[id] || 0) + q;
          });
          return { ...p, fleet };
        });
      }

      // Apply relations change to the specific AI planet
      if (opt.relationChange && ev.originPlanetId) {
        workingState.aiPlanets = workingState.aiPlanets.map(p => {
          if (p.id === ev.originPlanetId) {
            return { ...p, relation: Math.min(100, Math.max(-100, p.relation + opt.relationChange)) };
          }
          return p;
        });
      }

      // Apply reputation changes based on relationChange
      if (opt.relationChange) {
        const repChange = opt.relationChange > 0 ? 5 : -5;
        workingState.reputation = Math.min(100, Math.max(-100, (state.reputation || 0) + repChange));
      }

      workingState.notifications = [...(workingState.notifications || []), {
        id: uid(), type: 'info', message: `🔭 Suceso resuelto: ${opt.outcomeText}`, timestamp: Date.now()
      }];

      return workingState;
    }

    case 'RESOLVE_NARRATIVE_EVENT': {
      const { eventId, optionIdx } = action;
      const event = state.activeEvent;
      if (!event || event.id !== eventId) return state;

      const option = event.options[optionIdx];
      if (!option) return state;

      // Verify and deduct costs
      const planet = getCurrentPlanet();
      let workingState = { ...state };
      if (option.cost && planet) {
        if (!canAfford(planet.resources, option.cost)) {
          return {
            ...state,
            notifications: [...(state.notifications || []), { id: uid(), type: 'error', message: 'Recursos insuficientes para ejecutar esta directiva.', timestamp: Date.now() }]
          };
        }
        workingState = updatePlanet(workingState, planet.id, p => ({ ...p, resources: deduct(p.resources, option.cost) }));
      }

      // Execute narrative effect or impact
      if (option.impact) {
        workingState = option.impact(workingState) || workingState;
      } else if (option.effect) {
        workingState = structuredClone(workingState);
        option.effect(workingState);
      }

      return {
        ...workingState,
        activeEvent: null,
        activeFirstContact: null,
        activeTransmission: null,
        adventureLogs: [...(workingState.adventureLogs || []), { tick: state.gameTick, eventId, text: `Crisis resuelta: ${event.title} -> ${option.label || option.text}` }]
      };
    }

    case 'MINISTRY_PROJECT': {
      const { ministryId, cost, effect, planetId } = action;
      // Los programas de ministerio son estado del planeta que los financia,
      // no del imperio. Sin `planetId` explícito se cae al planeta activo solo
      // como ultimo recurso, para que la acción siga siendo válida.
      const targetPlanetId = planetId || state.currentPlanetId;
      const planet = targetPlanetId
        ? (state.planets || []).find(p => p.id === targetPlanetId)
        : getCurrentPlanet();
      if (!planet) return state;

      const playerInfluence = state.influence || 0;
      const influenceCost = cost ? (cost.influence || 0) : 0;
      if (playerInfluence < influenceCost) return state;

      if (cost && !canAfford(planet.resources, cost)) return state;

      let workingState = updatePlanet(state, planet.id, p => ({
        ...p,
        resources: deduct(p.resources, cost || {})
      }));

      if (influenceCost > 0) {
        workingState.influence = Math.max(0, playerInfluence - influenceCost);
      }

      if (effect && effect.influence) {
        workingState.influence = (workingState.influence || 0) + effect.influence;
      }

      // Los niveles de programa viven en el planeta: subir un programa en un
      // mundo no debe alterar los Programas de los demás mundos del imperio.
      if (effect && effect.programId) {
        const nextLvl = ((planet.ministryUpgrades?.[ministryId] || {})[effect.programId] || 0) + 1;
        workingState = updatePlanet(workingState, planet.id, p => ({
          ...p,
          ministryUpgrades: {
            ...(p.ministryUpgrades || {}),
            [ministryId]: {
              ...(p.ministryUpgrades?.[ministryId] || {}),
              [effect.programId]: nextLvl
            }
          }
        }));
      }

      // Record in diplomatic history for narrative context
      workingState.diplomaticHistory = [...(workingState.diplomaticHistory || []), {
        tick: state.gameTick,
        type: 'ministry_investment',
        ministry: ministryId,
        planetName: planet.name
      }].slice(-50);

      const ministryNames = {
        economy: 'Economía', defense: 'Defensa', science: 'Ciencia', 
        culture: 'Cultura', infra: 'Infraestructura', intel: 'Inteligencia'
      };

      workingState.notifications = [...(workingState.notifications || []), {
        id: uid(),
        type: 'success',
        message: `💼 Ministerio de ${ministryNames[ministryId] || ministryId}: Inversión completada con éxito.`,
        timestamp: Date.now()
      }];

      return workingState;
    }

    default:
      return state;
  }
};
