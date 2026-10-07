import React from 'react';

/**
 * WikiParametricTable — Tablas de datos paramétricos tipo Excel/Ingeniería con estilo contable
 */
export const WikiParametricTable = React.memo(({ tableData, highlightedLevel = null }) => {
  if (!tableData || !tableData.headers || !tableData.rows || tableData.rows.length === 0) {
    return null;
  }

  const { headers, rows } = tableData;

  return (
    <div className="bg-[#050814]/90 rounded-xl border border-white/10 overflow-hidden shadow-lg space-y-2">
      <div className="px-4 py-2.5 bg-black/50 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">📊</span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
            Escalado Paramétrico y Ratios de Ingeniería
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Progresión geométrica canónica
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-black/60 border-b border-white/10 text-slate-300 sticky top-0">
              {headers.map((h, idx) => (
                <th
                  key={idx}
                  className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${
                    idx === 0 ? 'text-left' : 'text-right'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, rIdx) => {
              const isHighlighted = highlightedLevel !== null && (row[0] === highlightedLevel || String(row[0]) === String(highlightedLevel));
              return (
                <tr
                  key={rIdx}
                  className={`transition-colors hover:bg-cyan-950/20 ${
                    rIdx % 2 === 0 ? 'bg-black/20' : 'bg-transparent'
                  } ${isHighlighted ? 'bg-cyan-950/50 font-bold border-l-2 border-cyan-400' : ''}`}
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-3 py-1.5 tabular-nums ${
                        cIdx === 0
                          ? 'text-cyan-300 font-semibold text-left'
                          : 'text-slate-200 text-right'
                      } ${isHighlighted && cIdx !== 0 ? 'text-cyan-100' : ''}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

WikiParametricTable.displayName = 'WikiParametricTable';
