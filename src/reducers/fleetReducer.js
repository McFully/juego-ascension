import { handleBuildMissile, handleLaunchMissile } from './fleet/missileReducer.js';
import {
  handleSaveBlueprint, handleDeleteBlueprint, handleBuildCustomShip, handleCancelCustomShipQueue
} from './fleet/blueprintReducer.js';
import {
  handleSaveFleetPreset, handleDeleteFleetPreset, handleAddTradeRoute,
  handleRemoveTradeRoute, handleToggleTradeRoute, handleProcessTradeRoutes
} from './fleet/tradeRouteReducer.js';
import { handleBuildMoonBuilding, handleJumpGateTransfer } from './fleet/moonReducer.js';
import { handleAbandonPlanet, handleScrapShips, handleScrapDefenses, handleColonize } from './fleet/colonyReducer.js';
import { handleStartShip, handleStartDefense } from './fleet/shipProductionActions.js';
import { handleSendFleet } from './fleet/fleetMissionActions.js';
import {
  handleRetrofitFleet,
  handleRetrofitDefenses,
  handleRetrofitShipVariant,
  handleRetrofitDefenseVariant,
  handleCancelRetrofitQueue
} from './fleet/retrofitActions.js';
import { handleDeployPatrol, handleRecallPatrol, handleReinforcePatrol, handleInterceptInvasion } from './fleet/patrolActions.js';
import {
  handleCancelBuildQueue,
  handleCancelResearchQueue,
  handleCancelShipQueue,
  handleCancelDefenseQueue
} from './fleet/queueCancelActions.js';
import {
  handleCancelMission,
  handleRequestReinforcements,
  handleStartMission,
  handleCompleteMission,
  handleAddPatricianTradeRoute
} from './fleet/playerMissionActions.js';

export const fleetReducer = (state, action) => {
  const getCurrentPlanet = () => state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];

  switch (action.type) {
    // === PATRULLAS E INTERCEPTACIONES ===
    case 'DEPLOY_PATROL':
      return handleDeployPatrol(state, action);
    case 'RECALL_PATROL':
      return handleRecallPatrol(state, action);
    case 'REINFORCE_PATROL':
      return handleReinforcePatrol(state, action);
    case 'INTERCEPT_INVASION':
      return handleInterceptInvasion(state, action);

    // === PRODUCCIÓN NAVAL Y DEFENSIVA ===
    case 'START_SHIP':
      return handleStartShip(state, action);
    case 'START_DEFENSE':
      return handleStartDefense(state, action);
    case 'SCRAP_SHIPS':
      return handleScrapShips(state, action);
    case 'SCRAP_DEFENSES':
      return handleScrapDefenses(state, action);

    // === EXPEDICIONES Y MOVIMIENTOS ===
    case 'SEND_FLEET':
      return handleSendFleet(state, action);
    case 'CANCEL_MISSION':
      return handleCancelMission(state, action);
    case 'REQUEST_REINFORCEMENTS':
      return handleRequestReinforcements(state, action);
    case 'COLONIZE':
      return handleColonize(state, action);
    case 'ABANDON_PLANET':
      return handleAbandonPlanet(state, action);

    // === RETROFIT / MODERNIZACIÓN ===
    case 'RETROFIT_FLEET':
      return handleRetrofitFleet(state, action);
    case 'RETROFIT_DEFENSES':
      return handleRetrofitDefenses(state, action);
    case 'RETROFIT_SHIP_VARIANT':
      return handleRetrofitShipVariant(state, action);
    case 'RETROFIT_DEFENSE_VARIANT':
      return handleRetrofitDefenseVariant(state, action);
    case 'CANCEL_RETROFIT_QUEUE':
      return handleCancelRetrofitQueue(state, action);

    // === BASE LUNAR Y SALTO ===
    case 'BUILD_MOON_BUILDING':
    case 'START_MOON_BUILDING':
      return handleBuildMoonBuilding(state, action);
    case 'JUMP_GATE_TRANSFER':
      return handleJumpGateTransfer(state, action);

    // === SILO DE MISILES ===
    case 'BUILD_MISSILE':
      return handleBuildMissile(state, action);
    case 'LAUNCH_MISSILE':
      return handleLaunchMissile(state, action);

    // === PATENTES Y NAVES CUSTOM ===
    case 'SAVE_BLUEPRINT':
      return handleSaveBlueprint(state, action);
    case 'DELETE_BLUEPRINT':
      return handleDeleteBlueprint(state, action);
    case 'BUILD_CUSTOM_SHIP':
      return handleBuildCustomShip(state, action);
    case 'CANCEL_CUSTOM_SHIP_QUEUE':
      return handleCancelCustomShipQueue(state, action);

    // === CANCELACIONES DE COLAS ===
    case 'CANCEL_BUILD_QUEUE':
      return handleCancelBuildQueue(state, action);
    case 'CANCEL_RESEARCH_QUEUE':
      return handleCancelResearchQueue(state, action);
    case 'CANCEL_SHIP_QUEUE':
      return handleCancelShipQueue(state, action);
    case 'CANCEL_DEFENSE_QUEUE':
      return handleCancelDefenseQueue(state, action);

    // === MISIONES DE CAMPAÑA ===
    case 'START_MISSION':
      return handleStartMission(state, action);
    case 'COMPLETE_MISSION':
      return handleCompleteMission(state, action, getCurrentPlanet);

    // === PRESETS Y RUTAS COMERCIALES ===
    case 'SAVE_FLEET_PRESET':
      return handleSaveFleetPreset(state, action);
    case 'DELETE_FLEET_PRESET':
      return handleDeleteFleetPreset(state, action);
    case 'ADD_TRADE_ROUTE':
      return handleAddTradeRoute(state, action);
    case 'ADD_PATRICIAN_TRADE_ROUTE':
      return handleAddPatricianTradeRoute(state, action);
    case 'REMOVE_TRADE_ROUTE':
      return handleRemoveTradeRoute(state, action);
    case 'TOGGLE_TRADE_ROUTE':
      return handleToggleTradeRoute(state, action);
    case 'PROCESS_TRADE_ROUTES':
      return handleProcessTradeRoutes(state, action);

    default:
      return state;
  }
};
