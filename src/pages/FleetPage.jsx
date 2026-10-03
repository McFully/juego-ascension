import React, { useState } from "react";
import { getDefenseStats } from "../core.jsx";
import { CombatSimulatorModal } from "../components/fleet/CombatSimulatorModal";
import { FleetSelectionList } from "../components/fleet/FleetSelectionList";
import { IncomingInvasionsAlert } from "../components/fleet/IncomingInvasionsAlert.jsx";
import { MissionConfigPanel } from "../components/fleet/MissionConfigPanel.jsx";
import { TradeRoutesSection } from "../components/fleet/TradeRoutesSection.jsx";
import { SpyReportsSection } from "../components/fleet/SpyReportsSection.jsx";
import { DestinationSelectorSection } from "../components/fleet/DestinationSelectorSection.jsx";
import { FleetInventorySection } from "../components/fleet/FleetInventorySection.jsx";
import { PatrolControlSection } from "../components/fleet/PatrolControlSection.jsx";
import { ActionCardTile } from "../components/ui/ActionCardTile.jsx";
import { useNavigation } from "../components/navigation/NavigationContext.jsx";
import { SubsystemTopBanner } from "../components/navigation/SubsystemTopBanner.jsx";
import { SafeImg } from "../assets.jsx";
import { useCombatPredictions } from "../hooks/useCombatPredictions.js";
import { ImperialRegistryModal } from "../components/fleet/ImperialRegistryModal.jsx";
import { InFlightMissionsSection } from "../components/fleet/InFlightMissionsSection.jsx";
import { filterAvailableFleet } from "../utils/fleetClassification.js";
import { FleetDispatchView } from "../components/fleet/views/FleetDispatchView.jsx";
import { FleetHubCardGrid } from "../components/fleet/views/FleetHubCardGrid.jsx";
import { FleetRelocationView } from "../components/colonyNetwork/FleetRelocationView.jsx";

const FleetPage = ({ state, dispatch, currentPlanet, production, selectedTarget, setSelectedTarget, SHIPS, DEFENSES, BUILDINGS, SHIP_CHASSIS, S, ProgressBar, fmt, fmtTime, getEffectiveTech, simulateCombat, getShipStats, calcCustomShipStats, setActiveTab, onOpenCodex }) => {
  const { navigateTo, navigateBack } = useNavigation();
  // Estado de vista del Hangar:
  // 'menu' (pantalla principal con tarjetas de botón) | 'inventory' | 'in_flight' | 'trade_routes' | 'dispatch' | 'spy_reports'
  const [activeCardView, setActiveCardView] = useState(() => selectedTarget ? 'dispatch' : 'menu');

  const [selectedShips, setSelectedShips] = useState({});
  const [missionType, setMissionType] = useState(() => {
    if (selectedTarget && !selectedTarget.occupied) return "colonize";
    if (selectedTarget && selectedTarget.occupied && !selectedTarget.isAI) return "transport";
    return "attack";
  });
  const [missionSpeed, setMissionSpeed] = useState(10);
  const [transportRes, setTransportRes] = useState({ metal: 0, crystal: 0, deuterium: 0 });
  const [autoRetreat, setAutoRetreat] = useState(false);
  const [formation, setFormation] = useState("standard");
  const [filter, setFilter] = useState("all");
  const [showRegistryModal, setShowRegistryModal] = useState(false);
  const [relocateToPlanetId, setRelocateToPlanetId] = useState(() => {
    return state.planets.find(p => p.id !== currentPlanet.id)?.id || currentPlanet.id;
  });
  const [selectedShipsToRelocate, setSelectedShipsToRelocate] = useState({});
  const [simResult, setSimResult] = useState(null);

  const handleExecuteRelocationInFleet = () => {
    if (currentPlanet.id === relocateToPlanetId) return;
    if (Object.values(selectedShipsToRelocate).reduce((a, b) => a + b, 0) <= 0) return;

    dispatch({
      type: 'RELOCATE_COLONY_FLEET',
      fromPlanetId: currentPlanet.id,
      toPlanetId: relocateToPlanetId,
      ships: selectedShipsToRelocate
    });
    setSelectedShipsToRelocate({});
    if (window.playSfx) window.playSfx('fleetLaunch');
    setActiveCardView('inventory');
  };

  const target = selectedTarget;

  React.useEffect(() => {
    if (selectedTarget) {
      setActiveCardView('dispatch');
      if (!selectedTarget.occupied) setMissionType("colonize");
      else if (!selectedTarget.isAI) setMissionType("transport");
      else setMissionType("attack");
    }
  }, [selectedTarget]);

  const toggleShip = (id, delta) => {
    setSelectedShips(prev => {
      const current = prev[id] || 0;
      const maxQty = currentPlanet.fleet[id] || 0;
      const next = Math.max(0, Math.min(maxQty, current + delta));
      if (next <= 0) { const r = { ...prev }; delete r[id]; return r; }
      return { ...prev, [id]: next };
    });
  };

  const sendFleet = () => {
    if (!target) return;
    const fleet = Object.fromEntries(Object.entries(selectedShips).filter(([, v]) => v > 0));
    if (Object.keys(fleet).length === 0) return;

    dispatch({
      type: "SEND_FLEET",
      fromId: currentPlanet.id,
      to: target,
      fleet,
      missionType,
      missionSpeed,
      resources: missionType === "transport" ? transportRes : null,
      autoRetreat,
      formation,
    });
    setSelectedShips({});
    setTransportRes({ metal: 0, crystal: 0, deuterium: 0 });
    setSelectedTarget(null);
    setActiveCardView('in_flight');
  };

  const handleSimulate = () => {
    if (!target || Object.keys(selectedShips).length === 0) return;

    let targetPlanet, targetAI;
    if (target.isAI) {
      targetAI = state.aiPlanets.find(p => p.galaxy === target.galaxy && p.system === target.system && p.position === target.position);
    } else {
      targetPlanet = state.planets.find(p => p.galaxy === target.galaxy && p.system === target.system && p.position === target.position);
    }

    const defFleet = targetAI ? targetAI.fleet : (targetPlanet?.fleet || {});
    const defDefenses = targetAI ? targetAI.defenses : (targetPlanet?.defenses || {});
    const defTech = targetAI ? (targetAI.research || {}) : getEffectiveTech(targetPlanet, state.research);

    let result;
    try {
      result = simulateCombat(selectedShips, defFleet, defDefenses, state.research, defTech, 6, state.blueprints, "human", targetAI ? (targetAI.faction || "human") : "human", autoRetreat);
    } catch (e) {
      console.error("[Ascensión] simulateCombat error:", e);
      if (window.electronAPI && window.electronAPI.logError) {
        window.electronAPI.logError(`simulateCombat failed: ${e?.message || e}`, e?.stack || "", `player=${state.playerName} ships=${Object.keys(selectedShips).length}`);
      }
      result = { error: true, message: "Error en simulación de combate" };
    }
    setSimResult(result);
  };

  const availableShips = filterAvailableFleet(currentPlanet.fleet || {}, filter, SHIPS);

  const shipDisplayName = (id) => {
    if (id.startsWith("custom_")) {
      const bp = state.blueprints.find(b => id === "custom_" + b.id);
      return bp ? bp.name : "Nave Personalizada";
    }
    return SHIPS[id]?.name || id;
  };

  const shipDisplayIcon = (id) => {
    if (id.startsWith("custom_")) {
      const bp = state.blueprints.find(b => id === "custom_" + b.id);
      return bp ? (SHIP_CHASSIS[bp.chassis]?.icon || "🔧") : "🔧";
    }
    return SHIPS[id]?.icon || "🚀";
  };

  const shipStats = (id) => {
    const tech = state.research || {};
    if (id.startsWith("custom_")) {
      const bp = state.blueprints.find(b => id === "custom_" + b.id);
      if (!bp) return null;
      const cs = calcCustomShipStats(bp);
      const hull = cs.hull * (1 + (tech.armour || 0) * 0.08);
      const shd = cs.shd * (1 + (tech.shields || 0) * 0.1);
      const atk = cs.atk * (1 + (tech.weapons || 0) * 0.1);
      return { ...cs, hull, shd, atk, speed: cs.speed };
    }
    return getShipStats(id, tech, state.blueprints, "human", currentPlanet.buildings) || SHIPS[id];
  };

  const simDefTech = (() => {
    if (!target) return {};
    if (target.isAI) {
      const ai = state.aiPlanets.find(p => p.galaxy === target.galaxy && p.system === target.system && p.position === target.position);
      return ai?.research || {};
    }
    const tp = state.planets.find(p => p.galaxy === target.galaxy && p.system === target.system && p.position === target.position);
    return getEffectiveTech(tp, state.research);
  })();

  const incomingAttacks = state.fleetMissions?.filter(m => m.isAI && m.type === "attack") || [];
  const playerActiveMissions = (state.fleetMissions || []).filter(m => !m.isAI);
  const totalShipsInHangar = Object.values(currentPlanet.fleet || {}).reduce((a, b) => a + b, 0);

  // Predicciones de combate modularizadas vía hook useCombatPredictions
  const attackPredictions = useCombatPredictions(state, incomingAttacks, simulateCombat, getEffectiveTech);


  return (
    <div className="space-y-5 view-enter">
      {/* DOM Superior Estandarizado (Recursos + Explorador + Misiones) con título Hangar de la Flota */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle={
          activeCardView === 'inventory' ? 'Inventario de la Flota' :
          activeCardView === 'in_flight' ? 'Flotas en Vuelo' :
          activeCardView === 'trade_routes' ? 'Rutas Comerciales' :
          activeCardView === 'dispatch' || activeCardView === 'destination' ? 'Despacho de Misión' :
          activeCardView === 'spy_reports' ? 'Informes de Espionaje' :
          activeCardView === 'patrols' ? 'Patrullas y Seguridad Orbital' :
          'Hangar de la Flota'
        }
        breadcrumbIcon="🛸"
        backButtonLabelTop="VOLVER A"
        backButtonLabelBottom={activeCardView === 'menu' ? 'Alto Mando' : 'Hangar de la Flota'}
        backButtonIcon={activeCardView === 'menu' ? '👑' : '🛸'}
        onBackToAltoMando={() => {
          if (activeCardView !== 'menu') {
            setActiveCardView('menu');
          } else {
            if (navigateBack) navigateBack();
            else if (navigateTo) navigateTo('government');
            else if (setActiveTab) setActiveTab('government');
          }
        }}
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
              <span className="text-slate-400">En vuelo:</span>
              <span className="font-bold text-cyan-300">{playerActiveMissions.length} misiones</span>
            </div>
            {incomingAttacks.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono">
                <span className="text-rose-300 animate-pulse">⚠️ {incomingAttacks.length} Alertas</span>
              </div>
            )}
          </div>
        }
      />

      {/* Alertas de Incursiones Enemigas */}
      {incomingAttacks.length > 0 && (
        <IncomingInvasionsAlert
          incomingAttacks={incomingAttacks}
          attackPredictions={attackPredictions}
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          fmtTime={fmtTime}
          ProgressBar={ProgressBar}
        />
      )}

      {/* ========================================================================= */}
      {/* VISTA PRINCIPAL: GRID DE TARJETAS DE BOTÓN DEL HANGAR */}
      {/* ========================================================================= */}
      {activeCardView === 'menu' && (
        <FleetHubCardGrid
          currentPlanet={currentPlanet}
          totalShipsInHangar={totalShipsInHangar}
          playerActiveMissions={playerActiveMissions}
          state={state}
          target={target}
          setActiveCardView={setActiveCardView}
          setShowRegistryModal={setShowRegistryModal}
          navigateBack={navigateBack}
          fmt={fmt}
        />
      )}

      {/* Modal de Inspección del Registro Naval Imperial */}
      <ImperialRegistryModal
        isOpen={showRegistryModal}
        onClose={() => setShowRegistryModal(false)}
        currentPlanet={currentPlanet}
      />

      {/* ========================================================================= */}
      {/* SUB-VISTA 1: INVENTARIO DE FLOTA */}
      {/* ========================================================================= */}
      {activeCardView === 'inventory' && (
        <div className="space-y-4">
          <FleetInventorySection
            currentPlanet={currentPlanet}
            state={state}
            dispatch={dispatch}
            SHIPS={SHIPS}
            shipDisplayIcon={shipDisplayIcon}
            shipDisplayName={shipDisplayName}
            shipStats={shipStats}
            fmt={fmt}
            fmtTime={fmtTime}
            ProgressBar={ProgressBar}
            S={S}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VISTA 2: FLOTAS EN VUELO */}
      {/* ========================================================================= */}
      {activeCardView === 'in_flight' && (
        <InFlightMissionsSection
          playerActiveMissions={playerActiveMissions}
          state={state}
          dispatch={dispatch}
          shipDisplayName={shipDisplayName}
          shipDisplayIcon={shipDisplayIcon}
          fmtTime={fmtTime}
        />
      )}

      {/* ========================================================================= */}
      {/* SUB-VISTA 3: RUTAS COMERCIALES AUTOMÁTICAS */}
      {/* ========================================================================= */}
      {activeCardView === 'trade_routes' && (
        <div className="space-y-4">
          <TradeRoutesSection
            state={state}
            currentPlanet={currentPlanet}
            dispatch={dispatch}
            SHIPS={SHIPS}
            S={S}
            fmt={fmt}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VISTA 4: DESPACHO TÁCTICO / DESTINO Y ASIGNACIÓN DE NAVES */}
      {/* ========================================================================= */}
      {activeCardView === 'dispatch' && (
        <FleetDispatchView
          target={target}
          setSelectedTarget={setSelectedTarget}
          currentPlanet={currentPlanet}
          state={state}
          dispatch={dispatch}
          selectedShips={selectedShips}
          setSelectedShips={setSelectedShips}
          filter={filter}
          setFilter={setFilter}
          availableShips={availableShips}
          shipDisplayIcon={shipDisplayIcon}
          shipDisplayName={shipDisplayName}
          shipStats={shipStats}
          toggleShip={toggleShip}
          missionType={missionType}
          setMissionType={setMissionType}
          missionSpeed={missionSpeed}
          setMissionSpeed={setMissionSpeed}
          transportRes={transportRes}
          setTransportRes={setTransportRes}
          autoRetreat={autoRetreat}
          setAutoRetreat={setAutoRetreat}
          formation={formation}
          setFormation={setFormation}
          handleSimulate={handleSimulate}
          sendFleet={sendFleet}
          fmt={fmt}
          S={S}
        />
      )}

      {/* ========================================================================= */}
      {/* SUB-VISTA 5: INFORMES DE ESPIONAJE */}
      {/* ========================================================================= */}
      {activeCardView === 'spy_reports' && (
        <div className="space-y-4">
          <SpyReportsSection
            spyReports={state.spyReports}
            BUILDINGS={BUILDINGS}
            SHIPS={SHIPS}
            DEFENSES={DEFENSES}
            fmt={fmt}
            S={S}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VISTA 6: PATRULLAS Y SEGURIDAD ORBITAL */}
      {/* ========================================================================= */}
      {activeCardView === 'patrols' && (
        <PatrolControlSection
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          SHIPS={SHIPS}
          fmt={fmt}
          fmtTime={fmtTime}
          S={S}
          onBack={() => setActiveCardView('menu')}
        />
      )}

      {/* ========================================================================= */}
      {/* SUB-VISTA 7: REUBICACIÓN Y TRASLADO DE NAVES ENTRE PLANETAS */}
      {/* ========================================================================= */}
      {activeCardView === 'relocate' && (
        <div className="space-y-4">
          <FleetRelocationView
            planets={state.planets}
            fromPlanetId={currentPlanet.id}
            setFromPlanetId={() => {}}
            toPlanetId={relocateToPlanetId}
            setToPlanetId={setRelocateToPlanetId}
            fromPlanet={currentPlanet}
            selectedShipsToMove={selectedShipsToRelocate}
            setSelectedShipsToMove={setSelectedShipsToRelocate}
            onExecuteRelocation={handleExecuteRelocationInFleet}
          />
        </div>
      )}

      {/* Modal del Simulador de Combate */}
      <CombatSimulatorModal
        simResult={simResult}
        setSimResult={setSimResult}
        state={state}
        target={target}
        simDefTech={simDefTech}
        SHIPS={SHIPS}
        DEFENSES={DEFENSES}
        ProgressBar={ProgressBar}
        fmt={fmt}
        S={S}
      />
    </div>
  );
};

export default FleetPage;
