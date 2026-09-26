import React, { useRef, useCallback, useEffect } from 'react';

/**
 * GameCarousel — Carrusel horizontal de videojuego para tiles, cards y contenido navegable.
 * Soporte: scroll snap, flechas, teclado, indicadores de posición.
 */
export const GameCarousel = React.memo(({ children, title, icon, className = '', showArrows = true }) => {
  const scrollRef = useRef(null);
  const childCount = React.Children.count(children);

  const scroll = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(':scope > *')?.offsetWidth || 280;
    const gap = 12;
    el.scrollBy({ left: dir * (cardWidth + gap), behavior: 'smooth' });
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scroll(-1);
      // Trasladar foco al botón anterior si está enfocado
      const focusable = scrollRef.current?.querySelectorAll('button, [tabindex="0"]');
      if (focusable && focusable.length > 0) {
        const currIndex = Array.from(focusable).indexOf(document.activeElement);
        if (currIndex > 0) focusable[currIndex - 1].focus();
      }
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scroll(1);
      // Trasladar foco al botón siguiente si está enfocado
      const focusable = scrollRef.current?.querySelectorAll('button, [tabindex="0"]');
      if (focusable && focusable.length > 0) {
        const currIndex = Array.from(focusable).indexOf(document.activeElement);
        if (currIndex >= 0 && currIndex < focusable.length - 1) focusable[currIndex + 1].focus();
        else if (currIndex === -1 && focusable[0]) focusable[0].focus();
      }
    }
  }, [scroll]);

  const handleWheel = useCallback((e) => {
    if (e.deltaY !== 0 && scrollRef.current) {
      // Si no se usa shift, convertir desplazamiento vertical de la rueda del ratón en desplazamiento horizontal suave
      e.preventDefault();
      scrollRef.current.scrollBy({ left: e.deltaY * 1.5, behavior: 'smooth' });
    }
  }, []);

  if (childCount === 0) return null;

  return (
    <div className={`game-carousel-wrapper ${className}`}>
      {/* Header del carrusel */}
      {title && (
        <div className="flex items-center justify-between mb-2 select-none">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
            {icon && <span className="text-lg">{icon}</span>}
            {title}
            <span className="text-[10px] font-mono text-cyan-400 normal-case tracking-normal">({childCount})</span>
          </h3>
          {showArrows && childCount > 1 && (
            <div className="flex gap-1.5 items-center">
              <button
                onClick={() => scroll(-1)}
                className="carousel-arrow w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all active:scale-95 shadow-md"
                aria-label="Anterior"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll(1)}
                className="carousel-arrow w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all active:scale-95 shadow-md"
                aria-label="Siguiente"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contenedor scrollable - 100% invisible scrollbar con soporte horizontal y snap */}
      <div
        ref={scrollRef}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-none"
        role="list"
        tabIndex={0}
        aria-label={title || 'Carrusel'}
      >
        {React.Children.map(children, (child, i) => (
          <div key={i} className="snap-start shrink-0" role="listitem">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
});
