import React from 'react';

/**
 * NavigationTile — Tile grande de navegación estilo videojuego.
 * Acceso visual a secciones del juego con icono, estado, progreso y counters.
 */
export const NavigationTile = React.memo(({
  icon,
  title,
  subtitle,
  onClick,
  progress,        // 0-100 o null
  counter,         // número para badge
  status,          // 'available' | 'locked' | 'active' | 'building' | 'upgrade' | 'new'
  disabled = false,
  size = 'md',     // 'sm' | 'md' | 'lg'
  className = '',
}) => {
  const isLocked = status === 'locked' || disabled;

  const sizeClasses = {
    sm: 'w-28 h-28 p-3',
    md: 'w-36 h-36 p-4',
    lg: 'w-44 h-44 p-5',
  };

  const statusBadge = {
    building: { text: '🔨 En curso', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    upgrade: { text: '⬆️ Mejora', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse' },
    new: { text: '✨ Nuevo', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' },
    locked: { text: '🔒 Bloqueado', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
    active: { text: '● Activo', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  };

  const badge = status && statusBadge[status];

  return (
    <button
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={`
        nav-tile group relative flex flex-col items-center justify-center gap-2
        ${sizeClasses[size] || sizeClasses.md}
        rounded-2xl border transition-all duration-250 select-none
        ${isLocked
          ? 'bg-black/60 border-white/5 opacity-50 cursor-not-allowed grayscale'
          : 'bg-[#0a0d1a]/80 border-white/10 hover:border-cyan-500/50 hover:bg-[#0c1225]/90 cursor-pointer hover:scale-[1.04] hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] active:scale-[0.98]'
        }
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070f]
        ${className}
      `}
      aria-label={title}
      role="link"
    >
      {/* Status badge */}
      {badge && (
        <span className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${badge.color} z-10`}>
          {badge.text}
        </span>
      )}

      {/* Counter badge */}
      {counter != null && counter > 0 && !badge && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center px-1 rounded-full bg-cyan-500/90 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(6,182,212,0.5)] z-10">
          {counter > 99 ? '99+' : counter}
        </span>
      )}

      {/* Icono principal */}
      <div className={`text-3xl transition-transform duration-200 ${!isLocked ? 'group-hover:scale-110' : ''}`}>
        {icon}
      </div>

      {/* Título */}
      <span className="text-xs font-bold text-white text-center leading-tight tracking-wide uppercase">
        {title}
      </span>

      {/* Subtítulo */}
      {subtitle && (
        <span className="text-[9px] text-slate-400 font-mono text-center leading-tight">
          {subtitle}
        </span>
      )}

      {/* Barra de progreso */}
      {progress != null && (
        <div className="w-full mt-1">
          <div className="w-full h-1 bg-[#05070f] rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Overlay de bloqueo */}
      {isLocked && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/40">
          <span className="text-2xl opacity-60">🔒</span>
        </div>
      )}
    </button>
  );
});
