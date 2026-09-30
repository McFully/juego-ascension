import React from 'react';
import { PlanetViewer3D } from '../../3d/PlanetViewer3D.jsx';
import { BIOMES } from '../../../data/gameData.js';
import { ResourceBreakdownTooltip } from '../../ui/ResourceBreakdownTooltip.jsx';

/**
 * Planet3DCard — Tarjeta 3D interactiva para renderizado individual de mundos.
 * Memorizada con React.memo para aislar los re-renders del ciclo TICK de la simulación.
 */
export const Planet3DCard = React.memo(function Planet3DCard({
  planet,
  state,
  fmt,
  dispatch,
  calcProduction,
  calcPlanetMaxPop,
  GAME_SPEED,
  isEditing,
  tempName,
  setTempName,
  handleSaveRename,
  handleStartRename,
  setEditingPlanetId,
  handleSelectPlanetAndNavigate,
  handleOpenDetail
}) {
  const pBuildings = planet.buildings || {};
  const pLevels = Object.values(pBuildings).reduce((a, b) => a + Number(b || 0), 0);
  const pDefenses = Object.values(planet.defenses || {}).reduce((a, b) => a + Number(b || 0), 0);

  let pEnergy = 0;
  let pProd = null;
  try {
    pProd = calcProduction(
      planet.buildings || {},
      state?.research || {},
      planet.temperature || 20,
      GAME_SPEED,
      planet.faction || 'human',
      planet.biome,
      planet.gravity,
      planet.trait,
      planet.specialization,
      { galaxy: planet.galaxy, system: planet.system, position: planet.position },
      state?.ministries?.economy?.taxRate || 0
    );
    pEnergy = pProd?.energyBalance || 0;
  } catch (_) {
    pEnergy = 0;
  }
  const energySign = pEnergy >= 0 ? '+' : '';

  return (
    <div
      onClick={() => {
        if (isEditing) return;
        handleSelectPlanetAndNavigate(planet.id);
      }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 select-none cursor-pointer text-left focus:outline-none w-full bg-[#080d1e]/95 border-white/10 hover:border-cyan-400 hover:bg-[#0c142b] hover:shadow-[0_0_35px_rgba(6,182,212,0.25)] p-4"
    >
      {/* Badges superiores: Botón Auto-Comercio (en colonias) y Botón Gobernador */}
      <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
        {!planet.isHome && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (dispatch) {
                dispatch({ type: 'PLANET_TOGGLE_AUTOTRADE', planetId: planet.id });
                if (window.playSfx) window.playSfx('click');
              }
            }}
            title={planet.autoTrade ? "Auto-Comercio ACTIVO: envía excedentes a la capital al superar 75% de almacén. Clic para desactivar" : "Auto-Comercio INACTIVO. Clic para activar envío automático de excedentes a capital"}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-black uppercase tracking-wider backdrop-blur-md border shadow-lg transition-all cursor-pointer select-none flex items-center gap-1.5 ${
              planet.autoTrade
                ? 'bg-indigo-600 text-white border-indigo-400 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-105'
                : 'bg-black/85 text-slate-300 border-white/30 hover:border-indigo-400 hover:text-indigo-200 hover:bg-indigo-950/40'
            }`}
          >
            <span>🚚</span>
            <span>{planet.autoTrade ? 'Auto-Ruta: ACTIVA' : 'Auto-Ruta: OFF'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (dispatch) {
              dispatch({ type: 'SET_PLANET_AUTO_GOVERNANCE', planetId: planet.id });
              if (window.playSfx) window.playSfx('click');
            }
          }}
          title={planet.autoGovernance ? "Gobernador IA activo en este planeta. Clic para cambiar a Manual" : "Modo Manual. Clic para activar Gobernador IA en este planeta"}
          className={`px-3 py-1 rounded-xl text-xs font-mono font-black uppercase tracking-wider backdrop-blur-md border shadow-lg transition-all cursor-pointer select-none flex items-center gap-1.5 ${
            planet.autoGovernance
              ? 'bg-emerald-600 text-white border-emerald-400 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105'
              : 'bg-black/85 text-slate-300 border-white/30 hover:border-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/40'
          }`}
        >
          {planet.autoGovernance ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>🤖 Gobernador IA: ACTIVO</span>
            </>
          ) : (
            <>
              <span>👤</span>
              <span>Gobernador: MANUAL</span>
            </>
          )}
        </button>
      </div>

      {/* SECCIÓN SUPERIOR: 3 Columnas Horizontales con altura completa */}
      <div className="grid grid-cols-12 gap-2 items-stretch min-h-[175px] flex-1 pt-1 pb-1">
        {/* Columna Izquierda: Telemetría / Coordenadas / Población / Niveles (Centrado en altura de la tarjeta) */}
        <div className="col-span-4 flex flex-col justify-center gap-1.5 font-mono z-10 my-auto">
          <div className="bg-[#050814]/80 border border-cyan-500/30 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-semibold">Coordenadas </span>
            <span className="text-cyan-300 font-black">[{planet.galaxy}:{planet.system}:{planet.position}]</span>
          </div>

          <div className="bg-[#050814]/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <span className="capitalize">{BIOMES[planet.biome]?.name || planet.biome || 'Templado'}</span> · <strong className="text-white">{planet.temperature || 20}°C</strong>
          </div>

          <div className="bg-[#050814]/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400">Población: </span>
            <strong className="text-emerald-400 font-bold">{fmt(planet.population || 1000)}</strong>
            <span className="text-slate-500 text-[10px] ml-1">/ {fmt(calcPlanetMaxPop(planet))}</span>
          </div>

          <div className="bg-[#050814]/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400">Niveles de obras: </span>
            <strong className="text-cyan-400 font-black">{pLevels}</strong>
          </div>

          <div className="bg-[#050814]/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400">Defensas: </span>
            <strong className="text-emerald-400 font-black">{pDefenses}</strong>
          </div>
        </div>

        {/* Columna Centro: Esfera Planetaria 3D Grande (Centrado en altura de la tarjeta) */}
        <div className="col-span-4 flex items-center justify-center relative pointer-events-none my-auto">
          <div className="relative flex items-center justify-center w-36 h-36">
            <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
            <PlanetViewer3D biome={planet.biome || "temperate"} name={planet.name} size={145} />
          </div>
        </div>

        {/* Columna Derecha: Nombre y Renombrar centrados en altura, y Botón Ficha Completa abajo del todo encima del separador */}
        <div className="col-span-4 flex flex-col items-center justify-between text-center px-1 z-10 pt-7 pb-0 min-h-full">
          {isEditing ? (
            <div className="flex flex-col items-center justify-center gap-2 w-full my-auto" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                autoFocus
                value={tempName}
                maxLength={20}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename(planet.id);
                  if (e.key === 'Escape') setEditingPlanetId(null);
                }}
                className="bg-black/90 border border-cyan-400 text-white text-base font-bold px-2 py-1 rounded-md focus:outline-none text-center w-full shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSaveRename(planet.id)}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded cursor-pointer"
                >
                  ✓ Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPlanetId(null)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-between flex-1 w-full">
              {/* Bloque centralizado: Nombre del planeta y botón Renombrar justo debajo */}
              <div className="my-auto flex flex-col items-center justify-center gap-1.5 pt-1">
                <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider group-hover:text-cyan-300 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-tight text-center">
                  {planet.name}
                </h4>

                {planet.isExchangePlanet && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.35)]">
                    🏛️ Lonja Galáctica
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => handleStartRename(e, planet)}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 text-[11px] font-mono transition-all cursor-pointer opacity-85 group-hover:opacity-100"
                  title="Cambiar nombre al planeta"
                  aria-label="Cambiar nombre"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Renombrar</span>
                </button>
              </div>

              {/* Botón Ficha Completa anclado abajo del todo, justo por encima del separador */}
              <button
                type="button"
                onClick={(e) => handleOpenDetail(e, planet)}
                className="w-full max-w-[155px] py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-[11px] font-black uppercase tracking-wider border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-auto mb-0"
                title="Abrir ficha técnica completa"
              >
                <span>📋</span>
                <span>Ficha Completa</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN INFERIOR: Recursos */}
      <div className="grid grid-cols-5 gap-1.5 mt-3 pt-2.5 border-t border-white/10 font-mono">
        <div className="relative group/res bg-black/60 px-1.5 py-1.5 rounded-xl border border-white/10 text-center flex flex-col justify-center cursor-help">
          <span className="text-slate-400 block text-[10px] font-bold tracking-tight">METAL</span>
          <span className="text-white font-black text-xs md:text-sm leading-tight tracking-tight mt-0.5">{fmt(planet.resources?.metal || 0)}</span>
          {pProd?.breakdown && (
            <div className="hidden group-hover/res:block z-[150]">
              <ResourceBreakdownTooltip
                resourceType="metal"
                breakdown={pProd.breakdown}
                currentAmount={planet.resources?.metal}
                prodVal={pProd.metal}
              />
            </div>
          )}
        </div>
        <div className="relative group/res bg-black/60 px-1.5 py-1.5 rounded-xl border border-white/10 text-center flex flex-col justify-center cursor-help">
          <span className="text-slate-400 block text-[10px] font-bold tracking-tight">CRISTAL</span>
          <span className="text-cyan-300 font-black text-xs md:text-sm leading-tight tracking-tight mt-0.5">{fmt(planet.resources?.crystal || 0)}</span>
          {pProd?.breakdown && (
            <div className="hidden group-hover/res:block z-[150]">
              <ResourceBreakdownTooltip
                resourceType="crystal"
                breakdown={pProd.breakdown}
                currentAmount={planet.resources?.crystal}
                prodVal={pProd.crystal}
              />
            </div>
          )}
        </div>
        <div className="relative group/res bg-black/60 px-1.5 py-1.5 rounded-xl border border-white/10 text-center flex flex-col justify-center cursor-help">
          <span className="text-slate-400 block text-[10px] font-bold tracking-tight">DEUTERIO</span>
          <span className="text-emerald-300 font-black text-xs md:text-sm leading-tight tracking-tight mt-0.5">{fmt(planet.resources?.deuterium || 0)}</span>
          {pProd?.breakdown && (
            <div className="hidden group-hover/res:block z-[150]">
              <ResourceBreakdownTooltip
                resourceType="deuterium"
                breakdown={pProd.breakdown}
                currentAmount={planet.resources?.deuterium}
                prodVal={pProd.deuterium}
              />
            </div>
          )}
        </div>
        <div className="relative group/res bg-black/60 px-1.5 py-1.5 rounded-xl border border-white/10 text-center flex flex-col justify-center cursor-help">
          <span className="text-slate-400 block text-[10px] font-bold tracking-tight">ESCORIA</span>
          <span className="text-amber-500 font-black text-xs md:text-sm leading-tight tracking-tight mt-0.5">{fmt(planet.resources?.slag || 0)}</span>
          {pProd?.breakdown && (
            <div className="hidden group-hover/res:block z-[150]">
              <ResourceBreakdownTooltip
                resourceType="slag"
                breakdown={pProd.breakdown}
                currentAmount={planet.resources?.slag}
                prodVal={pProd.slag}
              />
            </div>
          )}
        </div>
        <div className="relative group/res bg-black/60 px-1.5 py-1.5 rounded-xl border border-white/10 text-center flex flex-col justify-center cursor-help">
          <span className="text-slate-400 block text-[10px] font-bold tracking-tight">ENERGÍA</span>
          <span className="text-yellow-400 font-black text-xs md:text-sm leading-tight tracking-tight mt-0.5">{energySign}{fmt(pEnergy)}</span>
          {pProd?.breakdown && (
            <div className="hidden group-hover/res:block z-[150]">
              <ResourceBreakdownTooltip
                resourceType="energy"
                breakdown={pProd.breakdown}
                currentAmount={pEnergy}
                prodVal={pEnergy}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
