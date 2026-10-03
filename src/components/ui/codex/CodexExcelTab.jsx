import React from 'react';
import { fmt } from '../../../core.jsx';

export const CodexExcelTab = React.memo(({ kpiMetrics, progressionRows, isBuilding, isResearch, currentLvl }) => {
  return (
    <div className="space-y-6">
      {/* Bloque de 12 Tarjetas KPI en Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 font-mono">
        {kpiMetrics.map((kpi, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>{kpi.label}</span>
              <span>{kpi.icon}</span>
            </div>
            <div className={`text-xs font-black ${kpi.color} truncate`}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Macro-Tabla Tipo Hoja de Cálculo Excel con Proyecciones de Niveles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold text-sm">📋 PROYECCIÓN FINANCIERA Y TÉCNICA MULTINIVEL</span>
            <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">Valores computados con bonificaciones activas</span>
          </div>
          <span className="text-[11px] text-amber-300 font-bold">10 Escalones de Evolución</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,0,0,0.6)] bg-[#040713]">
          <table className="w-full text-left font-mono text-[11px] border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#0b142c] text-cyan-300 border-b border-cyan-500/30 font-black uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 border-r border-white/10">Escalón</th>
                <th className="py-2.5 px-3 border-r border-white/10 text-amber-400">⛏️ Metal</th>
                <th className="py-2.5 px-3 border-r border-white/10 text-cyan-300">💎 Cristal</th>
                <th className="py-2.5 px-3 border-r border-white/10 text-emerald-300">⚗️ Deuterio</th>
                <th className="py-2.5 px-3 border-r border-white/10 text-purple-300">💰 Inversión Total</th>
                <th className="py-2.5 px-3 border-r border-white/10 text-slate-200">⏱️ Tiempo</th>
                <th className="py-2.5 px-3 border-r border-white/10 text-yellow-300">⚡ Energía</th>
                <th className="py-2.5 px-3 border-r border-white/10 text-emerald-400">📈 Rendimiento</th>
                <th className="py-2.5 px-3 border-r border-white/10 text-blue-300">🛡️ Estructura</th>
                <th className="py-2.5 px-3 border-r border-white/10 text-teal-300">🔄 Retorno / Carga</th>
                <th className="py-2.5 px-3 text-slate-400">Eficiencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {progressionRows.map((row, rIdx) => {
                const isCurrent = (isBuilding || isResearch) ? (currentLvl === rIdx + 1) : false;
                return (
                  <tr
                    key={rIdx}
                    className={`transition-colors hover:bg-cyan-950/40 ${
                      isCurrent ? 'bg-cyan-500/15 font-bold border-l-4 border-cyan-400' : rIdx % 2 === 0 ? 'bg-black/30' : 'bg-transparent'
                    }`}
                  >
                    <td className="py-2 px-3 border-r border-white/5 font-black text-white flex items-center gap-1.5">
                      {isCurrent && <span className="text-cyan-400">▶</span>}
                      <span>{row.stepLabel}</span>
                    </td>
                    <td className="py-2 px-3 border-r border-white/5 text-amber-300 font-bold">{fmt(row.metalCost)}</td>
                    <td className="py-2 px-3 border-r border-white/5 text-cyan-300 font-bold">{fmt(row.crystalCost)}</td>
                    <td className="py-2 px-3 border-r border-white/5 text-emerald-300 font-bold">{fmt(row.deutCost)}</td>
                    <td className="py-2 px-3 border-r border-white/5 text-purple-300 font-bold">{fmt(row.totalInvestment)}</td>
                    <td className="py-2 px-3 border-r border-white/5 text-slate-300">{row.effectiveTime}</td>
                    <td className="py-2 px-3 border-r border-white/5 font-bold">{row.energyDelta}</td>
                    <td className="py-2 px-3 border-r border-white/5 text-emerald-400 font-black">{row.primaryOutput}</td>
                    <td className="py-2 px-3 border-r border-white/5 text-slate-300">{row.structureHP}</td>
                    <td className="py-2 px-3 border-r border-white/5 text-teal-300">{row.roi}</td>
                    <td className="py-2 px-3 text-slate-400">{row.efficiency}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel de Recomendaciones y Proyecciones Tácticas */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
        <span className="text-xl shrink-0">💡</span>
        <div className="space-y-1 font-mono">
          <div className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
            Directriz Estratégica del Alto Mando:
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Mantener una relación constante entre el consumo energético y el suministro de almacenamiento. Los incrementos de nivel superiores a 15 se benefician en un 40% de la aceleración aportada por el <strong className="text-white">Centro de Construcción</strong> y la <strong className="text-white">Fábrica de Nanobots</strong> local.
          </p>
        </div>
      </div>
    </div>
  );
});
