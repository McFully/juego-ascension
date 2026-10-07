import React from 'react';

/**
 * WikiFormulaCard — Bloque de visualización de fórmulas matemáticas exactas del juego
 */
export const WikiFormulaCard = React.memo(({ formula }) => {
  if (!formula || !formula.expression) return null;

  return (
    <div className="bg-[#0b1021]/80 rounded-xl border border-amber-500/30 p-4 shadow-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm">∑</span>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
            {formula.title || 'Fórmula Matemática Canónica'}
          </h4>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950/60 text-amber-300 border border-amber-500/30">
          CÓDIGO CANÓNICO
        </span>
      </div>

      <div className="p-3 bg-black/60 rounded-lg border border-amber-500/20 font-mono text-xs sm:text-sm text-amber-200 overflow-x-auto scrollbar-thin">
        <code>{formula.expression}</code>
      </div>

      {formula.notes && (
        <p className="text-[11px] font-mono text-slate-400 italic">
          💡 <span className="text-slate-300">Notas de cálculo:</span> {formula.notes}
        </p>
      )}
    </div>
  );
});

WikiFormulaCard.displayName = 'WikiFormulaCard';
