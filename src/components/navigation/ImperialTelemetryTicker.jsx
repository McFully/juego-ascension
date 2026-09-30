import React, { useState } from 'react';

/**
 * ImperialTelemetryTicker — Registro colapsable de comunicaciones del Imperio.
 *
 * 3.5-a — Antes este componente recibía eventos de `state.history`/`state.logs`
 * (campos inexistentes), así que siempre caía a su texto de relleno
 * "Sistemas imperiales en estado óptimo" con el punto rojo latiendo siempre.
 * Ahora la fuente es `state.tacticalEventLog` y el contador refleja los
 * pendientes reales. El sonido y la voz suenan AL ABRIR un mensaje, no al
 * recibirlo, así que este componente no los dispara.
 */
export const ImperialTelemetryTicker = ({
  events = [],
  maxItems = 20,
  variant = 'bottom',
  unreadCount = 0,
  requiresDecisionCount = 0,
  onOpenInbox = null,
  onSelectEvent = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (ts) => {
    const d = ts ? new Date(ts) : new Date();
    return d.toTimeString().split(' ')[0];
  };

  // Lo pendiente primero, y dentro de cada grupo lo más reciente arriba.
  const recentEvents = [...events]
    .slice(-maxItems)
    .reverse()
    .sort((a, b) => {
      const ar = a.read ? 1 : 0;
      const br = b.read ? 1 : 0;
      if (ar !== br) return ar - br;
      return (b.time || 0) - (a.time || 0);
    });

  const hasPending = unreadCount > 0;
  const needsDecision = requiresDecisionCount > 0;

  const isHeader = variant === 'header';

  // Verde cuando todo está visto, ámbar con pendientes, rojo si hay una decisión
  // pendiente que se puede perder por no mirar.
  const tone = needsDecision
    ? { dot: 'bg-red-500', ping: 'bg-red-400', text: 'text-red-400', border: 'border-red-500/50' }
    : hasPending
      ? { dot: 'bg-amber-400', ping: 'bg-amber-300', text: 'text-amber-400', border: 'border-amber-500/50' }
      : { dot: 'bg-cyan-400', ping: 'bg-cyan-400', text: 'text-cyan-400', border: 'border-cyan-500/40' };

  const openPanel = () => setIsOpen((v) => !v);

  const handleSelect = (evt) => {
    if (onSelectEvent) onSelectEvent(evt);
    else if (onOpenInbox) onOpenInbox();
  };

  return (
    <div className={isHeader ? "relative font-mono select-none" : "fixed bottom-3 right-4 z-40 max-w-md w-full font-mono select-none"}>
      <div
        onClick={openPanel}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(); } }}
        aria-label={`Telemetría imperial. ${unreadCount} pendientes de leer.`}
        aria-expanded={isOpen}
        className={
          isHeader
            ? `bg-[#050814]/90 border ${tone.border} rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-xl cursor-pointer hover:border-cyan-400 hover:bg-black/90 transition-all text-xs max-w-xs md:max-w-sm`
            : `bg-black/90 border ${tone.border} rounded-xl px-3.5 py-2 flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-xl cursor-pointer hover:border-cyan-400 hover:bg-black/95 transition-all text-xs`
        }
      >
        <div className="flex items-center gap-2 min-w-0 pr-1.5">
          {/* El punto solo late cuando hay algo pendiente: antes latía siempre. */}
          {hasPending ? (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${tone.ping} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${tone.dot}`}></span>
            </span>
          ) : (
            <span className={`inline-flex rounded-full h-2 w-2 shrink-0 ${tone.dot} opacity-50`}></span>
          )}
          <span className={`text-[10px] ${tone.text} font-black uppercase tracking-wider shrink-0`}>TELEMETRÍA</span>
          {needsDecision && (
            <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider shrink-0">
              decisión
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {/* Contador real de no leídos, no la longitud de la lista. */}
          <span className={`text-[10px] font-bold ${hasPending ? tone.text : 'text-slate-500'}`}>
            [{unreadCount}]
          </span>
          <span className="text-xs transition-transform duration-200 transform">
            {isOpen ? (isHeader ? '▲' : '▼') : (isHeader ? '▼' : '▲')}
          </span>
        </div>
      </div>

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
            {onOpenInbox && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenInbox(); }}
                className="text-[9px] text-cyan-400 hover:text-cyan-300 uppercase tracking-wider font-bold cursor-pointer"
              >
                Abrir bandeja
              </button>
            )}
          </div>

          {recentEvents.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500">
              No hay comunicaciones registradas.
            </div>
          ) : (
            recentEvents.map((evt, idx) => (
              <button
                type="button"
                key={evt.id || idx}
                onClick={(e) => { e.stopPropagation(); handleSelect(evt); }}
                className={`w-full text-left flex items-start gap-2 text-[11px] p-1.5 rounded-lg hover:bg-white/5 transition-colors border-l-2 ${
                  evt.read ? 'border-slate-600/50 opacity-60' : 'border-cyan-500/70'
                } ${evt.requiresDecision && !evt.read ? 'border-l-red-500' : ''}`}
              >
                <span className="text-[9px] text-slate-500 shrink-0 mt-0.5">
                  [{formatTime(evt.time)}]
                </span>
                <span className="text-slate-200 leading-snug">
                  {evt.text}
                  {evt.requiresDecision && !evt.read && (
                    <span className="ml-1.5 text-[9px] text-red-400 font-bold uppercase">
                      requiere decisión
                    </span>
                  )}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
