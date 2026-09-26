import React from 'react';
import { S } from '../../styles.js';
import { SHIPS } from '../../core.jsx';

export const BuyAIShipsModal = ({
  buyAIPlanet,
  setBuyAIPlanet,
  buyShipId,
  setBuyShipId,
  buyQty,
  setBuyQty,
  handleBuyShip
}) => {
  if (!buyAIPlanet) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono animate-in fade-in duration-200" onClick={() => setBuyAIPlanet(null)}>
      <div className="glass-deep rounded-2xl p-6 max-w-md w-full border border-purple-500/40 bg-[#080918]/95 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚀</span>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Astillero Mercante de {buyAIPlanet.name}
              </h3>
              <span className="text-[10px] text-purple-400">Adquisición directa de naves de combate</span>
            </div>
          </div>
          <button
            onClick={() => setBuyAIPlanet(null)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4 bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/20">
          💡 Las naves adquiridas se transfieren de inmediato a tu hangar orbital con un +30% de recargo galáctico.
        </p>

        <div className="space-y-4 mb-5 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">Modelo de Nave Requerido</label>
            <select className={S.input + " text-xs"} value={buyShipId} onChange={e => setBuyShipId(e.target.value)}>
              {Object.entries(SHIPS).filter(([, s]) => s.cat === 'military').map(([id, s]) => (
                <option key={id} value={id}>{s.icon} {s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">Cantidad de Unidades</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 5, 10, 20].map(q => (
                <button key={q} onClick={() => setBuyQty(q)}
                  className={`py-2 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                    buyQty === q 
                      ? 'bg-purple-600/30 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]' 
                      : 'bg-black/30 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}>
                  {q} {q === 1 ? 'Nave' : 'Naves'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleBuyShip} 
          className={`w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] cursor-pointer`}
        >
          🚀 Confirmar Adquisición de Flotilla
        </button>
      </div>
    </div>
  );
};

export default BuyAIShipsModal;
