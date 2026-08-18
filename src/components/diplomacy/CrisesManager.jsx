import React from 'react';
import { S } from '../../styles.js';

export const CrisesManager = ({
  activeCrises = [],
  dispatch,
  playDiploSound
}) => {
  return (
    <div className="space-y-4">
      <div className={`${S.cardDeep} space-y-2`}>
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">⚠️ Crisis Galácticas Activas</h3>
        <p className="text-xs text-slate-400">Las crisis ocurren debido al calentamiento orbital o a asambleas fallidas. Resuélvelas para ganar reputación interestelar.</p>
      </div>

      <div className="space-y-4">
        {activeCrises.length === 0 ? (
          <div className="text-xs text-slate-500 italic text-center py-12 bg-slate-950/30 rounded-xl border border-white/5 font-mono">
            No hay crisis galácticas activas en este cuadrante.
          </div>
        ) : (
          activeCrises.map(c => (
            <div key={c.id} className="p-4 bg-red-950/20 border border-red-500/25 rounded-2xl space-y-3 text-slate-100 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-red-500/10 pb-2">
                <span className="font-bold text-sm text-red-400">⚠️ CRISIS ACTIVA: {c.title}</span>
                <span className="text-[10px] text-red-500 uppercase tracking-widest animate-pulse font-bold">ALERTA ROJA</span>
              </div>
              
              <div className="space-y-1.5 text-slate-300">
                <p className="leading-relaxed"><span className="text-red-400 font-bold">[Introducción]</span> {c.description}</p>
                <p className="leading-relaxed"><span className="text-slate-400 font-bold">[Desarrollo]</span> El gabinete reporta inestabilidades socio-políticas que requieren arbitraje urgente de la comandancia.</p>
                <p className="leading-relaxed"><span className="text-slate-400 font-bold">[Consecuencias]</span> Modifica variables de relación exterior y reserva de flota.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                {c.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playDiploSound('success');
                      dispatch({ type: 'RESOLVE_CRISIS', crisisId: c.id, choice: idx });
                    }}
                    className="p-3 bg-red-950/40 border border-red-500/30 hover:bg-red-900/35 hover:border-red-400 rounded-xl text-left text-xs text-slate-200 transition-all flex flex-col justify-between"
                  >
                    <span className="font-bold text-red-400 mb-1">{opt.text}</span>
                    <span className="text-[10px] text-slate-500">Aplica resolución y modifica parámetros del imperio.</span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CrisesManager;
