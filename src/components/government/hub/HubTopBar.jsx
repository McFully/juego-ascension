import React from 'react';
import { TacticalResourceRow } from '../../ui/TacticalResourceRow.jsx';
import { SafeImg } from '../../../assets.jsx';
import { calcPlanetMaxPop } from '../../../core.jsx';

/**
 * HubTopBar — Barra superior estandarizada con telemetría de recursos y navegación de los hubs de mando.
 *
* `hubLabel` distingue el Mando Imperial del Alto Mando de un mundo, y
 * `showResources` oculta los recursos del planeta cuando el hub es el del
 * imperio: allí no hay un planeta al que pertenecer.
 */
export const HubTopBar = React.memo(({
  currentPlanet,
  production,
  state,
  fmt,
  onBackToEmpire,
  hubLabel = 'Alto Mando',
  showResources = true,
  isReordering,
  onToggleReorder,
  onResetOrder
}) => {
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
            {/* Influencia */}
            <div className="relative flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap shrink-0">
              <span className="text-xl">🏛️</span>
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="font-black text-purple-400 text-base md:text-lg">
                  {fmt ? fmt(state?.influence || 0) : (state?.influence || 0)}
                </span>
                <span className="text-[10px] text-purple-300/80 font-bold uppercase tracking-wider">
                  Influencia
                </span>
              </div>
            </div>
          </TacticalResourceRow>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="text-xl">🏛️</span>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-black text-purple-400 text-base md:text-lg">
                {fmt ? fmt(state?.influence || 0) : (state?.influence || 0)}
              </span>
              <span className="text-[10px] text-purple-300/80 font-bold uppercase tracking-wider">
                Influencia Imperial
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

              {/* Etiqueta del Planeta con bola del mundo */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-bold text-xs" title="Planeta">
                <span className="text-sm">🌍</span>
                <span>{currentPlanet?.name || state?.planets?.find(p => p.isHome)?.name || 'Capital'}</span>
              </div>
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

          {/* === HABITÁCULO DERECHO EXTREMO: TARJETA VOLVER A IMPERIO === */}
          <div className="flex items-stretch justify-center shrink-0 border-t xl:border-t-0 border-white/10 w-full xl:w-44">
            <button
              type="button"
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                onBackToEmpire();
              }}
              className="relative w-full h-full min-h-[56px] flex flex-col items-center justify-center px-2 py-1.5 overflow-hidden bg-[#060a16] hover:bg-[#0c1328] transition-all duration-300 cursor-pointer group text-center select-none"
              title="Volver a la vista general de Imperio"
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
                  VOLVER A
                </span>
                <span className="w-full text-center text-base sm:text-lg font-mono font-black uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider truncate group-hover:text-cyan-100 transition-colors flex items-center justify-center gap-1.5 mt-1">
                  <span className="text-base shrink-0">🪐</span>
                  <span className="truncate">Imperio</span>
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
