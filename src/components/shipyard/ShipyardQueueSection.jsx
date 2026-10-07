import React from 'react';
import { calcRemainingSeconds, calcTotalSeconds } from '../../core.jsx';

/**
 * ShipyardQueueSection — Panel de visualización y gestión de la cola activa de ensamblaje naval.
 */
export const ShipyardQueueSection = ({ shipQueues = [], customShipQueue = [], blueprints = [], SHIPS, fmt, fmtTime, ProgressBar, dispatch }) => {
  const hasStandard = shipQueues && shipQueues.length > 0;
  const hasCustom = customShipQueue && customShipQueue.length > 0;
  if (!hasStandard && !hasCustom) return null;

  const totalLines = (shipQueues?.length || 0) + (customShipQueue?.length || 0);

  return (
    <div className="p-4 rounded-2xl bg-[#0a0d1a]/80 border border-amber-500/30 backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          Línea de Ensamblaje en Curso ({totalLines}/10)
        </h4>
      </div>

      {/* Naves Estándar */}
      {hasStandard && (
        <div className="space-y-2">
          {shipQueues.map(item => {
            const s = SHIPS[item.shipId];
            const totalQty = item.quantity;
            const delivered = item.unitsDelivered || 0;
            const remainingQty = Math.max(1, totalQty - delivered);
            const remainingTime = calcRemainingSeconds(item.endTime);
            const totalTime = calcTotalSeconds(item.startTime, item.endTime);
            return (
              <div key={item.id} className="bg-slate-950/60 rounded-xl border border-white/5 p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                  <span className="text-base">{s?.icon || '🚀'}</span>
                  <span className="font-bold text-white">{fmt(remainingQty)}x {s?.name || item.shipId}</span>
                  <span className="text-[10px] text-slate-400">({delivered} listos)</span>
                  <span className="text-cyan-400 font-bold ml-2">⏱ {fmtTime(remainingTime)}</span>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <ProgressBar value={totalTime - remainingTime} max={totalTime} color="from-cyan-500 to-blue-500" height="h-1.5" />
                </div>
                <button
                  onClick={() => dispatch({ type: 'CANCEL_SHIP_QUEUE', queueId: item.id })}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg transition-all shrink-0 flex items-center gap-1 focus-ring-game cursor-pointer"
                  title="Cancelar naves restantes y reembolsar 50% de recursos"
                >
                  ✕ Cancelar (50%)
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Naves Prototipadas / Personalizadas */}
      {hasCustom && (
        <div className="space-y-2 border-t border-cyan-500/20 pt-2">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
            ⚡ Prototipos Personalizados en Construcción:
          </div>
          {customShipQueue.map(item => {
            const bp = blueprints.find(b => b.id === item.blueprintId);
            const remainingTime = calcRemainingSeconds(item.endTime);
            const totalTime = calcTotalSeconds(item.startTime, item.endTime);
            return (
              <div key={item.id} className="bg-cyan-950/30 rounded-xl border border-cyan-500/20 p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                  <span className="text-base">🛠️</span>
                  <span className="font-bold text-cyan-200">{fmt(item.quantity)}x {bp?.name || 'Diseño Prototipo'}</span>
                  <span className="text-cyan-400 font-bold ml-2">⏱ {fmtTime(remainingTime)}</span>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <ProgressBar value={totalTime - remainingTime} max={totalTime} color="from-cyan-400 to-indigo-500" height="h-1.5" />
                </div>
                <button
                  onClick={() => dispatch({ type: 'CANCEL_CUSTOM_SHIP_QUEUE', queueId: item.id })}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg transition-all shrink-0 flex items-center gap-1 focus-ring-game cursor-pointer"
                  title="Cancelar ensamblaje personalizado y reembolsar 50%"
                >
                  ✕ Cancelar (50%)
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShipyardQueueSection;
