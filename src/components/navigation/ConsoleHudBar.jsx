import React from 'react';
import { useNavigation } from './NavigationContext.jsx';
import { ResourceBar } from '../ui/ResourceBar.jsx';

export const ConsoleHudBar = React.memo(({
  currentPlanet,
  planets,
  research,
  taxRate,
  safeCalcProduction,
  calcStorage,
  GAME_SPEED,
  attackCount,
  unreadNotifs,
  effectiveSoundEnabled,
  toggleSound,
  onOpenSettings,
  dispatch
}) => {
  const { activeView, navigateBack, breadcrumbs } = useNavigation();
  const isHub = activeView === 'overview';

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-2 bg-[#05070f]/90 backdrop-blur-md border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-2">
        {!isHub ? (
          <button
            onClick={navigateBack}
            className="breadcrumb-back flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25 hover:border-cyan-400 hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95 cursor-pointer"
            title="Volver al menú principal (Backspace / Escape)"
          >
            <span className="text-sm">◀</span>
            <span className="font-mono uppercase tracking-wider">Menú Principal</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/40 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="text-base">🎮</span>
            <span className="text-xs font-black tracking-widest text-cyan-300 uppercase font-mono">
              Consola Central
            </span>
          </div>
        )}

        {!isHub && breadcrumbs.length > 1 && (
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span className="text-slate-600">/</span>
            <span className="text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              {breadcrumbs[breadcrumbs.length - 1]?.label}
            </span>
          </div>
        )}

        {planets && planets.length > 1 && (
          <div className="flex items-center gap-1 ml-2">
            <select
              value={currentPlanet?.id}
              onChange={(e) => dispatch({ type: 'SET_PLANET', payload: e.target.value })}
              className="bg-[#0a0f1d] text-xs font-mono text-cyan-300 border border-cyan-500/30 rounded-lg px-2 py-1 outline-none focus:border-cyan-400 cursor-pointer"
            >
              {planets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.galaxy}:{p.system}:{p.position}]
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex-1 max-w-2xl">
        <ResourceBar
          currentPlanet={currentPlanet}
          research={research}
          taxRate={taxRate}
          safeCalcProduction={safeCalcProduction}
          calcStorage={calcStorage}
          GAME_SPEED={GAME_SPEED}
        />
      </div>

      <div className="flex items-center gap-2">
        {attackCount > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono font-bold animate-pulse">
            <span>🚨</span>
            <span>{attackCount} ATAQUE{attackCount > 1 ? 'S' : ''}</span>
          </div>
        )}

        {unreadNotifs > 0 && (
          <div className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
            🔔 {unreadNotifs}
          </div>
        )}

        <button
          onClick={toggleSound}
          className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-500/40 hover:bg-white/5 transition-all text-slate-400 hover:text-cyan-300 cursor-pointer"
          title={effectiveSoundEnabled ? "Silenciar audio" : "Activar audio"}
        >
          <span className="text-sm">{effectiveSoundEnabled ? "🔊" : "🔇"}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-500/40 hover:bg-white/5 transition-all text-slate-400 hover:text-cyan-300 cursor-pointer"
          title="Opciones del Sistema"
        >
          <span className="text-sm">⚙️</span>
        </button>
      </div>
    </header>
  );
});
