import React, { useState } from 'react';

const MissilesPage = ({ state, dispatch, currentPlanet, MISSILES, S, fmt, canAfford, constructionDiscount, onOpenCodex }) => {
  const siloLevel = currentPlanet.buildings.missileSilo || 0;
  const [missileTarget, setMissileTarget] = useState(null);
  const [launchQty, setLaunchQty] = useState(1);
  const [targetGal, setTargetGal] = useState(1);
  const [targetSys, setTargetSys] = useState(100);
  const [targetPos, setTargetPos] = useState(1);

  if (siloLevel < 1) {
    return (
      <div className={`${S.card} text-center py-12`}>
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl mb-2">Silo de Misiles requerido</h3>
        <p className="text-slate-400">Construye un Silo de Misiles en la pestaña de Instalaciones para fabricar misiles.</p>
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
    setMissileTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className={S.card}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">🎯 Silo de Misiles</h3>
          <span className="text-sm text-slate-400">Nv.{siloLevel} &bull; {totalUsed}/{maxMissiles}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(MISSILES).map(([id, m]) => {
            const cost = { metal: m.cost.m * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0), crystal: m.cost.c * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0), deuterium: (m.cost.d || 0) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0) };
            const have = currentMissiles[id] || 0;
            const canBuild = siloLevel > 0 && (totalUsed < maxMissiles);
            return (
              <div key={id} className={S.card}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{m.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{m.name}</div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onOpenCodex(id); }}
                        className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-[var(--ue-accent)] hover:border-[var(--ue-accent)]/40 hover:bg-[var(--ue-accent)]/10 transition-all group/info"
                        title="Ver detalles"
                      >
                        <span className="material-symbols-outlined text-[10px] group-hover/info:scale-110 transition-transform">menu_book</span>
                      </button>
                    </div>
                    <div className="text-xs text-slate-400">Disponibles: {have}</div>
                  </div>
                </div>
                <div className="space-y-1 mb-3 text-xs">
                  {cost.metal > 0 && <div className="flex justify-between"><span className="text-amber-400">Metal</span><span>{fmt(cost.metal)}</span></div>}
                  {cost.crystal > 0 && <div className="flex justify-between"><span className="text-cyan-400">Cristal</span><span>{fmt(cost.crystal)}</span></div>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => dispatch({ type: 'BUILD_MISSILE', missileId: id, quantity: 1 })} disabled={!canBuild || !canAfford(currentPlanet.resources, cost)} className={`flex-1 ${S.btn} ${S.btnPrimary} text-xs`}>+1</button>
                  <button onClick={() => dispatch({ type: 'BUILD_MISSILE', missileId: id, quantity: 10 })} disabled={!canBuild || !canAfford(currentPlanet.resources, { metal: cost.metal * 10, crystal: cost.crystal * 10, deuterium: (cost.deuterium || 0) * 10 })} className={`flex-1 ${S.btn} ${S.btnPrimary} text-xs`}>+10</button>
                  <button onClick={() => dispatch({ type: 'BUILD_MISSILE', missileId: id, quantity: Math.max(1, maxMissiles - totalUsed) })} disabled={!canBuild || totalUsed >= maxMissiles} className={`flex-1 ${S.btn} ${S.btnGhost} text-xs`}>MAX</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missile Launch */}
      {haveIPMs > 0 && (
        <div className={S.card}>
          <h3 className="text-lg font-semibold mb-3">☄️ Lanzar Misiles ({haveIPMs} disponibles)</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div><label className="text-xs text-slate-400">Galaxia</label>
              <input type="number" className={S.input} value={targetGal} onChange={e => setTargetGal(parseInt(e.target.value) || 1)} min={1} max={9} /></div>
            <div><label className="text-xs text-slate-400">Sistema</label>
              <input type="number" className={S.input} value={targetSys} onChange={e => setTargetSys(parseInt(e.target.value) || 1)} min={1} max={499} /></div>
            <div><label className="text-xs text-slate-400">Posición</label>
              <input type="number" className={S.input} value={targetPos} onChange={e => setTargetPos(parseInt(e.target.value) || 1)} min={1} max={15} /></div>
          </div>
          <div className="flex gap-2 mb-3">
            <input type="number" className={S.input + ' w-24'} value={launchQty} onChange={e => setLaunchQty(Math.min(haveIPMs, Math.max(1, parseInt(e.target.value) || 1)))} min={1} max={haveIPMs} />
            <button onClick={handleLaunch} disabled={haveIPMs < launchQty}
              className={`${S.btn} ${haveIPMs >= launchQty ? S.btnDanger : S.btnGhost}`}>
              ☄️ Lanzar {launchQty}
            </button>
          </div>
          <p className="text-xs text-slate-400">Los misiles destruyen defensas y edificios. El enemigo puede tener ABMs.</p>
        </div>
      )}
    </div>
  );
};

export default MissilesPage;
