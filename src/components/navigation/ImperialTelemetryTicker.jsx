import React, { useState } from 'react';

/**
 * ImperialTelemetryTicker - Registro colapsable de telemetría y eventos del Imperio en tiempo real.
 * Permite auditar en formato militar las construcciones, investigaciones, flotas y eventos diplomáticos.
 */
export const ImperialTelemetryTicker = ({ events = [], maxItems = 20, variant = 'bottom' }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Formato militar de hora HH:MM:SS
  const formatTime = (ts) => {
    const d = ts ? new Date(ts) : new Date();
    return d.toTimeString().split(' ')[0];
  };

  const recentEvents = events.slice(-maxItems).reverse();
  const latestEvent = recentEvents[0] || {
    id: 'default',
    text: 'Sistemas imperiales en estado óptimo. Sin anomalías en el sector.',
    time: Date.now(),
    type: 'info'
  };

  const isHeader = variant === 'header';

  return (
    <div className={isHeader ? "relative font-mono select-none" : "fixed bottom-3 right-4 z-40 max-w-md w-full font-mono select-none"}>
      {/* Barra compacta de Telemetría Ticker */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={
          isHeader
            ? "bg-[#050814]/90 border border-cyan-500/40 rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-xl cursor-pointer hover:border-cyan-400 hover:bg-black/90 transition-all text-xs max-w-xs md:max-w-sm"
            : "bg-black/90 border border-cyan-500/40 rounded-xl px-3.5 py-2 flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-xl cursor-pointer hover:border-cyan-400 hover:bg-black/95 transition-all text-xs"
        }
      >
        <div className="flex items-center gap-2 min-w-0 pr-1.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider shrink-0">TELEMETRÍA</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          <span className="text-[10px] text-cyan-400/70 font-bold">[{recentEvents.length}]</span>
          <span className="text-xs transition-transform duration-200 transform">
            {isOpen ? (isHeader ? '▲' : '▼') : (isHeader ? '▼' : '▲')}
          </span>
        </div>
      </div>

      {/* Historial Extendido Colapsable (Opaco, idéntico a tooltips de recursos) */}
      {isOpen && (
        <div className={
          isHeader
            ? "absolute top-full right-0 mt-2 z-[120] w-80 md:w-96 bg-[#050814] border border-cyan-500/50 rounded-xl p-4 shadow-[0_16px_48px_rgba(0,0,0,1),0_0_24px_rgba(6,182,212,0.18)] max-h-72 overflow-y-auto space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar"
            : "mt-2 bg-[#050814] border border-cyan-500/50 rounded-xl p-4 shadow-[0_16px_48px_rgba(0,0,0,1),0_0_24px_rgba(6,182,212,0.18)] max-h-72 overflow-y-auto space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150 custom-scrollbar"
        }>
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider">
              Registro Táctico Imperial
            </span>
            <span className="text-[9px] text-slate-500">Últimos {maxItems} eventos</span>
          </div>

          {recentEvents.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500">
              No hay eventos recientes registrados en la bitácora.
            </div>
          ) : (
            recentEvents.map((evt, idx) => (
              <div 
                key={evt.id || idx}
                className="flex items-start gap-2 text-[11px] p-1.5 rounded-lg hover:bg-white/5 transition-colors border-l-2 border-cyan-500/50"
              >
                <span className="text-[9px] text-slate-500 shrink-0 mt-0.5">
                  [{formatTime(evt.time)}]
                </span>
                <span className="text-slate-200 leading-snug">
                  {evt.text}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
