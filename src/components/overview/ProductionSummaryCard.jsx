import React from 'react';

export const ProductionSummaryCard = ({ currentPlanet, production, fmt, S }) => {
  const b = production?.breakdown;
  const popMetal = b?.metal?.popConsumption ?? 0;
  const popCrystal = b?.crystal?.popConsumption ?? 0;
  const popDeut = b?.deuterium?.popConsumption ?? 0;
  const netMetal = Math.max(0, (production?.metal || 0) - popMetal);
  const netCrystal = Math.max(0, (production?.crystal || 0) - popCrystal);
  const netDeut = Math.max(0, (production?.deuterium || 0) - popDeut);
  const blds = currentPlanet?.buildings || {};

  return (
    <div className={S.cardDeep + ' h-56 flex flex-col justify-between'}>
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">📈 Producción por Hora</h3>
      <div className="grid grid-cols-2 gap-2 flex-1">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-amber-400 font-bold">⛏️ Metal</span>
            <span className="text-[9px] text-slate-400">Mina Nv.{blds.metalMine || 0}</span>
          </div>
          <div className="text-base font-bold text-amber-300">+{fmt(netMetal)}/h</div>
          <div className="flex justify-between text-[9px] text-slate-400 border-t border-amber-500/10 pt-0.5">
            <span className="text-amber-400/80">👷 {(blds.metalMine || 0) * 120} obreros</span>
            <span>{fmt(netMetal * 24)}/d</span>
          </div>
        </div>
        <div className="glass-deep border border-[var(--ue-accent)]/20 rounded-xl p-2 flex flex-col justify-between fresnel specular">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-cyan-400 font-bold">💎 Cristal</span>
            <span className="text-[9px] text-slate-400">Mina Nv.{blds.crystalMine || 0}</span>
          </div>
          <div className="text-base font-bold text-cyan-300">+{fmt(netCrystal)}/h</div>
          <div className="flex justify-between text-[9px] text-slate-400 border-t border-cyan-500/10 pt-0.5">
            <span className="text-cyan-400/80">👷 {(blds.crystalMine || 0) * 120} obreros</span>
            <span>{fmt(netCrystal * 24)}/d</span>
          </div>
        </div>
        <div className="glass-deep border border-emerald-500/20 rounded-xl p-2 flex flex-col justify-between fresnel specular">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-emerald-400 font-bold">⚗️ Deut</span>
            <span className="text-[9px] text-slate-400">Sint. Nv.{blds.deuteriumSynthesizer || 0}</span>
          </div>
          <div className="text-base font-bold text-emerald-300">+{fmt(netDeut)}/h</div>
          <div className="flex justify-between text-[9px] text-slate-400 border-t border-emerald-500/10 pt-0.5">
            <span className="text-emerald-400/80">👷 {(blds.deuteriumSynthesizer || 0) * 120} obreros</span>
            <span>{fmt(netDeut * 24)}/d</span>
          </div>
        </div>
        <div className={`rounded-lg p-2 border flex flex-col justify-between ${production.energyBalance >= 0 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-yellow-400 font-bold">⚡ Energía</span>
            <span className="text-[9px] text-slate-400">Cons: -{fmt(production.energyCons)}</span>
          </div>
          <div className={`text-base font-bold ${production.energyBalance >= 0 ? 'text-yellow-300' : 'text-red-300'}`}>
            {production.energyBalance >= 0 ? '+' : ''}{fmt(production.energyBalance)}
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 border-t border-yellow-500/10 pt-0.5">
            <span>Prod: {fmt(production.energyProd)}</span>
            <span>{((production.ratio || 1) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionSummaryCard;
