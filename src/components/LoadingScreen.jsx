import React, { useEffect, useState } from 'react';
import { StarField } from '../ui.jsx';
import { asset } from '../assets.jsx';
import { S } from '../styles.js';

export const LoadingScreen = ({ onForceReady }) => {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStuck(true);
    }, 10000); // 10s watchdog
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070f] text-white flex flex-col items-center pt-0 p-6 text-center select-none font-sans relative overflow-hidden">
      <StarField />
      <div className="relative z-10 pointer-events-auto max-w-md glass-deep holographic rounded-2xl p-8 shadow-2xl flex flex-col items-center border border-white/10 fresnel mt-8">
        <img src={asset('logo-ascension.webp')} alt="Ascensión" className="h-32 w-auto object-contain mb-6 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]" draggable={false} />
        <h1 className="text-xl font-bold text-[var(--ue-accent)] mb-2">Cargando Ascensión</h1>
        <p className="text-slate-400 text-xs mb-6">Inicializando sistemas tácticos y cargando universo local...</p>

        {stuck && (
          <div className="mt-4 space-y-3 w-full">
            <p className="text-red-400 text-xs font-semibold">El arranque está tomando más tiempo del esperado.</p>
            <button
              onClick={() => window.location.reload()}
              className={`${S.btn} ${S.btnPrimary} w-full px-6 py-2.5`}
            >
              Reintentar Carga
            </button>
            {onForceReady && (
              <button
                onClick={onForceReady}
                className={`${S.btn} ${S.btnGhost} w-full px-6 py-2.5`}
              >
                Continuar sin cargar
              </button>
            )}
<p className="text-slate-500 text-[10px] mt-2 leading-relaxed">
                Si el problema persiste, verifica tu conexión a internet.
              </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
