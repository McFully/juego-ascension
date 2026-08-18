import { systemReducer } from './systemReducer.js';
import { economyReducer } from './economyReducer.js';
import { researchReducer } from './researchReducer.js';
import { fleetReducer } from './fleetReducer.js';
import { diplomacyReducer } from './diplomacyReducer.js';
import { eventReducer } from './eventReducer.js';
import { governmentReducer } from './governmentReducer.js';
import { shouldKeepNotification } from '../core.jsx';

export const gameReducer = (state, action) => {
  const result = gameReducerInner(state, action);
  if (result && result.notifications) {
    result.notifications = result.notifications.filter(shouldKeepNotification);
  }
  return result;
};

const gameReducerInner = (state, action) => {
  // Capture user-initiated actions in eventLog for Replay System
  const actionToLog = ['SET_PLANET', 'RENAME_PLANET', 'PLANET_SPECIALIZE', 'PLANET_TOGGLE_AUTOTRADE', 'START_BUILDING', 'START_RESEARCH', 'START_SHIP', 'START_DEFENSE', 'SEND_FLEET', 'ABANDON_PLANET', 'COLONIZE', 'SCRAP_SHIPS', 'SCRAP_DEFENSES', 'RETROFIT_FLEET', 'RETROFIT_DEFENSES', 'BUILD_MOON_BUILDING', 'JUMP_GATE_TRANSFER', 'BUILD_MISSILE', 'LAUNCH_MISSILE', 'SAVE_BLUEPRINT', 'DELETE_BLUEPRINT', 'BUILD_CUSTOM_SHIP', 'CANCEL_CUSTOM_SHIP_QUEUE', 'CANCEL_SHIP_QUEUE', 'CANCEL_DEFENSE_QUEUE', 'CANCEL_MISSION', 'REQUEST_REINFORCEMENTS', 'DIPLOMACY_TRADE', 'DIPLOMACY_TRIBUTE', 'DIPLOMACY_TREATY', 'DIPLOMACY_DECLARE_WAR', 'DIPLOMACY_BUY_SHIP', 'COUNCIL_PROPOSE_RESOLUTION', 'COUNCIL_VOTE', 'FORM_FEDERATION', 'CONTRIBUTE_TO_FEDERAL_FLEET', 'SPEND_INFLUENCE', 'RESOLVE_CRISIS', 'RESOLVE_DECISION_EVENT'];

  let workingState = state;
  if (actionToLog.includes(action.type) && state.gameStarted) {
    const newEvent = { tick: state.gameTick, type: action.type, payload: action };
    workingState = {
      ...state,
      eventLog: [...(state.eventLog || []), newEvent].slice(-10000)
    };
  }

  // Rutas de acciones de dominio
  switch (action.type) {
    // --- SYSTEM, LOAD, TICK ---
    case 'RESET_GAME':
    case 'LOAD':
    case 'TICK':
      return systemReducer(workingState, action);

    // --- ECONOMY ---
    case 'SET_PLANET':
    case 'RENAME_PLANET':
    case 'PLANET_SPECIALIZE':
    case 'PLANET_TOGGLE_AUTOTRADE':
    case 'START_BUILDING':
      return economyReducer(workingState, action);

    // --- RESEARCH ---
    case 'START_RESEARCH':
      return researchReducer(workingState, action);

    // --- FLEET / ASTILLERO / MISILES / BLUEPRINTS ---
    case 'START_SHIP':
    case 'START_DEFENSE':
    case 'SEND_FLEET':
    case 'ABANDON_PLANET':
    case 'COLONIZE':
    case 'SCRAP_SHIPS':
    case 'SCRAP_DEFENSES':
    case 'RETROFIT_FLEET':
    case 'RETROFIT_DEFENSES':
    case 'BUILD_MOON_BUILDING':
    case 'JUMP_GATE_TRANSFER':
    case 'BUILD_MISSILE':
    case 'LAUNCH_MISSILE':
    case 'SAVE_BLUEPRINT':
    case 'DELETE_BLUEPRINT':
    case 'BUILD_CUSTOM_SHIP':
    case 'CANCEL_CUSTOM_SHIP_QUEUE':
    case 'CANCEL_SHIP_QUEUE':
    case 'CANCEL_DEFENSE_QUEUE':
    case 'CANCEL_BUILD_QUEUE':
    case 'CANCEL_RESEARCH_QUEUE':
    case 'CANCEL_MISSION':
    case 'REQUEST_REINFORCEMENTS':
    case 'START_MISSION':
    case 'COMPLETE_MISSION':
    case 'SAVE_FLEET_PRESET':
    case 'DELETE_FLEET_PRESET':
      return fleetReducer(workingState, action);

    // --- DIPLOMACY ---
    case 'DISCOVER_AI':
    case 'DIPLOMACY_PROPOSE_TREATY':
    case 'DIPLOMACY_CLOSE_TRANSMISSION':
    case 'DIPLOMACY_TRADE_EXCESS':
    case 'DIPLOMACY_PAY_TRIBUTO_THREAT':
    case 'DIPLOMACY_REJECT_TRIBUTO_THREAT':
    case 'DIPLOMACY_ACCEPT_PROPOSAL':
    case 'DIPLOMACY_BETRAYAL_RESPONSE':
    case 'DIPLOMACY_TRADE':
    case 'DIPLOMACY_TRIBUTE':
    case 'DIPLOMACY_APPLY_ACTION':
    case 'DIPLOMACY_TREATY':
    case 'DIPLOMACY_DECLARE_WAR':
    case 'DIPLOMACY_BUY_SHIP':
    case 'COUNCIL_PROPOSE_RESOLUTION':
    case 'COUNCIL_VOTE':
    case 'FORM_FEDERATION':
    case 'CONTRIBUTE_TO_FEDERAL_FLEET':
    case 'SPEND_INFLUENCE':
      return diplomacyReducer(workingState, action);

    // --- EVENTS & NOTIFICATIONS ---
    case 'ADD_NOTIFICATION':
    case 'DISMISS_NOTIF':
    case 'MARK_ALL_NOTIF_READ':
    case 'RESOLVE_CRISIS':
    case 'CLEAR_ACTIVE_EVENT':
    case 'DISMISS_FIRST_CONTACT':
    case 'DISMISS_TRANSMISSION':
    case 'RESOLVE_DECISION_EVENT':
    case 'RESOLVE_NARRATIVE_EVENT':
    case 'MINISTRY_PROJECT':
      return eventReducer(workingState, action);

    // --- GOVERNMENT / CHAT ---
    case 'ADD_CHAT_MESSAGE':
    case 'UPDATE_MINISTRY_POLICY':
    case 'APPOINT_MINISTER':
    case 'TOGGLE_MINISTRY_DIRECTIVE':
    case 'TOGGLE_MINISTRY_AUTOMATION':
    case 'BUY_CIVIL_BUSINESS':
      return governmentReducer(workingState, action);

    default:
      return state; // Retornar el state original e inmutable si la acción no coincide
  }
};
