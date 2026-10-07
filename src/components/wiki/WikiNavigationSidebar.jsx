import React from 'react';

/**
 * WikiNavigationSidebar — Índice lateral temático con badges, estado de lectura y selección activa
 */
export const WikiNavigationSidebar = React.memo(({
  entries,
  activeEntryId,
  onSelectEntry,
  activeCategory,
  categories
}) => {
  const currentCategoryObj = categories.find(c => c.id === activeCategory);

  return (
    <div className="bg-[#050914]/90 backdrop-blur-md rounded-2xl border border-white/10 p-3 sm:p-4 shadow-xl flex flex-col h-full max-h-[750px] overflow-hidden">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentCategoryObj?.icon || '📚'}</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
            {currentCategoryObj?.label || 'Índice de Materias'}
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {entries.length} art.
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-slate-500">
            No hay artículos coincidentes con el filtro.
          </div>
        ) : (
          entries.map((entry) => {
            const isSelected = activeEntryId === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelectEntry(entry.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all border flex flex-col gap-1 cursor-pointer group ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'bg-black/30 border-white/5 hover:border-cyan-500/30 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-mono font-bold truncate transition-colors ${
                    isSelected ? 'text-cyan-200' : 'text-slate-200 group-hover:text-cyan-300'
                  }`}>
                    {entry.title}
                  </span>
                  {entry.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider bg-white/5 text-slate-400 border border-white/10 shrink-0">
                      {entry.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {entry.subtitle || entry.summary}
                </p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
});

WikiNavigationSidebar.displayName = 'WikiNavigationSidebar';
