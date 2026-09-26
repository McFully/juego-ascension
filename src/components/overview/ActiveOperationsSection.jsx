import React from 'react';
import { SafeImg } from '../../assets.jsx';
import { MINISTRY_MAPPING } from '../../data/buildingOperationsData.js';

/**
 * ActiveOperationsSection — Renderizado modular de operaciones y colas activas en OverviewPage.
 * Tarjetas rectangulares con 2 columnas (izquierda: info/imagen, derecha: cuenta atrás/progreso)
 * separadas por un divisor vertical, sin botón superfluo y con navegación directa al ministerio.
 */
export const ActiveOperationsSection = ({
  activeItems = [],
  state,
  currentPlanet,
  dispatch,
  handleNavigate,
  fmtTime,
  filter: externalFilter,
  setFilter: externalSetFilter
}) => {
  const [internalFilter, setInternalFilter] = React.useState(null);
  const filter = externalFilter !== undefined ? externalFilter : internalFilter;
  const setFilter = externalSetFilter || setInternalFilter;

  const radius = 20;
  const circumference = 2 * Math.PI * radius;

  // Determinar la pestaña o ministerio de destino idóneo para cada elemento
  const getDestination = (item) => {
    if (item.type === 'building') {
      const minEntry = Object.values(MINISTRY_MAPPING).find(m => (m.buildings || []).includes(item.id));
      if (minEntry) {
        return `ministry_${minEntry.id}`;
      }
      return 'buildings';
    }
    if (item.type === 'research') return 'research';
    if (item.type === 'ship') return 'shipyard';
    return 'defense';
  };

  // Configuración de colores sincronizada entre etiquetas superiores, badges y bordes
  const TYPE_THEMES = {
    building: {
      badgeBg: 'bg-cyan-500/20',
      badgeText: 'text-cyan-300',
      badgeBorder: 'border-cyan-500/40',
      borderHover: 'hover:border-cyan-400',
      hoverBg: 'hover:bg-[#09152b]',
      shadowHover: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]',
      glowColor: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
      titleHover: 'group-hover:text-cyan-300',
      imgBorderHover: 'group-hover:border-cyan-400/80',
      dividerHover: 'group-hover:bg-cyan-400/30',
      timerText: 'text-cyan-300',
      timerShadow: 'drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]',
      gradId: 'grad-cyan',
      stop1: '#06b6d4',
      stop2: '#38bdf8',
    },
    research: {
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-300',
      badgeBorder: 'border-purple-500/40',
      borderHover: 'hover:border-purple-400',
      hoverBg: 'hover:bg-[#150a2b]',
      shadowHover: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
      glowColor: 'bg-purple-500/10 group-hover:bg-purple-500/20',
      titleHover: 'group-hover:text-purple-300',
      imgBorderHover: 'group-hover:border-purple-400/80',
      dividerHover: 'group-hover:bg-purple-400/30',
      timerText: 'text-purple-300',
      timerShadow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]',
      gradId: 'grad-purple',
      stop1: '#a855f7',
      stop2: '#c084fc',
    },
    ship: {
      badgeBg: 'bg-amber-500/20',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-500/40',
      borderHover: 'hover:border-amber-400',
      hoverBg: 'hover:bg-[#1a1208]',
      shadowHover: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
      glowColor: 'bg-amber-500/10 group-hover:bg-amber-500/20',
      titleHover: 'group-hover:text-amber-300',
      imgBorderHover: 'group-hover:border-amber-400/80',
      dividerHover: 'group-hover:bg-amber-400/30',
      timerText: 'text-amber-300',
      timerShadow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]',
      gradId: 'grad-amber',
      stop1: '#f59e0b',
      stop2: '#fbbf24',
    },
    defense: {
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-500/40',
      borderHover: 'hover:border-emerald-400',
      hoverBg: 'hover:bg-[#061b16]',
      shadowHover: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]',
      glowColor: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
      titleHover: 'group-hover:text-emerald-300',
      imgBorderHover: 'group-hover:border-emerald-400/80',
      dividerHover: 'group-hover:bg-emerald-400/30',
      timerText: 'text-emerald-300',
      timerShadow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      gradId: 'grad-emerald',
      stop1: '#10b981',
      stop2: '#34d399',
    }
  };

  const planets = state?.planets || [];
  const buildQueue = state?.buildQueue || [];
  const allShipQueues = [...(state?.shipQueue || []), ...(state?.customShipQueue || [])];
  const allDefenseQueues = state?.defenseQueue || [];

  // Filtrado reactivo de items
  const filteredItems = React.useMemo(() => {
    if (!filter) return activeItems;
    return activeItems.filter(item => {
      if (filter.type === 'research') {
        return item.type === 'research';
      }
      if (filter.type && filter.planetId !== undefined) {
        return item.type === filter.type && item.planetId === filter.planetId;
      }
      return true;
    });
  }, [activeItems, filter]);

  const hasItems = filteredItems && filteredItems.length > 0;

  const toggleFilter = (targetFilter) => {
    setFilter(prev => {
      if (!prev) return targetFilter;
      if (prev.type === targetFilter.type && prev.planetId === targetFilter.planetId) {
        return null; // Desactivar filtro al pulsar de nuevo
      }
      return targetFilter;
    });
    if (window.playSfx) window.playSfx('click');
  };

  const getEmptyFilterMessage = () => {
    if (!filter) return 'No hay operaciones en curso en este momento';
    if (filter.type === 'research') return 'No hay ahora mismo operaciones activas en I+D';
    if (filter.type === 'ship') return 'No hay ahora mismo operaciones activas en el astillero';
    if (filter.type === 'building') return 'No hay ahora mismo operaciones activas en obras';
    if (filter.type === 'defense') return 'No hay ahora mismo operaciones activas en defensas';
    return 'No hay operaciones en curso en este momento';
  };

  return (
    <section className="space-y-4 w-full pt-1 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          {/* I+D Imperio */}
          {(() => {
            const isSelected = filter?.type === 'research';
            return (
              <button
                type="button"
                onClick={() => toggleFilter({ type: 'research' })}
                className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer border ${
                  isSelected
                    ? 'text-purple-200 bg-purple-800 border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)] scale-105'
                    : 'text-purple-300 bg-purple-950/60 border-purple-500/30 hover:border-purple-400 hover:bg-purple-900/40'
                }`}
                title="Filtrar investigaciones de I+D (clic para alternar)"
              >
                <span>🔬</span>
                <span>I+D Imperio: {(state?.researchQueue || []).length}/8</span>
              </button>
            );
          })()}

          {/* Obras, Defensas y Astillero agrupados por cada planeta */}
          {planets.map(p => {
            const buildCount = buildQueue.filter(q => q.planetId === p.id).length;
            const isBuildSelected = filter?.type === 'building' && filter?.planetId === p.id;

            const defCount = allDefenseQueues.filter(q => q.planetId === p.id).length;
            const isDefSelected = filter?.type === 'defense' && filter?.planetId === p.id;

            const shipCount = allShipQueues.filter(q => q.planetId === p.id).length;
            const isShipSelected = filter?.type === 'ship' && filter?.planetId === p.id;

            return (
              <React.Fragment key={`planet-ops-${p.id}`}>
                {/* Obras */}
                <button
                  type="button"
                  onClick={() => toggleFilter({ type: 'building', planetId: p.id })}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer border ${
                    isBuildSelected 
                      ? 'text-cyan-200 bg-cyan-800 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)] scale-105' 
                      : 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-900/40'
                  }`}
                  title={`Filtrar obras en ${p.name} (clic para alternar)`}
                >
                  <span>🏗️</span>
                  <span>Obras {p.name}: {buildCount}/8</span>
                </button>

                {/* Defensas */}
                <button
                  type="button"
                  onClick={() => toggleFilter({ type: 'defense', planetId: p.id })}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer border ${
                    isDefSelected
                      ? 'text-emerald-200 bg-emerald-800 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-105'
                      : 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-900/40'
                  }`}
                  title={`Filtrar defensas en ${p.name} (clic para alternar)`}
                >
                  <span>🛡️</span>
                  <span>Defensas {p.name}: {defCount}/8</span>
                </button>

                {/* Astillero / Naves (a la derecha de defensas) */}
                <button
                  type="button"
                  onClick={() => toggleFilter({ type: 'ship', planetId: p.id })}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer border ${
                    isShipSelected
                      ? 'text-amber-200 bg-amber-800 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                      : 'text-amber-300 bg-amber-950/60 border-amber-500/30 hover:border-amber-400 hover:bg-amber-900/40'
                  }`}
                  title={`Filtrar astillero/naves en ${p.name} (clic para alternar)`}
                >
                  <span>🚀</span>
                  <span>Astillero {p.name}: {shipCount}/8</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {!hasItems ? (
        <div className="p-12 text-center rounded-3xl bg-[#080d22]/80 border border-white/10 text-slate-400 font-mono text-xs shadow-xl flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-3xl">
            ⚡
          </div>
          <div className="text-sm font-bold text-white uppercase tracking-wider">
            {getEmptyFilterMessage()}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
          {filteredItems.map((item, idx) => {
            const pct = item.total > 0 ? Math.min(100, Math.max(0, Math.round(((item.total - item.remaining) / item.total) * 100))) : 0;
            const targetTab = getDestination(item);
            const strokeDashoffset = circumference - (pct / 100) * circumference;

            const theme = TYPE_THEMES[item.type] || TYPE_THEMES.building;

            return (
              <div
                key={`${item.type}-${item.queueId || item.id || idx}`}
                onClick={() => {
                  if (item.planetId && dispatch && item.type !== 'research') {
                    dispatch({ type: "SET_PLANET", payload: item.planetId });
                  }
                  handleNavigate(targetTab);
                }}
                title="Haz clic para acceder a la sala del proyecto"
                className={`group relative flex items-stretch p-3 rounded-2xl bg-[#080d22]/95 border border-white/15 ${theme.borderHover} ${theme.hoverBg} ${theme.shadowHover} transition-all duration-300 cursor-pointer select-none text-left focus:outline-none overflow-hidden`}
              >
                <div className={`absolute -top-10 -right-10 w-24 h-24 ${theme.glowColor} rounded-full blur-2xl pointer-events-none transition-all duration-500`} />

                {/* Columna Izquierda: Imagen y Datos del Edificio/Investigación */}
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2.5 relative z-10">
                  <div className={`relative w-14 h-14 rounded-xl overflow-hidden border border-white/15 ${theme.imgBorderHover} bg-[#05070f] shrink-0 flex items-center justify-center shadow-md transition-all`}>
                    <SafeImg
                      id={item.id}
                      category={item.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallback={<span className="text-2xl">{item.icon}</span>}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full border shadow-sm ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                        {item.typeLabel}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 truncate max-w-[100px]">
                        🌍 {item.planetName}
                      </span>
                    </div>
                    <div className={`text-xs sm:text-sm font-black text-white truncate ${theme.titleHover} transition-colors drop-shadow-sm`}>
                      {item.name}
                    </div>
                    <div className={`text-[11px] font-mono font-bold mt-0.5 ${theme.badgeText}`}>
                      {item.detail}
                    </div>
                  </div>
                </div>

                {/* Separador Vertical */}
                <div className={`w-[1px] bg-white/15 self-stretch my-1 shrink-0 ${theme.dividerHover} transition-colors`} />

                {/* Columna Derecha: Círculo de cuenta atrás y minutero en la misma línea */}
                <div className="flex items-center justify-center pl-3 shrink-0 relative z-10 gap-3">
                  {/* Quesito / Progreso circular a toda la altura del bloque */}
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
                      <circle cx="25" cy="25" r={radius} fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                      <circle
                        cx="25"
                        cy="25"
                        r={radius}
                        fill="transparent"
                        stroke={`url(#${theme.gradId})`}
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                      <defs>
                        <linearGradient id={theme.gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={theme.stop1} />
                          <stop offset="100%" stopColor={theme.stop2} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute text-[11px] font-mono font-black text-white drop-shadow-sm">
                      {pct}%
                    </span>
                  </div>

                  {/* Minutero / Cuenta atrás con cifra grande sincronizada en color */}
                  <div className={`flex items-center gap-1 font-mono font-black ${theme.timerText} text-sm sm:text-base md:text-lg leading-none tracking-tight ${theme.timerShadow} shrink-0`}>
                    <span className="text-xs sm:text-sm opacity-80">⏱</span>
                    <span>{fmtTime(item.remaining)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ActiveOperationsSection;
