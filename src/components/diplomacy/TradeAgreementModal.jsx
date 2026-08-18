import React from 'react';
import { S } from '../../styles.js';

export const TradeAgreementModal = ({
  tradeAIPlanet,
  setTradeAIPlanet,
  tradeGive,
  setTradeGive,
  tradeTake,
  setTradeTake,
  tradeTreaty,
  setTradeTreaty,
  viabilityMsg,
  handleCheckViability,
  handleTrade
}) => {
  if (!tradeAIPlanet) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 font-mono" onClick={() => setTradeAIPlanet(null)}>
      <div className="glass-deep rounded-2xl p-6 max-w-lg w-full border border-cyan-500/30 bg-[#070b14]/95 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold text-white mb-4 uppercase tracking-wider border-b border-white/10 pb-2">
          🤝 Mesa de Negociación Bilateral: {tradeAIPlanet.name}
        </h3>

        <div className="space-y-4 mb-5 text-xs">
          <div className="bg-white/[0.01] p-3 rounded-lg border border-white/5">
            <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-2">Tú ofreces al Imperio:</label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className="text-[9px] text-slate-500 block mb-1">Metal</span>
                <input type="number" min="0" placeholder="Metal" value={tradeGive.metal || ''} onChange={e => setTradeGive({ ...tradeGive, metal: Math.max(0, parseInt(e.target.value) || 0) })} className={S.input + " text-xs"} />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block mb-1">Cristal</span>
                <input type="number" min="0" placeholder="Cristal" value={tradeGive.crystal || ''} onChange={e => setTradeGive({ ...tradeGive, crystal: Math.max(0, parseInt(e.target.value) || 0) })} className={S.input + " text-xs"} />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block mb-1">Deuterio</span>
                <input type="number" min="0" placeholder="Deuterio" value={tradeGive.deuterium || ''} onChange={e => setTradeGive({ ...tradeGive, deuterium: Math.max(0, parseInt(e.target.value) || 0) })} className={S.input + " text-xs"} />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block mb-1">Influencia</span>
                <input type="number" min="0" placeholder="Inf" value={tradeGive.influence || ''} onChange={e => setTradeGive({ ...tradeGive, influence: Math.max(0, parseInt(e.target.value) || 0) })} className={S.input + " text-xs text-amber-300 border-amber-500/20"} />
              </div>
            </div>
          </div>

          <div className="bg-white/[0.01] p-3 rounded-lg border border-white/5">
            <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-2">Tú demandas del Imperio:</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <span className="text-[9px] text-slate-500 block mb-1">Metal</span>
                <input type="number" min="0" placeholder="Metal" value={tradeTake.metal || ''} onChange={e => setTradeTake({ ...tradeTake, metal: Math.max(0, parseInt(e.target.value) || 0) })} className={S.input + " text-xs"} />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block mb-1">Cristal</span>
                <input type="number" min="0" placeholder="Cristal" value={tradeTake.crystal || ''} onChange={e => setTradeTake({ ...tradeTake, crystal: Math.max(0, parseInt(e.target.value) || 0) })} className={S.input + " text-xs"} />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block mb-1">Deuterio</span>
                <input type="number" min="0" placeholder="Deuterio" value={tradeTake.deuterium || ''} onChange={e => setTradeTake({ ...tradeTake, deuterium: Math.max(0, parseInt(e.target.value) || 0) })} className={S.input + " text-xs"} />
              </div>
            </div>

            <div>
              <span className="text-[9px] text-slate-400 block mb-1 uppercase font-bold">Proponer Tratado Diplomático</span>
              <select 
                className={S.input + " text-xs"} 
                value={tradeTreaty} 
                onChange={e => setTradeTreaty(e.target.value)}
              >
                <option value="none">Ninguno (Sólo Intercambio de Recursos)</option>
                <option value="trade_treaty">🤝 Tratado de Comercio Libre (Req. Valor: 1000)</option>
                <option value="non_aggression">📜 Pacto de No Agresión (Req. Valor: 600)</option>
                <option value="defensive_pact">🛡️ Alianza Defensiva (Req. Valor: 2500)</option>
              </select>
            </div>
          </div>
        </div>

        {viabilityMsg && (
          <div className={`p-3 rounded-lg border text-xs mb-4 ${
            viabilityMsg.status === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {viabilityMsg.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleCheckViability} 
            className="w-full py-2.5 rounded-lg border border-slate-600 hover:border-cyan-500/50 bg-[#0f1422] text-xs font-bold text-slate-200 hover:text-cyan-400 transition-all cursor-pointer text-center uppercase tracking-wider"
          >
            📊 Evaluar Trato
          </button>
          <button 
            onClick={handleTrade} 
            className={`w-full ${S.btn} ${S.btnPrimary} text-xs uppercase tracking-wider`}
          >
            🚀 Confirmar Propuesta
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeAgreementModal;
