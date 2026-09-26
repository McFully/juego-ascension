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
import { GAME_SPEED } from "../data/gameData.js";
import { useActiveImperialQueues } from "../hooks/useActiveImperialQueues.js";
import { EmperorDelegationModal } from "../components/government/GovernorDelegationModal.jsx";
import { ImperialCommandHub } from "../components/government/ImperialCommandHub.jsx";
import { PlanetarySenateModal } from "../components/planet/PlanetarySenateModal.jsx";

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

  const [activeSection, setActiveSection] = useState('command_hub'); // 'command_hub' | 'planets' | 'operations' | 'fleets'
  const [opFilter, setOpFilter] = useState(null);
  const [emperorModalOpen, setEmperorModalOpen] = useState(false);
  const [planetarySenateOpen, setPlanetarySenateOpen] = useState(false);
  const activeItems = useActiveImperialQueues(state, BUILDINGS, RESEARCH, SHIPS, DEFENSES);

  // Escuchar evento de navegación directa de sección (ej: desde la miga de pan de HubTopBar)
  React.useEffect(() => {
    const handleOpenSectionEvent = (e) => {
      const targetSec = e?.detail?.section;
      if (targetSec && ['command_hub', 'planets', 'operations', 'fleets'].includes(targetSec)) {
        setActiveSection(targetSec);
      }
    };
    window.addEventListener('ascension:open-section', handleOpenSectionEvent);
    return () => window.removeEventListener('ascension:open-section', handleOpenSectionEvent);
  }, []);

  const planets = state?.planets || [];
  const allPlanetsAuto = planets.length > 0 && planets.every(p => Boolean(p.autoGovernance));
  const somePlanetsAuto = planets.some(p => Boolean(p.autoGovernance));

  // Conteo de misiones activas de jugador
  const playerActiveMissionsCount = (state?.fleetMissions || []).filter(m => !m.isAI).length;

  // Totales Imperiales consolidados de todos los planetas
  const imperialTotals = React.useMemo(() => {
    let metal = 0;
    let crystal = 0;
    let deuterium = 0;
    let slag = 0;
    let energyBalance = 0;
    let prodMetal = 0;
    let prodCrystal = 0;
    let prodDeuterium = 0;
    let prodSlag = 0;
    let prodSlagRecycled = 0;

    let totalPop = 0;
    let totalMaxPop = 0;

    const breakdown = {
      metal: { baseMine: 0, mineTotal: 0, industry: 0, industryTotal: 0, popConsumption: 0, techMult: 1, govMult: 1, biomeMult: 1, civMult: 1, specMult: 1, ratio: 1, total: 0, netTotal: 0 },
      crystal: { baseMine: 0, mineTotal: 0, industry: 0, industryTotal: 0, popConsumption: 0, techMult: 1, govMult: 1, biomeMult: 1, civMult: 1, specMult: 1, ratio: 1, total: 0, netTotal: 0 },
      deuterium: { baseMine: 0, mineTotal: 0, industry: 0, industryTotal: 0, popConsumption: 0, techMult: 1, govMult: 1, biomeMult: 1, civMult: 1, specMult: 1, ratio: 1, total: 0, netTotal: 0, fusionDeduction: 0 },
      slag: {
        total: 0,
        generation: 0,
        recycleRate: 0,
        maxRecycleCap: 0,
        recycledMetal: 0,
        recycledCrystal: 0,
        ecoSustainability: 100,
        details: { slagFromMetalMine: 0, slagFromCrystalMine: 0, slagFromIndustry: 0 }
      },
      energy: { solar: 0, fusion: 0, others: 0, totalProd: 0, totalCons: 0, energyBalance: 0 }
    };

    planets.forEach(p => {
      if (p.resources) {
        metal += (p.resources.metal || 0);
        crystal += (p.resources.crystal || 0);
        deuterium += (p.resources.deuterium || 0);
        slag += (p.resources.slag || 0);
      }
      try {
        const pop = p.population || 1000;
        totalPop += pop;
        totalMaxPop += calcPlanetMaxPop(p);

        const prod = calcProduction(
          p.buildings || {},
          state.research || {},
          p.temperature || 20,
          GAME_SPEED,
          p.faction || 'human',
          p.biome,
          p.gravity,
          p.trait,
          p.specialization,
          { galaxy: p.galaxy, system: p.system, position: p.position },
          state.ministries?.economy?.taxRate || p.taxRate || 0,
          p.relics || []
        );
        if (prod) {
          const pop = p.population || 1000;
          const popMetal = Math.round(pop * 0.00002 * 3600);
          const popCrystal = Math.round(pop * 0.00001 * 3600);
          const popDeut = Math.round(pop * 0.000005 * 3600);

          energyBalance += (prod.energyBalance || 0);
          prodMetal += Math.max(0, (prod.metal || 0) - popMetal);
          prodCrystal += Math.max(0, (prod.crystal || 0) - popCrystal);
          prodDeuterium += Math.max(0, (prod.deuterium || 0) - popDeut);

          breakdown.metal.popConsumption += popMetal;
          breakdown.crystal.popConsumption += popCrystal;
          breakdown.deuterium.popConsumption += popDeut;

          prodSlag += (prod.slagNet !== undefined ? prod.slagNet : (prod.slag || 0));
          prodSlagRecycled += (prod.slagRecycled || 0);

          if (prod.breakdown) {
            ['metal', 'crystal', 'deuterium'].forEach(res => {
              const b = prod.breakdown[res];
              if (b) {
                breakdown[res].baseMine += (b.baseMine || 0);
                breakdown[res].mineTotal += (b.mineTotal || 0);
                breakdown[res].industry += (b.industry || 0);
                breakdown[res].industryTotal += (b.industryTotal || 0);
                breakdown[res].total += (b.total || 0);
                breakdown[res].recycledSlagBonus = (breakdown[res].recycledSlagBonus || 0) + (b.recycledSlagBonus || 0);
                breakdown[res].slagGenerated = (breakdown[res].slagGenerated || 0) + (b.slagGenerated || 0);
                breakdown[res].techMult = b.techMult || 1;
                breakdown[res].govMult = b.govMult || 1;
                breakdown[res].biomeMult = b.biomeMult || 1;
                breakdown[res].civMult = b.civMult || 1;
                breakdown[res].specMult = b.specMult || 1;
                breakdown[res].ratio = b.ratio || 1;

                if (b.industryItems) {
                  if (!breakdown[res].industryItems) breakdown[res].industryItems = {};
                  Object.entries(b.industryItems).forEach(([itemKey, val]) => {
                    breakdown[res].industryItems[itemKey] = (breakdown[res].industryItems[itemKey] || 0) + (val || 0);
                  });
                }
              }
            });
            if (prod.breakdown.slag) {
              const sb = prod.breakdown.slag;
              breakdown.slag.total += (sb.total || 0);
              breakdown.slag.generation += (sb.generation || 0);
              breakdown.slag.recycleRate += (sb.recycleRate || 0);
              breakdown.slag.maxRecycleCap += (sb.maxRecycleCap || 0);
              breakdown.slag.recycledMetal += (sb.recycledMetal || 0);
              breakdown.slag.recycledCrystal += (sb.recycledCrystal || 0);
              if (sb.details) {
                breakdown.slag.details.slagFromMetalMine += (sb.details.slagFromMetalMine || 0);
                breakdown.slag.details.slagFromCrystalMine += (sb.details.slagFromCrystalMine || 0);
                breakdown.slag.details.slagFromIndustry += (sb.details.slagFromIndustry || 0);
              }
            }
            if (prod.breakdown.deuterium?.fusionDeduction) {
              breakdown.deuterium.fusionDeduction += prod.breakdown.deuterium.fusionDeduction;
            }
            if (prod.breakdown.energy) {
              const eb = prod.breakdown.energy;
              breakdown.energy.solar += (eb.solar || 0);
              breakdown.energy.fusion += (eb.fusion || 0);
              breakdown.energy.others += (eb.others || 0);
              breakdown.energy.totalProd += (eb.totalProd || 0);
              breakdown.energy.totalCons += (eb.totalCons || 0);
              breakdown.energy.energyBalance += (eb.energyBalance || 0);
            }
          }
        }
      } catch (err) {
        // Ignorar fallos puntuales
      }
    });

    breakdown.metal.netTotal = Math.max(0, breakdown.metal.total - breakdown.metal.popConsumption);
    breakdown.crystal.netTotal = Math.max(0, breakdown.crystal.total - breakdown.crystal.popConsumption);
    breakdown.deuterium.netTotal = Math.max(0, breakdown.deuterium.total - breakdown.deuterium.popConsumption);
    breakdown.slag.ecoSustainability = breakdown.slag.grossGenerated > 0 
      ? Math.min(100, Math.round((breakdown.slag.actualRecycled / breakdown.slag.grossGenerated) * 100))
      : 100;

    return {
      metal,
      crystal,
      deuterium,
      slag,
      energyBalance,
      prodMetal,
      prodCrystal,
      prodDeuterium,
      prodSlag,
      prodSlagRecycled,
      totalPop,
      totalMaxPop,
      breakdown
    };
  }, [planets, state.research]);

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
      {/* === DOM SUPERIOR ESTANDARIZADO DE 2 FILAS (Componente Modular) === */}
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
        handleOpenMenu={handleOpenMenu}
        handleLogout={onLogout || onReturnToMenu}
        onOpenSettings={onOpenSettings}
      />

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
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-black border shadow-lg backdrop-blur-md ${
              activeSection === 'command_hub'
                ? 'bg-purple-500/50 text-purple-100 border-purple-400'
                : 'bg-black/75 text-slate-200 border-white/30'
            }`}>
              CENTRAL
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

      {/* === SUB-VISTA 0: MANDO IMPERIAL (TARJETAS DE ALTO MANDO) === */}
      <div className={activeSection === 'command_hub' ? 'block animate-in fade-in duration-150' : 'hidden'}>
        <ImperialCommandHub
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          production={production}
          fmt={fmt}
          RESEARCH={RESEARCH}
          onEnterMinistries={() => handleNavigate('government_ministries')}
          onNavigateTab={handleNavigate}
          onOpenPlanetarySenate={() => setPlanetarySenateOpen(true)}
          onBackToEmpire={() => setActiveSection('planets')}
          showTopBar={false}
          isImperialScreen={true}
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

      {/* Modal de Senado Planetario Local */}
      <PlanetarySenateModal
        isOpen={planetarySenateOpen}
        onClose={() => setPlanetarySenateOpen(false)}
        planet={currentPlanet}
        state={state}
        dispatch={dispatch}
        fmt={fmt}
      />
    </div>
  );
};

export default React.memo(OverviewPage);
