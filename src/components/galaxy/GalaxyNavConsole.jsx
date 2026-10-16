import React from 'react';

export const GalaxyNavConsole = ({
  galaxy,
  setGalaxy,
  system,
  setSystem,
  knownGalaxies = [1],
  maxKnownSystem = 15
}) => {
  const currentGalIdx = knownGalaxies.indexOf(galaxy);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Selector de Galaxia (Texto estricto: Galaxia) */}
      <div className="bg-[#0b1021]/90 border border-white/10 p-3 rounded-2xl w-full flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] text-slate-400 font-mono uppercase font-bold">
            Galaxia
          </label>
        </div>

        <div className="flex items-center justify-between gap-1">
          {knownGalaxies.length > 1 && (
            <button
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                const prevIdx = Math.max(0, currentGalIdx - 1);
                setGalaxy(knownGalaxies[prevIdx]);
              }}
              disabled={currentGalIdx <= 0}
              className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all focus-ring-game flex items-center justify-center shrink-0 ${
                currentGalIdx <= 0
                  ? 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/40 cursor-pointer'
              }`}
              title="Galaxia anterior"
            >
              ←
            </button>
          )}

          <div className="flex items-center justify-center gap-1.5 flex-1">
            {knownGalaxies.map(g => (
              <button
                key={g}
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  setGalaxy(g);
                }}
                className={`flex-1 max-w-[42px] h-8 text-xs rounded-lg font-mono font-bold transition-all focus-ring-game cursor-pointer shrink-0 ${
                  galaxy === g
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
                title={`Galaxia ${g}`}
              >
                {g}
              </button>
            ))}
          </div>

          {knownGalaxies.length > 1 && (
            <button
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                const nextIdx = Math.min(knownGalaxies.length - 1, currentGalIdx + 1);
                setGalaxy(knownGalaxies[nextIdx]);
              }}
              disabled={currentGalIdx >= knownGalaxies.length - 1}
              className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all focus-ring-game flex items-center justify-center shrink-0 ${
                currentGalIdx >= knownGalaxies.length - 1
                  ? 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/40 cursor-pointer'
              }`}
              title="Galaxia siguiente"
            >
              →
            </button>
          )}
        </div>
      </div>

      {/* Selector de Sistema Solar (Sin spoilers de alcance total) */}
      <div className="bg-[#0b1021]/90 border border-white/10 p-3 rounded-2xl w-full flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] text-slate-400 font-mono uppercase font-bold">Sistema Solar</label>
        </div>

        <div className="flex items-center gap-1.5">
          {maxKnownSystem > 1 && (
            <>
              <button
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  setSystem(s => Math.max(1, s - 10));
                }}
                disabled={system <= 1}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/40 text-xs font-mono font-bold transition-all focus-ring-game cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="-10 Sistemas"
              >
                ⟪ -10
              </button>
              <button
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  setSystem(s => Math.max(1, s - 1));
                }}
                disabled={system <= 1}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/40 text-xs font-mono font-bold transition-all focus-ring-game cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Sistema anterior"
              >
                ←
              </button>
            </>
          )}

          <div className="flex-1 text-center bg-black/50 py-1 px-2 rounded-lg border border-cyan-500/30 flex items-center justify-center">
            <span className="font-mono text-cyan-300 font-black text-lg tracking-wider">
              {system}
            </span>
          </div>

          {maxKnownSystem > 1 && (
            <>
              <button
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  setSystem(s => Math.min(maxKnownSystem, s + 1));
                }}
                disabled={system >= maxKnownSystem}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/40 text-xs font-mono font-bold transition-all focus-ring-game cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Sistema siguiente"
              >
                →
              </button>
              <button
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  setSystem(s => Math.min(maxKnownSystem, s + 10));
                }}
                disabled={system >= maxKnownSystem}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/40 text-xs font-mono font-bold transition-all focus-ring-game cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="+10 Sistemas"
              >
                +10 ⟫
              </button>
            </>
          )}
        </div>

        {maxKnownSystem > 1 && (
          <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-white/5">
            <div className="flex items-center gap-1 text-xs font-mono">
              <span className="text-[10px] text-slate-500 uppercase">Saltos:</span>
              {[1, 5, 10, 20, maxKnownSystem].filter((v, i, a) => v <= maxKnownSystem && a.indexOf(v) === i).map(num => (
                <button
                  key={num}
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    setSystem(Math.min(maxKnownSystem, num));
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    system === num
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Ir:</span>
              <input
                type="number"
                min={1}
                max={maxKnownSystem}
                value={system}
                onChange={e => setSystem(Math.max(1, Math.min(maxKnownSystem, parseInt(e.target.value) || 1)))}
                className="w-16 px-1.5 py-0.5 text-xs bg-black/80 border border-cyan-500/30 rounded-lg text-cyan-300 font-mono text-center font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
