import React, { useState } from 'react';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';

const MissilesPage = ({ state, dispatch, currentPlanet, production, MISSILES, S, fmt, canAfford, constructionDiscount, onOpenCodex }) => {
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
        <div className="pt-2">
          <ActionCardTile
            type="back"
            title="Volver al Alto Mando"
            subtitle="Regresar al Alto Mando"
            icon="◀"
            badgeText="VOLVER"
            onClick={() => {
              if (navigateBack) navigateBack();
            }}
          />
        </div>
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
      {/* Fabricación de Misiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(MISSILES).map(([id, m]) => {
          const cost = {
            metal: m.cost.m * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0),
            crystal: m.cost.c * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0),
            deuterium: (m.cost.d || 0) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0)
          };
          const have = currentMissiles[id] || 0;
          const canBuild = totalUsed < maxMissiles && canAfford(cost, currentPlanet.resources);

          return (
            <div key={id} className="p-5 rounded-3xl bg-[#0c0d1e]/80 border border-white/10 flex flex-col justify-between hover:border-red-500/40 transition-all">
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
                      onClick={() => onOpenCodex(id)}
                      className="p-1 rounded bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-all text-xs"
                      title="Ver detalles"
                    >
                      📖
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-4">{m.desc}</p>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono mb-4 bg-[#05070f] p-2.5 rounded-xl border border-white/5">
                  <span className={`font-medium ${(currentPlanet?.resources?.metal ?? 0) >= cost.metal ? 'text-emerald-400' : 'text-rose-400'}`}>⛏️ {fmt(cost.metal)}</span>
                  <span className={`font-medium ${(currentPlanet?.resources?.crystal ?? 0) >= cost.crystal ? 'text-emerald-400' : 'text-rose-400'}`}>💎 {fmt(cost.crystal)}</span>
                  {cost.deuterium > 0 && (
                    <span className={`font-medium ${(currentPlanet?.resources?.deuterium ?? 0) >= cost.deuterium ? 'text-emerald-400' : 'text-rose-400'}`}>⚗️ {fmt(cost.deuterium)}</span>
                  )}
                </div>
              </div>

              <button
                disabled={!canBuild}
                onClick={() => dispatch({ type: 'BUILD_MISSILE', missileId: id })}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                  !canBuild
                    ? 'bg-slate-900 border border-white/10 text-slate-600 cursor-not-allowed'
                    : 'bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 hover:border-red-400 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                }`}
              >
                {totalUsed >= maxMissiles ? 'Silo lleno' : 'Fabricar 1 unidad'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Consola de Lanzamiento */}
      {haveIPMs > 0 && (
        <div className="p-6 rounded-3xl bg-[#140a0e]/80 border border-red-500/30 space-y-4">
          <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
            <span>🔥</span> Consola de Lanzamiento Balístico Suborbital
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Galaxia</label>
              <input
                type="number"
                value={targetGal}
                onChange={e => setTargetGal(e.target.value)}
                className="w-full bg-[#05070f] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-red-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Sistema</label>
              <input
                type="number"
                value={targetSys}
                onChange={e => setTargetSys(e.target.value)}
                className="w-full bg-[#05070f] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-red-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Posición</label>
              <input
                type="number"
                value={targetPos}
                onChange={e => setTargetPos(e.target.value)}
                className="w-full bg-[#05070f] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-red-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Cantidad (Disponibles: {haveIPMs})</label>
              <input
                type="number"
                min="1"
                max={haveIPMs}
                value={launchQty}
                onChange={e => setLaunchQty(e.target.value)}
                className="w-full bg-[#05070f] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-red-300"
              />
            </div>
          </div>
          <button
            onClick={handleLaunch}
            className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-mono font-black uppercase tracking-widest text-sm shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all cursor-pointer"
          >
            🚀 Ejecutar Ignición y Disparo Balístico
          </button>
        </div>
      )}

      {/* Tarjeta de Retorno a Alto Mando */}
      <div className="pt-2">
        <ActionCardTile
          type="back"
          title="Volver al Alto Mando"
          subtitle="Regresar al Alto Mando"
          badgeText="VOLVER"
          onClick={() => {
            if (navigateBack) navigateBack();
          }}
        />
      </div>
    </div>
  );
};

export default MissilesPage;
