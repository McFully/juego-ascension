import React, { useState, useEffect } from 'react';
import { StarField } from '../../ui.jsx';
import { asset } from '../../assets.jsx';

import { REAL_IMAGES } from '../../data/assetsCatalog.js';

const APP_VERSION = (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev');

// Caché en memoria para evitar re-decodificar durante la misma sesión
let preloadedVRAMDone = false;
function preloadAllAssetsToVRAM() {
  if (preloadedVRAMDone || typeof window === 'undefined') return;
  preloadedVRAMDone = true;
  const urls = Object.values(REAL_IMAGES || {}).filter(Boolean);
  urls.forEach(src => {
    try {
      const img = new Image();
      img.src = src;
      if (img.decode) {
        img.decode().catch(() => {});
      }
    } catch (_) {}
  });
}

const BOOT_STEPS = [
  { progress: 18, text: 'INICIALIZANDO SUBSISTEMAS CUÁNTICOS...' },
  { progress: 42, text: 'SINCRONIZANDO NÚCLEOS HIPERESPACIALES...' },
  { progress: 68, text: 'ESTABLECIENDO PROTOCOLOS IMPERIALES...' },
  { progress: 89, text: 'CARGANDO REGISTRO NAVAL Y UNIVERSO LOCAL...' },
  { progress: 100, text: 'TERMINAL TÁCTICA LISTA · ACCESO AUTORIZADO' }
];

export const IntroSplashPreload = ({ ready = true, onForceReady, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    preloadAllAssetsToVRAM();
  }, []);

  // Watchdog de 10s según regla maestra de estabilidad del ejecutable
  useEffect(() => {
    const watchdog = setTimeout(() => {
      if (!ready) {
        setStuck(true);
      }
    }, 10000);
    return () => clearTimeout(watchdog);
  }, [ready]);

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < BOOT_STEPS.length) {
        setStepIndex(step);
        setProgress(BOOT_STEPS[step].progress);
      } else {
        clearInterval(interval);
        // Cuando llega a 100%, si el motor está ready, transición suave hacia el menú
        setProgress(100);
        setTimeout(() => {
          setFadingOut(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 550);
        }, 350);
      }
    }, 380);

    return () => clearInterval(interval);
  }, [onComplete]);

  const currentStatus = BOOT_STEPS[stepIndex] || BOOT_STEPS[0];

  return (
    <div 
      className={`fixed inset-0 z-50 bg-[#02040a] text-white flex flex-col items-center justify-center select-none font-sans overflow-hidden transition-all duration-700 ease-out ${
        fadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <StarField />

      {/* Gradientes y resplandor espacial de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.18)_0%,rgba(14,165,233,0.06)_40%,transparent_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(6,182,212,0.08)_2px,rgba(6,182,212,0.08)_4px)]" />

      {/* Contenedor central con animación de entrada */}
      <div className="relative z-10 flex flex-col items-center max-w-xl w-full px-6 text-center animate-in fade-in zoom-in-95 duration-700">
        
        {/* Halo y Anillos orbitales holográficos */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Resplandor pulsante */}
          <div className="absolute -inset-10 bg-cyan-500/25 blur-3xl rounded-full animate-pulse pointer-events-none" />

          {/* Anillo Orbital Externo con rotación suave */}
          <div 
            className="absolute w-56 h-56 md:w-64 md:h-64 rounded-full border border-cyan-500/20 border-dashed animate-spin pointer-events-none" 
            style={{ animationDuration: '24s' }} 
          />
          
          {/* Anillo Orbital Intermedio */}
          <div 
            className="absolute w-48 h-48 md:w-56 md:h-56 rounded-full border border-cyan-400/30 border-t-cyan-300 pointer-events-none animate-spin" 
            style={{ animationDuration: '14s', animationDirection: 'reverse' }} 
          />
          
          {/* Destello horizontal estilo lens-flare */}
          <div className="absolute w-72 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm opacity-70 pointer-events-none animate-pulse" />

          {/* Logo Ascensión Protagónico */}
          <div className="relative z-20">
            <img 
              src={asset('logo-ascension.webp')} 
              alt="Ascensión" 
              className="h-36 md:h-44 w-auto object-contain drop-shadow-[0_0_35px_rgba(6,182,212,0.65)] filter brightness-110" 
              draggable={false} 
            />
          </div>
        </div>

        {/* Título y Subtítulo Cinemático */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl md:text-5xl font-black italic tracking-widest uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            ASCENSIÓN
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyan-400" />
            <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.45em] text-cyan-300">
              SISTEMA TÁCTICO DE CONSOLA SUPREMA
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-cyan-400" />
          </div>
        </div>

        {/* Barra de Progreso Holográfica */}
        <div className="w-full max-w-md bg-black/60 border border-white/15 rounded-full p-1 shadow-[0_0_25px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-200 transition-all duration-300 ease-out relative shadow-[0_0_15px_rgba(6,182,212,0.8)]"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#fff]" />
          </div>
        </div>

        {/* Estado y Telemetría en Vivo */}
        <div className="w-full max-w-md mt-3 flex items-center justify-between text-[10px] font-mono text-cyan-400/80 tracking-wider">
          <span className="truncate pr-2">{currentStatus.text}</span>
          <span className="font-bold shrink-0">{progress}%</span>
        </div>

        {/* Versión y Protocolo Local */}
        <div className="mt-8 text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span>VERSIÓN {APP_VERSION}</span>
          <span>·</span>
          <span>MODO LOCAL ACTIVO</span>
        </div>

        {stuck && (
          <div className="mt-6 p-4 bg-red-950/40 border border-red-500/40 rounded-xl space-y-3 w-full max-w-md animate-in fade-in">
            <p className="text-red-400 text-xs font-semibold">El arranque está tomando más tiempo del esperado.</p>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2 px-3 bg-red-600/80 hover:bg-red-500 text-white font-mono text-xs rounded-lg transition-all cursor-pointer font-bold uppercase"
              >
                Reintentar
              </button>
              {onForceReady && (
                <button
                  onClick={onForceReady}
                  className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-mono text-xs rounded-lg border border-white/20 transition-all cursor-pointer uppercase"
                >
                  Continuar
                </button>
              )}
            </div>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              Verifica tu conexión a internet y vuelve a intentarlo.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default IntroSplashPreload;
