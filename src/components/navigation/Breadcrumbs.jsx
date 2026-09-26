import React from 'react';
import { useNavigation } from './NavigationContext.jsx';

/**
 * Breadcrumbs — Barra de navegación jerárquica estilo HUD de videojuego.
 * Muestra la ruta actual (BASE > EDIFICIOS > MINISTERIO > ...) con botón Atrás.
 */
export const Breadcrumbs = React.memo(() => {
  const { breadcrumbs, canGoBack, navigateBack, navigateTo } = useNavigation();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav
      className="breadcrumbs-bar flex items-center gap-1.5 px-4 py-2 bg-[#05070f]/90 border-b border-white/8 backdrop-blur-md z-30 select-none"
      aria-label="Navegación jerárquica"
    >
      {/* Botón Atrás */}
      {canGoBack && (
        <button
          onClick={navigateBack}
          className="breadcrumb-back flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-300 transition-all duration-200 mr-2 group"
          title="Volver atrás (Escape)"
          aria-label="Volver atrás"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Atrás</span>
        </button>
      )}

      {/* Migas de pan */}
      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          const isClickable = !isLast;

          return (
            <React.Fragment key={crumb.id}>
              {i > 0 && (
                <svg className="w-3 h-3 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
              <button
                onClick={isClickable ? () => navigateTo(crumb.id) : undefined}
                disabled={isLast}
                className={`whitespace-nowrap px-2 py-0.5 rounded text-xs font-mono tracking-wide transition-all duration-200 ${
                  isLast
                    ? 'text-cyan-300 font-bold bg-cyan-500/10 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5 cursor-pointer'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
});
