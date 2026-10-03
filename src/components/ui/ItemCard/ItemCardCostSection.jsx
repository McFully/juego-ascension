import React from 'react';
import { fmt, fmtTime } from '../../../core.jsx';

/**
 * ItemCardCostSection — Desglose de costes de metal, cristal, deuterio y tiempo.
 */
export const ItemCardCostSection = React.memo(({ cost = {}, time = 0, canAfford, planetResources, prodInfo }) => {
  // Evaluación granular recurso por recurso si se dispone de planetResources
  const hasMetal = planetResources ? (planetResources.metal ?? 0) >= (cost.metal || 0) : canAfford;
  const hasCrystal = planetResources ? (planetResources.crystal ?? 0) >= (cost.crystal || 0) : canAfford;
  const hasDeuterium = planetResources ? (planetResources.deuterium ?? 0) >= (cost.deuterium || 0) : canAfford;

  return (
    <div className="space-y-1 mb-3 px-2 py-2 rounded-xl bg-[#05070f]/40 border border-white/5">
      <div className="text-[8px] text-slate-600 uppercase tracking-wider font-bold mb-1">Coste de mejora</div>
      {cost.metal > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-amber-400">⛏️ Metal</span>
          <span className={`font-mono font-medium ${hasMetal ? 'text-emerald-400' : 'text-rose-400'}`}>
            {fmt(cost.metal)}
          </span>
        </div>
      )}
      {cost.crystal > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-cyan-400">💎 Cristal</span>
          <span className={`font-mono font-medium ${hasCrystal ? 'text-emerald-400' : 'text-rose-400'}`}>
            {fmt(cost.crystal)}
          </span>
        </div>
      )}
      {cost.deuterium > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-emerald-400">⚗️ Deuterio</span>
          <span className={`font-mono font-medium ${hasDeuterium ? 'text-emerald-400' : 'text-rose-400'}`}>
            {fmt(cost.deuterium)}
          </span>
        </div>
      )}
      {(cost.energy > 0 || (prodInfo?.next?.cons > 0 && prodInfo?.next?.consType === 'energy')) && (
        <div className="flex justify-between text-xs">
          <span className="text-amber-300">⚡ Demanda Energía</span>
          <span className="font-mono font-bold text-amber-300">
            -{fmt(cost.energy || prodInfo?.next?.cons || 0)}/h
          </span>
        </div>
      )}
      {time > 0 && (
        <div className="flex justify-between text-xs border-t border-white/5 pt-1">
          <span className="text-slate-400">⏱️ Tiempo</span>
          <span className="text-cyan-400 font-mono">{fmtTime(time)}</span>
        </div>
      )}
    </div>
  );
});
