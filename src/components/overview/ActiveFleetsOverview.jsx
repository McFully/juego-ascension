import React from 'react';

export const ActiveFleetsOverview = ({ fleetMissions, dispatch, ProgressBar, fmtTime, S, onNavigate }) => {
  const playerMissions = (fleetMissions || []).filter(m => !m.isAI);
  if (playerMissions.length === 0) return null;

  return (
    <div className={S.cardDeep}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">🛸 Flotas en Vuelo</h3>
        {onNavigate && (
          <button
            onClick={() => onNavigate('fleet')}
            className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer"
          >
            Mando de Flota ➔
          </button>
        )}
      </div>
      <div className="space-y-2">
        {playerMissions.map(m => {
          const isReturning = m.returning;
          const remaining = Math.max(0, (isReturning ? (m.returnTime - Date.now()) : (m.arrivalTime - Date.now())) / 1000);
          const total = (isReturning ? (m.returnTime - (m.returnDeparture || m.departure)) : (m.arrivalTime - m.departure)) / 1000;
          const ships = Object.values(m.fleet || {}).reduce((a, b) => a + b, 0);
          return (
            <div key={m.id} className="bg-slate-950/50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-semibold capitalize">{isReturning ? `🚀 ${m.type} (regreso)` : m.type}</span>
                  <span className="text-xs text-slate-400 ml-2">
                    {isReturning ? `← [${m.from.galaxy}:${m.from.system}:${m.from.position}]` : `→ [${m.to.galaxy}:${m.to.system}:${m.to.position}]`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!isReturning && (
                    <button onClick={() => dispatch({ type: 'CANCEL_MISSION', missionId: m.id })} className="text-xs text-red-400 hover:text-red-300">
                      ✕ Cancelar
                    </button>
                  )}
                  <div className="text-xs text-cyan-400">{ships} naves • {fmtTime(remaining)}</div>
                </div>
              </div>
              <ProgressBar value={total - remaining} max={total} color="from-cyan-500 to-blue-500" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveFleetsOverview;
