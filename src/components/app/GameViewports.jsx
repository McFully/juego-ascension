import React, { Suspense, lazy } from "react";
import MissionsPage from "../../pages/MissionsPage";
import OverviewPage from "../../pages/OverviewPage";
import BuildingsPage from "../../pages/BuildingsPage";
import ShipyardPage from "../../pages/ShipyardPage";
import DefensePage from "../../pages/DefensePage";
import { GovernmentPage } from "../../pages/GovernmentPage.jsx";
import ImperialCommandPage from "../../pages/ImperialCommandPage.jsx";

const MissilesPage = lazy(() => import("../../pages/MissilesPage"));
const GalaxyPage = lazy(() => import("../../pages/GalaxyPage"));
const FleetPage = lazy(() => import("../../pages/FleetPage"));
const CombatPage = lazy(() => import("../../pages/CombatPage"));
const StatsPage = lazy(() => import("../../pages/StatsPage"));
const MoonPage = lazy(() => import("../../pages/MoonPage"));
const TechTreePage = lazy(() => import("../../pages/TechTreePage"));
const ShipDesignPage = lazy(() => import("../../pages/ShipDesignPage"));
const ReplayPage = lazy(() => import("../../pages/ReplayPage"));
const DiplomacyPage = lazy(() => import("../../pages/DiplomacyPage.jsx"));
const CommunicationsPage = lazy(() => import("../../pages/CommunicationsPage.jsx").then(m => ({ default: m.CommunicationsPage })));
const TelemetryPage = lazy(() => import("../../pages/TelemetryPage.jsx").then(m => ({ default: m.TelemetryPage })));
const GalacticMarketPage = lazy(() => import("../../pages/GalacticMarketPage.jsx").then(m => ({ default: m.GalacticMarketPage })));
const ColonyNetworkPage = lazy(() => import("../../pages/ColonyNetworkPage.jsx").then(m => ({ default: m.ColonyNetworkPage })));
const GalacticObservatoryPage = lazy(() => import("../../pages/GalacticObservatoryPage.jsx").then(m => ({ default: m.GalacticObservatoryPage })));
const ImperialWikiPage = lazy(() => import("../../pages/ImperialWikiPage.jsx"));
const SectorManagementView = lazy(() => import("../sectors/SectorManagementView.jsx").then(m => ({ default: m.SectorManagementView })));

export const GameViewports = ({
  activeTab,
  state,
  dispatch,
  currentPlanet,
  production,
  storage,
  MISSIONS,
  BUILDINGS,
  RESEARCH,
  SHIPS,
  DEFENSES,
  SHIP_CHASSIS,
  SHIP_WEAPONS,
  SHIP_ENGINES,
  SHIP_SHIELDS,
  SHIP_MODULES,
  MISSILES,
  MOON_BUILDINGS,
  FACTIONS,
  AI_STRATEGIES,
  S,
  QueueDisplay,
  ProgressBar,
  fmt,
  fmtTime,
  isOutdated,
  onOpenCodex,
  safeSetActiveTab,
  ItemCardWithCodex,
  buildingCost,
  calcBuildTime,
  meetsReq,
  buildingProdInfo,
  canAfford,
  GAME_SPEED,
  researchCost,
  calcResearchTime,
  researchEffectInfo,
  SafeImg,
  CardBanner,
  shipTimeBonus,
  shipCost,
  calcShipTime,
  getShipStats,
  constructionDiscount,
  defenseCost,
  calcDefenseTime,
  getDefenseStats,
  getEffectiveTech,
  selectedTarget,
  setSelectedTarget,
  simulateCombat,
  calcCustomShipStats,
  ACHIEVEMENTS,
  calcCustomShipCost,
  calcCustomShipTime,
  getGalacticAlignment,
  onOpenSettings,
  onReturnToMenu
}) => {
  return (
    <Suspense fallback={<div className="text-center text-slate-500 py-12">Cargando módulo...</div>}>
      {activeTab === "overview" && <OverviewPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} storage={storage} MISSIONS={MISSIONS} BUILDINGS={BUILDINGS} RESEARCH={RESEARCH} SHIPS={SHIPS} DEFENSES={DEFENSES} S={S} QueueDisplay={QueueDisplay} ProgressBar={ProgressBar} fmt={fmt} fmtTime={fmtTime} isOutdated={isOutdated} onOpenCodex={onOpenCodex} safeSetActiveTab={safeSetActiveTab} onOpenSettings={onOpenSettings} onReturnToMenu={onReturnToMenu} />}
      {activeTab === "missions" && <MissionsPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} setActiveTab={safeSetActiveTab} MISSIONS={MISSIONS} S={S} onOpenCodex={onOpenCodex} production={production} fmt={fmt} />}
      {activeTab === "buildings" && <BuildingsPage dispatch={dispatch} setActiveTab={safeSetActiveTab} safeSetActiveTab={safeSetActiveTab} currentPlanet={currentPlanet} state={state} production={production} fmt={fmt} />}
      {(activeTab === "research" || activeTab === "techTree") && (
        <TechTreePage
          state={state}
          currentPlanet={currentPlanet}
          production={production}
          fmt={fmt}
          RESEARCH={RESEARCH}
          S={S}
          meetsReq={meetsReq}
          onOpenCodex={onOpenCodex}
          safeSetActiveTab={safeSetActiveTab}
        />
      )}
      {activeTab === "shipyard" && <ShipyardPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} SHIPS={SHIPS} RESEARCH={RESEARCH} BUILDINGS={BUILDINGS} S={S} SafeImg={SafeImg} CardBanner={CardBanner} ProgressBar={ProgressBar} fmt={fmt} fmtTime={fmtTime} shipTimeBonus={shipTimeBonus} shipCost={shipCost} calcShipTime={calcShipTime} meetsReq={meetsReq} getShipStats={getShipStats} canAfford={canAfford} constructionDiscount={constructionDiscount} GAME_SPEED={GAME_SPEED} onOpenCodex={onOpenCodex} />}
      {activeTab === "defense" && <DefensePage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} DEFENSES={DEFENSES} MISSILES={MISSILES} RESEARCH={RESEARCH} S={S} SafeImg={SafeImg} CardBanner={CardBanner} ProgressBar={ProgressBar} fmt={fmt} fmtTime={fmtTime} shipTimeBonus={shipTimeBonus} defenseCost={defenseCost} calcDefenseTime={calcDefenseTime} meetsReq={meetsReq} getDefenseStats={getDefenseStats} getEffectiveTech={getEffectiveTech} canAfford={canAfford} constructionDiscount={constructionDiscount} GAME_SPEED={GAME_SPEED} onOpenCodex={onOpenCodex} />}
      {activeTab === "missiles" && <MissilesPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} MISSILES={MISSILES} S={S} fmt={fmt} canAfford={canAfford} constructionDiscount={constructionDiscount} onOpenCodex={onOpenCodex} meetsReq={meetsReq} RESEARCH={RESEARCH} />}
      {activeTab === "galaxy" && <GalaxyPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} setSelectedTarget={setSelectedTarget} setActiveTab={safeSetActiveTab} S={S} fmt={fmt} fmtTime={fmtTime} onOpenCodex={onOpenCodex} />}
      {activeTab === "fleet" && <FleetPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} selectedTarget={selectedTarget} setSelectedTarget={setSelectedTarget} SHIPS={SHIPS} DEFENSES={DEFENSES} BUILDINGS={BUILDINGS} SHIP_CHASSIS={SHIP_CHASSIS} S={S} ProgressBar={ProgressBar} fmt={fmt} fmtTime={fmtTime} getEffectiveTech={getEffectiveTech} simulateCombat={simulateCombat} getShipStats={getShipStats} calcCustomShipStats={calcCustomShipStats} onOpenCodex={onOpenCodex} />}
      {activeTab === "combat" && <CombatPage state={state} currentPlanet={currentPlanet} production={production} SHIPS={SHIPS} DEFENSES={DEFENSES} S={S} ProgressBar={ProgressBar} fmt={fmt} onOpenCodex={onOpenCodex} />}
      {activeTab === "stats" && <StatsPage state={state} currentPlanet={currentPlanet} production={production} ACHIEVEMENTS={ACHIEVEMENTS} SHIPS={SHIPS} DEFENSES={DEFENSES} S={S} fmt={fmt} fmtTime={fmtTime} onOpenCodex={onOpenCodex} />}
      {activeTab === "wiki" && <ImperialWikiPage state={state} currentPlanet={currentPlanet} production={production} fmt={fmt} />}
      {activeTab === "moon" && <MoonPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} MOON_BUILDINGS={MOON_BUILDINGS} S={S} fmt={fmt} fmtTime={fmtTime} meetsReq={meetsReq} canAfford={canAfford} constructionDiscount={constructionDiscount} onOpenCodex={onOpenCodex} />}
      {activeTab === "shipDesign" && <ShipDesignPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} fmt={fmt} SHIP_CHASSIS={SHIP_CHASSIS} SHIP_WEAPONS={SHIP_WEAPONS} SHIP_ENGINES={SHIP_ENGINES} SHIP_SHIELDS={SHIP_SHIELDS} SHIP_MODULES={SHIP_MODULES} S={S} ProgressBar={ProgressBar} fmtTime={fmtTime} shipTimeBonus={shipTimeBonus} calcCustomShipStats={calcCustomShipStats} calcCustomShipCost={calcCustomShipCost} calcCustomShipTime={calcCustomShipTime} canAfford={canAfford} GAME_SPEED={GAME_SPEED} onOpenCodex={onOpenCodex} />}
      {activeTab === "communications" && <CommunicationsPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} fmt={fmt} S={S} onOpenCodex={onOpenCodex} setActiveTab={safeSetActiveTab} />}
      {activeTab === "telemetry" && <TelemetryPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} fmt={fmt} safeSetActiveTab={safeSetActiveTab} />}
      {activeTab === "market" && <GalacticMarketPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} fmt={fmt} S={S} onOpenCodex={onOpenCodex} setActiveTab={safeSetActiveTab} />}
      {activeTab === "colony_network" && <ColonyNetworkPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} fmt={fmt} S={S} onOpenCodex={onOpenCodex} setActiveTab={safeSetActiveTab} />}
      {activeTab === "sectors" && <SectorManagementView state={state} dispatch={dispatch} currentPlanet={currentPlanet} fmt={fmt} />}
      {activeTab === "galactic_observatory" && <GalacticObservatoryPage state={state} fmt={fmt} />}
      {(activeTab === "imperial_hub" || activeTab === "tactical_advisor" || activeTab === "imperial_council" || activeTab === "imperial_senate") && (
        <ImperialCommandPage
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          activeTab={activeTab}
          setActiveTab={safeSetActiveTab}
          production={production}
          RESEARCH={RESEARCH}
          fmt={fmt}
        />
      )}
      {(activeTab === "government" || activeTab === "government_ministries" || activeTab.startsWith("ministry_")) && (
        <GovernmentPage
          state={state}
          dispatch={dispatch}
          S={S}
          activeTab={activeTab}
          setActiveTab={safeSetActiveTab}
          onOpenCodex={onOpenCodex}
          BUILDINGS={BUILDINGS}
          RESEARCH={RESEARCH}
          ItemCard={ItemCardWithCodex}
          buildingCost={buildingCost}
          calcBuildTime={calcBuildTime}
          meetsReq={meetsReq}
          buildingProdInfo={buildingProdInfo}
          canAfford={canAfford}
          GAME_SPEED={GAME_SPEED}
          production={production}
          researchCost={researchCost}
          calcResearchTime={calcResearchTime}
          researchEffectInfo={researchEffectInfo}
        />
      )}
      {activeTab === "diplomacy" && <DiplomacyPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} SHIPS={SHIPS} FACTIONS={FACTIONS} AI_STRATEGIES={AI_STRATEGIES} S={S} fmt={fmt} getGalacticAlignment={getGalacticAlignment} onOpenCodex={onOpenCodex} setActiveTab={safeSetActiveTab} />}
      {activeTab === "replay" && <ReplayPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} fmt={fmt} S={S} setActiveTab={safeSetActiveTab} />}
    </Suspense>
  );
};
