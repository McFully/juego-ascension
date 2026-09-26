import React from 'react';

export const ShipModuleSlots = ({
  stats,
  bpWeapon,
  setBpWeapon,
  SHIP_WEAPONS,
  bpEngine,
  setBpEngine,
  SHIP_ENGINES,
  bpShield,
  setBpShield,
  SHIP_SHIELDS,
  bpModules,
  toggleModule,
  SHIP_MODULES,
  fmt
}) => {
  return (
    <>
      {/* 2. Armamento */}
      <div className="p-6 rounded-3xl bg-[#090d1f]/90 border border-white/10 space-y-4">
        <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
          2. Sistema de Armamento ({stats?.slotsUsed || 0}/{stats?.slotsMax || 0} ranuras ocupadas)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setBpWeapon('')}
            className={`p-4 rounded-2xl border text-center font-mono text-xs transition-all cursor-pointer ${
              !bpWeapon ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300' : 'border-white/10 bg-[#05070f] text-slate-400 hover:border-white/20'
            }`}
          >
            Sin Armamento Instalado
          </button>
          {Object.entries(SHIP_WEAPONS || {}).map(([id, w]) => (
            <button
              key={id}
              onClick={() => setBpWeapon(id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                bpWeapon === id
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'border-white/10 bg-[#05070f] hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{w.icon}</span>
                <span className="font-bold text-xs uppercase">{w.name}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                ⚔️ {w.atk} · ⚡ {w.energy} · 🔲 {w.slots} ranuras
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Motor */}
      <div className="p-6 rounded-3xl bg-[#090d1f]/90 border border-white/10 space-y-4">
        <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
          3. Propulsores y Motores de Curvatura
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setBpEngine('')}
            className={`p-4 rounded-2xl border text-center font-mono text-xs transition-all cursor-pointer ${
              !bpEngine ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300' : 'border-white/10 bg-[#05070f] text-slate-400 hover:border-white/20'
            }`}
          >
            Sin Motor Secundario
          </button>
          {Object.entries(SHIP_ENGINES || {}).map(([id, e]) => (
            <button
              key={id}
              onClick={() => setBpEngine(id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                bpEngine === id
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'border-white/10 bg-[#05070f] hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{e.icon}</span>
                <span className="font-bold text-xs uppercase">{e.name}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                🚀 +{fmt(e.speed)} vel · ⛽ {e.fuelCons} consumo · 🔲 {e.slots} ranuras
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Escudo */}
      <div className="p-6 rounded-3xl bg-[#090d1f]/90 border border-white/10 space-y-4">
        <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
          4. Generador de Escudos Defensivos
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setBpShield('')}
            className={`p-4 rounded-2xl border text-center font-mono text-xs transition-all cursor-pointer ${
              !bpShield ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300' : 'border-white/10 bg-[#05070f] text-slate-400 hover:border-white/20'
            }`}
          >
            Sin Escudo Adicional
          </button>
          {Object.entries(SHIP_SHIELDS || {}).map(([id, s]) => (
            <button
              key={id}
              onClick={() => setBpShield(id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                bpShield === id
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'border-white/10 bg-[#05070f] hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{s.icon}</span>
                <span className="font-bold text-xs uppercase">{s.name}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                🛡️ +{s.shield} escudo · ⚡ {s.energy} · 🔲 {s.slots} ranuras
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Módulos Auxiliares */}
      <div className="p-6 rounded-3xl bg-[#090d1f]/90 border border-white/10 space-y-4">
        <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
          5. Bahías y Módulos Auxiliares Especiales
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(SHIP_MODULES || {}).map(([id, m]) => {
            const isInstalled = bpModules.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleModule(id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isInstalled
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'border-white/10 bg-[#05070f] hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{m.icon}</span>
                  <span className="font-bold text-xs uppercase">{m.name}</span>
                </div>
                <p className="text-[10px] text-slate-300 font-mono mb-2">{m.desc}</p>
                <div className="text-[10px] text-cyan-400 font-mono">
                  🔲 {m.slots} ranuras requeridas
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
