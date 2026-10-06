import React, { useState, useMemo } from 'react';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { UsedShipBazaarView } from '../components/market/UsedShipBazaarView.jsx';
import { BlackMarketView } from '../components/market/BlackMarketView.jsx';
import { AutomatedTradeRulesView } from '../components/market/AutomatedTradeRulesView.jsx';
import { MarketDistrictCardGrid } from '../components/market/MarketDistrictCardGrid.jsx';
import { MarketRoutesView } from '../components/market/MarketRoutesView.jsx';
import { GalacticSpotExchangeView } from '../components/market/GalacticSpotExchangeView.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';
import { CORPORATE_CONTRACTS } from '../data/galacticMarketData.js';
import {
  checkPhysicalAccess,
  FEE_RATE
} from '../utils/galacticSpotExchange.js';
import { getLocalTickerQuotes, estimateSpotArbitrage } from '../utils/spotArbitrage.js';

export const GalacticMarketPage = ({
  state,
  dispatch,
  currentPlanet,
  production,
  fmt,
  S,
  onOpenCodex,
  setActiveTab
}) => {
  const { navigateBack } = useNavigation();
  // 'exchange' | 'used_ships' | 'contracts' | 'black_market' | 'automated_rules'
  const [activeSubTab, setActiveSubTab] = useState('exchange');
  const [exchangeMode, setExchangeMode] = useState('spot'); // 'spot' | 'arbitrage'
  const [arbDestId, setArbDestId] = useState('');
  const [arbInstrument, setArbInstrument] = useState('metal');
  const [arbAmount, setArbAmount] = useState(10000);

  const planetRes = currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };
  const marketAccess = useMemo(
    () => checkPhysicalAccess(state, currentPlanet?.id),
    [state, currentPlanet?.id]
  );
  const tickerQuotes = useMemo(
    () => getLocalTickerQuotes(state.spotExchange || {}, currentPlanet?.id),
    [state.spotExchange, currentPlanet?.id]
  );
  const otherPlanets = useMemo(
    () => (state.planets || []).filter(p => p.id && p.id !== currentPlanet?.id),
    [state.planets, currentPlanet?.id]
  );
  const arbDest = useMemo(
    () => otherPlanets.find(p => p.id === arbDestId) || otherPlanets[0] || null,
    [otherPlanets, arbDestId]
  );
  const arbEstimate = useMemo(
    () => estimateSpotArbitrage({
      state,
      originPlanet: currentPlanet,
      destPlanet: arbDest,
      instrument: arbInstrument,
      amount: arbAmount
    }),
    [state, currentPlanet, arbDest, arbInstrument, arbAmount]
  );

  const handleDispatchArbitrage = () => {
    if (!arbEstimate.canDispatch || !arbDest || !currentPlanet?.id) {
      if (window.playSfx) window.playSfx('uiError');
      return;
    }
    dispatch({
      type: 'DISPATCH_SPOT_ARBITRAGE',
      originId: currentPlanet.id,
      destId: arbDest.id,
      instrument: arbInstrument,
      amount: Number(arbAmount)
    });
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  const handleFulfillContract = (c) => {
    if ((planetRes[c.demandRes] || 0) < c.demandAmount) {
      if (window.playSfx) window.playSfx('uiError');
      return;
    }
    dispatch({
      type: 'MARKET_TRADE',
      planetId: currentPlanet.id,
      sellResource: c.demandRes,
      buyResource: c.rewardRes,
      sellAmount: c.demandAmount,
      buyAmount: c.rewardAmount
    });
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  return (
    <div className="space-y-6 relative z-10">
      {/* Ticker Bursátil Superior — precios del libro local */}
      <div className="px-4 py-1.5 rounded-xl bg-black/60 border border-emerald-500/20 flex items-center justify-between text-[11px] font-mono overflow-x-auto whitespace-nowrap custom-scrollbar">
        <div className="flex items-center gap-6">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PARQUÉ {currentPlanet?.name || 'LOCAL'} EN VIVO
          </span>
          {(marketAccess.hasAccess ? tickerQuotes : []).map((q) => {
            const label = q.instrument === 'metal' ? 'MET' : q.instrument === 'crystal' ? 'CRIS' : 'DEUT';
            const up = (q.change24h || 0) >= 0;
            return (
              <span key={q.instrument} className="text-slate-300">
                {label}: <strong className="text-cyan-300">{q.last != null ? Number(q.last).toFixed(3) : '---'}</strong>
                {q.change24h != null && (
                  <span className={up ? 'text-emerald-400' : 'text-rose-400'}>
                    {' '}{up ? '▲' : '▼'} {Math.abs(q.change24h).toFixed(2)}%
                  </span>
                )}
              </span>
            );
          })}
          {!marketAccess.hasAccess && (
            <span className="text-rose-300">Cotización oculta sin presencia física</span>
          )}
          <span className="text-slate-400 hidden lg:inline">
            COMISIÓN SPOT: <span className="text-slate-200">{(FEE_RATE * 100).toFixed(1)}%</span>
          </span>
        </div>
        <div className="text-slate-500 text-[10px] hidden md:block">
          {currentPlanet?.name || 'Lonja'} • Libro local
        </div>
      </div>

      {/* DOM Superior Estandarizado (Recursos + Explorador + Volver al Mando Imperial) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Mercado Galáctico"
        breadcrumbIcon="💼"
        parentHub="imperial_hub"
        backButtonLabelTop="VOLVER A"
        backButtonLabelBottom="Mando Imperial"
        backButtonIcon="👑"
        onBackToAltoMando={() => {
          if (setActiveTab) setActiveTab('imperial_hub');
          else if (navigateBack) navigateBack();
        }}
        rightSlot={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs font-mono">
            <span className="text-amber-400">₢ Créditos:</span>
            <span className="font-bold text-amber-300">{fmt(state.credits || 0)}</span>
          </div>
        }
      />

      {/* Selector de Distritos Mercantiles en Card Grid Estandarizado */}
      <MarketDistrictCardGrid
        activeSubTab={activeSubTab}
        onSelectSubTab={setActiveSubTab}
        contractsCount={CORPORATE_CONTRACTS.length}
        automatedRulesCount={(state?.automatedTradeRules || []).length}
      />

      {/* Subvista: Bolsa y Conversor de Materias Primas */}
      {activeSubTab === 'exchange' && (
        <div className="space-y-6">
          {/* Selector de Modo: Parqué Spot Real vs Arbitraje Físico */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-black/60 border border-white/10">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setExchangeMode('spot');
                  if (window.playSfx) window.playSfx('click');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 ${
                  exchangeMode === 'spot'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                <span>📈</span> Terminal Spot Real (Libro de Órdenes)
              </button>
              <button
                onClick={() => {
                  setExchangeMode('arbitrage');
                  if (window.playSfx) window.playSfx('click');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 ${
                  exchangeMode === 'arbitrage'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                <span>🚚</span> Arbitraje Físico
              </button>
            </div>
            <span className="text-[11px] font-mono text-slate-400 pr-3 hidden sm:inline">
              Lonja Soberana • Precio del libro
            </span>
          </div>

          {exchangeMode === 'spot' ? (
            <GalacticSpotExchangeView
              state={state}
              dispatch={dispatch}
              currentPlanet={currentPlanet}
              fmt={fmt}
            />
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#060a16] to-cyan-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚚</span>
                  <div>
                    <div className="text-white font-bold">
                      Convoy de arbitraje: {currentPlanet?.name || 'origen'} → {arbDest?.name || 'destino'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Compra o extrae aquí, transporta con cargueros y vende en el libro del destino. Sin teletransporte.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10">
                    Origen: <strong className="text-cyan-300">{arbEstimate.originLast != null ? `${Number(arbEstimate.originLast).toFixed(3)} ₢` : '---'}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10">
                    Destino: <strong className="text-emerald-300">{arbEstimate.destLast != null ? `${Number(arbEstimate.destLast).toFixed(3)} ₢` : '---'}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10">
                    Spread: <strong className={(arbEstimate.spread || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {arbEstimate.spread != null ? `${arbEstimate.spread > 0 ? '+' : ''}${arbEstimate.spread.toFixed(3)} ₢` : '---'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Convoy físico: el lote viaja. */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#060a16]/80 border border-cyan-500/20 space-y-4">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                <span>📤</span> Carga y Destino
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {['metal', 'crystal', 'deuterium'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setArbInstrument(r)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold capitalize transition-all border text-center ${
                      arbInstrument === r
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-black/40 text-slate-400 border-white/5 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {r === 'metal' ? '⛏️ Metal' : r === 'crystal' ? '💎 Cristal' : '⚗️ Deut'}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 flex justify-between">
                  <span>Cantidad a transportar:</span>
                  <span className="text-slate-300 font-mono">Disp: {fmt(planetRes[arbInstrument] || 0)}</span>
                </label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={arbAmount}
                  onChange={(e) => setArbAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                />
                <div className="flex gap-2">
                  {[0.25, 0.5, 0.75, 1].map((p) => (
                    <button
                      key={p}
                      onClick={() => setArbAmount(Math.floor((planetRes[arbInstrument] || 0) * p))}
                      className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-mono rounded text-slate-300 border border-white/5"
                    >
                      {p * 100}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Mundo destino</label>
                <select
                  value={arbDest?.id || ''}
                  onChange={(e) => setArbDestId(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono"
                >
                  {otherPlanets.length === 0 && <option value="">Sin otra colonia</option>}
                  {otherPlanets.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#060a16]/80 border border-emerald-500/20 space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                <span>📥</span> Coste Logístico
              </h3>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Distancia:</span>
                  <span className="font-mono text-cyan-300 font-bold">{fmt(Math.round(arbEstimate.dist || 0))}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tiempo de vuelo:</span>
                  <span className="font-mono text-amber-300 font-bold">{Math.max(1, Math.round((arbEstimate.flightTime || 0) / 60))} min</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Combustible:</span>
                  <span className="font-mono text-rose-400 font-bold">{fmt(arbEstimate.fuel || 0)} ⚗️</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Capacidad convoy:</span>
                  <span className="font-mono text-emerald-300 font-bold">{fmt(arbEstimate.capacity || 0)}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0a1622] to-[#040810] border border-emerald-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Autorización de Convoy
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  El lote sale del inventario local, vuela con cargueros y llega al almacén destino. Luego se vende en ese libro.
                </p>
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
                  {arbEstimate.canDispatch
                    ? '✓ Convoy listo. Combustible, bodega y acceso verificados.'
                    : `🚫 ${arbEstimate.reason || 'No despachable.'}`}
                </div>
              </div>
              <button
                onClick={handleDispatchArbitrage}
                disabled={!arbEstimate.canDispatch}
                className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
                  arbEstimate.canDispatch
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110 active:scale-[0.98]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                Despachar Convoy
              </button>
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {/* Subvista: Astillero de Ocasión */}
      {activeSubTab === 'used_ships' && (
        <UsedShipBazaarView
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          fmt={fmt}
        />
      )}

      {/* Subvista: Contratos Corporativos */}
      {activeSubTab === 'contracts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CORPORATE_CONTRACTS.map((c) => {
            const hasEnough = (planetRes[c.demandRes] || 0) >= c.demandAmount;
            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-[#080d1e]/80 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      {c.client}
                    </span>
                    <span className="text-xs text-amber-300 font-mono font-bold">
                      {c.bonusCredits}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {c.description}
                  </p>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-rose-300">
                      <span>Demanda:</span>
                      <span>{fmt(c.demandAmount)} {c.demandRes}</span>
                    </div>
                    <div className="flex justify-between text-emerald-300 font-bold">
                      <span>Pago:</span>
                      <span>+{fmt(c.rewardAmount)} {c.rewardRes}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleFulfillContract(c)}
                  disabled={!hasEnough}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    hasEnough
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {hasEnough ? 'Entregar Suministros' : 'Recursos Insuficientes'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Subvista: Mercado Negro */}
      {activeSubTab === 'black_market' && (
        <BlackMarketView
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          fmt={fmt}
        />
      )}

      {/* Subvista: Consola Algorítmica y Fletes */}
      {activeSubTab === 'automated_rules' && (
        <AutomatedTradeRulesView
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          fmt={fmt}
        />
      )}

      {/* Subvista: Rutas Comerciales Bilaterales */}
      {activeSubTab === 'bilateral_routes' && (
        <MarketRoutesView
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          fmt={fmt}
        />
      )}
    </div>
  );
};
