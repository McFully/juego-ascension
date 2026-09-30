import React from 'react';

/**
 * FloatingBackButton — Botón HUD flotante ultracompacto en la esquina superior izquierda.
 * Aparece cuando el jugador está dentro de una subpantalla (fuera de la Vista Imperial / Overview).
 * No crea ninguna barra superior invasiva ni resta espacio a la pantalla.
 */
export const FloatingBackButton = React.memo(({
  onBack,
  activeTab,
  currentLabel,
  label = 'Alto Mando'
}) => {
  const isOverview = activeTab === 'overview' || !activeTab;

  if (isOverview) return null;

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 select-none animate-in fade-in duration-200">
      <button
        type="button"
        onClick={() => {
          if (window.playSfx) window.playSfx('click');
          if (onBack) onBack();
        }}
        className="breadcrumb-back flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-mono font-bold text-cyan-300 bg-[#05070f]/90 border border-cyan-500/40 hover:border-cyan-300 hover:bg-[#0c1630] hover:text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 cursor-pointer backdrop-blur-md"
        title="Volver (Escape / Backspace)"
      >
        <span className="text-sm">◀</span>
        <span className="uppercase tracking-wider">{label}</span>
      </button>

      {currentLabel && (
        <span className="hidden sm:inline-block px-3 py-1.5 rounded-xl bg-[#05070f]/80 border border-white/10 text-xs font-mono text-cyan-300 font-bold backdrop-blur-md">
          {currentLabel}
        </span>
      )}
    </div>
  );
});

export default FloatingBackButton;
