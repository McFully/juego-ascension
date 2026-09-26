import React from "react";

export const IncomingInvasionsAlert = ({ incomingAttacks, attackPredictions, state, dispatch, currentPlanet, fmtTime, ProgressBar }) => {
  if (incomingAttacks.length === 0) return null;

  const patrols = state.patrols || [];

  return (
    <div className="bg-red-950/20 border-2 border-red-500/30 rounded-2xl p-4 space-y-3 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.05)]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 uppercase tracking-tight">
          <span className="material-symbols-outlined text-red-500 animate-pulse text-xl">emergency_home</span>
          🚨 Invasión Hostil Detectada en el Sistema
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          {patrols.length} patrullas activas para interceptación
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {incomingAttacks.map(m => {
          const remaining = Math.max(0, (m.arrivalTime - Date.now()) / 1000);
          const total = (m.arrivalTime - m.departure) / 1000;
          const ships = Object.values(m.fleet || {}).reduce((a, b) => a + b, 0);
          const pred = attackPredictions[m.id] || { color: "text-red-500 border-red-500/40 bg-red-950/20", text: "Amenaza" };
          const borderClass = pred.color.split(" ").find(c => c.startsWith("border-")) || "border-red-500/40";
          const bgClass = pred.color.split(" ").find(c => c.startsWith("bg-")) || "bg-red-950/20";
          const targetPlanet = state.planets.find(p => p.id === m.toPlanetId) || state.planets.find(p => p.galaxy === m.to?.galaxy && p.system === m.to?.system && p.position === m.to?.position);

          // Buscar patrullas asignadas a este objetivo o a su sistema
          const eligiblePatrols = patrols.filter(p => {
            if (targetPlanet && p.planetId === targetPlanet.id) return true;
            if (targetPlanet && p.galaxy === targetPlanet.galaxy && p.system === targetPlanet.system && p.patrolType === 'system') return true;
            return false;
          });

          return (
            <div key={m.id} className={"bg-black/40 border " + borderClass + " " + bgClass + " rounded-xl p-3 space-y-2.5"}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold text-red-400 flex flex-wrap items-center gap-1.5">
                    <span>FLOTA ENEMIGA EN RUTA</span>
                    <span className={"text-[9px] px-1.5 py-0.5 rounded border font-semibold " + pred.color}>
                      {pred.text}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Objetivo: <span className="text-white font-medium">{targetPlanet?.name || "Colonia"}</span>
                    <span className="text-[10px] font-mono text-slate-500 ml-1.5">
                      [{targetPlanet?.galaxy || 1}:{targetPlanet?.system || 1}:{targetPlanet?.position || 1}]
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-red-400">{fmtTime(remaining)}</div>
                  <div className="text-[10px] text-slate-500 font-mono">~{ships} naves detectadas</div>
                </div>
              </div>

              <ProgressBar value={total - remaining} max={total} color="from-red-600 to-rose-500" height="h-1.5" />

              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-white/5">
                <span>Composición: {Object.entries(m.fleet || {}).map(([id, q]) => q > 0 ? `${q}x ${id}` : null).filter(Boolean).slice(0, 2).join(", ")}...</span>
                <span className="text-slate-500 font-mono">
                  [{m.originCoords?.galaxy || 1}:{m.originCoords?.system || 1}:{m.originCoords?.position || 1}]
                </span>
              </div>

              {/* Botones de Intercepción Anticipada */}
              {eligiblePatrols.length > 0 && (
                <div className="pt-2 border-t border-red-500/20 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase font-bold text-cyan-300 flex items-center justify-between">
                    <span>🛡️ Intercepción Anticipada Disponible:</span>
                    <span className="text-slate-400 font-normal">{eligiblePatrols.length} patrulla(s) en sector</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {eligiblePatrols.map(patrol => {
                      const pShips = Object.values(patrol.fleet || {}).reduce((a, b) => a + b, 0);
                      return (
                        <button
                          key={patrol.id}
                          onClick={() => {
                            if (dispatch) {
                              dispatch({
                                type: 'INTERCEPT_INVASION',
                                invasionId: m.id,
                                patrolId: patrol.id
                              });
                              if (window.playSfx) window.playSfx('combat');
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600/90 to-amber-600/90 hover:from-red-500 hover:to-amber-500 text-white font-mono text-[10px] font-bold shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Lanzar combate en órbita alta antes de que la invasión aterrice"
                        >
                          <span>⚡</span>
                          <span>Interceptar con {patrol.planetName} ({pShips} naves)</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
