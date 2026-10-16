import React, { useState } from 'react';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';

const MissilesPage = ({ state, dispatch, currentPlanet, production, MISSILES, S, fmt, canAfford, constructionDiscount, onOpenCodex, meetsReq, RESEARCH }) => {
  const { navigateTo, navigateBack } = useNavigation();
  const siloLevel = currentPlanet.buildings?.missileSilo || 0;
  const [launchQty, setLaunchQty] = useState(1);
  const [targetGal, setTargetGal] = useState(1);
  const [targetSys, setTargetSys] = useState(100);
  const [targetPos, setTargetPos] = useState(1);

  if (siloLevel < 1) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#070b1a]/80 p-8 text-center max-w-xl mx-auto space-y-6 view-enter">
        <div className="text-6xl">🎯</div>
        <h3 className="text-2xl font-black text-white uppercase tracking-wide">Silo de Misiles Requerido</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          Construye un Silo de Misiles en el Complejo de Obras para fabricar munición balística e interceptora suborbital.
        </p>
      </div>
    );
  }

  const maxMissiles = siloLevel * 10;
  const currentMissiles = currentPlanet.missiles || {};
  const totalUsed = Object.values(currentMissiles).reduce((a, b) => a + b, 0);
  const haveIPMs = currentMissiles.interplanetaryMissile || 0;

  const handleLaunch = () => {
    if (haveIPMs < launchQty) return;
    dispatch({ type: 'LAUNCH_MISSILE', targetGalaxy: targetGal, targetSystem: targetSys, targetPosition: targetPos, quantity: launchQty });
    if (window.playSfx) window.playSfx('explosion');
  };

  return (
    <div className="space-y-4 view-enter w-full">
      {/* DOM Superior Estandarizado (Recursos + Explorador + Silo Status) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Silos de Misiles"
        breadcrumbIcon="🎯"
        rightSlot={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200">
            <span className="text-[10px] uppercase font-mono font-bold">Capacidad de Silo:</span>
            <span className="font-bold text-sm text-white">Nv.{siloLevel}</span>
            <span className="text-slate-400 font-mono">({totalUsed}/{maxMissiles})</span>
          </div>
        }
      />
      {/* Grid de 3 Tarjetas en la Misma Línea: Misil Interplanetario | Misil Antibalístico | Consola de Lanzamiento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Tarjeta 1: Misil Interplanetario */}
        {(() => {
          const id = 'interplanetaryMissile';
          const m = MISSILES.interplanetaryMissile;
          if (!m) return null;
          const cost = {
            metal: m.cost.m * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0),
            crystal: m.cost.c * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0),
            deuterium: (m.cost.d || 0) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0)
          };
          const have = currentMissiles[id] || 0;
          const meets = meetsReq ? meetsReq(m.req, { ...currentPlanet.buildings, ...state.research }) : true;
          const canBuild = totalUsed < maxMissiles && canAfford(currentPlanet.resources, cost) && meets;

          return (
            <div key={id} className="p-5 rounded-3xl bg-[#0c0d1e]/80 border border-white/10 flex flex-col justify-between hover:border-red-500/40 transition-all h-full">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{m.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase">{m.name}</h4>
                      <span className="text-xs font-mono text-slate-400">Disponibles: <strong className="text-red-300 font-bold">{have}</strong></span>
                    </div>
                  </div>
                  {onOpenCodex && (
                    <button
                      type="button"
                      onClick={() => onOpenCodex && onOpenCodex(id)}
                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 hover:text-white flex items-center justify-center text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                      title="Ver detalles completos del misil"
                      aria-label="Ver detalles completos del misil"
                    >
                      <span>📋</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">{m.desc || 'No disponible'}</p>

                {/* Bloque 2: Censo, Mantenimiento y Salarios */}
                <div className="mb-3 p-2.5 rounded-xl bg-[#05070f] border border-red-500/20 font-mono text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1">👥 Técnicos de Silo:</span>
                    <span className="font-bold text-red-200">{fmt(have * 4)} esp.</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1">🛠️ Mant. Munición:</span>
                    <span className="font-bold text-amber-300">{fmt(have * 8)} cr/h <span className="text-slate-500 font-normal">({fmt(have * 8 * 24)}/día)</span></span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1">💳 Salarios Artillería:</span>
                    <span className="font-bold text-cyan-300">{fmt(have * 10)} cr/h <span className="text-slate-500 font-normal">({fmt(have * 10 * 24)}/día)</span></span>
                  </div>
                </div>

                {/* Bloque 3: Coste de Fabricación y Requisitos */}
                <div className="flex flex-wrap gap-2 text-[10px] font-mono mb-3 bg-[#05070f] p-2.5 rounded-xl border border-white/5">
                  <span className={`font-medium ${(currentPlanet?.resources?.metal ?? 0) >= cost.metal ? 'text-emerald-400' : 'text-rose-400'}`}>⛏️ {fmt(cost.metal)}</span>
                  <span className={`font-medium ${(currentPlanet?.resources?.crystal ?? 0) >= cost.crystal ? 'text-emerald-400' : 'text-rose-400'}`}>💎 {fmt(cost.crystal)}</span>
                  {cost.deuterium > 0 && (
                    <span className={`font-medium ${(currentPlanet?.resources?.deuterium ?? 0) >= cost.deuterium ? 'text-emerald-400' : 'text-rose-400'}`}>⚗️ {fmt(cost.deuterium)}</span>
                  )}
                </div>
                {m.req && !meets && (
                  <div className="text-[10px] text-red-400 mb-3 p-1.5 rounded-lg bg-red-950/30 border border-red-500/20 leading-tight font-mono flex items-center gap-1.5">
                    <span>🔒</span>
                    <span>Req: {Object.entries(m.req).map(([k, v]) => `${RESEARCH?.[k]?.name || k} Nv.${v}`).join(', ')}</span>
                  </div>
                )}
              </div>

              <button
                disabled={!canBuild}
                onClick={() => dispatch({ type: 'BUILD_MISSILE', missileId: id, quantity: 1 })}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                  !canBuild
                    ? 'bg-slate-900 border border-white/10 text-slate-600 cursor-not-allowed'
                    : 'bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 hover:border-red-400 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                }`}
              >
                {!meets ? 'Requisitos no cumplidos' : (totalUsed >= maxMissiles ? 'Silo lleno' : 'Fabricar 1 unidad')}
              </button>
            </div>
          );
        })()}

        {/* Tarjeta 2: Misil Antibalístico */}
        {(() => {
          const id = 'antiBallisticMissile';
          const m = MISSILES.antiBallisticMissile;
          if (!m) return null;
          const cost = {
            metal: m.cost.m * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0),
            crystal: m.cost.c * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0),
            deuterium: (m.cost.d || 0) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0)
          };
          const have = currentMissiles[id] || 0;
          const meets = meetsReq ? meetsReq(m.req, { ...currentPlanet.buildings, ...state.research }) : true;
          const canBuild = totalUsed < maxMissiles && canAfford(currentPlanet.resources, cost) && meets;

          return (
            <div key={id} className="p-5 rounded-3xl bg-[#0c0d1e]/80 border border-white/10 flex flex-col justify-between hover:border-red-500/40 transition-all h-full">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{m.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase">{m.name}</h4>
                      <span className="text-xs font-mono text-slate-400">Disponibles: <strong className="text-red-300 font-bold">{have}</strong></span>
                    </div>
                  </div>
                  {onOpenCodex && (
                    <button
                      type="button"
                      onClick={() => onOpenCodex && onOpenCodex(id)}
                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 hover:text-white flex items-center justify-center text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                      title="Ver detalles completos del misil"
                      aria-label="Ver detalles completos del misil"
                    >
                      <span>📋</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">{m.desc || 'No disponible'}</p>

                {/* Bloque 2: Censo, Mantenimiento y Salarios */}
                <div className="mb-3 p-2.5 rounded-xl bg-[#05070f] border border-red-500/20 font-mono text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1">👥 Técnicos Interceptores:</span>
                    <span className="font-bold text-red-200">{fmt(have * 2)} esp.</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1">🛠️ Mant. Munición:</span>
                    <span className="font-bold text-amber-300">{fmt(have * 4)} cr/h <span className="text-slate-500 font-normal">({fmt(have * 4 * 24)}/día)</span></span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1">💳 Salarios Batería:</span>
                    <span className="font-bold text-cyan-300">{fmt(have * 6)} cr/h <span className="text-slate-500 font-normal">({fmt(have * 6 * 24)}/día)</span></span>
                  </div>
                </div>

                {/* Bloque 3: Coste de Fabricación y Requisitos */}
                <div className="flex flex-wrap gap-2 text-[10px] font-mono mb-3 bg-[#05070f] p-2.5 rounded-xl border border-white/5">
                  <span className={`font-medium ${(currentPlanet?.resources?.metal ?? 0) >= cost.metal ? 'text-emerald-400' : 'text-rose-400'}`}>⛏️ {fmt(cost.metal)}</span>
                  <span className={`font-medium ${(currentPlanet?.resources?.crystal ?? 0) >= cost.crystal ? 'text-emerald-400' : 'text-rose-400'}`}>💎 {fmt(cost.crystal)}</span>
                  {cost.deuterium > 0 && (
                    <span className={`font-medium ${(currentPlanet?.resources?.deuterium ?? 0) >= cost.deuterium ? 'text-emerald-400' : 'text-rose-400'}`}>⚗️ {fmt(cost.deuterium)}</span>
                  )}
                </div>
                {m.req && !meets && (
                  <div className="text-[10px] text-red-400 mb-3 p-1.5 rounded-lg bg-red-950/30 border border-red-500/20 leading-tight font-mono flex items-center gap-1.5">
                    <span>🔒</span>
                    <span>Req: {Object.entries(m.req).map(([k, v]) => `${RESEARCH?.[k]?.name || k} Nv.${v}`).join(', ')}</span>
                  </div>
                )}
              </div>

              <button
                disabled={!canBuild}
                onClick={() => dispatch({ type: 'BUILD_MISSILE', missileId: id, quantity: 1 })}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                  !canBuild
                    ? 'bg-slate-900 border border-white/10 text-slate-600 cursor-not-allowed'
                    : 'bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 hover:border-red-400 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                }`}
              >
                {!meets ? 'Requisitos no cumplidos' : (totalUsed >= maxMissiles ? 'Silo lleno' : 'Fabricar 1 unidad')}
              </button>
            </div>
          );
        })()}

        {/* Tarjeta 3: Consola de Lanzamiento Balístico Suborbital */}
        <div className="p-5 rounded-3xl bg-[#140a0e]/80 border border-red-500/30 flex flex-col justify-between hover:border-red-500/60 transition-all h-full">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🔥</span>
              <div>
                <h4 className="text-sm font-bold text-white uppercase leading-tight">Consola Balística</h4>
                <span className="text-xs font-mono text-slate-400">
                  Lanzamiento Suborbital ({haveIPMs} disponibles)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Dispara ráfagas de misiles interplanetarios hacia coordenadas de la galaxia para arrasar defensas.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Galaxia (1-9)</label>
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={targetGal}
                  onChange={e => setTargetGal(Math.max(1, Math.min(9, parseInt(e.target.value) || 1)))}
                  className="w-full bg-[#05070f] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-red-300 text-center focus:outline-none focus:border-red-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Sistema (1-499)</label>
                <input
                  type="number"
                  min={1}
                  max={499}
                  value={targetSys}
                  onChange={e => setTargetSys(Math.max(1, Math.min(499, parseInt(e.target.value) || 1)))}
                  className="w-full bg-[#05070f] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-red-300 text-center focus:outline-none focus:border-red-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Posición (1-15)</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={targetPos}
                  onChange={e => setTargetPos(Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))}
                  className="w-full bg-[#05070f] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-red-300 text-center focus:outline-none focus:border-red-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, haveIPMs)}
                  value={launchQty}
                  onChange={e => setLaunchQty(Math.max(1, Math.min(Math.max(1, haveIPMs), parseInt(e.target.value) || 1)))}
                  className="w-full bg-[#05070f] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-red-300 text-center focus:outline-none focus:border-red-400"
                />
              </div>
            </div>
          </div>

          <button
            disabled={haveIPMs < 1}
            onClick={handleLaunch}
            className={`w-full py-2.5 rounded-xl font-mono font-black uppercase tracking-wider text-xs transition-all ${
              haveIPMs < 1
                ? 'bg-slate-900 border border-white/10 text-slate-600 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer active:scale-98'
            }`}
          >
            {haveIPMs < 1 ? 'Sin Misiles Listos' : '🚀 Ejecutar Disparo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissilesPage;
