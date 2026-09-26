import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SafeImg } from '../../assets.jsx';

/**
 * PlanetarySenateModal — Cabildo y Senado Planetario Autónomo.
 * Permite a cada planeta gestionar sus asambleas locales, edictos tributarios,
 * satisfacción colonial y el nombramiento de procuradores a la Cámara Alta Imperial.
 */
export const PlanetarySenateModal = ({
  isOpen,
  onClose,
  planet,
  state,
  dispatch,
  fmt
}) => {
  if (!isOpen || !planet) return null;

  const population = planet.population || 1000;
  const senateSeats = Math.max(1, Math.floor(population / 10000) + 1);
  const taxRate = planet.taxRate ?? 0.10;
  const localMorale = planet.morale ?? 85;
  const localDirectives = planet.localDirectives || {};

  const handleSetTax = (newRate) => {
    if (window.playSfx) window.playSfx('click');
    dispatch({
      type: 'SET_PLANET_TAX_RATE',
      planetId: planet.id,
      taxRate: Math.max(0, Math.min(0.5, newRate))
    });
  };

  const handleToggleDirective = (dirKey) => {
    if (window.playSfx) window.playSfx('build');
    dispatch({
      type: 'TOGGLE_PLANET_LOCAL_DIRECTIVE',
      planetId: planet.id,
      directive: dirKey
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#070b1a] border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden"
        >
          {/* Cabecera del Cabildo Planetario */}
          <div className="relative px-6 py-5 border-b border-white/10 bg-gradient-to-r from-[#0d1633] via-[#091129] to-[#070b1a] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    Asamblea Provincial Autónoma
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {planet.name} • Bioma {planet.biome || 'Terráqueo'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  Senado Planetario de {planet.name}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center text-lg transition-all"
            >
              ✕
            </button>
          </div>

          {/* Cuerpo Desplazable con Cuadrícula de Tarjetas Grandes */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            {/* Resumen Superior */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#0b132b]/80 border border-white/10">
                <span className="text-[11px] font-mono uppercase text-slate-400 block">Censo Colonial</span>
                <span className="text-lg font-black text-white font-mono">{fmt ? fmt(population) : population} hab.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0b132b]/80 border border-cyan-500/30">
                <span className="text-[11px] font-mono uppercase text-cyan-400 block">Escaños al Senado Imperial</span>
                <span className="text-lg font-black text-cyan-300 font-mono">{senateSeats} Procuradores</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0b132b]/80 border border-white/10">
                <span className="text-[11px] font-mono uppercase text-slate-400 block">Cohesión y Moral</span>
                <span className={`text-lg font-black font-mono ${localMorale >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {localMorale}% Estable
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0b132b]/80 border border-white/10">
                <span className="text-[11px] font-mono uppercase text-slate-400 block">Tributo a la Corona</span>
                <span className="text-lg font-black text-amber-300 font-mono">{Math.round(taxRate * 100)}%</span>
              </div>
            </div>

            {/* Cuadrícula de 3 Tarjetas de Gran Formato */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Tarjeta 1: Edicto Fiscal y Tributos */}
              <div className="flex flex-col justify-between p-5 rounded-3xl bg-[#0b142f]/90 border border-cyan-500/30 shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-cyan-950/70 border border-cyan-400/40">💰</span>
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-wide">Pacto Tributario</h3>
                      <p className="text-xs text-slate-400">Recaudación local vs arcas del trono</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Un impuesto elevado aporta créditos y recursos al imperio, pero una presión asfixiante deteriora la moral colonial.
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Presión Fiscal:</span>
                      <span className="font-bold text-cyan-300">{Math.round(taxRate * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.40"
                      step="0.05"
                      value={taxRate}
                      onChange={(e) => handleSetTax(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0% (Autonomía Libre)</span>
                      <span>20% (Estándar)</span>
                      <span>40% (Explotación)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-cyan-300/80">
                  {taxRate <= 0.10 ? '✨ Máxima estabilidad ciudadana (+5% moral)' : '⚠️ Descontento leve en sindicatos mineros'}
                </div>
              </div>

              {/* Tarjeta 2: Edictos y Resoluciones de la Asamblea */}
              <div className="flex flex-col justify-between p-5 rounded-3xl bg-[#0b142f]/90 border border-purple-500/30 shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-purple-950/70 border border-purple-400/40">📜</span>
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-wide">Edictos Locales</h3>
                      <p className="text-xs text-slate-400">Directivas aprobadas por el cabildo</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => handleToggleDirective('subsidies')}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        localDirectives.subsidies
                          ? 'bg-purple-900/40 border-purple-400 text-purple-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Subsidio a Minería Pesada</span>
                      <span className="font-mono text-[10px] uppercase font-bold">{localDirectives.subsidies ? 'ACTIVO' : 'INACTIVO'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleDirective('culturalFestival')}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        localDirectives.culturalFestival
                          ? 'bg-purple-900/40 border-purple-400 text-purple-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Festivales Coloniales (+Moral)</span>
                      <span className="font-mono text-[10px] uppercase font-bold">{localDirectives.culturalFestival ? 'ACTIVO' : 'INACTIVO'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleDirective('martialLaw')}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        localDirectives.martialLaw
                          ? 'bg-rose-900/40 border-rose-400 text-rose-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Guardia de Pacificación Local</span>
                      <span className="font-mono text-[10px] uppercase font-bold">{localDirectives.martialLaw ? 'ACTIVO' : 'INACTIVO'}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-purple-300/80">
                  🏛️ Edictos válidos sólo dentro del territorio de {planet.name}
                </div>
              </div>

              {/* Tarjeta 3: Procuradores al Senado Imperial */}
              <div className="flex flex-col justify-between p-5 rounded-3xl bg-[#0b142f]/90 border border-amber-500/30 shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-amber-950/70 border border-amber-400/40">👑</span>
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-wide">Delegación Imperial</h3>
                      <p className="text-xs text-slate-400">Voz en la Cámara Alta de la Galaxia</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Este mundo aporta <strong className="text-amber-300">{senateSeats} procuradores</strong> que votan en los debates del Senado Imperial representando los intereses de la población local.
                  </p>
                  
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Tendencia de voto:</span>
                      <span className="text-amber-300 font-bold uppercase">{planet.biome === 'ocean' ? 'Ecologista' : planet.biome === 'volcanic' ? 'Industrial' : 'Conservador'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Lealtad al Trono:</span>
                      <span className="text-emerald-400 font-bold">Inquebrantable (100%)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-amber-300/80">
                  🗳️ Participa en las votaciones de leyes interestelares
                </div>
              </div>
            </div>
          </div>

          {/* Pie de Cierre */}
          <div className="p-4 border-t border-white/10 bg-[#060a17] flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              Cerrar Cabildo
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
