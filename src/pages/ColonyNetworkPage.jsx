import React, { useState } from 'react';
import { ColonyMatrixView } from '../components/colonyNetwork/ColonyMatrixView.jsx';
import { FleetRelocationView } from '../components/colonyNetwork/FleetRelocationView.jsx';
import { SupplyRoutesView } from '../components/colonyNetwork/SupplyRoutesView.jsx';
import { ColonyDemandsView } from '../components/colonyNetwork/ColonyDemandsView.jsx';
import { SectorManagementView } from '../components/sectors/SectorManagementView.jsx';
import { ResearchMatrixView } from '../components/colonyNetwork/ResearchMatrixView.jsx';
import { ColonyStationCardGrid } from '../components/colonyNetwork/ColonyStationCardGrid.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';

export const ColonyNetworkPage = ({
  state,
  dispatch,
  currentPlanet,
  production,
  fmt,
  S,
  onOpenCodex,
  setActiveTab
}) => {
  const { navigateBack } = useNavigation();
  const [activeSubTab, setActiveSubTab] = useState(null); // null = Selector de Estaciones (Card Grid), 'overview' | 'relocate' | 'routes' | 'demands' | 'sectors' | 'researchMatrix'
  const [fromPlanetId, setFromPlanetId] = useState(currentPlanet?.id || state?.planets?.[0]?.id);
  const [toPlanetId, setToPlanetId] = useState(
    state?.planets?.find(p => p.id !== currentPlanet?.id)?.id || state?.planets?.[0]?.id
  );
  const [selectedShipsToMove, setSelectedShipsToMove] = useState({});
  const [routeFrom, setRouteFrom] = useState(state?.planets?.find(p => !p.isHome)?.id || currentPlanet?.id);
  const [routeRes, setRouteRes] = useState('metal');
  const [routeRatio, setRouteRatio] = useState(0.5);

  const planets = state?.planets || [];
  const fromPlanet = planets.find(p => p.id === fromPlanetId) || currentPlanet;
  const toPlanet = planets.find(p => p.id === toPlanetId);
  const colonyDemands = state?.imperialCouncil?.colonyDemands || [];

  const handleSelectPlanet = (planetId) => {
    dispatch({ type: 'SET_PLANET', planetId });
    if (window.playSfx) window.playSfx('click');
  };

  const handleEqualize = () => {
    if (planets.length <= 1) return;
    dispatch({ type: 'EQUALIZE_COLONY_RESOURCES' });
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  const handleExecuteRelocation = () => {
    if (!fromPlanetId || !toPlanetId || fromPlanetId === toPlanetId) return;
    const count = Object.values(selectedShipsToMove).reduce((a, b) => a + b, 0);
    if (count <= 0) return;

    dispatch({
      type: 'RELOCATE_COLONY_FLEET',
      fromPlanetId,
      toPlanetId,
      ships: selectedShipsToMove
    });
    setSelectedShipsToMove({});
    if (window.playSfx) window.playSfx('fleetLaunch');
  };

  const getSubTabTitle = () => {
    switch (activeSubTab) {
      case 'overview': return 'Matriz Colonial en Vivo';
      case 'relocate': return 'Reubicación Rápida de Flotas';
      case 'routes': return 'Convoy Comercial y Logística';
      case 'demands': return 'Demandas y Abastecimiento';
      case 'sectors': return 'Prefecturas Coloniales y Virreinatos';
      case 'researchMatrix': return 'Matriz de Investigación';
      default: return 'Logística';
    }
  };

  return (
    <div className="space-y-6 relative z-10 pb-20">
      {/* DOM Superior Estandarizado (Recursos + Explorador + Volver a Mando Imperial / Estaciones) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle={getSubTabTitle()}
        breadcrumbIcon="🪐"
        parentHub="imperial_hub"
        backButtonLabelTop="VOLVER A"
        backButtonLabelBottom={activeSubTab ? 'Estaciones' : 'Mando Imperial'}
        backButtonIcon={activeSubTab ? '🪐' : '👑'}
        onBackToAltoMando={() => {
          if (activeSubTab) {
            setActiveSubTab(null);
          } else {
            if (setActiveTab) setActiveTab('imperial_hub');
            else if (navigateBack) navigateBack();
          }
          if (window.playSfx) window.playSfx('click');
        }}
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs font-mono">
              <span className="text-slate-400">Mundos:</span>
              <span className="font-bold text-indigo-300">{planets.length}</span>
            </div>
            <button
              onClick={handleEqualize}
              disabled={planets.length <= 1}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                planets.length > 1
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:brightness-110 active:scale-[0.98] cursor-pointer'
                  : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
              }`}
              title="Equilibrar excedentes de recursos entre todos los mundos colonizados"
            >
              <span>⚖️</span>
              <span>Nivelar Recursos</span>
            </button>
          </div>
        }
      />

      {/* Selector de Estaciones Logísticas en Card Grid Estandarizado (solo cuando no hay vista activa) */}
      {!activeSubTab && (
        <ColonyStationCardGrid
          activeSubTab={activeSubTab}
          onSelectSubTab={setActiveSubTab}
          planetsCount={planets.length}
          activeRoutesCount={(state?.tradeRoutes || []).length}
          pendingDemandsCount={colonyDemands.length}
        />
      )}

      {/* Subvista: Matriz Colonial */}
      {activeSubTab === 'overview' && (
        <ColonyMatrixView
          planets={planets}
          currentPlanet={currentPlanet}
          fmt={fmt}
          dispatch={dispatch}
          onSelectPlanet={handleSelectPlanet}
        />
      )}

      {/* Subvista: Reubicación Rápida de Flotas */}
      {activeSubTab === 'relocate' && (
        <FleetRelocationView
          planets={planets}
          fromPlanetId={fromPlanetId}
          setFromPlanetId={setFromPlanetId}
          toPlanetId={toPlanetId}
          setToPlanetId={setToPlanetId}
          fromPlanet={fromPlanet}
          selectedShipsToMove={selectedShipsToMove}
          setSelectedShipsToMove={setSelectedShipsToMove}
          onExecuteRelocation={handleExecuteRelocation}
        />
      )}

      {/* Subvista: Rutas de Suministro Automáticas */}
      {activeSubTab === 'routes' && (
        <SupplyRoutesView
          planets={planets}
          routeFrom={routeFrom}
          setRouteFrom={setRouteFrom}
          routeRes={routeRes}
          setRouteRes={setRouteRes}
          routeRatio={routeRatio}
          setRouteRatio={setRouteRatio}
          tradeRoutes={state.tradeRoutes || []}
          dispatch={dispatch}
        />
      )}

      {/* Subvista: Demandas Coloniales */}
      {activeSubTab === 'demands' && (
        <ColonyDemandsView
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          fmt={fmt}
        />
      )}

      {/* Subvista: Gestión de Sectores y Virreyes */}
      {activeSubTab === 'sectors' && (
        <SectorManagementView
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          fmt={fmt}
        />
      )}

      {/* Subvista: Matriz de Investigación Interplanetaria */}
      {activeSubTab === 'researchMatrix' && (
        <ResearchMatrixView
          state={state}
          dispatch={dispatch}
          fmt={fmt}
        />
      )}
    </div>
  );
};
