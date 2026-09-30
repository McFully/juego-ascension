import React, { useState, useMemo } from 'react';
import { calcProduction, calcPlanetMaxPop } from '../../utils/formulas/productionFormulas.js';
import { GAME_SPEED, BIOMES } from '../../data/gameData.js';
import { PlanetFullDetailModal } from '../planet/PlanetFullDetailModal.jsx';
import { PlanetTableView } from './grid/PlanetTableView.jsx';
import { Planet3DCard } from './grid/Planet3DCard.jsx';

/**
 * OverviewPlanetGrid — Catálogo y cuadrícula de mundos del Imperio en OverviewPage.
 * Dispone de alternador de vista (Cuadrícula 3D vs Matriz Compacta) para evitar el scroll,
 * filtros por galaxia/búsqueda, botón de "Ficha Completa" y selección precisa 100% síncrona.
 */
export const OverviewPlanetGrid = ({
  state,
  currentPlanet,
  dispatch,
  handleNavigate,
  fmt
}) => {
  const [editingPlanetId, setEditingPlanetId] = useState(null);
  const [tempName, setTempName] = useState('');
  const [selectedPlanetDetail, setSelectedPlanetDetail] = useState(null);

  // Controles de visualización y antiscroll
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchFilter, setSearchFilter] = useState('');
  const [galaxyFilter, setGalaxyFilter] = useState('all');

  const rawPlanets = state?.planets || (currentPlanet ? [currentPlanet] : []);

  // Galaxias presentes
  const availableGalaxies = useMemo(() => {
    const set = new Set();
    rawPlanets.forEach(p => {
      if (p.galaxy !== undefined) set.add(Number(p.galaxy));
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [rawPlanets]);

  // Planetas filtrados por galaxia y búsqueda
  const filteredPlanets = useMemo(() => {
    return rawPlanets.filter(planet => {
      const matchGalaxy = galaxyFilter === 'all' || Number(planet.galaxy) === Number(galaxyFilter);
      const matchSearch = !searchFilter.trim() ||
        (planet.name && planet.name.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (planet.biome && planet.biome.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchGalaxy && matchSearch;
    });
  }, [rawPlanets, galaxyFilter, searchFilter]);

  const handleStartRename = (e, planet) => {
    e.stopPropagation();
    setEditingPlanetId(planet.id);
    setTempName(planet.name || '');
  };

  const handleSaveRename = (planetId) => {
    const trimmed = tempName.trim();
    if (trimmed && dispatch) {
      dispatch({ type: 'RENAME_PLANET', planetId, name: trimmed.slice(0, 20) });
    }
    setEditingPlanetId(null);
  };

  const handleOpenDetail = (e, planet) => {
    e.stopPropagation();
    if (window.playSfx) window.playSfx('click');
    setSelectedPlanetDetail(planet);
  };

  const handleSelectPlanetAndNavigate = (planetId) => {
    // El reducer actualiza `currentPlanetId` en el mismo lote que la
    // navegación, así que el Alto Mando que se monte a continuación ya es el
    // de este mundo y no el que estaba activo antes.
    if (dispatch) {
      dispatch({ type: "SET_PLANET", payload: planetId, planetId });
    }
    handleNavigate("government");
  };

  return (
    <section className="space-y-4 w-full pt-1 pb-4">
      {/* ── BARRA DE CONTROL TÁCTICA: FILTROS, BUSCADOR Y MODO DE VISTA (ANTI-SCROLL) ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[#060a18]/90 border border-white/10 backdrop-blur-md">
        
        {/* Filtros de Galaxia y Buscador */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setGalaxyFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                galaxyFilter === 'all'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({rawPlanets.length})
            </button>
            {availableGalaxies.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGalaxyFilter(g)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  Number(galaxyFilter) === g
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                G{g}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Buscar mundo..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-black/60 border border-white/10 text-xs font-mono px-3 py-1.5 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 w-36 sm:w-44"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Alternador de Modo de Vista: Cuadrícula 3D vs Matriz Compacta */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider hidden sm:inline">Vista:</span>
          <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🪐</span>
              <span>Cuadrícula</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📋</span>
              <span>Matriz Compacta</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── MODO 1: CUADRÍCULA 3D DE PLANETAS ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full items-stretch pt-1 pb-2">
          {filteredPlanets.map((planet) => (
            <Planet3DCard
              key={planet.id}
              planet={planet}
              state={state}
              fmt={fmt}
              dispatch={dispatch}
              calcProduction={calcProduction}
              calcPlanetMaxPop={calcPlanetMaxPop}
              GAME_SPEED={GAME_SPEED}
              isEditing={editingPlanetId === planet.id}
              tempName={tempName}
              setTempName={setTempName}
              handleSaveRename={handleSaveRename}
              handleStartRename={handleStartRename}
              setEditingPlanetId={setEditingPlanetId}
              handleSelectPlanetAndNavigate={handleSelectPlanetAndNavigate}
              handleOpenDetail={handleOpenDetail}
            />
          ))}

          {/* Huecos de Colonización Disponibles */}
          {(() => {
            const astroLvl = state?.research?.astrophysics || 0;
            const maxAllowed = Math.max(rawPlanets.length + 1, 1 + Math.ceil(astroLvl / 2));
            const availableSlots = Math.max(1, maxAllowed - rawPlanets.length);

            return Array.from({ length: availableSlots }).map((_, slotIdx) => (
              <div
                key={`colonizable-slot-${slotIdx}`}
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  handleNavigate('galaxy');
                }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-dashed border-emerald-500/40 bg-[#041512]/75 hover:bg-[#07241e] hover:border-emerald-400 hover:shadow-[0_0_35px_rgba(16,185,129,0.3)] transition-all duration-300 select-none cursor-pointer text-left p-5 min-h-[260px]"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span>DISPONIBLE PARA COLONIZAR</span>
                  </span>
                  <span className="text-xs font-mono text-emerald-400/80 font-bold">
                    Ranura #{rawPlanets.length + slotIdx + 1}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center text-center my-4 py-2">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-400/50 flex items-center justify-center bg-emerald-950/30 group-hover:scale-105 group-hover:border-emerald-300 transition-all shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                    <span className="text-5xl drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">🪐</span>
                  </div>
                  <h4 className="text-lg font-black text-white uppercase tracking-wider mt-3 group-hover:text-emerald-300 transition-colors">
                    Nuevo Mundo Colonizable
                  </h4>
                  <p className="text-xs text-slate-300 font-mono mt-1 max-w-xs">
                    Hueco imperial habilitado. Despacha una nave colonizadora desde el Mapa Galáctico o Flota para fundar una nueva colonia.
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-300 font-bold flex items-center gap-1.5">
                    <span>🌌</span>
                    <span>Explorar Galaxia</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-xl shadow-md transition-colors flex items-center gap-1">
                    <span>Colonizar</span>
                    <span>➔</span>
                  </span>
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* ── MODO 2: MATRIZ COMPACTA DE MUNDOS (CERO SCROLL PARA IMPERIOS EXTENSOS) ── */}
      {viewMode === 'table' && (
        <PlanetTableView
          filteredPlanets={filteredPlanets}
          currentPlanet={currentPlanet}
          fmt={fmt}
          dispatch={dispatch}
          calcProduction={calcProduction}
          GAME_SPEED={GAME_SPEED}
          handleSelectPlanetAndNavigate={handleSelectPlanetAndNavigate}
          handleOpenDetail={handleOpenDetail}
        />
      )}

      {/* ── MODAL A PANTALLA COMPLETA DE FICHA COMPLETA ── */}
      {selectedPlanetDetail && (
        <PlanetFullDetailModal
          planet={selectedPlanetDetail}
          state={state}
          dispatch={dispatch}
          onClose={() => setSelectedPlanetDetail(null)}
          onSelectPlanet={handleSelectPlanetAndNavigate}
          fmt={fmt}
        />
      )}
    </section>
  );
};
