import {
  handleAddChatMessage,
  handleUpdateMinistryPolicy,
  handleAppointMinister,
  handleToggleMinistryDirective,
  handleSetMinistryAutomation,
  handleToggleMinistryAutomation,
  handleSetMinistryState,
  handleSetMinistryDoctrine
} from './government/ministryActions.js';
import {
  handleBuyCivilBusiness,
  handleSetPlanetGovernorDirectiveMode,
  handleSetPlanetAutoGovernance,
  handleSetEmperorDirectiveMode,
  handleSetEmperorAutoGovernance
} from './government/governorActions.js';
import {
  handleSetBuildingMode,
  handleToggleAutomationRestriction,
  handleExecuteBuildingAction
} from './government/buildingModeActions.js';

export const governmentReducer = (state, action) => {
  switch (action.type) {
    // === COMUNICACIONES / CHAT ===
    case 'ADD_CHAT_MESSAGE':
      return handleAddChatMessage(state, action);

    // === POLÍTICAS Y DIRECTIVAS MINISTERIALES ===
    case 'UPDATE_MINISTRY_POLICY':
      return handleUpdateMinistryPolicy(state, action);
    case 'APPOINT_MINISTER':
      return handleAppointMinister(state, action);
    case 'TOGGLE_MINISTRY_DIRECTIVE':
      return handleToggleMinistryDirective(state, action);
    case 'SET_MINISTRY_AUTOMATION':
      return handleSetMinistryAutomation(state, action);
    case 'TOGGLE_MINISTRY_AUTOMATION':
      return handleToggleMinistryAutomation(state, action);
    case 'SET_MINISTRY_STATE':
      return handleSetMinistryState(state, action);
    case 'SET_MINISTRY_DOCTRINE':
      return handleSetMinistryDoctrine(state, action);

    // === GOBERNACIÓN Y NEGOCIOS CIVILES ===
    case 'BUY_CIVIL_BUSINESS':
      return handleBuyCivilBusiness(state, action);
    case 'SET_PLANET_GOVERNOR_DIRECTIVE_MODE':
      return handleSetPlanetGovernorDirectiveMode(state, action);
    case 'SET_PLANET_AUTO_GOVERNANCE':
      return handleSetPlanetAutoGovernance(state, action);
    case 'SET_EMPEROR_DIRECTIVE_MODE':
      return handleSetEmperorDirectiveMode(state, action);
    case 'SET_EMPEROR_AUTO_GOVERNANCE':
      return handleSetEmperorAutoGovernance(state, action);

    // === MODOS DE EDIFICIOS Y PROTOCOLOS ===
    case 'SET_BUILDING_MODE':
      return handleSetBuildingMode(state, action);
    case 'TOGGLE_AUTOMATION_RESTRICTION':
      return handleToggleAutomationRestriction(state, action);
    case 'EXECUTE_BUILDING_ACTION':
      return handleExecuteBuildingAction(state, action);

    default:
      return state;
  }
};
