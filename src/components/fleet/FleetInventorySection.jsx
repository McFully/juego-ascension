import React, { useState } from 'react';
import { SafeImg } from '../../assets.jsx';
import { canAfford } from '../../core.jsx';
import {
  extractShipTechSnapshot,
  isVariantOutdated,
  calculateRetrofitUnitCost
} from '../../utils/formulas/retrofitFormulas.js';
import { getShipStats } from '../../utils/formulas/combatFormulas.js';
import { RetrofitShipModal } from './RetrofitShipModal.jsx';
import { FleetRetrofitQueueSection } from './FleetRetrofitQueueSection.jsx';
import { FleetShipCard } from './FleetShipCard.jsx';

export const FleetInventorySection = React.memo(({
  currentPlanet,
  state,
  dispatch,
  SHIPS,
  shipDisplayIcon,
  shipDisplayName,
  shipStats,
  fmt,
  fmtTime = (s) => `${Math.floor(s)}s`,
  ProgressBar,
  S
}) => {
  const [subTab, setSubTab] = useState('ground'); // 'ground' | 'in_flight' | 'destroyed'
  const [groundFilter, setGroundFilter] = useState('all'); // 'all' | 'combat' | 'civil' | 'mercantile' | 'intel'
  const [modalVariantData, setModalVariantData] = useState(null); // { variant, shipId, shipInfo, currentVanguardStats } | null

  // 1. Naves amarradas en Tierra (en el planeta actual)
  const groundShips = Object.entries(currentPlanet?.fleet || {})
    .filter(([_, q]) => q > 0);

  const getShipCategory = (id) => {
    const s = SHIPS[id];
    if (s?.cat === 'civil') {
      if (id.includes('Cargo')) return 'mercantile';
      if (id.includes('spy') || id.includes('probe')) return 'intel';
      return 'civil';
    }
    if (id.startsWith('custom_')) return 'combat';
    if (['lightFighter', 'heavyFighter', 'cruiser', 'battleship', 'bomber', 'destroyer', 'deathstar', 'planetDestroyer'].includes(id)) {
      return 'combat';
    }
    if (['spyProbe', 'scannerDrone'].includes(id)) return 'intel';
    return 'civil';
  };

  const filteredGroundShips = groundShips.filter(([id]) => {
    if (groundFilter === 'all') return true;
    const cat = getShipCategory(id);
    if (groundFilter === 'mercantile') return cat === 'mercantile';
    if (groundFilter === 'combat') return cat === 'combat';
    if (groundFilter === 'civil') return cat === 'civil' || cat === 'mercantile';
    if (groundFilter === 'intel') return cat === 'intel';
    return true;
  });

  const totalGroundCount = groundShips.reduce((acc, [, q]) => acc + q, 0);

  // 2. Unidades en vuelo (solo recuento de unidades activas en misiones del jugador)
  const playerMissions = (state.fleetMissions || []).filter(m => !m.isAI);
  const inFlightCounts = {};
  playerMissions.forEach(m => {
    Object.entries(m.fleet || {}).forEach(([id, q]) => {
      inFlightCounts[id] = (inFlightCounts[id] || 0) + q;
    });
  });
  const inFlightList = Object.entries(inFlightCounts).filter(([_, q]) => q > 0);
  const totalInFlightCount = inFlightList.reduce((acc, [, q]) => acc + q, 0);

  // 3. Unidades destruidas (balance de bajas sufridas en combate)
  const destroyedCounts = {};
  (state.combatLog || []).forEach(log => {
    const isPlayerAtk = log.attacker?.name === state.playerName;
    const isPlayerDef = log.defender?.name === state.playerName;
    if (isPlayerAtk && log.summary?.atkLostTotal) {
      const lostMap = log.summary?.atkLostShips || {};
      Object.entries(lostMap).forEach(([id, q]) => {
        destroyedCounts[id] = (destroyedCounts[id] || 0) + q;
      });
    } else if (isPlayerDef && log.summary?.defLostTotal) {
      const lostMap = log.summary?.defLostShips || {};
      Object.entries(lostMap).forEach(([id, q]) => {
        destroyedCounts[id] = (destroyedCounts[id] || 0) + q;
      });
    }
  });
  const destroyedList = Object.entries(destroyedCounts).filter(([_, q]) => q > 0);
  const totalDestroyedCount = destroyedList.reduce((acc, [, q]) => acc + q, 0);

  return (
    <div className="bg-[#090d1f]/90 border border-cyan-500/25 rounded-3xl p-5 md:p-6 shadow-2xl space-y-5">
      {/* Cabecera Principal del Inventario */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            🛸
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
              Inventario de Flota — {currentPlanet?.name || 'Base'}
            </h3>
            <p className="text-xs text-cyan-400 font-mono">
              Control táctico de amarre, unidades en el espacio exterior y registro de bajas
            </p>
          </div>
        </div>

        {/* 3 Sub-Tarjetas de Botón de Inventario */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-Tarjeta 1: Flota en Tierra */}
          <button
            onClick={() => {
              setSubTab('ground');
              if (window.playSfx) window.playSfx('click');
            }}
            className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              subTab === 'ground'
                ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105'
                : 'bg-black/50 border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40'
            }`}
          >
            <span className="text-base">⚓</span>
            <span>En Hangar</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-black">
              {fmt(totalGroundCount)}
            </span>
          </button>

          {/* Sub-Tarjeta 2: Flotas en Vuelo (Solo unidades) */}
          <button
            onClick={() => {
              setSubTab('in_flight');
              if (window.playSfx) window.playSfx('click');
            }}
            className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              subTab === 'in_flight'
                ? 'bg-blue-500/25 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-105'
                : 'bg-black/50 border-white/10 text-slate-400 hover:text-blue-300 hover:border-blue-500/40'
            }`}
          >
            <span className="text-base">🚀</span>
            <span>En Vuelo (Unidades)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-950 border border-blue-500/50 text-blue-300 font-black">
              {fmt(totalInFlightCount)}
            </span>
          </button>

          {/* Sub-Tarjeta 3: Flotas Destruidas */}
          <button
            onClick={() => {
              setSubTab('destroyed');
              if (window.playSfx) window.playSfx('click');
            }}
            className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              subTab === 'destroyed'
                ? 'bg-rose-500/25 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] scale-105'
                : 'bg-black/50 border-white/10 text-slate-400 hover:text-rose-300 hover:border-rose-500/40'
            }`}
          >
            <span className="text-base">💀</span>
            <span>Destruidas</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-950 border border-rose-500/50 text-rose-300 font-black">
              {fmt(totalDestroyedCount)}
            </span>
          </button>
        </div>
      </div>

      {/* SUB-VISTA 1: NAVES AMARRADAS EN TIERRA (GRID 6 COLUMNAS ESTILO ASTILLERO) */}
      {subTab === 'ground' && (
        <div className="space-y-4">
          {/* Cola de Modernización Activa en el Hangar */}
          <FleetRetrofitQueueSection
            retrofitQueues={(state.retrofitQueue || []).filter(q => q.planetId === currentPlanet?.id && q.type === 'ship_variant')}
            SHIPS={SHIPS}
            fmt={fmt}
            fmtTime={fmtTime}
            ProgressBar={ProgressBar}
            dispatch={dispatch}
          />

          {/* Filtros de Categoría */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-3 rounded-2xl border border-white/5 font-mono text-xs">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: '🚀 Todas', icon: '🌌' },
                { id: 'combat', label: 'Armada de Combate', icon: '⚔️' },
                { id: 'mercantile', label: 'Mercantiles', icon: '📦' },
                { id: 'civil', label: 'Civiles y Colonización', icon: '🏛️' },
                { id: 'intel', label: 'Espionaje e Inteligencia', icon: '🕵️' },
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setGroundFilter(btn.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    groundFilter === btn.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                      : 'bg-black/40 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{btn.icon}</span>
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>

            <span className="text-slate-400 text-[11px]">
              Mostrando <strong className="text-cyan-300">{filteredGroundShips.length}</strong> modelos en dársena
            </span>
          </div>

          {filteredGroundShips.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-black/30 border border-white/5 text-slate-500 text-xs font-mono">
              No hay naves amarradas en esta categoría dentro del hangar de {currentPlanet?.name}.
            </div>
          ) : (
            /* Grid de Tarjetas por modelo en el Hangar */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 items-stretch">
              {filteredGroundShips.map(([id, qty]) => {
                const icon = shipDisplayIcon(id);
                const name = shipDisplayName(id);
                const currentVanguardStats = shipStats(id);
                const s = SHIPS[id];

                // Buscar variantes registradas para este modelo de nave en el planeta
                const variants = Object.values(currentPlanet?.fleetVariants || {})
                  .filter(v => v && v.baseId === id && v.count > 0);

                // Si no hay variantes registradas aún (save antiguo), generar variante virtual
                const effectiveVariants = variants.length > 0 ? variants : [
                  {
                    baseId: id,
                    variantKey: `${id}__legacy`,
                    techGen: 1,
                    techSnapshot: {},
                    stats: getShipStats(id, {}, state.blueprints, 'human', currentPlanet?.buildings || {}) || s,
                    count: qty
                  }
                ];

                const currentTech = extractShipTechSnapshot(state.research || {});

                return (
                  <FleetShipCard
                    key={id}
                    id={id}
                    qty={qty}
                    s={s}
                    icon={icon}
                    name={name}
                    currentVanguardStats={currentVanguardStats}
                    effectiveVariants={effectiveVariants}
                    currentTech={currentTech}
                    state={state}
                    currentPlanet={currentPlanet}
                    fmt={fmt}
                    onOpenRetrofitModal={(v, shipId, shipInfo, vanguardStats) => {
                      setModalVariantData({
                        variant: v,
                        shipId,
                        shipInfo,
                        currentVanguardStats: vanguardStats
                      });
                      if (window.playSfx) window.playSfx('click');
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VISTA 2: UNIDADES EN VUELO (SOLO UNIDADES) */}
      {subTab === 'in_flight' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-2xl flex items-center justify-between text-xs font-mono text-blue-300">
            <span>🛸 Despliegue Exterior: Resumen consolidado de naves operando actualmente en el espacio.</span>
            <span className="font-bold text-white">Total: {fmt(totalInFlightCount)} unidades</span>
          </div>

          {inFlightList.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-black/30 border border-white/5 text-slate-500 text-xs font-mono">
              No hay unidades desplegadas en el espacio exterior en este momento. Todas las flotas están amarradas en dársena.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 items-stretch">
              {inFlightList.map(([id, qty]) => {
                const icon = shipDisplayIcon(id);
                const name = shipDisplayName(id);
                const st = shipStats(id);

                return (
                  <div
                    key={id}
                    className="p-3 rounded-2xl border border-blue-500/30 bg-gradient-to-b from-[#0c1833]/90 to-[#050b1a] flex flex-col justify-between"
                  >
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-black/60 border border-white/10 mb-2.5 flex items-center justify-center">
                      <SafeImg
                        id={id}
                        fallbackText={icon}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-950 border border-blue-400/60 text-blue-200">
                        {fmt(qty)} en vuelo
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white truncate" title={name}>{name}</h4>
                      <p className="text-[10px] text-blue-400 font-mono mt-0.5">Operativa en tránsito</p>
                    </div>

                    {st && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between text-[9px] font-mono text-slate-400">
                        <span>⚔️ {st.atk?.toFixed?.(0) || st.atk}</span>
                        <span>🛡️ {st.shd?.toFixed?.(0) || st.shd}</span>
                        <span>📦 {fmt(st.cargo || 0)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VISTA 3: UNIDADES DESTRUIDAS (REGISTRO DE BAJAS) */}
      {subTab === 'destroyed' && (
        <div className="space-y-4">
          <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-2xl flex items-center justify-between text-xs font-mono text-rose-300">
            <span>💀 Panteón Naval: Historial de naves y cazas destruidos en enfrentamientos bélicos.</span>
            <span className="font-bold text-white">Bajas totales: {fmt(totalDestroyedCount)} unidades</span>
          </div>

          {destroyedList.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-black/30 border border-white/5 text-slate-500 text-xs font-mono">
              No hay bajas navales registradas en los sistemas de combate del imperio. ¡Eficacia impecable!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 items-stretch">
              {destroyedList.map(([id, qty]) => {
                const icon = shipDisplayIcon(id);
                const name = shipDisplayName(id);
                const st = shipStats(id);

                return (
                  <div
                    key={id}
                    className="p-3 rounded-2xl border border-rose-500/30 bg-gradient-to-b from-[#240c14]/90 to-[#0e0508] flex flex-col justify-between"
                  >
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-black/60 border border-rose-500/20 mb-2.5 flex items-center justify-center filter grayscale contrast-125">
                      <SafeImg
                        id={id}
                        fallbackText={icon}
                        className="w-full h-full object-cover opacity-70"
                      />
                      <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-950 border border-rose-500/60 text-rose-300">
                        -{fmt(qty)} bajas
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-200 truncate" title={name}>{name}</h4>
                      <p className="text-[10px] text-rose-400 font-mono mt-0.5">Pérdida en combate</p>
                    </div>

                    {st && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between text-[9px] font-mono text-slate-500">
                        <span>⚔️ {st.atk?.toFixed?.(0) || st.atk}</span>
                        <span>🛡️ {st.shd?.toFixed?.(0) || st.shd}</span>
                        <span>💪 {fmt(st.hull || 0)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL TÁCTICO DE MODERNIZACIÓN NAVAL COMPARATIVO Y POR LOTES */}
      {modalVariantData && (
        <RetrofitShipModal
          isOpen={Boolean(modalVariantData)}
          onClose={() => setModalVariantData(null)}
          variant={modalVariantData.variant}
          shipId={modalVariantData.shipId}
          shipInfo={modalVariantData.shipInfo}
          currentPlanet={currentPlanet}
          currentTech={extractShipTechSnapshot(state.research || {})}
          currentVanguardStats={modalVariantData.currentVanguardStats}
          dispatch={dispatch}
          fmt={fmt}
          fmtTime={fmtTime}
        />
      )}
    </div>
  );
});
