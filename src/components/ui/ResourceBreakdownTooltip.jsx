import React from 'react';
import { fmt } from '../../core.jsx';

/**
 * ResourceBreakdownTooltip — Telemetría de auditoría militar táctica.
 * Desglose exacto de extracción de minas, complejos industriales, gastos civiles,
 * multiplicadores tecnológicos, bioma, directivas y balance neto por hora.
 */
export const ResourceBreakdownTooltip = ({ resourceType, breakdown, currentAmount, prodVal, position = 'bottom' }) => {
  if (!breakdown) return null;

  const resMeta = {
    metal: { name: 'Metal Imperial', icon: '⛏️', color: 'text-amber-400', border: 'border-amber-500/40', glow: 'rgba(245,158,11,0.12)' },
    crystal: { name: 'Cristal Estelar', icon: '💎', color: 'text-cyan-400', border: 'border-cyan-500/40', glow: 'rgba(6,182,212,0.12)' },
    deuterium: { name: 'Deuterio Cuántico', icon: '⚗️', color: 'text-emerald-400', border: 'border-emerald-500/40', glow: 'rgba(16,185,129,0.12)' },
    slag: { name: 'Escoria Industrial', icon: '🪨', color: 'text-orange-400', border: 'border-orange-500/40', glow: 'rgba(249,115,22,0.15)' },
    energy: { name: 'Red de Energía', icon: '⚡', color: 'text-yellow-400', border: 'border-yellow-500/40', glow: 'rgba(234,179,8,0.12)' }
  }[resourceType] || { name: 'Recurso', icon: '📦', color: 'text-white', border: 'border-white/20', glow: 'rgba(255,255,255,0.05)' };

  const b = breakdown[resourceType];
  if (!b) return null;

  // Extracción real de la mina y de la industria tras multiplicadores
  const mineExtracted = b.mineTotal !== undefined ? b.mineTotal : (b.total !== undefined && b.industryTotal !== undefined ? Math.max(0, b.total - b.industryTotal) : b.baseMine || 0);
  const industryExtracted = b.industryTotal !== undefined ? b.industryTotal : (b.industry || 0);
  const popExpense = b.popConsumption || 0;
  const fusionExpense = resourceType === 'deuterium' ? (b.fusionDeduction || 0) : 0;
  const grossProduction = b.total !== undefined ? b.total : (mineExtracted + industryExtracted);
  const netProduction = b.netTotal !== undefined ? b.netTotal : Math.max(0, grossProduction - popExpense);

  const posClasses = position === 'top'
    ? 'bottom-full mb-3'
    : 'top-full mt-2';

  // Si position es 'top-left' o 'top-right' o default
  const alignClass = position === 'top-right'
    ? 'right-0'
    : (position === 'top-left' ? 'left-0' : (position === 'top' ? 'left-1/2 -translate-x-1/2' : 'left-0'));

  return (
    <div
      className={`absolute ${posClasses} ${alignClass} w-[420px] max-w-[85vw] max-h-[80vh] overflow-y-auto bg-[#050814]/95 border border-cyan-500/50 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,1),0_0_30px_rgba(6,182,212,0.22)] z-[200] text-left font-mono text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-150 ue-hud-grid backdrop-blur-xl`}
      style={{ boxShadow: `0 20px 50px rgba(0,0,0,1), 0 0 30px ${resMeta.glow}` }}
    >
      {/* Cabecera táctica militar */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-2.5">
        <div className="flex items-center gap-2 font-bold text-white">
          <span className="text-xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{resMeta.icon}</span>
          <span className={`${resMeta.color} uppercase tracking-wider font-black text-sm`}>{resMeta.name}</span>
        </div>
        <div className="text-[10px] px-2.5 py-0.5 rounded-lg bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 uppercase tracking-widest font-black flex items-center gap-1.5 shadow-md">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>AUDITORÍA SUPREMA</span>
        </div>
      </div>

      {/* RECURSO ESCORIA */}
      {resourceType === 'slag' && (
        <div className="space-y-2.5">
          <div>
            <div className="text-[10px] text-orange-400 uppercase tracking-widest font-black mb-1.5 flex items-center justify-between">
              <span>Generación de Residuos:</span>
              <span className="text-slate-400 text-[9px] font-mono">minas e industria pesada</span>
            </div>
            <div className="space-y-1.5 bg-black/50 rounded-xl p-2.5 border border-white/10 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5"><span>⛏️</span><span>Minas de Metal y Cristal:</span></span>
                <span className="font-bold text-amber-400">+{fmt((b.details?.slagFromMetalMine || 0) + (b.details?.slagFromCrystalMine || 0))}/h</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5"><span>🏭</span><span>Complejos Industriales y Refinerías:</span></span>
                <span className="font-bold text-amber-400">+{fmt(b.details?.slagFromIndustry || 0)}/h</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-white/10 text-orange-300 font-bold">
                <span>Generación Bruta Total:</span>
                <span>+{fmt(b.generation || 0)}/h</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-black mb-1.5 flex items-center justify-between">
              <span>Reciclaje y Economía Circular:</span>
              <span className="text-slate-400 text-[9px] font-mono">revalorización de escombros</span>
            </div>
            <div className="space-y-1.5 bg-emerald-950/20 rounded-xl p-2.5 border border-emerald-500/30 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5"><span>♻️</span><span>Capacidad Máxima de Plantas:</span></span>
                <span className="font-bold text-cyan-300">{fmt(b.maxRecycleCap || 0)}/h</span>
              </div>
              <div className="flex justify-between text-emerald-300 font-bold">
                <span className="flex items-center gap-1.5"><span>⚙️</span><span>Escoria Procesada Efectiva:</span></span>
                <span className="text-emerald-400">-{fmt(b.recycleRate || 0)}/h</span>
              </div>
              <div className="flex justify-between text-slate-200 pt-1.5 border-t border-emerald-500/25">
                <span className="flex items-center gap-1.5"><span>⛏️</span><span>Metal Revalorizado (70%):</span></span>
                <span className="font-bold text-amber-400">+{fmt(b.recycledMetal || 0)}/h</span>
              </div>
              <div className="flex justify-between text-slate-200">
                <span className="flex items-center gap-1.5"><span>💎</span><span>Cristal Revalorizado (25%):</span></span>
                <span className="font-bold text-cyan-400">+{fmt(b.recycledCrystal || 0)}/h</span>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent my-1.5" />

          <div className="flex justify-between items-center bg-orange-950/30 p-2.5 rounded-xl border border-orange-500/40">
            <span className="font-bold text-white text-xs">Acumulación Neta en Almacén:</span>
            <span className={`font-black text-sm tracking-tight ${(b.total || 0) <= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {(b.total || 0) > 0 ? `+${fmt(b.total)}/h` : `${fmt(b.total || 0)}/h`}
            </span>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
            <span>Índice de Ecosostenibilidad:</span>
            <span className={`font-bold px-2 py-0.5 rounded-lg border ${(b.ecoSustainability || 0) >= 100 ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-orange-500/20 border-orange-500/40 text-orange-300'}`}>
              {b.ecoSustainability || 0}%
            </span>
          </div>

          {currentAmount !== undefined && (
            <div className="flex justify-between text-[11px] text-slate-400 px-1 pt-1.5 border-t border-white/5">
              <span>Escoria acumulada en silos:</span>
              <span className="font-bold text-slate-200">{fmt(currentAmount)} ton</span>
            </div>
          )}
        </div>
      )}

      {resourceType !== 'energy' && resourceType !== 'slag' && (
        <div className="space-y-2.5">
          {/* SECCIÓN 1: SUMINISTRO Y EXTRACCIÓN BRUTA */}
          <div>
            <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-black mb-1.5 flex items-center justify-between">
              <span>Suministro y Extracción:</span>
              <span className="text-slate-400 text-[9px] lowercase font-normal">bruto horario</span>
            </div>

            <div className="space-y-1.5 bg-black/50 rounded-xl p-2.5 border border-white/10 text-xs">
              {/* Mina Principal */}
              <div className="flex justify-between items-center text-slate-200">
                <span className="flex items-center gap-1.5">
                  <span>⛏️</span>
                  <span>Mina Principal:</span>
                </span>
                <div className="text-right">
                  <span className="font-bold text-emerald-400">+{fmt(mineExtracted)}/h</span>
                  {b.baseMine > 0 && b.baseMine !== mineExtracted && (
                    <span className="text-[10px] text-slate-400 ml-1.5 block sm:inline font-mono">
                      (Base: {fmt(b.baseMine)})
                    </span>
                  )}
                </div>
              </div>

              {/* Desglose Extremo de Complejos Industriales Edificio por Edificio */}
              {industryExtracted > 0 && (
                <div className="pt-1.5 border-t border-white/5 space-y-1">
                  <div className="flex justify-between items-center text-slate-300 font-bold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span>🏭</span>
                      <span>Complejos Industriales (Total):</span>
                    </span>
                    <span className="text-emerald-400">+{fmt(industryExtracted)}/h</span>
                  </div>

                  {/* Sub-desglose detallado si está disponible */}
                  {b.industryItems && (
                    <div className="pl-5 space-y-0.5 text-[10px] text-slate-400 font-mono">
                      {b.industryItems.refinery > 0 && (
                        <div className="flex justify-between">
                          <span>· Refinería Metalúrgica:</span>
                          <span className="text-emerald-300 font-bold">+{fmt(b.industryItems.refinery)}/h</span>
                        </div>
                      )}
                      {b.industryItems.vacuumForge > 0 && (
                        <div className="flex justify-between">
                          <span>· Fragua de Vacío:</span>
                          <span className="text-emerald-300 font-bold">+{fmt(b.industryItems.vacuumForge)}/h</span>
                        </div>
                      )}
                      {b.industryItems.automatedMine > 0 && (
                        <div className="flex justify-between">
                          <span>· Complejo Minero Automatizado:</span>
                          <span className="text-emerald-300 font-bold">+{fmt(b.industryItems.automatedMine)}/h</span>
                        </div>
                      )}
                      {b.industryItems.spaceElevator > 0 && (
                        <div className="flex justify-between">
                          <span>· Ascensor Espacial:</span>
                          <span className="text-emerald-300 font-bold">+{fmt(b.industryItems.spaceElevator)}/h</span>
                        </div>
                      )}
                      {b.industryItems.chemPlant > 0 && (
                        <div className="flex justify-between">
                          <span>· Planta Química Estelar:</span>
                          <span className="text-emerald-300 font-bold">+{fmt(b.industryItems.chemPlant)}/h</span>
                        </div>
                      )}
                      {b.industryItems.siliconPurifier > 0 && (
                        <div className="flex justify-between">
                          <span>· Purificador de Silicio:</span>
                          <span className="text-emerald-300 font-bold">+{fmt(b.industryItems.siliconPurifier)}/h</span>
                        </div>
                      )}
                      {b.industryItems.synthPlant > 0 && (
                        <div className="flex justify-between">
                          <span>· Planta de Síntesis Molecular:</span>
                          <span className="text-emerald-300 font-bold">+{fmt(b.industryItems.synthPlant)}/h</span>
                        </div>
                      )}
                      {b.industryItems.enrichPlant > 0 && (
                        <div className="flex justify-between">
                          <span>· Enriquecedora de Isótopos:</span>
                          <span className="text-emerald-300 font-bold">+{fmt(b.industryItems.enrichPlant)}/h</span>
                        </div>
                      )}
                      {b.industryItems.heliumExtractor > 0 && (
                        <div className="flex justify-between">
                          <span>· Extractor de Helio-3:</span>
                          <span className="text-emerald-300 font-bold">+{fmt(b.industryItems.heliumExtractor)}/h</span>
                        </div>
                      )}
                      {b.industryItems.catalyticDeut > 0 && (
                        <div className="flex justify-between">
                          <span>· Condensador Catalítico Cuántico:</span>
                          <span className="text-emerald-300 font-bold">+{fmt(b.industryItems.catalyticDeut)}/h</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Aporte de Reciclaje de Escoria Revalorizada */}
              {b.recycledSlagBonus > 0 && (
                <div className="flex justify-between items-center text-slate-200 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1.5">
                    <span>♻️</span>
                    <span>Reciclaje de Escoria Revalorizada ({resourceType === 'metal' ? '70%' : '25%'}):</span>
                  </span>
                  <span className="font-bold text-cyan-300">+{fmt(b.recycledSlagBonus)}/h</span>
                </div>
              )}

              {/* Escoria Asociada Generada en la Extracción de este Recurso */}
              {b.slagGenerated > 0 && (
                <div className="flex justify-between items-center text-orange-300/90 pt-1 border-t border-orange-500/20 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span>🪨</span>
                    <span>Escoria Industrial Generada en el Proceso:</span>
                  </span>
                  <span className="font-bold text-orange-400">+{fmt(b.slagGenerated)} ton/h</span>
                </div>
              )}

              {/* Total Bruto Generado */}
              <div className="flex justify-between items-center pt-1.5 border-t border-white/10 text-xs font-semibold text-slate-300">
                <span>Generación Bruta Total:</span>
                <span className="text-cyan-300 font-bold">+{fmt(grossProduction)}/h</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: GASTOS Y DEDUCCIONES IMPERIALES */}
          {(popExpense > 0 || fusionExpense > 0) && (
            <div>
              <div className="text-[10px] text-rose-400 uppercase tracking-widest font-black mb-1.5 flex items-center justify-between">
                <span>Deducciones y Gastos Continuos:</span>
                <span className="text-slate-400 text-[9px] lowercase font-normal">consumo obligatorio</span>
              </div>

              <div className="space-y-1.5 bg-rose-950/20 rounded-xl p-2.5 border border-rose-500/30 text-rose-300 text-xs">
                {popExpense > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <span>👥</span>
                      <span>Manutención Población Civil:</span>
                    </span>
                    <span className="font-bold text-rose-400">-{fmt(popExpense)}/h</span>
                  </div>
                )}

                {fusionExpense > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <span>⚛️</span>
                      <span>Inyección en Reactor de Fusión:</span>
                    </span>
                    <span className="font-bold text-rose-400">-{fmt(fusionExpense)}/h</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN 3: MULTIPLICADORES ACTIVOS EN SUPERFICIE */}
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">
              Moduladores y Multiplicadores:
            </div>

            <div className="grid grid-cols-2 gap-1.5 bg-black/40 rounded-xl p-2.5 border border-white/5 text-[11px]">
              <div className="flex justify-between text-slate-300 pr-1">
                <span>🧬 I+D y Plasma:</span>
                <span className="text-cyan-300 font-bold">x{(b.techMult || 1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300 pl-1">
                <span>🪐 Bioma y Gravedad:</span>
                <span className="text-cyan-300 font-bold">x{(b.biomeMult || 1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300 pr-1">
                <span>🏛️ Ministros y Leyes:</span>
                <span className="text-cyan-300 font-bold">x{(b.govMult || 1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300 pl-1">
                <span>🏙️ Distritos Civiles:</span>
                <span className="text-cyan-300 font-bold">x{(b.civMult || 1).toFixed(2)}</span>
              </div>
              {b.specMult !== undefined && b.specMult !== 1 && (
                <div className="flex justify-between text-slate-300 pr-1 col-span-2 pt-1 border-t border-white/5">
                  <span>🪐 Especialización Planetaria:</span>
                  <span className="text-cyan-300 font-bold">x{(b.specMult).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* ALERTA DE DÉFICIT ENERGÉTICO */}
          {b.ratio < 1 && (
            <div className="flex justify-between items-center text-rose-400 font-bold bg-rose-950/50 p-2.5 rounded-xl border border-rose-500/50 text-xs animate-pulse">
              <span className="flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Déficit Energético en Red:</span>
              </span>
              <span>{Math.round(b.ratio * 100)}% operativo</span>
            </div>
          )}

          <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent my-1.5" />

          {/* BALANCE FINAL NETO */}
          <div className="flex justify-between items-center bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/40 shadow-lg">
            <span className="font-bold text-white text-xs">Producción Neta Real:</span>
            <span className="text-emerald-400 font-black text-sm tracking-tight">
              +{fmt(netProduction)}/h
            </span>
          </div>

          {currentAmount !== undefined && (
            <div className="flex justify-between text-[11px] text-slate-400 px-1 pt-1 border-t border-white/5">
              <span>Almacén disponible:</span>
              <span className="font-bold text-slate-200">{fmt(currentAmount)}</span>
            </div>
          )}
        </div>
      )}

      {/* RECURSO ENERGÍA */}
      {resourceType === 'energy' && (
        <div className="space-y-2">
          <div>
            <div className="text-[9px] text-yellow-400/90 uppercase tracking-widest font-black mb-1">
              Fuentes de Generación:
            </div>
            <div className="space-y-1 bg-black/40 rounded-lg p-2 border border-white/5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>☀️ Plantas Solares:</span>
                <span className="font-bold text-emerald-400">+{fmt(b.solar)}/h</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>⚛️ Reactores de Fusión:</span>
                <span className="font-bold text-emerald-400">+{fmt(b.fusion)}/h</span>
              </div>
              {b.others > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>⚡ Centrales Geotérmicas y Especiales:</span>
                  <span className="font-bold text-emerald-400">+{fmt(b.others)}/h</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-white/10 text-cyan-300 font-bold">
                <span>Generación Total:</span>
                <span>+{fmt(b.totalProd)}/h</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[9px] text-rose-400/90 uppercase tracking-widest font-black mb-1">
              Cargas y Consumo:
            </div>
            <div className="space-y-1 bg-rose-950/20 rounded-lg p-2 border border-rose-500/20 text-[11px]">
              <div className="flex justify-between text-rose-300 font-bold">
                <span>🔌 Demanda de Instalaciones:</span>
                <span className="text-rose-400">-{fmt(b.totalCons)}/h</span>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent my-1.5" />

          <div className="flex justify-between items-center bg-cyan-950/30 p-2 rounded-lg border border-cyan-500/30">
            <span className="font-bold text-white text-xs">Balance de Energía:</span>
            <span className={`font-black text-sm tracking-tight ${b.totalProd >= b.totalCons ? 'text-yellow-400' : 'text-rose-400'}`}>
              {b.totalProd >= b.totalCons ? '+' : ''}{fmt(b.totalProd - b.totalCons)}/h
            </span>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 px-1">
            <span>Factor de Cobertura:</span>
            <span className="font-bold text-slate-200">
              {b.totalCons > 0 ? `${((b.totalProd / b.totalCons) * 100).toFixed(1)}%` : '100%'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
