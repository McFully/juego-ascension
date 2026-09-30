import React, { useState } from 'react';

export const DefenseMissileSilosSection = ({
  siloLevel,
  currentMissiles,
  totalUsed,
  maxMissiles,
  haveIPMs,
  MISSILES,
  currentPlanet,
  constructionDiscount,
  canAfford,
  dispatch,
  fmt,
  S,
  onOpenCodex
}) => {
  const [launchQty, setLaunchQty] = useState(1);
  const [targetGal, setTargetGal] = useState(1);
  const [targetSys, setTargetSys] = useState(100);
  const [targetPos, setTargetPos] = useState(1);

  const handleLaunchMissile = () => {
    if (haveIPMs < launchQty) return;
    dispatch({
      type: 'LAUNCH_MISSILE',
      targetGalaxy: targetGal,
      targetSystem: targetSys,
      targetPosition: targetPos,
      quantity: launchQty
    });
  };

  if (siloLevel < 1) {
    return (
      <div className={`${S.card} text-center py-8`}>
        <div className="text-4xl mb-2">🎯</div>
        <h4 className="text-base font-bold text-amber-400 mb-1">Silo de Misiles no construido</h4>
        <p className="text-xs text-slate-400">Construye el Silo de Misiles en Infraestructura para desbloquear misiles de crucero interplanetarios y defensivos.</p>
      </div>
    );
  }

  const pctUsed = maxMissiles > 0 ? Math.min(100, Math.round((totalUsed / maxMissiles) * 100)) : 0;

  return (
    <div className="space-y-5 py-2">
      {/* HUD Medidor de Ocupación del Silo */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0a1226] via-[#0e1b38] to-[#0a1226] border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span>Capacidad de Almacén Balístico</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Nivel Silo {siloLevel}</span>
              </h4>
              <p className="text-[11px] text-slate-400 font-mono">Espacio para ojivas defensivas de intercepción y cruceros suborbitales</p>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs text-slate-400">Ocupación Silos</div>
            <div className="text-sm font-black text-amber-300">{totalUsed} / {maxMissiles} <span className="text-[11px] text-slate-400 font-normal">({pctUsed}%)</span></div>
          </div>
        </div>

        {/* Barra gráfica de capacidad */}
        <div className="w-full h-2.5 rounded-full bg-black/60 border border-white/10 overflow-hidden p-0.5">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              pctUsed >= 95 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : pctUsed >= 70 ? 'bg-amber-400' : 'bg-gradient-to-r from-cyan-500 to-amber-400'
            }`}
            style={{ width: `${pctUsed}%` }}
          />
        </div>
      </div>

      {/* Tarjetas Visuales de Fabricación de Misiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(MISSILES || {}).map(([id, m]) => {
          const cost = {
            metal: m.cost.m * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0),
            crystal: m.cost.c * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0),
            deuterium: (m.cost.d || 0) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0),
          };
          const have = currentMissiles[id] || 0;
          const canBuild = siloLevel > 0 && (totalUsed < maxMissiles);
          const afford1 = canAfford(currentPlanet.resources, cost);

          return (
            <div 
              key={id} 
              className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden ${
                totalUsed >= maxMissiles 
                  ? 'border-amber-500/30 bg-[#090d1e]/80' 
                  : !afford1 
                    ? 'border-cyan-900/30 bg-[#080d1e]/85' 
                    : 'border-cyan-500/30 bg-gradient-to-b from-[#0c1630] to-[#070d1a] hover:border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
              }`}
            >
              <div className="p-4">
                {/* Cabecera del Misil */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-3xl shadow-inner">
                      {m.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base tracking-wide">{m.name}</h4>
                        {onOpenCodex && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onOpenCodex && onOpenCodex(id); }}
                            className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                            title="Ver en Codex"
                          >
                            <span className="material-symbols-outlined text-[12px]">menu_book</span>
                          </button>
                        )}
                      </div>
                      <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                        <span>En reserva: <strong className="text-white text-sm">{fmt(have)}</strong> ojivas</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumen táctico de costes */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 grid grid-cols-3 gap-2 font-mono text-xs mb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400">⛏️ Metal</span>
                    <span className={`font-bold ${(currentPlanet?.resources?.metal ?? 0) >= cost.metal ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {fmt(cost.metal)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400">💎 Cristal</span>
                    <span className={`font-bold ${(currentPlanet?.resources?.crystal ?? 0) >= cost.crystal ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {fmt(cost.crystal)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400">⚗️ Deuterio</span>
                    <span className={`font-bold ${(currentPlanet?.resources?.deuterium ?? 0) >= (cost.deuterium || 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {fmt(cost.deuterium)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones de Ensamblaje Táctico */}
              <div className="p-4 pt-0">
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => dispatch({ type: 'BUILD_MISSILE', missileId: id, quantity: 1 })} 
                    disabled={!canBuild || !afford1} 
                    className={`py-2 rounded-lg font-mono text-xs font-bold transition-all focus-ring-game ${
                      canBuild && afford1 
                        ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 hover:border-cyan-400 cursor-pointer active:scale-95' 
                        : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed opacity-50'
                    }`}
                  >
                    +1
                  </button>
                  <button 
                    onClick={() => dispatch({ type: 'BUILD_MISSILE', missileId: id, quantity: 10 })} 
                    disabled={!canBuild || !canAfford(currentPlanet.resources, { metal: cost.metal * 10, crystal: cost.crystal * 10, deuterium: (cost.deuterium || 0) * 10 })} 
                    className={`py-2 rounded-lg font-mono text-xs font-bold transition-all focus-ring-game ${
                      canBuild && canAfford(currentPlanet.resources, { metal: cost.metal * 10, crystal: cost.crystal * 10, deuterium: (cost.deuterium || 0) * 10 })
                        ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 hover:border-cyan-400 cursor-pointer active:scale-95' 
                        : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed opacity-50'
                    }`}
                  >
                    +10
                  </button>
                  <button 
                    onClick={() => dispatch({ type: 'BUILD_MISSILE', missileId: id, quantity: Math.max(1, maxMissiles - totalUsed) })} 
                    disabled={!canBuild || totalUsed >= maxMissiles || !afford1} 
                    className={`py-2 rounded-lg font-mono text-xs font-black transition-all focus-ring-game ${
                      canBuild && totalUsed < maxMissiles && afford1
                        ? 'bg-gradient-to-r from-cyan-600/30 to-amber-600/30 hover:from-cyan-500/40 hover:to-amber-500/40 text-white border border-amber-400/50 cursor-pointer active:scale-95'
                        : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed opacity-50'
                    }`}
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal Balística de Fuego / Lanzador Suborbital */}
      {haveIPMs > 0 && (
        <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-[#09152b] to-[#040915] p-5 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-cyan-500/20">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-bounce">☄️</span>
              <div>
                <h4 className="text-base font-bold text-cyan-300 uppercase tracking-wide font-mono">
                  Consola Balística de Fuego Suborbital
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  {haveIPMs} Ojivas Interplanetarias Armadas y Listas para Lanzamiento
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase">
              ACTIVO
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4 font-mono">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Galaxia</label>
              <input 
                type="number" 
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 text-center" 
                value={targetGal} 
                onChange={e => setTargetGal(parseInt(e.target.value) || 1)} 
                min={1} 
                max={9} 
              />
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Sistema</label>
              <input 
                type="number" 
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 text-center" 
                value={targetSys} 
                onChange={e => setTargetSys(parseInt(e.target.value) || 1)} 
                min={1} 
                max={499} 
              />
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Posición</label>
              <input 
                type="number" 
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 text-center" 
                value={targetPos} 
                onChange={e => setTargetPos(parseInt(e.target.value) || 1)} 
                min={1} 
                max={15} 
              />
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Ojivas</label>
              <input 
                type="number" 
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400 text-center" 
                value={launchQty} 
                onChange={e => setLaunchQty(Math.min(haveIPMs, Math.max(1, parseInt(e.target.value) || 1)))} 
                min={1} 
                max={haveIPMs} 
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs font-mono text-slate-400">
              Coordenadas de impacto fijadas: <strong className="text-cyan-300">[{targetGal}:{targetSys}:{targetPos}]</strong> con <strong className="text-amber-300">{launchQty}</strong> misiles.
            </div>
            <button 
              onClick={handleLaunchMissile}
              className="px-6 py-2.5 rounded-xl font-mono text-sm font-bold bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white border border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer active:scale-95 transition-all flex items-center gap-2"
            >
              <span>🚀</span>
              <span>EJECUTAR LANZAMIENTO</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
