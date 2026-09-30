import React from 'react';
import { TacticalResourceRow } from '../ui/TacticalResourceRow.jsx';
import { SafeImg } from '../../assets.jsx';
import { calcPlanetMaxPop } from '../../core.jsx';

export const FederalDistrictHeader = ({
  currentPlanet,
  state,
  dispatch,
  fmt,
  production,
  onBackToEmpire,
  onBackToAltoMando,
  onOpenDelegation
}) => {
  return (
    <section className="relative z-30 flex flex-col xl:flex-row items-stretch justify-between bg-black/85 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-mono shadow-2xl">
      {/* === SECTOR IZQUIERDO: RECURSOS Y EXPLORADOR === */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <TacticalResourceRow
          currentPlanet={currentPlanet}
          production={production}
          state={state}
          fmt={fmt}
        />

        {/* FILA INFERIOR: Explorador de navegación */}
        <div className="flex items-center gap-2 px-4 py-2 flex-wrap bg-black/20">
          {onBackToEmpire && (
            <>
              <button
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  onBackToEmpire();
                }}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all text-slate-300 hover:text-white hover:bg-white/10 font-bold cursor-pointer text-sm"
                title="Volver a la superficie del Planeta"
              >
                <span className="text-base">⚜️</span>
                <span>Imperio</span>
              </button>
              <span className="text-slate-600 font-bold text-sm">/</span>

              {/* Etiqueta del Planeta */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-bold text-xs" title="Planeta actual">
                <span className="text-sm">🌍</span>
                <span>{currentPlanet?.name || state?.planets?.find(p => p.isHome)?.name || 'Capital'}</span>
              </div>
              <span className="text-slate-600 font-bold text-sm">/</span>

              <button
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  if (onBackToAltoMando) onBackToAltoMando();
                  else if (onBackToEmpire) onBackToEmpire();
                }}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all text-slate-300 hover:text-white hover:bg-white/10 font-bold cursor-pointer text-sm"
                title="Volver al Alto Mando"
              >
                <span className="text-base">👑</span>
                <span>Alto Mando</span>
              </button>
              <span className="text-slate-600 font-bold text-sm">/</span>
            </>
          )}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-black text-sm shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <span className="text-base">🏛️</span>
            <span>Ministerios</span>
          </div>
        </div>
      </div>

      {/* === LÍNEA DIVISORIA VERTICAL COMPLETA === */}
      <div className="hidden xl:block w-[1px] bg-white/15 self-stretch" />

      {/* === SECTOR DERECHO: CONTROLES DEL GOBERNADOR IA === */}
      <div className="flex items-center justify-between xl:justify-end gap-3 px-4 py-2.5 bg-black/50 border-t xl:border-t-0 border-white/10 shrink-0">
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all shrink-0 font-mono text-xs ${
          currentPlanet?.autoGovernance 
            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : 'bg-black/60 border-white/10'
        }`}>
          <span className="relative flex h-2.5 w-2.5">
            {currentPlanet?.autoGovernance && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              currentPlanet?.autoGovernance ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-500'
            }`}></span>
          </span>
          <div className="leading-tight">
            <span className={`text-[10px] font-black uppercase tracking-wider block ${
              currentPlanet?.autoGovernance ? 'text-emerald-300' : 'text-white'
            }`}>
              {currentPlanet?.autoGovernance ? '🤖 Gobernador IA: Activo' : '👤 Control Manual'}
            </span>
            <span className="text-[8px] text-slate-400 block">
              {currentPlanet?.autoGovernance ? 'Colas delegadas' : 'Sin delegar'}
            </span>
          </div>
        </div>

        {/* Separador vertical */}
        <div className="hidden sm:block w-[1px] h-7 bg-white/15 shrink-0" />

        <button
          onClick={() => {
            onOpenDelegation();
            if (window.playSfx) window.playSfx('click');
          }}
          className="px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 shadow-sm"
          title="Ver o configurar directrices del gobernador"
        >
          <span>📋 Directrices</span>
        </button>

        {/* Separador vertical */}
        <div className="hidden sm:block w-[1px] h-7 bg-white/15 shrink-0" />

        <button
          onClick={() => {
            dispatch({
              type: 'SET_PLANET_AUTO_GOVERNANCE',
              planetId: currentPlanet?.id,
              autoGovernance: !currentPlanet?.autoGovernance,
            });
            if (window.playSfx) window.playSfx('click');
          }}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
            currentPlanet?.autoGovernance
              ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/40 hover:text-white shadow-[0_0_12px_rgba(244,63,94,0.2)]'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
          }`}
          title={currentPlanet?.autoGovernance ? 'Pausar el gobernador autónomo' : 'Delegar en el gobernador autónomo'}
        >
          <span>{currentPlanet?.autoGovernance ? '🛑 Desactivar' : '⚡ Activar'}</span>
        </button>
      </div>

      {/* === LÍNEA VERTICAL TOTAL DE SEPARACIÓN HACIA EL BOTÓN VOLVER === */}
      <div className="hidden xl:block w-[1px] bg-white/15 self-stretch" />

      {/* === HABITÁCULO DERECHO EXTREMO: TARJETA VOLVER AL ALTO MANDO === */}
      <div className="flex items-stretch justify-center shrink-0 border-t xl:border-t-0 border-white/10 w-full xl:w-44">
        <button
          type="button"
          onClick={() => {
            if (window.playSfx) window.playSfx('click');
            if (onBackToEmpire) onBackToEmpire();
          }}
          className="relative w-full h-full min-h-[56px] flex flex-col items-center justify-center px-2 py-1.5 overflow-hidden bg-[#060a16] hover:bg-[#0c1328] transition-all duration-300 cursor-pointer group text-center select-none"
          title="Volver a la sede del Alto Mando"
        >
          {/* Imagen de fondo nítida y visual sin degradado negro */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <SafeImg
              id="historicImperialArchive"
              className="w-full h-full object-cover object-center opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-purple-950/20 group-hover:bg-purple-500/10 transition-colors duration-300" />
          </div>

          {/* Contenido frontal maximizado a todo el ancho */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full min-w-0 leading-none px-1">
            <span className="w-full text-center text-lg sm:text-xl font-mono font-black uppercase tracking-[0.28em] text-purple-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] transition-colors">
              VOLVER A
            </span>
            <span className="w-full text-center text-base sm:text-lg font-mono font-black uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider truncate group-hover:text-purple-100 transition-colors flex items-center justify-center gap-1.5 mt-1">
              <span className="text-base shrink-0">👑</span>
              <span className="truncate">Alto Mando</span>
            </span>
          </div>
        </button>
      </div>
    </section>
  );
};
