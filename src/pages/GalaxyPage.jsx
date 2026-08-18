import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getVirginPlanet, getPOIAtCoordinates } from '../core.jsx';

const getPlanetStyle = (planet) => {
  const biome = planet?.biome || 'barren';
  const idStr = String(planet?.id || `${planet?.galaxy}-${planet?.system}-${planet?.position}`);
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const angle = hash % 360;
  const sizeVar = 90 + (hash % 15); // 90% to 105%
  const ring = (hash % 8) === 0; // 12.5% chance of rings

  let gradient = '';
  let atmosphereColor = '';
  switch (biome) {
    case 'temperate':
      gradient = `linear-gradient(${angle}deg, #15803d, #2563eb, #0284c7)`;
      atmosphereColor = 'rgba(34, 211, 238, 0.4)';
      break;
    case 'volcanic':
      gradient = `linear-gradient(${angle}deg, #7f1d1d, #ea580c, #b45309)`;
      atmosphereColor = 'rgba(239, 68, 68, 0.4)';
      break;
    case 'frozen':
      gradient = `linear-gradient(${angle}deg, #bae6fd, #0ea5e9, #0369a1)`;
      atmosphereColor = 'rgba(56, 189, 248, 0.4)';
      break;
    case 'desert':
      gradient = `linear-gradient(${angle}deg, #fef08a, #ca8a04, #854d0e)`;
      atmosphereColor = 'rgba(234, 179, 8, 0.3)';
      break;
    case 'oceanic':
      gradient = `linear-gradient(${angle}deg, #1e3a8a, #0284c7, #0d9488)`;
      atmosphereColor = 'rgba(14, 165, 233, 0.4)';
      break;
    case 'tundra':
      gradient = `linear-gradient(${angle}deg, #475569, #94a3b8, #64748b)`;
      atmosphereColor = 'rgba(148, 163, 184, 0.3)';
      break;
    case 'toxic':
      gradient = `linear-gradient(${angle}deg, #581c87, #15803d, #a3e635)`;
      atmosphereColor = 'rgba(168, 85, 247, 0.4)';
      break;
    case 'exotic':
      gradient = `linear-gradient(${angle}deg, #db2777, #4f46e5, #0891b2)`;
      atmosphereColor = 'rgba(236, 72, 153, 0.4)';
      break;
    case 'barren':
    default:
      gradient = `linear-gradient(${angle}deg, #334155, #64748b, #1e293b)`;
      atmosphereColor = 'rgba(100, 116, 139, 0.3)';
      break;
  }

  return { gradient, atmosphereColor, sizeVar, ring, angle };
};

const PlanetIcon = ({ planet }) => {
  const { gradient, atmosphereColor, sizeVar, ring, angle } = getPlanetStyle(planet);
  return (
    <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
      {/* Atmosphere Glow */}
      <div 
        className="absolute rounded-full" 
        style={{
          width: `${sizeVar}%`,
          height: `${sizeVar}%`,
          boxShadow: `0 0 10px 2px ${atmosphereColor}`,
          opacity: 0.8
        }}
      />
      {/* Planet Body */}
      <div 
        className="absolute rounded-full shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.8)]" 
        style={{
          width: `${sizeVar}%`,
          height: `${sizeVar}%`,
          background: gradient,
        }}
      />
      {/* Rings */}
      {ring && (
        <div 
          className="absolute border border-white/20 rounded-full pointer-events-none" 
          style={{
            width: '130%',
            height: '30%',
            transform: `rotate(${(angle % 40) - 20}deg)`,
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.15)'
          }}
        />
      )}
    </div>
  );
};


const SYS_MAX = { 1: 500, 2: 389, 3: 389, 4: 389, 5: 389, 6: 389, 7: 389, 8: 389, 9: 389, 10: 389 };
const GALS = [1,2,3,4,5,6,7,8,9,10];

const GalaxyPage = ({ state, dispatch, currentPlanet, setSelectedTarget, setActiveTab, S, fmt, fmtTime }) => {
  const [galaxy, setGalaxy] = useState(currentPlanet.galaxy);
  const [system, setSystem] = useState(currentPlanet.system);
  const [hoveredPos, setHoveredPos] = useState(null);

  const positions = useMemo(() => Array.from({ length: 15 }, (_, i) => i + 1), []);
  const sysMax = useMemo(() => SYS_MAX[galaxy] || 499, [galaxy]);
  const myPlanets = useMemo(() => state.planets.filter(p => p.galaxy === galaxy && p.system === system), [state.planets, galaxy, system]);
  const aiInSystem = useMemo(() => state.aiPlanets.filter(p => p.galaxy === galaxy && p.system === system), [state.aiPlanets, galaxy, system]);

  // Fleet missions involving this system
  const missionsHere = useMemo(() => (state.fleetMissions || []).filter(m => {
    if (m.isAI) return false;
    return (m.to.galaxy === galaxy && m.to.system === system) ||
           (m.from.galaxy === galaxy && m.from.system === system);
  }), [state.fleetMissions, galaxy, system]);

  const selectTarget = useCallback((pos, occupied, isAI) => {
    setSelectedTarget({ galaxy, system, position: pos, occupied, isAI });
    setActiveTab('fleet');
  }, [galaxy, system, setSelectedTarget, setActiveTab]);

  const quickSpy = useCallback((pos, ai) => {
    if (!currentPlanet.fleet.espionageProbe) return;
    dispatch({ type: 'SEND_FLEET', fromId: currentPlanet.id, to: { galaxy, system, position: pos }, fleet: { espionageProbe: Math.min(5, currentPlanet.fleet.espionageProbe) }, missionType: 'espionage', missionSpeed: 10 });
  }, [currentPlanet, dispatch, galaxy, system]);

  const quickAttack = useCallback((pos, ai) => {
    setSelectedTarget({ galaxy, system, position: pos, occupied: true, isAI: true });
    setActiveTab('fleet');
  }, [galaxy, system, setSelectedTarget, setActiveTab]);

  // Galaxy-level summary (exclude virgin planets from AI count)
  const gSum = useCallback((g) => {
    const myG = state.planets.filter(p => p.galaxy === g);
    const aiG = state.aiPlanets.filter(p => p.galaxy === g && !p.isVirgin);
    return { my: myG.length, ai: aiG.length, systems: Math.max(...myG.map(p => p.system), ...aiG.map(p => p.system), 0) };
  }, [state.planets, state.aiPlanets]);

  return (
    <div className="space-y-4">
      {/* Galaxy selector with mini-map */}
      <div className={S.card}>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Galaxia</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setGalaxy(g => Math.max(1, g - 1))} className={S.btnGhost + ' ' + S.btn}>←</button>
              <span className="font-mono text-cyan-400 text-xl w-16 text-center">{galaxy}</span>
              <button onClick={() => setGalaxy(g => Math.min(10, g + 1))} className={S.btnGhost + ' ' + S.btn}>→</button>
            </div>
            <div className="flex gap-1 mt-2">
              {GALS.map(g => (
                <button key={g} onClick={() => setGalaxy(g)}
                  className={`w-6 h-6 text-[10px] rounded ${g === galaxy ? 'glass border border-[var(--ue-accent)]/40 text-[var(--ue-accent)] emissive-cyan fresnel specular' : 'glass-deep border-white/10 text-slate-400 hover:text-slate-200 fresnel specular'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Sistema Solar</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setSystem(s => Math.max(1, s - 10))} className={S.btnGhost + ' ' + S.btn}>⟪</button>
              <button onClick={() => setSystem(s => Math.max(1, s - 1))} className={S.btnGhost + ' ' + S.btn}>←</button>
              <span className="font-mono text-cyan-400 text-xl w-20 text-center">{system}</span>
              <button onClick={() => setSystem(s => Math.min(sysMax, s + 1))} className={S.btnGhost + ' ' + S.btn}>→</button>
              <button onClick={() => setSystem(s => Math.min(sysMax, s + 10))} className={S.btnGhost + ' ' + S.btn}>⟫</button>
            </div>
            <div className="flex gap-1 mt-2">
              <input type="number" min={1} max={sysMax} value={system}
                onChange={e => setSystem(Math.max(1, Math.min(sysMax, parseInt(e.target.value) || 1)))}
                className={S.input + ' w-20 text-xs py-1 text-center text-[var(--ue-accent)] font-mono'} />
            </div>
          </div>
          <div className="text-xs text-slate-500 ml-auto text-right">
            <div>🏠 {gSum(galaxy).my} colonias</div>
            <div>👾 {gSum(galaxy).ai} planetas IA</div>
          </div>
        </div>

        {/* Active missions in this system */}
        {missionsHere.length > 0 && (
          <div className="mb-3 p-2 glass-deep rounded-xl border border-[var(--ue-accent)]/20 fresnel specular emissive-cyan">
            <div className="text-[11px] text-cyan-400 font-semibold mb-1">🛸 Flotas en este sistema</div>
            {missionsHere.map(m => {
              const remaining = Math.max(0, ((m.returning ? m.returnTime : m.arrivalTime) - Date.now()) / 1000);
              const ships = Object.values(m.fleet).reduce((a, b) => a + b, 0);
              return <div key={m.id} className="text-[10px] text-slate-400 flex justify-between">
                <span>{m.returning ? '↩' : '↪'} {m.type} • {ships} naves</span>
                <span className="text-cyan-400">{fmtTime(remaining)}</span>
              </div>;
            })}
          </div>
        )}

        {/* Planet positions */}
        <div className="space-y-1">
          {positions.map(pos => {
            const my = myPlanets.find(p => p.position === pos);
            const ai = aiInSystem.find(p => p.position === pos);
            const virgin = (!my && !ai) ? getVirginPlanet(galaxy, system, pos) : null;
            const poi = getPOIAtCoordinates(galaxy, system, pos);
            const hasMissions = missionsHere.some(m => m.to.position === pos || m.from.position === pos);
            return (
              <motion.div
                key={pos}
                onClick={() => {
                  if (my) { dispatch({ type: 'SET_PLANET', payload: my.id }); return; }
                  if (ai) { selectTarget(pos, true, true); return; }
                  if (virgin) { selectTarget(pos, false, true); return; }
                  if (poi) { selectTarget(pos, false, false); return; }
                  selectTarget(pos, false, false);
                }}
                whileHover={{ scale: 1.01 }}
                onMouseEnter={() => setHoveredPos(pos)}
                onMouseLeave={() => setHoveredPos(null)}
                className={`p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                  my ? 'glass-deep border border-[var(--ue-accent)]/30 fresnel specular emissive-cyan' :
                  ai ? 'bg-red-500/10 border border-red-500/30' :
                  virgin ? 'bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40' :
                  poi ? 'bg-purple-500/10 border border-purple-500/30 hover:border-purple-500/55' :
                  'glass-deep border border-white/10 hover:border-[var(--ue-accent)]/30 fresnel specular'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="font-mono text-sm text-slate-400 w-8">{pos}</div>
                  {my ? (
                    <>
                      <PlanetIcon planet={my} />
                      <div className="flex-1">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          <span>{my.name}</span>
                          {poi && <span className="text-[10px] glass-deep text-[var(--ue-accent)] px-1 py-0.5 rounded border border-[var(--ue-accent)]/30 holo-text fresnel specular font-normal">{poi.icon} {poi.name}</span>}
                        </div>
                        <div className="text-[11px] text-slate-405">Tu planeta</div>
                        {hoveredPos === pos && (
                          <div className="mt-1 flex gap-3 text-[10px] text-slate-500">
                            <span className="text-amber-400">⛏️{fmt(my.resources?.metal || 0)}</span>
                            <span className="text-cyan-400">💎{fmt(my.resources?.crystal || 0)}</span>
                            <span className="text-emerald-400">⚗️{fmt(my.resources?.deuterium || 0)}</span>
                            <span>🚀{Object.values(my.fleet || {}).reduce((a, b) => a + b, 0)}</span>
                            <span>🛡️{Object.values(my.defenses || {}).reduce((a, b) => a + b, 0)}</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : ai ? (
                    <>
                      <PlanetIcon planet={ai} />
                      <div className="flex-1">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          <span>{ai.name}</span>
                          {poi && <span className="text-[10px] bg-purple-900/60 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30 font-normal">{poi.icon} {poi.name}</span>}
                        </div>
                        <div className="text-[11px] text-slate-400">IA Nv{ai.aiLevel} • {ai.temperature}°C</div>
                        {hoveredPos === pos && (
                          <div className="mt-1 flex gap-3 text-[10px] text-slate-500">
                            <span className="text-amber-400">⛏️{fmt(ai.resources?.metal || 0)}</span>
                            <span className="text-cyan-400">💎{fmt(ai.resources?.crystal || 0)}</span>
                            <span className="text-emerald-400">⚗️{fmt(ai.resources?.deuterium || 0)}</span>
                            <span>🚀{Object.values(ai.fleet || {}).reduce((a, b) => a + b, 0)}</span>
                            <span>🛡️{Object.values(ai.defenses || {}).reduce((a, b) => a + b, 0)}</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : virgin ? (
                    <>
                      <PlanetIcon planet={virgin} />
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-emerald-300 flex items-center gap-2">
                          <span>Planeta Virgen</span>
                          {poi && <span className="text-[10px] bg-cyan-900/60 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30 font-normal">{poi.icon} {poi.name}</span>}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {virgin.biome} • {virgin.planetSize}km • {virgin.temperature}°C • {fmt(virgin.gravity)}g
                          {virgin.trait ? ` • ✨ ${virgin.trait}` : ''}
                        </div>
                        {poi && <div className="text-[10px] text-cyan-400/80 mt-1 font-mono">{poi.desc}</div>}
                        {hoveredPos === pos && (
                          <div className="mt-1 text-[10px] text-emerald-400">🌱 Envía un Colonizador para reclamarlo</div>
                        )}
                      </div>
                    </>
                  ) : poi ? (
                    <>
                      <div className="text-2xl">{poi.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-[var(--ue-accent)] holo-text flex items-center gap-2 emissive-cyan">
                          <span>{poi.name}</span>
                          <span className="text-[9px] bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">Anomalía</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{poi.desc}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl opacity-30">·</div>
                      <div className="text-slate-500 text-sm">Espacio vacío</div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {hasMissions && <span className="text-[10px] text-cyan-400">🛸</span>}
                  {ai && (
                    <>
                      {(currentPlanet.fleet.espionageProbe || 0) > 0 && (
                        <button onClick={e => { e.stopPropagation(); quickSpy(pos, ai); }}
                          className="text-[11px] px-1.5 py-0.5 rounded glass border border-[var(--ue-accent)]/30 hover:border-[var(--ue-accent)]/50 text-[var(--ue-accent)] emissive-cyan fresnel specular">👁️</button>
                      )}
                      <button onClick={e => { e.stopPropagation(); quickAttack(pos, ai); }}
                        className="text-[11px] px-1.5 py-0.5 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300">⚔️</button>
                    </>
                  )}
                  {virgin && (
                    <span className="text-[10px] text-emerald-400">🌱 Colonizable</span>
                  )}
                  {poi && !my && !ai && !virgin && (
                    <span className="text-[10px] text-purple-400 font-medium">✨ Investigar</span>
                  )}
                  {!my && !ai && !virgin && !poi && <span className="text-[10px] text-slate-500">🌌</span>}
                  {my && <span className="text-[11px] text-slate-500">→</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Nearby systems quick nav */}
      <div className={S.card}>
        <h3 className="text-sm font-semibold mb-2">🗺️ Sistemas cercanos</h3>
        <div className="grid grid-cols-5 gap-1">
          {[system-2, system-1, system, system+1, system+2].filter(s => s >= 1 && s <= sysMax).map(s => {
            const myS = state.planets.filter(p => p.galaxy === galaxy && p.system === s);
            const aiS = state.aiPlanets.filter(p => p.galaxy === galaxy && p.system === s);
            return (
              <button key={s} onClick={() => setSystem(s)}
                className={`text-[10px] p-1 rounded border ${s === system ? 'glass border border-[var(--ue-accent)]/40 text-[var(--ue-accent)] emissive-cyan fresnel specular' : 'glass-deep border-white/10 text-slate-400 hover:border-[var(--ue-accent)]/20 fresnel specular'}`}>
                {s}
                <div className="flex gap-0.5 justify-center">
                  {myS.length > 0 && <span className="text-cyan-400">{'🏠'.repeat(myS.length)}</span>}
                  {aiS.length > 0 && <span className="text-red-400">{'👾'.repeat(Math.min(aiS.length, 3))}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global debris */}
      {(state.debrisField?.metal > 0 || state.debrisField?.crystal > 0) && (
        <div className={S.card}>
          <h3 className="font-semibold mb-2">♻️ Campo de Escombros</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-amber-400">⛏️ {fmt(state.debrisField.metal)}</span>
            <span className="text-cyan-400">💎 {fmt(state.debrisField.crystal)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalaxyPage;
