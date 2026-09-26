import React from "react";

export const SpyReportsSection = ({ spyReports, BUILDINGS, SHIPS, DEFENSES, fmt, S }) => {
  if (!spyReports || spyReports.length === 0) return null;

  return (
    <div className={S.cardDeep}>
      <h3 className="text-lg font-semibold mb-3">👁️ Informes de Espionaje</h3>
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {spyReports.slice().reverse().slice(0, 10).map(r => {
          const hasResources = r.resources && (typeof r.resources.metal === "number" || r.resources.metal === "parcial" || r.resources.metal === "???");
          const hasBuildings = r.buildings && Object.keys(r.buildings).length > 0;
          const hasFleet = r.fleet && Object.keys(r.fleet).length > 0;
          const hasDefenses = r.defenses && Object.keys(r.defenses).length > 0;
          const hasExtended = r.extendedInfo;

          return (
            <div key={r.id} className="glass rounded-xl p-3.5 border border-white/10 space-y-3 transition-colors hover:border-[var(--ue-accent)]/30">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <div>
                  <span className="font-semibold text-sm text-cyan-300">{r.target?.name || r.targetName}</span>
                  <span className="text-xs text-slate-500 font-mono ml-2">
                    [{r.coords?.galaxy || r.target?.galaxy}:{r.coords?.system || r.target?.system}:{r.coords?.position || r.target?.position}]
                  </span>
                </div>
                <span className={"text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider " + (
                  r.intelLevel === "full" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" :
                  r.intelLevel === "high" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                  r.intelLevel === "medium" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                  r.intelLevel === "low" ? "bg-slate-800 text-slate-400" :
                  "bg-red-500/20 text-red-300 border border-red-500/30"
                )}>
                  Intel: {r.intelLevel}
                </span>
              </div>

              {/* Resources */}
              {hasResources && (
                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950/80 p-2 rounded border border-slate-900">
                  <div>
                    <span className="text-amber-400 mr-1.5">⛏️</span> 
                    <span className="font-mono text-slate-300">
                      {typeof r.resources.metal === "number" ? fmt(r.resources.metal) : r.resources.metal}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400 mr-1.5">💎</span> 
                    <span className="font-mono text-slate-300">
                      {typeof r.resources.crystal === "number" ? fmt(r.resources.crystal) : r.resources.crystal}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400 mr-1.5">⚗️</span> 
                    <span className="font-mono text-slate-300">
                      {typeof r.resources.deuterium === "number" ? fmt(r.resources.deuterium) : r.resources.deuterium}
                    </span>
                  </div>
                </div>
              )}

              {/* Tabbed details */}
              <div className="space-y-1.5 text-xs">
                {hasBuildings && (
                  <div className="text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-300">🏢 Edificios:</span>{" "}
                    {Object.entries(r.buildings).filter(([, v]) => v > 0).map(([k, v]) => `${BUILDINGS[k]?.name || k} (${v})`).join(", ") || "Ninguno"}
                  </div>
                )}
                {hasFleet && (
                  <div className="text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-300">🚀 Flota:</span>{" "}
                    {r.fleet.estimated ? (
                      <span className="text-amber-400/90 italic font-medium">Presencia de flota detectada (Sensores insuficientes para recuento)</span>
                    ) : r.fleet.none ? (
                      <span className="text-slate-500 italic">No se detectaron naves en órbita</span>
                    ) : (
                      Object.entries(r.fleet).filter(([, v]) => v > 0).map(([k, v]) => `${SHIPS[k]?.name || k} (${v})`).join(", ") || "Ninguna"
                    )}
                  </div>
                )}
                {hasDefenses && (
                  <div className="text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-300">🛡️ Defensas:</span>{" "}
                    {Object.entries(r.defenses).filter(([, v]) => v > 0).map(([k, v]) => `${DEFENSES[k]?.name || k} (${v})`).join(", ") || "Ninguna"}
                  </div>
                )}
                {hasExtended && (
                  <div className="border-t border-slate-900/60 pt-2 mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-400 bg-cyan-950/10 p-2 rounded">
                    <div><span className="font-semibold text-cyan-400/80 mr-1">Estrategia:</span> {r.extendedInfo.strategy}</div>
                    <div><span className="font-semibold text-cyan-400/80 mr-1">Agresión:</span> {(r.extendedInfo.aggression * 100).toFixed(0)}%</div>
                    <div><span className="font-semibold text-cyan-400/80 mr-1">Récord Combate:</span> {r.extendedInfo.totalWins}V / {r.extendedInfo.totalLosses}D</div>
                    <div><span className="font-semibold text-cyan-400/80 mr-1">Predicción:</span> {r.extendedInfo.behaviorPrediction}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
