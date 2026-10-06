import { systemReducer } from './systemReducer.js';
import { economyReducer } from './economyReducer.js';
import { researchReducer } from './researchReducer.js';
import { fleetReducer } from './fleetReducer.js';
import { diplomacyReducer } from './diplomacyReducer.js';
import { eventReducer } from './eventReducer.js';
import { governmentReducer } from './governmentReducer.js';
import { councilReducer } from './councilReducer.js';
import { sectorReducer } from './sectorReducer.js';
import { shouldKeepNotification } from '../core.jsx';

export const gameReducer = (state, action) => {
  // Rebase: el worker calcula el tick sobre un snapshot. Las acciones del
  // jugador despachadas mientras el tick estaba en vuelo se reaplican sobre
  // el estado resultante para que ningún clic quede revertido.
  if (action.type === 'APPLY_TICK_STATE' && Array.isArray(action.replay) && action.replay.length) {
    let rebased = gameReducer(state, { type: 'APPLY_TICK_STATE', payload: action.payload });
    for (const pending of action.replay) rebased = gameReducer(rebased, pending);
    return rebased;
  }
  const result = gameReducerInner(state, action);
  if (result && result.notifications) {
    result.notifications = result.notifications.filter(shouldKeepNotification);
  }
  return result;
};

const gameReducerInner = (state, action) => {
  // Capture user-initiated actions in eventLog for Replay System
  const actionToLog = ['SET_PLANET', 'RENAME_PLANET', 'PLANET_SPECIALIZE', 'PLANET_TOGGLE_AUTOTRADE', 'START_BUILDING', 'START_RESEARCH', 'START_SHIP', 'START_DEFENSE', 'SEND_FLEET', 'ABANDON_PLANET', 'COLONIZE', 'SCRAP_SHIPS', 'SCRAP_DEFENSES', 'RETROFIT_FLEET', 'RETROFIT_DEFENSES', 'BUILD_MOON_BUILDING', 'JUMP_GATE_TRANSFER', 'BUILD_MISSILE', 'LAUNCH_MISSILE', 'SAVE_BLUEPRINT', 'DELETE_BLUEPRINT', 'BUILD_CUSTOM_SHIP', 'CANCEL_CUSTOM_SHIP_QUEUE', 'CANCEL_SHIP_QUEUE', 'CANCEL_DEFENSE_QUEUE', 'CANCEL_BUILD_QUEUE', 'CANCEL_RESEARCH_QUEUE', 'CANCEL_MISSION', 'REQUEST_REINFORCEMENTS', 'DEPLOY_PATROL', 'RECALL_PATROL', 'REINFORCE_PATROL', 'DIPLOMACY_TRADE', 'DIPLOMACY_TRIBUTE', 'DIPLOMACY_TREATY', 'DIPLOMACY_DECLARE_WAR', 'DIPLOMACY_BUY_SHIP', 'COUNCIL_PROPOSE_RESOLUTION', 'COUNCIL_VOTE', 'FORM_FEDERATION', 'CONTRIBUTE_TO_FEDERAL_FLEET', 'SPEND_INFLUENCE', 'RESOLVE_CRISIS', 'RESOLVE_DECISION_EVENT'];

  let workingState = state;
  if (actionToLog.includes(action.type) && state.gameStarted) {
    const newEvent = { tick: state.gameTick, type: action.type, payload: action };
    workingState = {
      ...state,
      eventLog: [...(state.eventLog || []), newEvent].slice(-500)
    };
  }

  // Rutas de acciones de dominio
  switch (action.type) {
    // --- SYSTEM, LOAD, TICK ---
    case 'RESET_GAME':
    case 'LOAD':
    case 'TICK':
    case 'APPLY_TICK_STATE':
    case 'SET_TUTORIAL_COMPLETE':
    case 'DISMISS_VICTORY_OVERLAY':
    case 'SET_PLAYER_PROFILE':
    // --- GOBIERNO PLANETARIO (Senado Planetario / Planeta Vivo) ---
    case 'SET_PLANET_TAX_RATE':
    case 'TOGGLE_PLANET_LOCAL_DIRECTIVE':
    case 'SET_PLANET_GOVERNOR':
    case 'ASSIGN_LOCAL_MINISTRY_BUDGET':
    case 'TOGGLE_LOCAL_MINISTERIAL_SUBTASK':
      return systemReducer(workingState, action);

    // --- ECONOMY ---
    case 'SET_PLANET':
    case 'RENAME_PLANET':
    case 'PLANET_SPECIALIZE':
    case 'PLANET_TOGGLE_AUTOTRADE':
    case 'START_BUILDING':
    // --- MERCADO GALACTICO / DAO / BAZAR / MERCADO NEGRO ---
    case 'MARKET_TRADE':
    case 'MARKET_BUY_USED_SHIPS':
    case 'MARKET_SELL_SHIPS':
    case 'MARKET_SCRAP_SHIPS':
    case 'MARKET_BUY_BLACK_MARKET':
    case 'MARKET_BUY_BLUEPRINT':
    case 'CLAIM_DAO_DIVIDENDS':
    case 'CREATE_LIMIT_ORDER':
    case 'CANCEL_LIMIT_ORDER':
    case 'MODIFY_SPOT_ORDER':
    case 'DISPATCH_SPOT_ARBITRAGE':
    case 'CONTRIBUTE_EXCHANGE_PROJECT':
    case 'CONTRIBUTE_ALL_EXCHANGE_PROJECT':
    case 'FINALIZE_EXCHANGE_PROJECT':
    case 'ESTABLISH_BILATERAL_ROUTE':
    case 'CANCEL_BILATERAL_ROUTE':
    // --- RED DE COLONIAS ---
    case 'EQUALIZE_COLONY_RESOURCES':
    case 'RELOCATE_COLONY_FLEET':
    case 'START_PLANET_TERRAFORMING':
      return economyReducer(workingState, action);

    // --- RESEARCH ---
    case 'START_RESEARCH':
    case 'TOGGLE_RESEARCH_NODE_LINK':
    case 'UPGRADE_RESEARCH_NETWORK_SLOT':
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
    case 'RETROFIT_SHIP_VARIANT':
    case 'RETROFIT_DEFENSE_VARIANT':
    case 'CANCEL_RETROFIT_QUEUE':
    case 'BUILD_MOON_BUILDING':
    // Alias historico: MoonPage despachaba START_MOON_BUILDING.
    // Se enruta al mismo handler para no romper partidas existentes.
    case 'START_MOON_BUILDING':
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
    case 'DEPLOY_PATROL':
    case 'RECALL_PATROL':
    case 'REINFORCE_PATROL':
    case 'INTERCEPT_INVASION':
    // --- RUTAS DE SUMINISTRO ---
    case 'ADD_TRADE_ROUTE':
    case 'ADD_PATRICIAN_TRADE_ROUTE':
    case 'REMOVE_TRADE_ROUTE':
    case 'TOGGLE_TRADE_ROUTE':
    case 'PROCESS_TRADE_ROUTES':
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
    case 'DISMISS_TACTICAL_EVENT':
    case 'DISMISS_ALL_TACTICAL_EVENTS':
    case 'MARK_TACTICAL_EVENT_READ':
    case 'MARK_ALL_TACTICAL_EVENTS_READ':
    case 'CLEAR_READ_TACTICAL_EVENTS':
    case 'RESOLVE_DECISION_EVENT':
    case 'RESOLVE_NARRATIVE_EVENT':
    case 'MINISTRY_PROJECT':
    case 'APPEND_TACTICAL_EVENT_LOG':
    case 'DISMISS_ULTIMATUM':
      return eventReducer(workingState, action);

    // --- GOVERNMENT / CHAT ---
    case 'ADD_CHAT_MESSAGE':
    case 'UPDATE_MINISTRY_POLICY':
    case 'APPOINT_MINISTER':
    case 'TOGGLE_MINISTRY_DIRECTIVE':
    case 'TOGGLE_MINISTRY_AUTOMATION':
    case 'SET_MINISTRY_AUTOMATION':
    case 'SET_MINISTRY_DOCTRINE':
    case 'SET_MINISTRY_STATE':
    case 'BUY_CIVIL_BUSINESS':
    case 'SET_PLANET_GOVERNOR_DIRECTIVE_MODE':
    case 'SET_PLANET_AUTO_GOVERNANCE':
    case 'SET_EMPEROR_DIRECTIVE_MODE':
    case 'SET_EMPEROR_AUTO_GOVERNANCE':
    case 'SET_BUILDING_MODE':
    case 'TOGGLE_AUTOMATION_RESTRICTION':
    // --- INTERIORES DE EDIFICIO (consola operativa) ---
    case 'EXECUTE_BUILDING_ACTION':
      return governmentReducer(workingState, action);

    // --- IMPERIAL COUNCIL & SENATE (10+ PLANETS) ---
    case 'APPOINT_IMPERIAL_MINISTER':
    case 'VOTE_SENATE_BILL':
    case 'RESOLVE_COLONY_DEMAND':
      return councilReducer(workingState, action);

    // --- SECTORS & VICEROYS ---
    case 'CREATE_SECTOR':
    case 'ASSIGN_PLANET_TO_SECTOR':
    case 'APPOINT_VICEROY':
    case 'SET_SECTOR_DOCTRINE':
    case 'DELETE_SECTOR':
      return sectorReducer(workingState, action);

    default:
      return state; // Retornar el state original e inmutable si la acción no coincide
  }
};
