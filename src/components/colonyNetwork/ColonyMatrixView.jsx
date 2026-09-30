import React from 'react';

export const ColonyMatrixView = ({ planets, currentPlanet, fmt, onSelectPlanet, dispatch }) => {
  const isSingleWorld = (planets || []).length <= 1;

  return (
    <div className="space-y-4">
      {isSingleWorld && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-[#0a142e]/80 to-[#040817] border border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚀</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Programa de Expansión Territorial Activo
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                1 MUNDO DETECTADO
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Tu imperio se concentra actualmente en tu mundo capital. Para habilitar la nivelación de recursos, las rutas de suministro continuas y la reubicación de flotas, investiga <strong className="text-cyan-300 font-mono">Astrofísica</strong> en el Laboratorio y construye naves <strong className="text-amber-300 font-mono">Colonizadoras</strong> en el Astillero para reclamar nuevos planetas en la Galaxia.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-indigo-300 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
              Red en Espera de Colonias
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {planets.map(p => {
        const isSelected = p.id === currentPlanet?.id;
        const shipCount = Object.values(p.fleet || {}).reduce((a, b) => a + b, 0);
        const defCount = Object.values(p.defenses || {}).reduce((a, b) => a + b, 0);

        return (
          <div
            key={p.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              isSelected
                ? 'bg-gradient-to-b from-indigo-950/40 via-[#0a1024] to-[#040711] border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.25)]'
                : 'bg-[#060a16]/80 border-white/10 hover:border-indigo-500/40'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{p.isHome ? '👑' : '🪐'}</span>
                    <span>{p.name}</span>
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-400">
                    [{p.galaxy}:{p.system}:{p.position}] {p.isHome ? '• Capital' : '• Colonia'}
                  </span>
                </div>
                {isSelected && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-500/50">
                    ACTIVO
                  </span>
                )}
              </div>

              {/* Recursos Almacenados */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 text-center text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">Metal</div>
                  <div className="text-cyan-300 font-bold">{fmt ? fmt(p.resources?.metal || 0) : (p.resources?.metal || 0)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Cristal</div>
                  <div className="text-emerald-300 font-bold">{fmt ? fmt(p.resources?.crystal || 0) : (p.resources?.crystal || 0)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Deuterio</div>
                  <div className="text-amber-300 font-bold">{fmt ? fmt(p.resources?.deuterium || 0) : (p.resources?.deuterium || 0)}</div>
                </div>
              </div>

              {/* Guarnición y Especialización */}
              <div className="flex justify-between text-xs text-slate-400 pt-1">
                <span>🛸 Flota: <strong className="text-white font-mono">{shipCount}</strong></span>
                <span>🛡️ Defensas: <strong className="text-white font-mono">{defCount}</strong></span>
                <span>🎭 {p.specialization ? p.specialization : 'Estándar'}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              {!p.isHome && dispatch && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'PLANET_TOGGLE_AUTOTRADE', planetId: p.id });
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    p.autoTrade
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10'
                  }`}
                  title={p.autoTrade ? 'Auto-Comercio activado: gestiona envíos automáticos de excedentes' : 'Auto-Comercio desactivado'}
                >
                  <span className={`w-2 h-2 rounded-full ${p.autoTrade ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  {p.autoTrade ? 'Auto-Comercio ON' : 'Auto-Comercio OFF'}
                </button>
              )}
              <button
                onClick={() => onSelectPlanet(p.id)}
                disabled={isSelected}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isSelected
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 cursor-default'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                {isSelected ? 'Planeta Activo' : 'Saltar a Mundo'}
              </button>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};
