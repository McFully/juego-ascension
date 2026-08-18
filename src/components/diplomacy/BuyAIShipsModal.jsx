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
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setBuyAIPlanet(null)}>
      <div className="glass-deep rounded-2xl p-6 max-w-md w-full border border-white/10" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-3">🚀 Adquirir Naves de {buyAIPlanet.name}</h3>
        <p className="text-xs text-[var(--ue-text-dim)] mb-4">Adquiere naves militares. Precio +30% de recargo galáctico.</p>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs text-[var(--ue-text-dim)] block mb-1">Nave</label>
            <select className={S.input} value={buyShipId} onChange={e => setBuyShipId(e.target.value)}>
              {Object.entries(SHIPS).filter(([, s]) => s.cat === 'military').map(([id, s]) => (
                <option key={id} value={id}>{s.icon} {s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--ue-text-dim)] block mb-1">Cantidad</label>
            <div className="flex gap-2">
              {[1, 5, 10, 20].map(q => (
                <button key={q} onClick={() => setBuyQty(q)}
                  className={`px-3 py-1 rounded text-xs border ${buyQty === q ? 'glass border-[var(--ue-accent)]/40 text-[var(--ue-accent)]' : 'glass-deep border-white/10 text-slate-400'}`}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleBuyShip} className={`w-full ${S.btn} ${S.btnPrimary}`}>🚀 Comprar Flotilla</button>
      </div>
    </div>
  );
};

export default BuyAIShipsModal;
