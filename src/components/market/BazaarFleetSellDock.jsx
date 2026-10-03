import React from 'react';
import { SHIPS } from '../../data/game/shipsData.js';

/**
 * BazaarFleetSellDock — Muelle de liquidación y venta de naves estacionadas por Créditos Estelares.
 * Desacoplado de UsedShipBazaarView para mantener alta cohesión y modularidad.
 */
export const BazaarFleetSellDock = ({
  currentPlanet,
  tradeLvl = 0,
  planetFleet = {},
  sellSelection = {},
  setSellSelection,
  onExecuteSell,
  fmt
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
        <span>
          ℹ️ Vende naves estacionadas en <strong>{currentPlanet?.name}</strong> al Consorcio Mercantil por Créditos Estelares inmediatos.
        </span>
        <span className="font-mono font-bold">
          Bonus Comercio Galáctico: +{tradeLvl * 5}% tasación
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(planetFleet).filter(([_, qty]) => qty > 0).map(([shipId, availableQty]) => {
          const shipDef = SHIPS[shipId];
          if (!shipDef) return null;

          const baseCostSum = (shipDef.cost?.m || 0) + (shipDef.cost?.c || 0) + (shipDef.cost?.d || 0) * 2;
          const unitPrice = Math.floor(baseCostSum * (0.60 + tradeLvl * 0.05));
          const selectedQty = sellSelection[shipId] || 0;

          return (
            <div key={shipId} className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm">{shipDef.name || shipId}</h4>
                  <span className="text-xs text-slate-400">En hangar: {availableQty}</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  +{fmt(unitPrice)} ₢ / ud.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={availableQty}
                  value={selectedQty}
                  onChange={(e) => setSellSelection({ ...sellSelection, [shipId]: Number(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
                <span className="font-mono text-xs w-12 text-right text-white font-bold">{selectedQty}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-3">
        <button
          onClick={onExecuteSell}
          disabled={Object.values(sellSelection).reduce((a, b) => a + b, 0) <= 0}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Liquidar Naves Seleccionadas
        </button>
      </div>
    </div>
  );
};
