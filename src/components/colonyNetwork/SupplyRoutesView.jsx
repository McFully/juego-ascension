import React from 'react';

export const SupplyRoutesView = ({
  planets,
  routeFrom,
  setRouteFrom,
  routeRes,
  setRouteRes,
  routeRatio,
  setRouteRatio,
  tradeRoutes,
  dispatch
}) => {
  const resNames = { metal: 'Metal', crystal: 'Cristal', deuterium: 'Deuterio' };

  return (
    <div className="space-y-6">
      {/* Panel de Configuración de Nueva Ruta */}
      <div className="p-5 rounded-2xl bg-[#060a16]/90 border border-indigo-500/30 space-y-4">
        <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-2">
          <span>🚚</span> Establecer Nueva Ruta Intercolonial
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Mundo de Origen (Colonia)</label>
            <select
              value={routeFrom}
              onChange={(e) => setRouteFrom(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
            >
              {planets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.galaxy}:{p.system}:{p.position}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Recurso a Transferir</label>
            <select
              value={routeRes}
              onChange={(e) => setRouteRes(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
            >
              <option value="metal">⛏️ Metal</option>
              <option value="crystal">💎 Cristal</option>
              <option value="deuterium">⚗️ Deuterio</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Umbral de Almacén</label>
            <select
              value={routeRatio}
              onChange={(e) => setRouteRatio(parseFloat(e.target.value))}
              className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
            >
              <option value="0.25">Al superar 25% de capacidad</option>
              <option value="0.5">Al superar 50% de capacidad</option>
              <option value="0.75">Al superar 75% de capacidad</option>
            </select>
          </div>

          <button
            onClick={() => {
              if (!routeFrom) return;
              const capital = planets.find(p => p.isHome) || planets.find(p => p.id !== routeFrom);
              dispatch({
                type: 'ADD_TRADE_ROUTE',
                fromId: routeFrom,
                toId: capital?.id || null,
                resource: routeRes,
                mode: 'surplus',
                ratio: routeRatio,
                intervalDays: 1,
                loop: true
              });
              if (window.playSfx) window.playSfx('tradeSuccess');
            }}
            disabled={(tradeRoutes || []).length >= 10}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              (tradeRoutes || []).length < 10
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:brightness-110 active:scale-[0.98] shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            + Activar Ruta
          </button>
        </div>
      </div>

      {/* Listado de Rutas Activas */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Rutas Activas ({(tradeRoutes || []).length}/10)
        </h4>

        {(tradeRoutes || []).length === 0 ? (
          <div className="p-8 text-center bg-black/40 rounded-2xl border border-white/5 space-y-2">
            <span className="text-2xl opacity-60">🛸</span>
            <p className="text-xs text-slate-400">
              No hay rutas comerciales automáticas en funcionamiento. Crea una ruta superior para canalizar excedentes de tus minas hacia la capital o mundos forja.
            </p>
          </div>
        ) : (
          (tradeRoutes || []).map((route) => {
            const originPlanet = planets.find(p => p.id === route.fromId);

            return (
              <div
                key={route.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  route.active
                    ? 'bg-indigo-950/20 border-indigo-500/40 shadow-sm'
                    : 'bg-black/40 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-base">
                    🚚
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{originPlanet?.name || 'Origen Desconocido'}</span>
                      <span className="text-slate-400">➔</span>
                      <span className="text-cyan-300">Capital Central</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Excedentes de <strong className="text-white">{resNames[route.resource] || route.resource}</strong> cuando supere el <strong className="text-indigo-300">{Math.round((route.ratio || 0.5) * 100)}%</strong> de almacén.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_TRADE_ROUTE', routeId: route.id })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                      route.active
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}
                  >
                    {route.active ? '✓ Operativa' : 'Pausada'}
                  </button>

                  <button
                    onClick={() => dispatch({ type: 'REMOVE_TRADE_ROUTE', routeId: route.id })}
                    className="px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 border border-rose-500/20"
                    title="Cancelar ruta"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
