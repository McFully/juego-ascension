import React from 'react';

export const RedAlertOverlay = React.memo(({ missions }) => {
  if (!missions || missions.length === 0) return null;
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-full max-w-lg animate-in fade-in zoom-in duration-500">
      <div className="bg-red-950/90 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-3 border-b border-red-500/30 pb-2">
          <span className="material-symbols-outlined text-red-500 animate-pulse text-3xl">emergency_home</span>
          <div>
            <h2 className="text-xl font-black text-red-500 uppercase tracking-tighter italic">¡ALERTA ROJA: ATAQUE DETECTADO!</h2>
            <p className="text-[10px] text-red-200/70 font-mono uppercase">Incursión enemiga en curso · Prepárense para impacto</p>
          </div>
        </div>
        <div className="space-y-2">
          {missions.map((m, i) => (
            <div key={i} className="flex justify-between items-center bg-black/40 p-2.5 rounded border border-red-500/20 font-mono">
              <div className="space-y-1">
                <div className="text-xs text-red-400 font-bold">FLOTA HOSTIL EN RUTA A {m.to?.name || `[${m.to?.galaxy}:${m.to?.system}:${m.to?.position}]`}</div>
                <div className="text-[9px] text-slate-400">
                  COMPOSICIÓN: {Object.entries(m.fleet || {}).map(([id, q]) => `${q} ${id}`).join(', ')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-red-500">{m.remainingTicks}s</div>
                <div className="text-[8px] text-red-400/60 uppercase">Impacto</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ============ BADGE COUNTER ============
export const BadgeCounter = React.memo(({ count, onClick }) => (
  <button onClick={onClick}
    className="relative flex items-center justify-center w-8 h-8 rounded-lg glass border border-white/10 text-[var(--ue-text-dim)] hover:text-[var(--ue-accent)] hover:border-[var(--ue-accent)]/40 transition-all"
    title="Notificaciones"
  >
    <span className="material-symbols-outlined text-base">notifications</span>
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
        {count > 99 ? '99+' : count}
      </span>
    )}
  </button>
));

// ============ ATTACK ALERT ============
export const AttackAlert = React.memo(({ count, onClick }) => {
  const alertColor = count > 0 ? 'text-red-400' : 'text-[var(--ue-text-dim)]';
  const pulse = count > 0 ? 'animate-pulse' : '';
  return (
    <button onClick={onClick}
      className={`relative flex items-center justify-center w-8 h-8 rounded-lg glass border border-white/10 ${alertColor} ${pulse} hover:text-red-300 hover:border-red-400/40 transition-all`}
      title="Alertas de Ataque"
    >
      <span className="material-symbols-outlined text-base">emergency_home</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
});

// ============ PERIMETER EMERGENCY ALERT (PUNTO 18) ============
export const PerimeterEmergencyAlert = React.memo(({ hasEnergyCrisis, isUnderSiege }) => {
  if (!hasEnergyCrisis && !isUnderSiege) return null;
  const isRed = isUnderSiege;
  const glowColor = isRed ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.35)';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 animate-pulse transition-opacity duration-700"
      style={{
        boxShadow: `inset 0 0 70px 15px ${glowColor}, inset 0 0 120px 30px ${isRed ? 'rgba(220, 38, 38, 0.25)' : 'rgba(217, 119, 6, 0.15)'}`
      }}
      aria-hidden="true"
    />
  );
});
