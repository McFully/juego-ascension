import React, { useState, useMemo } from 'react';
import { S, MAT_ICONS } from './styles.js';
import { asset, CardBanner, CardImage, REAL_IMAGES, getCardImage } from './assets.jsx';
import { fmt, fmtTime } from './core.jsx';
import { CODEX_DATA } from './data/codex.js';

// ============ STAR FIELD ============
export const StarField = React.memo(() => {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const stars = useMemo(() =>
    Array.from({ length: 240 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.85 + (i % 5 === 0 ? 1.55 : 0.32),
      opacity: Math.random() * 0.72 + 0.28,
      delay: Math.random() * 9,
      duration: 2.8 + Math.random() * 7.5,
      color: i % 11 === 0 ? '#67e8f9' : (i % 7 === 0 ? '#c026ff' : (i % 13 === 0 ? '#f4a261' : '#e0f2fe')),
      layer: i % 3,
    })), []);

  const nebulas = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: 0.6 + Math.random() * 1.85,
      opacity: 0.025 + Math.random() * 0.06,
      hue: 190 + (i * 17),
      layer: i % 3,
      godRay: i % 4 === 0,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,#0a0f1f_0%,#05070f_72%)]" />
      {nebulas.map(n => {
        return (
          <div key={`neb-${n.id}`} className="absolute rounded-full blur-[82px]"
            style={{
              left: `${n.x}%`, top: `${n.y}%`,
              width: `${n.scale * 39}vw`, height: `${n.scale * 39}vw`,
              background: n.godRay
                ? `linear-gradient(135deg, hsla(${n.hue}, 95%, 82%, ${n.opacity * 0.9}) 0%, transparent 55%, hsla(${n.hue + 20}, 80%, 70%, ${n.opacity * 0.4}) 85%, transparent 100%)`
                : `radial-gradient(circle, hsla(${n.hue}, 92%, 76%, ${n.opacity}) 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
      {stars.map(s => {
        const isBright = s.size > 1.2;
        return (
          <div key={s.id} className="absolute rounded-full"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: `${s.size}px`, height: `${s.size}px`,
              background: s.color, opacity: s.opacity,
              boxShadow: isBright
                ? `0 0 ${s.size * 3}px ${s.color}, 0 0 ${s.size * 6}px ${s.color}33, 0 0 ${s.size * 9}px ${s.color}11`
                : `0 0 ${s.size * 2.6}px ${s.color}, 0 0 ${s.size * 4.5}px ${s.color}22`,
            }}
          />
        );
      })}
      <div className="absolute inset-0 opacity-[0.023]" style={{ backgroundImage: 'radial-gradient(white 0.55px, transparent 0)', backgroundSize: '2.8px 2.8px' }} />
      <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: 'radial-gradient(white 0.4px, transparent 0)', backgroundSize: '1.6px 1.6px' }} />
      <div className="absolute inset-0 opacity-[0.012]" style={{ background: 'radial-gradient(circle at 25% 30%, rgba(103,232,249,0.08) 0%, transparent 45%), radial-gradient(circle at 72% 65%, rgba(192,38,255,0.06) 0%, transparent 50%)' }} />
      <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(135deg,transparent_40%,rgba(103,232,249,0.15)_50%,transparent_60%)]" style={{ backgroundSize: '200% 200%' }} />
    </div>
  );
});

// ============ PROGRESS BAR ============
export const ProgressBar = React.memo(({ value, max, color = 'from-cyan-500 to-blue-500', height = 'h-1.5', pulse = false }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={`w-full bg-[#05070f] border border-white/10 rounded-full overflow-hidden relative ${height} fresnel`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20" />
      <div className={`bg-gradient-to-r ${color} ${height} relative`}
        style={{
          width: `${pct}%`,
          boxShadow: '0 0 14px rgba(6,182,212,0.55), inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -1px 0 rgba(0,0,0,0.25)',
          transition: 'width 0.32s cubic-bezier(0.23, 1.0, 0.32, 1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/32 via-white/12 to-transparent" />
      </div>
    </div>
  );
});

// ============ TOOLTIP ============
export const Tooltip = React.memo(({ text, children }) => (
  <div className="relative group inline-block">
    {children}
    {text && (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 glass-deep holographic rounded-lg text-xs text-slate-200 whitespace-normal min-w-[120px] max-w-[200px] opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-2xl border border-[var(--ue-accent)]/30 data-text fresnel">
        {text}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0a0d1a] border-b border-r border-[var(--ue-accent)]/30 rotate-45" />
      </div>
    )}
  </div>
));

// ============ RESOURCE BADGE ============
export const ResourceBadge = React.memo(({ icon, label, value, rate, color, tooltip }) => {
  const matIcon = MAT_ICONS[icon] || 'inventory_2';
  return (
    <div className="glass-deep cursor-default flex items-center gap-2 px-3 h-full rounded-xl border border-white/10 transition-all unreal-panel fresnel specular">
      <span className="material-symbols-outlined engraved-icon text-lg">{matIcon}</span>
      <span className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--ue-text-dim)]">{label}</span>
      <span className={`text-sm font-technical-md font-bold ${S.dataGlow}`}>{typeof value === 'string' ? value : fmt(value)}</span>
      {rate !== undefined && (
        <span className="text-xs font-technical-md text-emerald-400/80 font-medium">+{fmt(rate)}/h</span>
      )}
    </div>
  );
});

// ============ RESOURCE BAR ============
export const ResourceBar = React.memo(({ planet, research, reputation, taxRate = 0, calcProduction, calcStorage, getGalacticAlignment, GAME_SPEED }) => {
  if (!planet || !planet.resources) return <div className="text-[10px] text-slate-500 font-mono">Inicializando telemetría...</div>;
  let prod;
  try {
    prod = calcProduction(
      planet.buildings || {}, research || {}, planet.temperature || 20, GAME_SPEED,
      planet.faction || 'human', planet.biome, planet.gravity, planet.trait,
      planet.specialization, { galaxy: planet.galaxy, system: planet.system, position: planet.position }, taxRate
    );
  } catch (e) {
    prod = { metal: 0, crystal: 0, deuterium: 0, energyProd: 0, energyCons: 0, energyBalance: 0, ratio: 1 };
  }
  const storage = calcStorage(planet.buildings || {});
  const energyPrefix = (prod.energyBalance || 0) >= 0 ? '+' : '';
  const displayRep = Math.round(reputation || 0);
  const repPrefix = displayRep > 0 ? '+' : '';

  const pop = planet.population || 1000;
  const popMetal = Math.round(pop * 0.00002 * 3600);
  const popCrystal = Math.round(pop * 0.00001 * 3600);
  const popDeut = Math.round(pop * 0.000005 * 3600);

  const netMetal = Math.max(0, prod.metal - popMetal);
  const netCrystal = Math.max(0, prod.crystal - popCrystal);
  const netDeut = Math.max(0, prod.deuterium - popDeut);

  return (
    <div className="h-full flex items-stretch gap-2">
      <ResourceBadge icon="metal" label="Metal" value={planet.resources.metal || 0} rate={netMetal} />
      <ResourceBadge icon="crystal" label="Cristal" value={planet.resources.crystal || 0} rate={netCrystal} />
      <ResourceBadge icon="deuterium" label="Deuterio" value={planet.resources.deuterium || 0} rate={netDeut} />
      <ResourceBadge icon="energy" label="Energía" value={`${energyPrefix}${fmt(prod.energyBalance)}`} />
      <ResourceBadge icon="reputation" label="Reputación" value={`${repPrefix}${displayRep}`} />
    </div>
  );
});

// ============ RED ALERT OVERLAY ============
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

// ============ QUEUE DISPLAY ============
export const QueueDisplay = React.memo(({ title, icon, queue, names, color, onCancel }) => {
  if (!queue || queue.length === 0) return null;
  return (
    <div className={`${S.cardInner} mb-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <span className="font-semibold">{title}</span>
        <span className={`${S.badge} bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`}>{queue.length}</span>
      </div>
      <div className="space-y-2">
        {queue.map((item, idx) => {
          const nameKey = item.buildingId || item.researchId || item.shipId || item.defenseId;
          const info = names[nameKey];
          const remaining = Math.max(0, (item.endTime - Date.now()) / 1000);
          const total = (item.endTime - item.startTime) / 1000;
          return (
            <div key={item.id || idx} className={S.listItem}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-sm">
                  <span>{info?.icon || '📦'}</span>
                  <span>{info?.name || nameKey}</span>
                  {item.level && <span className="text-xs text-slate-400">→ Nv.{item.level}</span>}
                  {item.quantity > 1 && <span className="text-xs text-cyan-400">x{item.quantity}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400">
                    {fmtTime(remaining)} ({total > 0 ? Math.min(100, Math.floor(((total - remaining) / total) * 100)) : 0}%)
                  </span>
                  {onCancel && <button onClick={() => onCancel(item.id)} className="text-[10px] text-red-400/50 hover:text-red-300">✕</button>}
                </div>
              </div>
              <ProgressBar value={total - remaining} max={total} color="from-cyan-500 to-blue-500" pulse={remaining < 5} />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export const ItemCard = React.memo(({ icon, name, level, cost, canAfford, meetsRequirements, time, onAction, actionLabel, extra, prodInfo, maxLevel, maxReached, id, onOpenCodex, category }) => {
  const [clicked, setClicked] = React.useState(false);
  React.useEffect(() => {
    if (clicked) {
      const t = setTimeout(() => setClicked(false), 500);
      return () => clearTimeout(t);
    }
  }, [clicked]);

  return (
    <div className={S.card}>
      <CardBanner id={id} category={category} />
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="font-bold text-white text-base drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]">{name}</div>
              <button onClick={(e) => { e.stopPropagation(); onOpenCodex(id); }}
                className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-[var(--ue-accent)] hover:border-[var(--ue-accent)]/40 hover:bg-[var(--ue-accent)]/10 transition-all group/info"
                title="Ver detalles"
              >
                <span className="material-symbols-outlined text-[12px] group-hover/info:scale-110 transition-transform">menu_book</span>
              </button>
            </div>
            <div className="text-xs text-slate-400 font-medium">Nivel {level}{maxLevel ? ` / ${maxLevel}` : ''}</div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {prodInfo && (prodInfo.kind === 'mine' || prodInfo.kind === 'power') && (
          <div className="text-[10px] space-y-0.5 mb-2 px-1 py-1.5 rounded bg-slate-950/40 border border-slate-800/60">
            <div className="flex justify-between">
              <span className="text-slate-500">Actual:</span>
              <span className="text-slate-300 font-mono">{prodInfo.current.resourceIcon} {fmt(prodInfo.current.prod)}/h{prodInfo.current.cons > 0 && <span className="text-slate-500"> {prodInfo.current.consIcon} -{fmt(prodInfo.current.cons)}/h</span>}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800/40 pt-0.5">
              <span className="text-slate-500">Nv.{level + 1}:</span>
              <span className="text-cyan-300 font-mono">{prodInfo.next.resourceIcon} {fmt(prodInfo.next.prod)}/h{prodInfo.deltaProd !== 0 && <span className="text-emerald-400"> (+{fmt(prodInfo.deltaProd)})</span>}</span>
            </div>
            {prodInfo.next.cons > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Cons. Nv.{level + 1}:</span>
                <span className="text-amber-300 font-mono">{prodInfo.next.consIcon} -{fmt(prodInfo.next.cons)}/h{prodInfo.deltaCons !== 0 && <span className={prodInfo.deltaCons > 0 ? 'text-red-400' : 'text-emerald-400'}> ({prodInfo.deltaCons > 0 ? '+' : ''}{fmt(prodInfo.deltaCons)})</span>}</span>
              </div>
            )}
          </div>
        )}
        {prodInfo && prodInfo.kind === 'storage' && (
          <div className="text-[10px] space-y-0.5 mb-2 px-1 py-1.5 rounded bg-slate-950/40 border border-slate-800/60">
            <div className="flex justify-between"><span className="text-slate-500">Actual:</span><span className="text-slate-300 font-mono">📦 {fmt(prodInfo.current.capacity)}</span></div>
            <div className="flex justify-between border-t border-slate-800/40 pt-0.5"><span className="text-slate-500">Nv.{level + 1}:</span><span className="text-cyan-300 font-mono">📦 {fmt(prodInfo.next.capacity)} <span className="text-emerald-400">(+{fmt(prodInfo.deltaCapacity)})</span></span></div>
          </div>
        )}
        {prodInfo && prodInfo.kind === 'facility' && (
          <div className="text-[10px] mb-2 px-1 py-1.5 rounded bg-slate-950/40 border border-slate-800/60 text-slate-500 text-center">Instalación · Nv.{level} → Nv.{level + 1}</div>
        )}
        {prodInfo && prodInfo.kind === 'civil' && (
          <div className="text-[10px] mb-2 px-1 py-1.5 rounded bg-slate-950/40 border border-slate-800/60 text-slate-400 text-center">🏛️ Mejora civil/gobierno · Nv.{level} → Nv.{level + 1}</div>
        )}
        {prodInfo && prodInfo.kind === 'research' && (
          <div className="text-[10px] space-y-0.5 mb-2 px-1 py-1.5 rounded bg-slate-950/40 border border-slate-800/60">
            <div className="text-slate-400 font-semibold mb-1">{prodInfo.current.effect}</div>
            {prodInfo.current.mult && (
              <div className="flex justify-between">
                <span className="text-slate-500">Mult. Actual:</span>
                <span className="text-slate-200 font-mono font-bold">{prodInfo.current.mult} <span className="text-slate-500">(+{prodInfo.current.bonus}%)</span></span>
              </div>
            )}
            {prodInfo.next.mult && (
              <div className="flex justify-between border-t border-slate-800/40 pt-0.5">
                <span className="text-slate-500">Nv.{level + 1}:</span>
                <span className="text-cyan-300 font-mono font-bold">{prodInfo.next.mult} <span className="text-emerald-400">(+{prodInfo.next.bonus}%)</span></span>
              </div>
            )}
            {!prodInfo.current.mult && prodInfo.current.bonus !== undefined && <div className="flex justify-between"><span className="text-slate-500">Actual:</span><span className="text-slate-300 font-mono">+{prodInfo.current.bonus}{prodInfo.unit}</span></div>}
            {!prodInfo.next.mult && prodInfo.next.bonus !== undefined && <div className="flex justify-between border-t border-slate-800/40 pt-0.5"><span className="text-slate-500">Nv.{level + 1}:</span><span className="text-cyan-300 font-mono">+{prodInfo.next.bonus}{prodInfo.unit} <span className="text-emerald-400">(+{prodInfo.delta}{prodInfo.unit})</span></span></div>}
            {prodInfo.current.bonus === undefined && <div className="flex justify-between border-t border-slate-800/40 pt-0.5"><span className="text-slate-500">Nv.{level + 1}:</span><span className="text-cyan-300">Activo</span></div>}
          </div>
        )}
        {extra && <div className="text-xs text-slate-400 mb-3">{extra}</div>}
        <div className="space-y-1 mb-3">
          {cost.metal > 0 && <div className="flex justify-between text-xs"><span className="text-amber-400">⛏️ Metal</span><span>{fmt(cost.metal)}</span></div>}
          {cost.crystal > 0 && <div className="flex justify-between text-xs"><span className="text-cyan-400">💎 Cristal</span><span>{fmt(cost.crystal)}</span></div>}
          {cost.deuterium > 0 && <div className="flex justify-between text-xs"><span className="text-emerald-400">⚗️ Deuterio</span><span>{fmt(cost.deuterium)}</span></div>}
          {time > 0 && <div className="flex justify-between text-xs"><span className="text-slate-400">⏱️ Tiempo</span><span className="text-cyan-400">{fmtTime(time)}</span></div>}
        </div>
      </div>
      <div className="flex gap-2 mt-auto">
        <button onClick={(e) => { setClicked(true); onAction(e); }}
          disabled={!canAfford || !meetsRequirements || maxReached || clicked}
          className={`flex-1 ${S.btn} ${canAfford && meetsRequirements && !maxReached && !clicked ? S.btnPrimary : S.btnGhost}`}
        >
          {clicked ? '⌛ Procesando...' : maxReached ? 'Máximo alcanzado' : !meetsRequirements ? '🔒 Requisitos' : canAfford ? actionLabel : '💸 Sin recursos'}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onOpenCodex(id); }}
          className={`px-3 ${S.btn} ${S.btnGhost} flex items-center justify-center`}
          title="Ver detalles"
        >
          ℹ️ Detalles
        </button>
      </div>
    </div>
  );
});

// ============ CODEX MODAL ============
export const CodexModal = React.memo(({ id, onClose, BUILDINGS, RESEARCH, SHIPS, DEFENSES }) => {
  const data = CODEX_DATA[id];
  if (!data) return null;

  const getTechStats = () => {
    if (SHIPS && SHIPS[id]) {
      const s = SHIPS[id];
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-mono">
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">ATAQUE</span><span className="text-rose-400 font-bold">{fmt(s.atk)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">ESCUDO</span><span className="text-cyan-400 font-bold">{fmt(s.shd)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">CASCO</span><span className="text-emerald-400 font-bold">{fmt(s.hull)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">CARGA</span><span className="text-amber-400 font-bold">{fmt(s.cargo)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">VELOCIDAD</span><span className="text-blue-400 font-bold">{fmt(s.speed)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">MOTOR</span><span className="text-slate-300 uppercase">{s.drive || 'N/A'}</span></div>
        </div>
      );
    }
    if (DEFENSES && DEFENSES[id]) {
      const d = DEFENSES[id];
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-mono">
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">ATAQUE</span><span className="text-rose-400 font-bold">{fmt(d.atk)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">ESCUDO</span><span className="text-cyan-400 font-bold">{fmt(d.shd)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">CASCO</span><span className="text-emerald-400 font-bold">{fmt(d.hull)}</span></div>
        </div>
      );
    }
    return <p className="text-xs text-slate-400 font-mono leading-relaxed">{data.stats}</p>;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 zoom-in-95" onClick={onClose}>
      <div className="bg-[#0a0c14] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="relative h-64 bg-black/60 flex items-center justify-center overflow-hidden border-b border-white/5 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-[#0a0c14]/20 to-transparent z-10"></div>
          <CardBanner id={id} className="w-full h-full object-cover opacity-70 scale-105" />
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.02),rgba(0,0,255,0.04))] bg-[size:100%_4px,3px_100%]" />
          <div className="absolute bottom-6 left-8 z-20">
            <div className="text-[10px] font-black text-[var(--ue-accent)] uppercase tracking-[0.3em] mb-1 drop-shadow-md">Registro de Inteligencia</div>
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{data.name}</h2>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all z-30 group">
            <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent_40%)]">
          <section className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[var(--ue-accent)]/20 rounded-full"></div>
            <h4 className="text-[11px] font-black text-[var(--ue-accent)] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">history_edu</span>Archivos Históricos
            </h4>
            <p className="text-sm text-slate-300 font-serif leading-relaxed italic pl-2 border-l border-white/5">"{data.lore}"</p>
          </section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section className="space-y-4">
              <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">settings_suggest</span>Especificaciones Técnicas
              </h4>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">{getTechStats()}</div>
            </section>
            <section className="space-y-4">
              <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">military_tech</span>Protocolo Operativo
              </h4>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-slate-400 font-mono leading-relaxed">{data.usage}</p>
              </div>
            </section>
          </div>
          <div className="pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
              <span className="material-symbols-outlined text-blue-400">tips_and_updates</span>
              <p className="text-[10px] text-slate-500 font-mono">RECOMENDACIÓN: Mantener niveles equilibrados para optimizar el consumo de energía y la eficiencia estructural.</p>
            </div>
          </div>
        </div>
        <div className="bg-black/60 p-5 border-t border-white/5 flex justify-between items-center px-10 shrink-0">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">NRIA DATABASE · NO. 8449-ALPHA</span>
            <span className="text-[8px] text-slate-700 font-mono">Holographic Encrypted Stream · v1.0.64</span>
          </div>
          <button onClick={onClose} className="py-2.5 px-8 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase hover:bg-white/10 hover:border-white/20 transition-all tracking-widest">Desconectar</button>
        </div>
      </div>
    </div>
  );
});

// ============ NARRATIVE EVENT OVERLAY ============
export const NarrativeEventOverlay = React.memo(({ event, dispatch, resources }) => {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-700">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.3)] relative z-10 animate-in slide-in-from-bottom-12 duration-500">
        <div className="relative h-64 bg-black/40 flex items-center justify-center overflow-hidden border-b border-white/5 group">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
          {event.image ? (
            <img src={asset(event.image)} alt={event.title} className="w-full h-full object-cover opacity-60 scale-110 group-hover:scale-105 group-hover:opacity-80 transition-all duration-[2s]" />
          ) : (
            <span className="material-symbols-outlined text-9xl text-slate-500 opacity-20">emergency</span>
          )}
          <div className="absolute top-4 left-6 px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em] z-20 backdrop-blur-md flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            Alerta de {event.type === 'crisis' ? 'Crisis' : 'Descubrimiento'} Nivel Omega
          </div>
          <button onClick={() => dispatch({ type: 'CLEAR_ACTIVE_EVENT' })} className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all z-30 group">
            <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">close</span>
          </button>
          <h2 className="absolute bottom-6 left-8 text-4xl font-black text-white uppercase italic tracking-tighter z-20 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">{event.title}</h2>
        </div>
        <div className="p-8 space-y-8">
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-4xl text-cyan-500 opacity-80 mt-1">info</span>
              <p className="text-sm md:text-base text-slate-300 font-serif leading-relaxed italic border-l-2 border-cyan-500/30 pl-4 py-1">"{event.description}"</p>
            </div>
          </section>
          <div className="grid grid-cols-1 gap-4 pt-6 border-t border-white/5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-2">Acciones Disponibles para el Comandante</span>
            {event.options.map((opt, idx) => {
              const affordable = !opt.cost || Object.entries(opt.cost).every(([k, v]) => (resources?.[k] || 0) >= v);
              return (
                <button 
                  key={idx} 
                  disabled={!affordable}
                  onClick={() => dispatch({ type: 'RESOLVE_NARRATIVE_EVENT', eventId: event.id, optionIdx: idx })}
                  className={`w-full p-5 text-left bg-black/40 border border-white/10 rounded-xl transition-all flex justify-between items-center group relative overflow-hidden ${
                    affordable 
                      ? 'hover:bg-cyan-500/10 hover:border-cyan-500/50 cursor-pointer' 
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <div className="flex flex-col gap-1.5 relative z-10">
                    <span className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-cyan-400 transition-colors">{opt.label || opt.text}</span>
                    {Object.keys(opt.cost || {}).length > 0 && (
                      <span className="text-[10px] text-rose-400 font-mono uppercase font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[12px]">monetization_on</span>
                        Costo: {Object.entries(opt.cost).map(([k, v]) => `${v.toLocaleString()} ${k}`).join(' ')}
                      </span>
                    )}
                  </div>
                  <span className="material-symbols-outlined text-slate-600 group-hover:text-cyan-400 transition-colors relative z-10">chevron_right</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
