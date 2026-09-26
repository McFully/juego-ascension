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

    case 'CLEAR_ACTIVE_EVENT':
      return { ...state, activeEvent: null, activeFirstContact: null, activeTransmission: null };

    case 'DISMISS_FIRST_CONTACT':
      return { ...state, activeFirstContact: null, activeEvent: null, activeTransmission: null };

    case 'DISMISS_TRANSMISSION':
      return { ...state, activeTransmission: null, activeEvent: null, activeFirstContact: null };

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

    case 'RESOLVE_DECISION_EVENT': {
      const { option } = action;
      const planet = getCurrentPlanet();
      if (!planet || !state.activeEvent) return state;

      const ev = state.activeEvent;
      const opt = ev.options[option];

      let workingState = { ...state, activeEvent: null, activeFirstContact: null, activeTransmission: null };

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
      const { ministryId, cost, effect } = action;
      const planet = getCurrentPlanet();
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

      // Track active programs/projects upgrades inside the state
      const upgrades = workingState.ministryUpgrades || {};
      const ministryUps = upgrades[ministryId] || {};
      if (effect && effect.programId) {
        const nextLvl = (ministryUps[effect.programId] || 0) + 1;
        workingState.ministryUpgrades = {
          ...upgrades,
          [ministryId]: {
            ...ministryUps,
            [effect.programId]: nextLvl
          }
        };
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
