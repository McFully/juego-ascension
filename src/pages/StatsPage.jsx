import React from 'react';

const StatsPage = ({ state, ACHIEVEMENTS, SHIPS, DEFENSES, S, fmt, fmtTime }) => {
  return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className={S.cardDeep}>
      <h3 className="text-lg font-semibold mb-3">📊 Estadísticas Generales</h3>
      <div className="space-y-1 text-sm">
        <div className={S.statRow}><span className="text-[var(--ue-text-dim)]">Jugador</span><span className="data-text">{state.playerName}</span></div>
        <div className={S.statRow}><span className="text-[var(--ue-text-dim)]">Tiempo jugado</span><span className="data-text">{fmtTime(state.stats.playTime)}</span></div>
        <div className={S.statRow}><span className="text-[var(--ue-text-dim)]">Planetas</span><span className="data-text">{state.planets.length}</span></div>
      </div>
    </div>

    <div className={S.cardDeep}>
      <h3 className="text-lg font-semibold mb-3">⚔️ Combates</h3>
      <div className="space-y-1 text-sm">
        <div className={S.statRow}><span className="text-emerald-400">Victorias</span><span className="font-bold data-text">{state.stats.combatsWon}</span></div>
        <div className={S.statRow}><span className="text-red-400">Derrotas</span><span className="font-bold data-text">{state.stats.combatsLost}</span></div>
        <div className={S.statRow}><span className="text-amber-400">Empates</span><span className="font-bold data-text">{state.stats.combatsDraw}</span></div>
        <div className={S.statRow}><span className="text-[var(--ue-text-dim)]">Ratio victoria</span><span className="data-text">{
          state.stats.combatsWon + state.stats.combatsLost > 0
            ? ((state.stats.combatsWon / (state.stats.combatsWon + state.stats.combatsLost)) * 100).toFixed(1) + '%'
            : 'N/A'
        }</span></div>
      </div>
    </div>

    <div className={S.cardDeep}>
      <h3 className="text-lg font-semibold mb-3">🏗️ Producción</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-slate-400">Edificios totales</span><span>{state.stats.totalBuildings}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Naves construidas</span><span>{fmt(state.stats.totalShips)}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Defensas construidas</span><span>{fmt(state.stats.totalDefenses)}</span></div>
      </div>
    </div>

    <div className={S.cardDeep}>
      <h3 className="text-lg font-semibold mb-3">💎 Recursos Recolectados</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-amber-400">⛏️ Metal</span><span>{fmt(state.stats.metalGathered)}</span></div>
        <div className="flex justify-between"><span className="text-cyan-400">💎 Cristal</span><span>{fmt(state.stats.crystalGathered)}</span></div>
        <div className="flex justify-between"><span className="text-emerald-400">⚗️ Deuterio</span><span>{fmt(state.stats.deuteriumGathered)}</span></div>
      </div>
    </div>

    <div className={`${S.card} md:col-span-2`}>
      <h3 className="text-lg font-semibold mb-3">🌍 Tus Planetas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {state.planets.map(p => {
          const bld = Object.values(p.buildings).reduce((a, b) => a + b, 0);
          const ships = Object.values(p.fleet).reduce((a, b) => a + b, 0);
          return (
            <div key={p.id} className="bg-slate-950/50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-slate-400 font-mono">[{p.galaxy}:{p.system}:{p.position}]</div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
                <div>🌡️ {p.temperature}°C</div>
                <div>🏗️ {bld} edificios</div>
                <div>🚀 {ships} naves</div>
                <div>{p.isHome ? '🏠 Natal' : '🏴 Colonia'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Achievements */}
    <div className={`${S.card} md:col-span-2`}>
      <h3 className="text-lg font-semibold mb-3">🏆 Logros ({(state.achievements||[]).length}/{ACHIEVEMENTS.length})</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {ACHIEVEMENTS.map(a => {
          const unlocked = (state.achievements || []).includes(a.id);
          return (
            <div key={a.id} className={`p-2 rounded-lg text-xs border ${unlocked ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-950/30 border-slate-800 opacity-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{a.icon}</span>
                <span className={`font-semibold ${unlocked ? 'text-amber-300' : 'text-slate-500'}`}>{a.name}</span>
              </div>
              <div className="text-slate-400">{a.desc}</div>
              {unlocked && <div className="text-amber-400 text-[10px] mt-1">✅ Desbloqueado</div>}
            </div>
          );
        })}
      </div>
    </div>

    {/* Fleet Presets */}
    {state.fleetPresets.length > 0 && (
      <div className={`${S.card} md:col-span-2`}>
        <h3 className="text-lg font-semibold mb-3">🚀 Presets de Flota ({(state.fleetPresets||[]).length})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {state.fleetPresets.map(p => (
            <div key={p.name} className="glass rounded-xl p-2 text-xs border border-white/10">
              <div className="font-semibold text-cyan-300 mb-1">{p.name}</div>
              {Object.entries(p.fleet).map(([id, qty]) => (
                <div key={id} className="text-slate-400 flex justify-between">
                  <span>{(SHIPS[id] || DEFENSES[id])?.name || id}</span>
                  <span className="text-cyan-400">{qty}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
  );
};

export default StatsPage;
