import { useState } from 'react';
import { BUILDINGS } from '../../data/game/buildingsData.js';
import { ExchangeAmmTerminalTab } from './ExchangeAmmTerminalTab.jsx';
import { GalacticSpotExchangeView } from './GalacticSpotExchangeView.jsx';
import { SafeImg } from '../../assets.jsx';

/**
 * ExchangeCommandHubView — Pantalla de Alto Mando del Planeta Lonja / Exchange.
 * Estilo financiero y logístico galáctico con terminal AMM, parking de naves y crowdfunding DAO.
 */
export const ExchangeCommandHubView = ({
  state,
  dispatch,
  currentPlanet,
  fmt,
  onNavigateTab,
  ministries = [],
  ministryAssets = {},
  getMinistryStats,
  hasActiveConstruction,
  onSelectMinistry,
}) => {
  const [activeTab, setActiveTab] = useState('spot'); // 'spot' | 'terminal' | 'infrastructure' | 'dao' | 'ministries'
  const [selectedRes, setSelectedRes] = useState('metal');
  const [tradeAmount, setTradeAmount] = useState(100000);
  const [orderType, setOrderType] = useState('buy'); // 'buy' | 'sell'
  const [executionMode, setExecutionMode] = useState('market'); // 'market' | 'limit'
  const [limitTargetPrice, setLimitTargetPrice] = useState(1.0);

  const exchangeBuildings = [
    'exchangeDocks',
    'exchangeVaults',
    'exchangeEngine',
    'exchangeBank',
    'exchangeBastion',
    'exchangeBunkers',
    'exchangePatrols',
    'exchangeBeacon'
  ];

  const currentBuildings = currentPlanet?.buildings || {};
  const currentCredits = state.credits || 0;
  const planetRes = currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };

  // Datos del pool DAO
  const daoShares = state.daoShares || 1000;
  const playerShares = state.playerDaoShares || 100;
  const playerPercent = ((playerShares / daoShares) * 100).toFixed(2);
  const accumulatedDividends = Math.floor((state.daoDividendPool || 250000) * (playerShares / daoShares));

  const handleClaimDividends = () => {
    if (accumulatedDividends <= 0) return;
    dispatch({
      type: 'CLAIM_DAO_DIVIDENDS',
      amount: accumulatedDividends
    });
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* Ticker Superior de Alto Mando */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#080d19] to-[#04060c] border border-amber-500/30 shadow-[0_0_35px_rgba(245,158,11,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner text-amber-400">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white uppercase tracking-wider">
                {currentPlanet?.name || 'Lonja Galáctica'}
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                ZONA FRANCA SOBERANA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Eje de Compensación Cuántica, custodia de bóvedas y distribución de dividendos galácticos.
            </p>
          </div>
        </div>

        {/* Resumen Financiero Rápido */}
        <div className="flex items-center gap-4 bg-black/60 px-5 py-3 rounded-xl border border-amber-500/20 text-xs font-mono">
          <div>
            <span className="text-slate-400">Créditos Imperiales:</span>{' '}
            <span className="text-amber-300 font-bold text-sm">₢ {fmt(currentCredits)}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div>
            <span className="text-slate-400">Acciones DAO:</span>{' '}
            <span className="text-emerald-400 font-bold">{playerPercent}%</span>
          </div>
          <span className="text-slate-700">|</span>
          <div>
            <span className="text-slate-400">Integridad Defensiva:</span>{' '}
            <span className="text-cyan-400 font-bold">98.5% (Seguro)</span>
          </div>
        </div>
      </div>

      {/* Selector de Modos de la Lonja */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('spot')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
            activeTab === 'spot'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          📈 Exchange Spot Real (Libro de Órdenes)
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
            activeTab === 'terminal'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          ⚡ Consola AMM y Bóvedas Físicas
        </button>
        <button
          onClick={() => setActiveTab('infrastructure')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
            activeTab === 'infrastructure'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          🏗️ Mega-Infraestructuras (Crowdfunding)
        </button>
        <button
          onClick={() => setActiveTab('dao')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
            activeTab === 'dao'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          🤝 Gobernanza y Dividendos DAO
        </button>
        <button
          onClick={() => setActiveTab('ministries')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
            activeTab === 'ministries'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          🏛️ Ministerios
        </button>
      </div>

      {/* Pestaña 0: Exchange Spot Real */}
      {activeTab === 'spot' && (
        <GalacticSpotExchangeView
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          fmt={fmt}
        />
      )}

      {/* Pestaña 1: Terminal de Trading */}
      {activeTab === 'terminal' && (
        <ExchangeAmmTerminalTab
          planetRes={planetRes}
          currentBuildings={currentBuildings}
          executionMode={executionMode}
          setExecutionMode={setExecutionMode}
          orderType={orderType}
          setOrderType={setOrderType}
          selectedRes={selectedRes}
          setSelectedRes={setSelectedRes}
          tradeAmount={tradeAmount}
          setTradeAmount={setTradeAmount}
          limitTargetPrice={limitTargetPrice}
          setLimitTargetPrice={setLimitTargetPrice}
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          fmt={fmt}
        />
      )}

      {/* Pestaña 2: Mega-Infraestructuras */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-4">
          {/* Barra de Acciones Masivas */}
          <div className="p-4 rounded-2xl bg-[#0a101f]/90 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                ⚡ Financiación Acelerada de Megaproyectos
              </div>
              <div className="text-[11px] text-slate-400">
                Aporta reservas disponibles del planeta para completar las infraestructuras de golpe sin clics repetitivos.
              </div>
            </div>
            <button
              onClick={() => {
                const availableMetal = planetRes.metal || 0;
                if (availableMetal <= 0) return;
                // Dividir equitativamente entre las que no han llegado al 100%
                const pending = exchangeBuildings.filter(bId => ((state.exchangeProjects?.[bId] || 0) < 50000000));
                if (pending.length === 0) return;
                const portion = Math.floor(availableMetal / pending.length);
                if (portion <= 0) return;
                pending.forEach(bId => {
                  const needed = Math.max(0, 50000000 - (state.exchangeProjects?.[bId] || 0));
                  const amt = Math.min(portion, needed);
                  if (amt > 0) {
                    dispatch({
                      type: 'CONTRIBUTE_EXCHANGE_PROJECT',
                      buildingId: bId,
                      amount: amt,
                      resource: 'metal'
                    });
                  }
                });
              }}
              disabled={(planetRes.metal || 0) <= 0}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>🚀</span>
              <span>Aportar Todo a Todos ({fmt(planetRes.metal || 0)} Metal)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exchangeBuildings.map(bId => {
              const b = BUILDINGS[bId] || {};
              const lvl = currentBuildings[bId] || 0;
              const currentContributed = state.exchangeProjects?.[bId] || 0;
              const targetGoal = 50000000;
              const remaining = Math.max(0, targetGoal - currentContributed);
              const progressPct = Math.min(100, Math.round((currentContributed / targetGoal) * 100));

              return (
                <div key={bId} className="p-4 rounded-2xl bg-[#070b16]/90 border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{b.icon || '🏛️'}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        Nivel {lvl}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2">{b.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{b.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                      <span>Progreso Crowdfunding:</span>
                      <span className="text-amber-300 font-bold">{progressPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400" style={{ width: `${progressPct}%` }} />
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => dispatch({
                          type: 'CONTRIBUTE_EXCHANGE_PROJECT',
                          buildingId: bId,
                          amount: Math.min(500000, remaining > 0 ? remaining : 500000),
                          resource: 'metal'
                        })}
                        disabled={(planetRes.metal || 0) < 500000}
                        className="py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold hover:bg-amber-500 hover:text-black disabled:opacity-40 transition-all cursor-pointer"
                      >
                        +500K Metal
                      </button>

                      <button
                        onClick={() => {
                          const availableMetal = planetRes.metal || 0;
                          const toAdd = Math.min(availableMetal, remaining > 0 ? remaining : availableMetal);
                          if (toAdd > 0) {
                            dispatch({
                              type: 'CONTRIBUTE_EXCHANGE_PROJECT',
                              buildingId: bId,
                              amount: toAdd,
                              resource: 'metal'
                            });
                          }
                        }}
                        disabled={(planetRes.metal || 0) <= 0}
                        className="py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 border border-emerald-500/50 text-[10px] font-mono font-bold hover:bg-emerald-500 hover:text-black disabled:opacity-40 transition-all cursor-pointer"
                        title="Aportar todo el metal disponible a este megaproyecto"
                      >
                        ⚡ Agregar Todo
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pestaña 3: DAO y Dividendos */}
      {activeTab === 'dao' && (
        <div className="p-6 rounded-2xl bg-[#070b16]/90 border border-emerald-500/30 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                Fondo Común de Inversores de la Lonja
              </h3>
              <p className="text-xs text-slate-400">
                Cada aporte de recursos para mejorar infraestructuras te concede títulos de propiedad perpetuos.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/40 text-right">
              <div className="text-xs text-slate-400 font-mono">Tus Dividendos Disponibles:</div>
              <div className="text-xl font-black text-emerald-400 font-mono">₢ {fmt(accumulatedDividends)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center space-y-1">
              <div className="text-xs text-slate-400">Total Recaudado en Comisiones</div>
              <div className="text-base font-bold text-amber-300 font-mono">₢ 1.250.000 / ciclo</div>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center space-y-1">
              <div className="text-xs text-slate-400">Tu Participación Accionarial</div>
              <div className="text-base font-bold text-cyan-300 font-mono">{playerPercent}% del Pool</div>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center space-y-1">
              <div className="text-xs text-slate-400">Reserva de Mantenimiento</div>
              <div className="text-base font-bold text-emerald-300 font-mono">40% Fijo Asegurado</div>
            </div>
          </div>

          <button
            onClick={handleClaimDividends}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-98 transition-all"
          >
            Reclamar Dividendos al Balance Imperial
          </button>
        </div>
      )}

      {/* Pestaña 4: Ministerios */}
      {activeTab === 'ministries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm md:text-base font-black text-cyan-300 font-mono tracking-wider uppercase flex items-center gap-2">
              <span>🏛️</span>
              <span>Ministerios de la Lonja</span>
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full items-stretch pt-1 pb-4">
            {ministries.map((m) => {
              const stats = getMinistryStats ? getMinistryStats(m) : { totalLevels: 0, buildingCount: m.buildings?.length || 0, activeCount: 0 };
              const isBuilding = hasActiveConstruction ? hasActiveConstruction(m) : false;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMinistry && onSelectMinistry(m.id)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none bg-[#090d1f]/90 border-white/10 hover:border-cyan-400 hover:bg-[#0e1633] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] active:scale-[0.98] cursor-pointer text-left focus:outline-none w-full h-full min-h-[200px]"
                >
                  <div className="relative w-full h-24 sm:h-28 overflow-hidden bg-[#05070f] border-b border-white/10">
                    <SafeImg
                      id={ministryAssets[m.id] || 'constructionCenter'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    {isBuilding && (
                      <span className="absolute top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse z-10">
                        🔨 En curso
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors truncate">
                        {m.name.replace('Ministerio de ', '')}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                        <span>{stats.activeCount}/{stats.buildingCount} activos</span>
                        <span className="text-cyan-300 font-bold">{stats.totalLevels} Nvs.</span>
                      </div>
                    </div>
                    <div className="w-full mt-3">
                      <div className="w-full h-1.5 bg-[#05070f] rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, stats.totalLevels * 2)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
