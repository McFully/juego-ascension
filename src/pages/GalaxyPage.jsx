import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getVirginPlanet } from '../core.jsx';
import { getPOIAtCoordinates } from '../utils/formulas/coordinatesFormulas.js';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';
import { GalaxyNavConsole } from '../components/galaxy/GalaxyNavConsole.jsx';
import { DebrisFieldVisualization } from '../components/galaxy/DebrisFieldVisualization.jsx';
import { transitionToCosmicSilence } from '../audio.js';

const getPlanetStyle = (planet) => {
  const biome = planet?.biome || 'barren';
  const idStr = String(planet?.id || `${planet?.galaxy}-${planet?.system}-${planet?.position}`);
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const angle = hash % 360;
  const sizeVar = 90 + (hash % 15);
  const ring = (hash % 8) === 0;

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
      <div 
        className="absolute rounded-full" 
        style={{
          width: `${sizeVar}%`,
          height: `${sizeVar}%`,
          boxShadow: `0 0 10px 2px ${atmosphereColor}`,
          opacity: 0.8
        }}
      />
      <div 
        className="absolute rounded-full shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.8)]" 
        style={{
          width: `${sizeVar}%`,
          height: `${sizeVar}%`,
          background: gradient,
        }}
      />
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

export const GalaxyPage = ({
  state,
  dispatch,
  currentPlanet,
  production,
  setSelectedTarget,
  setActiveTab,
  S,
  fmt,
  fmtTime
}) => {
  const { navigateTo, navigateBack } = useNavigation();
  const [galaxy, setGalaxy] = useState(currentPlanet.galaxy);
  const [system, setSystem] = useState(currentPlanet.system);
  const [hoveredPos, setHoveredPos] = useState(null);

  // Silencio cósmico profundo en el mapa estelar galáctico
  useEffect(() => {
    transitionToCosmicSilence(true);
    return () => transitionToCosmicSilence(false);
  }, []);

  const positions = useMemo(() => Array.from({ length: 15 }, (_, i) => i + 1), []);
  const sysMax = useMemo(() => SYS_MAX[galaxy] || 499, [galaxy]);
  const myPlanets = useMemo(() => state.planets.filter(p => p.galaxy === galaxy && p.system === system), [state.planets, galaxy, system]);
  const aiInSystem = useMemo(() => state.aiPlanets.filter(p => p.galaxy === galaxy && p.system === system), [state.aiPlanets, galaxy, system]);

  const missionsHere = useMemo(() => (state.fleetMissions || []).filter(m => {
    if (m.isAI) return false;
    return (m.to.galaxy === galaxy && m.to.system === system) ||
           (m.from.galaxy === galaxy && m.from.system === system);
  }), [state.fleetMissions, galaxy, system]);

  const selectTarget = useCallback((pos, occupied, isAI) => {
    if (window.playSfx) window.playSfx('click');
    setSelectedTarget({ galaxy, system, position: pos, occupied, isAI });
    setActiveTab('fleet');
  }, [galaxy, system, setSelectedTarget, setActiveTab]);

  const quickSpy = useCallback((pos, ai) => {
    if (window.playSfx) window.playSfx('click');
    if (!currentPlanet.fleet?.espionageProbe) return;
    dispatch({
      type: 'SEND_FLEET',
      fromId: currentPlanet.id,
      to: { galaxy, system, position: pos },
      fleet: { espionageProbe: Math.min(5, currentPlanet.fleet.espionageProbe) },
      missionType: 'espionage',
      missionSpeed: 10
    });
  }, [currentPlanet, dispatch, galaxy, system]);

  const quickAttack = useCallback((pos, ai) => {
    if (window.playSfx) window.playSfx('click');
    setSelectedTarget({ galaxy, system, position: pos, occupied: true, isAI: true });
    setActiveTab('fleet');
  }, [galaxy, system, setSelectedTarget, setActiveTab]);

  const gSum = useCallback((g) => {
    const myG = state.planets.filter(p => p.galaxy === g);
    const aiG = state.aiPlanets.filter(p => p.galaxy === g && !p.isVirgin);
    return { my: myG.length, ai: aiG.length, systems: Math.max(...myG.map(p => p.system), ...aiG.map(p => p.system), 0) };
  }, [state.planets, state.aiPlanets]);

  return (
    <div className="space-y-4 view-enter">
      {/* DOM Superior Estandarizado con VOLVER A ALTO MANDO */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle={`Navegación y Galaxia · [${galaxy}:${system}]`}
        breadcrumbIcon="🌌"
        showBackToAltoMando={true}
        onBackToAltoMando={() => {
          if (navigateBack) navigateBack();
          else if (navigateTo) navigateTo('government');
          else if (setActiveTab) setActiveTab('government');
        }}
        rightSlot={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
            <span className="text-slate-400">Tránsito local:</span>
            <span className="font-bold text-cyan-300">{missionsHere.length} Flotas</span>
          </div>
        }
      />

      {/* Consola de Navegación Estelar */}
      <GalaxyNavConsole
        state={state}
        galaxy={galaxy}
        setGalaxy={setGalaxy}
        system={system}
        setSystem={setSystem}
        sysMax={sysMax}
        gSum={gSum}
        currentPlanet={currentPlanet}
        onGoToCurrentPlanet={() => {
          setGalaxy(currentPlanet.galaxy);
          setSystem(currentPlanet.system);
        }}
        navigateTo={navigateTo}
        setActiveTab={setActiveTab}
        S={S}
      />

      {/* Flotas en Tránsito en este Sistema */}
      {missionsHere.length > 0 && (
        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col gap-1.5 font-mono">
          <div className="text-xs text-cyan-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Tránsito de Flotas en el Sistema [{galaxy}:{system}]:</span>
          </div>
          {missionsHere.map(m => {
            const remaining = Math.max(0, ((m.returning ? m.returnTime : m.arrivalTime) - Date.now()) / 1000);
            const ships = Object.values(m.fleet || {}).reduce((a, b) => a + b, 0);
            return (
              <div key={m.id} className="text-[11px] text-slate-300 flex justify-between bg-black/30 p-2 rounded-lg border border-white/5">
                <span>{m.returning ? '↩ Retorno' : '↪ Despliegue'} {m.type} • {ships} naves</span>
                <span className="text-cyan-400 font-bold">⏱ {fmtTime ? fmtTime(remaining) : Math.round(remaining) + 's'}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Visualización Dinámica de Campo de Escombros si existen residuos */}
      {((state.debrisField?.metal || 0) > 0 || (state.debrisField?.crystal || 0) > 0) && (
        <DebrisFieldVisualization
          metal={state.debrisField?.metal || 0}
          crystal={state.debrisField?.crystal || 0}
          fmt={fmt}
          hasRecycler={(currentPlanet.fleet?.recycler || 0) > 0}
          onRecycleClick={() => {
            selectTarget(1, false, false);
            if (navigateTo) navigateTo('fleet');
            else if (setActiveTab) setActiveTab('fleet');
          }}
        />
      )}

      {/* Rejilla Orbital Original de 15 Posiciones */}
      <div className="bg-[#0a0d1a]/85 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2 px-1">
          Órbitas Planetarias del Sistema [{galaxy}:{system}]
        </div>

        <div className="space-y-1.5 tile-stagger">
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
                  if (my) {
                    // Si es el planeta donde estamos actualmente, cambiar/permanecer activo
                    if (my.id === currentPlanet.id) {
                      dispatch({ type: 'SET_PLANET', payload: my.id });
                      return;
                    }
                    // Si es otra colonia propia, seleccionarla como destino táctico de transporte
                    selectTarget(pos, true, false);
                    return;
                  }
                  if (ai) { selectTarget(pos, true, true); return; }
                  if (virgin) { selectTarget(pos, false, true); return; }
                  if (poi) { selectTarget(pos, false, false); return; }
                  selectTarget(pos, false, false);
                }}
                whileHover={{ scale: 1.008 }}
                onMouseEnter={() => setHoveredPos(pos)}
                onMouseLeave={() => setHoveredPos(null)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${
                  my ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]' :
                  ai ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50' :
                  virgin ? 'bg-emerald-950/15 border-emerald-500/30 hover:border-emerald-500/50' :
                  poi ? 'bg-purple-950/20 border-purple-500/30 hover:border-purple-500/60' :
                  'bg-[#05070f]/50 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="font-mono font-bold text-xs text-slate-500 w-6 text-center">{pos}</div>

                  {my ? (
                    <>
                      <PlanetIcon planet={my} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-cyan-300 flex items-center gap-2 truncate">
                          <span>{my.name}</span>
                          <span className="text-[9px] font-mono uppercase bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">Tu Colonia</span>
                          {(() => {
                            const plPatrol = (state.patrols || []).find(p => p.planetId === my.id && p.status === 'active');
                            const sysPatrol = (state.patrols || []).find(p => p.galaxy === galaxy && p.system === system && p.status === 'active' && p.patrolType === 'system');
                            if (plPatrol) {
                              return (
                                <span className="text-[9px] font-mono uppercase bg-cyan-950/80 text-cyan-200 px-1.5 py-0.5 rounded border border-cyan-400/60 flex items-center gap-1 shadow-sm">
                                  <span>🛡️</span> Órbita Custodiada
                                </span>
                              );
                            }
                            if (sysPatrol) {
                              return (
                                <span className="text-[9px] font-mono uppercase bg-blue-950/80 text-blue-200 px-1.5 py-0.5 rounded border border-blue-400/60 flex items-center gap-1 shadow-sm">
                                  <span>🚨</span> Policía de Sistema
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Bioma {my.biome} • {my.temperature}°C</div>
                      </div>
                    </>
                  ) : ai ? (
                    <>
                      <PlanetIcon planet={ai} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-red-300 flex items-center gap-2 truncate">
                          <span>{ai.name}</span>
                          <span className="text-[9px] font-mono uppercase bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">Imperio IA</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Nivel {ai.aiLevel} • {ai.temperature}°C</div>
                      </div>
                    </>
                  ) : virgin ? (
                    <>
                      <PlanetIcon planet={virgin} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-emerald-300 flex items-center gap-2 truncate">
                          <span>Mundo Virgen Reclamable</span>
                          <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">Colonizable</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{virgin.biome} • {virgin.planetSize}km • {virgin.temperature}°C</div>
                      </div>
                    </>
                  ) : poi ? (
                    <>
                      <div className="text-2xl">{poi.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-purple-300 flex items-center gap-2 truncate">
                          <span>{poi.name}</span>
                          <span className="text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">Anomalía</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{poi.desc}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-slate-600 font-mono text-xl w-8 text-center">·</div>
                      <div className="text-slate-500 text-xs font-mono">Espacio Profundo Desocupado</div>
                    </>
                  )}
                </div>

                {/* Acciones contextuales */}
                <div className="flex items-center gap-2">
                  {hasMissions && <span className="text-xs text-cyan-400 animate-pulse" title="Misión en ruta">🛸</span>}
                  {ai && (
                    <div className="flex gap-1">
                      {(currentPlanet.fleet?.espionageProbe || 0) > 0 && (
                        <button
                          onClick={e => { e.stopPropagation(); quickSpy(pos, ai); }}
                          className="px-2 py-1 text-xs rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 focus-ring-game"
                          title="Lanzar sondas de espionaje"
                        >
                          👁️ Espiar
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); quickAttack(pos, ai); }}
                        className="px-2 py-1 text-xs rounded-lg bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 focus-ring-game font-bold"
                        title="Enviar flota de asalto"
                      >
                        ⚔️ Atacar
                      </button>
                    </div>
                  )}
                  {virgin && (
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/25">
                      🌱 Reclamar
                    </span>
                  )}
                  {my && (
                    <div className="flex gap-1.5 items-center">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          selectTarget(pos, true, false);
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 focus-ring-game font-bold flex items-center gap-1 shadow-sm"
                        title="Enviar recursos o flotas a esta colonia"
                      >
                        📦 Enviar Flota
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          dispatch({ type: 'SET_PLANET', payload: my.id });
                        }}
                        className="px-2 py-1 text-xs rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white focus-ring-game font-mono"
                        title="Gestionar esta colonia (cambiar planeta activo)"
                      >
                        {my.id === currentPlanet.id ? '📍 Activo' : '🔎 Ver'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GalaxyPage;
