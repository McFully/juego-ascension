import { handleStartBuilding } from './economy/buildActions.js';
import {
  handleClaimDaoDividends,
  handleCreateLimitOrder,
  handleCancelLimitOrder,
  handleModifySpotOrder,
  handleContributeExchangeProject,
  handleContributeAllExchangeProject,
  handleFinalizeExchangeProject,
  handleDispatchSpotArbitrage,
  handleVoteDaoProposal,
  handleTradeLonjaShares,
  handleDepositToVault,
  handleContractFreight
} from './economy/exchangeActions.js';
import {
  handleBankDeposit,
  handleBankWithdraw,
  handleBankSetRate,
  handleBankProcessLiquidation,
  handlePlanetaryBankDeposit,
  handlePlanetaryBankWithdraw,
  handleTransferToGalacticBank
} from './economy/bankActions.js';
import {
  handleMarketTrade,
  handleMarketBuyUsedShips,
  handleMarketScrapShips,
  handleMarketBuyBlackMarket,
  handleMarketSellShips,
  handleMarketBuyBlueprint
} from './economy/marketActions.js';
import {
  handleSetPlanet,
  handleRenamePlanet,
  handlePlanetSpecialize,
  handlePlanetToggleAutotrade,
  handleSetPlanetTaxRate,
  handleEqualizeColonyResources,
  handleRelocateColonyFleet,
  handleStartPlanetTerraforming,
  handleEstablishBilateralRoute,
  handleCancelBilateralRoute,
  handleApplyOfflineProgress
} from './economy/planetActions.js';
// Delegación modular: START_BUILDING usa calcEffectiveBuildTime({ cost, planet, state, speed }) en buildActions.js
export const economyReducer = (state, action) => {
  const getCurrentPlanet = () => state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];

  switch (action.type) {
    // === LONJA / EXCHANGE DAO ===
    case 'CLAIM_DAO_DIVIDENDS':
      return handleClaimDaoDividends(state, action);
    case 'CREATE_LIMIT_ORDER':
      return handleCreateLimitOrder(state, action);
    case 'CANCEL_LIMIT_ORDER':
      return handleCancelLimitOrder(state, action);
    case 'MODIFY_SPOT_ORDER':
      return handleModifySpotOrder(state, action);
    case 'DISPATCH_SPOT_ARBITRAGE':
      return handleDispatchSpotArbitrage(state, action);
    case 'CONTRIBUTE_EXCHANGE_PROJECT':
      return handleContributeExchangeProject(state, action);
    case 'CONTRIBUTE_ALL_EXCHANGE_PROJECT':
      return handleContributeAllExchangeProject(state, action);
    case 'FINALIZE_EXCHANGE_PROJECT':
      return handleFinalizeExchangeProject(state, action);
    case 'VOTE_DAO_PROPOSAL':
      return handleVoteDaoProposal(state, action);
    case 'TRADE_LONJA_SHARES':
      return handleTradeLonjaShares(state, action);
    case 'DEPOSIT_TO_VAULT':
      return handleDepositToVault(state, action);
    case 'CONTRACT_FREIGHT':
      return handleContractFreight(state, action);

    // === BANCA GALÁCTICA (X-WARS MODEL) ===
    case 'BANK_DEPOSIT':
      return handleBankDeposit(state, action);
    case 'BANK_WITHDRAW':
      return handleBankWithdraw(state, action);
    case 'BANK_SET_INTEREST_RATE':
      return handleBankSetRate(state, action);
    case 'BANK_PROCESS_LIQUIDATION':
      return handleBankProcessLiquidation(state, action);

    // === BANCA PLANETARIA LOCAL ===
    case 'PLANETARY_BANK_DEPOSIT':
      return handlePlanetaryBankDeposit(state, action);
    case 'PLANETARY_BANK_WITHDRAW':
      return handlePlanetaryBankWithdraw(state, action);
    case 'TRANSFER_TO_GALACTIC_BANK':
      return handleTransferToGalacticBank(state, action);

    // === GESTIÓN DE PLANETAS Y COLONIAS ===
    case 'SET_PLANET':
      return handleSetPlanet(state, action);
    case 'RENAME_PLANET':
      return handleRenamePlanet(state, action);
    case 'PLANET_SPECIALIZE':
      return handlePlanetSpecialize(state, action);
    case 'PLANET_TOGGLE_AUTOTRADE':
      return handlePlanetToggleAutotrade(state, action);
    case 'SET_PLANET_TAX_RATE':
      return handleSetPlanetTaxRate(state, action);
    case 'EQUALIZE_COLONY_RESOURCES':
      return handleEqualizeColonyResources(state, action);
    case 'RELOCATE_COLONY_FLEET':
      return handleRelocateColonyFleet(state, action);
    case 'START_PLANET_TERRAFORMING':
      return handleStartPlanetTerraforming(state, action);
    case 'ESTABLISH_BILATERAL_ROUTE':
      return handleEstablishBilateralRoute(state, action);
    case 'CANCEL_BILATERAL_ROUTE':
      return handleCancelBilateralRoute(state, action);
    case 'APPLY_OFFLINE_PROGRESS':
      return handleApplyOfflineProgress(state, action);

    // === CONSTRUCCIÓN ===
    case 'START_BUILDING':
      return handleStartBuilding(state, action, getCurrentPlanet);

    // === MERCADO Y FLOTA USADA ===
    case 'MARKET_TRADE':
      return handleMarketTrade(state, action, getCurrentPlanet);
    case 'MARKET_BUY_USED_SHIPS':
      return handleMarketBuyUsedShips(state, action, getCurrentPlanet);
    case 'MARKET_SCRAP_SHIPS':
      return handleMarketScrapShips(state, action, getCurrentPlanet);
    case 'MARKET_BUY_BLACK_MARKET':
      return handleMarketBuyBlackMarket(state, action, getCurrentPlanet);
    case 'MARKET_SELL_SHIPS':
      return handleMarketSellShips(state, action, getCurrentPlanet);
    case 'MARKET_BUY_BLUEPRINT':
      return handleMarketBuyBlueprint(state, action);

    default:
      return state;
  }
};
