import React, { useState } from 'react';
import { ColonyMatrixView } from '../components/colonyNetwork/ColonyMatrixView.jsx';
import { FleetRelocationView } from '../components/colonyNetwork/FleetRelocationView.jsx';
import { SupplyRoutesView } from '../components/colonyNetwork/SupplyRoutesView.jsx';
import { ColonyDemandsView } from '../components/colonyNetwork/ColonyDemandsView.jsx';
import { SectorManagementView } from '../components/sectors/SectorManagementView.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';

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
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'relocate' | 'routes' | 'demands' | 'sectors'
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

  return (
    <div className="space-y-6 relative z-10">
      {/* Cabecera del Centro de Mando Colonial */}
      <div className="p-5 rounded-2xl bg-[#080d1e]/90 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.playSfx) window.playSfx('click');
              if (navigateBack) {
                navigateBack();
              } else if (setActiveTab) {
                setActiveTab('government');
              }
            }}
            className="px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Volver a la pantalla anterior"
          >
            <span>◀</span>
            <span>Volver</span>
          </button>
          <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/50 flex items-center justify-center text-2xl shadow-inner">
            🪐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white uppercase tracking-wider">
                Red de Colonias y Logística Interplanetaria
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                {planets.length} MUNDOS CONECTADOS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Control de rutas de suministros, nivelación automática de recursos y despliegue rápido de contingentes navales.
            </p>
          </div>
        </div>

        {/* Botón Táctico Nivelador */}
        <button
          onClick={handleEqualize}
          disabled={planets.length <= 1}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
            planets.length > 1
              ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:brightness-110 active:scale-[0.98]'
              : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
          }`}
        >
          <span>⚖️</span>
          <span>Nivelar Recursos del Imperio</span>
        </button>
      </div>

      {/* Selector de Pestañas Logísticas */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'overview'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          🌐 Matriz Colonial en Vivo
        </button>
        <button
          onClick={() => setActiveSubTab('relocate')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'relocate'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          🚀 Reubicación Rápida de Flotas
        </button>
        <button
          onClick={() => setActiveSubTab('routes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'routes'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          🚚 Rutas de Suministro Automáticas
        </button>
        <button
          onClick={() => setActiveSubTab('demands')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'demands'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span>📦 Demandas de Colonias</span>
          {colonyDemands.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-black">
              {colonyDemands.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('sectors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'sectors'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span>🗺️ Sectores y Virreyes</span>
          {(state?.sectors || []).length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-teal-500 text-black text-[10px] font-black">
              {(state?.sectors || []).length}
            </span>
          )}
        </button>
      </div>

      {/* Subvista: Matriz Colonial */}
      {activeSubTab === 'overview' && (
        <ColonyMatrixView
          planets={planets}
          currentPlanet={currentPlanet}
          fmt={fmt}
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
    </div>
  );
};
