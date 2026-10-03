import React from 'react';
import { TacticalResourceRow } from '../../ui/TacticalResourceRow.jsx';
import { SafeImg } from '../../../assets.jsx';
import { calcPlanetMaxPop } from '../../../core.jsx';
import { getEffectiveTech, getDefenseStats } from '../../../utils/formulas.js';

/**
 * HubTopBar — Barra superior estandarizada con telemetría de recursos y navegación de los hubs de mando.
 *
* `hubLabel` distingue el Mando Imperial del Alto Mando de un mundo, y
 * `showResources` oculta los recursos del planeta cuando el hub es el del
 * imperio: allí no hay un planeta al que pertenecer.
 */
export const HubTopBar = React.memo(({
  dispatch,
  currentPlanet,
  production,
  state,
  fmt,
  onBackToEmpire,
  hubLabel = 'Alto Mando',
  backButtonLabelTop = 'VOLVER A',
  backButtonLabelBottom = 'Imperio',
  backButtonIcon = '🪐',
  showResources = true,
  isReordering,
  onToggleReorder,
  onResetOrder
}) => {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState('');

  const handleSaveRename = () => {
    const trimmed = tempName.trim();
    if (trimmed && currentPlanet?.id && dispatch) {
      dispatch({ type: 'RENAME_PLANET', planetId: currentPlanet.id, name: trimmed.slice(0, 20) });
      if (window.playSfx) window.playSfx('tradeSuccess');
    }
    setIsEditingName(false);
  };
  return (
    <section className="relative z-30 flex flex-col xl:flex-row items-stretch justify-between bg-black/85 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-mono shadow-2xl">
<div className="flex-1 flex flex-col justify-between min-w-0">
        {showResources ? (
          <TacticalResourceRow
            currentPlanet={currentPlanet}
            production={production}
            state={state}
            fmt={fmt}
          >
            <div className="w-[1px] h-5 bg-white/15 shrink-0" />
            {/* Bastión Planetario */}
            {(() => {
              const defenses = currentPlanet?.defenses || {};
              const totalBatteries = Object.values(defenses).reduce((acc, qty) => acc + (qty || 0), 0);
              if (totalBatteries <= 0) return null;
              const effTech = getEffectiveTech(currentPlanet, state?.research);
              const faction = state?.faction || "human";
              let totalFirepower = 0;
              let totalShields = 0;
              for (const [defId, count] of Object.entries(defenses)) {
                if (count > 0) {
                  const stats = getDefenseStats(defId, effTech, faction, currentPlanet?.buildings || {}, state?.relics || []);
                  if (stats) {
                    totalFirepower += (stats.atk || 0) * count;
                    totalShields += (stats.shd || 0) * count;
                  }
                }
              }
              return (
                <div key="bastion-telemetry" className="flex items-center">
                  <div className="w-[1px] h-5 bg-white/15 shrink-0" />
                  <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Bastión Planetario">
                    <span className="text-xl">🛡️</span>
                    <div className="flex items-baseline leading-none">
                      <span className="font-black text-rose-400 text-base md:text-lg">
                        {fmt ? fmt(totalFirepower) : totalFirepower}
                      </span>
                    </div>
                    <div className="hidden group-hover/res:block z-[120]">
                      <div className="absolute top-full right-0 mt-2 w-80 max-w-[320px] bg-[#060a18] border border-rose-500/50 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(244,63,94,0.2)] z-[120] text-left font-mono text-xs pointer-events-none whitespace-normal break-words">
                        <div className="flex items-center gap-2 border-b border-rose-500/30 pb-1.5 mb-2 font-bold text-white">
                          <span className="text-base">🛡️</span>
                          <span className="text-rose-300 uppercase tracking-wider">Bastión Planetario</span>
                        </div>
                        <div className="space-y-1 text-slate-300 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Potencia de Fuego (⚡):</span>
                            <span className="font-bold text-rose-400">{fmt ? fmt(totalFirepower) : totalFirepower}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Escudos Defensivos (🛡️):</span>
                            <span className="font-bold text-cyan-300">{fmt ? fmt(totalShields) : totalShields}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Baterías Desplegadas:</span>
                            <span className="font-bold text-white">{fmt ? fmt(totalBatteries) : totalBatteries} unidades</span>
                          </div>
                          <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 mt-1 leading-relaxed whitespace-normal break-words">
                            Defensas activas de superficie del planeta: torretas láser, cañones gauss, plasma y cúpulas de escudo.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </TacticalResourceRow>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="text-xl">🏛️</span>
            <div className="flex items-baseline leading-none">
              <span className="font-black text-purple-400 text-base md:text-lg">
                {fmt ? fmt(state?.influence || 0) : (state?.influence || 0)}
              </span>
            </div>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {state?.planets?.length || 0} mundos · sin sede planetaria
            </span>
          </div>
        )}

        {/* Fila 2: Miga de Pan */}
        <div className="flex items-center gap-2 px-4 py-2 text-xs flex-wrap">
          {onBackToEmpire && (
            <>
              <button
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  onBackToEmpire();
                }}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all text-slate-300 hover:text-white hover:bg-white/10 font-bold cursor-pointer text-sm"
                title="Volver a la superficie del Imperio"
              >
                <span className="text-base">⚜️</span>
                <span>Imperio</span>
              </button>
              <span className="text-slate-600 font-bold text-sm">/</span>

              {/* Botón directo a Mundos del Imperio */}
              <button
                type="button"
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  try {
                    if (typeof window !== "undefined") {
                      window.sessionStorage.setItem("ascension_target_section", "planets");
                    }
                    window.dispatchEvent(new CustomEvent('ascension:open-section', { detail: { section: 'planets' } }));
                  } catch (_) {}
                  onBackToEmpire();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 font-bold text-xs transition-all cursor-pointer"
                title="Volver a Mundos del Imperio"
              >
                <span className="text-sm">🌍</span>
                <span>Mundos del Imperio</span>
              </button>
              <span className="text-slate-600 font-bold text-sm">/</span>

              {/* Etiqueta del Planeta interactiva con renombrado directo */}
              {isEditingName ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/90 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  <input
                    type="text"
                    value={tempName}
                    maxLength={20}
                    autoFocus
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    className="bg-transparent text-white text-xs font-bold font-mono focus:outline-none w-28 px-1"
                  />
                  <button
                    type="button"
                    onClick={handleSaveRename}
                    className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] cursor-pointer"
                    title="Guardar nuevo nombre"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold text-[10px] cursor-pointer"
                    title="Cancelar"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.playSfx) window.playSfx('click');
                      const planetName = currentPlanet?.name || state?.planets?.find(p => p.isHome)?.name || '';
                      try {
                        window.dispatchEvent(new CustomEvent('ascension:open-section', { detail: { section: 'planets', filter: planetName } }));
                      } catch (_) {}
                      onBackToEmpire();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all cursor-pointer"
                    title="Ver este mundo en el Catálogo de Mundos del Imperio"
                  >
                    <span className="text-sm">🪐</span>
                    <span>{currentPlanet?.name || state?.planets?.find(p => p.isHome)?.name || 'Capital'}</span>
                    {currentPlanet?.galaxy !== undefined && (
                      <span className="text-cyan-400 font-mono text-[11px] font-black">
                        [{currentPlanet.galaxy}:{currentPlanet.system}:{currentPlanet.position}]
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(currentPlanet?.name || '');
                      setIsEditingName(true);
                      if (window.playSfx) window.playSfx('click');
                    }}
                    className="p-1 px-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 text-xs transition-all cursor-pointer"
                    title="Renombrar este mundo"
                  >
                    ✏️
                  </button>
                </div>
              )}
              <span className="text-slate-600 font-bold text-sm">/</span>
            </>
          )}
<div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="text-base">👑</span>
            <span>{hubLabel}</span>
          </div>
        </div>
      </div>

      {/* Botón Restablecer cuando reordenación esté activa */}
      {(isReordering && onResetOrder) && (
        <>
          <div className="hidden xl:block w-[1px] bg-white/15 self-stretch" />
          <div className="flex items-center justify-between xl:justify-end gap-2 px-3 py-2 bg-black/50 shrink-0 border-t xl:border-t-0 border-white/10">

            {isReordering && onResetOrder && (
              <button
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  onResetOrder();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/40 shadow-lg transition-all cursor-pointer select-none"
                title="Restablecer el orden original de las tarjetas"
              >
                <span>🔄</span>
                <span>Restablecer</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* === TARJETA REORDENAR TARJETAS (CON IMAGEN DE FONDO) === */}
      {onToggleReorder && (
        <>
          <div className="hidden xl:block w-[1px] bg-white/15 self-stretch" />
          <div className="flex items-stretch justify-center shrink-0 border-t xl:border-t-0 border-white/10 w-full xl:w-56">
            <button
              type="button"
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                onToggleReorder();
              }}
              className={`relative w-full h-full min-h-[56px] flex flex-col items-center justify-center px-4 py-1.5 overflow-hidden transition-all duration-300 cursor-pointer group text-center select-none ${
                isReordering
                  ? 'bg-[#181206] hover:bg-[#251b0a] ring-2 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                  : 'bg-[#080d1a] hover:bg-[#0e172e]'
              }`}
              title={isReordering ? "Guardar y finalizar reordenación" : "Activar modo para mover y reordenar tarjetas"}
            >
              {/* Imagen de fondo nítida */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <SafeImg
                  id="modularFactory"
                  className="w-full h-full object-cover object-center opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
                />
                <div className={`absolute inset-0 transition-colors duration-300 ${
                  isReordering
                    ? 'bg-amber-950/40 group-hover:bg-amber-500/20'
                    : 'bg-cyan-950/30 group-hover:bg-cyan-500/15'
                }`} />
              </div>

              {/* Contenido frontal maximizado ocupando todo el ancho */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full min-w-0 leading-tight px-1">
                <span className={`w-full text-center text-xs md:text-sm font-mono font-black uppercase tracking-[0.25em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] transition-colors ${
                  isReordering ? 'text-amber-300' : 'text-cyan-300'
                }`}>
                  {isReordering ? 'LISTO / GUARDAR' : 'REORDENAR'}
                </span>
                <span className="w-full text-center text-sm md:text-base font-mono font-black uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider truncate group-hover:text-cyan-100 transition-colors flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="text-base shrink-0">{isReordering ? '✅' : '⚙️'}</span>
                  <span className="truncate">{isReordering ? 'Guardado' : 'Tarjetas'}</span>
                </span>
              </div>
            </button>
          </div>
        </>
      )}

      {/* === LÍNEA VERTICAL TOTAL DE SEPARACIÓN HACIA EL BOTÓN VOLVER === */}
      {onBackToEmpire && (
        <>
          <div className="hidden xl:block w-[1px] bg-white/15 self-stretch" />

          {/* === HABITÁCULO DERECHO EXTREMO: TARJETA VOLVER A IMPERIO / ALTO MANDO === */}
          <div className="flex items-stretch justify-center shrink-0 border-t xl:border-t-0 border-white/10 w-full xl:w-44">
            <button
              type="button"
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                onBackToEmpire();
              }}
              className="relative w-full h-full min-h-[56px] flex flex-col items-center justify-center px-2 py-1.5 overflow-hidden bg-[#060a16] hover:bg-[#0c1328] transition-all duration-300 cursor-pointer group text-center select-none"
              title={`Volver a ${backButtonLabelBottom}`}
            >
              {/* Imagen de fondo nítida y visual sin degradado negro */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <SafeImg
                  id="deepColonizationPsych"
                  className="w-full h-full object-cover object-center opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-cyan-950/20 group-hover:bg-cyan-500/10 transition-colors duration-300" />
              </div>

              {/* Contenido frontal maximizado a todo el ancho */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full min-w-0 leading-none px-1">
                <span className="w-full text-center text-lg sm:text-xl font-mono font-black uppercase tracking-[0.28em] text-cyan-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] transition-colors">
                  {backButtonLabelTop}
                </span>
                <span className="w-full text-center text-base sm:text-lg font-mono font-black uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider truncate group-hover:text-cyan-100 transition-colors flex items-center justify-center gap-1.5 mt-1">
                  <span className="text-base shrink-0">{backButtonIcon}</span>
                  <span className="truncate">{backButtonLabelBottom}</span>
                </span>
              </div>
            </button>
          </div>
        </>
      )}
    </section>
  );
});

export default HubTopBar;
