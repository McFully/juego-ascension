import React, { useMemo, useState } from 'react';
import { TacticalEventDetail } from '../components/ui/TacticalEventDetail.jsx';

/**
 * TelemetryPage — Bandeja de comunicaciones (Registro Táctico Imperial).
 *
 * 3.5-b — Sustituye a los overlays que se abrían solos. Aquí nada aparece por
 * sorpresa: la lista está siempre, el jugador pincha lo que quiere leer, y el
 * mensaje se marca leído AL ABRIRLO. El historial se conserva; "vaciar leídos"
 * es explícito.
 */

/** Filtros por clase, con el `type` real del evento en vez de heurísticas sobre texto. */
const CATEGORIES = [
  { id: 'all', label: 'Todas', match: () => true },
  { id: 'colonization', label: 'Colonización', match: (e) => e.type === 'colonize' },
  { id: 'transport', label: 'Transporte', match: (e) => e.type?.startsWith('transport') || e.type?.startsWith('recycle') },
  { id: 'combat', label: 'Combate', match: (e) => e.type?.startsWith('combat') },
  { id: 'espionage', label: 'Espionaje', match: (e) => e.type?.startsWith('espionage') },
  { id: 'expedition', label: 'Expedición', match: (e) => e.type === 'expedition' },
  { id: 'diplomatic', label: 'Diplomáticas', match: (e) => e.kind === 'transmission' || e.kind === 'firstContact' },
  { id: 'narrative', label: 'Narrativas', match: (e) => e.kind === 'narrative' },
];

const PRIORITY_BORDER = {
  baja: 'border-l-slate-600',
  media: 'border-l-cyan-500',
  alta: 'border-l-amber-500',
  critica: 'border-l-red-500',
};

const formatStamp = (ts) => {
  const d = ts ? new Date(ts) : new Date();
  return d.toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
};

export const TelemetryPage = ({ state, dispatch, safeSetActiveTab }) => {
  const log = state?.tacticalEventLog || [];
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const unreadCount = log.filter((e) => !e.read).length;
  const pendingDecisions = log.filter((e) => !e.read && e.requiresDecision).length;

  const counts = useMemo(() => {
    const out = {};
    for (const c of CATEGORIES) out[c.id] = log.filter(c.match).length;
    return out;
  }, [log]);

  const activeCat = CATEGORIES.find((c) => c.id === filter) || CATEGORIES[0];

  // Lo no leído primero; dentro de cada grupo, lo más reciente arriba.
  const visible = useMemo(() => {
    const list = log.filter(activeCat.match);
    return [...list].sort((a, b) => {
      const ar = a.read ? 1 : 0;
      const br = b.read ? 1 : 0;
      if (ar !== br) return ar - br;
      return (b.receivedAt || 0) - (a.receivedAt || 0);
    });
  }, [log, activeCat]);

  const selected = useMemo(
    () => visible.find((e) => e.id === selectedId) || null,
    [visible, selectedId]
  );

  const handleOpen = (entry) => {
    setSelectedId(entry.id);
    // 3.5-c — marcar leído NO borra: solo baja el contador.
    if (!entry.read) {
      dispatch({ type: 'MARK_TACTICAL_EVENT_READ', payload: entry.id });
    }
  };

  const markAllRead = () => dispatch({ type: 'MARK_ALL_TACTICAL_EVENTS_READ' });
  const clearRead = () => {
    dispatch({ type: 'CLEAR_READ_TACTICAL_EVENTS' });
    setSelectedId(null);
  };

  return (
    <div className="space-y-5 view-enter w-full">
      {/* Cabecera */}
      <header className="bg-[#090d1f] border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm md:text-base font-black text-cyan-300 font-mono tracking-wider uppercase flex items-center gap-2">
            <span>📡</span>
            <span>Registro Táctico Imperial</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            Nada se abre solo. Tú decides cuándo leer.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className={`block text-2xl font-black font-mono leading-none ${
              pendingDecisions > 0 ? 'text-red-400' : unreadCount > 0 ? 'text-amber-400' : 'text-slate-500'
            }`}>
              {unreadCount}
            </span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Sin leer</span>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/40 hover:bg-cyan-900/60 text-cyan-300 text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              Marcar todo leído
            </button>
          )}
        </div>
      </header>

      {/* Aviso de decisión pendiente: no se descarta sola. */}
      {pendingDecisions > 0 && (
        <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-400">priority_high</span>
          <p className="text-xs text-red-200 font-mono">
            {pendingDecisions === 1
              ? 'Hay 1 comunicación con una decisión pendiente.'
              : `Hay ${pendingDecisions} comunicaciones con decisiones pendientes.`}
            {' '}Se quedan aquí hasta que las resuelvas.
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer border ${
              filter === c.id
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200'
                : 'bg-black/40 border-white/10 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300'
            }`}
          >
            {c.label} ({counts[c.id] || 0})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Lista estilo correo */}
        <div className="space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
          {visible.length === 0 ? (
            <div className="bg-[#090d1f] border border-white/10 rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-700">inbox</span>
              <p className="text-xs text-slate-500 font-mono mt-2">
                No hay comunicaciones en esta categoría.
              </p>
            </div>
          ) : (
            visible.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => handleOpen(entry)}
                className={`w-full text-left bg-[#090d1f] border border-white/10 border-l-4 ${
                  PRIORITY_BORDER[entry.priority] || PRIORITY_BORDER.media
                } rounded-xl p-3 transition-all hover:border-cyan-500/40 hover:bg-[#0c1229] ${
                  selectedId === entry.id ? 'ring-1 ring-cyan-500/50' : ''
                } ${entry.read ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white font-mono truncate">
                    {entry.minister?.name || entry.faction || 'Comando Imperial'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono shrink-0">
                    {formatStamp(entry.receivedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {!entry.read && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" title="Sin leer" />
                  )}
                  <span className="text-[11px] text-slate-300 font-mono truncate">
                    {entry.title}
                  </span>
                  {entry.requiresDecision && !entry.read && (
                    <span className="text-[9px] text-red-400 font-bold uppercase shrink-0">
                      decisión
                    </span>
                  )}
                </div>
              </button>
            ))
          )}

          {log.some((e) => e.read) && (
            <button
              type="button"
              onClick={clearRead}
              className="w-full px-3 py-2 rounded-xl border border-white/10 text-[10px] text-slate-500 hover:text-slate-300 hover:border-white/25 transition-all cursor-pointer font-mono uppercase"
            >
              Vaciar leídos ({log.filter((e) => e.read).length})
            </button>
          )}
        </div>

        {/* Detalle */}
        <div className="lg:sticky lg:top-4">
          {selected ? (
            <TacticalEventDetail
              event={selected}
              onNavigatePlanet={(planetId) => {
                dispatch({ type: 'SET_PLANET', planetId });
                if (safeSetActiveTab) safeSetActiveTab('overview');
              }}
              footer={
                <button
                  onClick={() => setSelectedId(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  <span>Entendido</span>
                </button>
              }
            />
          ) : (
            <div className="bg-[#090d1f] border border-white/10 rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-700">mark_email_unread</span>
              <p className="text-xs text-slate-500 font-mono mt-2">
                Selecciona una comunicación para leerla.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
