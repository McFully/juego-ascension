import React from 'react';
import { MINISTRY_MAPPING } from '../data/buildingOperationsData.js';
import { SafeImg } from '../assets.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { GameCarousel } from '../components/ui/GameCarousel.jsx';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';
import { PlanetTerraformingView } from '../components/planet/PlanetTerraformingView.jsx';

/**
 * BuildingsPage — Hub de Complejo de Obras a Pantalla Completa y Ancho Máximo.
 * Grid panorámico de tarjetas de ministerios con imágenes proporcionales.
 */
const BuildingsPage = ({ dispatch, setActiveTab, safeSetActiveTab, currentPlanet, state, production, fmt }) => {
  const { navigateTo, navigateBack } = useNavigation();

  const onSelectMinistry = (minId) => {
    const tabId = `ministry_${minId}`;
    if (navigateTo) navigateTo(tabId);
    const fn = safeSetActiveTab || setActiveTab;
    if (fn) fn(tabId);
    if (window.playSfx) window.playSfx('click');
  };

  const ministries = Object.values(MINISTRY_MAPPING).filter(
    (m, idx, arr) => arr.findIndex(x => x.id === m.id) === idx
  );

  // Mapeo de assets visuales por ministerio
  const ministryAssets = {
    infra: 'modularFactory',
    resources: 'constructionCenter',
    industry: 'refinery',
    economy: 'financeMinistry',
    energy: 'civilPowerGrid',
    science: 'centralAiResearch',
    innovation: 'naniteFactory',
    cybernetics: 'centralAiResearch',
    defense: 'internalSecurityMinistry',
    war: 'missileSilo',
    transport: 'vacuumTransitTubes',
    logistics: 'orbitalStorage',
    biosphere: 'biomeDomeSimulation',
    agriculture: 'urbanHydroponic',
    civics: 'arcologyAlpha',
    diplomacy: 'permanentEmbassy',
    intel: 'deepScanner',
    justice: 'colonySupremeCourt',
    culture: 'stellarProjectionTheater',
  };

  const getMinistryStats = (m) => {
    if (!currentPlanet) return { totalLevels: 0, buildingCount: m.buildings?.length || 0, activeCount: 0 };
    const buildings = currentPlanet.buildings || {};
    let totalLevels = 0;
    let activeCount = 0;
    (m.buildings || []).forEach(bId => {
      const lvl = buildings[bId] || 0;
      totalLevels += lvl;
      if (lvl > 0) activeCount++;
    });
    return { totalLevels, buildingCount: m.buildings?.length || 0, activeCount };
  };

  const hasActiveConstruction = (m) => {
    if (!state?.buildQueue) return false;
    return state.buildQueue.some(q => (m.buildings || []).includes(q.buildingId));
  };

  return (
    <div className="space-y-4 view-enter w-full">
      {/* DOM Superior Estandarizado del Planeta (Recursos + Producción/h + Miga de Pan) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Complejo de Obras"
        breadcrumbIcon="🏗️"
      />

      {/* Si el planeta es inhóspito y requiere acondicionamiento previo */}
      {currentPlanet?.requiresConditioning && !currentPlanet?.terraformed ? (
        <PlanetTerraformingView
          planet={currentPlanet}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          fmt={fmt}
        />
      ) : (
        /* Grid Responsivo Directo: Sectores de Obras */
        <div className="w-full space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm md:text-base font-black text-cyan-300 font-mono tracking-wider uppercase flex items-center gap-2">
            <span>🏗️</span>
            <span>Complejo de Obras</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full items-stretch pt-1 pb-4">
          {ministries.map((m) => {
            const stats = getMinistryStats(m);
            const isBuilding = hasActiveConstruction(m);

            return (
              <button
                key={m.id}
                onClick={() => onSelectMinistry(m.id)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none bg-[#090d1f]/90 border-white/10 hover:border-cyan-400 hover:bg-[#0e1633] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] active:scale-[0.98] cursor-pointer text-left focus:outline-none w-full h-full min-h-[200px]"
              >
                {/* Imagen Superior de Sector */}
                <div className="relative w-full h-24 sm:h-28 overflow-hidden bg-[#05070f] border-b border-white/10">
                  <SafeImg
                    id={ministryAssets[m.id] || 'constructionCenter'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  {isBuilding && (
                    <span className="absolute top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse z-10">
                      🔨 En curso
                    </span>
                  )}
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors truncate">
                      {m.name.replace('Ministerio de ', '')}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>{stats.activeCount}/{stats.buildingCount} activos</span>
                      <span className="text-cyan-300 font-bold">{stats.totalLevels} Nvs.</span>
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="w-full mt-3">
                    <div className="w-full h-1.5 bg-[#05070f] rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, stats.totalLevels * 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Tarjeta de Retorno */}
          <ActionCardTile
            type="back"
            title="Volver"
            subtitle="Regresar a la pantalla anterior"
            icon="◀"
            assetId="commandCenter"
            badgeText="VOLVER"
            onClick={() => {
              if (window.playSfx) window.playSfx('click');
              if (navigateBack) {
                navigateBack();
              } else {
                const fn = safeSetActiveTab || setActiveTab;
                if (fn) fn('overview');
              }
            }}
          />
        </div>
      </div>
      )}
    </div>
  );
};

export default BuildingsPage;
