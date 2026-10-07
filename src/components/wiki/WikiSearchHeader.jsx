import React from 'react';

/**
 * WikiSearchHeader — Buscador reactivo, filtros horizontales y métricas de la Enciclopedia
 */
export const WikiSearchHeader = React.memo(({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  categories,
  totalResults,
  totalEntries,
  recentChips = [],
  onSelectChip
}) => {
  return (
    <div className="bg-[#050914]/90 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Barra de Búsqueda y Estadísticas */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
            <span className="text-lg">🔍</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por término, edificio, fórmula, nave o mecánica (ej: metal, AMM, nanobots)..."
            className="w-full pl-11 pr-24 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm font-mono text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-2 px-2.5 my-1.5 flex items-center rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              ✕ Limpiar
            </button>
          ) : (
            <div className="absolute inset-y-0 right-2.5 hidden sm:flex items-center pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
                ESC
              </span>
            </div>
          )}
        </div>

        {/* Indicador de Coincidencias */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono shrink-0 justify-between sm:justify-start">
          <span className="text-slate-400">Índice:</span>
          <span className="font-bold text-cyan-300">
            {totalResults} / {totalEntries} entradas
          </span>
        </div>
      </div>

      {/* Sugerencias Rápidas / Chips */}
      {recentChips.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-thin">
          <span className="text-slate-500 shrink-0 text-[11px] uppercase tracking-wider">Temas clave:</span>
          {recentChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onSelectChip && onSelectChip(chip)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-200 border border-white/10 hover:border-cyan-400/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              #{chip}
            </button>
          ))}
        </div>
      )}

      {/* Selector de Categorías Horizontales */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-black/40 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

WikiSearchHeader.displayName = 'WikiSearchHeader';
