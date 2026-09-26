import React from 'react';

/**
 * FleetRetrofitQueueSection — Muestra las órdenes activas de modernización en curso en el hangar.
 * Soporta entrega progresiva unidad a unidad y cancelación de cola con reembolso parcial.
 */
export const FleetRetrofitQueueSection = ({ retrofitQueues, SHIPS, fmt, fmtTime, ProgressBar, dispatch }) => {
  if (!retrofitQueues || retrofitQueues.length === 0) return null;

  return (
    <div className="p-4 rounded-3xl bg-[#0b1024]/90 border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          <span>Dársenas de Modernización Activa ({retrofitQueues.length}/5)</span>
        </h4>
        <span className="text-[10px] font-mono text-slate-400">
          Entrega progresiva unidad a unidad
        </span>
      </div>

      <div className="space-y-2.5">
        {retrofitQueues.map(item => {
          const s = SHIPS[item.baseId];
          const totalQty = item.quantity;
          const delivered = item.unitsDelivered || 0;
          const remainingQty = Math.max(1, totalQty - delivered);
          const remainingTime = Math.max(0, (item.endTime - Date.now()) / 1000);
          const totalTime = Math.max(1, (item.endTime - item.startTime) / 1000);

          return (
            <div
              key={item.id}
              className="bg-slate-950/70 rounded-2xl border border-white/10 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-amber-400/40 transition-colors"
            >
              <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                <span className="text-xl">🔧</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white">
                      {fmt(remainingQty)}x {s?.name || item.baseId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      ➔ Mk.{item.targetTechGen || '?'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-400 font-bold">✓ {delivered} ya modernizadas</span>
                    <span>•</span>
                    <span className="text-cyan-300 font-semibold">⏱ Quedan {fmtTime(remainingTime)}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-[140px] px-1">
                <ProgressBar
                  value={totalTime - remainingTime}
                  max={totalTime}
                  color="from-amber-500 via-amber-400 to-cyan-400"
                  height="h-2"
                />
              </div>

              <button
                onClick={() => {
                  if (dispatch) {
                    dispatch({ type: 'CANCEL_RETROFIT_QUEUE', queueId: item.id });
                    if (window.playSfx) window.playSfx('click');
                  }
                }}
                className="px-3 py-1.5 text-[11px] font-mono font-bold bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/40 rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                title="Cancelar modernización de unidades restantes y reembolsar 50% de recursos"
              >
                <span>✕</span>
                <span>Cancelar ({fmt(remainingQty)} uds - 50%)</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
