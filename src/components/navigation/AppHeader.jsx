import React from 'react';
import { asset } from '../../assets.jsx';
import { ResourceBar, AttackAlert, BadgeCounter } from '../../ui.jsx';

/**
 * AppHeader — HUD Superior Táctico de Élite.
 * Bahía blindada para el logo imperial, visualizador de recursos estilo cockpit y controles de alerta.
 */
export const AppHeader = React.memo(({
  currentPlanet,
  research,
  reputation,
  taxRate,
  safeCalcProduction,
  calcStorage,
  getGalacticAlignment,
  GAME_SPEED,
  attackCount,
  unreadNotifs,
  effectiveSoundEnabled,
  toggleSound,
  onOpenFleet,
  onOpenComms,
  onOpenSettings
}) => {
  return (
    <>
      {/* Bahía del Logo Imperial: Bisel militar w-52 con retroiluminación cyan */}
      <div 
        className="fixed top-0 left-0 z-50 w-52 h-16 bg-gradient-to-b from-[#0e1628] to-[#060a16] border-b border-r border-cyan-500/30 flex items-center justify-center shadow-[0_4px_25px_rgba(0,0,0,0.8)] relative overflow-hidden" 
        aria-label="Logo de Ascensión"
      >
        {/* Glow subyacente */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-cyan-500/10 to-transparent pointer-events-none" />
        
        {/* Línea LED de estado superior */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent shadow-[0_0_8px_rgba(6,182,212,0.8)]" />

        <img
          src={asset('logo-ascension.webp')}
          alt="Ascensión"
          className="h-full w-auto object-contain py-1.5 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] relative z-10 transition-transform duration-300 hover:scale-105"
          draggable={false}
        />

        {/* Indicador de integridad */}
        <div className="absolute bottom-1 right-2 flex items-center gap-1 opacity-60">
          <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase tracking-widest">SYS ON</span>
        </div>
      </div>

      {/* Header Superior Militar: HUD Cockpit */}
      <header className="fixed top-0 left-0 md:left-52 right-0 z-50 flex items-center justify-between h-16 bg-gradient-to-r from-[#060a16]/98 via-[#091124]/95 to-[#060a16]/98 border-b border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] pointer-events-auto pl-4 pr-6">
        
        {/* Línea sutil de energía superior */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

        {/* CENTER: Monitor de Recursos en Vivo */}
        <div className="flex-1 flex items-center justify-start gap-2 h-full min-w-0 py-2">
          <ResourceBar 
            planet={currentPlanet} 
            research={research} 
            reputation={reputation} 
            taxRate={taxRate || 0}
            calcProduction={safeCalcProduction}
            calcStorage={calcStorage}
            getGalacticAlignment={getGalacticAlignment}
            GAME_SPEED={GAME_SPEED}
          />
        </div>

        {/* RIGHT: Controles Tácticos del Cockpit */}
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <AttackAlert count={attackCount} onClick={onOpenFleet} />
          <BadgeCounter count={unreadNotifs} onClick={onOpenComms} />
          
          {/* Botón de Audio Cockpit */}
          <button
            onClick={toggleSound}
            className={`
              flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 cursor-pointer focus-ring-game
              ${effectiveSoundEnabled 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                : 'bg-[#05070f] border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20'
              }
            `}
            title={effectiveSoundEnabled ? 'Silenciar audio de consola' : 'Activar audio de consola'}
            aria-label={effectiveSoundEnabled ? 'Silenciar audio' : 'Activar audio'}
          >
            {effectiveSoundEnabled ? (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M3,9v6h4l5,5V4L7,9H3z M16.5,12c0-1.77-1.02-3.29-2.5-4.03v8.05C15.48,15.29,16.5,13.77,16.5,12z M14,3.23v2.06c2.89,0.86,5,3.54,5,6.71s-2.11,5.85-5,6.71v2.06c4.01-0.91,7-4.49,7-8.77S18.01,4.14,14,3.23z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M16.5,12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45,2.45C16.42,12.42,16.5,12.21,16.5,12z M19,12c0,0.94-0.2,1.82-0.54,2.64l1.51,1.51C20.63,14.91,21,13.5,21,12c0-4.28-2.99-7.86-7-8.77v2.06C16.89,6.15,19,8.83,19,12z M4.27,3L3,4.27L7.73,9H3v6h4l5,5v-6.73l4.25,4.25C15.53,18.08,14.8,18.47,14,18.6v2.06c1.33-0.19,2.53-0.78,3.53-1.62l2.2,2.2l1.27-1.27L4.27,3z M12,4L9.91,6.09L12,8.18V4z"/>
              </svg>
            )}
          </button>

          {/* Botón de Ajustes Cockpit */}
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#05070f] border border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all duration-200 cursor-pointer focus-ring-game shadow-inner"
            title="Parámetros del Sistema"
            aria-label="Ajustes"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 c-0.12,0.21-0.08,0.47,0.12,0.61l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.70,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </button>
        </div>
      </header>
    </>
  );
});
