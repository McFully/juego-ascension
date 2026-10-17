import React from 'react';
import { ResourceBreakdownTooltip } from './ResourceBreakdownTooltip.jsx';
import { BiosphereSocialTooltip } from './BiosphereSocialTooltip.jsx';
import { calcPlanetMaxPop, fmt as defaultFmt } from '../../core.jsx';

/**
 * TacticalResourceRow — Fila unificada de telemetria de recursos tácticos, censo y biosfera.
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

  // Fallback seguro de breakdown: garantiza que siempre se renderice la tarjeta de detalle
  const breakdown = React.useMemo(() => {
    if (production?.breakdown) return production.breakdown;
    return {
      metal: { total: prodMetal || 0, netTotal: prodMetal || 0, baseMine: prodMetal || 0, popConsumption: 0, techMult: 1, govMult: 1, biomeMult: 1, civMult: 1, specMult: 1, ratio: 1 },
      crystal: { total: prodCrystal || 0, netTotal: prodCrystal || 0, baseMine: prodCrystal || 0, popConsumption: 0, techMult: 1, govMult: 1, biomeMult: 1, civMult: 1, specMult: 1, ratio: 1 },
      deuterium: { total: prodDeut || 0, netTotal: prodDeut || 0, baseMine: prodDeut || 0, popConsumption: 0, techMult: 1, govMult: 1, biomeMult: 1, civMult: 1, specMult: 1, ratio: 1, fusionDeduction: 0 },
      energy: { totalProd: energyBalance || 0, totalCons: 0, energyBalance: energyBalance || 0 },
      slag: { total: slagAmount || 0, generation: slagNet || 0, details: {} }
    };
  }, [production?.breakdown, prodMetal, prodCrystal, prodDeut, energyBalance, slagAmount, slagNet]);

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

  // Vectores Vitales (Planeta o Imperial Global)
  const isImperial = !currentPlanet || currentPlanet.isImperialSummary;
  const planetsList = state?.planets || [];

  const bioMetrics = React.useMemo(() => {
    if (!isImperial && currentPlanet) {
      const b = currentPlanet.biosphere || {};
      const t = currentPlanet.thermalGrid || {};
      const d = currentPlanet.demographics || {};
      return {
        o2Pct: Math.round((b.o2Level !== undefined ? b.o2Level : 0.21) * 100),
        waterDays: b.waterReserveDays !== undefined ? b.waterReserveDays : 120,
        pollution: Number((b.pollutionLevel !== undefined ? b.pollutionLevel : 5.0).toFixed(1)),
        tempC: Number((t.atmosphericTempC !== undefined ? t.atmosphericTempC : 18.0).toFixed(0)),
        morale: d.morale !== undefined ? d.morale : 85,
      };
    }
    // Promedio Imperial Global
    if (planetsList.length > 0) {
      let totO2 = 0, totWater = 0, totPollution = 0, totTemp = 0, totMorale = 0;
      planetsList.forEach(p => {
        const b = p.biosphere || {};
        const t = p.thermalGrid || {};
        const d = p.demographics || {};
        totO2 += (b.o2Level !== undefined ? b.o2Level : 0.21);
        totWater += (b.waterReserveDays !== undefined ? b.waterReserveDays : 120);
        totPollution += (b.pollutionLevel !== undefined ? b.pollutionLevel : 5.0);
        totTemp += (t.atmosphericTempC !== undefined ? t.atmosphericTempC : 18.0);
        totMorale += (d.morale !== undefined ? d.morale : 85);
      });
      const count = planetsList.length;
      return {
        o2Pct: Math.round((totO2 / count) * 100),
        waterDays: Math.round(totWater / count),
        pollution: Number((totPollution / count).toFixed(1)),
        tempC: Math.round(totTemp / count),
        morale: Math.round(totMorale / count),
      };
    }
    return { o2Pct: 21, waterDays: 120, pollution: 5.0, tempC: 18, morale: 85 };
  }, [isImperial, currentPlanet, planetsList]);

  return (
    <div className={`flex items-center gap-1 sm:gap-2 px-4 py-2 border-b border-white/10 flex-wrap bg-black/40 relative z-40 ${className}`}>
      {/* Metal — Solo Stock */}
      <div className="relative group/res flex items-center gap-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
        <span className="text-lg shrink-0">⛏️</span>
        <div className="flex items-baseline leading-none tabular-nums">
          <span className="font-black text-amber-400 text-sm md:text-base">
            {fmt(metalAmount)}
          </span>
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

      <div className="w-[1px] h-4 bg-white/15 shrink-0" />

      {/* Cristal — Solo Stock */}
      <div className="relative group/res flex items-center gap-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
        <span className="text-lg shrink-0">💎</span>
        <div className="flex items-baseline leading-none tabular-nums">
          <span className="font-black text-cyan-400 text-sm md:text-base">
            {fmt(crystalAmount)}
          </span>
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

      <div className="w-[1px] h-4 bg-white/15 shrink-0" />

      {/* Deuterio — Solo Stock */}
      <div className="relative group/res flex items-center gap-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
        <span className="text-lg shrink-0">⚗️</span>
        <div className="flex items-baseline leading-none tabular-nums">
          <span className="font-black text-emerald-400 text-sm md:text-base">
            {fmt(deutAmount)}
          </span>
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

      <div className="w-[1px] h-4 bg-white/15 shrink-0" />

      {/* Escoria Industrial — Homogéneo, Solo Stock */}
      <div className="relative group/res flex items-center gap-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
        <span className="text-lg shrink-0">🪨</span>
        <div className="flex items-baseline leading-none tabular-nums">
          <span className="font-black text-orange-400 text-sm md:text-base">
            {fmt(slagAmount)}
          </span>
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

      <div className="w-[1px] h-4 bg-white/15 shrink-0" />

      {/* Energia */}
      <div className="relative group/res flex items-center gap-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
        <span className="text-lg shrink-0">⚡</span>
        <div className="flex items-baseline leading-none tabular-nums">
          <span className="font-black text-yellow-400 text-sm md:text-base">
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

      <div className="w-[1px] h-4 bg-white/15 shrink-0" />

      {/* VECTORES VITALES (SÓTANO A LA SUPERFICIE) */}

      {/* 1. Calidad del Aire y Respirabilidad */}
      <div className="relative group/res flex items-center gap-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Calidad Atmosférica y Respirabilidad">
        <span className="text-lg shrink-0">🌬️</span>
        <div className="flex items-baseline leading-none tabular-nums">
          <span className="font-black text-sky-300 text-sm md:text-base">
            {bioMetrics.o2Pct}%
          </span>
        </div>
        <div className="hidden group-hover/res:block z-[120]">
          <BiosphereSocialTooltip
            metricType="air"
            currentPlanet={currentPlanet}
            state={state}
            fmt={fmt}
          />
        </div>
      </div>

      <div className="w-[1px] h-4 bg-white/15 shrink-0" />

      {/* 2. Reserva de Agua y Soporte Vital */}
      <div className="relative group/res flex items-center gap-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Reserva Hídrica y Soporte Vital">
        <span className="text-lg shrink-0">💧</span>
        <div className="flex items-baseline leading-none tabular-nums">
          <span className="font-black text-cyan-300 text-sm md:text-base">
            {bioMetrics.waterDays}d
          </span>
        </div>
        <div className="hidden group-hover/res:block z-[120]">
          <BiosphereSocialTooltip
            metricType="water"
            currentPlanet={currentPlanet}
            state={state}
            fmt={fmt}
          />
        </div>
      </div>

      <div className="w-[1px] h-4 bg-white/15 shrink-0" />

      {/* 3. Contaminación y Polución */}
      <div className="relative group/res flex items-center gap-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Degradación Ecológica y Polución">
        <span className="text-lg shrink-0">☣️</span>
        <div className="flex items-baseline leading-none tabular-nums">
          <span className={`font-black text-sm md:text-base ${bioMetrics.pollution > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {bioMetrics.pollution}%
          </span>
        </div>
        <div className="hidden group-hover/res:block z-[120]">
          <BiosphereSocialTooltip
            metricType="pollution"
            currentPlanet={currentPlanet}
            state={state}
            fmt={fmt}
          />
        </div>
      </div>

      <div className="w-[1px] h-4 bg-white/15 shrink-0" />

      {/* 4. Red Térmica y Climatización */}
      <div className="relative group/res flex items-center gap-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Red Térmica y Clima">
        <span className="text-lg shrink-0">🌡️</span>
        <div className="flex items-baseline leading-none tabular-nums">
          <span className="font-black text-amber-300 text-sm md:text-base">
            {bioMetrics.tempC}°C
          </span>
        </div>
        <div className="hidden group-hover/res:block z-[120]">
          <BiosphereSocialTooltip
            metricType="thermal"
            currentPlanet={currentPlanet}
            state={state}
            fmt={fmt}
          />
        </div>
      </div>

      <div className="w-[1px] h-4 bg-white/15 shrink-0" />

      {/* 5. Moral y Cohesión Social */}
      <div className="relative group/res flex items-center gap-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Moral Colonial y Cohesión Social">
        <span className="text-lg shrink-0">😊</span>
        <div className="flex items-baseline leading-none tabular-nums">
          <span className={`font-black text-sm md:text-base ${bioMetrics.morale < 60 ? 'text-rose-400' : 'text-teal-300'}`}>
            {bioMetrics.morale}%
          </span>
        </div>
        <div className="hidden group-hover/res:block z-[120]">
          <BiosphereSocialTooltip
            metricType="society"
            currentPlanet={currentPlanet}
            state={state}
            fmt={fmt}
          />
        </div>
      </div>

      <div className="w-[1px] h-5 bg-white/15 shrink-0" />

      {/* Censo Poblacional */}
      {(() => {
        const blds = currentPlanet?.buildings || {};
        const mineWorkers = ((blds.metalMine || 0) + (blds.crystalMine || 0) + (blds.deuteriumSynthesizer || 0) + (blds.solarPlant || 0) + (blds.fusionReactor || 0)) * 120;
        const fleetCount = Object.values(currentPlanet?.fleet || {}).reduce((a, b) => a + (b || 0), 0);
        const defCount = Object.values(currentPlanet?.defenses || {}).reduce((a, b) => a + (b || 0), 0);
        const militaryCrew = fleetCount * 15 + defCount * 8;
        const occupiedPop = Math.min(pop, mineWorkers + militaryCrew);
        const freePop = Math.max(0, Math.floor(pop - occupiedPop));
        const vitalSupport = 100000 + (blds.urbanHydroponic || 0) * 25000 + (blds.biomeDomeSimulation || 0) * 50000 + (blds.waterPurifier || 0) * 20000;
        const growthRatePerHour = pop < maxPop ? Math.max(5, Math.floor(pop * 0.015 * Math.max(0.2, 1 - pop / Math.max(1, maxPop)))) : 0;

        return (
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Censo Poblacional">
            <span className="text-xl">👥</span>
            <div className="flex items-baseline leading-none">
              <span className="font-black text-teal-300 text-base md:text-lg">
                {fmt(pop)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono ml-1">
                / {fmt(maxPop)}
              </span>
              {growthRatePerHour > 0 && (
                <span className="text-[10px] text-emerald-400 font-mono font-bold ml-1">
                  +{fmt(growthRatePerHour)}/h
                </span>
              )}
            </div>
            <div className="hidden group-hover/res:block z-[120]">
              <div className="absolute top-full left-0 mt-2 w-80 max-w-[320px] bg-[#060a18] border border-teal-500/50 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(20,184,166,0.2)] z-[120] text-left font-mono text-xs pointer-events-none whitespace-normal break-words">
                <div className="flex items-center justify-between border-b border-teal-500/30 pb-1.5 mb-2 font-bold text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👥</span>
                    <span className="text-teal-300 uppercase tracking-wider">Censo Imperial</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-bold">+{fmt(growthRatePerHour)} hab/h</span>
                </div>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Poblacion Total:</span>
                    <span className="font-bold text-teal-300">{fmt(pop)} / {fmt(maxPop)} hab</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Obreros en Minas e Ind.:</span>
                    <span className="font-bold text-amber-300">{fmt(Math.min(pop, mineWorkers))} hab</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Personal Flota y Defensa:</span>
                    <span className="font-bold text-rose-300">{fmt(Math.min(Math.max(0, pop - mineWorkers), militaryCrew))} hab</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-1">
                    <span className="text-slate-300 font-bold">Poblacion Libre (Reserva):</span>
                    <span className="font-bold text-emerald-400">{fmt(freePop)} hab</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Soporte Vital (Agua/Alim.):</span>
                    <span className="font-bold text-cyan-300">{fmt(vitalSupport)} hab</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 mt-1 leading-relaxed whitespace-normal break-words">
                    Suministra obreros para minas, tripulaciones navales y recaudacion fiscal en Creditos.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* Monedas / Créditos Estelares con Flujo Neto Horario */}
      {(() => {
        const netFlow = state?.financialBalance?.netHourly ?? 0;
        const velocity = state?.financialBalance?.monetaryVelocity ?? 1.0;
        const income = state?.financialBalance?.income || {};
        const expenses = state?.financialBalance?.expenses || {};

        return (
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Créditos Estelares / Tesorería Imperial">
            <span className="text-xl">🪙</span>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-black text-amber-300 text-base md:text-lg tabular-nums">
                {fmt(state?.credits ?? 0)}
              </span>
              <span className={`text-[10px] font-mono font-bold ${netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netFlow >= 0 ? `+${fmt(netFlow)}/h` : `${fmt(netFlow)}/h`}
              </span>
            </div>
            <div className="hidden group-hover/res:block z-[120]">
              <div className="absolute top-full left-0 mt-2 w-80 max-w-[320px] bg-[#060a18] border border-amber-500/50 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(245,158,11,0.2)] z-[120] text-left font-mono text-xs pointer-events-none whitespace-normal break-words">
                <div className="flex items-center gap-2 border-b border-amber-500/30 pb-1.5 mb-2 font-bold text-white">
                  <span className="text-base">🪙</span>
                  <span className="text-amber-300 uppercase tracking-wider">Tesoro y Balance Financiero</span>
                </div>
                <div className="space-y-1.5 text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Saldo Disponible:</span>
                    <span className="font-bold text-amber-300">{fmt(state?.credits ?? 0)} Cr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Balance Neto:</span>
                    <span className={`font-bold ${netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {netFlow >= 0 ? `+${fmt(netFlow)} Cr/h` : `${fmt(netFlow)} Cr/h`}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-white/10 space-y-1 text-[10px]">
                    <div className="flex justify-between text-emerald-400">
                      <span>• Ingresos (IRPF/Tasas/Negocios):</span>
                      <span>+{fmt(income.total || 0)}/h</span>
                    </div>
                    <div className="flex justify-between text-rose-400">
                      <span>• Salarios de Ministros:</span>
                      <span>-{fmt(expenses.ministerSalaries || 0)}/h</span>
                    </div>
                    <div className="flex justify-between text-rose-400">
                      <span>• Mantenimiento Naval/Tropas:</span>
                      <span>-{fmt(expenses.fleetUpkeep || 0)}/h</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/10 text-cyan-300 text-[10px]">
                    <span>Velocidad Monetaria (V):</span>
                    <span className="font-bold">{velocity}x {velocity > 1.5 ? '(Economía Boyante)' : '(Neutral)'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
