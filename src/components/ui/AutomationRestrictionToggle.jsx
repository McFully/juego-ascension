import React from 'react';

/**
 * AutomationRestrictionToggle — Microconmutador táctico espacial ubicado
 * en la esquina superior izquierda de las tarjetas de juego (Edificios, Defensas, Naves).
 * 
 * Permite al jugador activar o vetar la gestión automática por parte de:
 * Ministros de Estado, Gobernadores Coloniales y el Emperador IA.
 */
export const AutomationRestrictionToggle = React.memo(({
  isRestricted = false,
  onToggle,
  titleText
}) => {
  const handleClick = (e) => {
    e.stopPropagation();
    if (window.playSfx) window.playSfx('click');
    if (onToggle) onToggle();
  };

  const isAllowed = !isRestricted;

  const tooltip = titleText || (
    isAllowed
      ? 'Gestión IA permitida (Ministros, Gobernador y Emperador)'
      : 'Veto activo: Ministros, Gobernador y Emperador IA no construirán esta unidad'
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      title={tooltip}
      aria-label={tooltip}
      className={`absolute top-2.5 left-2.5 z-20 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all duration-200 cursor-pointer backdrop-blur-md shadow-lg ${
        isAllowed
          ? 'bg-[#061e29]/95 border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-300 hover:scale-105 hover:shadow-[0_0_18px_rgba(6,182,212,0.6)]'
          : 'bg-[#290a0a]/95 border-red-500 text-red-400 hover:bg-red-500/30 hover:border-red-400 hover:scale-105 hover:shadow-[0_0_18px_rgba(239,68,68,0.6)]'
      }`}
    >
      <span className="text-base leading-none select-none">
        {isAllowed ? '🤖' : '🔒'}
      </span>
      <span className={`text-[11px] font-mono font-black uppercase tracking-wider select-none ${
        isAllowed ? 'text-cyan-300' : 'text-red-400'
      }`}>
        {isAllowed ? 'IA ON' : 'VETO IA'}
      </span>
    </button>
  );
});

export default AutomationRestrictionToggle;
