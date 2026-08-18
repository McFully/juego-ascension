import React from 'react';

export const MinistryPerformanceMetrics = ({ selectedMinistry, currentPlanet, currentMinUpgrades, currentMinState, planetResources, fmt, dispatch }) => {
  return (
    <div className="glass-deep rounded-2xl p-4 border border-white/5 space-y-3">
      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-black">Métricas de Rendimiento del Sector</span>
      
      <div className="space-y-3 pt-1">
        {selectedMinistry === 'economy' && (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Población Civil</span>
              <span className="font-mono text-white font-bold">{fmt(currentPlanet.population || 1000)} hab.</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">PIB Nova Proyectado</span>
              <span className="font-mono text-amber-400 font-bold">{fmt(2500000 + (currentMinUpgrades.mining_subsidy || 0)*250005)} CR</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Tasa de Inflación Fiscal</span>
              <span className="font-mono text-red-400 font-bold">{(0.02 + (currentMinState.taxRate || 0)*0.1).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Índice Gini del Borde</span>
              <span className="font-mono text-cyan-400 font-bold">0.34</span>
            </div>
            <div className="border-t border-white/5 pt-2 mt-2 space-y-2">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-black block">Negocios Civiles Activos</span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="bg-slate-950/40 p-1.5 rounded border border-white/5">
                  <span className="text-slate-500 block">Clase Baja</span>
                  <span className="text-white font-bold">{currentPlanet.civilBusinesses?.lowClass || 0}</span>
                </div>
                <div className="bg-slate-950/40 p-1.5 rounded border border-white/5">
                  <span className="text-slate-500 block">Clase Media</span>
                  <span className="text-cyan-400 font-bold">{currentPlanet.civilBusinesses?.midClass || 0}</span>
                </div>
                <div className="bg-slate-950/40 p-1.5 rounded border border-white/5">
                  <span className="text-slate-500 block">Clase Alta</span>
                  <span className="text-amber-400 font-bold">{currentPlanet.civilBusinesses?.highClass || 0}</span>
                </div>
              </div>
              <div className="pt-2 space-y-1.5">
                <span className="text-[9px] text-slate-500 block font-mono uppercase">Promover Negocios Civiles</span>
                {[
                  { key: 'lowClass', name: 'Negocio Clase Baja', cost: { metal: 5000, crystal: 2000 }, revenue: '+5 CR', label: 'Establecer' },
                  { key: 'midClass', name: 'Negocio Clase Media', cost: { metal: 15000, crystal: 8000 }, revenue: '+15 CR', label: 'Incentivar' },
                  { key: 'highClass', name: 'Negocio Clase Alta', cost: { metal: 50000, crystal: 25000 }, revenue: '+50 CR', label: 'Subvencionar' }
                ].map(b => {
                  const canAff = planetResources.metal >= b.cost.metal && planetResources.crystal >= b.cost.crystal;
                  return (
                    <div key={b.key} className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5 text-[10px]">
                      <div className="text-left">
                        <span className="text-slate-200 font-bold block">{b.name}</span>
                        <span className="text-slate-500 text-[8px] block">Req: ⛏️{fmt(b.cost.metal)} / 💎{fmt(b.cost.crystal)} | Renta: <span className="text-emerald-500 font-bold">{b.revenue}</span></span>
                      </div>
                      <button
                        disabled={!canAff}
                        onClick={() => dispatch({ type: 'BUY_CIVIL_BUSINESS', planetId: currentPlanet.id, businessType: b.key, cost: b.cost })}
                        className={`px-2 py-1 text-[9px] font-bold uppercase rounded ${
                          canAff ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-white/5 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {b.label}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
        {selectedMinistry === 'defense' && (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Disponibilidad Táctica Armada</span>
              <span className="font-mono text-red-400 font-bold">{85 + (currentMinUpgrades.armour_plating || 0)*3}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Defensa Satelital Global</span>
              <span className="font-mono text-emerald-400 font-bold">Nv {currentMinUpgrades.def_grid || 0} / 5</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Estado de Alerta Estratégica</span>
              <span className="font-mono text-amber-400 font-bold">DEFCON 3</span>
            </div>
          </>
        )}
        {selectedMinistry === 'science' && (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Bono Global de Velocidad de I+D</span>
              <span className="font-mono text-cyan-400 font-bold">+{( (currentMinUpgrades.neural_quantum || 0)*15 + (currentMinState.researchGrants || 0)*200 ).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Eficiencia Energética de Reactores</span>
              <span className="font-mono text-emerald-400 font-bold">+{ (currentMinUpgrades.reactor_tech || 0)*10 }%</span>
            </div>
          </>
        )}
        {selectedMinistry === 'culture' && (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Unidad Social de la República</span>
              <span className="font-mono text-purple-400 font-bold">{80 + (currentMinUpgrades.social_monuments || 0)*4}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Tasa de Aprobación del Gabinete</span>
              <span className="font-mono text-emerald-400 font-bold">92%</span>
            </div>
          </>
        )}
        {selectedMinistry === 'infra' && (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Bono de Edificación Orbital</span>
              <span className="font-mono text-emerald-400 font-bold">-{( (currentMinUpgrades.orbital_roads || 0)*10 ).toFixed(0)}% Tiempo</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Eficiencia en Hangar de Carga</span>
              <span className="font-mono text-cyan-400 font-bold">+{ (currentMinUpgrades.cargo_drones || 0)*15 }%</span>
            </div>
          </>
        )}
        {selectedMinistry === 'intel' && (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Protección contra Espías IAs</span>
              <span className="font-mono text-blue-400 font-bold">+{ (currentMinUpgrades.hawk_eye || 0)*15 }%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Infiltración de Células Durmientes</span>
              <span className="font-mono text-purple-400 font-bold">Grado { currentMinUpgrades.sleeper_net || 0 }</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
