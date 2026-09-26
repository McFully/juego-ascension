import React from 'react';
import ReactDOM from 'react-dom';
import { SafeImg } from '../../assets.jsx';
import { playVoice } from '../../audio.js';

export const MinisterCandidateModal = (props) => {
  // Soporta tanto props directas ({ candidates, ministryId, onAppoint, onClose, playerInfluence })
  // como estructura legacy ({ candidateModal, setCandidateModal, handleAppointMinister })
  const candidates = (props.candidates && props.candidates.length > 0)
    ? props.candidates
    : (props.candidateModal?.candidates && props.candidateModal.candidates.length > 0)
      ? props.candidateModal.candidates
      : [
          { name: 'Consejero Interino Federal', trait: 'Administrador Civil', effect: '+10% Eficiencia General del Departamento', icon: '👤', avatarId: 'minister_avatar_1', desc: 'Funcionario de carrera asignado por el Alto Mando.', voiceId: 'cand_economy_0' },
          { name: 'Comisionada Extraordinaria', trait: 'Tecnócrata Pragmática', effect: '+15% Coordinación de Recursos Sectoriales', icon: '👩‍💼', avatarId: 'minister_avatar_2', desc: 'Especialista designada por el Senado de la República.', voiceId: 'cand_economy_1' }
        ];
  const onClose = props.onClose || (() => props.setCandidateModal && props.setCandidateModal(null));
  const onAppoint = props.onAppoint || props.handleAppointMinister;

  const handlePreviewVoice = (cand) => {
    if (cand?.voiceId) {
      playVoice(cand.voiceId);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 w-screen h-screen">
      <div className="bg-[#0b1226] border border-cyan-500/30 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-[0_0_50px_rgba(6,182,212,0.25)] animate-in zoom-in-95 duration-200 relative my-auto">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white uppercase tracking-tight font-mono">Candidatos Disponibles para Investidura</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-slate-400">Selecciona al candidato idóneo para dirigir el ministerio. Haz clic en su avatar para escuchar su declaración o presiona "Investir" para nombrarlo.</p>
        
        <div className="space-y-3">
          {candidates.map(cand => (
            <div key={cand.name} className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-start gap-3 hover:border-cyan-500/30 transition-all">
              <button
                type="button"
                onClick={() => handlePreviewVoice(cand)}
                title="Haz clic para escuchar la voz del candidato"
                className="w-14 h-14 rounded-xl overflow-hidden border border-white/15 bg-cyan-950/30 flex items-center justify-center shrink-0 shadow-md hover:border-cyan-400 hover:scale-105 transition-all cursor-pointer group relative"
              >
                {cand.avatarId ? (
                  <SafeImg 
                    id={cand.avatarId} 
                    className="w-full h-full object-cover object-top" 
                    fallback={<span className="text-3xl">{cand.icon}</span>}
                  />
                ) : (
                  <span className="text-3xl">{cand.icon}</span>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div 
                      onClick={() => handlePreviewVoice(cand)} 
                      className="text-xs font-bold text-white hover:text-cyan-400 cursor-pointer transition-colors"
                      title="Haz clic para escuchar su voz"
                    >
                      {cand.name}
                    </div>
                    <div className="text-[9px] text-cyan-400 font-mono font-bold uppercase">{cand.trait}</div>
                  </div>
                  <button
                    onClick={() => onAppoint && onAppoint(cand)}
                    className="py-1 px-3 bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-black uppercase rounded transition-all cursor-pointer"
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

  if (typeof document !== 'undefined' && document.body) {
    return ReactDOM.createPortal(modalContent, document.body);
  }

  return modalContent;
};
