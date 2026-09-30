import React from 'react';
import { motion } from 'framer-motion';

/**
 * VictoryOverlay — Pantalla táctica cinemática de Victoria Imperial o Fin de Partida.
 */
export const VictoryOverlay = ({ victory, gameOver, onRestart, onClose }) => {
  const isVictory = Boolean(victory);
  const data = isVictory ? victory : gameOver;
  const title = isVictory ? '¡ASCENSIÓN COMPLETADA!' : 'FIN DE LA PARTIDA';
  const subtitle = isVictory ? 'Has alcanzado la gloria interestelar definitiva' : 'Tus imperios han caído en el olvido del cosmos';
  const desc = data?.desc || data?.reason || (isVictory ? 'Tu civilización ha superado los límites de la evolución y gobierna las estrellas.' : 'Tus mundos han colapsado.');
  const typeText = isVictory ? `Victoria por ${data?.type ? String(data.type).toUpperCase() : 'DOMINIO IMPERIAL'}` : 'Derrota';
  const icon = isVictory ? '🏆' : '💀';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#03050b]/92 backdrop-blur-md select-none font-mono overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`max-w-xl w-full rounded-3xl p-6 sm:p-8 border text-center shadow-2xl relative overflow-hidden backdrop-blur-xl ${
          isVictory 
            ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.25)]' 
            : 'bg-red-950/30 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.25)]'
        }`}
      >
        {/* Efecto holográfico de escaneo */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0.03)_50%,rgba(255,255,255,0)_50.1%)] bg-[length:100%_4px] opacity-40 animate-pulse" />

        {/* Ambient Glows */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          isVictory ? 'bg-emerald-500/25' : 'bg-red-500/25'
        }`} />

        <div className="relative z-10 space-y-5">
          <div className="flex justify-center">
            <span className="text-6xl sm:text-7xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.25)] animate-bounce">
              {icon}
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight uppercase ${
              isVictory ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]' : 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.4)]'
            }`}>
              {title}
            </h1>
            <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
              {subtitle}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/10 space-y-2.5">
            <div className={`text-xs font-mono font-bold tracking-widest ${isVictory ? 'text-emerald-400' : 'text-red-400'}`}>
              [{typeText}]
            </div>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-sans">
              {desc}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            {onRestart && (
              <button
                type="button"
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  onRestart();
                }}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer ${
                  isVictory 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                    : 'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                }`}
              >
                🔄 Nueva Campaña
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
              >
                Continuar Observando
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VictoryOverlay;
