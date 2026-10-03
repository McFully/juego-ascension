import React from 'react';

export const PlanetMilitaryTab = ({
  buildings,
  globalResearch,
  RESEARCH
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Instalaciones Militares Clave */}
      <div className="p-5 rounded-3xl bg-[#070b1a] border border-white/10 space-y-4">
        <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
          <span>🚀</span>
          <span>Instalaciones de Fabricación y Mando</span>
        </h4>
        <div className="space-y-2.5 font-mono">
          {[
            { id: 'shipyard', name: 'Astillero Orbital', icon: '🚀', desc: 'Permite la construcción de naves de combate y cargueros' },
            { id: 'robotFactory', name: 'Fábrica de Robots', icon: '🤖', desc: 'Reduce los tiempos de construcción de todas las obras' },
            { id: 'naniteFactory', name: 'Fábrica de Nanobots', icon: '🧬', desc: 'Multiplica exponencialmente la velocidad de astillero y obras' },
            { id: 'researchLab', name: 'Laboratorio Científico', icon: '🔬', desc: 'Aporta potencia a la red interplanetaria de investigación' },
            { id: 'missileSilo', name: 'Silo de Misiles', icon: '🎯', desc: 'Almacén para misiles de intercepción y ofensivos' }
          ].map((item) => {
            const lvl = buildings[item.id] || 0;
            return (
              <div key={item.id} className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </div>
                </div>
                <span className="text-lg font-black text-cyan-300 px-3 py-1 bg-cyan-950/40 rounded-xl border border-cyan-500/30">
                  Nv {lvl}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tecnologías Globales Clave */}
      <div className="p-5 rounded-3xl bg-[#070b1a] border border-white/10 space-y-4">
        <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
          <span>🔬</span>
          <span>Tecnologías Estratégicas del Imperio</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono">
          {Object.entries(RESEARCH).slice(0, 10).map(([rId, rData]) => {
            const lvl = globalResearch[rId] || 0;
            return (
              <div key={rId} className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-lg">{rData.icon || '🔬'}</span>
                  <span className="text-xs text-slate-300 truncate">{rData.name}</span>
                </div>
                <span className="text-xs font-black text-amber-400">Nv {lvl}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
