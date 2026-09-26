import React, { useState } from 'react';

export const DisplaySettings = () => {
  const [crtEnabled, setCrtEnabled] = useState(() => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem('ascension_crt_enabled') === 'true' : false;
    } catch (_) {
      return false;
    }
  });

  const toggleCrt = () => {
    const next = !crtEnabled;
    setCrtEnabled(next);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ascension_crt_enabled', String(next));
      }
      window.dispatchEvent(new CustomEvent('ascension:crt-toggle', { detail: { enabled: next } }));
    } catch (_) {}
  };

  return (
    <div className="glass rounded-xl p-4 border border-indigo-500/20 bg-indigo-950/20 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm uppercase tracking-wider font-mono">
          <span className="material-symbols-outlined text-lg">tv</span>
          <span>Pantalla y Filtros Tácticos</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-indigo-400">monitor</span>
            <span>Emulación CRT y Scanlines de Cabina</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Proyecta líneas de escaneo de fósforo verde/azul y curvatura sutil de monitor militar.
          </div>
        </div>

        <button
          onClick={toggleCrt}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
            crtEnabled
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {crtEnabled ? 'check_circle' : 'power_settings_new'}
          </span>
          <span>{crtEnabled ? 'Activado' : 'Desactivado'}</span>
        </button>
      </div>
    </div>
  );
};
