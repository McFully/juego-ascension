import React from 'react';
import { useNavigation } from './NavigationContext.jsx';

/**
 * FloatingBackButton — Botón HUD flotante ultracompacto en la esquina superior izquierda.
 * Solo aparece cuando el jugador está dentro de una subpantalla (fuera de la Consola Central).
 * No crea ninguna barra superior ni resta espacio a la pantalla.
 */
export const FloatingBackButton = React.memo(() => {
  const { activeView, navigateBack, breadcrumbs } = useNavigation();
  const isHub = activeView === 'overview';

  if (isHub) return null;

  const currentLabel = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1]?.label : null;

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 select-none">
      <button
        onClick={navigateBack}
        className="breadcrumb-back flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-mono font-bold text-cyan-300 bg-[#05070f]/90 border border-cyan-500/40 hover:border-cyan-300 hover:bg-[#0c1630] hover:text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 cursor-pointer backdrop-blur-md"
        title="Volver al Alto Mando (Escape / Backspace)"
      >
        <span className="text-sm">◀</span>
        <span className="uppercase tracking-wider">Alto Mando</span>
      </button>

      {currentLabel && (
        <span className="hidden sm:inline-block px-3 py-1.5 rounded-xl bg-[#05070f]/80 border border-white/10 text-xs font-mono text-cyan-300 font-bold backdrop-blur-md">
          {currentLabel}
        </span>
      )}
    </div>
  );
});
