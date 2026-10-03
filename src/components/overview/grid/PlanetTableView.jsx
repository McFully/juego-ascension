import React from 'react';
import { BIOMES } from '../../../data/gameData.js';
import { getPlanetHeritage } from '../../../data/planetaryHeritageData.js';

/**
 * PlanetTableView — Vista de matriz compacta de mundos del Imperio para evitar el scroll.
 */
export function PlanetTableView({
  filteredPlanets,
  currentPlanet,
  fmt,
  dispatch,
  calcProduction,
  GAME_SPEED,
  handleSelectPlanetAndNavigate,
  handleOpenDetail
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#080d1e]/90 overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="overflow-x-auto max-h-[68vh] custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="sticky top-0 bg-[#050814] text-slate-400 border-b border-white/10 z-10 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Planeta</th>
              <th className="py-3 px-4">Coordenadas</th>
              <th className="py-3 px-4">Bioma / Clima</th>
              <th className="py-3 px-4">Población</th>
              <th className="py-3 px-4 text-right">Metal</th>
              <th className="py-3 px-4 text-right">Cristal</th>
              <th className="py-3 px-4 text-right">Deuterio</th>
              <th className="py-3 px-4 text-right">Escoria</th>
              <th className="py-3 px-4 text-right">Energía</th>
              <th className="py-3 px-4 text-center">Gobierno</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredPlanets.map((planet) => {
              const isSelected = planet.id === currentPlanet?.id;
              let pEnergy = 0;
              try {
                const prod = calcProduction(
                  planet.buildings || {},
                  {},
                  planet.temperature || 20,
                  GAME_SPEED,
                  1.0,
                  planet.biome || 'terran',
                  planet.gravity || 2,
                  planet.specialization,
                  planet.traits || []
                );
                pEnergy = prod?.energyBalance ?? 0;
              } catch (_) {}

              return (
                <tr
                  key={planet.id}
                  onClick={() => handleSelectPlanetAndNavigate(planet.id)}
                  className={`hover:bg-cyan-950/30 transition-colors cursor-pointer ${
                    isSelected ? 'bg-cyan-950/40 border-l-4 border-cyan-400' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <span className="text-base">🪐</span>
                    <div>
                      <div className="text-cyan-300 font-black tracking-wide text-xs flex items-center gap-1.5">
                        <span>{planet.name}</span>
                        {(() => {
                          const h = getPlanetHeritage(planet);
                          if (!h) return null;
                          return (
                            <span title={h.name + ': ' + h.bonusDesc} className="text-[9px] font-normal text-cyan-200 bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-500/30">
                              {h.icon}
                            </span>
                          );
                        })()}
                      </div>
                      {planet.isHome && (
                        <span className="text-[9px] text-amber-400 font-bold uppercase">Capital</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-cyan-300 font-bold">
                    [{planet.galaxy}:{planet.system}:{planet.position}]
                  </td>
                  <td className="py-3 px-4 text-slate-300 capitalize">
                    {BIOMES[planet.biome]?.name || planet.biome || 'Templado'} ({planet.temperature || 20}°C)
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">
                    {fmt(planet.population || 1000)}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-400 font-bold">
                    {fmt(planet.resources?.metal || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-cyan-300 font-bold">
                    {fmt(planet.resources?.crystal || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-300 font-bold">
                    {fmt(planet.resources?.deuterium || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-500 font-bold">
                    {fmt(planet.resources?.slag || 0)}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${pEnergy >= 0 ? 'text-yellow-400' : 'text-rose-400'}`}>
                    {pEnergy >= 0 ? `+${fmt(pEnergy)}` : fmt(pEnergy)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {!planet.isHome && (
                        <button
                          type="button"
                          onClick={() => {
                            if (dispatch) {
                              dispatch({ type: 'PLANET_TOGGLE_AUTOTRADE', planetId: planet.id });
                              if (window.playSfx) window.playSfx('click');
                            }
                          }}
                          title={planet.autoTrade ? "Auto-Comercio ACTIVO (>75% almacén). Clic para desactivar" : "Auto-Comercio INACTIVO. Clic para activar"}
                          className={`px-2 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider border transition-all cursor-pointer select-none inline-flex items-center gap-1 shadow-md ${
                            planet.autoTrade
                              ? 'bg-indigo-600 text-white border-indigo-400 hover:bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                              : 'bg-black/80 text-slate-400 border-white/20 hover:border-indigo-400 hover:text-indigo-200'
                          }`}
                        >
                          <span>🚚</span>
                          <span>{planet.autoTrade ? 'Auto' : 'Off'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (dispatch) {
                            dispatch({ type: 'SET_PLANET_AUTO_GOVERNANCE', planetId: planet.id });
                            if (window.playSfx) window.playSfx('click');
                          }
                        }}
                        title={planet.autoGovernance ? "Gobernador IA activo. Clic para cambiar a Manual" : "Modo Manual. Clic para activar Gobernador IA"}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider border transition-all cursor-pointer select-none inline-flex items-center gap-1.5 shadow-md ${
                          planet.autoGovernance
                            ? 'bg-emerald-600 text-white border-emerald-400 hover:bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                            : 'bg-black/80 text-slate-300 border-white/20 hover:border-cyan-400 hover:text-cyan-200'
                        }`}
                      >
                        <span>{planet.autoGovernance ? '🤖' : '👤'}</span>
                        <span>{planet.autoGovernance ? 'IA Activa' : 'Manual'}</span>
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleOpenDetail(e, planet)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white font-bold text-[10px] uppercase transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] cursor-pointer"
                      >
                        📋 Ficha
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectPlanetAndNavigate(planet.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-[10px] uppercase transition-all cursor-pointer"
                      >
                        Gobernar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
