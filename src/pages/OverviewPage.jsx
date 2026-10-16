import React, { useState } from "react";
import { ProductionSummaryCard } from "../components/overview/ProductionSummaryCard.jsx";
import { ActiveFleetsOverview } from "../components/overview/ActiveFleetsOverview.jsx";
import { PlanetViewer3D } from "../components/3d/PlanetViewer3D.jsx";
import { LivingPlanetPanel } from "../components/planet/LivingPlanetPanel.jsx";
import { PlanetarySpecializationCard } from "../components/overview/PlanetarySpecializationCard.jsx";
import { ConstructionQueuesPanel } from "../components/overview/ConstructionQueuesPanel.jsx";
import { GameCarousel } from "../components/ui/GameCarousel.jsx";
import { ActionCardTile } from "../components/ui/ActionCardTile.jsx";
import { useNavigation } from "../components/navigation/NavigationContext.jsx";
import { SafeImg } from "../assets.jsx";
import { ResourceBadge } from "../components/ui/ResourceBar.jsx";
import { ResourceBreakdownTooltip } from "../components/ui/ResourceBreakdownTooltip.jsx";
import { ImperialTelemetryTicker } from "../components/navigation/ImperialTelemetryTicker.jsx";
import OverviewHudBar from "../components/overview/OverviewHudBar.jsx";
import { OverviewPlanetGrid } from "../components/overview/OverviewPlanetGrid.jsx";
import { ActiveOperationsSection } from "../components/overview/ActiveOperationsSection.jsx";
import { ActiveFleetsSection } from "../components/overview/ActiveFleetsSection.jsx";
import { calcProduction, calcPlanetMaxPop } from "../utils/formulas/productionFormulas.js";
import { GAME_SPEED, POPULATION_CONSUMPTION_RATES } from "../data/gameData.js";
import { useActiveImperialQueues } from "../hooks/useActiveImperialQueues.js";
import { EmperorDelegationModal } from "../components/government/GovernorDelegationModal.jsx";
import { ImperialCommandHub } from "../components/government/ImperialCommandHub.jsx";
import { useImperialTotals } from "../hooks/useImperialTotals.js";
import { IndependentReturnCard } from "../components/navigation/IndependentReturnCard.jsx";

/**
 * OverviewPage — Consola Central de Operaciones 100% Pantalla Completa.
 * Sin menús DOM externos ni pie inferior. Integra telemetría imperial, recursos a gran escala
 * y navegación por cuadrantes con tarjetas estandarizadas grandes y tarjeta de Menú Principal.
 */
const OverviewPage = ({
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
  S,
  QueueDisplay,
  ProgressBar,
  fmt,
  fmtTime,
  isOutdated,
  onOpenCodex,
  safeSetActiveTab,
  onOpenSettings,
  onReturnToMenu,
  onLogout
}) => {
  const { navigateTo, toggleHud, hudVisible, densityMode, setDensityMode } = useNavigation();
  const handleNavigate = (tab) => {
    if (navigateTo) navigateTo(tab);
    else if (safeSetActiveTab) safeSetActiveTab(tab);
  };
  const handleOpenMenu = () => {
    if (onReturnToMenu) onReturnToMenu();
    else if (onOpenSettings) onOpenSettings();
  };

  const [activeSection, setActiveSection] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const sec = window.sessionStorage.getItem("ascension_target_section");
        if (sec && ['command_hub', 'planets', 'operations', 'fleets'].includes(sec)) {
          window.sessionStorage.removeItem("ascension_target_section");
          return sec;
        }
      }
    } catch (_) {}
    return 'command_hub';
  }); // 'command_hub' | 'planets' | 'operations' | 'fleets'

  // Si OverviewPage ya estaba montado en memoria y se fijó una sección objetivo al navegar hacia él
  try {
    if (typeof window !== "undefined") {
      const pendingSec = window.sessionStorage.getItem("ascension_target_section");
      if (pendingSec && ['command_hub', 'planets', 'operations', 'fleets'].includes(pendingSec)) {
        window.sessionStorage.removeItem("ascension_target_section");
        if (activeSection !== pendingSec) {
          setActiveSection(pendingSec);
        }
      }
    }
  } catch (_) {}
  const [opFilter, setOpFilter] = useState(null);
  const [initialPlanetSearch, setInitialPlanetSearch] = useState('');
  const [emperorModalOpen, setEmperorModalOpen] = useState(false);
  const activeItems = useActiveImperialQueues(state, BUILDINGS, RESEARCH, SHIPS, DEFENSES);

  // Comprobar activamente si hay una sección pendiente en sessionStorage en cada render/retorno
  React.useEffect(() => {
    const checkTargetSection = () => {
      try {
        if (typeof window !== "undefined") {
          const sec = window.sessionStorage.getItem("ascension_target_section");
          if (sec && ['command_hub', 'planets', 'operations', 'fleets'].includes(sec)) {
            window.sessionStorage.removeItem("ascension_target_section");
            setActiveSection(sec);
          }
        }
      } catch (_) {}
    };

    checkTargetSection();

    const handleOpenSectionEvent = (e) => {
      const targetSec = e?.detail?.section;
      if (targetSec && ['command_hub', 'planets', 'operations', 'fleets'].includes(targetSec)) {
        setActiveSection(targetSec);
        if (e?.detail?.filter !== undefined) {
          setInitialPlanetSearch(e.detail.filter);
        }
      }
    };

    window.addEventListener('ascension:open-section', handleOpenSectionEvent);
    window.addEventListener('focus', checkTargetSection);
    return () => {
      window.removeEventListener('ascension:open-section', handleOpenSectionEvent);
      window.removeEventListener('focus', checkTargetSection);
    };
  }, []);

  const planets = state?.planets || [];
  const allPlanetsAuto = planets.length > 0 && planets.every(p => Boolean(p.autoGovernance));
  const somePlanetsAuto = planets.some(p => Boolean(p.autoGovernance));

  // Conteo de misiones activas de jugador
  const playerActiveMissionsCount = (state?.fleetMissions || []).filter(m => !m.isAI).length;

  // Totales Imperiales consolidados de todos los planetas
  const imperialTotals = useImperialTotals(state);

  // Poder Militar Imperial Consolidado (Naves en superficie y en misiones)
  const totalFleetMilitaryPower = React.useMemo(() => {
    let power = 0;
    const countShipPower = (id, count) => {
      if (!count || count <= 0) return;
      const s = SHIPS?.[id];
      const baseAtk = s?.atk || 50;
      const baseHull = s?.hull || 500;
      const baseShd = s?.shd || 50;
      // Poder representativo militar estándar (ataque + escudo + casco/10)
      const unitPower = Math.round(baseAtk + baseShd * 1.5 + baseHull * 0.1);
      power += unitPower * count;
    };

    planets.forEach(p => {
      if (p.fleet) {
        Object.entries(p.fleet).forEach(([id, count]) => {
          countShipPower(id, count);
        });
      }
    });

    (state.fleetMissions || []).forEach(m => {
      if (!m.isAI && m.fleet) {
        Object.entries(m.fleet).forEach(([id, count]) => {
          countShipPower(id, count);
        });
      }
    });

    return power;
  }, [planets, state.fleetMissions, SHIPS]);

  return (
    <div className="space-y-5 view-enter w-full">
      {/* === DOM SUPERIOR Y TARJETA INDEPENDIENTE DE VOLVER A MENÚ === */}
      <div className="flex flex-col xl:flex-row items-stretch gap-3">
        <div className="flex-1 min-w-0">
          <OverviewHudBar
            hudVisible={hudVisible}
            imperialTotals={imperialTotals}
            totalFleetMilitaryPower={totalFleetMilitaryPower}
            state={state}
            fmt={fmt}
            allPlanetsAuto={allPlanetsAuto}
            somePlanetsAuto={somePlanetsAuto}
            setEmperorModalOpen={setEmperorModalOpen}
            dispatch={dispatch}
            onOpenSettings={onOpenSettings}
            safeSetActiveTab={safeSetActiveTab}
          />
        </div>

        <div className="shrink-0 w-full xl:w-48 flex items-stretch">
          <IndependentReturnCard
            onClick={handleOpenMenu}
            labelTop="VOLVER A"
            labelBottom="Menú Principal"
            icon="🏠"
            imgId="menuContinue"
            accentColor="cyan"
          />
        </div>
      </div>

      {/* === BARRA DE MENÚ DE SECCIONES IMPERIALES (IMAGE BUTTONS GRANDES) === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-2 bg-[#080d22]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
        {/* Botón 0: Mando del Imperio (Tarjetas Centrales) */}
        <button
          type="button"
          onClick={() => {
            setActiveSection('command_hub');
            if (window.playSfx) window.playSfx('click');
          }}
          className={`relative w-full min-h-[72px] sm:min-h-[84px] flex flex-col items-center justify-center p-3 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group text-center select-none border ${
            activeSection === 'command_hub'
              ? 'border-purple-400 bg-[#160c2c] shadow-[0_0_30px_rgba(168,85,247,0.45)] scale-[1.01]'
              : 'border-white/10 bg-[#060a16] hover:border-purple-500/40 hover:bg-[#120a24]'
          }`}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <SafeImg
              id="sectorGovPalace"
              className="w-full h-full object-cover object-center opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
            <div className={`absolute inset-0 transition-colors duration-300 ${
              activeSection === 'command_hub'
                ? 'bg-gradient-to-t from-black/60 via-black/30 to-black/20 group-hover:via-transparent'
                : 'bg-gradient-to-t from-black/65 via-black/35 to-black/25 group-hover:via-purple-950/20'
            }`} />
          </div>

          <div className="relative z-10 flex items-center justify-center gap-3 w-full px-4 py-2 leading-none">
            <span className="text-2xl sm:text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">👑</span>
            <span className={`text-base sm:text-lg lg:text-xl font-mono font-black uppercase tracking-wider transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,1)] ${
              activeSection === 'command_hub' ? 'text-purple-300' : 'text-white group-hover:text-purple-200'
            }`}>
              Mando Imperial
            </span>
          </div>
        </button>

        {/* Botón 1: Mundos del Imperio */}
        <button
          type="button"
          onClick={() => {
            setActiveSection('planets');
            if (window.playSfx) window.playSfx('click');
          }}
          className={`relative w-full min-h-[72px] sm:min-h-[84px] flex flex-col items-center justify-center p-3 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group text-center select-none border ${
            activeSection === 'planets'
              ? 'border-cyan-400 bg-[#061426] shadow-[0_0_30px_rgba(6,182,212,0.45)] scale-[1.01]'
              : 'border-white/10 bg-[#060a16] hover:border-cyan-500/40 hover:bg-[#0c1630]'
          }`}
        >
          {/* Imagen de fondo nítida y visible */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <SafeImg
              id="biomeDomeSimulation"
              className="w-full h-full object-cover object-center opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
            <div className={`absolute inset-0 transition-colors duration-300 ${
              activeSection === 'planets'
                ? 'bg-gradient-to-t from-black/60 via-black/30 to-black/20 group-hover:via-transparent'
                : 'bg-gradient-to-t from-black/65 via-black/35 to-black/25 group-hover:via-cyan-950/20'
            }`} />
          </div>

          {/* Contenido frontal grande */}
          <div className="relative z-10 flex items-center justify-center gap-3 w-full px-4 py-2 leading-none">
            <span className="text-2xl sm:text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🌍</span>
            <span className={`text-base sm:text-xl lg:text-2xl font-mono font-black uppercase tracking-wider transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,1)] ${
              activeSection === 'planets' ? 'text-cyan-300' : 'text-white group-hover:text-cyan-200'
            }`}>
              Mundos del Imperio
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs sm:text-sm font-mono font-black border shadow-lg backdrop-blur-md ${
              activeSection === 'planets'
                ? 'bg-cyan-500/50 text-cyan-100 border-cyan-400'
                : 'bg-black/75 text-slate-200 border-white/30'
            }`}>
              {planets.length}
            </span>
          </div>
        </button>

        {/* Botón 2: Operaciones en Curso */}
        <button
          type="button"
          onClick={() => {
            setActiveSection('operations');
            setOpFilter(null);
            if (window.playSfx) window.playSfx('click');
          }}
          className={`relative w-full min-h-[76px] sm:min-h-[92px] flex flex-col items-center justify-center p-3 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group text-center select-none border ${
            activeSection === 'operations'
              ? 'border-amber-400 bg-[#241705] shadow-[0_0_30px_rgba(245,158,11,0.45)] scale-[1.01]'
              : 'border-white/10 bg-[#060a16] hover:border-amber-500/40 hover:bg-[#1a1208]'
          }`}
        >
          {/* Imagen de fondo nítida y visible */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <SafeImg
              id="robotFactory"
              className="w-full h-full object-cover object-center opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
            <div className={`absolute inset-0 transition-colors duration-300 ${
              activeSection === 'operations'
                ? 'bg-gradient-to-t from-black/60 via-black/30 to-black/20 group-hover:via-transparent'
                : 'bg-gradient-to-t from-black/65 via-black/35 to-black/25 group-hover:via-amber-950/20'
            }`} />
          </div>

          {/* Contenido frontal grande */}
          <div className="relative z-10 flex items-center justify-center gap-3 w-full px-4 py-2 leading-none">
            <span className="text-2xl sm:text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">⚡</span>
            <span className={`text-base sm:text-xl lg:text-2xl font-mono font-black uppercase tracking-wider transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,1)] ${
              activeSection === 'operations' ? 'text-amber-300' : 'text-white group-hover:text-amber-200'
            }`}>
              Operaciones en Curso
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs sm:text-sm font-mono font-black border shadow-lg backdrop-blur-md ${
              activeSection === 'operations'
                ? 'bg-amber-500/50 text-amber-100 border-amber-400'
                : 'bg-black/75 text-slate-200 border-white/30'
            }`}>
              {activeItems.length}
            </span>
          </div>
        </button>

        {/* Botón 3: Flotas en Vuelo */}
        <button
          type="button"
          onClick={() => {
            setActiveSection('fleets');
            if (window.playSfx) window.playSfx('click');
          }}
          className={`relative w-full min-h-[76px] sm:min-h-[92px] flex flex-col items-center justify-center p-3 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group text-center select-none border ${
            activeSection === 'fleets'
              ? 'border-blue-400 bg-[#081330] shadow-[0_0_30px_rgba(59,130,246,0.45)] scale-[1.01]'
              : 'border-white/10 bg-[#060a16] hover:border-blue-500/40 hover:bg-[#0c1738]'
          }`}
        >
          {/* Imagen de fondo nítida y visible */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <SafeImg
              id="battleship"
              className="w-full h-full object-cover object-center opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
            <div className={`absolute inset-0 transition-colors duration-300 ${
              activeSection === 'fleets'
                ? 'bg-gradient-to-t from-black/60 via-black/30 to-black/20 group-hover:via-transparent'
                : 'bg-gradient-to-t from-black/65 via-black/35 to-black/25 group-hover:via-blue-950/20'
            }`} />
          </div>

          {/* Contenido frontal grande */}
          <div className="relative z-10 flex items-center justify-center gap-3 w-full px-4 py-2 leading-none">
            <span className="text-2xl sm:text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🛸</span>
            <span className={`text-base sm:text-xl lg:text-2xl font-mono font-black uppercase tracking-wider transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,1)] ${
              activeSection === 'fleets' ? 'text-blue-300' : 'text-white group-hover:text-blue-200'
            }`}>
              Flotas en Vuelo
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs sm:text-sm font-mono font-black border shadow-lg backdrop-blur-md ${
              activeSection === 'fleets'
                ? 'bg-blue-500/50 text-blue-100 border-blue-400'
                : 'bg-black/75 text-slate-200 border-white/30'
            }`}>
              {playerActiveMissionsCount}
            </span>
          </div>
        </button>
      </div>

      {/* === SUB-VISTA 0: MANDO IMPERIAL (sede central del imperio) === */}
      <div className={activeSection === 'command_hub' ? 'block animate-in fade-in duration-150' : 'hidden'}>
        <ImperialCommandHub
          state={state}
          dispatch={dispatch}
          production={production}
          fmt={fmt}
          RESEARCH={RESEARCH}
          onNavigateTab={(tab) => handleNavigate(tab)}
          onBackToEmpire={() => setActiveSection('planets')}
          showTopBar={false}
        />
      </div>

      {/* === SUB-VISTA 1: CATÁLOGO DE MUNDOS DEL IMPERIO === */}
      <div className={activeSection === 'planets' ? 'block animate-in fade-in duration-150' : 'hidden'}>
        <OverviewPlanetGrid
          state={state}
          currentPlanet={currentPlanet}
          dispatch={dispatch}
          handleNavigate={handleNavigate}
          fmt={fmt}
          initialSearch={initialPlanetSearch}
          onSearchChange={setInitialPlanetSearch}
        />
      </div>

      {/* === SUB-VISTA 2: OPERACIONES EN CURSO === */}
      <div className={activeSection === 'operations' ? 'block animate-in fade-in duration-150' : 'hidden'}>
        <ActiveOperationsSection
          activeItems={activeItems}
          state={state}
          currentPlanet={currentPlanet}
          dispatch={dispatch}
          handleNavigate={handleNavigate}
          fmtTime={fmtTime}
          filter={opFilter}
          setFilter={setOpFilter}
        />
      </div>

      {/* === SUB-VISTA 3: FLOTAS EN VUELO === */}
      <div className={activeSection === 'fleets' ? 'block animate-in fade-in duration-150' : 'hidden'}>
        <ActiveFleetsSection
          state={state}
          dispatch={dispatch}
          handleNavigate={handleNavigate}
          ProgressBar={ProgressBar}
          fmtTime={fmtTime}
        />
      </div>

      {/* Modal de Directrices del Emperador IA */}
      <EmperorDelegationModal
        isOpen={emperorModalOpen}
        onClose={() => setEmperorModalOpen(false)}
        state={state}
        dispatch={dispatch}
      />
    </div>
  );
};

export default React.memo(OverviewPage);
