import React from 'react';

export const DestinationSelectorSection = React.memo(({
  target,
  setSelectedTarget,
  currentPlanet,
  shipDisplayIcon,
  shipDisplayName,
  shipStats,
  fmt,
  S
}) => {
  return (
    <div className={S.cardDeep}>
      <h3 className="text-lg font-semibold mb-3">🎯 Destino</h3>
      {target ? (
        <div className="flex items-center justify-between bg-slate-950/50 rounded-lg p-3">
          <div>
            <div className="font-mono text-cyan-400">[{target.galaxy}:{target.system}:{target.position}]</div>
            <div className="text-sm text-slate-400">
              {target.occupied ? (target.isAI ? "Planeta IA" : "Tu planeta") : "Espacio vacío"}
            </div>
          </div>
          <button onClick={() => setSelectedTarget(null)} className={S.btnGhost + " " + S.btn}>✕</button>
        </div>
      ) : (
        <div>
          <p className="text-slate-400 text-sm mb-4">Selecciona un destino en la vista de Galaxia para enviar flotas en misiones tácticas.</p>
          
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">🛸 Inventario de Flota en {currentPlanet.name}</h4>
            {Object.entries(currentPlanet.fleet || {}).filter(([_, q]) => q > 0).length === 0 ? (
              <p className="text-slate-500 text-xs italic font-mono bg-black/20 p-4 rounded-xl border border-white/5">No hay naves estacionadas en este hangar local.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(currentPlanet.fleet || {}).filter(([_, q]) => q > 0).map(([id, maxQty]) => {
                  const icon = shipDisplayIcon(id);
                  const name = shipDisplayName(id);
                  const st = shipStats(id);
                  return (
                    <div key={id} className="p-3 rounded-xl border border-white/5 glass bg-black/20 relative overflow-hidden group hover:border-[var(--ue-accent)]/30 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">{name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Disponibles: <span className="text-cyan-400 font-bold">{maxQty}</span></div>
                        </div>
                      </div>
                      {st && (
                        <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-500 font-mono mt-2 pt-2 border-t border-white/5">
                          <span title="Ataque">⚔️ {st.atk?.toFixed?.(1) || st.atk}</span>
                          <span title="Escudos">🛡️ {st.shd?.toFixed?.(1) || st.shd}</span>
                          <span title="Casco">💪 {fmt(st.hull)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
