import React from 'react';
import { intelIsKnown, INTEL_RANK } from '../../utils/espionageFormulas.js';
import { DEFENSES, BUILDINGS } from '../../data/gameData.js';
import { fmt } from '../../utils/formulas.js';
import { SafeImg } from '../../assets.jsx';

/**
 * DOSSIER DE INTELIGENCIA POR PLANETA.
 *
 * Lo único que no existía en ninguna forma y que el flujo pedía: separar lo que
 * el jugador YA SABE de un mundo de lo que aún no sabe.
 *
 * `spyReports` es un historial de los últimos 50 informes y se descarta; al
 * reabrir la partida no contesta "¿qué sé de este planeta?". `planetIntel` sí:
 * se acumula por objetivo, nunca pierde lo aprendido y se guarda en SQLite.
 */

const NIVEL_TONO = {
  blocked: 'border-red-500/40 bg-red-950/20',
  low: 'border-slate-600/40 bg-slate-900/40',
  medium: 'border-blue-500/40 bg-blue-950/20',
  high: 'border-cyan-500/40 bg-cyan-950/20',
  full: 'border-emerald-500/40 bg-emerald-950/20',
};

const NIVEL_COLOR = {
  blocked: 'text-red-400',
  low: 'text-slate-400',
  medium: 'text-blue-300',
  high: 'text-cyan-300',
  full: 'text-emerald-300',
};

/** Un dato cuenta como conocido si el nivel alcanzado lo revela. */
function datoConocido(dato, nivel, minimo) {
  if (dato === null || dato === undefined) return false;
  if ((INTEL_RANK[nivel] ?? 0) < minimo) return false;
  if (typeof dato === 'object') return Object.keys(dato).length > 0;
  if (typeof dato === 'string') return dato !== '???' && dato !== 'parcial';
  return true;
}

const Bloque = ({ titulo, conocido, nivelNecesario, nivel, children }) => (
  <div className={`rounded-lg border p-2.5 ${conocido ? 'border-white/10 bg-black/40' : 'border-dashed border-white/10 bg-black/20'}`}>
    <div className="flex items-center justify-between gap-2 mb-1">
      <span className="text-[10px] uppercase tracking-wider text-slate-400">{titulo}</span>
      {!conocido && (
        <span className="text-[9px] font-mono text-slate-500">
          requiere {nivelNecesario.toUpperCase()}
        </span>
      )}
    </div>
    {conocido ? children : <p className="text-[11px] text-slate-500 italic">Sin datos</p>}
  </div>
);

const lista = (obj, etiquetas) => {
  const entradas = Object.entries(obj || {})
    .filter(([, v]) => v === true || (typeof v === 'number' && v > 0));
  if (entradas.length === 0) return <span className="text-[11px] text-slate-500">Nada registrado</span>;
  return (
    <ul className="flex flex-wrap gap-x-2.5 gap-y-1">
      {entradas.map(([k, v]) => (
        <li key={k} className="text-[11px] font-mono text-slate-200">
          {etiquetas?.[k] || k}{typeof v === 'number' ? `: ${v}` : ''}
        </li>
      ))}
    </ul>
  );
};

export const IntelDossierView = ({ state, currentPlanet, onBack }) => {
  const intel = state?.planetIntel || {};
  const informes = state?.spyReports || [];
  const sondas = currentPlanet?.fleet?.espionageProbe || 0;
  const cyber = currentPlanet?.buildings?.spyCenter || 0;

  const objetivos = Object.values(intel)
    .filter(Boolean)
    .sort((a, b) => (b.at || 0) - (a.at || 0));

  const nombresEdificios = Object.fromEntries(
    Object.entries(BUILDINGS || {}).map(([id, b]) => [id, b?.name || id])
  );
  const nombresDefensas = Object.fromEntries(
    Object.entries(DEFENSES || {}).map(([id, d]) => [id, d?.name || id])
  );

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-300">
              Dossier de Inteligencia
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-xl">
              Lo que tu servicio de counterintelligence tiene registrado de cada mundo.
              Lo descubierto no se pierde al recargar la partida, y un informe mejor
              nunca borra lo anterior.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-center">
              <div className="text-[9px] uppercase tracking-wider text-slate-500">Mundos vigilados</div>
              <div className="text-lg font-black font-mono text-cyan-300">{objetivos.length}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-center">
              <div className="text-[9px] uppercase tracking-wider text-slate-500">Sondas en base</div>
              <div className="text-lg font-black font-mono text-blue-300">{sondas}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-center">
              <div className="text-[9px] uppercase tracking-wider text-slate-500">Centro de Espionaje</div>
              <div className="text-lg font-black font-mono text-emerald-300">{cyber}</div>
            </div>
          </div>
        </div>
        {sondas <= 0 && (
          <p className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-500/30 rounded-lg px-3 py-2 mt-3">
            No tienes sondas en {currentPlanet?.name || 'este mundo'}. Fabrícalas en el Astillero
            (requiere Espionaje 2) para poder ampliar el dossier.
          </p>
        )}
      </header>

      {objetivos.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
          <SafeImg assetId="deepScanner" alt="" className="w-16 h-16 mx-auto mb-3 opacity-40" fallbackClassName="text-3xl" />
          <p className="text-sm text-slate-300 font-bold">Sin objetivos registrados</p>
          <p className="text-[11px] text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            Lanza una operación desde el Hangar de la Flota o desde el Mapa Estelar.
            El informe de cada objetivo aparecerá aquí con lo que se ha revelado
            y lo que aún sigue oculto.
          </p>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {objetivos.map(obj => {
          const nivel = obj.level || 'low';
          const resources = obj.resources;
          const recursosConocidos = intelIsKnown(nivel) && resources && typeof resources.metal === 'number';
          const fleetConocida = intelIsKnown(nivel) && obj.fleet && (obj.fleet.estimated || obj.fleet.none === undefined);
          const defensasConocidas = datoConocido(obj.defenses, nivel, INTEL_RANK.high);
          const edificiosConocidos = datoConocido(obj.buildings, nivel, INTEL_RANK.high);
          const techConocida = !!obj.researchSnapshot;

          return (
            <article key={obj.id} className={`rounded-2xl border p-3.5 ${NIVEL_TONO[nivel] || NIVEL_TONO.low}`}>
              <header className="flex items-start justify-between gap-2 mb-2.5">
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-white truncate">{obj.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    [{obj.coords?.galaxy}:{obj.coords?.system}:{obj.coords?.position}]
                  </span>
                </div>
                <span className={`text-[10px] font-black font-mono uppercase ${NIVEL_COLOR[nivel]}`}>
                  {nivel}
                </span>
              </header>

              <div className="text-[10px] text-slate-500 mb-2.5 font-mono">
                {obj.reports} {obj.reports === 1 ? 'informe' : 'informes'}
                {obj.at ? ` · último ${new Date(obj.at).toLocaleDateString('es-ES')}` : ''}
              </div>

              <div className="space-y-2">
                <Bloque titulo="Recursos" conocido={recursosConocidos} nivelNecesario="low" nivel={nivel}>
                  {typeof resources?.metal === 'number' ? (
                    <div className="text-[11px] font-mono text-slate-200 space-y-0.5">
                      <div>⛏️ {fmt(resources.metal)} metal</div>
                      <div>💎 {fmt(resources.crystal)} cristal</div>
                      <div>⚗️ {fmt(resources.deuterium)} deuterio</div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      {resources?.metal === '???' ? 'Señal cifrada: sin datos' : 'Solo estimación parcial'}
                    </p>
                  )}
                </Bloque>

                <Bloque titulo="Flotas" conocido={fleetConocida} nivelNecesario="medium" nivel={nivel}>
                  {obj.fleet?.estimated ? (
                    <p className="text-[11px] text-amber-300">Confirmada la presencia de flotas, sin recuento.</p>
                  ) : obj.fleet?.none ? (
                    <p className="text-[11px] text-slate-300">Sin fuerza militar detectable.</p>
                  ) : (
                    lista(obj.fleet)
                  )}
                </Bloque>

                <Bloque titulo="Defensas" conocido={defensasConocidas} nivelNecesario="high" nivel={nivel}>
                  {lista(obj.defenses, nombresDefensas)}
                </Bloque>

                <Bloque titulo="Infraestructura" conocido={edificiosConocidos} nivelNecesario="high" nivel={nivel}>
                  {lista(obj.buildings, nombresEdificios)}
                </Bloque>

                <Bloque titulo="Investigación" conocido={techConocida} nivelNecesario="high" nivel={nivel}>
                  {lista(obj.researchSnapshot)}
                </Bloque>

                {obj.behaviorPrediction && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400">Predicción</span>
                    <p className="text-[11px] text-emerald-200 mt-0.5">{obj.behaviorPrediction}</p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {informes.length > 0 && (
        <details className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <summary className="text-[11px] uppercase tracking-wider text-slate-400 cursor-pointer select-none">
            Historial bruto de informes ({informes.length})
          </summary>
          <ul className="mt-2 space-y-1 max-h-52 overflow-y-auto">
            {[...informes].reverse().slice(0, 50).map(r => (
              <li key={r.id} className="text-[11px] font-mono text-slate-400 flex justify-between gap-3">
                <span className="truncate">{r.targetName}</span>
                <span className={NIVEL_COLOR[r.intelLevel] || 'text-slate-400'}>{r.intelLevel}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-xl border border-blue-500/40 bg-blue-950/30 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-blue-300 hover:bg-blue-900/40 transition-colors"
        >
          Volver al Ministerio
        </button>
      )}
    </div>
  );
};
