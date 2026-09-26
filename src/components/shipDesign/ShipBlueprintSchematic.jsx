import React from 'react';

/**
 * ShipBlueprintSchematic
 * Representación vectorial técnica cenital (top-down blueprint) del chasis y módulos equipados.
 * Renderiza cuadrícula holográfica, silueta geométrica según chasis, e indicadores de anclaje
 * (armamento, propulsión, escudos y módulos auxiliares).
 */
export const ShipBlueprintSchematic = ({
  chassis,
  weapon,
  engine,
  shield,
  modules = [],
  stats,
  SHIP_CHASSIS,
  SHIP_WEAPONS,
  SHIP_ENGINES,
  SHIP_SHIELDS,
  SHIP_MODULES
}) => {
  if (!chassis) return null;

  const chInfo = SHIP_CHASSIS?.[chassis];
  const wpnInfo = SHIP_WEAPONS?.[weapon];
  const engInfo = SHIP_ENGINES?.[engine];
  const shdInfo = SHIP_SHIELDS?.[shield];

  // Geometría vectorial según tipo de chasis
  const renderHullPath = () => {
    switch (chassis) {
      case 'corvette':
      case 'scout':
        return (
          <path
            d="M 200 40 L 250 170 L 230 290 L 170 290 L 150 170 Z"
            fill="rgba(6, 182, 212, 0.08)"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        );
      case 'cruiser':
        return (
          <path
            d="M 200 30 L 270 140 L 260 270 L 220 310 L 180 310 L 140 270 L 130 140 Z"
            fill="rgba(14, 165, 233, 0.08)"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        );
      case 'battleship':
      case 'dreadnought':
        return (
          <path
            d="M 200 20 L 285 110 L 290 220 L 250 320 L 150 320 L 110 220 L 115 110 Z"
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#60a5fa"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        );
      case 'carrier':
      case 'titan':
        return (
          <path
            d="M 200 15 L 300 80 L 310 240 L 260 330 L 140 330 L 90 240 L 100 80 Z"
            fill="rgba(168, 85, 247, 0.08)"
            stroke="#c084fc"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        );
      default:
        return (
          <path
            d="M 200 30 L 260 150 L 240 290 L 160 290 L 140 150 Z"
            fill="rgba(6, 182, 212, 0.08)"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        );
    }
  };

  return (
    <div className="w-full rounded-3xl bg-[#030712]/90 border border-cyan-500/30 p-5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
      {/* Fondo de escáner cibernético */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

      {/* SVG Canvas de Plano Esquemático */}
      <div className="relative w-full max-w-[320px] aspect-[4/5] bg-black/60 rounded-2xl border border-cyan-500/20 flex items-center justify-center p-2">
        <svg viewBox="0 0 400 360" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <defs>
            <pattern id="blueprintGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="0.8" />
            </pattern>
            <linearGradient id="scannerBeam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(6, 182, 212, 0.4)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Rejilla técnica */}
          <rect width="400" height="360" fill="url(#blueprintGrid)" />

          {/* Anillos de radar y calibración */}
          <circle cx="200" cy="180" r="140" fill="none" stroke="rgba(6, 182, 212, 0.15)" strokeDasharray="4 6" />
          <circle cx="200" cy="180" r="80" fill="none" stroke="rgba(6, 182, 212, 0.2)" strokeDasharray="2 4" />
          <line x1="200" y1="10" x2="200" y2="350" stroke="rgba(6, 182, 212, 0.25)" strokeDasharray="3 3" />
          <line x1="20" y1="180" x2="380" y2="180" stroke="rgba(6, 182, 212, 0.25)" strokeDasharray="3 3" />

          {/* Silueta central de nave */}
          <g>
            {renderHullPath()}

            {/* Nervaduras de refuerzo estructural */}
            <line x1="160" y1="180" x2="240" y2="180" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
            <line x1="175" y1="120" x2="225" y2="120" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
            <line x1="180" y1="240" x2="220" y2="240" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />

            {/* Hardpoint de Armas (Proa) */}
            <circle cx="200" cy="50" r="9" fill={weapon ? "#ef4444" : "rgba(239, 68, 68, 0.2)"} stroke="#ef4444" strokeWidth="1.5" />
            <circle cx="200" cy="50" r="14" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="2 2" />

            {/* Hardpoint de Escudos (Núcleo) */}
            <circle cx="200" cy="180" r="11" fill={shield ? "#3b82f6" : "rgba(59, 130, 246, 0.2)"} stroke="#3b82f6" strokeWidth="1.5" />
            <circle cx="200" cy="180" r="18" fill="none" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="3 3" />

            {/* Hardpoints de Propulsión (Popa) */}
            <rect x="165" y="285" width="18" height="12" rx="2" fill={engine ? "#f59e0b" : "rgba(245, 158, 11, 0.2)"} stroke="#f59e0b" strokeWidth="1.5" />
            <rect x="217" y="285" width="18" height="12" rx="2" fill={engine ? "#f59e0b" : "rgba(245, 158, 11, 0.2)"} stroke="#f59e0b" strokeWidth="1.5" />

            {/* Hardpoints de Módulos Auxiliares */}
            {(modules || []).map((mId, idx) => {
              const xPos = idx % 2 === 0 ? 145 : 255;
              const yPos = 130 + Math.floor(idx / 2) * 45;
              return (
                <g key={mId + idx}>
                  <rect x={xPos - 8} y={yPos - 8} width="16" height="16" rx="3" fill="#10b981" stroke="#34d399" strokeWidth="1.5" />
                  <line x1={xPos} y1={yPos} x2="200" y2={yPos} stroke="#34d399" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
                </g>
              );
            })}
          </g>

          {/* Anotaciones de cotas técnicas */}
          <text x="35" y="45" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">CHASSIS // {chassis.toUpperCase()}</text>
          <text x="35" y="60" fill="#64748b" fontSize="8" fontFamily="monospace">CLASS: {chInfo?.name || 'CUSTOM'}</text>
          <text x="35" y="335" fill="#38bdf8" fontSize="9" fontFamily="monospace">HARDPOINTS: {stats ? `${stats.slotsUsed}/${stats.slotsMax}` : '0/0'}</text>
        </svg>
      </div>

      {/* Panel Técnico Desglosado */}
      <div className="flex-1 w-full space-y-4">
        <div className="border-b border-cyan-500/20 pb-2">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              Esquema Vectorial Cenital // {chInfo?.name || chassis}
            </h4>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              CAD v3.2
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Topología del fuselaje en tiempo real. Los sistemas instalados recalibran la aerodinámica subespacial y la dispersión térmica.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-black/40 border border-red-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-red-400 block uppercase">Sistema Ofensivo</span>
              <strong className="text-xs font-bold text-white font-mono">{wpnInfo?.name || 'Sin armamento primario'}</strong>
            </div>
            <span className="text-xl">⚔️</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-blue-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-blue-400 block uppercase">Matriz de Blindaje</span>
              <strong className="text-xs font-bold text-white font-mono">{shdInfo?.name || 'Sin escudos deflectores'}</strong>
            </div>
            <span className="text-xl">🛡️</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-amber-400 block uppercase">Planta Propulsora</span>
              <strong className="text-xs font-bold text-white font-mono">{engInfo?.name || 'Propulsor estándar'}</strong>
            </div>
            <span className="text-xl">🚀</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 block uppercase">Subsistemas Auxiliares</span>
              <strong className="text-xs font-bold text-white font-mono">{(modules || []).length} Módulos Integrados</strong>
            </div>
            <span className="text-xl">🧩</span>
          </div>
        </div>
      </div>
    </div>
  );
};
