import React from 'react';

/**
 * Gráfico SVG ligero interactivo de cotizaciones y tendencias de materias primas
 */
export const MarketPriceChart = ({ currentRates, priceHistory = [] }) => {
  const points = priceHistory.length > 0 ? priceHistory : [
    { tick: 1, metal: 1.0, crystal: 1.62, deut: 3.25 },
    { tick: 2, metal: 1.02, crystal: 1.60, deut: 3.28 },
    { tick: 3, metal: 0.98, crystal: 1.64, deut: 3.32 },
    { tick: 4, metal: 1.01, crystal: 1.67, deut: 3.30 },
    { tick: 5, metal: 1.04, crystal: 1.65, deut: 3.35 },
    { tick: 6, metal: 1.00, crystal: 1.66, deut: 3.31 },
  ];

  const maxPrice = 4.0;
  const height = 90;
  const width = 320;

  const getPolyline = (key) => {
    return points.map((pt, i) => {
      const x = (i / (points.length - 1)) * width;
      const val = pt[key] || 1;
      const y = height - (val / maxPrice) * height;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="p-4 rounded-2xl bg-[#060a16]/90 border border-emerald-500/20 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300">
            Tendencia de Cotizaciones en Vivo
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-0.5 bg-cyan-400 inline-block" /> Metal (x1.00)
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-0.5 bg-emerald-400 inline-block" /> Cristal (x1.65)
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-0.5 bg-amber-400 inline-block" /> Deuterio (x3.30)
          </span>
        </div>
      </div>

      <div className="relative h-[90px] w-full bg-black/40 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d" preserveAspectRatio="none">
          {/* Rejilla de fondo */}
          <line x1="0" y1="22" x2={width} y2="22" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1="0" y1="45" x2={width} y2="45" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1="0" y1="68" x2={width} y2="68" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

          {/* Líneas de tendencia */}
          <polyline fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" points={getPolyline('metal')} />
          <polyline fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" points={getPolyline('crystal')} />
          <polyline fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" points={getPolyline('deut')} />
        </svg>
      </div>
      <div className="flex justify-between text-[9px] font-mono text-slate-500">
        <span>Ciclo Anterior</span>
        <span className="text-emerald-400 font-bold">Mercado Regulado por el Consorcio Federal</span>
        <span>Tiempo Real</span>
      </div>
    </div>
  );
};
