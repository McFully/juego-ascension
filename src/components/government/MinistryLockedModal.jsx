import React, { useEffect } from 'react';

export const MinistryLockedModal = ({
  isOpen,
  onClose,
  data,
  onNavigateToMinistry
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 w-screen h-screen animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="p-6 md:p-8 rounded-3xl bg-[#090d1f] border border-rose-500/40 max-w-md w-full space-y-5 shadow-[0_0_50px_rgba(244,63,94,0.3)] relative my-auto animate-in zoom-in-95 duration-200 font-mono"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔒</span>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                Sede No Construida
              </h3>
              <p className="text-[10px] text-rose-400 uppercase">
                {data.ministryName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar (Escape)"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            Este ministerio no puede iniciar operaciones ni celebrar consejos porque carece de su edificio de sede operativa en la colonia:
          </p>

          <div className="p-3.5 rounded-2xl bg-[#05070f] border border-rose-500/30 space-y-1.5">
            <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
              Edificio requerido:
            </div>
            <div className="text-sm font-black text-white">
              🏗️ {data.reqName}
            </div>
            <div className="text-[10px] text-slate-400">
              Ubicación: Sector de {data.location}
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 pt-2">
          {onNavigateToMinistry && (
            <button
              onClick={() => {
                const target = data.locationId || 'infra';
                onClose();
                onNavigateToMinistry(target);
              }}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/50 shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>Ir a {data.location}</span>
              <span>➔</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold uppercase transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
