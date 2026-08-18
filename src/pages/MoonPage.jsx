import React, { useState } from 'react';

const MoonPage = ({ state, dispatch, currentPlanet, MOON_BUILDINGS, S, fmt, fmtTime, meetsReq, canAfford, constructionDiscount, onOpenCodex }) => {
  const [jumpTarget, setJumpTarget] = useState(null);
  const [scanGalaxy, setScanGalaxy] = useState(1);
  const [scanSystem, setScanSystem] = useState(100);
  const [scanResult, setScanResult] = useState(null);

  if (!currentPlanet.moon) {
    return (
      <div className={`${S.card} text-center py-12`}>
        <div className="text-6xl mb-4">🌑</div>
        <h3 className="text-xl mb-2">Sin Luna</h3>
        <p className="text-slate-400">Las lunas se forman con escombros de batalla. Genera al menos 100.000 de escombros para tener una probabilidad.</p>
      </div>
    );
  }
  
  const moon = currentPlanet.moon;

  const handleJump = (targetId, mode) => {
    if (!targetId) return;
    const fleet = {};
    const currentFleet = currentPlanet.fleet || {};
    if (mode === 'all') {
      for (const [id, qty] of Object.entries(currentFleet)) {
        if (qty > 0) fleet[id] = qty;
      }
    } else if (mode === 'half') {
      for (const [id, qty] of Object.entries(currentFleet)) {
        if (qty > 0) fleet[id] = Math.ceil(qty / 2);
      }
    }
    if (Object.keys(fleet).length === 0) return;
    dispatch({ type: 'JUMP_GATE_TRANSFER', fromPlanetId: currentPlanet.id, toPlanetId: targetId, fleet });
  };

  const handleScan = () => {
    const g = parseInt(scanGalaxy);
    const s = parseInt(scanSystem);
    if (isNaN(g) || isNaN(s)) return;
    const results = (state.fleetMissions || []).filter(m => m.to.galaxy === g && m.to.system === s);
    setScanResult(results);
  };
  
  return (
    <div className="space-y-4">
      <div className={S.cardDeep}>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">🌙 {moon.name}</h3>
        <div className="grid grid-cols-5 gap-2 items-stretch">
          {Object.entries(MOON_BUILDINGS).map(([id, b]) => {
            const lvl = moon.buildings[id] || 0;
            const cost = { metal: Math.floor(b.cost.m * Math.pow(b.factor, lvl) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0)), crystal: Math.floor(b.cost.c * Math.pow(b.factor, lvl) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0)), deuterium: Math.floor((b.cost.d || 0) * Math.pow(b.factor, lvl) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0)) };
            const meets = meetsReq(b.req, moon.buildings);
            const maxReached = b.max && lvl >= b.max;
            return (
              <div key={id} className={S.card}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{b.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{b.name}</div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onOpenCodex(id); }}
                        className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-[var(--ue-accent)] hover:border-[var(--ue-accent)]/40 hover:bg-[var(--ue-accent)]/10 transition-all group/info"
                        title="Ver detalles"
                      >
                        <span className="material-symbols-outlined text-[10px] group-hover/info:scale-110 transition-transform">menu_book</span>
                      </button>
                    </div>
                    <div className="text-xs text-slate-400">Nivel {lvl}{b.max ? ` / ${b.max}` : ''}</div>
                  </div>
                </div>
                <div className="space-y-1 mb-3 text-xs">
                  {cost.metal > 0 && <div className="flex justify-between"><span className="text-amber-400">Metal</span><span>{fmt(cost.metal)}</span></div>}
                  {cost.crystal > 0 && <div className="flex justify-between"><span className="text-cyan-400">Cristal</span><span>{fmt(cost.crystal)}</span></div>}
                  {cost.deuterium > 0 && <div className="flex justify-between"><span className="text-emerald-400">Deuterio</span><span>{fmt(cost.deuterium)}</span></div>}
                </div>
                <button onClick={() => dispatch({ type: 'BUILD_MOON_BUILDING', buildingId: id })} disabled={!canAfford(currentPlanet.resources, cost) || !meets || maxReached} className={`w-full mt-auto ${S.btn} ${canAfford(currentPlanet.resources, cost) && meets && !maxReached ? S.btnPrimary : S.btnGhost}`}>
                  {maxReached ? 'Máximo' : !meets ? '🔒 Requisitos' : canAfford(currentPlanet.resources, cost) ? `Construir (Nv.${lvl + 1})` : '💸 Sin recursos'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {moon.buildings.jumpGate > 0 && (
        <div className={S.cardDeep}>
          <h3 className="text-lg font-semibold mb-3">🌀 Puerta de Salto</h3>
          <p className="text-sm text-slate-400 mb-3">Transfiere flotas instantáneamente entre planetas con puerta de salto.</p>

          <div className="space-y-2">
            <select
              className={S.input + ' mb-2'}
              value={jumpTarget || ''}
              onChange={e => setJumpTarget(e.target.value)}
            >
              <option value="">Seleccionar destino...</option>
              {state.planets.filter(p => p.id !== currentPlanet.id && p.moon?.buildings?.jumpGate > 0).map(p => (
                <option key={p.id} value={p.id}>[{p.galaxy}:{p.system}:{p.position}] {p.name}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button onClick={() => handleJump(jumpTarget, 'all')} disabled={!jumpTarget} className={`${S.btn} ${S.btnPrimary} text-sm`}>Transferir todo</button>
              <button onClick={() => handleJump(jumpTarget, 'half')} disabled={!jumpTarget} className={`${S.btn} ${S.btnGhost} text-sm`}>Transferir mitad</button>
            </div>
          </div>
        </div>
      )}
      
      {moon.buildings.sensorPhalanx > 0 && (
        <div className={S.cardDeep}>
          <h3 className="text-lg font-semibold mb-3">📡 Phalanx Sensor</h3>
          <p className="text-sm text-slate-400 mb-3">Escanea un sistema para detectar flotas enemigas y misiones activas.</p>
          <div className="flex gap-2 mb-3">
            <input type="number" placeholder="Galaxia" className={S.input + ' w-24'} value={scanGalaxy} onChange={e => setScanGalaxy(e.target.value)} />
            <input type="number" placeholder="Sistema" className={S.input + ' w-24'} value={scanSystem} onChange={e => setScanSystem(e.target.value)} />
            <button onClick={handleScan} className={`${S.btn} ${S.btnPrimary}`}>🔍 Escanear</button>
          </div>
          {scanResult && (
            <div className="glass rounded-xl p-3 border border-white/10">
              <div className="font-semibold text-sm mb-2">Resultado [{scanGalaxy}:{scanSystem}]</div>
              {scanResult.length === 0 ? (
                <p className="text-xs text-slate-400">No se detectaron flotas.</p>
              ) : (
                scanResult.map((m, i) => (
                  <div key={i} className="text-xs text-slate-400 mb-1">
                    {m.isAI ? '👾' : '🚀'} {m.type} • {Object.values(m.fleet).reduce((a, b) => a + b, 0)} naves • ETA: {fmtTime(Math.max(0, (m.arrivalTime - Date.now()) / 1000))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoonPage;
