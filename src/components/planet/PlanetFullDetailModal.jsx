import React, { useState } from 'react';
import { PlanetViewer3D } from '../3d/PlanetViewer3D.jsx';
import { BIOMES, BUILDINGS, DEFENSES, SHIPS, RESEARCH, GAME_SPEED } from '../../data/gameData.js';
import { calcProduction, calcPlanetMaxPop } from '../../utils/formulas/productionFormulas.js';
import { fmt as defaultFmt } from '../../core.jsx';
import { PlanetOverviewTab } from './tabs/PlanetOverviewTab.jsx';
import { PlanetBuildingsTab } from './tabs/PlanetBuildingsTab.jsx';
import { PlanetMilitaryTab } from './tabs/PlanetMilitaryTab.jsx';
import { PlanetDefensesTab } from './tabs/PlanetDefensesTab.jsx';
import { PlanetFleetsTab } from './tabs/PlanetFleetsTab.jsx';
import { LivingPlanetPanel } from './LivingPlanetPanel.jsx';

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
          { id: 'ecosystem', label: 'Ecosistema y Vida', icon: '🌱' },
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
          <PlanetOverviewTab
            planet={planet}
            production={production}
            maxPop={maxPop}
            dispatch={dispatch}
            fmt={fmt}
          />
        )}

        {/* ── PESTAÑA 1.B: ECOSISTEMA, SOPORTE VITAL Y GOBERNANZA VIVA ── */}
        {activeTab === 'ecosystem' && (
          <LivingPlanetPanel
            planet={planet}
            dispatch={dispatch}
            fmt={fmt}
          />
        )}

        {/* ── PESTAÑA 2: DETALLE COMPLETO DE EDIFICIOS POR CATEGORÍA ── */}
        {activeTab === 'buildings' && (
          <PlanetBuildingsTab
            buildingCategories={buildingCategories}
            BUILDINGS={BUILDINGS}
            buildings={buildings}
          />
        )}

        {/* ── PESTAÑA 3: ASTILLERO E INVESTIGACIONES ── */}
        {activeTab === 'military' && (
          <PlanetMilitaryTab
            buildings={buildings}
            globalResearch={globalResearch}
            RESEARCH={RESEARCH}
          />
        )}

        {/* ── PESTAÑA 4: GUARNICIÓN Y DEFENSAS ── */}
        {activeTab === 'defenses' && (
          <PlanetDefensesTab
            defenses={defenses}
            DEFENSES={DEFENSES}
            totalDefensesCount={totalDefensesCount}
            fmt={fmt}
          />
        )}

        {/* ── PESTAÑA 5: FLOTAS EN ÓRBITA ── */}
        {activeTab === 'fleets' && (
          <PlanetFleetsTab
            ships={ships}
            SHIPS={SHIPS}
            totalShipsCount={totalShipsCount}
            fmt={fmt}
          />
        )}

      </div>
    </div>
  );
};
