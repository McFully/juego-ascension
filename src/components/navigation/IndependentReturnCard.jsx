import React from 'react';
import { SafeImg } from '../../assets.jsx';

/**
 * IndependentReturnCard — Tarjeta independiente y separada para retorno de navegación.
 * Mantiene la estética premium, proporcionalidad estandarizada y feedback táctil/hover.
 */
export const IndependentReturnCard = React.memo(({
  onClick,
  labelTop = 'VOLVER A',
  labelBottom = 'Menú Principal',
  icon = '🏠',
  imgId = 'menuContinue',
  accentColor = 'cyan', // 'cyan' | 'purple' | 'amber'
  title = '',
  className = ''
}) => {
  const handleClick = (e) => {
    if (window.playSfx) window.playSfx('click');
    if (onClick) onClick(e);
  };

  const accentStyles = {
    cyan: {
      textTop: 'text-cyan-300',
      borderHover: 'hover:border-cyan-500/50',
      glowHover: 'group-hover:text-cyan-100',
      overlay: 'bg-cyan-950/25 group-hover:bg-cyan-500/15'
    },
    purple: {
      textTop: 'text-purple-300',
      borderHover: 'hover:border-purple-500/50',
      glowHover: 'group-hover:text-purple-100',
      overlay: 'bg-purple-950/25 group-hover:bg-purple-500/15'
    },
    amber: {
      textTop: 'text-amber-300',
      borderHover: 'hover:border-amber-500/50',
      glowHover: 'group-hover:text-amber-100',
      overlay: 'bg-amber-950/25 group-hover:bg-amber-500/15'
    }
  };

  const currentAccent = accentStyles[accentColor] || accentStyles.cyan;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative w-full h-full min-h-[58px] flex flex-col items-center justify-center px-3 py-2 overflow-hidden bg-[#060a16] border border-white/10 rounded-2xl ${currentAccent.borderHover} transition-all duration-300 cursor-pointer group text-center select-none shadow-2xl backdrop-blur-md ${className}`}
      title={title || `Volver a ${labelBottom}`}
    >
      {/* Fondo con SafeImg e iluminación atmosférica */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <SafeImg
          id={imgId}
          className="w-full h-full object-cover object-center opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
        />
        <div className={`absolute inset-0 ${currentAccent.overlay} transition-colors duration-300`} />
      </div>

      {/* Contenido frontal centrado */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full min-w-0 leading-none px-1">
        <span className={`w-full text-center text-xs sm:text-sm font-mono font-black uppercase tracking-[0.2em] ${currentAccent.textTop} drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] transition-colors whitespace-nowrap`}>
          {labelTop}
        </span>
        <span className={`w-full text-center text-sm sm:text-base font-mono font-black uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tight ${currentAccent.glowHover} transition-colors flex items-center justify-center gap-1.5 mt-1 whitespace-nowrap`}>
          <span className="text-sm sm:text-base shrink-0">{icon}</span>
          <span className="truncate">{labelBottom}</span>
        </span>
      </div>
    </button>
  );
});

export default IndependentReturnCard;
