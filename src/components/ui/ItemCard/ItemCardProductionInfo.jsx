import React from 'react';
import { fmt } from '../../../core.jsx';

/**
 * ItemCardProductionInfo — Renderizado del desglose de producción, consumo,
 * almacenamiento o efectos de investigación.
 */
export const ItemCardProductionInfo = React.memo(({ prodInfo, level }) => {
  if (!prodInfo) return null;

  if (prodInfo.kind === 'mine' || prodInfo.kind === 'power' || prodInfo.kind === 'industry') {
    return (
      <div className="text-[10px] space-y-1 mb-2.5 px-2 py-2 rounded-xl bg-[#05070f]/60 border border-white/5">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 uppercase tracking-wider text-[8px]">Producción actual</span>
          <span className="text-slate-300 font-mono font-bold">{prodInfo.current.resourceIcon} {fmt(prodInfo.current.prod)}/h</span>
        </div>
        {prodInfo.current.cons > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-slate-500 uppercase tracking-wider text-[8px]">Consumo</span>
            <span className="text-amber-400/80 font-mono">{prodInfo.current.consIcon} -{fmt(prodInfo.current.cons)}/h</span>
          </div>
        )}
        <div className="border-t border-white/5 pt-1 flex justify-between items-center">
          <span className="text-cyan-500/70 uppercase tracking-wider text-[8px]">Nv.{level + 1}</span>
          <span className="text-cyan-300 font-mono font-bold">
            {prodInfo.next.resourceIcon} {fmt(prodInfo.next.prod)}/h
            {prodInfo.deltaProd !== 0 && <span className="text-emerald-400 ml-1">(+{fmt(prodInfo.deltaProd)})</span>}
          </span>
        </div>
        {prodInfo.next.cons > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-[8px]">Consumo Nivel {level + 1}</span>
            <span className="text-amber-300 font-mono">
              {prodInfo.next.consIcon} -{fmt(prodInfo.next.cons)}/h
              {prodInfo.deltaCons !== 0 && <span className={prodInfo.deltaCons > 0 ? 'text-red-400' : 'text-emerald-400'}> ({prodInfo.deltaCons > 0 ? '+' : ''}{fmt(prodInfo.deltaCons)})</span>}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (prodInfo.kind === 'storage') {
    return (
      <div className="text-[10px] space-y-1 mb-2.5 px-2 py-2 rounded-xl bg-[#05070f]/60 border border-white/5">
        <div className="flex justify-between"><span className="text-slate-500 text-[8px] uppercase">Capacidad actual</span><span className="text-slate-300 font-mono">📦 {fmt(prodInfo.current.capacity)}</span></div>
        <div className="flex justify-between border-t border-white/5 pt-1"><span className="text-cyan-500/70 text-[8px] uppercase">Nv.{level + 1}</span><span className="text-cyan-300 font-mono">📦 {fmt(prodInfo.next.capacity)} <span className="text-emerald-400">(+{fmt(prodInfo.deltaCapacity)})</span></span></div>
        {prodInfo.current.cons > 0 && (
          <div className="flex justify-between items-center border-t border-white/5 pt-1 text-[9px]">
            <span className="text-slate-500">Demanda energética</span>
            <span className="text-amber-400 font-mono">⚡ -{fmt(prodInfo.current.cons)}/h</span>
          </div>
        )}
        {prodInfo.next.cons > 0 && prodInfo.current.cons === 0 && (
          <div className="flex justify-between items-center border-t border-white/5 pt-1 text-[9px]">
            <span className="text-slate-500">Demanda Nv.1</span>
            <span className="text-amber-300 font-mono">⚡ -{fmt(prodInfo.next.cons)}/h</span>
          </div>
        )}
        {prodInfo.deltaCons > 0 && prodInfo.current.cons > 0 && (
          <div className="flex justify-between items-center border-t border-white/5 pt-1 text-[9px]">
            <span className="text-slate-500">Consumo Nivel {level + 1}</span>
            <span className="text-amber-300 font-mono">⚡ -{fmt(prodInfo.next.cons)}/h <span className="text-red-400">(+{fmt(prodInfo.deltaCons)})</span></span>
          </div>
        )}
      </div>
    );
  }

  if (prodInfo.kind === 'civil' || prodInfo.kind === 'government') {
    const hasStat = prodInfo.next?.statLabel && prodInfo.deltaStat !== undefined;
    return (
      <div className="text-[10px] space-y-1 mb-2.5 px-2 py-2 rounded-xl bg-[#05070f]/60 border border-white/5 text-slate-400">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <span>{prodInfo.next?.statIcon || (prodInfo.kind === 'government' ? '👑' : '🏛️')}</span>
            <span>{prodInfo.next?.statLabel || (prodInfo.kind === 'government' ? 'Gobierno' : 'Civil')}</span>
          </span>
          <span className="font-mono text-cyan-300 font-bold">Nv.{level} → Nv.{level + 1}</span>
        </div>

        {hasStat && (
          <div className="flex justify-between items-center border-t border-white/5 pt-1 text-[9px]">
            <span className="text-slate-500 uppercase tracking-wider text-[8px]">Efecto Nv.{level + 1}</span>
            <span className="font-mono text-cyan-300 font-bold">
              +{typeof prodInfo.next.statValue === 'number' ? fmt(prodInfo.next.statValue) : prodInfo.next.statValue}{prodInfo.statUnit}
              {prodInfo.deltaStat > 0 && (
                <span className="text-emerald-400 ml-1 font-mono font-black">
                  (+{typeof prodInfo.deltaStat === 'number' ? fmt(prodInfo.deltaStat) : prodInfo.deltaStat}{prodInfo.statUnit})
                </span>
              )}
            </span>
          </div>
        )}

        {prodInfo.current.cons > 0 && (
          <div className="flex justify-between items-center border-t border-white/5 pt-1 text-[9px]">
            <span className="text-slate-500">Demanda energética</span>
            <span className="text-amber-400 font-mono font-semibold">⚡ -{fmt(prodInfo.current.cons)}/h</span>
          </div>
        )}
        {prodInfo.next.cons > 0 && prodInfo.current.cons === 0 && (
          <div className="flex justify-between items-center border-t border-white/5 pt-1 text-[9px]">
            <span className="text-slate-500">Demanda Nv.1</span>
            <span className="text-amber-300 font-mono">⚡ -{fmt(prodInfo.next.cons)}/h</span>
          </div>
        )}
        {prodInfo.deltaCons > 0 && prodInfo.current.cons > 0 && (
          <div className="flex justify-between items-center border-t border-white/5 pt-1 text-[9px]">
            <span className="text-slate-500">Consumo Nivel {level + 1}</span>
            <span className="text-amber-300 font-mono">⚡ -{fmt(prodInfo.next.cons)}/h <span className="text-red-400">(+{fmt(prodInfo.deltaCons)})</span></span>
          </div>
        )}
      </div>
    );
  }

  if (prodInfo.kind === 'research') {
    return (
      <div className="text-[10px] space-y-1 mb-2.5 px-2 py-2 rounded-xl bg-[#05070f]/60 border border-white/5">
        <div className="text-slate-400 font-semibold mb-1 text-[9px]">{prodInfo.current.effect}</div>
        {prodInfo.current.mult && (
          <div className="flex justify-between"><span className="text-slate-500 text-[8px]">Mult. Actual</span><span className="text-slate-200 font-mono font-bold">{prodInfo.current.mult} <span className="text-slate-500">(+{prodInfo.current.bonus}%)</span></span></div>
        )}
        {prodInfo.next.mult && (
          <div className="flex justify-between border-t border-white/5 pt-1"><span className="text-cyan-500/70 text-[8px]">Nv.{level + 1}</span><span className="text-cyan-300 font-mono font-bold">{prodInfo.next.mult} <span className="text-emerald-400">(+{prodInfo.next.bonus}%)</span></span></div>
        )}
        {!prodInfo.current.mult && prodInfo.current.bonus !== undefined && <div className="flex justify-between"><span className="text-slate-500 text-[8px]">Actual</span><span className="text-slate-300 font-mono">+{prodInfo.current.bonus}{prodInfo.unit}</span></div>}
        {!prodInfo.next.mult && prodInfo.next.bonus !== undefined && <div className="flex justify-between border-t border-white/5 pt-1"><span className="text-cyan-500/70 text-[8px]">Nv.{level + 1}</span><span className="text-cyan-300 font-mono">+{prodInfo.next.bonus}{prodInfo.unit} <span className="text-emerald-400">(+{prodInfo.delta}{prodInfo.unit})</span></span></div>}
        {prodInfo.current.bonus === undefined && <div className="flex justify-between border-t border-white/5 pt-1"><span className="text-slate-500 text-[8px]">Nv.{level + 1}</span><span className="text-cyan-300">Activo</span></div>}
      </div>
    );
  }

  return null;
});
