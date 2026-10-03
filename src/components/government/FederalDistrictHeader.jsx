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

              {/* Botón directo a Mundos del Imperio */}
              <button
                type="button"
                onClick={() => {
                  if (window.playSfx) window.playSfx('click');
                  try {
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

              {/* Etiqueta del Planeta interactiva */}
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

          {/* Badge Gobernador Activo ON/OFF en la segunda línea del HUD */}
          <div className="shrink-0 ml-auto flex items-center">
            <div 
              className={`border rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-xl select-none transition-all text-xs ${
                currentPlanet?.autoGovernance
                  ? 'bg-[#051c14]/90 border-emerald-500/50 text-emerald-300'
                  : 'bg-[#050814]/90 border-white/20 text-slate-300'
              }`}
              title="Estado de la gobernanza de este planeta"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {currentPlanet?.autoGovernance && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  currentPlanet?.autoGovernance ? 'bg-emerald-400' : 'bg-slate-500'
                }`}></span>
              </span>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider whitespace-nowrap">
                {currentPlanet?.autoGovernance ? '🤖 GOBERNADOR ACTIVO (ON)' : '👤 GOBERNADOR MANUAL (OFF)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* === LÍNEA DIVISORIA VERTICAL COMPLETA === */}
      <div className="hidden xl:block w-[1px] bg-white/15 self-stretch" />

      {/* === SECTOR DERECHO: RECUADRO GOBERNADOR (ALTO COMPLETO) + RETORNO === */}
      <div className="flex items-stretch justify-between xl:justify-end shrink-0 border-t xl:border-t-0 border-white/10 flex-wrap overflow-hidden rounded-r-2xl">
        
        {/* BOTÓN RECUADRO GOBERNADOR: EXACTAMENTE IGUAL AL DEL EMPERADOR */}
        <button
          type="button"
          onClick={() => {
            if (onOpenDelegation) onOpenDelegation();
            if (window.playSfx) window.playSfx('click');
          }}
          className={`relative min-h-[58px] min-w-[135px] flex flex-col items-center justify-center px-3 py-1.5 border-r border-white/10 overflow-hidden transition-all duration-300 cursor-pointer group text-center select-none shadow-none ${
            currentPlanet?.autoGovernance
              ? 'bg-[#22070e] hover:bg-[#320a14]'
              : 'bg-[#051c14] hover:bg-[#072a1e]'
          }`}
          title="Configurar y gestionar directrices del Gobernador Territorial para este planeta"
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <SafeImg
              id={currentPlanet?.autoGovernance ? "modeCancel" : "councilChamber"}
              className="w-full h-full object-cover object-center opacity-50 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
            />
            <div className={`absolute inset-0 transition-colors ${
              currentPlanet?.autoGovernance ? 'bg-rose-950/40 group-hover:bg-rose-500/20' : 'bg-emerald-950/40 group-hover:bg-emerald-500/20'
            }`} />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center leading-tight">
            <span className={`text-xs font-mono font-black uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-wider flex items-center gap-1 ${
              currentPlanet?.autoGovernance ? 'text-rose-200 group-hover:text-white' : 'text-emerald-200 group-hover:text-white'
            }`}>
              <span>{currentPlanet?.autoGovernance ? '🛑' : '🤖'}</span>
              <span>{currentPlanet?.autoGovernance ? 'Desactivar' : 'Activar'}</span>
            </span>
            <span className={`text-[9px] font-mono uppercase tracking-widest mt-0.5 ${
              currentPlanet?.autoGovernance ? 'text-rose-300/80' : 'text-emerald-300/80'
            }`}>
              {currentPlanet?.autoGovernance ? 'Gobernador Activo' : 'Gobernador IA'}
            </span>
          </div>
        </button>

        {/* TARJETA VOLVER AL ALTO MANDO */}
        <div className="flex items-stretch justify-center shrink-0 w-full xl:w-44">
          <button
            type="button"
            onClick={() => {
              if (window.playSfx) window.playSfx('click');
              if (onBackToEmpire) onBackToEmpire();
            }}
            className="relative w-full h-full min-h-[58px] flex flex-col items-center justify-center px-2 py-1.5 overflow-hidden bg-[#060a16] hover:bg-[#0c1328] transition-all duration-300 cursor-pointer group text-center select-none"
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
      </div>
    </section>
  );
};
