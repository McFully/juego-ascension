import React, { useState } from 'react';
import { PlanetViewer3D } from '../3d/PlanetViewer3D.jsx';
import { BIOMES, BUILDINGS, DEFENSES, SHIPS, RESEARCH, GAME_SPEED } from '../../data/gameData.js';
import { calcProduction, calcPlanetMaxPop } from '../../utils/formulas/productionFormulas.js';
import { fmt as defaultFmt } from '../../core.jsx';

/**
 * PlanetFullDetailModal — Pantalla modal a pantalla completa con la ficha técnica
 * exhaustiva del planeta: Edificios, Investigaciones, Flotas, Defensas y Censo.
 */
export const PlanetFullDetailModal = ({
  planet,
  state,
  dispatch,
  onClose,
  onSelectPlanet,
  fmt = defaultFmt
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'buildings' | 'military' | 'defenses' | 'fleets'

  if (!planet) return null;

  const buildings = planet.buildings || {};
  const defenses = planet.defenses || {};
  const ships = planet.ships || {};
  const globalResearch = state?.research || {};

  // Producción horaria calculada
  let production = { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0 };
  try {
    production = calcProduction(
      buildings,
      globalResearch,
      planet.temperature || 20,
      GAME_SPEED,
      planet.faction || 'human',
      planet.biome,
      planet.gravity,
      planet.trait,
      planet.specialization,
      { galaxy: planet.galaxy, system: planet.system, position: planet.position },
      state?.ministries?.economy?.taxRate || 0
    ) || production;
  } catch (_) {}

  // Sumas de niveles y unidades
  const totalBuildingLevels = Object.values(buildings).reduce((a, b) => a + Number(b || 0), 0);
  const totalDefensesCount = Object.values(defenses).reduce((a, b) => a + Number(b || 0), 0);
  const totalShipsCount = Object.values(ships).reduce((a, b) => a + Number(b || 0), 0);
  const maxPop = calcPlanetMaxPop ? calcPlanetMaxPop(planet) : 10000;

  // Agrupaciones de edificios
  const buildingCategories = [
    { id: 'resource', title: 'Extracción de Recursos', icon: '⛏️' },
    { id: 'energy', title: 'Plantas de Energía', icon: '⚡' },
    { id: 'facility', title: 'Infraestructura e Industria', icon: '🏭' },
    { id: 'storage', title: 'Almacenes y Bóvedas', icon: '📦' },
    { id: 'civil', title: 'Desarrollo Civil', icon: '🏛️' },
    { id: 'advanced', title: 'Complejos Científicos Avanzados', icon: '🧬' },
    { id: 'special', title: 'Instalaciones Especiales', icon: '✨' }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="planet-modal-title"
      className="fixed inset-0 z-50 flex flex-col bg-[#030612]/95 backdrop-blur-xl text-white select-none overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── ENCABEZADO SUPERIOR TÁCTICO ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/30 bg-[#060a1a]/90 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            🪐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="planet-modal-title" className="text-2xl font-black uppercase tracking-wider text-white">
                {planet.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                [{planet.galaxy}:{planet.system}:{planet.position}]
              </span>
              {planet.isHome && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ★ CAPITAL IMPERIAL
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>Bioma: <strong className="text-white capitalize">{BIOMES[planet.biome]?.name || planet.biome || 'Templado'}</strong></span>
              <span>·</span>
              <span>Temperatura: <strong className="text-cyan-300">{planet.temperature || 20}°C</strong></span>
              <span>·</span>
              <span>Gravedad: <strong className="text-white">{(planet.gravity || 1).toFixed(2)}G</strong></span>
            </p>
          </div>
        </div>

        {/* Acciones principales del encabezado */}
        <div className="flex items-center gap-3">
          {onSelectPlanet && (
            <button
              type="button"
              onClick={() => {
                onSelectPlanet(planet.id);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              <span>🚀</span>
              <span>Gobernar este Mundo</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 transition-all cursor-pointer text-lg font-bold"
            title="Cerrar Ficha Completa"
            aria-label="Cerrar Ficha Completa"
          >
            ✕
          </button>
        </div>
      </header>

      {/* ── BARRA DE PESTAÑAS DE NAVEGACIÓN ── */}
      <nav className="flex items-center gap-2 px-6 py-2.5 border-b border-white/10 bg-[#050814]/80 shrink-0 overflow-x-auto">
        {[
          { id: 'overview', label: 'Resumen Táctico', icon: '📊' },
          { id: 'buildings', label: `Edificios (${totalBuildingLevels} Nvs)`, icon: '🏗️' },
          { id: 'military', label: 'Astillero e I+D', icon: '🔬' },
          { id: 'defenses', label: `Defensas (${fmt(totalDefensesCount)})`, icon: '🛡️' },
          { id: 'fleets', label: `Flotas en Órbita (${fmt(totalShipsCount)})`, icon: '🛸' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── CONTENIDO PRINCIPAL CON SCROLL INTERNO INDEPENDIENTE ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* ── PESTAÑA 1: RESUMEN TÁCTICO ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visualizador 3D y Datos Biológicos */}
            <div className="lg:col-span-4 flex flex-col items-center p-6 rounded-3xl bg-[#070b1a] border border-cyan-500/20 space-y-4">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                <PlanetViewer3D biome={planet.biome || 'temperate'} name={planet.name} size={190} />
              </div>
              <div className="w-full text-center space-y-1">
                <h3 className="text-xl font-black text-white uppercase tracking-wider">{planet.name}</h3>
                <p className="text-xs font-mono text-cyan-300">Bioma {BIOMES[planet.biome]?.name || planet.biome || 'Templado'}</p>
              </div>

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
                  <span className="text-cyan-300 font-bold">100% Óptima</span>
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
                    <div className="text-lg font-black text-cyan-300">{fmt(planet.resources?.crystal || 0)}</div>
                    <div className="text-xs text-emerald-400 font-bold">+{fmt(production.crystal)}/h</div>
                  </div>

                  {/* Deuterio */}
                  <div className="p-3.5 rounded-2xl bg-black/50 border border-emerald-500/30 font-mono space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Deuterio</span>
                      <span>⚗️</span>
                    </div>
                    <div className="text-lg font-black text-emerald-300">{fmt(planet.resources?.deuterium || 0)}</div>
                    <div className="text-xs text-emerald-400 font-bold">+{fmt(production.deuterium)}/h</div>
                  </div>

                  {/* Energía */}
                  <div className={`p-3.5 rounded-2xl bg-black/50 border font-mono space-y-1 ${
                    production.energyBalance >= 0 ? 'border-yellow-500/30' : 'border-rose-500/40 bg-rose-950/20'
                  }`}>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Energía</span>
                      <span>⚡</span>
                    </div>
                    <div className={`text-lg font-black ${production.energyBalance >= 0 ? 'text-yellow-400' : 'text-rose-400'}`}>
                      {production.energyBalance >= 0 ? `+${fmt(production.energyBalance)}` : fmt(production.energyBalance)}
                    </div>
                    <div className="text-xs text-slate-400 font-bold">Balance Red</div>
                  </div>
                </div>
              </div>

              {/* Métricas Globales Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#070b1a] border border-white/10 space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
                    <span>Niveles de Obra</span>
                    <span>🏗️</span>
                  </div>
                  <div className="text-3xl font-black text-cyan-300 font-mono">{totalBuildingLevels}</div>
                  <p className="text-xs text-slate-400">Estructuras e instalaciones levantadas</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#070b1a] border border-white/10 space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
                    <span>Poder Defensivo</span>
                    <span>🛡️</span>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 font-mono">{fmt(totalDefensesCount)}</div>
                  <p className="text-xs text-slate-400">Torretas y cúpulas de escudo operativas</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#070b1a] border border-white/10 space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
                    <span>Flota Estacionada</span>
                    <span>🚀</span>
                  </div>
                  <div className="text-3xl font-black text-blue-400 font-mono">{fmt(totalShipsCount)}</div>
                  <p className="text-xs text-slate-400">Naves atracadas en órbita y hangares</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PESTAÑA 2: EDIFICIOS E INFRAESTRUCTURA ── */}
        {activeTab === 'buildings' && (
          <div className="space-y-6">
            {buildingCategories.map((cat) => {
              const catBuildings = Object.entries(BUILDINGS).filter(([_, data]) => data.cat === cat.id);
              if (catBuildings.length === 0) return null;

              return (
                <div key={cat.id} className="p-5 rounded-3xl bg-[#070b1a] border border-white/10 space-y-3">
                  <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.title}</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {catBuildings.map(([bId, bData]) => {
                      const lvl = buildings[bId] || 0;
                      return (
                        <div
                          key={bId}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between font-mono ${
                            lvl > 0
                              ? 'bg-black/60 border-cyan-500/40 text-white shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                              : 'bg-black/20 border-white/5 text-slate-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xl shrink-0">{bData.icon || '🏗️'}</span>
                            <div className="truncate">
                              <div className="text-xs font-bold truncate">{bData.name}</div>
                              {lvl > 0 && bData.prod && (
                                <div className="text-[10px] text-emerald-400">Genera {bData.prod}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0 pl-2">
                            <span className="text-[10px] uppercase text-slate-400">Nv</span>
                            <span className={`text-base font-black ${lvl > 0 ? 'text-cyan-300' : 'text-slate-600'}`}>
                              {lvl}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PESTAÑA 3: ASTILLERO E INVESTIGACIONES ── */}
        {activeTab === 'military' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Instalaciones Militares Clave */}
            <div className="p-5 rounded-3xl bg-[#070b1a] border border-white/10 space-y-4">
              <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <span>🚀</span>
                <span>Instalaciones de Fabricación y Mando</span>
              </h4>
              <div className="space-y-2.5 font-mono">
                {[
                  { id: 'shipyard', name: 'Astillero Orbital', icon: '🚀', desc: 'Permite la construcción de naves de combate y cargueros' },
                  { id: 'robotFactory', name: 'Fábrica de Robots', icon: '🤖', desc: 'Reduce los tiempos de construcción de todas las obras' },
                  { id: 'naniteFactory', name: 'Fábrica de Nanobots', icon: '🧬', desc: 'Multiplica exponencialmente la velocidad de astillero y obras' },
                  { id: 'researchLab', name: 'Laboratorio Científico', icon: '🔬', desc: 'Aporta potencia a la red interplanetaria de investigación' },
                  { id: 'missileSilo', name: 'Silo de Misiles', icon: '🎯', desc: 'Almacén para misiles de intercepción y ofensivos' }
                ].map((item) => {
                  const lvl = buildings[item.id] || 0;
                  return (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-white">{item.name}</div>
                          <div className="text-[11px] text-slate-400">{item.desc}</div>
                        </div>
                      </div>
                      <span className="text-lg font-black text-cyan-300 px-3 py-1 bg-cyan-950/40 rounded-xl border border-cyan-500/30">
                        Nv {lvl}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tecnologías Globales Clave */}
            <div className="p-5 rounded-3xl bg-[#070b1a] border border-white/10 space-y-4">
              <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <span>🔬</span>
                <span>Tecnologías Estratégicas del Imperio</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono">
                {Object.entries(RESEARCH).slice(0, 10).map(([rId, rData]) => {
                  const lvl = globalResearch[rId] || 0;
                  return (
                    <div key={rId} className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-lg">{rData.icon || '🔬'}</span>
                        <span className="text-xs text-slate-300 truncate">{rData.name}</span>
                      </div>
                      <span className="text-xs font-black text-amber-400">Nv {lvl}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── PESTAÑA 4: GUARNICIÓN Y DEFENSAS ── */}
        {activeTab === 'defenses' && (
          <div className="p-6 rounded-3xl bg-[#070b1a] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <span>🛡️</span>
                <span>Defensas Planetarias Activas</span>
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-500/30">
                Total Unidades: {fmt(totalDefensesCount)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(DEFENSES).map(([dId, dData]) => {
                const count = defenses[dId] || 0;
                return (
                  <div
                    key={dId}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between font-mono ${
                      count > 0
                        ? 'bg-black/60 border-emerald-500/40 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'bg-black/20 border-white/5 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{dData.icon || '🛡️'}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{dData.name}</div>
                        <div className="text-[10px] text-slate-400">Ataque: {fmt(dData.atk)} · Escudo: {fmt(dData.shd)}</div>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase">En Batería</span>
                      <span className={`text-xl font-black ${count > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {fmt(count)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PESTAÑA 5: FLOTAS EN ÓRBITA ── */}
        {activeTab === 'fleets' && (
          <div className="p-6 rounded-3xl bg-[#070b1a] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <span>🛸</span>
                <span>Naves en Hangar y Órbita Planetaria</span>
              </h4>
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/50 px-3 py-1 rounded-xl border border-blue-500/30">
                Total Naves: {fmt(totalShipsCount)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(SHIPS).map(([sId, sData]) => {
                const count = ships[sId] || 0;
                return (
                  <div
                    key={sId}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between font-mono ${
                      count > 0
                        ? 'bg-black/60 border-blue-500/40 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'bg-black/20 border-white/5 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{sData.icon || '🚀'}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{sData.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {sData.cat === 'civil' ? `Carga: ${fmt(sData.cargo)}` : `Ataque: ${fmt(sData.atk)}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase">Estacionadas</span>
                      <span className={`text-xl font-black ${count > 0 ? 'text-blue-400' : 'text-slate-600'}`}>
                        {fmt(count)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
