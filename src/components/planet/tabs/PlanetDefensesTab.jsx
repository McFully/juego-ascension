import React from 'react';

export const PlanetDefensesTab = ({
  defenses,
  DEFENSES,
  totalDefensesCount,
  fmt
}) => {
  return (
    <div className="p-6 rounded-3xl bg-[#070b1a] border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
          <span>🛡️</span>
          <span>Defensas Planetarias Activas</span>
        </h4>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-500/30">
          Total Unidades: {fmt(totalDefensesCount)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(DEFENSES).map(([dId, dData]) => {
          const count = defenses[dId] || 0;
          return (
            <div
              key={dId}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between font-mono ${
                count > 0
                  ? 'bg-black/60 border-emerald-500/40 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'bg-black/20 border-white/5 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{dData.icon || '🛡️'}</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{dData.name}</div>
                  <div className="text-[10px] text-slate-400">Ataque: {fmt(dData.atk)} · Escudo: {fmt(dData.shd)}</div>
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-2 border-t border-white/5">
                <span className="text-[10px] text-slate-400 uppercase">En Batería</span>
                <span className={`text-xl font-black ${count > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {fmt(count)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
