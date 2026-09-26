import React from 'react';
import { ResourceBreakdownTooltip } from '../ui/ResourceBreakdownTooltip.jsx';

/**
 * GovernmentResourceBar — Fila superior de recursos en tiempo real
 * para la cabecera ministerial de GovernmentPage.
 */
export const GovernmentResourceBar = React.memo(({ currentPlanet, production, state, fmt }) => {
  return (
    <div className="flex items-center gap-1 sm:gap-2 px-4 py-2 border-b border-white/10 flex-wrap bg-black/40 relative z-40">
      {/* Metal */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
        <span className="text-xl">⛏️</span>
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="font-black text-amber-400 text-base md:text-lg">
            {fmt ? fmt(currentPlanet?.resources?.metal || 0) : (currentPlanet?.resources?.metal || 0)}
          </span>
          {production?.metal !== undefined && (
            <span className="text-xs text-emerald-400 font-bold">
              +{fmt ? fmt(production.metal) : production.metal}
            </span>
          )}
        </div>
        <div className="hidden group-hover/res:block">
          <ResourceBreakdownTooltip
            resourceType="metal"
            breakdown={production?.breakdown}
            currentAmount={currentPlanet?.resources?.metal}
            prodVal={production?.metal}
          />
        </div>
      </div>

      <div className="w-[1px] h-5 bg-white/15 shrink-0" />

      {/* Cristal */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
        <span className="text-xl">💎</span>
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="font-black text-cyan-400 text-base md:text-lg">
            {fmt ? fmt(currentPlanet?.resources?.crystal || 0) : (currentPlanet?.resources?.crystal || 0)}
          </span>
          {production?.crystal !== undefined && (
            <span className="text-xs text-emerald-400 font-bold">
              +{fmt ? fmt(production.crystal) : production.crystal}
            </span>
          )}
        </div>
        <div className="hidden group-hover/res:block">
          <ResourceBreakdownTooltip
            resourceType="crystal"
            breakdown={production?.breakdown}
            currentAmount={currentPlanet?.resources?.crystal}
            prodVal={production?.crystal}
          />
        </div>
      </div>

      <div className="w-[1px] h-5 bg-white/15 shrink-0" />

      {/* Deuterio */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
        <span className="text-xl">⚗️</span>
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="font-black text-emerald-400 text-base md:text-lg">
            {fmt ? fmt(currentPlanet?.resources?.deuterium || 0) : (currentPlanet?.resources?.deuterium || 0)}
          </span>
          {production?.deuterium !== undefined && (
            <span className="text-xs text-emerald-400 font-bold">
              +{fmt ? fmt(production.deuterium) : production.deuterium}
            </span>
          )}
        </div>
        <div className="hidden group-hover/res:block">
          <ResourceBreakdownTooltip
            resourceType="deuterium"
            breakdown={production?.breakdown}
            currentAmount={currentPlanet?.resources?.deuterium}
            prodVal={production?.deuterium}
          />
        </div>
      </div>

      <div className="w-[1px] h-5 bg-white/15 shrink-0" />

      {/* Energía */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
        <span className="text-xl">⚡</span>
        <div className="flex items-baseline leading-none">
          <span className="font-black text-yellow-400 text-base md:text-lg">
            {((production?.energyBalance ?? 0) >= 0 ? '+' : '')}{fmt ? fmt(production?.energyBalance ?? 0) : (production?.energyBalance ?? 0)}
          </span>
        </div>
        <div className="hidden group-hover/res:block">
          <ResourceBreakdownTooltip
            resourceType="energy"
            breakdown={production?.breakdown}
            currentAmount={production?.energyBalance}
            prodVal={production?.energyBalance}
          />
        </div>
      </div>

      <div className="w-[1px] h-5 bg-white/15 shrink-0" />

      {/* Reputación */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Reputación Imperial">
        <span className="text-xl">🎖️</span>
        <div className="flex items-baseline leading-none">
          <span className="font-black text-purple-400 text-base md:text-lg">
            {((Math.round(state?.reputation || 0)) > 0 ? '+' : '')}{Math.round(state?.reputation || 0)}
          </span>
        </div>
        <div className="hidden group-hover/res:block z-[120]">
          <div className="absolute top-full left-0 mt-2 w-80 max-w-[320px] bg-[#060a18] border border-purple-500/50 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(168,85,247,0.2)] z-[120] text-left font-mono text-xs pointer-events-none whitespace-normal break-words">
            <div className="flex items-center gap-2 border-b border-purple-500/30 pb-1.5 mb-2 font-bold text-white">
              <span className="text-base">🎖️</span>
              <span className="text-purple-300 uppercase tracking-wider">Reputación Imperial</span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Rango Actual:</span>
                <span className="font-bold text-white">{Math.round(state?.reputation || 0)} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estatus Diplomático:</span>
                <span className="text-purple-300 font-bold">{(state?.reputation || 0) >= 0 ? 'Respetado' : 'Hostil'}</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 mt-1 leading-relaxed whitespace-normal break-words">
                La reputación imperial influye en acuerdos diplomáticos, comercio galáctico y obediencia ciudadana.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
