import React from 'react';
import { TacticalResourceRow } from '../ui/TacticalResourceRow.jsx';
import { SafeImg } from '../../assets.jsx';
import { IndependentReturnCard } from '../navigation/IndependentReturnCard.jsx';

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
  const handleBack = () => {
    if (window.playSfx) window.playSfx('click');
    if (onBackToAltoMando) onBackToAltoMando();
    else if (onBackToEmpire) onBackToEmpire();
  };

  return (
    <div className="relative z-30 flex flex-col xl:flex-row items-stretch gap-3 mb-4 w-full">
      {/* === DOM SUPERIOR: 2 FILAS CON SEPARADOR HORIZONTAL Y ANCHO COMPLETO === */}
      <section className="flex-1 min-w-0 bg-black/85 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-mono shadow-2xl flex flex-col justify-between">
        {/* FILA SUPERIOR: Recursos Tácticos Ancho Completo */}
        <div className="w-full overflow-visible">
          <TacticalResourceRow
            currentPlanet={currentPlanet}
            production={production}
            state={state}
            fmt={fmt}
            className="rounded-t-2xl overflow-visible border-b-0 w-full"
          />
        </div>

        {/* Separador Horizontal */}
        <div className="w-full h-[1px] bg-white/10" />

        {/* FILA INFERIOR: Explorador de navegación + Gobernador activo + Botón Gobernador (Mitad inferior) */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 flex-wrap bg-black/20 rounded-b-2xl min-h-[44px]">
          <div className="flex items-center gap-2 flex-wrap">
            {onBackToEmpire && (
              <>
                <button
                  type="button"
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
                  type="button"
                  onClick={handleBack}
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

          {/* Lado derecho de fila inferior: Botón Interactivo Único de Gobernador Activo / Desactivado */}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (dispatch && currentPlanet) {
                  dispatch({
                    type: 'SET_PLANET_AUTO_GOVERNANCE',
                    planetId: currentPlanet.id,
                    autoGovernance: !currentPlanet.autoGovernance
                  });
                  if (window.playSfx) window.playSfx('click');
                }
              }}
              className={`border rounded-xl px-3 py-1 flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-xl select-none transition-all text-xs h-8 cursor-pointer ${
                currentPlanet?.autoGovernance
                  ? 'bg-[#051c14]/90 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-[#1c080b]/90 border-rose-500/60 text-rose-300 hover:bg-rose-900/60'
              }`}
              title={currentPlanet?.autoGovernance ? "Gobernador IA activo. Clic para desactivar" : "Gobernador desactivado. Clic para activar"}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {currentPlanet?.autoGovernance && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  currentPlanet?.autoGovernance ? 'bg-emerald-400' : 'bg-rose-500'
                }`}></span>
              </span>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider whitespace-nowrap">
                {currentPlanet?.autoGovernance ? '🤖 GOBERNADOR ACTIVO (ON)' : '👤 GOBERNADOR DESACTIVADO (OFF)'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* === TARJETA INDEPENDIENTE Y SEPARADA DE VOLVER AL ALTO MANDO === */}
      <div className="shrink-0 w-full xl:w-52 flex items-stretch">
        <IndependentReturnCard
          onClick={handleBack}
          labelTop="VOLVER A"
          labelBottom="Alto Mando"
          icon="👑"
          imgId="historicImperialArchive"
          accentColor="purple"
        />
      </div>
    </div>
  );
};
