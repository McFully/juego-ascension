import React from 'react';
import { COLONY_DEMAND_TYPES } from '../../data/imperialCouncilData.js';

export const ColonyDemandsView = ({
  state,
  dispatch,
  currentPlanet,
  fmt
}) => {
  const council = state?.imperialCouncil || { colonyDemands: [] };
  const demands = council.colonyDemands || [];
  const planets = state?.planets || [];

  const handleSupply = (demandId) => {
    if (window.playSfx) window.playSfx('tradeSuccess');
    dispatch({
      type: 'RESOLVE_COLONY_DEMAND',
      demandId,
      planetId: currentPlanet?.id
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h3 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span>📦</span>
            <span>Demandas y Crisis de Especialización Colonial ({demands.length})</span>
          </h3>
          <p className="text-xs text-slate-400">
            A medida que el Imperio sobrepasa los 10 mundos, las colonias remotas especializadas requieren convoyes de suministro periódicos.
          </p>
        </div>
        <span className="px-3 py-1 rounded-lg text-xs font-mono bg-indigo-950/60 border border-indigo-500/40 text-indigo-300">
          Planeta de Despacho: {currentPlanet?.name}
        </span>
      </div>

      {demands.length === 0 ? (
        <div className="p-8 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
          <div className="text-3xl">✨</div>
          <h4 className="text-sm font-bold text-slate-300">Todas las colonias se encuentran abastecidas</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No hay emergencias ni peticiones logísticas pendientes en la red imperial de colonias en este ciclo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demands.map(demand => {
            const targetPlanet = planets.find(p => p.id === demand.targetPlanetId);
            const reqRes = demand.reqRes || {};
            const res = currentPlanet?.resources || {};
            const canAffordSupply =
              (res.metal || 0) >= (reqRes.metal || 0) &&
              (res.crystal || 0) >= (reqRes.crystal || 0) &&
              (res.deuterium || 0) >= (reqRes.deuterium || 0);

            return (
              <div
                key={demand.id}
                className="p-4 rounded-2xl bg-[#0a0d1e]/90 border border-indigo-500/30 hover:border-indigo-400/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30">
                      {demand.icon}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                      {targetPlanet?.name || 'Colonia Remota'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">
                    {demand.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {demand.desc}
                  </p>

                  {/* Requisitos */}
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Recursos Exigidos al Mundo Actual:
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      {reqRes.metal && (
                        <span className={(res.metal || 0) >= reqRes.metal ? 'text-slate-200' : 'text-rose-400 font-bold'}>
                          Metal: {fmt ? fmt(reqRes.metal) : reqRes.metal}
                        </span>
                      )}
                      {reqRes.crystal && (
                        <span className={(res.crystal || 0) >= reqRes.crystal ? 'text-cyan-300' : 'text-rose-400 font-bold'}>
                          Cristal: {fmt ? fmt(reqRes.crystal) : reqRes.crystal}
                        </span>
                      )}
                      {reqRes.deuterium && (
                        <span className={(res.deuterium || 0) >= reqRes.deuterium ? 'text-teal-300' : 'text-rose-400 font-bold'}>
                          Deuterio: {fmt ? fmt(reqRes.deuterium) : reqRes.deuterium}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recompensa */}
                  <div className="text-[11px] text-emerald-400">
                    <span className="font-bold">Recompensa: </span>
                    {demand.reward}
                  </div>
                </div>

                <button
                  onClick={() => handleSupply(demand.id)}
                  disabled={!canAffordSupply}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                    canAffordSupply
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:brightness-110 active:scale-[0.98]'
                      : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <span>🚚</span>
                  <span>{canAffordSupply ? 'Despachar Convoy de Suministro' : 'Faltan Recursos en este Mundo'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
