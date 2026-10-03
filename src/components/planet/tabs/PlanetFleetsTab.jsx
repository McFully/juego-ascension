import React from 'react';

export const PlanetFleetsTab = ({
  ships,
  SHIPS,
  totalShipsCount,
  fmt
}) => {
  return (
    <div className="p-6 rounded-3xl bg-[#070b1a] border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
          <span>🛸</span>
          <span>Naves en Hangar y Órbita Planetaria</span>
        </h4>
        <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/50 px-3 py-1 rounded-xl border border-blue-500/30">
          Total Naves: {fmt(totalShipsCount)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(SHIPS).map(([sId, sData]) => {
          const count = ships[sId] || 0;
          return (
            <div
              key={sId}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between font-mono ${
                count > 0
                  ? 'bg-black/60 border-blue-500/40 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  : 'bg-black/20 border-white/5 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{sData.icon || '🚀'}</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{sData.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {sData.cat === 'civil' ? `Carga: ${fmt(sData.cargo)}` : `Ataque: ${fmt(sData.atk)}`}
                  </div>
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-2 border-t border-white/5">
                <span className="text-[10px] text-slate-400 uppercase">Estacionadas</span>
                <span className={`text-xl font-black ${count > 0 ? 'text-blue-400' : 'text-slate-600'}`}>
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
