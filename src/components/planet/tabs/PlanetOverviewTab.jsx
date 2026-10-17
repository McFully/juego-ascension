import React, { Suspense, lazy } from 'react';
import { BIOMES } from '../../../data/gameData.js';
import { getPlanetHeritage } from '../../../data/planetaryHeritageData.js';

const PlanetViewer3D = lazy(() => import('../../3d/PlanetViewer3D.jsx'));

export const PlanetOverviewTab = ({
  planet,
  production,
  maxPop,
  dispatch,
  fmt
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Visualizador 3D y Datos Biológicos */}
      <div className="lg:col-span-4 flex flex-col items-center p-6 rounded-3xl bg-[#070b1a] border border-cyan-500/20 space-y-4">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <Suspense fallback={<div className="w-[190px] h-[190px] rounded-full bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center text-3xl animate-pulse">🪐</div>}>
            <PlanetViewer3D biome={planet.biome || 'temperate'} name={planet.name} size={190} planet={planet} />
          </Suspense>
        </div>
        <div className="w-full text-center space-y-1">
          <h3 className="text-xl font-black text-white uppercase tracking-wider">{planet.name}</h3>
          <p className="text-xs font-mono text-cyan-300">Bioma {BIOMES[planet.biome]?.name || planet.biome || 'Templado'}</p>
        </div>

        {/* Hito / Peculiaridad Geológica y Cultural */}
        {(() => {
          const heritage = getPlanetHeritage(planet);
          if (!heritage) return null;
          return (
            <div className="w-full p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <span className="text-base">{heritage.icon}</span>
                <span>{heritage.name}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">{heritage.desc}</p>
              <div className="text-[10px] font-mono text-emerald-400 font-bold pt-1 border-t border-cyan-500/20">
                ⚡ {heritage.bonusDesc}
              </div>
            </div>
          );
        })()}

        {/* Indicador de Gobernador y Auto-Comercio */}
        <div className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Modo de Mando:</span>
          {planet.autoGovernance ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Gobernador IA Autónomo
            </span>
          ) : (
            <span className="text-slate-300 font-bold">👤 Control Manual</span>
          )}
        </div>

        {!planet.isHome && (
          <>
            <div className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <span>🚚</span> Auto-Comercio Colonial
                </span>
                <p className="text-[10px] text-slate-500">Envío automático si almacén &gt;75%</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (dispatch) {
                    dispatch({ type: 'PLANET_TOGGLE_AUTOTRADE', planetId: planet.id });
                    if (window.playSfx) window.playSfx('click');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[11px] border transition-all cursor-pointer ${
                  planet.autoTrade
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-indigo-400 hover:text-white'
                }`}
              >
                {planet.autoTrade ? '✓ Activado' : 'Desactivado'}
              </button>
            </div>

            <div className="w-full p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-rose-300 font-bold flex items-center gap-1.5">
                  <span>🚩</span> Desmantelar Asentamiento
                </span>
                <p className="text-[10px] text-slate-400">Repatria la flota al planeta natal</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`¿Estás completamente seguro de abandonar la colonia ${planet.name}? Esta acción desmantelará la base y transferirá la flota a tu planeta natal.`)) {
                    if (dispatch) {
                      dispatch({ type: 'ABANDON_PLANET', planetId: planet.id });
                      if (window.playSfx) window.playSfx('click');
                    }
                  }
                }}
                className="px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[11px] bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 hover:text-white transition-all cursor-pointer shadow-sm"
                title="Abandonar esta colonia planetaria"
              >
                Abandonar
              </button>
            </div>
          </>
        )}

        {/* Censo y Demografía */}
        <div className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Población Activa:</span>
            <span className="text-emerald-400 font-black">{fmt(planet.population || 1000)} / {fmt(maxPop)}</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round(((planet.population || 1000) / maxPop) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
            <span>Moral Colonial:</span>
            <span className={`${(planet.taxRate || 10) > 25 ? 'text-amber-400' : 'text-cyan-300'} font-bold`}>
              {Math.max(40, 100 - ((planet.taxRate || 10) - 10) * 2)}% Óptima
            </span>
          </div>
          <div className="pt-2 border-t border-white/5 space-y-1" data-ui-audit-id="planet-tax-control">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Presión Fiscal:</span>
              <span className="text-amber-300 font-bold font-mono">{planet.taxRate || 10}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={planet.taxRate || 10}
              onChange={(e) => {
                const taxRate = parseInt(e.target.value, 10);
                if (dispatch) {
                  dispatch({
                    type: 'SET_PLANET_TAX_RATE',
                    planetId: planet.id,
                    taxRate
                  });
                }
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              title="Ajuste de Impuestos Coloniales"
            />
          </div>
        </div>
      </div>

      {/* Balances de Producción y Recursos Actuales */}
      <div className="lg:col-span-8 space-y-6">
        <div className="p-6 rounded-3xl bg-[#070b1a] border border-cyan-500/20 space-y-4">
          <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
            <span>⚡</span>
            <span>Producción Horaria y Reservas Planetarias</span>
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Metal */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/30 font-mono space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Metal</span>
                <span>⛏️</span>
              </div>
              <div className="text-lg font-black text-amber-400">{fmt(planet.resources?.metal || 0)}</div>
              <div className="text-xs text-emerald-400 font-bold">+{fmt(production.metal)}/h</div>
            </div>

            {/* Cristal */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-cyan-500/30 font-mono space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Cristal</span>
                <span>💎</span>
              </div>
              <div className="text-lg font-black text-cyan-400">{fmt(planet.resources?.crystal || 0)}</div>
              <div className="text-xs text-emerald-400 font-bold">+{fmt(production.crystal)}/h</div>
            </div>

            {/* Deuterio */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-blue-500/30 font-mono space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Deuterio</span>
                <span>🧪</span>
              </div>
              <div className="text-lg font-black text-blue-400">{fmt(planet.resources?.deuterium || 0)}</div>
              <div className="text-xs text-emerald-400 font-bold">+{fmt(production.deuterium)}/h</div>
            </div>

            {/* Energía */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-emerald-500/30 font-mono space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Balance Energético</span>
                <span>⚡</span>
              </div>
              <div className={`text-lg font-black ${production.energyBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fmt(production.energyBalance)}
              </div>
              <div className="text-xs text-slate-400">
                {production.energyBalance >= 0 ? '100% Eficiencia' : 'Déficit Energético'}
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Silos y Escoria */}
        <div className="p-5 rounded-3xl bg-[#070b1a] border border-white/10 font-mono space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <span>🏭</span> Estado de Escoria y Reciclaje
            </span>
            <span className="text-slate-400">
              Stock actual: <b className="text-amber-400">{fmt(planet.resources?.slag || 0)}</b>
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Reciclador local: <b className="text-cyan-300">Nv {planet.buildings?.slagRecycler || 0}</b> | Silos de contención: <b className="text-cyan-300">Nv {planet.buildings?.slagStorage || 0}</b>
          </div>
        </div>
      </div>
    </div>
  );
};
