import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ForeignEmbassyModal — Despacho y Enclave de la Embajada Imperial en un Planeta Extranjero.
 * Permite gestionar agregados diplomáticos, espionaje consular, acuerdos comerciales y misiones conjuntas.
 */
export const ForeignEmbassyModal = ({
  isOpen,
  onClose,
  targetAI,
  state,
  dispatch,
  fmt
}) => {
  if (!isOpen || !targetAI) return null;

  const [activeTab, setActiveTab] = useState('consular'); // 'consular' | 'intelligence' | 'trade'
  const relation = targetAI.relation ?? 0;
  const isAllied = relation >= 40;
  const aiPersonality = targetAI.aiPersonality || 'pacífico';
  const factionName = targetAI.faction || 'human';

  const handleExpelEmbassy = () => {
    if (window.playSfx) window.playSfx('warn');
    dispatch({
      type: 'DIPLOMACY_APPLY_ACTION',
      planetId: targetAI.id,
      actionType: 'threaten'
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#070b1a] border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden"
        >
          {/* Cabecera de la Embajada Imperial */}
          <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-[#0a142e] via-[#070d20] to-[#040814] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    Enclave Diplomático Imperial
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Territorio Extranjero: {targetAI.name} [{targetAI.galaxy}:{targetAI.system}:{targetAI.position}]
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  Embajada Imperial en {targetAI.name}
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

          {/* Navegación por Cámaras de la Embajada */}
          <div className="px-6 py-2.5 bg-black/40 border-b border-white/5 flex gap-2">
            <button
              onClick={() => setActiveTab('consular')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'consular'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📜</span>
              <span>Gabinete Consular</span>
            </button>
            <button
              onClick={() => setActiveTab('intelligence')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'intelligence'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🕵️</span>
              <span>Antena de Inteligencia</span>
            </button>
            <button
              onClick={() => setActiveTab('trade')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'trade'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>💼</span>
              <span>Cámara Bilateral de Comercio</span>
            </button>
          </div>

          {/* Cuerpo Principal del Enclave */}
          <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
            {activeTab === 'consular' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Estatus de Relación</span>
                  <span className={`text-lg font-black font-mono ${relation >= 50 ? 'text-emerald-400' : relation >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                    {relation > 0 ? `+${relation}` : relation} ({isAllied ? 'Aliados' : 'Neutral'})
                  </span>
                  <p className="text-[11px] text-slate-400">
                    La embajada permanente asegura una generación de +0.5 de influencia y previene declaraciones de guerra sorpresa.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Personal Diplomático</span>
                  <span className="text-lg font-black text-white font-mono">1 Agregado Consular</span>
                  <p className="text-[11px] text-slate-400">
                    Supervisa visados comerciales, salvoconductos espaciales y mediación en disputas fronterizas.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Doctrina Alienígena</span>
                  <span className="text-lg font-black text-amber-300 font-mono capitalize">{aiPersonality}</span>
                  <p className="text-[11px] text-slate-400">
                    Facción {factionName.toUpperCase()}. Responden positivamente al intercambio recíproco de recursos.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'intelligence' && (
              <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <h4 className="text-sm font-bold text-purple-200 uppercase tracking-wider flex items-center gap-2">
                  <span>📡</span>
                  <span>Interceptación Consular de Señales</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gracias a la presencia física de la delegación en la superficie de {targetAI.name}, la inteligencia imperial recibe datos en tiempo real sobre los movimientos navales y proyectos de esta civilización.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">Poder Defensivo Local:</span>
                    <span className="font-bold text-white">Nivel de Defensa {targetAI.aiLevel || 1}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">Amenaza hacia la Capital:</span>
                    <span className="font-bold text-emerald-400">Neutralizada por Embajada</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trade' && (
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <h4 className="text-sm font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-2">
                  <span>💼</span>
                  <span>Exenciones Arancelarias Bilaterales</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Las rutas comerciales que conectan tu imperio con {targetAI.name} tienen un descuento arancelario del 50% y un incremento en los dividendos de crédito.
                </p>
              </div>
            )}
          </div>

          {/* Pie de la Embajada */}
          <div className="px-6 py-4 border-t border-white/10 bg-[#060a17] flex justify-between items-center">
            <button
              onClick={handleExpelEmbassy}
              className="px-4 py-2 rounded-xl text-rose-400 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 text-xs font-bold transition-all"
            >
              Retirar Embajada y Romper Enclave
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              Cerrar Enclave
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
