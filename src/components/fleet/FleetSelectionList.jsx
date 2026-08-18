import React, { useState } from 'react';

export const FleetSelectionList = ({ 
  state, 
  dispatch, 
  currentPlanet, 
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

  return (
    <div className={S.cardDeep}>
      <h3 className="text-lg font-semibold mb-3">🚀 Selecciona Naves</h3>

      {/* Fleet Power Summary */}
      <div className="flex flex-wrap gap-3 mb-3 text-xs font-mono bg-black/20 rounded-lg p-2 border border-white/5">
        <span>⚔️ <span className="text-red-400">{fmt(totalAtk)}</span></span>
        <span>🛡️ <span className="text-cyan-400">{fmt(totalShd)}</span></span>
        <span>💪 <span className="text-emerald-400">{fmt(totalHull)}</span></span>
        <span>🚀 <span className="text-slate-300">{sortedShips.reduce((a, [,q]) => a + q, 0)}</span> naves</span>
      </div>

      {/* Search input */}
      <input
        placeholder="🔍 Buscar nave..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className={S.input + ' text-xs mb-2 w-full'}
      />

      {/* Fleet Presets - Premium glass */}
      {(state.fleetPresets || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {(state.fleetPresets || []).map(p => (
            <div key={p.name} className="flex items-center glass rounded-lg border border-white/10 text-xs">
              <button onClick={() => {
                const preset = {};
                for (const [id, qty] of Object.entries(p.fleet)) {
                  const maxQty = currentPlanet.fleet[id] || 0;
                  if (maxQty > 0) preset[id] = Math.min(qty, maxQty);
                }
                setSelectedShips(preset);
              }} className="px-2 py-1 hover:text-[var(--ue-accent)]">
                📋 {p.name}
              </button>
              <button onClick={() => dispatch({ type: 'DELETE_FLEET_PRESET', name: p.name })} className="px-1.5 text-red-400/70 hover:text-red-400 border-l border-white/10">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Save current selection as preset */}
      {Object.keys(selectedShips).length > 0 && (
        <div className="flex gap-1 mb-3 items-center">
          <input
            id="preset-name"
            className={S.input + ' text-xs py-1 w-28'}
            placeholder="Nombre preset"
            onKeyDown={e => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                const fleet = Object.fromEntries(Object.entries(selectedShips).filter(([, v]) => v > 0));
                dispatch({ type: 'SAVE_FLEET_PRESET', name: e.target.value.trim(), fleet });
                e.target.value = '';
              }
            }}
          />
          <button onClick={() => {
            const input = document.getElementById('preset-name');
            if (input?.value?.trim()) {
              const fleet = Object.fromEntries(Object.entries(selectedShips).filter(([, v]) => v > 0));
              dispatch({ type: 'SAVE_FLEET_PRESET', name: input.value.trim(), fleet });
              input.value = '';
            }
          }} className={`${S.btnSmall} ${S.btnSuccess}`}>
            💾 Guardar
          </button>
        </div>
      )}

      {/* Group Filters */}
      <div className={S.tabBar + " mb-3"}>
        {[
          { id: 'all', label: '🚀 Todas' },
          { id: 'combat', label: '⚔️ Militar' },
          { id: 'civilian', label: '📦 Civil / Utilitario' },
        ].map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={`${S.tab} ${filter === btn.id ? S.tabActive : S.tabInactive} text-xs py-1 flex-none`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {sortedShips.length === 0 ? (
        <p className="text-slate-400 text-sm">No tienes naves disponibles.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {sortedShips.map(([id, maxQty]) => {
            const sel = selectedShips[id] || 0;
            const icon = shipDisplayIcon(id);
            const name = shipDisplayName(id);
            return (
              <div key={id} className={`p-2 rounded-xl border transition-all glass ${sel > 0 ? 'border-[var(--ue-accent)]/50' : 'border-white/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{name}</div>
                    <div className="text-xs text-slate-400">{sel} / {maxQty}</div>
                  </div>
                </div>
                {(() => { 
                  const st = shipStats(id); 
                  if (!st) return null; 
                  return (
                    <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 mb-2">
                      <span>⚔️{st.atk?.toFixed?.(1) || st.atk}</span>
                      <span>🛡️{st.shd?.toFixed?.(1) || st.shd}</span>
                      <span>💪{fmt(st.hull)}</span>
                    </div>
                  ); 
                })()}
                <div className="flex gap-1">
                  <button onClick={() => toggleShip(id, -1)} className={`${S.btnSmall} ${S.btnDanger}`}>-1</button>
                  <button onClick={() => toggleShip(id, 1)} className={`${S.btnSmall} ${S.btnSuccess}`}>+1</button>
                  <button onClick={() => toggleShip(id, 10)} className={`${S.btnSmall} ${S.btnSuccess}`}>+10</button>
                  <button onClick={() => toggleShip(id, 100)} className={`${S.btnSmall} ${S.btnSuccess}`}>+100</button>
                  <button onClick={() => toggleShip(id, maxQty)} className={`${S.btnSmall} ${S.btnEmissive}`}>MAX</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {Object.keys(selectedShips).length > 0 && (
        <div className="text-xs text-slate-400 mt-2">
          Capacidad de carga: {fmt(Object.entries(selectedShips).reduce((acc, [id, qty]) => {
            const s = shipStats(id);
            return acc + ((s?.cargo || 0) * qty);
          }, 0))} unidades
        </div>
      )}
    </div>
  );
};
