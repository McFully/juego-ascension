import React from 'react';
import { ResourceBreakdownTooltip } from './ResourceBreakdownTooltip.jsx';
import { calcPlanetMaxPop, fmt as defaultFmt } from '../../core.jsx';

/**
 * TacticalResourceRow — Fila unificada de telemetria de recursos tácticos y censo.
 * Utilizada de forma estandarizada en OverviewHudBar, HubTopBar y FederalDistrictHeader.
 */
export const TacticalResourceRow = React.memo(({
  resources,
  production,
  currentPlanet,
  state,
  militaryPower,
  fmt = defaultFmt,
  className = '',
  children
}) => {
  const metalAmount = resources?.metal ?? currentPlanet?.resources?.metal ?? 0;
  const crystalAmount = resources?.crystal ?? currentPlanet?.resources?.crystal ?? 0;
  const deutAmount = resources?.deuterium ?? currentPlanet?.resources?.deuterium ?? 0;
  const slagAmount = resources?.slag ?? currentPlanet?.resources?.slag ?? 0;

  const prodMetal = production?.metal ?? production?.prodMetal;
  const prodCrystal = production?.crystal ?? production?.prodCrystal;
  const prodDeut = production?.deuterium ?? production?.prodDeuterium;
  const energyBalance = production?.energyBalance ?? 0;
  const slagNet = production?.slagNet ?? production?.prodSlagNet;
  const breakdown = production?.breakdown;

  // Calculo de censo si aplica
  const pop = currentPlanet?.population || (state?.planets ? state.planets.reduce((acc, p) => acc + (p.population || 0), 0) : 1000);
  let maxPop = 10000;
  try {
    if (currentPlanet) {
      maxPop = calcPlanetMaxPop(currentPlanet);
    } else if (state?.planets) {
      maxPop = state.planets.reduce((acc, p) => acc + (calcPlanetMaxPop(p) || 10000), 0);
    }
  } catch (_) {}

  const reputation = state?.reputation ?? 0;

  return (
    <div className={`flex items-center gap-1 sm:gap-2 px-4 py-2 border-b border-white/10 flex-wrap bg-black/40 relative z-40 ${className}`}>
      {/* Metal */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0 min-w-[130px] sm:min-w-[145px]">
        <span className="text-xl shrink-0">⛏️</span>
        <div className="flex items-baseline gap-1.5 leading-none tabular-nums">
          <span className="font-black text-amber-400 text-base md:text-lg">
            {fmt(metalAmount)}
          </span>
          {prodMetal !== undefined && (
            <span className="text-xs text-emerald-400 font-bold tabular-nums">
              +{fmt(prodMetal)}
            </span>
          )}
        </div>
        <div className="hidden group-hover/res:block">
          <ResourceBreakdownTooltip
            resourceType="metal"
            breakdown={breakdown}
            currentAmount={metalAmount}
            prodVal={prodMetal}
          />
        </div>
      </div>

      <div className="w-[1px] h-5 bg-white/15 shrink-0" />

      {/* Cristal */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0 min-w-[130px] sm:min-w-[145px]">
        <span className="text-xl shrink-0">💎</span>
        <div className="flex items-baseline gap-1.5 leading-none tabular-nums">
          <span className="font-black text-cyan-400 text-base md:text-lg">
            {fmt(crystalAmount)}
          </span>
          {prodCrystal !== undefined && (
            <span className="text-xs text-emerald-400 font-bold tabular-nums">
              +{fmt(prodCrystal)}
            </span>
          )}
        </div>
        <div className="hidden group-hover/res:block">
          <ResourceBreakdownTooltip
            resourceType="crystal"
            breakdown={breakdown}
            currentAmount={crystalAmount}
            prodVal={prodCrystal}
          />
        </div>
      </div>

      <div className="w-[1px] h-5 bg-white/15 shrink-0" />

      {/* Deuterio */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0 min-w-[130px] sm:min-w-[145px]">
        <span className="text-xl shrink-0">⚗️</span>
        <div className="flex items-baseline gap-1.5 leading-none tabular-nums">
          <span className="font-black text-emerald-400 text-base md:text-lg">
            {fmt(deutAmount)}
          </span>
          {prodDeut !== undefined && (
            <span className="text-xs text-emerald-400 font-bold tabular-nums">
              +{fmt(prodDeut)}
            </span>
          )}
        </div>
        <div className="hidden group-hover/res:block">
          <ResourceBreakdownTooltip
            resourceType="deuterium"
            breakdown={breakdown}
            currentAmount={deutAmount}
            prodVal={prodDeut}
          />
        </div>
      </div>

      <div className="w-[1px] h-5 bg-white/15 shrink-0" />

      {/* Escoria Industrial (Ancho fijo estricto para evitar jitter/baile del HUD) */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0 w-[170px]">
        <span className="text-xl shrink-0">🪨</span>
        <div className="flex items-baseline gap-1.5 leading-none tabular-nums flex-1 overflow-hidden">
          <span className="font-black text-orange-400 text-base md:text-lg tabular-nums">
            {fmt(slagAmount)}
          </span>
          {slagNet !== undefined && (
            <span className={`text-xs font-bold tabular-nums shrink-0 ${(slagNet || 0) <= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {(slagNet || 0) > 0 ? `+${fmt(slagNet)}` : fmt(slagNet || 0)}
            </span>
          )}
        </div>
        <div className="hidden group-hover/res:block z-[100]">
          <ResourceBreakdownTooltip
            resourceType="slag"
            breakdown={breakdown}
            currentAmount={slagAmount}
            prodVal={slagNet}
          />
        </div>
      </div>

      <div className="w-[1px] h-5 bg-white/15 shrink-0" />

      {/* Energia */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0 min-w-[90px] sm:min-w-[105px]">
        <span className="text-xl shrink-0">⚡</span>
        <div className="flex items-baseline leading-none tabular-nums">
          <span className="font-black text-yellow-400 text-base md:text-lg">
            {(energyBalance >= 0 ? '+' : '')}{fmt(energyBalance)}
          </span>
        </div>
        <div className="hidden group-hover/res:block">
          <ResourceBreakdownTooltip
            resourceType="energy"
            breakdown={breakdown}
            currentAmount={energyBalance}
            prodVal={energyBalance}
          />
        </div>
      </div>

      <div className="w-[1px] h-5 bg-white/15 shrink-0" />

      {/* Censo Poblacional */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Censo Poblacional">
        <span className="text-xl">👥</span>
        <div className="flex items-baseline leading-none">
          <span className="font-black text-teal-300 text-base md:text-lg">
            {fmt(pop)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono ml-1">
            / {fmt(maxPop)}
          </span>
        </div>
        <div className="hidden group-hover/res:block z-[120]">
          <div className="absolute top-full left-0 mt-2 w-80 max-w-[320px] bg-[#060a18] border border-teal-500/50 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(20,184,166,0.2)] z-[120] text-left font-mono text-xs pointer-events-none whitespace-normal break-words">
            <div className="flex items-center gap-2 border-b border-teal-500/30 pb-1.5 mb-2 font-bold text-white">
              <span className="text-base">👥</span>
              <span className="text-teal-300 uppercase tracking-wider">Censo Imperial</span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Poblacion Activa:</span>
                <span className="font-bold text-teal-300">{fmt(pop)} hab</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capacidad Maxima:</span>
                <span className="font-bold text-white">{fmt(maxPop)} hab</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tasa de Ocupacion:</span>
                <span className="font-bold text-cyan-300">
                  {maxPop > 0 ? Math.min(100, Math.round((pop / maxPop) * 100)) : 0}%
                </span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 mt-1 leading-relaxed whitespace-normal break-words">
                Suministra mano de obra, consumo y tributos imperiales. La capacidad crece con Distritos Residenciales y Habitats.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[1px] h-5 bg-white/15 shrink-0" />

      {/* Reputacion */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Reputación Imperial Global">
        <span className="text-xl">🎖️</span>
        <div className="flex items-baseline leading-none">
          <span className="font-black text-purple-400 text-base md:text-lg">
            {((Math.round(reputation)) > 0 ? '+' : '')}{Math.round(reputation)}
          </span>
        </div>
        <div className="hidden group-hover/res:block z-[120]">
          <div className="absolute top-full left-0 mt-2 w-80 max-w-[320px] bg-[#060a18] border border-purple-500/50 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(168,85,247,0.2)] z-[120] text-left font-mono text-xs pointer-events-none whitespace-normal break-words">
            <div className="flex items-center gap-2 border-b border-purple-500/30 pb-1.5 mb-2 font-bold text-white">
              <span className="text-base">🎖️</span>
              <span className="text-purple-300 uppercase tracking-wider">Reputación Imperial Global</span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Rango Actual:</span>
                <span className="font-bold text-white">{Math.round(reputation)} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estatus Diplomático:</span>
                <span className="text-purple-300 font-bold">{reputation >= 0 ? 'Respetado' : 'Hostil'}</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 mt-1 leading-relaxed whitespace-normal break-words">
                La reputación imperial influye en acuerdos diplomáticos, comercio galáctico y obediencia ciudadana.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[1px] h-5 bg-white/15 shrink-0" />

      {/* Monedas / Créditos Estelares */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Créditos Estelares / Monedas Galácticas">
        <span className="text-xl">🪙</span>
        <div className="flex items-baseline leading-none">
          <span className="font-black text-amber-300 text-base md:text-lg tabular-nums">
            {fmt(state?.credits ?? 0)}
          </span>
        </div>
        <div className="hidden group-hover/res:block z-[120]">
          <div className="absolute top-full left-0 mt-2 w-80 max-w-[320px] bg-[#060a18] border border-amber-500/50 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(245,158,11,0.2)] z-[120] text-left font-mono text-xs pointer-events-none whitespace-normal break-words">
            <div className="flex items-center gap-2 border-b border-amber-500/30 pb-1.5 mb-2 font-bold text-white">
              <span className="text-base">🪙</span>
              <span className="text-amber-300 uppercase tracking-wider">Tesoro Imperial (Monedas)</span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Saldo Disponible:</span>
                <span className="font-bold text-amber-300">{fmt(state?.credits ?? 0)} créditos</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 mt-1 leading-relaxed whitespace-normal break-words">
                Moneda fiduciaria galáctica utilizada en transacciones de la Lonja, banca central, mercado interestelar y contratación de ministros.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[1px] h-5 bg-white/15 shrink-0" />

      {/* Influencia Soberana (Ubicación única principal y oficial a la derecha de Reputación Imperial Global) */}
      <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Influencia Soberana">
        <span className="text-xl">🏛️</span>
        <div className="flex items-baseline leading-none">
          <span className="font-black text-purple-400 text-base md:text-lg">
            {fmt(state?.influence || 0)}
          </span>
        </div>
        <div className="hidden group-hover/res:block z-[120]">
          <div className="absolute top-full left-0 mt-2 w-80 max-w-[320px] bg-[#060a18] border border-purple-500/50 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(168,85,247,0.2)] z-[120] text-left font-mono text-xs pointer-events-none whitespace-normal break-words">
            <div className="flex items-center gap-2 border-b border-purple-500/30 pb-1.5 mb-2 font-bold text-white">
              <span className="text-base">🏛️</span>
              <span className="text-purple-300 uppercase tracking-wider">Influencia Soberana</span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Puntos Disponibles:</span>
                <span className="font-bold text-purple-300">{fmt(state?.influence || 0)} pts</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 mt-1 leading-relaxed whitespace-normal break-words">
                Poder político interestelar para promulgar dictámenes en el Consejo Galáctico, fundar federaciones, sellar alianzas y ejecutar acciones diplomáticas.
              </div>
            </div>
          </div>
        </div>
      </div>
      {militaryPower !== undefined && (
        <>
          <div className="w-[1px] h-5 bg-white/15 shrink-0" />
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Poder Militar de Flotas Imperiales">
            <span className="text-xl">🚀</span>
            <div className="flex items-baseline leading-none">
              <span className="font-black text-rose-400 text-base md:text-lg">
                {fmt(militaryPower)}
              </span>
            </div>
            <div className="hidden group-hover/res:block z-[120]">
              <div className="absolute top-full left-0 mt-2 w-80 max-w-[320px] bg-[#060a18] border border-rose-500/50 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(244,63,94,0.2)] z-[120] text-left font-mono text-xs pointer-events-none whitespace-normal break-words">
                <div className="flex items-center gap-2 border-b border-rose-500/30 pb-1.5 mb-2 font-bold text-white">
                  <span className="text-base">🚀</span>
                  <span className="text-rose-300 uppercase tracking-wider">Poder Militar de Flota</span>
                </div>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fuerza Ofensiva Total:</span>
                    <span className="font-bold text-rose-300">{fmt(militaryPower)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 mt-1 leading-relaxed whitespace-normal break-words">
                    Suma ponderada de potencia de fuego, escudos y cascos de todas las naves en colonias y en misiones navales activas.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {children}
    </div>
  );
});
