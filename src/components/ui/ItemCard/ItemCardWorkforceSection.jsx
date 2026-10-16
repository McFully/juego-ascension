import React from 'react';
import { fmt } from '../../../core.jsx';
import {
  calcBuildingOperatingExpenses,
  calcResearchOperatingExpenses
} from '../../../utils/formulas/operatingExpensesFormulas.js';

/**
 * ItemCardWorkforceSection — BLOQUE 2: Censo, Mantenimiento y Salarios
 * Muestra operarios/científicos requeridos y el desglose de costes operativos en créditos/h y créditos/día.
 */
export const ItemCardWorkforceSection = React.memo(({
  id,
  level = 0,
  isResearch = false,
  lackOfPop = false,
  extra = null
}) => {
  const nextLevel = (level || 0) + 1;
  const expenses = isResearch
    ? calcResearchOperatingExpenses(id, nextLevel)
    : calcBuildingOperatingExpenses(id, nextLevel);

  const lines = extra ? String(extra).split(' | ') : [];
  const popLine = lines.find(l => l.includes('Población:'));
  const otherLines = lines.filter(l => !l.includes('Población:'));
  const popText = popLine ? popLine.replace(/👥\s*Población:\s*/, '') : null;

  const staffLabel = isResearch ? 'Científicos Requeridos' : 'Censo Requerido';
  const staffIcon = isResearch ? '🔬' : '👥';
  const staffValue = isResearch ? expenses.requiredScientists : expenses.requiredStaff;

  return (
    <div className="flex flex-col gap-1 mb-2 text-[10px] font-mono">
      {/* 1. Dotación de Personal / Colonos */}
      <div className={`p-1.5 px-2 rounded-xl border leading-tight flex items-center justify-between ${
        lackOfPop
          ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          : 'bg-[#05070f]/60 border-white/5 text-slate-300'
      }`}>
        <span className="font-bold flex items-center gap-1.5 text-slate-400">
          <span>{staffIcon}</span>
          <span className="text-[9px] uppercase tracking-wider">{staffLabel}:</span>
        </span>
        <span className={`font-bold ${lackOfPop ? 'text-rose-300' : 'text-emerald-300'}`}>
          {popText || (staffValue > 0 ? `${fmt(staffValue)} pers.` : 'Automatizado')}
        </span>
      </div>

      {/* 2. Mantenimiento y Salarios en Créditos (cr/h y cr/día) */}
      <div className="p-1.5 px-2 rounded-xl bg-[#030611]/70 border border-amber-500/15 space-y-0.5">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1 text-[9px] text-amber-300/80 uppercase">
            <span>🏛️</span> Mantenimiento:
          </span>
          <span className="text-amber-200 font-bold">
            {fmt(expenses.maintenanceCreditsHour)} cr/h <span className="text-slate-500 text-[8px]">({fmt(expenses.maintenanceCreditsDay)}/d)</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400 border-t border-white/5 pt-0.5">
          <span className="flex items-center gap-1 text-[9px] text-cyan-300/80 uppercase">
            <span>💼</span> Salarios Plantilla:
          </span>
          <span className="text-cyan-200 font-bold">
            {fmt(expenses.salariesCreditsHour)} cr/h <span className="text-slate-500 text-[8px]">({fmt(expenses.salariesCreditsDay)}/d)</span>
          </span>
        </div>
      </div>

      {otherLines.length > 0 && (
        <div className="text-[9px] text-slate-400 px-1 truncate">
          {otherLines.join(' | ')}
        </div>
      )}
    </div>
  );
});
