import React from "react";
import { SafeImg } from "../../assets.jsx";

/**
 * InFlightMissionsSection — Subcomponente modularizado para monitorear flotas en vuelo.
 * Extraído de FleetPage para reducir tamaño y acelerar el renderizado.
 */
export const InFlightMissionsSection = React.memo(({
  playerActiveMissions = [],
  state,
  dispatch,
  shipDisplayName,
  shipDisplayIcon,
  fmtTime
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-[#090d1f]/90 border border-blue-500/25 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            🚀
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
              Flotas en Vuelo y Vectores de Misión
            </h3>
            <p className="text-xs text-blue-400 font-mono">
              Seguimiento de misiones activas de ataque, transporte, reciclaje y exploración
            </p>
          </div>
        </div>

        {playerActiveMissions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-black/30 border border-white/5 text-slate-500 text-xs font-mono">
            No hay misiones tácticas en vuelo actualmente. Las flotas aguardan órdenes en los hangares planetarios.
          </div>
        ) : (
          <div className="space-y-3">
            {playerActiveMissions.map(m => {
              const isReturning = m.returning;
              const remaining = Math.max(0, (isReturning ? (m.returnTime - Date.now()) : (m.arrivalTime - Date.now())) / 1000);
              const total = Math.max(1, (isReturning ? (m.returnTime - (m.returnDeparture || m.departure)) : (m.arrivalTime - m.departure)) / 1000);
              const pct = Math.min(100, Math.max(0, Math.round(((total - remaining) / total) * 100)));

              const typeMap = {
                colonize: 'Colonización',
                transport: 'Transporte',
                attack: 'Ataque',
                espionage: 'Espionaje',
                recycle: 'Reciclaje',
                recycling: 'Reciclaje',
                planet_destruction: 'Destrucción',
                expedition: 'Expedición'
              };
              const typeLabel = typeMap[m.type] || (m.type ? m.type.charAt(0).toUpperCase() + m.type.slice(1) : 'Tránsito');

              const planets = state?.planets || [];
              const originPlanet = m.from?.id ? planets.find(p => p.id === m.from.id) : (m.from?.name ? planets.find(p => p.name === m.from.name) : planets.find(p => p.galaxy === m.from?.galaxy && p.system === m.from?.system && p.position === m.from?.position));
              const originName = originPlanet?.name || m.from?.name || 'Base';
              const originCoords = `[${m.from?.galaxy || 1}:${m.from?.system || 1}:${m.from?.position || 1}]`;
              const destCoords = `[${m.to?.galaxy || 1}:${m.to?.system || 1}:${m.to?.position || 1}]`;
              const targetPlanet = planets.find(p => p.galaxy === m.to?.galaxy && p.system === m.to?.system && p.position === m.to?.position);
              const destName = m.to?.name || targetPlanet?.name || null;

              return (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/50 border border-white/10 hover:border-blue-400/50 transition-all select-none"
                >
                  {/* 1. Misión, Planeta Origen y Objetivo */}
                  <div className="flex flex-col min-w-[150px] leading-tight space-y-0.5">
                    <span className="text-xs font-black text-white uppercase tracking-wide">
                      {isReturning ? `Misión de ${typeLabel} (Regreso)` : `Misión de ${typeLabel}`}
                    </span>
                    <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                      <span className="text-slate-400">Desde:</span>
                      <span className="text-emerald-300 font-bold">🪐 {originName}</span>
                      <span className="text-slate-400 text-[10px]">{originCoords}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                      <span className="text-slate-400">{isReturning ? 'Hacia:' : 'Objetivo:'}</span>
                      <span className="text-cyan-300 font-bold">
                        {isReturning ? `${originName} ${originCoords}` : (destName ? `${destName} ${destCoords}` : destCoords)}
                      </span>
                    </div>
                  </div>

                  {/* 2. Recuadros con imagen de cada nave y cantidad */}
                  <div className="flex flex-wrap items-center gap-2">
                    {Object.entries(m.fleet || {}).filter(([, qty]) => qty > 0).map(([sId, qty]) => {
                      const name = shipDisplayName ? shipDisplayName(sId) : sId;
                      return (
                        <div
                          key={sId}
                          title={`${name}: ${qty}`}
                          className="flex items-center gap-1.5 p-1 pr-2 rounded-xl bg-black/60 border border-white/10 shadow-sm"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-500/20 overflow-hidden flex items-center justify-center shrink-0">
                            <SafeImg id={sId} fallback={<span className="text-sm">{shipDisplayIcon ? shipDisplayIcon(sId) : "🚀"}</span>} className="w-full h-full object-cover" />
                          </div>
                          <span className="font-mono text-xs font-black text-cyan-300">
                            {qty}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 3. Botón de retorno + Reloj y progreso */}
                  <div className="flex items-center gap-3 shrink-0 ml-auto">
                    {!isReturning && dispatch && (
                      <button
                        onClick={() => {
                          dispatch({ type: 'CANCEL_MISSION', missionId: m.id });
                          if (window.playSfx) window.playSfx('click');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-white font-mono text-[11px] font-bold uppercase transition-all cursor-pointer active:scale-95 shadow-sm"
                        title="Ordenar retorno inmediato a la base"
                      >
                        ✕ Retorno
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-cyan-300 font-mono text-xs font-bold whitespace-nowrap">
                        ⏱ {fmtTime ? fmtTime(remaining) : `${Math.round(remaining)}s`} ({pct}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
