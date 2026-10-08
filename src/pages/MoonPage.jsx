import React, { useState } from 'react';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';

const MoonPage = ({ state, dispatch, currentPlanet, production, MOON_BUILDINGS, S, fmt, fmtTime, meetsReq, canAfford, constructionDiscount, onOpenCodex }) => {
  const { navigateTo, navigateBack } = useNavigation();
  const [jumpTarget, setJumpTarget] = useState(null);
  const [scanGalaxy, setScanGalaxy] = useState(1);
  const [scanSystem, setScanSystem] = useState(100);
  const [scanResult, setScanResult] = useState(null);

  if (!currentPlanet.moon) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#070b1a]/80 p-8 text-center max-w-xl mx-auto space-y-4 view-enter">
        <div className="text-6xl drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">🌑</div>
        <h3 className="text-2xl font-black text-white uppercase tracking-wide">Sin Base Lunar Operativa</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          Las lunas se forman con los escombros de batallas masivas en la órbita del planeta. Acumula restos espaciales para consolidar un satélite natural.
        </p>
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
    if (window.playSfx) window.playSfx('warp');
  };

  const handleScan = () => {
    const g = parseInt(scanGalaxy);
    const s = parseInt(scanSystem);
    if (isNaN(g) || isNaN(s)) return;
    const results = (state.fleetMissions || []).filter(m => m.to.galaxy === g && m.to.system === s);
    setScanResult(results);
    if (window.playSfx) window.playSfx('radar');
  };
  
  return (
    <div className="space-y-6 view-enter w-full">
      {/* DOM Superior Estandarizado (Recursos + Explorador + Satélite Status) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle={`Base Lunar (${moon.name || 'Satélite'})`}
        breadcrumbIcon="🌑"
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono">
              <span className="text-slate-400">Diámetro:</span>
              <span className="font-bold text-purple-300">{moon.size ? `${fmt(moon.size)} km` : '8,420 km'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
              <span className="text-slate-400">Campos:</span>
              <span className="font-bold text-cyan-300">{moon.fieldsUsed || 0}/{moon.maxFields || 10}</span>
            </div>
          </div>
        }
      />
      {/* Banner Lunar Compacto */}
      <div className="relative rounded-xl overflow-hidden border border-cyan-500/20 bg-gradient-to-r from-[#070c1e] via-[#0d1b3a] to-[#070c1e] px-4 py-2.5 shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">🌙</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-black text-white uppercase tracking-tight">
                Base Lunar {moon.name}
              </h2>
              <span className="text-slate-600">·</span>
              <p className="text-[10px] text-cyan-300 font-mono">
                Sensores Phalanx y Salto Hiperespacial
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instalaciones Lunares */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(MOON_BUILDINGS).map(([id, b]) => {
          const lvl = moon.buildings[id] || 0;
          const cost = {
            metal: Math.floor(b.cost.m * Math.pow(b.factor, lvl) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0)),
            crystal: Math.floor(b.cost.c * Math.pow(b.factor, lvl) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0)),
            deuterium: Math.floor((b.cost.d || 0) * Math.pow(b.factor, lvl) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0))
          };
          const meets = meetsReq(b.req, moon.buildings);
          const maxReached = b.max && lvl >= b.max;
          const affordable = canAfford(currentPlanet.resources, cost);

          return (
            <div key={id} className="p-4 rounded-2xl bg-[#090d1f]/80 border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase">{b.name}</h4>
                      <span className="text-xs font-mono text-cyan-300 font-bold">Nivel {lvl}</span>
                    </div>
                  </div>
                  {onOpenCodex && (
                    <button
                      type="button"
                      onClick={() => onOpenCodex(id)}
                      className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 hover:text-white flex items-center justify-center text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                      title="Ver detalles completos del edificio lunar"
                      aria-label="Ver detalles completos del edificio lunar"
                    >
                      <span>📋</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mb-3">{b.desc || 'No disponible'}</p>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono mb-4 bg-[#05070f] p-2 rounded-xl border border-white/5">
                  <span className={`font-medium ${(currentPlanet?.resources?.metal ?? 0) >= cost.metal ? 'text-emerald-400' : 'text-rose-400'}`}>⛏️ {fmt(cost.metal)}</span>
                  <span className={`font-medium ${(currentPlanet?.resources?.crystal ?? 0) >= cost.crystal ? 'text-emerald-400' : 'text-rose-400'}`}>💎 {fmt(cost.crystal)}</span>
                  {cost.deuterium > 0 && (
                    <span className={`font-medium ${(currentPlanet?.resources?.deuterium ?? 0) >= cost.deuterium ? 'text-emerald-400' : 'text-rose-400'}`}>⚗️ {fmt(cost.deuterium)}</span>
                  )}
                </div>
              </div>

              <button
                disabled={!meets || maxReached || !affordable}
                onClick={() => dispatch({ type: 'BUILD_MOON_BUILDING', buildingId: id })}
                className={`w-full py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                  maxReached ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                  !meets ? 'bg-red-950/30 border border-red-500/30 text-red-400 cursor-not-allowed' :
                  !affordable ? 'bg-slate-900 border border-white/10 text-slate-500 cursor-not-allowed' :
                  'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                }`}
              >
                {maxReached ? 'Máximo alcanzado' : !meets ? 'Requisitos no cumplidos' : !affordable ? 'Recursos insuficientes' : 'Ampliación'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Sensor Phalanx y Salto Cuántico Holográfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sensor Phalanx */}
        <div className="p-5 rounded-3xl bg-[#090d1f]/90 border border-cyan-500/30 space-y-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <h3 className="text-sm font-black text-white uppercase flex items-center gap-2 font-mono">
              <span className="text-xl">📡</span>
              <span>Sensor Phalanx (Radar de Espacio Profundo)</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
              Orbital
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            Rastrea en tiempo real vectores de incursión y movimientos de flotas en sistemas estelares coordinados.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 bg-[#05070f] border border-white/15 rounded-xl px-3 py-1.5 font-mono text-xs">
              <span className="text-slate-400">Gal:</span>
              <input
                type="number"
                value={scanGalaxy}
                onChange={e => setScanGalaxy(e.target.value)}
                className="bg-transparent text-cyan-300 w-12 text-center focus:outline-none font-bold"
                placeholder="1"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-[#05070f] border border-white/15 rounded-xl px-3 py-1.5 font-mono text-xs">
              <span className="text-slate-400">Sis:</span>
              <input
                type="number"
                value={scanSystem}
                onChange={e => setScanSystem(e.target.value)}
                className="bg-transparent text-cyan-300 w-16 text-center focus:outline-none font-bold"
                placeholder="100"
              />
            </div>
            <button
              onClick={handleScan}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-black uppercase transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              📡 Escanear Coordenadas
            </button>
          </div>
          {scanResult && (
            <div className="mt-3 p-3.5 rounded-2xl bg-[#05070f] border border-cyan-500/20 text-xs font-mono shadow-inner">
              {scanResult.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <span>✓</span>
                  <span>Cuadrante en calma. Sin vectores hostiles ni movimientos detectados.</span>
                </div>
              ) : (
                <div className="space-y-1.5 text-amber-300">
                  <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Flotas en trayectoria detectadas:</div>
                  {scanResult.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-amber-950/20 border border-amber-500/30 p-2 rounded-xl">
                      <span>⚠️ Flota {m.type} en aproximación</span>
                      <span className="font-black text-amber-200">{m.remainingTicks} ticks</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compuerta de Salto Cuántico */}
        <div className="p-5 rounded-3xl bg-[#090d1f]/90 border border-purple-500/30 space-y-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <h3 className="text-sm font-black text-white uppercase flex items-center gap-2 font-mono">
              <span className="text-xl">🌀</span>
              <span>Compuerta de Salto Cuántico</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-500/30">
              Teletransporte Instantáneo
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            Transfiere flotas completas de forma instantánea entre lunas imperiales enlazadas sin consumo de deuterio.
          </p>
          <div className="space-y-2 pt-1">
            {state.planets.filter(p => p.id !== currentPlanet.id && p.moon).length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#05070f]/70 border border-white/5 text-slate-500 text-xs font-mono text-center">
                No hay otras lunas imperiales activas con compuerta de salto construida.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {state.planets.filter(p => p.id !== currentPlanet.id && p.moon).map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleJump(p.id, 'all')}
                    className="p-3 rounded-2xl bg-[#05070f] border border-purple-500/40 hover:border-purple-400 hover:bg-purple-950/30 text-left transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                        🌑 {p.moon?.name || `Luna de ${p.name}`}
                      </span>
                      <span className="text-purple-400 font-bold text-xs">➔</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Colonia: <span className="text-cyan-300 font-bold">{p.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoonPage;
