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

  const [pendingCandidate, setPendingCandidate] = React.useState(null);

  const handleSelectCandidate = (cand) => {
    setPendingCandidate(cand);
    if (window.playSfx) window.playSfx('click');
  };

  const handleConfirmAppointment = () => {
    if (onAppoint && pendingCandidate) {
      onAppoint(pendingCandidate);
      setPendingCandidate(null);
      if (onClose) onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 w-screen h-screen animate-in fade-in duration-200">
      <div className="bg-[#090d1f] border border-cyan-500/40 rounded-3xl p-6 md:p-8 max-w-2xl w-full space-y-4 shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-in zoom-in-95 duration-200 relative my-auto font-mono">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wide">
                Gabinete Ministerial · Investidura
              </h3>
              <p className="text-[10px] text-cyan-400 uppercase">
                Selección de Candidato y Asignación de Cartera
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar (Escape)"
          >
            ✕
          </button>
        </div>

        {/* Si hay un candidato pendiente de confirmación, mostramos la pantalla de confirmación "¿Proceder? Sí/No" */}
        {pendingCandidate ? (
          <div className="space-y-4 py-2 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/50 flex items-center gap-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-cyan-400/50 bg-black/60 shrink-0">
                {pendingCandidate.avatarId ? (
                  <SafeImg 
                    id={pendingCandidate.avatarId} 
                    className="w-full h-full object-cover object-top" 
                    fallback={<span className="text-3xl flex items-center justify-center h-full">{pendingCandidate.icon}</span>}
                  />
                ) : (
                  <span className="text-3xl flex items-center justify-center h-full">{pendingCandidate.icon}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white uppercase">{pendingCandidate.name}</h4>
                <div className="text-[10px] text-cyan-300 font-bold uppercase">{pendingCandidate.trait}</div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">Efecto: {pendingCandidate.effect}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-xs text-slate-300 space-y-1">
              <p className="text-white font-bold">¿Confirmar investidura de este ministro?</p>
              <p className="text-[11px] text-slate-400">
                Al proceder, tomará posesión del ministerio y aplicará sus bonificaciones territoriales de forma inmediata.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmAppointment}
                className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>✓ Proceder: Sí, Investir</span>
              </button>
              <button
                type="button"
                onClick={() => setPendingCandidate(null)}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold uppercase transition-all cursor-pointer"
              >
                No, Volver
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400">
              Selecciona al candidato idóneo para dirigir el ministerio. Haz clic en su avatar para escuchar su declaración o presiona "Investir" para nombrarlo.
            </p>
            
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {candidates.map(cand => (
                <div key={cand.name} className="p-3 bg-black/40 border border-white/10 rounded-2xl flex items-start gap-3.5 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all">
                  <button
                    type="button"
                    onClick={() => handlePreviewVoice(cand)}
                    title="Haz clic para escuchar la voz del candidato"
                    className="w-14 h-14 rounded-2xl overflow-hidden border border-white/15 bg-cyan-950/30 flex items-center justify-center shrink-0 shadow-md hover:border-cyan-400 hover:scale-105 transition-all cursor-pointer group relative"
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
                    <div className="flex justify-between items-start gap-2">
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
                        onClick={() => handleSelectCandidate(cand)}
                        className="py-1.5 px-3.5 bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(6,182,212,0.5)]"
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
          </>
        )}
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return ReactDOM.createPortal(modalContent, document.body);
  }

  return modalContent;
};
