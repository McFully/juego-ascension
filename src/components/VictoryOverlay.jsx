import React from 'react';
import { motion } from 'framer-motion';

export const VictoryOverlay = ({ victory, gameOver, onRestart, onClose }) => {
  const isVictory = !!victory;
  const data = isVictory ? victory : gameOver;
  const title = isVictory ? '¡ASCENSIÓN COMPLETADA!' : 'FIN DE LA PARTIDA';
  const subtitle = isVictory ? 'Has alcanzado la gloria interestelar' : 'Tus imperios han caído en el olvido';
  const desc = data?.desc || data?.reason || '';
  const typeText = isVictory ? `Victoria por ${data?.type?.toUpperCase()}` : 'Derrota';
  const icon = isVictory ? '🏆' : '💀';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#03050b]/90 backdrop-blur-md select-none font-sans overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`max-w-xl w-full rounded-3xl p-8 border text-center shadow-2xl relative overflow-hidden backdrop-blur-xl ${
          isVictory 
            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-500/5' 
            : 'bg-red-950/20 border-red-500/40 shadow-red-500/5'
        }`}
      >
        {/* Holographic scanning effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0.02)_50%,rgba(255,255,255,0)_50.1%)] bg-[length:100%_4px] opacity-30 animate-pulse" />

        {/* Ambient Glows */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          isVictory ? 'bg-emerald-500/20' : 'bg-red-500/20'
        }`} />

        <div className="relative z-10 space-y-6">
          <div className="flex justify-center">
            <span className="text-7xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-bounce">{icon}</span>
          </div>

          <div className="space-y-2">
            <h1 className={`text-3xl font-extrabold tracking-tight uppercase ${
              isVictory ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]'
            }`}>
              {title}
            </h1>
            <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">{subtitle}</p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
            <div className={`text-xs font-mono font-bold tracking-widest ${isVictory ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
              [{typeText}]
            </div>
            <p className="text-slate-200 text-sm leading-relaxed font-medium">
              {desc}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onRestart}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg active:scale-95 cursor-pointer ${
                isVictory 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20' 
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
              }`}
            >
              🚀 Comenzar de Nuevo
            </button>
            {isVictory && (
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-400 transition-all cursor-pointer"
              >
                🌌 Seguir Explorando
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
