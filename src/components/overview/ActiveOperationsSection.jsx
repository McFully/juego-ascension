import React from 'react';
import { SafeImg } from '../../assets.jsx';
import { MINISTRY_MAPPING } from '../../data/buildingOperationsData.js';
import { getMinistryResearchRoute } from '../../utils/researchMinistryResolver.js';

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
        return `ministry_${minEntry.id}_buildings`;
      }
      return 'buildings';
    }
    if (item.type === 'research') {
      return getMinistryResearchRoute(item.id);
    }
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

  const rawPlanets = state?.planets || (currentPlanet ? [currentPlanet] : []);
  const defaultPlanetId = currentPlanet?.id || rawPlanets[0]?.id || 'all';
  const [selectedPlanetFilter, setSelectedPlanetFilter] = React.useState(defaultPlanetId);

  // Filtrado reactivo de items (categoría y planeta)
  const filteredItems = React.useMemo(() => {
    let list = activeItems;

    // Filtro por planeta (las investigaciones son globales del imperio, pero si el usuario selecciona un planeta, se pueden ver obras, astillero y defensas de ese planeta, o I+D si pertenece o si es 'all')
    if (selectedPlanetFilter && selectedPlanetFilter !== 'all') {
      list = list.filter(item => {
        if (item.type === 'research') {
          // Si es investigación, se muestra si es 'all' o si coincide con el planeta donde se inició la investigación
          return item.planetId === selectedPlanetFilter;
        }
        return item.planetId === selectedPlanetFilter;
      });
    }

    if (!filter) return list;

    return list.filter(item => {
      if (filter.type === 'research') {
        return item.type === 'research';
      }
      if (filter.type && filter.planetId !== undefined) {
        return item.type === filter.type && item.planetId === filter.planetId;
      }
      if (filter.type) {
        return item.type === filter.type;
      }
      return true;
    });
  }, [activeItems, filter, selectedPlanetFilter]);

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

  const buildCount = activeItems.filter(item => item.type === 'building').length;
  const researchCount = activeItems.filter(item => item.type === 'research').length;
  const defenseCount = activeItems.filter(item => item.type === 'defense').length;
  const shipCount = activeItems.filter(item => item.type === 'ship').length;

  const categories = [
    {
      type: 'research',
      label: 'Investigaciones',
      icon: '🔬',
      imgId: 'researchLab',
      count: researchCount,
      theme: TYPE_THEMES.research,
      activeBorder: 'border-purple-400',
      activeBg: 'bg-[#150a2b]',
      activeShadow: 'shadow-[0_0_25px_rgba(168,85,247,0.45)]',
      hoverBorder: 'hover:border-purple-500/40',
      hoverBg: 'hover:bg-[#1a0f35]',
      activeText: 'text-purple-300',
      activeGradient: 'bg-gradient-to-t from-black/60 via-black/30 to-black/20 group-hover:via-transparent',
      inactiveGradient: 'bg-gradient-to-t from-black/65 via-black/35 to-black/25 group-hover:via-purple-950/20',
      badgeActive: 'bg-purple-500/50 text-purple-100 border-purple-400'
    },
    {
      type: 'building',
      label: 'Construcciones',
      icon: '🏗️',
      imgId: 'constructionCenter',
      count: buildCount,
      theme: TYPE_THEMES.building,
      activeBorder: 'border-cyan-400',
      activeBg: 'bg-[#061426]',
      activeShadow: 'shadow-[0_0_25px_rgba(6,182,212,0.45)]',
      hoverBorder: 'hover:border-cyan-500/40',
      hoverBg: 'hover:bg-[#0c1630]',
      activeText: 'text-cyan-300',
      activeGradient: 'bg-gradient-to-t from-black/60 via-black/30 to-black/20 group-hover:via-transparent',
      inactiveGradient: 'bg-gradient-to-t from-black/65 via-black/35 to-black/25 group-hover:via-cyan-950/20',
      badgeActive: 'bg-cyan-500/50 text-cyan-100 border-cyan-400'
    },
    {
      type: 'defense',
      label: 'Defensas',
      icon: '🛡️',
      imgId: 'defenseFields',
      count: defenseCount,
      theme: TYPE_THEMES.defense,
      activeBorder: 'border-emerald-400',
      activeBg: 'bg-[#051a14]',
      activeShadow: 'shadow-[0_0_25px_rgba(16,185,129,0.45)]',
      hoverBorder: 'hover:border-emerald-500/40',
      hoverBg: 'hover:bg-[#0a261f]',
      activeText: 'text-emerald-300',
      activeGradient: 'bg-gradient-to-t from-black/60 via-black/30 to-black/20 group-hover:via-transparent',
      inactiveGradient: 'bg-gradient-to-t from-black/65 via-black/35 to-black/25 group-hover:via-emerald-950/20',
      badgeActive: 'bg-emerald-500/50 text-emerald-100 border-emerald-400'
    },
    {
      type: 'ship',
      label: 'Astillero',
      icon: '🚀',
      imgId: 'shipyard',
      count: shipCount,
      theme: TYPE_THEMES.ship,
      activeBorder: 'border-amber-400',
      activeBg: 'bg-[#241705]',
      activeShadow: 'shadow-[0_0_25px_rgba(245,158,11,0.45)]',
      hoverBorder: 'hover:border-amber-500/40',
      hoverBg: 'hover:bg-[#1a1208]',
      activeText: 'text-amber-300',
      activeGradient: 'bg-gradient-to-t from-black/60 via-black/30 to-black/20 group-hover:via-transparent',
      inactiveGradient: 'bg-gradient-to-t from-black/65 via-black/35 to-black/25 group-hover:via-amber-950/20',
      badgeActive: 'bg-amber-500/50 text-amber-100 border-amber-400'
    }
  ];

  return (
    <section className="space-y-4 w-full pt-1 pb-6">
      {/* ── SELECTOR DE PLANETA PARA FILTRAR OPERACIONES EN CURSO (2 LÍNEAS / FLEX-WRAP PARA 14+ MUNDOS) ── */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-[#060a18]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
        <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider pl-2 pr-1 shrink-0 flex items-center gap-1.5 py-1">
          <span>🪐</span>
          <span>Mundo:</span>
        </span>

        {/* Botón Todos los Mundos */}
        <button
          type="button"
          onClick={() => {
            setSelectedPlanetFilter('all');
            if (window.playSfx) window.playSfx('click');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            selectedPlanetFilter === 'all'
              ? 'bg-amber-500/30 text-amber-200 border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'bg-black/40 text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
          }`}
        >
          <span>🌌</span>
          <span>Todos los Mundos</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/10 text-slate-300">
            {activeItems.length}
          </span>
        </button>

        {/* Botón para cada Planeta */}
        {rawPlanets.map((planet) => {
          const isSelected = selectedPlanetFilter === planet.id;
          const planetQueuesCount = activeItems.filter(item => item.planetId === planet.id).length;

          return (
            <button
              key={planet.id}
              type="button"
              onClick={() => {
                setSelectedPlanetFilter(planet.id);
                if (window.playSfx) window.playSfx('click');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-black/40 text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              <span>{planet.isHome ? '👑' : '🪐'}</span>
              <span>{planet.name}</span>
              {planetQueuesCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                  isSelected ? 'bg-cyan-400/30 text-cyan-100' : 'bg-white/10 text-slate-300'
                }`}>
                  {planetQueuesCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selector de Categorías de Operaciones en Curso (4 Botones con el mismo diseño que los superiores) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-2 bg-[#080d22]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
        {categories.map((cat) => {
          const isSelected = filter?.type === cat.type;
          return (
            <button
              key={cat.type}
              type="button"
              onClick={() => toggleFilter({ type: cat.type })}
              className={`relative w-full min-h-[68px] sm:min-h-[80px] flex flex-col items-center justify-center p-2.5 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group text-center select-none border ${
                isSelected
                  ? `${cat.activeBorder} ${cat.activeBg} ${cat.activeShadow} scale-[1.01]`
                  : `border-white/10 bg-[#060a16] ${cat.hoverBorder} ${cat.hoverBg}`
              }`}
            >
              {/* Imagen de fondo nítida y visible */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <SafeImg
                  id={cat.imgId}
                  className="w-full h-full object-cover object-center opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div className={`absolute inset-0 transition-colors duration-300 ${
                  isSelected ? cat.activeGradient : cat.inactiveGradient
                }`} />
              </div>

              {/* Contenido frontal */}
              <div className="relative z-10 flex items-center justify-center gap-2.5 w-full px-2 py-1 leading-none">
                <span className="text-xl sm:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{cat.icon}</span>
                <span className={`text-xs sm:text-sm lg:text-base font-mono font-black uppercase tracking-wider transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,1)] ${
                  isSelected ? cat.activeText : 'text-white group-hover:text-slate-200'
                }`}>
                  {cat.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-black border shadow-lg backdrop-blur-md ${
                  isSelected
                    ? cat.badgeActive
                    : 'bg-black/75 text-slate-200 border-white/30'
                }`}>
                  {cat.count}
                </span>
              </div>
            </button>
          );
        })}
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
