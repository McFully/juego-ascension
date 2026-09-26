import React from 'react';
import { SafeImg } from '../../assets.jsx';
import { SHIPS } from '../../data/game/shipsData.js';

const getMissionTypeName = (type) => {
  const map = {
    colonize: 'Colonización',
    transport: 'Transporte',
    attack: 'Ataque',
    espionage: 'Espionaje',
    recycle: 'Reciclaje',
    recycling: 'Reciclaje',
    planet_destruction: 'Destrucción',
    expedition: 'Expedición'
  };
  return map[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Tránsito');
};

/**
 * ActiveFleetsSection — Sección visual de Flotas en Vuelo para OverviewPage.
 * Muestra las misiones tácticas y logísticas en tránsito y permite cancelar misiones de ida o ir al hangar.
 */
export const ActiveFleetsSection = ({
  state,
  dispatch,
  handleNavigate,
  ProgressBar,
  fmtTime
}) => {
  const fleetMissions = state?.fleetMissions || [];
  const playerMissions = fleetMissions.filter(m => !m.isAI);
  const planets = state?.planets || [];

  const [selectedPlanetFilter, setSelectedPlanetFilter] = React.useState(null);

  const togglePlanetFilter = (planetId) => {
    setSelectedPlanetFilter(prev => prev === planetId ? null : planetId);
    if (window.playSfx) window.playSfx('click');
  };

  // Helper para resolver planeta de origen de una misión
  const getOriginPlanet = (m) => {
    if (m.from?.id) {
      const found = planets.find(p => p.id === m.from.id);
      if (found) return found;
    }
    if (m.from?.name) {
      const found = planets.find(p => p.name === m.from.name);
      if (found) return found;
    }
    if (m.from?.galaxy !== undefined && m.from?.system !== undefined && m.from?.position !== undefined) {
      const found = planets.find(
        p => p.galaxy === m.from.galaxy && p.system === m.from.system && p.position === m.from.position
      );
      if (found) return found;
    }
    return m.from || null;
  };

  // Filtrado de misiones según el planeta seleccionado
  const filteredMissions = playerMissions.filter(m => {
    if (!selectedPlanetFilter) return true;
    const origin = getOriginPlanet(m);
    return origin?.id === selectedPlanetFilter;
  });

  const defaultFmtTime = (sec) => {
    if (sec <= 0) return '0s';
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  };

  const renderTime = fmtTime || defaultFmtTime;

  return (
    <section className="space-y-4 w-full pt-1 pb-6">
      {/* Barra superior: Filtros por planeta origen y conteo */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          {/* Botón Todas */}
          <button
            type="button"
            onClick={() => {
              setSelectedPlanetFilter(null);
              if (window.playSfx) window.playSfx('click');
            }}
            className={`px-2.5 py-0.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer border ${
              selectedPlanetFilter === null
                ? 'text-blue-200 bg-blue-800 border-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.5)] scale-105'
                : 'text-blue-300 bg-blue-950/60 border-blue-500/30 hover:border-blue-400 hover:bg-blue-900/40'
            }`}
            title="Ver flotas de todos los mundos"
          >
            <span>🛸</span>
            <span>Todas: {playerMissions.length}</span>
          </button>

          {/* Botones por cada planeta */}
          {planets.map(p => {
            const count = playerMissions.filter(m => {
              const origin = getOriginPlanet(m);
              return origin?.id === p.id;
            }).length;
            const isSelected = selectedPlanetFilter === p.id;

            return (
              <button
                key={`fleet-planet-filter-${p.id}`}
                type="button"
                onClick={() => togglePlanetFilter(p.id)}
                className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer border ${
                  isSelected
                    ? 'text-cyan-200 bg-cyan-800 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)] scale-105'
                    : 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-900/40'
                }`}
                title={`Filtrar flotas que parten de ${p.name} (clic para alternar)`}
              >
                <span>🪐</span>
                <span>{p.name}: {count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            {filteredMissions.length === 1 ? '1 misión en tránsito' : `${filteredMissions.length} misiones en tránsito`}
          </span>
        </div>
      </div>

      {filteredMissions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#080d22]/80 border border-white/10 text-slate-400 font-mono text-xs shadow-xl flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-center text-3xl">
            🛸
          </div>
          <div className="text-sm font-bold text-white uppercase tracking-wider">
            {selectedPlanetFilter
              ? 'No hay flotas en vuelo que partan de este planeta'
              : 'No hay flotas en vuelo actualmente'}
          </div>
          <p className="text-slate-400 max-w-md text-[11px]">
            {selectedPlanetFilter
              ? 'Las naves de este mundo se encuentran estacionadas en el hangar.'
              : 'Todas tus naves se encuentran estacionadas en los hangares de tus planetas.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredMissions.map((m) => {
            const isReturning = m.returning;
            const remaining = Math.max(0, (isReturning ? (m.returnTime - Date.now()) : (m.arrivalTime - Date.now())) / 1000);
            const total = Math.max(1, (isReturning ? (m.returnTime - (m.returnDeparture || m.departure)) : (m.arrivalTime - m.departure)) / 1000);
            const ships = Object.values(m.fleet || {}).reduce((a, b) => a + b, 0);
            const pct = Math.min(100, Math.max(0, Math.round(((total - remaining) / total) * 100)));

            const radius = 20;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (pct / 100) * circumference;

            const originPlanet = getOriginPlanet(m);
            const originName = originPlanet?.name || m.from?.name || 'Base';
            const originCoords = `[${m.from?.galaxy || 1}:${m.from?.system || 1}:${m.from?.position || 1}]`;
            const destCoords = `[${m.to?.galaxy || 1}:${m.to?.system || 1}:${m.to?.position || 1}]`;
            const targetPlanet = planets.find(p => p.galaxy === m.to?.galaxy && p.system === m.to?.system && p.position === m.to?.position);
            const destName = m.to?.name || targetPlanet?.name || null;

            return (
              <div
                key={m.id}
                className="group relative flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#080d22]/95 border border-white/15 hover:border-blue-400 hover:bg-[#0c1533] hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] transition-all duration-300 select-none overflow-hidden"
              >
                {/* 1. Misión, Planeta Origen y Objetivo (3 líneas claras) */}
                <div className="flex flex-col min-w-[150px] leading-tight space-y-0.5">
                  {/* Línea 1: Tipo de Misión */}
                  <span className="text-xs font-black text-white uppercase tracking-wide">
                    {isReturning ? `Misión de ${getMissionTypeName(m.type)} (Regreso)` : `Misión de ${getMissionTypeName(m.type)}`}
                  </span>

                  {/* Línea 2: Planeta desde el cual parte */}
                  <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                    <span className="text-slate-400">Desde:</span>
                    <span className="text-emerald-300 font-bold">🪐 {originName}</span>
                    <span className="text-slate-400 text-[10px]">{originCoords}</span>
                  </div>

                  {/* Línea 3: Objetivo de la misión */}
                  <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                    <span className="text-slate-400">{isReturning ? 'Hacia:' : 'Objetivo:'}</span>
                    <span className="text-cyan-300 font-bold">
                      {isReturning ? `${originName} ${originCoords}` : (destName ? `${destName} ${destCoords}` : destCoords)}
                    </span>
                  </div>
                </div>

                {/* 2. Recuadros con imagen de cada nave y su cantidad */}
                <div className="flex flex-wrap items-center gap-2">
                  {Object.entries(m.fleet || {}).filter(([, qty]) => qty > 0).map(([sId, qty]) => {
                    const shipName = SHIPS[sId]?.name || sId;
                    return (
                      <div
                        key={sId}
                        title={`${shipName}: ${qty}`}
                        className="flex items-center gap-1.5 p-1 pr-2 rounded-xl bg-black/50 border border-white/10 shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-500/20 overflow-hidden flex items-center justify-center shrink-0">
                          <SafeImg id={sId} fallback={<span className="text-sm">{SHIPS[sId]?.icon || '🚀'}</span>} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-mono text-xs font-black text-cyan-300">
                          {qty}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 3. Botón de retorno (si no está ya retornando) */}
                <div className="flex items-center gap-3 shrink-0 ml-auto">
                  {!isReturning && dispatch && (
                    <button
                      onClick={() => {
                        dispatch({ type: 'CANCEL_MISSION', missionId: m.id });
                        if (window.playSfx) window.playSfx('click');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-white font-mono text-[11px] font-bold uppercase transition-all cursor-pointer active:scale-95 shadow-sm"
                      title="Ordenar retorno inmediato a la base"
                    >
                      ✕ Retorno
                    </button>
                  )}

                  {/* 4. Reloj con minutero y quesito de progreso */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
                        <circle cx="25" cy="25" r={radius} fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                        <circle
                          cx="25"
                          cy="25"
                          r={radius}
                          fill="transparent"
                          stroke="#38bdf8"
                          strokeWidth="4"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-300"
                        />
                      </svg>
                      <span className="absolute text-[9px] font-mono font-bold text-white">
                        {pct}%
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-black text-cyan-300 whitespace-nowrap">
                        ⏱ {renderTime(remaining)}
                      </div>
                    </div>
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

export default ActiveFleetsSection;
