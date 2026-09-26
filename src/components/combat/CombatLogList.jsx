import React from 'react';

export const CombatLogList = ({ filteredLogs, visibleLogsCount, setVisibleLogsCount, onSelectReport, state, fmt }) => {
  return (
    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
      {filteredLogs.slice().reverse().slice(0, visibleLogsCount).map(c => {
        const isPlayerAtk = c.attacker.name === state.playerName;
        const isPlayerDef = c.defender.name === state.playerName;
        const playerWon = (isPlayerAtk && c.result.winner === 'attacker') || (isPlayerDef && c.result.winner === 'defender');
        const playerLost = (isPlayerAtk && c.result.winner === 'defender') || (isPlayerDef && c.result.winner === 'attacker');
        const winText = playerWon ? '🏆 Victoria' : playerLost ? '💀 Derrota' : '🤝 Empate';
        
        return (
          <div
            key={c.id}
            onClick={() => onSelectReport(c)}
            className={`p-2.5 rounded-xl border cursor-pointer bg-slate-950/40 hover:bg-slate-900/60 transition-all ${
              playerWon ? 'border-emerald-500/25 hover:border-emerald-500/50' : playerLost ? 'border-red-500/25 hover:border-red-500/50' : 'border-amber-500/25 hover:border-amber-500/50'
            }`}
          >
            <div className="flex justify-between items-center mb-1 text-[11px]">
              <span className={`font-bold uppercase tracking-wider ${playerWon ? 'text-emerald-400' : playerLost ? 'text-red-400' : 'text-amber-400'}`}>
                {winText}
              </span>
              <span className="font-mono text-slate-500 text-[9px]">{new Date(c.timestamp).toLocaleString()}</span>
            </div>
            <div className="text-[11px] text-slate-300">
              <span className="text-white font-semibold">{c.attacker.name}</span> → <span className="text-white font-semibold">{c.defender.name}</span> · {c.result.rounds.length} rondas
            </div>
            <div className="flex gap-3 text-[10px] text-slate-400 mt-1 flex-wrap font-mono">
              {c.summary?.formation && <span className="capitalize text-cyan-400">⚔️ {c.summary.formation}</span>}
              <span>💀 Bajas: {c.summary?.atkLostTotal || 0} Atk / {c.summary?.defLostTotal || 0} Def</span>
              <span>⛏️ {fmt(c.result.debris.metal)}M · {fmt(c.result.debris.crystal)}C</span>
            </div>
          </div>
        );
      })}

      {filteredLogs.length > visibleLogsCount && (
        <button 
          onClick={() => setVisibleLogsCount(prev => prev + 10)}
          className="w-full py-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all uppercase cursor-pointer font-mono"
        >
          Cargar más registros (+10)
        </button>
      )}

      {filteredLogs.length === 0 && (
        <div className="text-xs text-slate-500 italic text-center py-12">
          No hay operaciones registradas en esta categoría.
        </div>
      )}
    </div>
  );
};
