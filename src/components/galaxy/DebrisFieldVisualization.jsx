import React from 'react';

/**
 * DebrisFieldVisualization
 * Representación visual interactiva y animada de un campo de escombros orbital en el mapa estelar.
 * Muestra nubes de fragmentos de aleación (metal) y esquirlas cristalinas flotantes con destellos y telemetría.
 */
export const DebrisFieldVisualization = ({
  metal = 0,
  crystal = 0,
  fmt,
  onRecycleClick,
  hasRecycler = false,
  compact = false
}) => {
  const total = metal + crystal;
  if (total <= 0) return null;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-amber-500/30 bg-[#070b14]/90 p-3.5 shadow-lg ${compact ? 'text-xs' : ''}`}>
      {/* Fondo de partículas y campo magnético */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* Ilustración de escombros vectoriales flotantes */}
          <div className="relative w-12 h-12 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <svg viewBox="0 0 48 48" className="w-10 h-10 animate-[spin_40s_linear_infinite]">
              {/* Fragmentos de metal (gris / ámbar oscuro) */}
              <polygon points="12,14 18,10 16,18" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="0.8" opacity="0.85" />
              <polygon points="28,12 36,15 32,22 26,18" fill="#64748b" stroke="#94a3b8" strokeWidth="0.8" opacity="0.9" />
              <polygon points="34,30 40,36 32,38" fill="#78716c" stroke="#a8a29e" strokeWidth="0.8" opacity="0.85" />
              <polygon points="10,32 16,38 12,42 6,36" fill="#475569" stroke="#64748b" strokeWidth="0.8" opacity="0.8" />
              
              {/* Esquirlas de cristal con destello (cian / esmeralda brillante) */}
              <polygon points="22,20 26,16 28,24 20,26" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="1" opacity="0.95" />
              <polygon points="14,24 18,22 17,28" fill="#06b6d4" stroke="#a5f3fc" strokeWidth="0.8" opacity="0.9" />
              <polygon points="26,32 30,28 32,34" fill="#67e8f9" stroke="#cffafe" strokeWidth="0.8" opacity="0.95" />
            </svg>
            <span className="absolute -bottom-1 -right-1 text-[11px] bg-black/80 px-1 rounded border border-amber-500/40 text-amber-300 font-mono font-bold">
              ♻️
            </span>
          </div>

          {/* Datos del campo */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300 uppercase tracking-wide text-xs sm:text-sm font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Campo de Escombros Orbital
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
                Residuos de Batalla
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-300 mt-1">
              <span className="flex items-center gap-1">
                <span className="text-slate-400">⛏️ Metal:</span>
                <strong className="text-white">{fmt ? fmt(metal) : Math.round(metal)}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-cyan-400">💎 Cristal:</span>
                <strong className="text-white">{fmt ? fmt(crystal) : Math.round(crystal)}</strong>
              </span>
              <span className="text-slate-500 hidden sm:inline">
                (Total: {fmt ? fmt(total) : Math.round(total)})
              </span>
            </div>
          </div>
        </div>

        {/* Botón de acción si se provee callback */}
        {onRecycleClick && (
          <button
            onClick={onRecycleClick}
            disabled={!hasRecycler}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer shadow-md flex items-center gap-1.5 shrink-0 ${
              hasRecycler
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
            }`}
            title={hasRecycler ? 'Desplegar recicladores a recolectar' : 'Requiere naves recicladoras en el hangar del planeta activo'}
          >
            <span>♻️</span>
            <span>{hasRecycler ? 'Cosechar Escombros' : 'Sin Recicladores'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
