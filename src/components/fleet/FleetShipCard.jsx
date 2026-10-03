import React from 'react';
import { SafeImg } from '../../assets.jsx';
import { isVariantOutdated } from '../../utils/formulas/retrofitFormulas.js';
import { getShipStats } from '../../utils/formulas/combatFormulas.js';

/**
 * FleetShipCard — Tarjeta de nave amarrada en hangar, variantes y retrofitting.
 * Extraída de FleetInventorySection para mantener un componente limpio y desacoplado.
 */
export const FleetShipCard = React.memo(({
  id,
  qty,
  s,
  icon,
  name,
  currentVanguardStats,
  effectiveVariants = [],
  currentTech = {},
  state,
  currentPlanet,
  fmt,
  onOpenRetrofitModal
}) => {
  return (
    <div
      key={id}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e162e]/90 to-[#060914] hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all duration-300 select-none p-3 space-y-2.5"
    >
      {/* Imagen Superior con SafeImg */}
      <div className="relative w-full h-24 rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
        <SafeImg
          id={id}
          fallbackText={icon}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/80 border border-cyan-500/40 text-cyan-300 backdrop-blur-md">
          {qty} uds totales
        </span>
      </div>

      {/* Información Básica */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors" title={name}>
            {name}
          </h4>
          <span className="text-[10px] text-cyan-400 font-mono font-bold">
            {effectiveVariants.length} ver.
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-mono truncate">
          {s?.cat === 'civil' ? 'Unidad Civil' : 'Nave de Batalla'}
        </p>
      </div>

      {/* Desglose de Versiones / Variantes Tecnológicas en Hangar */}
      <div className="space-y-2 pt-1 border-t border-white/10">
        {effectiveVariants.map(v => {
          const isOutdated = isVariantOutdated(v.techSnapshot, currentTech, 'ship');
          const vStats = v.stats || getShipStats(id, v.techSnapshot || {}, state.blueprints, 'human', currentPlanet?.buildings || {}) || s;

          return (
            <div
              key={v.variantKey}
              className={`p-2 rounded-xl border font-mono text-[10px] space-y-1.5 ${
                isOutdated
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-cyan-950/20 border-cyan-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1">
                  <span className={isOutdated ? 'text-amber-400' : 'text-cyan-300'}>
                    Mk.{v.techGen || 1}
                  </span>
                  {isOutdated ? (
                    <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-black uppercase">
                      Obsoleta
                    </span>
                  ) : (
                    <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[8px] font-black uppercase">
                      Vanguardia
                    </span>
                  )}
                </span>
                <span className="text-white font-bold">{v.count} uds</span>
              </div>

              {/* Estadísticas de la versión */}
              <div className="grid grid-cols-4 gap-1 text-[8px] text-center">
                <div className="bg-black/50 rounded p-1">
                  <span className="text-slate-500 block">ATK</span>
                  <span className="text-red-300 font-bold">{vStats.atk?.toFixed?.(0) || vStats.atk}</span>
                </div>
                <div className="bg-black/50 rounded p-1">
                  <span className="text-slate-500 block">ESC</span>
                  <span className="text-cyan-300 font-bold">{vStats.shd?.toFixed?.(0) || vStats.shd}</span>
                </div>
                <div className="bg-black/50 rounded p-1">
                  <span className="text-slate-500 block">CASCO</span>
                  <span className="text-emerald-300 font-bold">{fmt(vStats.hull || 0)}</span>
                </div>
                <div className="bg-black/50 rounded p-1">
                  <span className="text-slate-500 block">CARGA</span>
                  <span className="text-amber-300 font-bold">{fmt(vStats.cargo || 0)}</span>
                </div>
              </div>

              {/* Botón de Modernización si es obsoleta */}
              {isOutdated && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenRetrofitModal(v, id, s, currentVanguardStats)}
                    className="w-full py-1.5 px-2 rounded-lg font-bold text-[9px] uppercase tracking-wider flex items-center justify-between transition cursor-pointer bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-sm font-black active:scale-98"
                    title={`Inspeccionar y modernizar ${v.count} unidades por lote`}
                  >
                    <span>🔧 Modernizar ({v.count})</span>
                    <span className="text-[8px] opacity-90">
                      Comparar ➔
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
