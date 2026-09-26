import React from 'react';
import { fmtTime } from '../../core.jsx';
import { S } from '../../styles.js';
import { ProgressBar } from './ProgressBar.jsx';

export const QueueDisplay = React.memo(({ title, icon, queue, names, color, onCancel }) => {
  if (!queue || queue.length === 0) return null;
  return (
    <div className={`${S.cardInner} mb-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <span className="font-semibold">{title}</span>
        <span className={`${S.badge} bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`}>{queue.length}</span>
      </div>
      <div className="space-y-2">
        {queue.map((item, idx) => {
          const nameKey = item.buildingId || item.researchId || item.shipId || item.defenseId;
          const info = names[nameKey];
          const remaining = Math.max(0, (item.endTime - Date.now()) / 1000);
          const total = (item.endTime - item.startTime) / 1000;
          return (
            <div key={item.id || idx} className={S.listItem}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-sm">
                  <span>{info?.icon || '📦'}</span>
                  <span>{info?.name || nameKey}</span>
                  {item.level && <span className="text-xs text-slate-400">→ Nv.{item.level}</span>}
                  {item.quantity > 1 && <span className="text-xs text-cyan-400">x{item.quantity}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400">
                    {fmtTime(remaining)} ({total > 0 ? Math.min(100, Math.floor(((total - remaining) / total) * 100)) : 0}%)
                  </span>
                  {onCancel && <button onClick={() => onCancel(item.id)} className="text-[10px] text-red-400/50 hover:text-red-300">✕</button>}
                </div>
              </div>
              <ProgressBar value={total - remaining} max={total} color="from-cyan-500 to-blue-500" pulse={remaining < 5} />
            </div>
          );
        })}
      </div>
    </div>
  );
});
