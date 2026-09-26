import React from 'react';
import { getMaxPlanets, getUsedColonySlots } from '../../utils/formulas.js';

const SYS_MAX = { 1: 500, 2: 389, 3: 389, 4: 389, 5: 389, 6: 389, 7: 389, 8: 389, 9: 389, 10: 389 };
const GALS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const GalaxyNavConsole = ({
  state,
  galaxy,
  setGalaxy,
  system,
  setSystem,
  sysMax,
  gSum,
  currentPlanet,
  onGoToCurrentPlanet,
  navigateTo,
  setActiveTab,
  S
}) => {
  const isAtCurrentPlanet = currentPlanet && currentPlanet.galaxy === galaxy && currentPlanet.system === system;
  const astroLvl = state?.research?.astrophysics || 0;
  const maxPlanets = getMaxPlanets(astroLvl);
  const usedSlots = getUsedColonySlots(state);

  return (
    <section className="bg-[#0b1021]/90 border border-cyan-500/25 rounded-2xl p-4 md:p-5 shadow-[0_0_30px_rgba(6,182,212,0.1)] space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/8 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌌</span>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Cartografía Estelar del Imperio</h2>
            <p className="text-[10px] text-cyan-400 font-mono uppercase">Exploración de Cuadrantes · Sensores de Espacio Profundo</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón táctico directo para volver a la posición de mi planeta */}
          {currentPlanet && (
            <button
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                if (onGoToCurrentPlanet) {
                  onGoToCurrentPlanet();
                } else {
                  setGalaxy(currentPlanet.galaxy);
                  setSystem(currentPlanet.system);
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                isAtCurrentPlanet
                  ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-[#05070f] border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-white'
              }`}
              title={`Centrar mapa en mi colonia: ${currentPlanet.name} [${currentPlanet.galaxy}:${currentPlanet.system}:${currentPlanet.position}]`}
            >
              <span className="text-base">🪐</span>
              <span>Ir a Mi Planeta [{currentPlanet.galaxy}:{currentPlanet.system}]</span>
            </button>
          )}

          <div className="flex items-center gap-4 text-xs font-mono bg-[#05070f]/80 border border-white/8 px-4 py-2 rounded-xl">
            <div className="flex items-center gap-2" title={`Límite del Imperio determinado por Astrofísica (Nivel ${astroLvl})`}>
              <span className="text-cyan-400">Imperio:</span>
              <span className={`font-bold text-sm ${usedSlots >= maxPlanets ? 'text-amber-400' : 'text-emerald-300'}`}>
                {usedSlots}/{maxPlanets}
              </span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-cyan-300">En Galaxia:</span>
              <span className="font-bold text-white text-sm">{gSum ? gSum(galaxy).my : 0}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-red-400">Planetas IA:</span>
              <span className="font-bold text-red-300">{gSum ? gSum(galaxy).ai : 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selectores de Cuadrante Galáctico y Sistema Solar */}
      <div className="flex flex-col lg:flex-row items-stretch gap-4">
        {/* Selector de Galaxia Ajustado al Ancho Exacto del Botón 10 */}
        <div className="bg-[#05070f]/70 border border-white/8 p-3 rounded-xl flex flex-col justify-between shrink-0 w-full lg:w-fit">
          <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1.5 font-bold">Cuadrante Galáctico</label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                setGalaxy(g => Math.max(1, g - 1));
              }}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/40 text-xs font-bold transition-all focus-ring-game flex items-center justify-center shrink-0 cursor-pointer"
              title="Galaxia anterior"
            >
              ←
            </button>

            <div className="flex items-center gap-1">
              {GALS.map(g => (
                <button
                  key={g}
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    setGalaxy(g);
                  }}
                  className={`w-7 h-8 text-xs rounded-lg font-mono font-bold transition-all focus-ring-game cursor-pointer shrink-0 ${
                    galaxy === g
                      ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                  title={`Saltar a Galaxia ${g}`}
                >
                  {g}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                setGalaxy(g => Math.min(10, g + 1));
              }}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/40 text-xs font-bold transition-all focus-ring-game flex items-center justify-center shrink-0 cursor-pointer"
              title="Galaxia siguiente"
            >
              →
            </button>
          </div>
          <div className="mt-2 text-center text-xs font-mono font-bold text-cyan-300 bg-black/40 py-1 rounded-lg border border-white/5">
            Galaxia Activa: {galaxy}
          </div>
        </div>

        {/* Selector de Sistema Solar Botonable y Ampliado */}
        <div className="bg-[#05070f]/70 border border-white/8 p-3 rounded-xl flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-slate-400 font-mono uppercase font-bold">Sistema Solar</label>
            <span className="text-[10px] text-slate-500 font-mono">1 a {sysMax}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                setSystem(s => Math.max(1, s - 10));
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/40 text-xs font-mono font-bold transition-all focus-ring-game cursor-pointer"
              title="-10 Sistemas"
            >
              ⟪ -10
            </button>
            <button
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                setSystem(s => Math.max(1, s - 1));
              }}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/40 text-xs font-mono font-bold transition-all focus-ring-game cursor-pointer"
              title="Sistema anterior"
            >
              ←
            </button>

            <div className="flex-1 text-center bg-black/50 py-1.5 px-3 rounded-lg border border-cyan-500/30 flex items-center justify-center gap-2">
              <span className="font-mono text-cyan-300 font-black text-xl tracking-wider">
                Sistema {system}
              </span>
            </div>

            <button
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                setSystem(s => Math.min(sysMax, s + 1));
              }}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/40 text-xs font-mono font-bold transition-all focus-ring-game cursor-pointer"
              title="Sistema siguiente"
            >
              →
            </button>
            <button
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                setSystem(s => Math.min(sysMax, s + 10));
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/40 text-xs font-mono font-bold transition-all focus-ring-game cursor-pointer"
              title="+10 Sistemas"
            >
              +10 ⟫
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-white/5">
            {/* Saltos directos comunes */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-[10px] text-slate-500 uppercase">Saltos:</span>
              {[1, 50, 100, 200, sysMax].map(num => (
                <button
                  key={num}
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    setSystem(Math.min(sysMax, num));
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    system === num
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Ir a Sistema:</span>
              <input
                type="number"
                min={1}
                max={sysMax}
                value={system}
                onChange={e => setSystem(Math.max(1, Math.min(sysMax, parseInt(e.target.value) || 1)))}
                className="w-20 px-2 py-1 text-xs bg-black/80 border border-cyan-500/30 rounded-lg text-cyan-300 font-mono text-center font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
