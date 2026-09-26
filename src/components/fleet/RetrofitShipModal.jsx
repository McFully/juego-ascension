import React, { useState } from 'react';
import { SafeImg } from '../../assets.jsx';
import { canAfford } from '../../core.jsx';
import { calculateRetrofitUnitCost, calculateRetrofitUnitTime, calculateTechGeneration } from '../../utils/formulas/retrofitFormulas.js';
import { getShipStats } from '../../utils/formulas/combatFormulas.js';
import { GAME_SPEED } from '../../data/gameData.js';

/**
 * RetrofitShipModal — Modal táctico interactivo de modernización de flotas.
 * Presenta comparación directa de atributos (Actual vs Vanguardia), diferencias resaltadas,
 * selector dinámico de lotes y desglose de costes/tiempos proporcionales.
 */
export const RetrofitShipModal = ({
  isOpen,
  onClose,
  variant,
  shipId,
  shipInfo,
  currentPlanet,
  currentTech,
  currentVanguardStats,
  dispatch,
  fmt,
  fmtTime
}) => {
  if (!isOpen || !variant) return null;

  const totalAvailable = variant.count || 0;
  const [selectedQty, setSelectedQty] = useState(totalAvailable);

  const calculatedBase = getShipStats(shipId, variant.techSnapshot || {}, null, 'human', currentPlanet?.buildings || {}) || shipInfo || {};
  const calculatedTarget = getShipStats(shipId, currentTech || {}, null, 'human', currentPlanet?.buildings || {}) || currentVanguardStats || shipInfo || {};

  // Si la variante tiene stats cacheados pero no concuerdan con su tecnología o es legacy, asegurar stats reales calculados
  const baseStats = (variant.techSnapshot && Object.keys(variant.techSnapshot).length > 0 && variant.stats)
    ? variant.stats
    : calculatedBase;
  const targetStats = calculatedTarget || currentVanguardStats;

  // Calcular costes y tiempos unitarios según desfase tecnológico
  const unitCost = calculateRetrofitUnitCost(shipId, variant.techSnapshot, currentTech, 'ship');
  const unitTime = calculateRetrofitUnitTime(
    shipId,
    variant.techSnapshot,
    currentTech,
    currentPlanet.buildings?.shipyard || 1,
    currentPlanet.buildings?.naniteFactory || 0,
    GAME_SPEED,
    'ship'
  );

  const safeQty = Math.max(1, Math.min(totalAvailable, Number(selectedQty) || 1));

  const totalCost = {
    metal: unitCost.metal * safeQty,
    crystal: unitCost.crystal * safeQty,
    deuterium: unitCost.deuterium * safeQty
  };
  const totalTimeSeconds = Math.max(5, Math.floor(unitTime * safeQty));

  const resources = currentPlanet.resources || {};
  const affordable = canAfford(resources, totalCost);

  const currentGen = variant.techGen || calculateTechGeneration(variant.techSnapshot || {});
  const targetGen = calculateTechGeneration(currentTech);

  // Atributos clave a comparar
  const statRows = [
    {
      key: 'atk',
      label: 'Potencia de Fuego (ATK)',
      icon: '💥',
      current: baseStats.atk || 0,
      target: targetStats.atk || 0,
      format: (val) => Number(val).toFixed(0)
    },
    {
      key: 'shd',
      label: 'Escudos Deflectores (ESC)',
      icon: '🛡️',
      current: baseStats.shd || 0,
      target: targetStats.shd || 0,
      format: (val) => Number(val).toFixed(0)
    },
    {
      key: 'hull',
      label: 'Integridad Estructural (CASCO)',
      icon: '⚙️',
      current: baseStats.hull || 0,
      target: targetStats.hull || 0,
      format: (val) => fmt(Math.round(val))
    },
    {
      key: 'cargo',
      label: 'Capacidad de Carga',
      icon: '📦',
      current: baseStats.cargo || 0,
      target: targetStats.cargo || 0,
      format: (val) => fmt(Math.round(val))
    },
    {
      key: 'speed',
      label: 'Velocidad de Crucero',
      icon: '⚡',
      current: baseStats.speed || 0,
      target: targetStats.speed || 0,
      format: (val) => fmt(Math.round(val))
    }
  ];

  const handleConfirm = () => {
    if (!affordable || safeQty <= 0) return;
    if (dispatch) {
      dispatch({
        type: 'RETROFIT_SHIP_VARIANT',
        variantKey: variant.variantKey,
        count: safeQty
      });
      if (window.playSfx) window.playSfx('click');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0c142c] via-[#070b18] to-[#04060d] border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh] overflow-hidden select-none">
        
        {/* CABECERA */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-black/60 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <SafeImg id={shipId} fallbackText="🚀" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  Modernización: {shipInfo?.name || shipId}
                </h3>
              </div>
              <p className="text-xs font-mono text-cyan-400">
                Adaptación tecnológica de chasis a las especificaciones de vanguardia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* CONTENIDO CON SCROLL */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar">

          {/* GENERACIÓN: DESDE -> HASTA */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10 text-center font-mono">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Versión en Dársena</span>
              <span className="text-sm sm:text-base font-black text-amber-400 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 inline-block">
                Mk.{currentGen}
              </span>
              <div className="text-[10px] text-slate-500">
                {fmt(totalAvailable)} naves en este lote
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider block">Especificación Objetivo</span>
              <span className="text-sm sm:text-base font-black text-cyan-300 px-2.5 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-400/50 inline-block shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                Mk.{targetGen} (Vanguardia)
              </span>
              <div className="text-[10px] text-cyan-400/70">
                +{(targetGen - currentGen)} saltos tecnológicos
              </div>
            </div>
          </div>

          {/* COMPARATIVA DETALLADA DE PRESTACIONES */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
              <span>📊</span>
              <span>Comparativa de Rendimiento y Prestaciones</span>
            </h4>

            <div className="divide-y divide-white/5 rounded-2xl bg-slate-950/60 border border-white/10 overflow-hidden font-mono text-xs">
              {statRows.map(row => {
                const diff = (row.target || 0) - (row.current || 0);
                const isImproved = diff > 0.001;
                const isSame = Math.abs(diff) < 0.001;

                return (
                  <div key={row.key} className="p-2.5 sm:p-3 flex items-center justify-between gap-2 hover:bg-white/[0.02] transition">
                    <div className="flex items-center gap-2 text-slate-300 shrink-0">
                      <span className="text-sm">{row.icon}</span>
                      <span className="font-semibold text-[11px] sm:text-xs">{row.label}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] sm:text-xs">
                      {/* Actual */}
                      <span className="text-slate-400">
                        {row.format(row.current)}
                      </span>

                      <span className="text-slate-600">➔</span>

                      {/* Objetivo */}
                      <span className="font-bold text-white">
                        {row.format(row.target)}
                      </span>

                      {/* Diferencia */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black min-w-[55px] text-center ${
                        isImproved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isSame
                            ? 'bg-white/5 text-slate-400 border border-white/10'
                            : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {isImproved ? `+${row.format(diff)}` : isSame ? '=' : row.format(diff)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SELECTOR DE CANTIDAD POR LOTES */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold uppercase tracking-wider">
                📦 Unidades a Modernizar en este Lote:
              </span>
              <span className="text-amber-300 font-black">
                {fmt(safeQty)} / {fmt(totalAvailable)} naves
              </span>
            </div>

            {/* Slider de cantidad */}
            <input
              type="range"
              min="1"
              max={totalAvailable}
              value={safeQty}
              onChange={(e) => setSelectedQty(Math.max(1, Math.min(totalAvailable, parseInt(e.target.value) || 1)))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />

            {/* Botones de selección rápida y campo numérico manual */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { label: '1 ud', val: 1 },
                { label: '5 uds', val: 5 },
                { label: '10 uds', val: 10 },
                { label: '25%', val: Math.max(1, Math.floor(totalAvailable * 0.25)) },
                { label: '50%', val: Math.max(1, Math.floor(totalAvailable * 0.5)) },
                { label: '100% (Todo)', val: totalAvailable }
              ].map(btn => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => setSelectedQty(Math.min(totalAvailable, btn.val))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    safeQty === Math.min(totalAvailable, btn.val)
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {btn.label}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 text-[10px]">Manual:</span>
                <input
                  type="number"
                  min="1"
                  max={totalAvailable}
                  value={selectedQty}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    setSelectedQty(isNaN(parsed) ? '' : Math.max(1, Math.min(totalAvailable, parsed)));
                  }}
                  className="w-20 px-2 py-1 bg-black/60 border border-white/20 rounded-lg text-white font-mono text-center text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* DESGLOSE DE COSTES Y TIEMPO */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold uppercase tracking-wider text-[11px] text-cyan-300">
                Presupuesto y Plazos del Lote ({fmt(safeQty)} uds)
              </span>
              <span className="text-[10px] text-slate-400">
                ⏱ {fmtTime(unitTime)} / ud
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
              <div className={`p-2 rounded-xl border ${
                (resources.metal || 0) >= totalCost.metal
                  ? 'bg-black/40 border-white/10 text-slate-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <span className="text-[10px] text-slate-400 block">Metal</span>
                <span className="font-bold">{fmt(totalCost.metal)}</span>
                <span className="text-[9px] block text-slate-500 font-mono mt-0.5">
                  ({fmt(resources.metal || 0)})
                </span>
              </div>

              <div className={`p-2 rounded-xl border ${
                (resources.crystal || 0) >= totalCost.crystal
                  ? 'bg-black/40 border-white/10 text-slate-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <span className="text-[10px] text-slate-400 block">Cristal</span>
                <span className="font-bold">{fmt(totalCost.crystal)}</span>
                <span className="text-[9px] block text-slate-500 font-mono mt-0.5">
                  ({fmt(resources.crystal || 0)})
                </span>
              </div>

              <div className={`p-2 rounded-xl border ${
                (resources.deuterium || 0) >= totalCost.deuterium
                  ? 'bg-black/40 border-white/10 text-slate-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <span className="text-[10px] text-slate-400 block">Deuterio</span>
                <span className="font-bold">{fmt(totalCost.deuterium)}</span>
                <span className="text-[9px] block text-slate-500 font-mono mt-0.5">
                  ({fmt(resources.deuterium || 0)})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>⏱</span>
                <span>Tiempo de Modernización Total:</span>
              </span>
              <span className="font-bold text-cyan-300">
                {fmtTime(totalTimeSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* PIE / BOTÓN DE ACCIÓN */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-xs font-mono font-bold transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!affordable || safeQty <= 0}
            className={`flex-1 py-3 px-5 rounded-2xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              affordable && safeQty > 0
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] active:scale-98'
                : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <span>🔧</span>
            <span>
              {affordable
                ? `Iniciar Modernización (${fmt(safeQty)} uds)`
                : 'Recursos Insuficientes para el Lote'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
