import React, { useState, useEffect } from 'react';
import { fmtTime, calcRemainingSeconds, calcTotalSeconds } from '../../../core.jsx';

/**
 * SingleQueueRow: Muestra una línea de construcción con su progreso y botón de cancelar.
 */
const SingleQueueRow = ({ item, index, isFirst, totalCount, onCancelItem }) => {
  const [remainingTime, setRemainingTime] = useState(() => calcRemainingSeconds(item?.endTime));

  useEffect(() => {
    if (!item?.endTime) {
      setRemainingTime(0);
      return;
    }
    const updateTime = () => setRemainingTime(calcRemainingSeconds(item.endTime));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [item?.endTime]);

  const totalDuration = calcTotalSeconds(item?.startTime, item?.endTime);
  const progressPct = Math.min(100, Math.max(0, Math.round(((totalDuration - remainingTime) / totalDuration) * 100)));

  return (
    <div className="w-full bg-black/80 backdrop-blur-md rounded-lg p-1.5 border border-white/10 shadow-lg space-y-1 transition-all">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-amber-400 text-xs animate-spin-slow shrink-0">⏱</span>
          <span className="text-[9px] font-mono font-black text-amber-300 uppercase truncate">
            {isFirst ? 'En curso' : `Cola #${index + 1}`}:
          </span>
          <span className="text-[10px] font-mono font-bold text-cyan-300 shrink-0">
            Nv.{item.level}
          </span>
          <span className="text-[10px] font-mono font-black text-white tabular-nums shrink-0 ml-1">
            {fmtTime(remainingTime)}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-500/30">
            {progressPct}%
          </span>
          {onCancelItem && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancelItem(item);
              }}
              className="w-4 h-4 rounded bg-red-950/80 hover:bg-red-700 border border-red-500/50 text-red-200 hover:text-white flex items-center justify-center text-[9px] font-black transition-all cursor-pointer shadow-sm active:scale-90"
              title={isFirst && totalCount > 1 ? "Cancelar primer nivel (cancelará todos)" : "Cancelar este nivel (reembolso 50%)"}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="w-full h-1 bg-black/80 rounded-full overflow-hidden border border-white/10">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_6px_rgba(245,158,11,0.6)]"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
};

/**
 * ItemCardActiveOverlay — Overlay en la imagen que muestra la orden o múltiples órdenes
 * apiladas desde abajo hacia arriba, con tiempo restante, porcentaje y botón de cancelación individual.
 */
export const ItemCardActiveOverlay = React.memo(({
  activeQueueItem,
  queueItems = [],
  onCancelQueueItem
}) => {
  // Unificar lista de órdenes en cola para esta tarjeta
  const items = queueItems && queueItems.length > 0 
    ? queueItems 
    : (activeQueueItem ? [activeQueueItem] : []);

  if (items.length === 0) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/85 to-transparent p-2 z-20 flex flex-col justify-end max-h-[85%] overflow-y-auto space-y-1.5 select-none pointer-events-auto">
      {items.map((item, idx) => (
        <SingleQueueRow
          key={item.id || idx}
          item={item}
          index={idx}
          isFirst={idx === 0}
          totalCount={items.length}
          onCancelItem={onCancelQueueItem}
        />
      ))}
    </div>
  );
});
