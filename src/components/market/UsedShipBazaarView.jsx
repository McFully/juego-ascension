import React, { useState } from 'react';
import { USED_SHIPS_CATALOG } from '../../data/galacticMarketData.js';
import { SHIPS } from '../../data/game/shipsData.js';

export const UsedShipBazaarView = ({
  state,
  dispatch,
  currentPlanet,
  fmt
}) => {
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' | 'scrap'
  const [scrapSelection, setScrapSelection] = useState({});

  const planetRes = currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };
  const planetFleet = currentPlanet?.fleet || {};

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

  const handleExecuteScrap = () => {
    const totalToScrap = Object.values(scrapSelection).reduce((a, b) => a + b, 0);
    if (totalToScrap <= 0) return;

    let returnM = 0;
    let returnC = 0;
    let returnD = 0;

    Object.entries(scrapSelection).forEach(([shipId, qty]) => {
      const shipDef = SHIPS[shipId];
      if (shipDef && qty > 0) {
        // Recuperación de desguace del 75% del coste original
        returnM += Math.floor((shipDef.cost?.m || 0) * 0.75 * qty);
        returnC += Math.floor((shipDef.cost?.c || 0) * 0.75 * qty);
        returnD += Math.floor((shipDef.cost?.d || 0) * 0.75 * qty);
        dispatch({
          type: 'MARKET_SCRAP_SHIPS',
          planetId: currentPlanet.id,
          shipId,
          quantity: qty,
          returnResources: { metal: returnM, crystal: returnC, deuterium: returnD }
        });
      }
    });

    setScrapSelection({});
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Selector interno de bazar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>🚀</span>
            <span>Astillero de Ocasión y Concesionario de Naves</span>
          </h2>
          <p className="text-xs text-slate-400">
            Adquiere lotes navales desmovilizados con descuento inmediato o desguaza tus excedentes para recuperar minerales.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('buy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'buy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white bg-black/40 border border-white/5'
            }`}
          >
            🛒 Comprar Naves Usadas
          </button>
          <button
            onClick={() => setActiveTab('scrap')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'scrap'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-white bg-black/40 border border-white/5'
            }`}
          >
            ♻️ Planta de Desguace
          </button>
        </div>
      </div>

      {/* Vista de Compra de Naves Usadas */}
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      -{lot.discountPercent}% DTO
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lot.description}
                  </p>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Unidades en lote:</span>
                      <span className="text-white font-bold">{lot.quantity} naves</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Estado del casco:</span>
                      <span className="text-emerald-400 font-bold">{lot.condition}</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2 text-[11px]">
                      {lot.cost.metal > 0 && <span className="text-cyan-300 font-bold">⛏️ {fmt(lot.cost.metal)} Met</span>}
                      {lot.cost.crystal > 0 && <span className="text-emerald-300 font-bold">💎 {fmt(lot.cost.crystal)} Cris</span>}
                      {lot.cost.deuterium > 0 && <span className="text-amber-300 font-bold">⚗️ {fmt(lot.cost.deuterium)} Deut</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyLot(lot)}
                  disabled={!canAfford}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    canAfford
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.98]'
                      : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Adquirir e Incorporar al Hangar' : 'Recursos Insuficientes'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Vista de Planta de Desguace */}
      {activeTab === 'scrap' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0a0d18] border border-amber-500/30 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
                Hornos de Fundición y Reciclaje de Escuadrones
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona cuántas naves de tu hangar actual deseas desmantelar para recuperar el 75% de sus aleaciones metálicas y cristal.
              </p>
            </div>
            <button
              onClick={handleExecuteScrap}
              disabled={Object.values(scrapSelection).reduce((a, b) => a + b, 0) <= 0}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-black font-mono shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Confirmar Desguace
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(planetFleet).filter(([_, qty]) => qty > 0).map(([sId, qty]) => {
              const shipDef = SHIPS[sId] || { name: sId, icon: '🛸', cost: { m: 1000, c: 500, d: 0 } };
              const currentVal = scrapSelection[sId] || 0;

              return (
                <div key={sId} className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{shipDef.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{shipDef.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Disponibles: {qty}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max={qty}
                      value={currentVal}
                      onChange={(e) => setScrapSelection({
                        ...scrapSelection,
                        [sId]: Math.min(qty, Math.max(0, Number(e.target.value)))
                      })}
                      className="w-14 bg-black border border-white/20 rounded-lg px-2 py-1 text-right text-xs font-mono text-amber-300"
                    />
                    <button
                      onClick={() => setScrapSelection({ ...scrapSelection, [sId]: qty })}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[10px] rounded text-slate-300 border border-white/10"
                    >
                      Max
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
