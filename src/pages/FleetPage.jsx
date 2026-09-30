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

const FleetPage = ({ state, dispatch, currentPlanet, production, selectedTarget, setSelectedTarget, SHIPS, DEFENSES, BUILDINGS, SHIP_CHASSIS, S, ProgressBar, fmt, fmtTime, getEffectiveTech, simulateCombat, getShipStats, calcCustomShipStats }) => {
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
  const [simResult, setSimResult] = useState(null);
  const [showRegistryModal, setShowRegistryModal] = useState(false);

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

  const availableShips = Object.entries(currentPlanet.fleet || {}).filter(([id, q]) => {
    if (q <= 0) return false;
    if (filter === "all") return true;
    const isCombat = ["lightFighter", "heavyFighter", "cruiser", "battleship", "bomber", "destroyer", "deathstar"].includes(id) || id.startsWith("custom_");
    if (filter === "combat") return isCombat;
    if (filter === "civilian") return !isCombat;
    return true;
  });

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
          activeCardView === 'destination' ? 'Despacho de Misión' :
          activeCardView === 'spy_reports' ? 'Informes de Espionaje' :
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
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base md:text-lg font-black text-white font-mono tracking-wider uppercase flex items-center gap-2">
              <span>🛸</span>
              <span>Comando del Hangar de la Flota</span>
            </h2>
            <span className="text-xs font-mono text-cyan-400">
              {currentPlanet?.name || "Tierra"} — Dársenas Operativas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-stretch">
            {/* TARJETA 1: Inventario de la Flota en Tierra */}
            <button
              onClick={() => {
                setActiveCardView('inventory');
                if (window.playSfx) window.playSfx('click');
              }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-cyan-500/30 hover:border-cyan-400 bg-gradient-to-b from-[#0e1b38]/95 to-[#060a14] hover:shadow-[0_0_35px_rgba(6,182,212,0.35)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
            >
              <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
                <SafeImg id="battleship" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-500/50">
                  DÁRSENAS
                </span>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                    Inventario de Flota
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                    Naves en {currentPlanet?.name || 'Tierra'}, unidades en el espacio exterior y destruidas.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-cyan-300">
                  <span>{fmt(totalShipsInHangar)} naves</span>
                  <span>➔</span>
                </div>
              </div>
            </button>

            {/* TARJETA 2: Flotas en Vuelo */}
            <button
              onClick={() => {
                setActiveCardView('in_flight');
                if (window.playSfx) window.playSfx('click');
              }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-blue-500/30 hover:border-blue-400 bg-gradient-to-b from-[#0d1836]/95 to-[#060914] hover:shadow-[0_0_35px_rgba(59,130,246,0.35)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
            >
              <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
                <SafeImg id="cruiser" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-blue-950/80 text-blue-300 border border-blue-500/50">
                  TRÁNSITO
                </span>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-blue-300 transition-colors">
                    Flotas en Vuelo
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                    Monitoreo en tiempo real de misiones en tránsito y vectores de retorno.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-blue-300">
                  <span>{playerActiveMissions.length} misiones</span>
                  <span>➔</span>
                </div>
              </div>
            </button>

            {/* TARJETA 3: Rutas Comerciales Automáticas */}
            <button
              onClick={() => {
                setActiveCardView('trade_routes');
                if (window.playSfx) window.playSfx('click');
              }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-amber-500/30 hover:border-amber-400 bg-gradient-to-b from-[#24170c]/95 to-[#0a0705] hover:shadow-[0_0_35px_rgba(245,158,11,0.35)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
            >
              <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
                <SafeImg id="largeCargo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-500/50">
                  LOGÍSTICA
                </span>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-amber-300 transition-colors">
                    Rutas Comerciales
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                    Fletes automáticos de punto a punto, intercambios recíprocos y bucles.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-amber-300">
                  <span>{(state.tradeRoutes || []).length} rutas</span>
                  <span>➔</span>
                </div>
              </div>
            </button>

            {/* TARJETA 4: Despacho Táctico / Destino */}
            <button
              onClick={() => {
                setActiveCardView('dispatch');
                if (window.playSfx) window.playSfx('click');
              }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-emerald-500/30 hover:border-emerald-400 bg-gradient-to-b from-[#0c221a]/95 to-[#050e0a] hover:shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
            >
              <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
                <SafeImg id="destroyer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                  MISIÓN
                </span>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-emerald-300 transition-colors">
                    Despacho Táctico
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                    Asignación de flotas para ataque, transporte o colonización hacia coordenadas.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-emerald-300">
                  <span>{target ? "Destino Fijado" : "Configurar"}</span>
                  <span>➔</span>
                </div>
              </div>
            </button>

            {/* TARJETA 5: Informes de Espionaje */}
            <button
              onClick={() => {
                setActiveCardView('spy_reports');
                if (window.playSfx) window.playSfx('click');
              }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-purple-500/30 hover:border-purple-400 bg-gradient-to-b from-[#1c1033]/95 to-[#080512] hover:shadow-[0_0_35px_rgba(168,85,247,0.35)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
            >
              <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
                <SafeImg id="spyProbe" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-purple-950/80 text-purple-300 border border-purple-500/50">
                  INTELIGENCIA
                </span>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-purple-300 transition-colors">
                    Informes de Espionaje
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                    Telemetría de defensas y flotas enemigas recopiladas por sondas espía.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-purple-300">
                  <span>{(state.spyReports || []).length} informes</span>
                  <span>➔</span>
                </div>
              </div>
            </button>

            {/* TARJETA 6: Patrullas y Seguridad Orbital */}
            <button
              onClick={() => {
                setActiveCardView('patrols');
                if (window.playSfx) window.playSfx('click');
              }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-cyan-500/40 hover:border-cyan-300 bg-gradient-to-b from-[#0a233c]/95 to-[#040c17] hover:shadow-[0_0_35px_rgba(6,182,212,0.4)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
            >
              <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
                <SafeImg id="patrol_orbital" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-cyan-950/90 text-cyan-300 border border-cyan-400/60 shadow-lg">
                  DEFENSA
                </span>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                    Patrullas y Seguridad
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                    Escudo orbital activo y policía de sistema. Interceptación automática de hostiles.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-cyan-300">
                  <span>{(state.patrols || []).length} escuadrones</span>
                  <span>➔</span>
                </div>
              </div>
            </button>

            {/* TARJETA 7: Registro Naval Imperial (Matrículas y Cascos SQLite) */}
            <button
              onClick={() => {
                setShowRegistryModal(true);
                if (window.playSfx) window.playSfx('click');
              }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-amber-500/40 hover:border-amber-300 bg-gradient-to-b from-[#2b1e07]/95 to-[#0e0a02] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
            >
              <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10 flex items-center justify-center">
                <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🎖️</span>
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-950/90 text-amber-300 border border-amber-400/60 shadow-lg">
                  REGISTRO
                </span>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-amber-300 transition-colors">
                    Registro de Cascos
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                    Matrículas permanentes, astillero natal, bitácoras y condecoraciones de cada nave.
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-amber-300">
                  <span>Auditoría de Cascos</span>
                  <span>➔</span>
                </div>
              </div>
            </button>

            {/* TARJETA 8: Volver Atrás */}
            <ActionCardTile
              type="back"
              title="Volver Atrás"
              subtitle="Regresar a la pantalla anterior"
              badgeText="VOLVER"
              onClick={() => {
                if (navigateBack) navigateBack();
              }}
            />
          </div>
        </div>
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
        <div className="space-y-4">
          <DestinationSelectorSection
            target={target}
            setSelectedTarget={setSelectedTarget}
            currentPlanet={currentPlanet}
            shipDisplayIcon={shipDisplayIcon}
            shipDisplayName={shipDisplayName}
            shipStats={shipStats}
            fmt={fmt}
            S={S}
          />

          {target && (
            <>
              <FleetSelectionList
                state={state}
                dispatch={dispatch}
                currentPlanet={currentPlanet}
                selectedShips={selectedShips}
                setSelectedShips={setSelectedShips}
                filter={filter}
                setFilter={setFilter}
                availableShips={availableShips}
                shipDisplayIcon={shipDisplayIcon}
                shipDisplayName={shipDisplayName}
                shipStats={shipStats}
                toggleShip={toggleShip}
                fmt={fmt}
                S={S}
              />

              <MissionConfigPanel
                target={target}
                currentPlanet={currentPlanet}
                selectedShips={selectedShips}
                setSelectedShips={setSelectedShips}
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
                shipStats={shipStats}
                state={state}
                fmt={fmt}
                S={S}
              />
            </>
          )}
        </div>
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
