import React, { useState } from 'react';
import { SafeImg } from '../../assets.jsx';
import { canShipReachTarget } from '../../utils/fleetClassification.js';
import { SHIPS } from '../../data/gameData.js';

export const FleetSelectionList = ({ 
  state, 
  dispatch, 
  currentPlanet, 
  target,
  selectedShips, 
  setSelectedShips, 
  filter, 
  setFilter, 
  availableShips, 
  shipDisplayIcon, 
  shipDisplayName, 
  shipStats, 
  toggleShip, 
  fmt, 
  S 
}) => {
  const [search, setSearch] = useState('');

  const combatIds = ['lightFighter','heavyFighter','cruiser','battleship','bomber','destroyer','deathstar','planetDestroyer'];
  const sortedShips = [...availableShips].sort((a, b) => {
    const aIsCombat = combatIds.includes(a[0]) || a[0].startsWith('custom_');
    const bIsCombat = combatIds.includes(b[0]) || b[0].startsWith('custom_');
    if (aIsCombat !== bIsCombat) return aIsCombat ? -1 : 1;
    return (b[1] || 0) - (a[1] || 0);
  }).filter(([id]) => !search || shipDisplayName(id).toLowerCase().includes(search.toLowerCase()));

  const totalAtk = sortedShips.reduce((acc, [id, qty]) => { const st = shipStats(id); return acc + (st?.atk || 0) * qty; }, 0);
  const totalHull = sortedShips.reduce((acc, [id, qty]) => { const st = shipStats(id); return acc + (st?.hull || 0) * qty; }, 0);
  const totalShd = sortedShips.reduce((acc, [id, qty]) => { const st = shipStats(id); return acc + (st?.shd || 0) * qty; }, 0);

  const totalCargoCap = Object.entries(selectedShips).reduce((acc, [id, qty]) => {
    const s = shipStats(id);
    return acc + ((s?.cargo || 0) * qty);
  }, 0);

  const totalSelectedCount = Object.values(selectedShips).reduce((a, b) => a + b, 0);

  const handleSetShipExact = (id, exactVal, maxQty) => {
    const targetVal = Math.max(0, Math.min(maxQty, Math.floor(exactVal)));
    setSelectedShips(prev => {
      if (targetVal <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: targetVal };
    });
  };

  const handleClearAll = () => {
    setSelectedShips({});
    if (window.playSfx) window.playSfx('click');
  };

  const handleSelectAll = () => {
    const all = {};
    sortedShips.forEach(([id, maxQty]) => {
      if (maxQty > 0) all[id] = maxQty;
    });
    setSelectedShips(all);
    if (window.playSfx) window.playSfx('click');
  };

  return (
    <div className="bg-[#0a0d1a]/85 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🚀</span>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight">Despacho y Asignación de Escuadrones</h3>
            <p className="text-[10px] font-mono text-cyan-400">Selecciona las unidades asignadas a esta misión táctica</p>
          </div>
        </div>

        {/* Telemetría rápida */}
        <div className="flex items-center gap-3 text-xs font-mono bg-[#05070f]/80 border border-white/8 px-3.5 py-2 rounded-xl shadow-inner">
          <span className="text-red-400 font-bold">⚔️ {fmt(totalAtk)}</span>
          <span className="text-cyan-400 font-bold">🛡️ {fmt(totalShd)}</span>
          <span className="text-emerald-400 font-bold">💪 {fmt(totalHull)}</span>
          <span className="text-slate-300 font-bold">🛸 {sortedShips.reduce((a, [,q]) => a + q, 0)} en hangar</span>
        </div>
      </div>

      {/* Buscador + Acciones Globales + Presets */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            placeholder="🔍 Filtrar por modelo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-[#05070f] border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
          />
          <button
            onClick={handleSelectAll}
            className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 hover:text-white transition cursor-pointer shrink-0"
            title="Asignar todas las naves filtradas a la misión"
          >
            ⚡ Desplegar Todo
          </button>
          {totalSelectedCount > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 hover:text-white transition cursor-pointer shrink-0"
              title="Vaciar selección de naves"
            >
              🛑 Despejar
            </button>
          )}
        </div>

        {/* Fleet Presets */}
        {(state.fleetPresets || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] text-slate-500 uppercase font-mono mr-1">Presets:</span>
            {(state.fleetPresets || []).map(p => (
              <div key={p.name} className="flex items-center bg-[#05070f] rounded-lg border border-white/10 text-xs overflow-hidden">
                <button
                  onClick={() => {
                    const preset = {};
                    for (const [id, qty] of Object.entries(p.fleet)) {
                      const maxQty = currentPlanet.fleet[id] || 0;
                      if (maxQty > 0) preset[id] = Math.min(qty, maxQty);
                    }
                    setSelectedShips(preset);
                  }}
                  className="px-2.5 py-1 text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition font-mono"
                >
                  📋 {p.name}
                </button>
                <button
                  onClick={() => dispatch({ type: 'DELETE_FLEET_PRESET', name: p.name })}
                  className="px-1.5 py-1 text-red-400/60 hover:text-red-300 hover:bg-red-500/10 border-l border-white/10"
                  title="Eliminar preset"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filtros de escuadrón */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: '🚀 Todas las Naves' },
          { id: 'combat', label: '⚔️ Armada Militar' },
          { id: 'civilian', label: '📦 Apoyo y Cargueros' },
        ].map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all focus-ring-game ${filter === btn.id ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]' : 'bg-[#05070f] text-slate-400 border border-white/8 hover:text-white'}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Grid de naves para despliegue */}
      {sortedShips.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#05070f]/50 border border-white/5 text-slate-500 text-xs font-mono">
          No hay naves operativas de esta categoría en los hangares de {currentPlanet.name}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 tile-stagger">
          {sortedShips.map(([id, maxQty]) => {
            const sel = selectedShips[id] || 0;
            const icon = shipDisplayIcon(id);
            const name = shipDisplayName(id);
            const st = shipStats(id);
            const isSelected = sel > 0;
            const canReach = !target || canShipReachTarget(id, currentPlanet, target, SHIPS);
            const sDef = SHIPS[id];

            return (
              <div
                key={id}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden relative ${
                  !canReach
                    ? 'bg-[#080509]/80 border-amber-500/25 opacity-75'
                    : isSelected
                      ? 'bg-gradient-to-b from-[#0e1d3b]/90 to-[#070d1e] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                      : 'bg-[#05070f]/80 border-white/10 hover:border-white/25 hover:bg-[#070c1e]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                      <SafeImg id={id} fallbackText={icon} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate" title={name}>{name}</div>
                      <div className="text-xs font-mono mt-0.5">
                        <span className={isSelected ? 'text-cyan-300 font-black' : 'text-slate-400'}>{sel}</span>
                        <span className="text-slate-500"> / {maxQty}</span>
                      </div>
                      {sDef?.drive && (
                        <span className={`text-[8px] font-mono px-1 py-0.2 rounded mt-0.5 inline-block ${
                          sDef.drive === 'combustion' ? 'text-amber-400 bg-amber-950/40' : sDef.drive === 'impulse' ? 'text-cyan-400 bg-cyan-950/40' : 'text-purple-400 bg-purple-950/40'
                        }`}>
                          {sDef.drive === 'combustion' ? '🔥 Sistémico' : sDef.drive === 'impulse' ? '💨 Sectorial' : '🌀 Interestelar'}
                        </span>
                      )}
                    </div>
                  </div>

                  {!canReach && (
                    <div className="text-[9px] font-mono text-amber-300/90 bg-amber-950/40 border border-amber-500/30 p-1.5 rounded-lg mb-2 text-center">
                      ⚠️ Fuera de rango para este destino
                    </div>
                  )}

                  {st && (
                    <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-slate-300 p-1.5 rounded-lg bg-black/40 border border-white/5 mb-3 text-center">
                      <span title="Ataque">⚔️ {st.atk?.toFixed?.(0) || st.atk}</span>
                      <span title="Escudos">🛡️ {st.shd?.toFixed?.(0) || st.shd}</span>
                      <span title="Bodega">📦 {fmt(st.cargo || 0)}</span>
                    </div>
                  )}
                </div>

                {/* Botones de acción rápida por nave */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex gap-1">
                    <button onClick={() => toggleShip(id, -1)} className="px-2 py-1 bg-white/5 hover:bg-white/15 text-slate-300 rounded-lg text-[10px] font-mono font-bold flex-1">-1</button>
                    <button onClick={() => toggleShip(id, 1)} disabled={!canReach} className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex-1 ${!canReach ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 'bg-white/5 hover:bg-white/15 text-slate-300'}`}>+1</button>
                    <button onClick={() => toggleShip(id, 10)} disabled={!canReach} className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex-1 ${!canReach ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 'bg-white/5 hover:bg-white/15 text-slate-300'}`}>+10</button>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleSetShipExact(id, maxQty / 2, maxQty)} disabled={!canReach} className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex-1 ${!canReach ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 'bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300'}`}>50%</button>
                    <button onClick={() => handleSetShipExact(id, maxQty, maxQty)} disabled={!canReach} className={`px-2 py-1 rounded-lg text-[10px] font-mono font-black flex-1 shadow-sm ${!canReach ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}>MAX</button>
                    {sel > 0 && (
                      <button onClick={() => handleSetShipExact(id, 0, maxQty)} className="px-2 py-1 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 rounded-lg text-[10px] font-mono font-bold">0</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Capacidad de Carga Total Seleccionada */}
      {totalSelectedCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-cyan-300 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-base">📦</span>
            <span>Capacidad de transporte asignada:</span>
            <span className="font-black text-white text-sm">{fmt(totalCargoCap)} uds</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Total Naves en Operación:</span>
            <span className="font-black text-cyan-300 text-sm">{fmt(totalSelectedCount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
