import React from 'react';
import { WikiParametricTable } from './WikiParametricTable.jsx';
import { WikiFormulaCard } from './WikiFormulaCard.jsx';
import { WikiMediaViewer } from './WikiMediaViewer.jsx';

/**
 * WikiArticleView — Vista completa y detallada del artículo de la enciclopedia
 */
export const WikiArticleView = React.memo(({ entry, onTagClick }) => {
  if (!entry) {
    return (
      <div className="bg-[#050914]/90 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center text-slate-500 font-mono text-xs flex flex-col items-center justify-center gap-3">
        <span className="text-4xl">📚</span>
        <span>Selecciona un artículo en el índice lateral para consultar sus especificaciones.</span>
      </div>
    );
  }

  return (
    <div className="bg-[#050914]/90 backdrop-blur-md rounded-2xl border border-white/10 p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Cabecera del Artículo */}
      <div className="border-b border-white/10 pb-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {entry.badge && (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                {entry.badge}
              </span>
            )}
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              ID: {entry.id}
            </span>
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {entry.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick && onTagClick(tag)}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-500/20 text-[10px] font-mono text-slate-400 hover:text-cyan-300 border border-white/5 transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-mono font-black text-white tracking-wide flex items-center gap-2">
          <span>{entry.title}</span>
        </h2>
        {entry.subtitle && (
          <p className="text-sm font-mono text-cyan-300/90">
            {entry.subtitle}
          </p>
        )}
      </div>

      {/* Indicadores Clave / Chips de Rendimiento */}
      {entry.indicators && entry.indicators.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {entry.indicators.map((ind, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1"
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {ind.label}
              </span>
              <span className={`text-sm font-mono font-bold ${ind.color || 'text-white'}`}>
                {ind.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Resumen Conceptual */}
      {entry.summary && (
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs sm:text-sm font-mono text-slate-300 leading-relaxed">
          {entry.summary}
        </div>
      )}

      {/* Guía Operativa / Lore Táctico */}
      {entry.guide && (
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>📖</span>
            <span>Manual de Campo y Directrices Tácticas</span>
          </h3>
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed">
            {entry.guide.trim()}
          </div>
        </div>
      )}

      {/* Fórmulas Matemáticas Reales */}
      {entry.formula && (
        <WikiFormulaCard formula={entry.formula} />
      )}

      {/* Tabla Paramétrica Matricial */}
      {entry.parametricTable && (
        <WikiParametricTable tableData={entry.parametricTable} />
      )}

      {/* Soporte Multimedia / Capturas / Gráficos */}
      {entry.media && (
        <WikiMediaViewer media={entry.media} />
      )}
    </div>
  );
});

WikiArticleView.displayName = 'WikiArticleView';
