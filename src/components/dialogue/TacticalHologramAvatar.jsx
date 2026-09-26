import React from 'react';

/**
 * TacticalHologramAvatar - Renderizador de hologramas tácticos sci-fi para transmisiones orbitales.
 * Sustituye los avatares planos tipo cartoon por proyecciones militares holográficas con HUD y scanlines.
 */
export const TacticalHologramAvatar = ({
  avatarKey = 'player',
  name = 'Comandante',
  isSpeaker = false,
  factionTone = 'cyan' // 'cyan' | 'red' | 'purple' | 'emerald' | 'amber'
}) => {
  // Configuración cromática y temática según facción
  const colorSchemes = {
    cyan: {
      border: 'border-cyan-500/50',
      borderActive: 'border-cyan-400',
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.45)]',
      accent: 'text-cyan-400',
      badgeBg: 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200',
      gridColor: 'rgba(6,182,212,0.15)',
      holoBeam: 'from-cyan-500/20 via-cyan-500/5 to-transparent'
    },
    red: {
      border: 'border-rose-500/50',
      borderActive: 'border-rose-400',
      glow: 'shadow-[0_0_25px_rgba(244,63,94,0.45)]',
      accent: 'text-rose-400',
      badgeBg: 'bg-rose-950/90 border-rose-500/60 text-rose-200',
      gridColor: 'rgba(244,63,94,0.15)',
      holoBeam: 'from-rose-500/20 via-rose-500/5 to-transparent'
    },
    purple: {
      border: 'border-purple-500/50',
      borderActive: 'border-purple-400',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.45)]',
      accent: 'text-purple-400',
      badgeBg: 'bg-purple-950/90 border-purple-500/60 text-purple-200',
      gridColor: 'rgba(168,85,247,0.15)',
      holoBeam: 'from-purple-500/20 via-purple-500/5 to-transparent'
    },
    emerald: {
      border: 'border-emerald-500/50',
      borderActive: 'border-emerald-400',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.45)]',
      accent: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200',
      gridColor: 'rgba(16,185,129,0.15)',
      holoBeam: 'from-emerald-500/20 via-emerald-500/5 to-transparent'
    },
    amber: {
      border: 'border-amber-500/50',
      borderActive: 'border-amber-400',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.45)]',
      accent: 'text-amber-400',
      badgeBg: 'bg-amber-950/90 border-amber-500/60 text-amber-200',
      gridColor: 'rgba(245,158,11,0.15)',
      holoBeam: 'from-amber-500/20 via-amber-500/5 to-transparent'
    }
  };

  // Mapear tono por avatar
  const resolvedTone = 
    avatarKey === 'player' ? 'cyan' :
    avatarKey === 'warlord' ? 'red' :
    avatarKey === 'vortex' ? 'purple' :
    avatarKey === 'cyborg' ? 'emerald' :
    avatarKey === 'scientist' ? 'cyan' :
    factionTone || 'amber';

  const theme = colorSchemes[resolvedTone] || colorSchemes.cyan;

  // Iconografía táctica vectorial de alta definición para cada tipo de entidad
  const renderEntitySilhouette = () => {
    switch (avatarKey) {
      case 'player':
        return (
          <g className="transition-all duration-300">
            {/* Casco / Busto de Comandante Imperial */}
            <defs>
              <linearGradient id="cmdVisor" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8"/>
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="1"/>
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8"/>
              </linearGradient>
            </defs>
            {/* Hombros de armadura exoesqueleto */}
            <path d="M 40,240 L 75,170 L 145,170 L 180,240 L 205,250 L 15,250 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" strokeOpacity="0.6"/>
            {/* Pechera táctica */}
            <path d="M 80,185 L 110,230 L 140,185 Z" fill="#082f49" stroke="#38bdf8" strokeWidth="1.5"/>
            <circle cx="110" cy="205" r="4" fill="#00f0ff" className="animate-pulse" />
            {/* Cuello / Columna de enlace */}
            <rect x="92" y="140" width="36" height="32" fill="#1e293b" stroke="#06b6d4" strokeWidth="1"/>
            <line x1="100" y1="145" x2="100" y2="165" stroke="#38bdf8" strokeWidth="1"/>
            <line x1="110" y1="145" x2="110" y2="165" stroke="#38bdf8" strokeWidth="1"/>
            <line x1="120" y1="145" x2="120" y2="165" stroke="#38bdf8" strokeWidth="1"/>
            {/* Casco táctico imperial */}
            <path d="M 75,135 Q 65,70 110,40 Q 155,70 145,135 Q 128,145 110,145 Q 92,145 75,135 Z" fill="#090d16" stroke="#06b6d4" strokeWidth="2.5"/>
            {/* Cresta superior */}
            <path d="M 103,36 L 117,36 L 114,60 L 106,60 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1"/>
            {/* Visor holográfico panorámico */}
            <path d="M 78,82 Q 110,96 142,82 L 138,102 Q 110,116 82,102 Z" fill="url(#cmdVisor)" filter="drop-shadow(0 0 8px rgba(6,182,212,0.8))"/>
            <line x1="74" y1="92" x2="146" y2="92" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.7"/>
            {/* Micrófono / Intercom lateral */}
            <circle cx="70" cy="115" r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5"/>
            <line x1="72" y1="117" x2="90" y2="128" stroke="#38bdf8" strokeWidth="2"/>
          </g>
        );

      case 'warlord':
        return (
          <g className="transition-all duration-300">
            {/* Señor de la Guerra Drakoniano / Belicista */}
            <defs>
              <linearGradient id="drakonEye" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f87171"/>
                <stop offset="100%" stopColor="#ef4444"/>
              </linearGradient>
            </defs>
            {/* Hombreras de placas colosales con púas de guerra */}
            <path d="M 15,250 L 50,150 L 90,165 L 70,250 Z" fill="#200a0d" stroke="#f43f5e" strokeWidth="2"/>
            <path d="M 205,250 L 170,150 L 130,165 L 150,250 Z" fill="#200a0d" stroke="#f43f5e" strokeWidth="2"/>
            <polygon points="45,150 30,120 58,138" fill="#e11d48" stroke="#fda4af" strokeWidth="1"/>
            <polygon points="175,150 190,120 162,138" fill="#e11d48" stroke="#fda4af" strokeWidth="1"/>
            {/* Pechera pesada draconiana */}
            <path d="M 68,175 L 110,245 L 152,175 Z" fill="#1c0509" stroke="#f43f5e" strokeWidth="2"/>
            {/* Cabeza / Escamas alienígenas acorazadas */}
            <path d="M 65,130 Q 55,65 110,35 Q 165,65 155,130 Q 135,160 110,165 Q 85,160 65,130 Z" fill="#120306" stroke="#e11d48" strokeWidth="3"/>
            {/* Cuernos de cresta */}
            <path d="M 90,45 Q 60,10 40,25 Q 70,45 85,60 Z" fill="#881337" stroke="#f43f5e" strokeWidth="1.5"/>
            <path d="M 130,45 Q 160,10 180,25 Q 150,45 135,60 Z" fill="#881337" stroke="#f43f5e" strokeWidth="1.5"/>
            {/* Ojos reptilianos brillantes */}
            <polygon points="82,88 102,80 96,95" fill="url(#drakonEye)" filter="drop-shadow(0 0 6px #ef4444)"/>
            <polygon points="138,88 118,80 124,95" fill="url(#drakonEye)" filter="drop-shadow(0 0 6px #ef4444)"/>
            {/* Respirador de mandíbula */}
            <path d="M 88,125 L 110,145 L 132,125 L 125,115 L 95,115 Z" fill="#3f0713" stroke="#fda4af" strokeWidth="1.5"/>
            <line x1="98" y1="122" x2="122" y2="122" stroke="#ef4444" strokeWidth="1.5"/>
            <line x1="104" y1="128" x2="116" y2="128" stroke="#ef4444" strokeWidth="1.5"/>
          </g>
        );

      case 'cyborg':
      case 'synth':
        return (
          <g className="transition-all duration-300">
            {/* Mente Sintética Cuántica */}
            <path d="M 45,250 L 70,180 L 150,180 L 175,250 Z" fill="#022c22" stroke="#10b981" strokeWidth="2"/>
            {/* Conductos neuronales */}
            <path d="M 90,180 L 90,140 M 110,180 L 110,140 M 130,180 L 130,140" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3,3"/>
            {/* Busto robótico facetado */}
            <polygon points="110,40 155,75 145,135 110,155 75,135 65,75" fill="#041f1a" stroke="#10b981" strokeWidth="2.5"/>
            {/* Matriz óptica ocular */}
            <circle cx="110" cy="90" r="18" fill="#064e3b" stroke="#34d399" strokeWidth="2"/>
            <circle cx="110" cy="90" r="8" fill="#6ee7b7" className="animate-ping"/>
            <circle cx="110" cy="90" r="5" fill="#a7f3d0"/>
            <line x1="85" y1="90" x2="135" y2="90" stroke="#34d399" strokeWidth="1"/>
            <line x1="110" y1="65" x2="110" y2="115" stroke="#34d399" strokeWidth="1"/>
          </g>
        );

      case 'vortex':
      case 'umbra':
        return (
          <g className="transition-all duration-300">
            {/* Entidad del Vacío / Consciencia Abisal */}
            <circle cx="110" cy="100" r="55" fill="#1e1035" stroke="#a855f7" strokeWidth="2" strokeDasharray="4,4" className="animate-spin-slow"/>
            <circle cx="110" cy="100" r="40" fill="#2e1065" stroke="#c084fc" strokeWidth="1.5"/>
            <circle cx="110" cy="100" r="24" fill="#581c87" filter="drop-shadow(0 0 12px #a855f7)"/>
            {/* Singularidad central */}
            <circle cx="110" cy="100" r="10" fill="#f3e8ff" className="animate-pulse"/>
            {/* Vórtices de energía */}
            <path d="M 60,180 Q 110,230 160,180 Q 180,240 110,250 Q 40,240 60,180 Z" fill="#1e1035" stroke="#c084fc" strokeWidth="1.5" opacity="0.8"/>
          </g>
        );

      default:
        return (
          <g className="transition-all duration-300">
            {/* Emisario Diplomático / Mercader Estelar */}
            <path d="M 45,250 L 75,175 L 145,175 L 175,250 Z" fill="#1a1408" stroke="#f59e0b" strokeWidth="2"/>
            <path d="M 80,135 Q 70,75 110,45 Q 150,75 140,135 Q 110,150 80,135 Z" fill="#0f0b04" stroke="#fbbf24" strokeWidth="2"/>
            {/* Banda sensor diplomática */}
            <rect x="85" y="80" width="50" height="12" rx="3" fill="#b45309" stroke="#fde68a" strokeWidth="1.5"/>
            <circle cx="110" cy="86" r="3" fill="#fef3c7"/>
          </g>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center transition-all duration-300 transform select-none ${
      isSpeaker ? 'scale-105 opacity-100' : 'scale-95 opacity-70 brightness-80'
    }`}>
      {/* Marco de Pantalla Táctica Holográfica */}
      <div className={`relative w-44 h-52 sm:w-48 sm:h-56 md:w-56 md:h-64 rounded-2xl overflow-hidden bg-slate-950/80 border ${
        isSpeaker ? `${theme.borderActive} ${theme.glow}` : theme.border
      } backdrop-blur-md`}>
        
        {/* Haz de proyección holográfica */}
        <div className={`absolute inset-0 bg-gradient-to-t ${theme.holoBeam} pointer-events-none`} />

        {/* Rejilla de coordenadas tácticas HUD de fondo */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}
        />

        {/* Scanlines horizontales de monitor CRT / Enlace cuántico */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)'
          }}
        />

        {/* Esquinas tácticas anguladas de HUD */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/50 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/50 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/50 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/50 pointer-events-none" />

        {/* Indicador de Transmisión Activa */}
        <div className="absolute top-2.5 left-6 right-6 flex items-center justify-between pointer-events-none text-[10px] font-mono tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSpeaker ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`} />
            <span className={theme.accent}>{isSpeaker ? 'EN TRANSMISIÓN' : 'EN ESPERA'}</span>
          </div>
          <span className="text-slate-400 opacity-60">FREQ 84.7 QHz</span>
        </div>

        {/* Silueta / Busto Holográfico SVG */}
        <div className="w-full h-full flex items-center justify-center pt-5">
          <svg viewBox="0 0 220 260" className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(0,0,0,0.8)]">
            {renderEntitySilhouette()}
          </svg>
        </div>

        {/* Efecto de barrido de haz holográfico vertical */}
        {isSpeaker && (
          <div className="absolute inset-x-0 h-1 bg-white/40 shadow-[0_0_10px_#fff] animate-bounce pointer-events-none opacity-40" />
        )}
      </div>

      {/* Cartel de Identificación Táctica Inferior */}
      <div className={`mt-2.5 px-4 py-1 rounded-xl font-mono text-xs md:text-sm font-bold tracking-wide border shadow-lg backdrop-blur-md ${theme.badgeBg}`}>
        {name}
      </div>
    </div>
  );
};
