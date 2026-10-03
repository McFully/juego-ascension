import React, { useState } from 'react';
import { USED_SHIPS_CATALOG, ALIEN_EXOTIC_SHIPS, MARKET_BLUEPRINTS } from '../../data/galacticMarketData.js';
import { SHIPS } from '../../data/game/shipsData.js';
import { CardBanner } from '../../assets.jsx';
import { BazaarFleetSellDock } from './BazaarFleetSellDock.jsx';

export const UsedShipBazaarView = ({
  state,
  dispatch,
  currentPlanet,
  fmt
}) => {
  // 'buy' (Ocasión) | 'sell' (Vender mi flota) | 'exotics' (Alienígenas y Chatarra) | 'blueprints' (Holo-Net Diseños)
  const [activeTab, setActiveTab] = useState('buy');
  const [scrapSelection, setScrapSelection] = useState({});
  const [sellSelection, setSellSelection] = useState({});

  const planetRes = currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };
  const planetFleet = currentPlanet?.fleet || {};
  const currentCredits = state?.credits || 0;
  const tradeLvl = state?.research?.galacticTrade || 0;

  // Compra de lotes estándar
  const handleBuyLot = (lot) => {
    if (!currentPlanet) return;
    const canAfford =
      (planetRes.metal || 0) >= (lot.cost.metal || 0) &&
      (planetRes.crystal || 0) >= (lot.cost.crystal || 0) &&
      (planetRes.deuterium || 0) >= (lot.cost.deuterium || 0);

    if (!canAfford) {
      if (window.playSfx) window.playSfx('uiError');
      return;
    }

    dispatch({
      type: 'MARKET_BUY_USED_SHIPS',
      planetId: currentPlanet.id,
      lot,
      cost: lot.cost
    });
    if (window.playSfx) window.playSfx('fleetLaunch');
  };

  // Compra de naves exóticas / alienígenas
  const handleBuyExotic = (exotic) => {
    if (!currentPlanet) return;
    const canAffordRes =
      (planetRes.metal || 0) >= (exotic.cost.metal || 0) &&
      (planetRes.crystal || 0) >= (exotic.cost.crystal || 0) &&
      (planetRes.deuterium || 0) >= (exotic.cost.deuterium || 0);
    const canAffordCreds = currentCredits >= (exotic.creditsPrice || 0);

    if (!canAffordRes || !canAffordCreds) {
      if (window.playSfx) window.playSfx('uiError');
      return;
    }

    // Deducción de recursos + asignación de naves
    dispatch({
      type: 'MARKET_BUY_USED_SHIPS',
      planetId: currentPlanet.id,
      lot: {
        shipId: exotic.shipId,
        title: exotic.title,
        quantity: exotic.quantity
      },
      cost: exotic.cost
    });

    if (exotic.creditsPrice > 0) {
      dispatch({
        type: 'MARKET_TRADE',
        planetId: currentPlanet.id,
        sellResource: 'credits',
        buyResource: 'credits',
        sellAmount: exotic.creditsPrice,
        buyAmount: 0
      });
    }

    if (window.playSfx) window.playSfx('fleetLaunch');
  };

  // Venta de naves propias por créditos
  const handleExecuteSell = () => {
    const entries = Object.entries(sellSelection).filter(([_, qty]) => qty > 0);
    if (entries.length === 0) return;

    entries.forEach(([shipId, qty]) => {
      const shipDef = SHIPS[shipId];
      if (shipDef && qty > 0) {
        // Precio de cotización: Coste base mineral transformado a créditos con bonus de comercio
        const baseCostSum = (shipDef.cost?.m || 0) + (shipDef.cost?.c || 0) + (shipDef.cost?.d || 0) * 2;
        const pricePerUnit = Math.floor(baseCostSum * (0.60 + tradeLvl * 0.05));

        dispatch({
          type: 'MARKET_SELL_SHIPS',
          planetId: currentPlanet.id,
          shipId,
          quantity: qty,
          pricePerUnit
        });
      }
    });

    setSellSelection({});
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  // Compra de planos navales
  const handleBuyBlueprint = (bp) => {
    if (currentCredits < bp.creditsPrice) {
      if (window.playSfx) window.playSfx('uiError');
      return;
    }
    dispatch({
      type: 'MARKET_BUY_BLUEPRINT',
      blueprint: bp,
      costCredits: bp.creditsPrice
    });
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner Principal con Arte de la Lonja */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#060a17] p-5 shadow-[0_0_35px_rgba(6,182,212,0.15)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 inline-block mb-2">
              SECTOR 7 • PUERTO FRANCO ESTELAR
            </span>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>⚓</span>
              <span>Lonja Naval Galáctica y Astillero de Ocasión</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Punto de encuentro de contrabandistas, astilleros de Kuat y desguaces planetarios. Compra lotes de naves usadas, vende tu flota por Créditos, rescata cascos alienígenas o patenta diseños.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/60 border border-white/10 px-4 py-3 rounded-xl">
            <span className="text-xl">💳</span>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Tesoro Disponible</span>
              <span className="text-base font-black text-amber-300 font-mono">
                {fmt(currentCredits)} ₢
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas de la Lonja */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('buy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'buy'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white bg-black/40 border border-white/5'
          }`}
        >
          <span>🛒</span>
          <span>Bazar de Ocasión</span>
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sell'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'text-slate-400 hover:text-white bg-black/40 border border-white/5'
          }`}
        >
          <span>🤝</span>
          <span>Muelle de Venta de Flota</span>
        </button>
        <button
          onClick={() => setActiveTab('exotics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'exotics'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              : 'text-slate-400 hover:text-white bg-black/40 border border-white/5'
          }`}
        >
          <span>🛸</span>
          <span>Naves Alienígenas y Chatarra</span>
        </button>
        <button
          onClick={() => setActiveTab('blueprints')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'blueprints'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              : 'text-slate-400 hover:text-white bg-black/40 border border-white/5'
          }`}
        >
          <span>📜</span>
          <span>Holo-Net: Patentes y Diseños</span>
        </button>
      </div>

      {/* 1. Bazar de Ocasión */}
      {activeTab === 'buy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {USED_SHIPS_CATALOG.map((lot) => {
            const canAfford =
              (planetRes.metal || 0) >= (lot.cost.metal || 0) &&
              (planetRes.crystal || 0) >= (lot.cost.crystal || 0) &&
              (planetRes.deuterium || 0) >= (lot.cost.deuterium || 0);

            return (
              <div
                key={lot.id}
                className="p-5 rounded-2xl bg-[#080d1e]/85 border border-cyan-500/30 hover:border-cyan-400 transition-all flex flex-col justify-between space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-xl shadow-inner">
                        {lot.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {lot.title}
                        </h3>
                        <div className="text-[10px] font-mono text-cyan-400">
                          {lot.seller}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      -{lot.discountPercent}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lot.description}
                  </p>

                  <div className="text-[11px] font-mono text-slate-400 bg-black/40 p-2.5 rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between">
                      <span>Lote Naval:</span>
                      <span className="text-white font-bold">x{lot.quantity} naves</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estado:</span>
                      <span className="text-amber-300 font-bold">{lot.conditionPercent}% ({lot.condition})</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Precio Final:</span>
                    <span className="text-cyan-300 font-bold">
                      {fmt(lot.cost.metal)}M / {fmt(lot.cost.crystal)}C / {fmt(lot.cost.deuterium)}D
                    </span>
                  </div>
                  <button
                    onClick={() => handleBuyLot(lot)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95'
                        : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Adquirir Lote' : 'Recursos Insuficientes'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Muelle de Venta de Flota (Modularizado) */}
      {activeTab === 'sell' && (
        <BazaarFleetSellDock
          currentPlanet={currentPlanet}
          tradeLvl={tradeLvl}
          planetFleet={planetFleet}
          sellSelection={sellSelection}
          setSellSelection={setSellSelection}
          onExecuteSell={handleExecuteSell}
          fmt={fmt}
        />
      )}

      {/* 3. Naves Alienígenas y Chatarra */}
      {activeTab === 'exotics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALIEN_EXOTIC_SHIPS.map((exotic) => {
            const canAffordRes =
              (planetRes.metal || 0) >= (exotic.cost.metal || 0) &&
              (planetRes.crystal || 0) >= (exotic.cost.crystal || 0) &&
              (planetRes.deuterium || 0) >= (exotic.cost.deuterium || 0);
            const canAffordCreds = currentCredits >= (exotic.creditsPrice || 0);
            const canAfford = canAffordRes && canAffordCreds;

            return (
              <div
                key={exotic.id}
                className="p-5 rounded-2xl bg-gradient-to-b from-[#130d24] to-[#0a0715] border border-purple-500/40 hover:border-purple-400 transition-all flex flex-col justify-between space-y-4 shadow-[0_4px_25px_rgba(168,85,247,0.2)]"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-xl shadow-inner">
                        {exotic.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-snug">{exotic.title}</h3>
                        <div className="text-[10px] font-mono text-purple-300">{exotic.seller}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      {exotic.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{exotic.description}</p>

                  <div className="text-[11px] font-mono text-slate-400 bg-black/50 p-2.5 rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between">
                      <span>Facción:</span>
                      <span className="text-purple-300 font-bold">{exotic.faction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Especificación:</span>
                      <span className="text-slate-300">{exotic.condition}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-3">
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recursos:</span>
                      <span className="text-purple-300 font-bold">
                        {fmt(exotic.cost.metal)}M / {fmt(exotic.cost.crystal)}C / {fmt(exotic.cost.deuterium)}D
                      </span>
                    </div>
                    {exotic.creditsPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tasa en Créditos:</span>
                        <span className="text-amber-300 font-bold">+{fmt(exotic.creditsPrice)} ₢</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleBuyExotic(exotic)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:brightness-110 active:scale-95'
                        : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Reclamar Nave Exótica' : 'Fondos Insuficientes'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Holo-Net Patentes y Diseños */}
      {activeTab === 'blueprints' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MARKET_BLUEPRINTS.map((bp) => {
            const alreadyOwned = (state?.blueprints || []).some(b => b.name === bp.name);
            const canAfford = currentCredits >= bp.creditsPrice;

            return (
              <div
                key={bp.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 hover:border-indigo-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 block mb-0.5">{bp.creator}</span>
                      <h4 className="text-base font-bold text-white">{bp.name}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                      CHASIS: {bp.chassis}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{bp.description}</p>

                  <div className="text-xs bg-black/40 p-3 rounded-xl border border-white/5 space-y-1 font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Armamento:</span>
                      <span className="text-white">{bp.weapon || 'Estándar'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Propulsión:</span>
                      <span className="text-white">{bp.engine || 'Estándar'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Módulos integrados:</span>
                      <span className="text-indigo-300">{(bp.modules || []).join(', ') || 'Ninguno'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="text-xs font-mono">
                    <span className="text-slate-400">Patente: </span>
                    <span className="text-amber-300 font-bold">{fmt(bp.creditsPrice)} ₢</span>
                  </div>

                  <button
                    onClick={() => handleBuyBlueprint(bp)}
                    disabled={alreadyOwned || !canAfford}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      alreadyOwned
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : canAfford
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-95'
                        : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    {alreadyOwned ? 'Patente Adquirida' : canAfford ? 'Comprar Esquema' : 'Créditos Insuficientes'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
