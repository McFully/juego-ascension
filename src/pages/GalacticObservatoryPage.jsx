import React, { useState, useMemo } from 'react';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';

/**
 * GalacticObservatoryPage — Panel de auditoría de simulación autónoma.
 *
 * Permite al jugador inspeccionar en tiempo real:
 * - Directiva estratégica activa de cada facción (EXPAND, MILITARIZE, TECH…)
 * - Perfil psicopolítico (agresividad, prudencia, ambición, lealtad…)
 * - Memoria histórica (rencores, aliados, guerras, traiciones)
 * - Últimos eventos galácticos filtrados por facción
 * - Fuente de la directiva (Gemini IA vs Director local determinista)
 */

const DIRECTIVE_COLORS = {
  EXPAND:      { bg: 'bg-emerald-900/40', border: 'border-emerald-500/40', text: 'text-emerald-400', icon: '🚀' },
  MILITARIZE:  { bg: 'bg-red-900/40',     border: 'border-red-500/40',     text: 'text-red-400',     icon: '⚔️' },
  TECH:        { bg: 'bg-violet-900/40',  border: 'border-violet-500/40',  text: 'text-violet-400',  icon: '🔬' },
  TRADE:       { bg: 'bg-amber-900/40',   border: 'border-amber-500/40',   text: 'text-amber-400',   icon: '💼' },
  WAR_POSTURE: { bg: 'bg-orange-900/40',  border: 'border-orange-500/40',  text: 'text-orange-400',  icon: '🔥' },
  FORTIFY:     { bg: 'bg-cyan-900/40',    border: 'border-cyan-500/40',    text: 'text-cyan-400',    icon: '🛡️' },
};

const SORT_OPTIONS = [
  { id: 'level',  label: 'Nivel ↓' },
  { id: 'wins',   label: 'Victorias ↓' },
  { id: 'name',   label: 'Nombre A–Z' },
];

const BAR_MAX = 100;
const Bar = ({ value = 0, color = 'bg-cyan-500' }) => (
  <div className="h-1.5 w-full bg-slate-700/60 rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full transition-all ${color}`}
      style={{ width: `${Math.min(100, Math.max(0, value * BAR_MAX))}%` }}
    />
  </div>
);

const StatRow = ({ label, value, color }) => (
  <div className="space-y-0.5">
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-slate-400 font-mono">{label}</span>
      <span className="text-[10px] text-slate-300">{(value * 100).toFixed(0)}%</span>
    </div>
    <Bar value={value} color={color} />
  </div>
);

const MemoryBadge = ({ label, count, color }) =>
  count > 0 ? (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${color}`}>
      {label} <span className="font-bold">{count}</span>
    </span>
  ) : null;

const SourceBadge = ({ source }) => (
  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase
    ${source === 'gemini_ai'
      ? 'bg-violet-900/60 text-violet-300 border border-violet-500/30'
      : 'bg-slate-700/60 text-slate-400 border border-slate-600/30'
    }`}>
    {source === 'gemini_ai' ? '✦ Gemini IA' : '⊙ Local'}
  </span>
);

function FactionCard({ faction, galacticEvents, isSelected, onSelect }) {
  const dir = faction.strategicDirective;
  const directive = dir?.directive || '—';
  const style = DIRECTIVE_COLORS[directive] || { bg: 'bg-slate-800/40', border: 'border-slate-600/30', text: 'text-slate-400', icon: '❓' };
  const profile = faction.profile || {};
  const memory = faction.memory || {};

  const factionEvents = useMemo(() =>
    (galacticEvents || [])
      .filter(e =>
        (e.desc || '').includes(faction.empireName || faction.name) ||
        (e.desc || '').includes(faction.name)
      )
      .slice(-5)
      .reverse(),
    [galacticEvents, faction]
  );

  const totalFleet = Object.values(faction.fleet || {}).reduce((a, b) => a + b, 0);
  const totalDef = Object.values(faction.defenses || {}).reduce((a, b) => a + b, 0);

  return (
    <div
      className={`border rounded-lg cursor-pointer transition-all duration-200 overflow-hidden
        ${isSelected
          ? `${style.bg} ${style.border} ring-1 ring-offset-0 ring-blue-400/30`
          : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-500/50 hover:bg-slate-800/50'
        }`}
      onClick={() => onSelect(isSelected ? null : faction.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 p-3 pb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-bold truncate ${isSelected ? style.text : 'text-slate-200'}`}>
              {faction.empireName || faction.name}
            </span>
            {dir && <SourceBadge source={dir.source} />}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            {faction.strategy || 'balanced'} · Nivel {faction.aiLevel || 1} · [{faction.galaxy}:{faction.system}:{faction.position}]
          </div>
        </div>
        <div className={`text-2xl flex-shrink-0 ${style.text}`}>{style.icon}</div>
      </div>

      {/* Directiva activa */}
      <div className={`mx-3 mb-2 px-2 py-1 rounded ${style.bg} border ${style.border}`}>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-bold font-mono ${style.text}`}>{directive}</span>
          <span className="text-[9px] text-slate-500 font-mono">
            {dir?.priority || '—'}
          </span>
        </div>
        {dir?.reasoning && (
          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight italic">
            "{dir.reasoning}"
          </p>
        )}
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-1 px-3 pb-2 text-center">
        {[
          { label: '🏆', value: faction.totalWins || 0 },
          { label: '💀', value: faction.totalLosses || 0 },
          { label: '🚀', value: totalFleet },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-900/40 rounded px-1 py-1">
            <div className="text-[10px] text-slate-500">{label}</div>
            <div className="text-xs font-mono font-bold text-slate-200">{value}</div>
          </div>
        ))}
      </div>

      {/* Tratados y Pactos Activos */}
      {((faction.activePacts || []).length > 0 || (faction.tradeRoutes || []).length > 0) && (
        <div className="mx-3 mb-2 flex flex-wrap gap-1">
          {(faction.activePacts || []).map((pact, i) => (
            <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
              📜 {pact.toUpperCase()}
            </span>
          ))}
          {(faction.tradeRoutes || []).length > 0 && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
              🌐 {faction.tradeRoutes.length} RUTAS
            </span>
          )}
        </div>
      )}

      {/* Panel expandido */}
      {isSelected && (
        <div className="border-t border-slate-700/40 px-3 py-3 space-y-4">

          {/* Perfil psicopolítico */}
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">Perfil Psicopolítico</div>
            <div className="space-y-1.5">
              <StatRow label="Agresividad"     value={profile.aggressiveness  || 0.5} color="bg-red-500" />
              <StatRow label="Prudencia"        value={profile.prudence        || 0.5} color="bg-cyan-500" />
              <StatRow label="Ambición"         value={profile.ambition        || 0.5} color="bg-amber-500" />
              <StatRow label="Expansionismo"    value={profile.expansionLean   || 0.4} color="bg-emerald-500" />
              <StatRow label="Comercio"         value={profile.commercialLean  || 0.45} color="bg-yellow-500" />
              <StatRow label="Tecnología"       value={profile.techLean        || 0.4} color="bg-violet-500" />
              <StatRow label="Diplomacia"       value={profile.diplomaticLean  || 0.4} color="bg-blue-500" />
              <StatRow label="Lealtad"          value={profile.loyalty         || 0.6} color="bg-sky-500" />
              <StatRow label="Confianza"        value={profile.trust           || 0.5} color="bg-teal-500" />
              <StatRow label="Riesgo"           value={profile.riskTolerance   || 0.45} color="bg-orange-500" />
            </div>
            <div className="mt-2 text-[10px] text-slate-500">
              Objetivo corto: <span className="text-slate-300">{profile.shortTermGoal || '—'}</span>
              &nbsp;·&nbsp;
              Largo: <span className="text-slate-300">{profile.longTermGoal || '—'}</span>
            </div>
          </div>

          {/* Memoria histórica */}
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">Memoria Histórica</div>
            <div className="flex flex-wrap gap-1.5">
              <MemoryBadge label="Rivales"    count={(memory.rivals    || []).length} color="bg-red-900/50 text-red-300 border border-red-700/30" />
              <MemoryBadge label="Aliados"    count={(memory.allies    || []).length} color="bg-cyan-900/50 text-cyan-300 border border-cyan-700/30" />
              <MemoryBadge label="Traiciones" count={(memory.betrayals || []).length} color="bg-amber-900/50 text-amber-300 border border-amber-700/30" />
              <MemoryBadge label="Guerras"    count={(memory.pastWars  || []).length} color="bg-orange-900/50 text-orange-300 border border-orange-700/30" />
              <MemoryBadge label="Ayuda rec." count={(memory.aidReceived|| []).length} color="bg-emerald-900/50 text-emerald-300 border border-emerald-700/30" />
              <MemoryBadge label="Crisis"     count={(memory.recentCrises|| []).length} color="bg-violet-900/50 text-violet-300 border border-violet-700/30" />
            </div>
            {(memory.rivals || []).length > 0 && (
              <div className="mt-1.5 space-y-0.5">
                {(memory.rivals || []).slice(0, 3).map((r, i) => (
                  <div key={i} className="text-[10px] text-slate-400 font-mono">
                    ⚔ <span className="text-red-300">{r.empireName || r.factionId}</span>
                    {' '}· Rencor: <span className="text-red-400">{r.grudge || 0}</span>
                    {r.reason && <span className="text-slate-500"> · {r.reason}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información Imperfecta / Reconocimiento */}
          {Object.keys(faction.intelLedger || {}).length > 0 && (
            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1.5">Inteligencia y Niebla de Guerra</div>
              <div className="space-y-1">
                {Object.values(faction.intelLedger).slice(0, 3).map((intel, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-900/40 rounded px-2 py-1 text-[10px] font-mono">
                    <span className="text-slate-300">🕵️ {intel.empireName}</span>
                    <div className="flex gap-2 items-center">
                      <span className="text-slate-500">Poder perc: <span className="text-amber-400 font-bold">{intel.perceivedPower}</span></span>
                      <span className={`text-[9px] px-1 py-0.2 rounded ${intel.threatLevel === 'HIGH' ? 'bg-red-900/60 text-red-300' : 'bg-slate-700/60 text-slate-400'}`}>
                        {intel.threatLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recursos actuales */}
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1.5">Estado Actual</div>
            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
              {[
                ['⛏ Metal',    Math.floor(faction.resources?.metal    || 0)],
                ['💎 Cristal',  Math.floor(faction.resources?.crystal  || 0)],
                ['🔵 Deuterio', Math.floor(faction.resources?.deuterium|| 0)],
                ['🛸 Flota',    totalFleet],
                ['🛡 Defensas', totalDef],
                ['🌍 Planetas', faction.planetsConquered || 1],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between bg-slate-900/40 rounded px-2 py-1">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-slate-200 font-bold">{val.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Últimos eventos galácticos */}
          {factionEvents.length > 0 && (
            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1.5">Últimos Eventos</div>
              <div className="space-y-1">
                {factionEvents.map(e => (
                  <div key={e.id} className="bg-slate-900/50 rounded px-2 py-1.5">
                    <div className="text-[10px] font-bold text-slate-300">{e.title}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{e.desc}</div>
                    {e.source && (
                      <div className="text-[9px] text-slate-600 mt-0.5">
                        Tick {e.tick} · {e.source}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GalacticObservatoryPage({ state, fmt }) {
  const { navigateBack } = useNavigation();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('level');
  const [selectedId, setSelectedId] = useState(null);
  const [directiveFilter, setDirectiveFilter] = useState('all');

  const aiPlanets = state?.aiPlanets || [];
  const galacticEvents = state?.galacticEvents || [];

  const factions = useMemo(() => {
    // Agrupar por empireName: mostrar sólo el planeta capital (mayor aiLevel) de cada facción
    const empireMap = new Map();
    for (const p of aiPlanets) {
      if (!p || p.isVirgin) continue;
      const key = p.empireName || p.name;
      const existing = empireMap.get(key);
      if (!existing || (p.aiLevel || 1) > (existing.aiLevel || 1)) {
        empireMap.set(key, p);
      }
    }
    return Array.from(empireMap.values());
  }, [aiPlanets]);

  const filtered = useMemo(() => {
    let result = [...factions];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(f => (f.empireName || f.name || '').toLowerCase().includes(q) || (f.strategy || '').toLowerCase().includes(q));
    }
    if (directiveFilter !== 'all') {
      result = result.filter(f => (f.strategicDirective?.directive || '—') === directiveFilter);
    }
    switch (sort) {
      case 'level': result.sort((a, b) => (b.aiLevel || 1) - (a.aiLevel || 1)); break;
      case 'wins':  result.sort((a, b) => (b.totalWins || 0) - (a.totalWins || 0)); break;
      case 'name':  result.sort((a, b) => (a.empireName || a.name).localeCompare(b.empireName || b.name)); break;
    }
    return result;
  }, [factions, search, sort, directiveFilter]);

  // Estadísticas globales del universo
  const stats = useMemo(() => {
    const dirCounts = {};
    let geminiCount = 0;
    for (const f of factions) {
      const d = f.strategicDirective?.directive || '—';
      dirCounts[d] = (dirCounts[d] || 0) + 1;
      if (f.strategicDirective?.source === 'gemini_ai') geminiCount++;
    }
    const wars = galacticEvents.filter(e => e.type === 'war').length;
    const colonizations = galacticEvents.filter(e => e.type === 'colonize').length;
    return { dirCounts, geminiCount, wars, colonizations };
  }, [factions, galacticEvents]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      <SubsystemTopBanner
        title="🔭 Observatorio Galáctico"
        subtitle="Simulación Autónoma del Universo — Auditoría de Facciones"
        onBack={navigateBack}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* Resumen del universo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Facciones activas', value: factions.length, icon: '🌌' },
            { label: 'Guerras registradas', value: stats.wars, icon: '⚔️' },
            { label: 'Colonizaciones', value: stats.colonizations, icon: '🚀' },
            { label: 'Dirigidos por Gemini', value: stats.geminiCount, icon: '✦' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2 text-center">
              <div className="text-xl mb-0.5">{icon}</div>
              <div className="text-base font-bold font-mono text-slate-200">{value}</div>
              <div className="text-[10px] text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Distribución de directivas */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-4 py-3">
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">Directivas activas en el universo</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.dirCounts).map(([dir, count]) => {
              const s = DIRECTIVE_COLORS[dir] || { bg: 'bg-slate-700/40', text: 'text-slate-400', border: 'border-slate-600/30', icon: '❓' };
              return (
                <button
                  key={dir}
                  onClick={() => setDirectiveFilter(directiveFilter === dir ? 'all' : dir)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-mono font-bold transition-all
                    ${directiveFilter === dir ? `${s.bg} ${s.border} ${s.text}` : 'bg-slate-900/40 border-slate-700/30 text-slate-400 hover:border-slate-500/50'}`}
                >
                  {s.icon} {dir}
                  <span className="ml-0.5 text-[10px] font-normal opacity-70">×{count}</span>
                </button>
              );
            })}
            {directiveFilter !== 'all' && (
              <button onClick={() => setDirectiveFilter('all')} className="text-[10px] text-slate-500 underline ml-1">
                limpiar filtro
              </button>
            )}
          </div>
        </div>

        {/* Barra de búsqueda y orden */}
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Buscar facción o estrategia…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-0 bg-slate-900/60 border border-slate-700/40 rounded px-3 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
          <div className="flex gap-1">
            {SORT_OPTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={`px-3 py-1.5 rounded text-[11px] font-mono transition-all
                  ${sort === s.id
                    ? 'bg-cyan-900/50 border border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800/40 border border-slate-700/30 text-slate-400 hover:text-slate-300'
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resultado */}
        {filtered.length === 0 ? (
          <div className="text-center text-slate-600 py-12 font-mono text-sm">
            {factions.length === 0
              ? '— No hay facciones activas en el universo —'
              : '— Ninguna facción coincide con el filtro —'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(faction => (
              <FactionCard
                key={faction.id}
                faction={faction}
                galacticEvents={galacticEvents}
                isSelected={selectedId === faction.id}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GalacticObservatoryPage;
