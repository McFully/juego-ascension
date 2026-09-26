import React, { useEffect } from 'react';

/**
 * CancelConfirmationModal — Modal espacial para confirmar la cancelación de obras o investigaciones.
 * Muestra el nombre del ítem, el nivel, y el aviso de reembolso del 50% de los recursos.
 */
export const CancelConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Cancelar Operación",
  itemName = "",
  itemLevel = null,
  type = "building" // "building" | "research"
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 w-screen h-screen animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="p-6 rounded-3xl bg-[#090d1f] border border-red-500/40 max-w-md w-full space-y-4 shadow-[0_0_50px_rgba(239,68,68,0.3)] relative my-auto animate-in zoom-in-95 duration-200 font-mono"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wide">
                {title}
              </h3>
              <p className="text-[10px] text-red-400 uppercase tracking-wider">
                {type === 'building' ? 'Construcción en curso' : 'Investigación en curso'}
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
            ¿Confirmas la cancelación de la siguiente orden de {type === 'building' ? 'construcción' : 'investigación'}?
          </p>

          <div className="p-3.5 rounded-2xl bg-[#05070f] border border-red-500/30 space-y-1">
            <div className="text-sm font-black text-white flex items-center justify-between">
              <span>{itemName}</span>
              {itemLevel && <span className="text-cyan-400 text-xs font-mono">Nv. {itemLevel}</span>}
            </div>
            <p className="text-[11px] text-amber-300">
              ⚠️ Se cancelará de la cola y se reembolsará el <strong>50%</strong> de los recursos invertidos.
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Continuar Orden
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600/80 hover:bg-red-500 border border-red-400/50 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
          >
            ✕ Confirmar Cancelación
          </button>
        </div>
      </div>
    </div>
  );
};
