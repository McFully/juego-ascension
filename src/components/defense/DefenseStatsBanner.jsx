import React from 'react';

export const DefenseStatsBanner = ({ defenseSummary, fmt }) => {
  return (
    <section className="bg-[#0b1021]/90 border border-emerald-500/25 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-[0_0_30px_rgba(16,185,129,0.1)]">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🛡️</span>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Red Defensiva de Superficie</h2>
          <p className="text-[10px] text-emerald-400 font-mono">Baterías orbitales, cañones Gauss y cúpulas de escudo</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono bg-[#05070f]/70 border border-white/8 px-4 py-2 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">Total Baterías:</span>
          <span className="font-bold text-white text-sm">{fmt(defenseSummary.totalCount)}</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-red-400">Poder Fuego:</span>
          <span className="font-bold text-red-300">{fmt(defenseSummary.totalAtk)}</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">Escudos:</span>
          <span className="font-bold text-cyan-300">{fmt(defenseSummary.totalDef)}</span>
        </div>
      </div>
    </section>
  );
};
