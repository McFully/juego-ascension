import React from 'react';

export const ActivePatrolCard = ({
  patrol,
  isCurrent,
  state,
  currentPlanet,
  SHIPS,
  reinforcePatrolId,
  setReinforcePatrolId,
  shipsToReinforce,
  setShipsToReinforce,
  availableShips,
  toggleReinforceShip,
  handleReinforce,
  handleRecall
}) => {
  const isReinforcing = reinforcePatrolId === patrol.id;
  const homePlanet = state.planets.find(p => p.id === patrol.homePlanetId);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isCurrent
          ? 'bg-gradient-to-r from-[#0c1830]/90 to-[#070e1c] border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
          : 'bg-[#060a14] border-slate-800/80'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {patrol.patrolType === 'orbital' ? '🛡️' : '🚨'}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm font-mono">{patrol.planetName}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 uppercase">
                {patrol.patrolType === 'orbital' ? 'Orbital' : 'Sistema Solar'}
              </span>
              {isCurrent ? (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  LOCAL
                </span>
              ) : (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                  COLONIA
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Sector [{patrol.galaxy}:{patrol.system}:{patrol.position}]
              {homePlanet && homePlanet.id !== patrol.planetId ? ` • Base: ${homePlanet.name}` : ''}
              {` • Mantenimiento: ~${patrol.hourlyFuel || 0} D/hora`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (isReinforcing) {
                setReinforcePatrolId(null);
                setShipsToReinforce({});
              } else {
                setReinforcePatrolId(patrol.id);
                setShipsToReinforce({});
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-[11px] font-mono font-bold text-blue-300 transition-colors"
          >
            {isReinforcing ? '✕ Cancelar' : '➕ Reforzar'}
          </button>

          <button
            type="button"
            onClick={() => handleRecall(patrol.id)}
            className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-[11px] font-mono font-bold text-rose-300 transition-colors"
          >
            ⚓ Retornar
          </button>
        </div>
      </div>

      {/* Resumen de Flota en Patrulla */}
      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
        {Object.entries(patrol.fleet || {}).map(([sId, sQty]) => (
          <span key={sId} className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300">
            {SHIPS[sId]?.name || sId}: <b className="text-cyan-300">{sQty}</b>
          </span>
        ))}
      </div>

      {/* Modal integrado de Refuerzo */}
      {isReinforcing && (
        <div className="mt-3 p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 space-y-2">
          <div className="text-xs font-bold text-blue-300 font-mono">
            Reforzar patrulla con naves de {currentPlanet.name}:
          </div>
          {availableShips.length === 0 ? (
            <div className="text-[11px] text-slate-400 font-mono">No hay naves en el hangar local para transferir.</div>
          ) : (
            <div className="space-y-1.5">
              {availableShips.map(([id, qty]) => (
                <div key={id} className="flex items-center justify-between text-xs font-mono bg-slate-900/60 p-1.5 rounded">
                  <span className="text-white truncate">{SHIPS[id]?.name || id} ({qty})</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleReinforceShip(id, -1)}
                      className="px-1 bg-slate-800 text-slate-300 rounded"
                    >-</button>
                    <span className="w-6 text-center text-cyan-300 font-bold">{shipsToReinforce[id] || 0}</span>
                    <button
                      type="button"
                      onClick={() => toggleReinforceShip(id, 1)}
                      className="px-1 bg-slate-800 text-slate-300 rounded"
                    >+</button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleReinforce(patrol.id)}
                className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase transition-colors"
              >
                Confirmar Refuerzo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
