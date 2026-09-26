import React from 'react';
import { BLACK_MARKET_CATALOG } from '../../data/galacticMarketData.js';

export const BlackMarketView = ({
  state,
  dispatch,
  currentPlanet,
  fmt
}) => {
  const planetRes = currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };

  const handleBuyBlackMarketItem = (item) => {
    if (!currentPlanet) return;
    const canAfford =
      (planetRes.metal || 0) >= (item.cost.metal || 0) &&
      (planetRes.crystal || 0) >= (item.cost.crystal || 0) &&
      (planetRes.deuterium || 0) >= (item.cost.deuterium || 0);

    if (!canAfford) {
      if (window.playSfx) window.playSfx('uiError');
      return;
    }

    dispatch({
      type: 'MARKET_BUY_BLACK_MARKET',
      planetId: currentPlanet.id,
      item,
      cost: item.cost
    });
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Alerta de Clandestinidad */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/50 via-[#18080f]/80 to-[#0c0407] border border-red-500/40 shadow-[0_0_35px_rgba(239,68,68,0.2)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕶️</span>
            <h2 className="text-base font-bold text-red-300 uppercase tracking-wider font-mono">
              Red Clandestina de Contrabando y Mercado Negro
            </h2>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
              ESPACIO NO REGULADO
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Consorcios criminales, desertores de la guardia imperial y contrabandistas nómadas ofrecen tecnología restringida, supercargamentos de deuterio criogénico e inteligencia militar fuera de los canales aduaneros oficiales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-red-400 bg-black/60 border border-red-500/30 px-3 py-1.5 rounded-xl">
            Cifrado Cuántico Activo
          </span>
        </div>
      </div>

      {/* Grid de Artículos del Mercado Negro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BLACK_MARKET_CATALOG.map((item) => {
          const canAfford =
            (planetRes.metal || 0) >= (item.cost.metal || 0) &&
            (planetRes.crystal || 0) >= (item.cost.crystal || 0) &&
            (planetRes.deuterium || 0) >= (item.cost.deuterium || 0);

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#0b0609]/90 border border-red-500/25 hover:border-red-500/60 transition-all flex flex-col justify-between space-y-4 shadow-[0_4px_25px_rgba(0,0,0,0.6)]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-2xl shadow-inner">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        {item.title}
                      </h3>
                      <span className="text-[10px] font-mono text-red-400 uppercase">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                <div className="p-3 rounded-xl bg-black/50 border border-red-500/20 text-xs font-mono space-y-1">
                  <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <span>⚡ Efecto Inmediato:</span>
                    <span>{item.benefitText}</span>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 text-[11px]">
                    {item.cost.metal > 0 && <span className="text-cyan-300 font-bold">⛏️ {fmt(item.cost.metal)} Met</span>}
                    {item.cost.crystal > 0 && <span className="text-emerald-300 font-bold">💎 {fmt(item.cost.crystal)} Cris</span>}
                    {item.cost.deuterium > 0 && <span className="text-amber-300 font-bold">⚗️ {fmt(item.cost.deuterium)} Deut</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleBuyBlackMarketItem(item)}
                disabled={!canAfford}
                className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  canAfford
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:brightness-110 active:scale-[0.98]'
                    : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                }`}
              >
                {canAfford ? 'Sellar Trato de Contrabando' : 'Fondos Insuficientes'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
