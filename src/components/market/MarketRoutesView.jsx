import React, { useState } from 'react';
import { fmt } from '../../core.jsx';
import { getPlanetHeritage } from '../../data/planetaryHeritageData.js';

/**
 * MarketRoutesView — Consola de Acuerdos y Rutas de Intercambio Bilateral.
 * Permite interconectar mundos del imperio para obtener ingresos de arbitraje pasivo en créditos
 * y sinergias comerciales continuas.
 */
export const MarketRoutesView = ({ state, dispatch, currentPlanet }) => {
  const [targetPlanetId, setTargetPlanetId] = useState('');
  const [routeType, setRouteType] = useState('raw_materials'); // 'raw_materials' | 'tech_exchange' | 'luxury_goods'

  const planets = state?.planets || [];
  const activeRoutes = state?.bilateralTradeRoutes || [];
  const otherPlanets = planets.filter(p => p.id !== currentPlanet?.id);

  const routeTypes = {
    raw_materials: {
      name: 'Ruta de Suministro de Minerales',
      desc: '+150 Créditos/tick y +5% producción compartida de Metal/Cristal entre ambos mundos.',
      icon: '⛏️',
      costCredits: 2500,
      rewardCredits: 150
    },
    tech_exchange: {
      name: 'Corredor de Transferencia Tecnológica',
      desc: '+200 Créditos/tick y +8% velocidad I+D si uno de los planetas tiene rasgo científico.',
      icon: '🔬',
      costCredits: 5000,
      rewardCredits: 200
    },
    luxury_goods: {
      name: 'Pacto de Bienes Coloniales y Lujo',
      desc: '+250 Créditos/tick y +10% moral ciudadana en ambos mundos.',
      icon: '💎',
      costCredits: 7500,
      rewardCredits: 250
    }
  };

  const handleCreateRoute = () => {
    if (!targetPlanetId || !currentPlanet) return;
    const cfg = routeTypes[routeType];
    if ((state.credits || 0) < cfg.costCredits) {
      if (window.playSfx) window.playSfx('uiError');
      return;
    }

    dispatch({
      type: 'ESTABLISH_BILATERAL_ROUTE',
      payload: {
        originId: currentPlanet.id,
        targetId: targetPlanetId,
        routeType,
        rewardCredits: cfg.rewardCredits,
        costCredits: cfg.costCredits
      }
    });

    if (window.playSfx) window.playSfx('tradeSuccess');
    setTargetPlanetId('');
  };

  const handleCancelRoute = (routeId) => {
    dispatch({
      type: 'CANCEL_BILATERAL_ROUTE',
      payload: { routeId }
    });
    if (window.playSfx) window.playSfx('click');
  };

  const currentHeritage = getPlanetHeritage(currentPlanet);

  return (
    <div className="space-y-6">
      {/* Banner de Cabecera */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-blue-950/60 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌐</span>
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Red de Rutas Comerciales Bilaterales
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {activeRoutes.length} RUTAS ACTIVAS
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono mt-1">
            Enlaza la Lonja de <strong className="text-cyan-300">{currentPlanet?.name}</strong> con otros mundos para arbitrar excedentes y cosechar dividendos en créditos continuos.
          </p>
        </div>

        {currentHeritage && (
          <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-cyan-500/30 text-xs font-mono shrink-0">
            <span className="text-slate-400 block text-[10px]">HITO LOCAL DE ESTE MUNDO:</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1.5 mt-0.5">
              <span>{currentHeritage.icon}</span>
              <span>{currentHeritage.name}</span>
            </span>
          </div>
        )}
      </div>

      {/* Creador de Nuevas Rutas */}
      <div className="p-5 rounded-2xl bg-[#060a16]/90 border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
          <span>➕</span> Establecer Nuevo Enlace Mercantil
        </h4>

        {otherPlanets.length === 0 ? (
          <div className="text-xs font-mono text-slate-400 py-4 text-center">
            Debes colonizar o poseer al menos otro planeta para trazar rutas comerciales bilaterales.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-mono">Destino del Enlace:</label>
              <select
                value={targetPlanetId}
                onChange={(e) => setTargetPlanetId(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-400"
              >
                <option value="">Selecciona planeta destino...</option>
                {otherPlanets.map(p => {
                  const pHer = getPlanetHeritage(p);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.galaxy}:{p.system}:{p.position}] {pHer ? `(${pHer.name})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-mono">Modalidad de Tratado:</label>
              <select
                value={routeType}
                onChange={(e) => setRouteType(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-400"
              >
                {Object.entries(routeTypes).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.icon} {v.name} (Coste: {fmt(v.costCredits)} ₢)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateRoute}
              disabled={!targetPlanetId || (state.credits || 0) < routeTypes[routeType].costCredits}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                targetPlanetId && (state.credits || 0) >= routeTypes[routeType].costCredits
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer'
                  : 'bg-white/5 text-slate-500 border-white/10 cursor-not-allowed'
              }`}
            >
              Firmar Tratado de Ruta
            </button>
          </div>
        )}
      </div>

      {/* Listado de Rutas Activas */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wide font-mono flex items-center gap-2">
          <span>📜</span> Tratados y Rutas en Servicio
        </h4>

        {activeRoutes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-black/40 border border-white/5 text-center text-slate-500 font-mono text-xs">
            No hay rutas de intercambio bilaterales activas en este momento. Establece la primera arriba para percibir dividendos.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRoutes.map((r) => {
              const orig = planets.find(p => p.id === r.originId);
              const dest = planets.find(p => p.id === r.targetId);
              const cfg = routeTypes[r.routeType] || routeTypes.raw_materials;

              return (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-[#080d1e]/90 border border-emerald-500/20 flex flex-col justify-between space-y-3 shadow-md hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                      <span>{cfg.icon}</span>
                      <span>{cfg.name}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                      +{r.rewardCredits || 150} ₢/tick
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono bg-black/40 p-2.5 rounded-xl border border-white/5">
                    <span className="text-cyan-300 font-bold">{orig?.name || 'Origen'}</span>
                    <span className="text-slate-500 text-base">⇄</span>
                    <span className="text-cyan-300 font-bold">{dest?.name || 'Destino'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {cfg.desc}
                    </span>
                    <button
                      onClick={() => handleCancelRoute(r.id)}
                      className="px-2.5 py-1 text-[10px] font-mono text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg transition-all"
                    >
                      Cancelar Ruta
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
