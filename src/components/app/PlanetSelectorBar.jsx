import React from "react";

export const PlanetSelectorBar = ({
  planets,
  currentPlanetId,
  currentPlanet,
  renaming,
  setRenaming,
  dispatch,
  S
}) => {
  if (!planets || planets.length <= 1) return null;

  return (
    <div className="absolute top-16 left-0 md:left-52 right-0 z-50 border-b border-white/10 bg-[#05070f]/70 px-4 py-2 overflow-x-auto">
      <div className="flex gap-2">
        {planets.map(p =>
          p.id === currentPlanetId ? (
            <div key={p.id} className={`${S.planetPill} ${S.planetPillActive} flex items-center gap-2 pr-1.5`}>
              {renaming ? (
                <input autoFocus className={S.input + " text-sm py-0.5 px-1.5 max-w-[120px]"} defaultValue={currentPlanet?.name}
                  maxLength={20}
                  onKeyDown={e => { if (e.key === "Enter") { dispatch({ type: "RENAME_PLANET", planetId: currentPlanet.id, name: e.target.value }); setRenaming(false); } if (e.key === "Escape") setRenaming(false); }}
                  onBlur={e => { dispatch({ type: "RENAME_PLANET", planetId: currentPlanet.id, name: e.target.value }); setRenaming(false); }} />
              ) : (
                <>
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-[10px] opacity-60">[{p.galaxy}:{p.system}:{p.position}]</span>
                  <button onClick={() => setRenaming(true)} className="ml-1 cursor-pointer hover:text-[var(--ue-accent)] opacity-50 hover:opacity-100 transition-all text-xs" title="Renombrar">✏️</button>
                </>
              )}
            </div>
          ) : (
            <div key={p.id} className={`${S.planetPill} ${S.planetPillInactive} flex items-center gap-2 pr-1.5`}>
              <span onClick={() => dispatch({ type: "SET_PLANET", payload: p.id })} className="cursor-pointer font-semibold">{p.name}</span>
              <span className="text-[10px] opacity-65">[{p.galaxy}:{p.system}:{p.position}]</span>
              <button onClick={() => { dispatch({ type: "SET_PLANET", payload: p.id }); setTimeout(() => setRenaming(true), 50); }} className="ml-1 cursor-pointer hover:text-[var(--ue-accent)] opacity-40 hover:opacity-100 transition-all text-xs" title="Renombrar">✏️</button>
            </div>
          )
        )}
      </div>
    </div>
  );
};
