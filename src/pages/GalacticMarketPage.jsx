import React, { useState, useMemo } from 'react';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { MarketPriceChart } from '../components/market/MarketPriceChart.jsx';
import { UsedShipBazaarView } from '../components/market/UsedShipBazaarView.jsx';
import { BlackMarketView } from '../components/market/BlackMarketView.jsx';
import { AutomatedTradeRulesView } from '../components/market/AutomatedTradeRulesView.jsx';
import { MarketDistrictCardGrid } from '../components/market/MarketDistrictCardGrid.jsx';
import { MarketRoutesView } from '../components/market/MarketRoutesView.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';
import { CORPORATE_CONTRACTS, MARKET_BASE_VALUES, getPlanetMarketModifiers } from '../data/galacticMarketData.js';
import { getPlanetHeritage } from '../data/planetaryHeritageData.js';

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
  const [sellRes, setSellRes] = useState('metal');
  const [buyRes, setBuyRes] = useState('crystal');
  const [sellAmount, setSellAmount] = useState(10000);

  const planetRes = currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };

  // Cálculo de ratio y comisión con cotización local de este planeta
  const localMods = useMemo(() => {
    const baseMods = getPlanetMarketModifiers(currentPlanet);
    const heritage = getPlanetHeritage(currentPlanet);
    if (heritage?.marketModifiers) {
      Object.entries(heritage.marketModifiers).forEach(([k, v]) => {
        if (baseMods[k]) baseMods[k] *= v;
      });
    }
    return baseMods;
  }, [currentPlanet]);

  const tradeCalculation = useMemo(() => {
    if (sellRes === buyRes) return { buyAmount: 0, fee: 0, rate: 1 };
    const sellUnitVal = (MARKET_BASE_VALUES[sellRes] || 1) * (localMods[sellRes] || 1);
    const buyUnitVal = (MARKET_BASE_VALUES[buyRes] || 1) * (localMods[buyRes] || 1);
    const tradeLvl = state.research?.galacticTrade || 0;
    const feeRate = Math.max(0.01, 0.08 - tradeLvl * 0.01); // 8% base, reducible hasta 1%
    const grossBuy = (sellAmount * sellUnitVal) / buyUnitVal;
    const netBuy = Math.floor(grossBuy * (1 - feeRate));
    const fee = Math.floor(grossBuy * feeRate);
    const rate = ((sellUnitVal / buyUnitVal) * (1 - feeRate)).toFixed(3);
    return { buyAmount: Math.max(0, netBuy), fee, rate, feePct: Math.round(feeRate * 100) };
  }, [sellRes, buyRes, sellAmount, state.research?.galacticTrade, localMods]);

  const availableSell = sellRes === 'credits' ? (state.credits || 0) : (planetRes[sellRes] || 0);

  const handleExecuteTrade = () => {
    if (tradeCalculation.buyAmount <= 0) return;
    if (availableSell < sellAmount) {
      if (window.playSfx) window.playSfx('uiError');
      return;
    }
    dispatch({
      type: 'MARKET_TRADE',
      planetId: currentPlanet.id,
      sellResource: sellRes,
      buyResource: buyRes,
      sellAmount: Number(sellAmount),
      buyAmount: tradeCalculation.buyAmount
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
      {/* Ticker Bursátil Superior */}
      <div className="px-4 py-1.5 rounded-xl bg-black/60 border border-emerald-500/20 flex items-center justify-between text-[11px] font-mono overflow-x-auto whitespace-nowrap custom-scrollbar">
        <div className="flex items-center gap-6">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PARQUÉ FINANCIERO GALÁCTICO EN VIVO
          </span>
          <span className="text-slate-300">
            MET/CRIS: <strong className="text-cyan-300">0.606</strong> <span className="text-emerald-400">▲ +1.2%</span>
          </span>
          <span className="text-slate-300">
            DEUT/MET: <strong className="text-amber-300">3.300</strong> <span className="text-emerald-400">▲ +2.8%</span>
          </span>
          <span className="text-slate-300">
            CRIS/DEUT: <strong className="text-cyan-300">0.500</strong> <span className="text-rose-400">▼ -0.4%</span>
          </span>
          <span className="text-slate-400 hidden lg:inline">
            ARANCEL OFICIAL: <span className="text-slate-200">8.0%</span>
          </span>
        </div>
        <div className="text-slate-500 text-[10px] hidden md:block">
          Sindicato Libre de Comercio • Sector 1
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
          if (navigateBack) navigateBack();
          else if (setActiveTab) setActiveTab('imperial_hub');
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
          {/* Indicador de Parqué Local y Arbitraje */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#060a16] to-cyan-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪐</span>
              <div>
                <div className="text-white font-bold flex items-center gap-2">
                  <span>Parqué Local de {currentPlanet?.name || 'este mundo'}</span>
                  {(() => {
                    const h = getPlanetHeritage(currentPlanet);
                    if (!h) return null;
                    return (
                      <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                        {h.icon} {h.name}
                      </span>
                    );
                  })()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Los biomas y peculiaridades geológicas alteran la cotización spot en esta lonja:
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10">
                <span className="text-amber-400">⛏️ Metal:</span>
                <strong className={localMods.metal < 1 ? 'text-emerald-400' : (localMods.metal > 1 ? 'text-rose-400' : 'text-slate-200')}>
                  x{localMods.metal?.toFixed(2) || '1.00'}
                </strong>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10">
                <span className="text-cyan-400">💎 Cristal:</span>
                <strong className={localMods.crystal < 1 ? 'text-emerald-400' : (localMods.crystal > 1 ? 'text-rose-400' : 'text-slate-200')}>
                  x{localMods.crystal?.toFixed(2) || '1.00'}
                </strong>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10">
                <span className="text-blue-400">⚗️ Deuterio:</span>
                <strong className={localMods.deuterium < 1 ? 'text-emerald-400' : (localMods.deuterium > 1 ? 'text-rose-400' : 'text-slate-200')}>
                  x{localMods.deuterium?.toFixed(2) || '1.00'}
                </strong>
              </span>
            </div>
          </div>

          <MarketPriceChart />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel de Venta */}
            <div className="p-5 rounded-2xl bg-[#060a16]/80 border border-cyan-500/20 space-y-4">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                <span>📤</span> Recurso a Entregar
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {['metal', 'crystal', 'deuterium', 'credits'].map((r) => (
                  <button
                    key={r}
                    disabled={sellRes === r}
                    onClick={() => setSellRes(r)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold capitalize transition-all border text-center ${
                      sellRes === r
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-black/40 text-slate-400 border-white/5 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {r === 'metal' ? '⛏️ Metal' : r === 'crystal' ? '💎 Cristal' : r === 'deuterium' ? '⚗️ Deut' : '₢ Créditos'}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 flex justify-between">
                  <span>Cantidad a vender:</span>
                  <span className="text-slate-300 font-mono">Disp: {fmt(planetRes[sellRes] || 0)}</span>
                </label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                />
                <div className="flex gap-2">
                  {[0.25, 0.5, 0.75, 1].map((p) => (
                    <button
                      key={p}
                      onClick={() => setSellAmount(Math.floor((planetRes[sellRes] || 0) * p))}
                      className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-mono rounded text-slate-300 border border-white/5"
                    >
                      {p * 100}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel de Compra */}
            <div className="p-5 rounded-2xl bg-[#060a16]/80 border border-emerald-500/20 space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                <span>📥</span> Recurso a Recibir
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {['metal', 'crystal', 'deuterium', 'credits'].map((r) => (
                  <button
                    key={r}
                    disabled={buyRes === r}
                    onClick={() => setBuyRes(r)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold capitalize transition-all border text-center ${
                      buyRes === r
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-black/40 text-slate-400 border-white/5 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {r === 'metal' ? '⛏️ Metal' : r === 'crystal' ? '💎 Cristal' : r === 'deuterium' ? '⚗️ Deut' : '₢ Créditos'}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Ratio de cotización:</span>
                  <span className="font-mono text-emerald-300 font-bold">1 : {tradeCalculation.rate}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Arancel del sindicato ({tradeCalculation.feePct || 8}%):</span>
                  <span className="font-mono text-rose-400 font-bold">-{fmt(tradeCalculation.fee)} {buyRes}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-white font-bold">
                  <span>Total neto a recibir:</span>
                  <span className="text-emerald-400 font-mono text-sm">+{fmt(tradeCalculation.buyAmount)}</span>
                </div>
              </div>
            </div>

            {/* Consola de Confirmación */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0a1622] to-[#040810] border border-emerald-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Autorización de Liquidación
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Intercambio directo y seguro avalado por la Cámara de Compensación Galáctica.
                </p>
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
                  ✓ Garantía de entrega instantánea por el Sindicato Mercante sin riesgo de interceptación.
                </div>
              </div>

              <button
                onClick={handleExecuteTrade}
                disabled={sellRes === buyRes || availableSell < sellAmount || sellAmount <= 0}
                className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
                  sellRes !== buyRes && availableSell >= sellAmount && sellAmount > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110 active:scale-[0.98]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                Confirmar Transacción
              </button>
            </div>
          </div>
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
