import React, { useState } from 'react';
import { GameCarousel } from '../components/ui/GameCarousel.jsx';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { SafeImg } from '../assets.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';

const StatsPage = ({ state, currentPlanet, production, ACHIEVEMENTS, SHIPS, DEFENSES, S, fmt, fmtTime }) => {
  const { navigateTo, navigateBack } = useNavigation();
  const [activeSection, setActiveSection] = useState('military'); // 'military' | 'resources' | 'colonies'
  const stats = state.stats || {};
  const combatsWon = stats.combatsWon || 0;
  const combatsLost = stats.combatsLost || 0;
  const combatsDraw = stats.combatsDraw || 0;
  const totalCombats = combatsWon + combatsLost + combatsDraw;
  const winRate = totalCombats > 0 ? ((combatsWon / (combatsWon + combatsLost || 1)) * 100).toFixed(1) + '%' : '0.0%';

  return (
    <div className="space-y-6 view-enter w-full">
      {/* DOM Superior Estandarizado (Recursos + Explorador + Telemetría Status) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Telemetría e Inteligencia Imperial"
        breadcrumbIcon="📊"
        parentHub="imperial_hub"
        backButtonLabelTop="VOLVER A"
        backButtonLabelBottom="Mando Imperial"
        backButtonIcon="👑"
        onBackToAltoMando={() => {
          if (navigateBack) navigateBack();
        }}
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
              <span className="text-slate-400">Victorias:</span>
              <span className="font-bold text-cyan-300">{winRate} ({combatsWon})</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono">
              <span className="text-slate-400">Tiempo:</span>
              <span className="font-bold text-purple-300">{fmtTime(stats.playTime || 0)}</span>
            </div>
          </div>
        }
      />

      {/* Selector de Áreas de Telemetría en Grid Responsivo con Tarjeta Volver */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">📊</span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 font-mono">
            Departamentos de Telemetría e Inteligencia Imperial
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full items-stretch pt-2 pb-4">
          {[
            { id: 'military', title: 'Registro Militar', icon: '⚔️', assetId: 'battleship', subtitle: 'Combates librados, ratio de victorias y naves fabricadas', tag: `${combatsWon} Victorias` },
            { id: 'resources', title: 'Balance de Recursos', icon: '⛏️', assetId: 'metalMine', subtitle: 'Extracción acumulada histórica de metal, cristal y deuterio', tag: 'Producción' },
            { id: 'colonies', title: 'Registro de Colonias', icon: '🌍', assetId: 'sectorGovPalace', subtitle: 'Censo planetario, instalaciones y naves apostadas', tag: `${state.planets?.length || 1} Mundos` },
            { id: 'replay', title: 'Registro Histórico', icon: '📼', assetId: 'quantumTelecom', subtitle: 'Rebobina y reproduce los eventos cronológicos de la partida', tag: 'Replay' },
          ].map(sec => {
            if (sec.id === 'replay') {
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    if (navigateTo) navigateTo('replay');
                    if (window.playSfx) window.playSfx('click');
                  }}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-cyan-500/40 bg-[#090d1f]/90 hover:border-cyan-400 hover:bg-[#0e1633] hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none w-full h-full min-h-[260px]"
                >
                  <div className="relative w-full h-36 md:h-40 overflow-hidden bg-[#05070f] border-b border-white/10">
                    <SafeImg
                      id={sec.assetId}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                      {sec.tag}
                    </span>
                  </div>
                  <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="text-base font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                        {sec.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1.5 line-clamp-2 leading-relaxed">
                        {sec.subtitle}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono uppercase tracking-wider font-semibold text-cyan-300">
                      <span>Abrir Reproductor</span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1">➔</span>
                    </div>
                  </div>
                </button>
              );
            }
            const isSelected = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  if (window.playSfx) window.playSfx('click');
                }}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none cursor-pointer text-left focus:outline-none w-full h-full min-h-[260px] ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#16274a]/95 via-[#0d1b38]/90 to-[#05070f] border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-[1.02]'
                    : 'bg-[#090d1f]/90 border-white/10 hover:border-cyan-400/60 hover:bg-[#0e1633] hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                }`}
              >
                {/* Banner de Imagen Superior Grande */}
                <div className="relative w-full h-36 md:h-40 overflow-hidden bg-[#05070f] border-b border-white/10">
                  <SafeImg
                    id={sec.assetId}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${
                    isSelected
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-black/60 border-white/10 text-slate-400'
                  }`}>
                    {sec.tag}
                  </span>
                </div>

                {/* Cuerpo de la Tarjeta */}
                <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="text-base font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                      {sec.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-1.5 line-clamp-2 leading-relaxed">
                      {sec.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono uppercase tracking-wider font-semibold">
                    <span className={isSelected ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'}>
                      {isSelected ? '● Registro Visible' : 'Examinar Telemetría'}
                    </span>
                    <span className={`transition-transform duration-200 ${isSelected ? 'text-cyan-300 translate-x-1' : 'text-cyan-400/70 group-hover:translate-x-1'}`}>
                      ➔
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle del Área Seleccionada */}
      {activeSection === 'military' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#090d1f]/80 border border-white/10">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Victorias Navales</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">{combatsWon}</div>
            <span className="text-[10px] text-slate-500 font-mono">Ratio de victoria: {winRate}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d1f]/80 border border-white/10">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Naves Fabricadas</span>
            <div className="text-2xl font-black text-cyan-300 font-mono">{fmt(stats.totalShips || 0)}</div>
            <span className="text-[10px] text-slate-500 font-mono">Producción acumulada</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d1f]/80 border border-white/10">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Defensas Desplegadas</span>
            <div className="text-2xl font-black text-amber-300 font-mono">{fmt(stats.totalDefenses || 0)}</div>
            <span className="text-[10px] text-slate-500 font-mono">Bastiones planetarios</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090d1f]/80 border border-white/10">
            <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Niveles de Infraestructura</span>
            <div className="text-2xl font-black text-purple-300 font-mono">{stats.totalBuildings || 0}</div>
            <span className="text-[10px] text-slate-500 font-mono">En todas las colonias</span>
          </div>
        </div>
      )}

      {activeSection === 'resources' && (
        <div className="p-5 rounded-3xl bg-[#090d1f]/80 border border-cyan-500/20 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
            <span>⛏️</span> Extracción Histórica de Recursos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-[#05070f] border border-amber-500/20 flex items-center justify-between">
              <span className="text-xs text-amber-400 font-bold">⛏️ Metal Total</span>
              <span className="text-sm font-mono font-bold text-white">{fmt(stats.metalGathered || 0)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#05070f] border border-cyan-500/20 flex items-center justify-between">
              <span className="text-xs text-cyan-400 font-bold">💎 Cristal Total</span>
              <span className="text-sm font-mono font-bold text-white">{fmt(stats.crystalGathered || 0)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#05070f] border border-emerald-500/20 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-bold">⚗️ Deuterio Total</span>
              <span className="text-sm font-mono font-bold text-white">{fmt(stats.deuteriumGathered || 0)}</span>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'colonies' && (
        <div className="p-5 rounded-3xl bg-[#090d1f]/80 border border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
            <span>🌍</span> Registro de Colonias Soberanas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.planets?.map(p => {
              const bCount = Object.values(p.buildings || {}).reduce((a, b) => a + b, 0);
              const fCount = Object.values(p.fleet || {}).reduce((a, b) => a + b, 0);
              return (
                <div key={p.id} className="p-3 rounded-2xl bg-[#05070f] border border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase">{p.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">[{p.galaxy}:{p.system}:{p.position}]</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {bCount} edificios · {fmt(fCount)} naves · {p.temperature}°C
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPage;
