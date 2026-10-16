import React from 'react';

export const IllustrationQualitySettings = () => {
  const currentSaved = (typeof localStorage !== 'undefined' ? localStorage.getItem('ascension_image_tier') : null) || 'standard';

  const options = [
    { id: 'standard', label: 'Automática', desc: 'Adaptada al monitor' },
    { id: 'standard', label: 'Estándar', desc: '1080p nativo ultra-rápido' },
    { id: 'hd', label: 'Alta Definición', desc: '2K / Monitores Retina' },
    { id: 'original', label: 'Máxima Maestra', desc: 'Archivos originales' }
  ];

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-[#070b18]/80 space-y-3 font-mono">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-lg">🖼️</span>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fidelidad de Ilustraciones</h3>
            <p className="text-[11px] text-slate-400">Calibración de nitidez óptica y optimización gráfica adaptativa.</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          100% Calidad
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        {options.map((item, idx) => {
          const isSelected = (idx === 0 && !localStorage.getItem('ascension_image_tier')) || (currentSaved === item.id && idx > 0);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (typeof localStorage !== 'undefined') {
                  if (idx === 0) {
                    localStorage.removeItem('ascension_image_tier');
                  } else {
                    localStorage.setItem('ascension_image_tier', item.id);
                  }
                  window.dispatchEvent(new CustomEvent('ascension:tier-change', { detail: { tier: item.id } }));
                }
              }}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'border-white/10 bg-slate-900/40 text-slate-400 hover:border-white/30 hover:text-white'
              }`}
            >
              <span className="font-bold text-white text-[11px] truncate">{item.label}</span>
              <span className="text-[9px] text-slate-400 mt-1 leading-tight">{item.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
