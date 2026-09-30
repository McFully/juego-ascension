import React from 'react';
import { ActionCardTile } from '../ui/ActionCardTile.jsx';
import { calcRemainingSeconds, calcTotalSeconds } from '../../core.jsx';

export const DefenseQueueSection = ({ defQueues, DEFENSES, fmt, fmtTime, ProgressBar, dispatch }) => {
  if (!defQueues || defQueues.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-[#0a0d1a]/80 border border-emerald-500/30 backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Despliegue y Calibración en Curso ({defQueues.length}/5)
        </h4>
      </div>
      <div className="space-y-2">
        {defQueues.map(item => {
          const d = DEFENSES[item.defenseId];
          const totalQty = item.quantity;
          const delivered = item.unitsDelivered || 0;
          const remainingQty = Math.max(1, totalQty - delivered);
          const remainingTime = calcRemainingSeconds(item.endTime);
          const totalTime = calcTotalSeconds(item.startTime, item.endTime);
          return (
            <div key={item.id} className="bg-slate-950/60 rounded-xl border border-white/5 p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                <span className="text-base">{d?.icon || '🛡️'}</span>
                <span className="font-bold text-white">{fmt(remainingQty)}x {d?.name || item.defenseId}</span>
                <span className="text-[10px] text-slate-400">({delivered} apostados)</span>
                <span className="text-emerald-400 font-bold ml-2">⏱ {fmtTime(remainingTime)}</span>
              </div>
              <div className="flex-1 min-w-[120px]">
                <ProgressBar value={totalTime - remainingTime} max={totalTime} color="from-emerald-500 to-teal-500" height="h-1.5" />
              </div>
              <button
                onClick={() => dispatch({ type: 'CANCEL_DEFENSE_QUEUE', queueId: item.id })}
                className="px-2.5 py-1 text-[11px] font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg transition-all shrink-0 flex items-center gap-1 focus-ring-game"
                title="Cancelar construcciones restantes y reembolsar 50% de recursos"
              >
                ✕ Cancelar (50%)
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
