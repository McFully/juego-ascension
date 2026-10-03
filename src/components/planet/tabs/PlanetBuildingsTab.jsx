import React from 'react';

export const PlanetBuildingsTab = ({
  buildingCategories,
  BUILDINGS,
  buildings
}) => {
  return (
    <div className="space-y-6">
      {buildingCategories.map((category) => {
        const categoryBuildings = Object.entries(BUILDINGS).filter(
          ([, b]) => b.cat === category.id
        );
        if (categoryBuildings.length === 0) return null;

        return (
          <div key={category.id} className="p-5 rounded-3xl bg-[#070b1a] border border-white/10 space-y-4">
            <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <span>{category.icon}</span>
              <span>{category.title}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
              {categoryBuildings.map(([bId, bData]) => {
                const lvl = buildings[bId] || 0;
                return (
                  <div
                    key={bId}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      lvl > 0
                        ? 'bg-black/60 border-cyan-500/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                        : 'bg-black/20 border-white/5 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{bData.icon || '🏗️'}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{bData.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {bData.prod ? `Prod: +${bData.baseProd}/h` : bData.energyGen ? `Gen: +${bData.energyGen} ⚡` : 'Soporte'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className="text-[10px] uppercase text-slate-400">Nv</span>
                      <span className={`text-base font-black ${lvl > 0 ? 'text-cyan-300' : 'text-slate-600'}`}>
                        {lvl}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
