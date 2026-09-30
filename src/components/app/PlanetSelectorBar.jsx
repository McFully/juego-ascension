import React, { useState } from "react";

/**
 * PlanetSelectorBar — Barra horizontal táctica de selección y renombrado rápido de colonias.
 */
export const PlanetSelectorBar = ({
  planets = [],
  currentPlanetId,
  currentPlanet,
  dispatch,
  className = ""
}) => {
  const [renamingId, setRenamingId] = useState(null);

  if (!planets || planets.length <= 1) return null;

  return (
    <div className={`w-full z-40 border-b border-white/10 bg-[#05070f]/85 backdrop-blur-md px-4 py-2 overflow-x-auto custom-scrollbar select-none ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest shrink-0 mr-1">
          🌍 Colonias:
        </span>
        {planets.map(p => {
          const isActive = p.id === currentPlanetId;
          const isRenaming = renamingId === p.id;

          return (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-mono transition-all shrink-0 ${
                isActive
                  ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {isRenaming ? (
                <input
                  autoFocus
                  className="bg-[#09152b] text-cyan-200 border border-cyan-400/80 rounded px-1.5 py-0.5 text-xs font-mono outline-none max-w-[130px]"
                  defaultValue={p.name}
                  maxLength={24}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      if (e.target.value.trim()) {
                        dispatch({ type: "RENAME_PLANET", planetId: p.id, name: e.target.value.trim() });
                      }
                      setRenamingId(null);
                    }
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  onBlur={e => {
                    if (e.target.value.trim()) {
                      dispatch({ type: "RENAME_PLANET", planetId: p.id, name: e.target.value.trim() });
                    }
                    setRenamingId(null);
                  }}
                />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isActive) {
                        dispatch({ type: "SET_PLANET", payload: p.id });
                        if (window.playSfx) window.playSfx('click');
                      }
                    }}
                    className="font-bold cursor-pointer hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>{p.isHome ? '👑' : '🪐'}</span>
                    <span>{p.name}</span>
                  </button>

                  <span className="text-[10px] opacity-60 font-mono">
                    [{p.galaxy}:{p.system}:{p.position}]
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setRenamingId(p.id);
                      if (window.playSfx) window.playSfx('click');
                    }}
                    className="cursor-pointer opacity-50 hover:opacity-100 hover:text-cyan-300 transition-all text-xs"
                    title="Renombrar colonia"
                    aria-label={`Renombrar ${p.name}`}
                  >
                    ✏️
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanetSelectorBar;
