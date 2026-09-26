import React from 'react';

export const ShipChassisSelector = ({ SHIP_CHASSIS, bpChassis, setBpChassis, fmt }) => {
  return (
    <div className="p-6 rounded-3xl bg-[#090d1f]/90 border border-white/10 space-y-4">
      <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
        1. Selección de Chasis Estelar
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(SHIP_CHASSIS || {}).map(([id, c]) => (
          <button
            key={id}
            onClick={() => setBpChassis(id)}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all p-4 cursor-pointer ${
              bpChassis === id
                ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'border-white/10 bg-[#05070f] hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{c.icon}</span>
              <div>
                <h5 className="text-sm font-bold text-white uppercase">{c.name}</h5>
                <span className="text-[10px] font-mono text-cyan-300">Ranuras: {c.slots}</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono space-y-0.5 mt-2 pt-2 border-t border-white/5">
              <div>Estructura: <strong className="text-emerald-300 font-bold">{c.hull}</strong></div>
              <div>Carga: <strong className="text-amber-300 font-bold">{fmt(c.cargo)}</strong></div>
              <div>Velocidad: <strong className="text-cyan-300 font-bold">{fmt(c.speed)}</strong></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
