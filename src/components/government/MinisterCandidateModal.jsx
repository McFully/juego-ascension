import React from 'react';

export const MinisterCandidateModal = ({ candidateModal, setCandidateModal, handleAppointMinister }) => {
  if (!candidateModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 max-w-lg w-full space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <h3 className="text-base font-bold text-white uppercase tracking-tight">Candidatos Disponibles para Investidura</h3>
          <button 
            onClick={() => setCandidateModal(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-slate-400">Selecciona al candidato idóneo para dirigir el ministerio. Sus cualidades otorgarán bonificaciones e impacto en el sector de la República.</p>
        
        <div className="space-y-3">
          {candidateModal.candidates.map(cand => (
            <div key={cand.name} className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-start gap-3 hover:border-cyan-500/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-3xl shrink-0">
                {cand.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold text-white">{cand.name}</div>
                    <div className="text-[9px] text-cyan-400 font-mono font-bold uppercase">{cand.trait}</div>
                  </div>
                  <button
                    onClick={() => handleAppointMinister(cand)}
                    className="py-1 px-3 bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-black uppercase rounded transition-all"
                  >
                    Investir
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">{cand.desc}</p>
                <div className="text-[10px] text-emerald-400 mt-1 font-mono font-semibold">Bono: {cand.effect}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
