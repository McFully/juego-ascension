import React, { useEffect } from 'react';
import { asset } from '../../assets.jsx';
import { speakText } from '../../audio.js';

/**
 * ⚠️ SIN USO desde el paso 3.4 — no se monta en `AppOverlays.jsx`.
 *
 * Las narrativas con decisión pendiente ya no se abren solas: se acumulan en
 * `state.tacticalEventLog` con `requiresDecision: true` y se leen (y resuelven)
 * en la bandeja, `src/pages/TelemetryPage.jsx`. Sus botones de decisión están en
 * `TacticalEventDetail.jsx`.
 *
 * Se conserva, sin borrar. Si vuelve a hacer falta un overlay modal, la UI de
 * lectura ya está extraída en `TacticalEventDetail.jsx`.
 */
export const NarrativeEventOverlay = React.memo(({ event, dispatch, resources }) => {
  useEffect(() => {
    if (event?.title || event?.description) {
      const textToSpeak = `${event.title ? event.title + '. ' : ''}${event.description || ''}`;
      speakText(textToSpeak);
    }
  }, [event]);

  if (!event) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-700">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl w-full max-w-4xl overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.3)] relative z-10 animate-in slide-in-from-bottom-12 duration-500">
        <div className="relative h-64 bg-black/40 flex items-center justify-center overflow-hidden border-b border-white/5 group">
          {event.image ? (
            <img src={asset(event.image)} alt={event.title} className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-all duration-[2s]" />
          ) : (
            <span className="material-symbols-outlined text-9xl text-slate-500 opacity-20">emergency</span>
          )}
          <div className="absolute top-4 left-6 px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em] z-20 backdrop-blur-md flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            Alerta de {event.type === 'crisis' ? 'Crisis' : 'Descubrimiento'} Nivel Omega
          </div>
          <button onClick={() => dispatch({ type: 'CLEAR_ACTIVE_EVENT' })} className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all z-30 group">
            <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">close</span>
          </button>
          <h2 className="absolute bottom-6 left-8 text-4xl font-black text-white uppercase italic tracking-tighter z-20 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">{event.title}</h2>
        </div>
        <div className="p-8 space-y-8">
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-4xl text-cyan-500 opacity-80 mt-1">info</span>
              <p className="text-sm md:text-base text-slate-300 font-serif leading-relaxed italic border-l-2 border-cyan-500/30 pl-4 py-1">"{event.description}"</p>
            </div>
          </section>
          <div className="pt-6 border-t border-white/5 space-y-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block">
              Acciones Disponibles para el Comandante
            </span>
            <div className={`grid gap-4 ${event.options?.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {event.options.map((opt, idx) => {
                const affordable = !opt.cost || Object.entries(opt.cost).every(([k, v]) => (resources?.[k] || 0) >= v);
                const hasCost = Object.keys(opt.cost || {}).length > 0;

                return (
                  <button 
                    key={idx} 
                    disabled={!affordable}
                    onClick={() => dispatch({ type: 'RESOLVE_NARRATIVE_EVENT', eventId: event.id, optionIdx: idx })}
                    className={`p-5 text-left bg-[#070d1e]/80 border rounded-2xl transition-all flex flex-col justify-between group relative overflow-hidden text-slate-200 ${
                      affordable 
                        ? 'border-cyan-500/30 hover:border-cyan-400 hover:bg-[#0b1633] hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] cursor-pointer' 
                        : 'border-white/10 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    
                    <div className="space-y-3 relative z-10 w-full">
                      {/* Título de la acción y flecha */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm md:text-base font-black text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                          {opt.label || opt.text}
                        </span>
                        <span className="material-symbols-outlined text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all text-xl shrink-0 mt-0.5">
                          chevron_right
                        </span>
                      </div>

                      {/* Costos si aplica */}
                      {hasCost && (
                        <div className="text-[11px] text-rose-400 font-mono uppercase font-bold flex items-center gap-1.5 bg-rose-950/30 border border-rose-500/20 px-2.5 py-1 rounded-lg w-fit">
                          <span className="material-symbols-outlined text-xs">monetization_on</span>
                          <span>Costo: {Object.entries(opt.cost).map(([k, v]) => `${v.toLocaleString()} ${k}`).join(' ')}</span>
                        </div>
                      )}

                      {/* Ventajas / Bonificación */}
                      {opt.bonus && (
                        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Ventaja / Bonificación:
                          </div>
                          <p className="text-xs text-emerald-200/90 font-mono leading-relaxed">
                            {opt.bonus}
                          </p>
                        </div>
                      )}

                      {/* Desventajas / Hándicap */}
                      {opt.penalty && (
                        <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            Desventaja / Hándicap:
                          </div>
                          <p className="text-xs text-rose-200/90 font-mono leading-relaxed">
                            {opt.penalty}
                          </p>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
