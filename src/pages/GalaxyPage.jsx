import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getVirginPlanet, getSystemProfile } from '../core.jsx';
import { getPOIAtCoordinates } from '../utils/formulas/coordinatesFormulas.js';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';
import { GalaxyNavConsole } from '../components/galaxy/GalaxyNavConsole.jsx';
import { DebrisFieldVisualization } from '../components/galaxy/DebrisFieldVisualization.jsx';
import { transitionToCosmicSilence } from '../audio.js';
import { getMaxPlanets, getUsedColonySlots, getKnownGalaxies, getMaxKnownSystem } from '../utils/formulas.js';
import { ForeignEmbassyModal } from '../components/diplomacy/ForeignEmbassyModal.jsx';

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
  fmtTime,
  mode = 'imperial' // 'imperial' (Cartografía Federal) | 'local' (Exploración Local)
}) => {
  const { navigateTo, navigateBack } = useNavigation();
  const [galaxy, setGalaxy] = useState(currentPlanet.galaxy);
  const [system, setSystem] = useState(currentPlanet.system);
  const [hoveredPos, setHoveredPos] = useState(null);
  const [launchPlanetId, setLaunchPlanetId] = useState(currentPlanet.id);
  const [selectedOrbitPos, setSelectedOrbitPos] = useState(null);
  const [embassyAIModal, setEmbassyAIModal] = useState(null);

  // Escaneo local en memoria para disipar la niebla durante la sesión
  const [revealedOrbits, setRevealedOrbits] = useState(() => new Set());

  // Horizonte dinámico de exploración (sin spoilers)
  const knownGalaxies = useMemo(() => getKnownGalaxies(state), [state]);
  const maxKnownSystem = useMemo(() => getMaxKnownSystem(state, galaxy), [state, galaxy]);

  // Si la galaxia o sistema actual sobrepasa el horizonte desbloqueado, normalizar
  useEffect(() => {
    if (!knownGalaxies.includes(galaxy)) {
      setGalaxy(knownGalaxies[0] || 1);
    }
  }, [knownGalaxies, galaxy]);

  useEffect(() => {
    if (system > maxKnownSystem) {
      setSystem(maxKnownSystem);
    }
  }, [maxKnownSystem, system]);

  // Perfil determinista del sistema solar
  const systemProfile = useMemo(() => getSystemProfile(galaxy, system), [galaxy, system]);

  // Asegurar que launchPlanet exista o sea currentPlanet
  const launchPlanet = useMemo(() => {
    return state.planets.find(p => p.id === launchPlanetId) || currentPlanet;
  }, [state.planets, launchPlanetId, currentPlanet]);

  // Sondas de reconocimiento y espionaje disponibles en la base de lanzamiento
  const availableProbes = useMemo(() => {
    const f = launchPlanet?.fleet || {};
    return (f.orbitalProbe || 0) + (f.systemProbe || 0) + (f.espionageProbe || 0) + (f.deepSpaceProbe || 0);
  }, [launchPlanet?.fleet]);

  // Silencio cósmico profundo en el mapa estelar galáctico
  useEffect(() => {
    transitionToCosmicSilence(true);
    return () => transitionToCosmicSilence(false);
  }, []);

  const positions = useMemo(() => Array.from({ length: 15 }, (_, i) => i + 1), []);
  const myPlanets = useMemo(() => state.planets.filter(p => p.galaxy === galaxy && p.system === system), [state.planets, galaxy, system]);
  const aiInSystem = useMemo(() => state.aiPlanets.filter(p => p.galaxy === galaxy && p.system === system), [state.aiPlanets, galaxy, system]);

  const missionsHere = useMemo(() => (state.fleetMissions || []).filter(m => {
    if (m.isAI) return false;
    return (m.to.galaxy === galaxy && m.to.system === system) ||
           (m.from.galaxy === galaxy && m.from.system === system);
  }), [state.fleetMissions, galaxy, system]);

  // Diccionario de traducción al español de biomas espaciales
  const BIOME_ES = {
    temperate: 'Templado',
    volcanic: 'Volcánico',
    frozen: 'Helado',
    desert: 'Desértico',
    oceanic: 'Oceánico',
    tundra: 'Tundra',
    toxic: 'Tóxico',
    exotic: 'Exótico',
    barren: 'Estéril'
  };

  // Comprobar si una órbita está revelada
  const isOrbitRevealed = useCallback((pos) => {
    // Si tenemos una colonia o planeta propio exactamente en esa posición orbital
    if (myPlanets.some(p => p.position === pos)) return true;
    // Si ha sido escaneado por sonda o sensor con éxito persistido o revelado
    const orbitKey = `${galaxy}:${system}:${pos}`;
    if (revealedOrbits.has(orbitKey)) return true;
    // Si ya existe informe de inteligencia de un planeta en esas coordenadas
    if (state.planetIntel) {
      const hasIntel = Object.values(state.planetIntel).some(
        intel => intel.coords?.galaxy === galaxy && intel.coords?.system === system && intel.coords?.position === pos
      );
      if (hasIntel) return true;
    }
    return false;
  }, [myPlanets, galaxy, system, revealedOrbits, state.planetIntel]);

  // Lanzamiento de sonda para explorar órbita y disipar niebla
  const launchProbeToOrbit = useCallback((pos) => {
    if (window.playSfx) window.playSfx('click');
    const fleet = launchPlanet.fleet || {};
    let probeType = null;
    if ((fleet.orbitalProbe || 0) > 0) probeType = 'orbitalProbe';
    else if ((fleet.systemProbe || 0) > 0) probeType = 'systemProbe';
    else if ((fleet.espionageProbe || 0) > 0) probeType = 'espionageProbe';
    else if ((fleet.deepSpaceProbe || 0) > 0) probeType = 'deepSpaceProbe';

    if (!probeType) {
      if (window.playSfx) window.playSfx('error');
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'warning',
          message: `🛰️ No dispones de sondas de reconocimiento (Sonda Suborbital, Sistema, Espionaje o Espacio Profundo) en ${launchPlanet.name} para explorar la órbita.`,
          timestamp: Date.now()
        }
      });
      return;
    }

    dispatch({
      type: 'SEND_FLEET',
      fromId: launchPlanet.id,
      to: { galaxy, system, position: pos },
      fleet: { [probeType]: 1 },
      missionType: 'espionage',
      missionSpeed: 10
    });
  }, [launchPlanet, galaxy, system, dispatch]);

  const selectTarget = useCallback((pos, occupied, isAI, targetMission = 'attack') => {
    if (window.playSfx) window.playSfx('click');
    // Si se eligió una base de lanzamiento diferente, sincronizar el planeta activo para el despacho
    if (launchPlanet.id !== currentPlanet.id) {
      dispatch({ type: 'SET_PLANET', payload: launchPlanet.id });
    }
    setSelectedTarget({ galaxy, system, position: pos, occupied, isAI, mission: targetMission });
    setActiveTab('imperial_fleet');
  }, [galaxy, system, setSelectedTarget, setActiveTab, launchPlanet, currentPlanet, dispatch]);

  const quickSpy = useCallback((pos, ai) => {
    if (window.playSfx) window.playSfx('click');
    const fleet = launchPlanet.fleet || {};
    const probeCount = (fleet.espionageProbe || 0) + (fleet.systemProbe || 0) + (fleet.orbitalProbe || 0) + (fleet.deepSpaceProbe || 0);
    if (probeCount <= 0) {
      if (window.playSfx) window.playSfx('error');
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          type: 'warning',
          message: `🛰️ No dispones de sondas en ${launchPlanet.name} para realizar espionaje orbital.`,
          timestamp: Date.now()
        }
      });
      return;
    }

    let probeType = 'espionageProbe';
    if ((fleet.espionageProbe || 0) > 0) probeType = 'espionageProbe';
    else if ((fleet.systemProbe || 0) > 0) probeType = 'systemProbe';
    else if ((fleet.deepSpaceProbe || 0) > 0) probeType = 'deepSpaceProbe';
    else if ((fleet.orbitalProbe || 0) > 0) probeType = 'orbitalProbe';

    dispatch({
      type: 'SEND_FLEET',
      fromId: launchPlanet.id,
      to: { galaxy, system, position: pos },
      fleet: { [probeType]: Math.min(5, fleet[probeType]) },
      missionType: 'espionage',
      missionSpeed: 10
    });
  }, [launchPlanet, dispatch, galaxy, system]);

  const gSum = useCallback((g) => {
    const myG = state.planets.filter(p => p.galaxy === g);
    const aiG = state.aiPlanets.filter(p => p.galaxy === g && !p.isVirgin);
    return { my: myG.length, ai: aiG.length, systems: Math.max(...myG.map(p => p.system), ...aiG.map(p => p.system), 0) };
  }, [state.planets, state.aiPlanets]);

  // Posiciones orbitales visibles en el sistema (perfil astronómico base o posición más alta ocupada por jugador o IA)
  const systemMaxOrbits = useMemo(() => {
    const base = systemProfile?.maxOrbits || 8;
    const maxOccupied = Math.max(
      0,
      ...myPlanets.map(p => p.position || 0),
      ...aiInSystem.map(p => p.position || 0)
    );
    return Math.min(15, Math.max(base, maxOccupied));
  }, [systemProfile, myPlanets, aiInSystem]);

  // Horizonte orbital del sistema: solo se ve hasta la órbita más lejana revelada + 1 (la siguiente desconocida)
  const highestRevealedPos = useMemo(() => {
    let maxPos = 1;
    for (let p = 1; p <= systemMaxOrbits; p++) {
      if (isOrbitRevealed(p)) maxPos = Math.max(maxPos, p);
    }
    return maxPos;
  }, [isOrbitRevealed, systemMaxOrbits]);

  // Si highestRevealedPos es 1, solo se muestran la 1 (natal) y la 2 (desconocida)
  const visibleOrbitLimit = Math.min(systemMaxOrbits, highestRevealedPos + 1);
  const visiblePositions = useMemo(() => {
    return Array.from({ length: visibleOrbitLimit }, (_, i) => i + 1);
  }, [visibleOrbitLimit]);

  return (
    <div className="space-y-4 view-enter">
      {/* DOM Superior Estandarizado con VOLVER A MANDO IMPERIAL / ALTO MANDO */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle={
          mode === 'imperial'
            ? 'Cartografía'
            : `Exploración Orbital de ${currentPlanet?.name || 'Mundo'} · [${galaxy}:${system}]`
        }
        breadcrumbIcon="🌌"
        parentHub={mode === 'imperial' ? 'imperial_hub' : 'government'}
        showBackToAltoMando={true}
        backButtonLabelTop="VOLVER A"
        backButtonLabelBottom={mode === 'imperial' ? 'Mando Imperial' : 'Alto Mando'}
        backButtonIcon="👑"
        onBackToAltoMando={() => {
          const targetHub = mode === 'imperial' ? 'imperial_hub' : 'government';
          if (setActiveTab) setActiveTab(targetHub);
          else if (navigateTo) navigateTo(targetHub);
          else if (navigateBack) navigateBack();
        }}
        rightSlot={
          <div className="flex items-center gap-3 flex-wrap">
            {state.planets && state.planets.length > 1 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono">
                <span className="text-slate-400">Base de Mando:</span>
                <select
                  value={launchPlanetId}
                  onChange={(e) => setLaunchPlanetId(e.target.value)}
                  className="bg-black/80 text-cyan-300 font-bold border border-cyan-500/40 rounded px-2 py-0.5 text-xs focus:outline-none"
                >
                  {state.planets.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name} [{p.galaxy}:{p.system}:{p.position}] ({Object.values(p.fleet || {}).reduce((a, b) => a + b, 0)} naves)
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-3 text-xs font-mono bg-[#05070f]/80 border border-white/10 px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-1.5" title={`Límite del Imperio determinado por Astrofísica (Nivel ${state?.research?.astrophysics || 0})`}>
                <span className="text-cyan-400">Imperio:</span>
                <span className={`font-bold ${getUsedColonySlots(state) >= getMaxPlanets(state?.research?.astrophysics || 0) ? 'text-amber-400' : 'text-emerald-300'}`}>
                  {getUsedColonySlots(state)}/{getMaxPlanets(state?.research?.astrophysics || 0)}
                </span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-300">En Galaxia:</span>
                <span className="font-bold text-white">{gSum(galaxy).my}</span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="text-red-400">Planetas IA:</span>
                <span className="font-bold text-red-300">{gSum(galaxy).ai}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
              <span className="text-slate-400">Tránsito local:</span>
              <span className="font-bold text-cyan-300">{missionsHere.length} Flotas</span>
            </div>
          </div>
        }
      />

      {/* Layout de 2 Columnas: Izquierda (Navegación y Planetas Propios) / Derecha (Órbitas Planetarias) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Columna Izquierda */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          {/* Selectores de Galaxia y Sistema Solar */}
          <GalaxyNavConsole
            galaxy={galaxy}
            setGalaxy={setGalaxy}
            system={system}
            setSystem={setSystem}
            knownGalaxies={knownGalaxies}
            maxKnownSystem={maxKnownSystem}
          />

          {/* Tarjeta de Acceso Rápido a Planetas Propios del Imperio */}
          <div className="bg-[#0b1021]/90 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span>🪐</span>
                <span>Mundos del Imperio</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {state.planets?.length || 1} activos
              </span>
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {state.planets?.map((p) => {
                const isSelected = p.galaxy === galaxy && p.system === system;

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (window.playSfx) window.playSfx('click');
                      setGalaxy(p.galaxy);
                      setSystem(p.system);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'bg-black/40 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <PlanetIcon planet={p} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-xs truncate group-hover:text-cyan-300 transition-colors">
                            {p.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          [{p.galaxy}:{p.system}:{p.position}] · Bioma {BIOME_ES[p.biome] || p.biome || 'Estéril'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-[11px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-black/40 border border-white/5 group-hover:border-cyan-500/30">
                        {isSelected ? '● Ver' : 'Ir →'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flotas en Tránsito en este Sistema */}
          {missionsHere.length > 0 && (
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col gap-1.5 font-mono">
              <div className="text-xs text-cyan-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Tránsito de Flotas en [{galaxy}:{system}]:</span>
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
                selectTarget(1, false, false, 'recycle');
              }}
            />
          )}
        </div>

        {/* Columna Derecha: Órbita Planetaria del Sistema */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-[#0a0d1a]/85 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">☀️</span>
                <div className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                  Sistema [{galaxy}:{system}]
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  Radar Orbital Activo
                </span>
              </div>
            </div>

            <div className="space-y-2 tile-stagger">
              {visiblePositions.map(pos => {
                const my = myPlanets.find(p => p.position === pos);
                const ai = aiInSystem.find(p => p.position === pos);
                const isPlanetOrbit = systemProfile?.planetPositions?.has(pos) || !!my || !!ai;
                const isAsteroidOrbit = !isPlanetOrbit && systemProfile?.asteroidPositions?.has(pos);
                const virgin = (!my && !ai && isPlanetOrbit) ? getVirginPlanet(galaxy, system, pos) : null;
                const poi = getPOIAtCoordinates(galaxy, system, pos);
                const hasMissions = missionsHere.some(m => m.to.position === pos || m.from.position === pos);
                const revealed = isOrbitRevealed(pos);

                // Si la órbita aún no ha sido sondeada: siempre aparece como "Órbita X · Desconocido" en una sola línea
                if (!revealed) {
                  return (
                    <motion.div
                      key={pos}
                      whileHover={{ scale: 1.004 }}
                      className="p-3 rounded-xl transition-all border bg-black/60 border-white/5 flex items-center justify-between gap-3 flex-nowrap"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="font-mono font-bold text-xs text-slate-600 w-6 text-center">{pos}</div>
                        <div className="w-8 h-8 rounded-full border border-dashed border-slate-700 bg-black/50 flex items-center justify-center text-xs text-slate-600 shrink-0">
                          ❓
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-400 truncate">
                            Desconocido
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono truncate">
                            Requiere reconocimiento con sonda o expedición para cartografiar
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-auto shrink-0">
                        {hasMissions ? (
                          <span className="px-2.5 py-1 text-xs rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 font-mono flex items-center gap-1.5 animate-pulse">
                            <span>🚀</span>
                            <span>Sonda en Trayecto</span>
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              launchProbeToOrbit(pos);
                            }}
                            disabled={availableProbes <= 0}
                            className={`px-2.5 py-1 text-xs rounded-lg font-mono font-bold transition-all flex items-center gap-1.5 ${
                              availableProbes > 0
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 cursor-pointer'
                                : 'bg-slate-800/30 text-slate-500 border border-slate-700/30 cursor-not-allowed opacity-60'
                            }`}
                            title={availableProbes > 0 ? `Lanzar 1 sonda de reconocimiento desde ${launchPlanet.name} (${availableProbes} disponibles)` : `Sin sondas de reconocimiento disponibles en ${launchPlanet.name}`}
                          >
                            <span>🛰️</span>
                            <span>Explorar Órbita</span>
                            <span className="text-[10px] opacity-75 font-normal">({availableProbes})</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                }

                // Órbita revelada: todo en UNA SOLA LÍNEA HORIZONTAL (datos a la izquierda, opciones a la derecha)
                return (
                  <motion.div
                    key={pos}
                    whileHover={{ scale: 1.004 }}
                    className={`p-3 rounded-xl transition-all border flex items-center justify-between gap-3 flex-nowrap ${
                      my ? 'bg-cyan-950/20 border-cyan-500/40' :
                      ai ? 'bg-red-950/20 border-red-500/30' :
                      virgin ? 'bg-emerald-950/15 border-emerald-500/30' :
                      isAsteroidOrbit ? 'bg-amber-950/15 border-amber-500/25' :
                      poi ? 'bg-purple-950/20 border-purple-500/30' :
                      'bg-[#05070f]/50 border-white/5'
                    }`}
                  >
                    {/* Lado Izquierdo: Posición, Icono y Datos en español sin etiquetas redundantes */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="font-mono font-bold text-xs text-slate-500 w-6 text-center shrink-0">{pos}</div>

                      {my ? (
                        <>
                          <PlanetIcon planet={my} />
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-cyan-300 truncate">
                              {my.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Bioma {BIOME_ES[my.biome] || my.biome || 'Estéril'} • Temperatura {my.temperature}°C
                            </div>
                          </div>
                        </>
                      ) : ai ? (
                        <>
                          <PlanetIcon planet={ai} />
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-red-300 flex items-center gap-2 truncate">
                              <span>{ai.name}</span>
                              <span className="text-[9px] font-mono uppercase bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">Imperio IA</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Nivel {ai.aiLevel} • Temperatura {ai.temperature}°C
                            </div>
                          </div>
                        </>
                      ) : virgin ? (
                        <>
                          <PlanetIcon planet={virgin} />
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-emerald-300 flex items-center gap-2 truncate">
                              <span>Mundo Virgen</span>
                              <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">Colonizable</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Bioma {BIOME_ES[virgin.biome] || virgin.biome || 'Estéril'} • {virgin.planetSize}km • Temperatura {virgin.temperature}°C
                            </div>
                          </div>
                        </>
                      ) : isAsteroidOrbit ? (
                        <>
                          <div className="text-xl w-8 text-center shrink-0">☄️</div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-amber-300 flex items-center gap-2 truncate">
                              <span>Cinturón de Asteroides</span>
                              <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">Yacimiento</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Depósito de minerales y silicatos en órbita
                            </div>
                          </div>
                        </>
                      ) : poi ? (
                        <>
                          <div className="text-2xl shrink-0">{poi.icon}</div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-purple-300 flex items-center gap-2 truncate">
                              <span>{poi.name}</span>
                              <span className="text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">Anomalía</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">{poi.desc}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-slate-600 font-mono text-xl w-8 text-center shrink-0">·</div>
                          <div className="text-slate-500 text-xs font-mono">Espacio Profundo Desocupado (Vacío Orbital)</div>
                        </>
                      )}
                    </div>

                    {/* Lado Derecho: Todas las opciones de etiquetas alineadas en la misma línea a la derecha */}
                    <div className="flex items-center gap-1.5 flex-wrap ml-auto shrink-0">
                      {hasMissions && (
                        <span className="text-xs text-cyan-400 animate-pulse mr-1" title="Misión en ruta">🛸</span>
                      )}

                      {/* Caso 1: Mi propio planeta */}
                      {my && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.playSfx) window.playSfx('click');
                              dispatch({ type: 'SET_PLANET', payload: my.id });
                            }}
                            className="px-2.5 py-1 text-[11px] rounded-lg font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Gestionar este mundo"
                          >
                            <span>🪐</span>
                            <span>{my.id === currentPlanet.id ? 'Gestionar' : 'Cambiar a Sede'}</span>
                          </button>

                          {my.id !== currentPlanet.id && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectTarget(pos, true, false, 'transport');
                                }}
                                className="px-2.5 py-1 text-[11px] rounded-lg font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 transition-all flex items-center gap-1 cursor-pointer"
                                title="Enviar suministros y materias primas a esta colonia"
                              >
                                <span>📦</span>
                                <span>Transportar</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectTarget(pos, true, false, 'transport');
                                }}
                                className="px-2.5 py-1 text-[11px] rounded-lg font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 transition-all flex items-center gap-1 cursor-pointer"
                                title="Reubicar y transferir naves de guarnición"
                              >
                                <span>🚀</span>
                                <span>Transferir Naves</span>
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {/* Caso 2: Planeta de la IA */}
                      {ai && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectTarget(pos, true, true, 'attack');
                            }}
                            className="px-2 py-1 text-[11px] rounded-lg font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Enviar flota de asalto de combate"
                          >
                            <span>⚔️</span>
                            <span>Atacar</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              quickSpy(pos, ai);
                            }}
                            disabled={availableProbes <= 0}
                            className={`px-2 py-1 text-[11px] rounded-lg font-mono font-bold transition-all flex items-center gap-1 ${
                              availableProbes > 0
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 cursor-pointer'
                                : 'bg-slate-800/30 text-slate-500 border border-slate-700/30 cursor-not-allowed opacity-60'
                            }`}
                            title={availableProbes > 0 ? `Lanzar sondas de espionaje para obtener informe de inteligencia (${availableProbes} disponibles)` : `Sin sondas de espionaje en ${launchPlanet.name}`}
                          >
                            <span>👁️</span>
                            <span>Espiar</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectTarget(pos, true, true, 'planet_destruction');
                            }}
                            className="px-2 py-1 text-[11px] rounded-lg font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Misión de aniquilación y destrucción planetaria con superarmas"
                          >
                            <span>💥</span>
                            <span>Pulverizar Planeta</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.playSfx) window.playSfx('click');
                              if (setActiveTab) setActiveTab('communications');
                              else if (navigateTo) navigateTo('communications');
                            }}
                            className="px-2 py-1 text-[11px] rounded-lg font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Abrir canal de transmisiones con el líder de este planeta"
                          >
                            <span>📡</span>
                            <span>Comunicaciones</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.playSfx) window.playSfx('click');
                              if (setActiveTab) setActiveTab('diplomacy');
                              else if (navigateTo) navigateTo('diplomacy');
                            }}
                            className="px-2 py-1 text-[11px] rounded-lg font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Negociar tratados comerciales o de no agresión en la Cámara Diplomática"
                          >
                            <span>🕊️</span>
                            <span>Diplomacia</span>
                          </button>

                          {(ai.hasEmbassy || (ai.activePacts || []).includes('permanent_embassy')) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.playSfx) window.playSfx('click');
                                setEmbassyAIModal(ai);
                              }}
                              className="px-2.5 py-1 text-[11px] rounded-lg font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400 hover:bg-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all flex items-center gap-1 cursor-pointer animate-pulse"
                              title="Acceder al enclave y panel interno de la Embajada Imperial en este mundo"
                            >
                              <span>🏛️</span>
                              <span>Embajada Imperial</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* Caso 3: Mundo Virgen deshabitado */}
                      {virgin && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectTarget(pos, false, true, 'colonize');
                            }}
                            className="px-2.5 py-1 text-[11px] rounded-lg font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Despachar nave colonizadora para fundar un asentamiento"
                          >
                            <span>🌱</span>
                            <span>Colonizar</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              quickSpy(pos, null);
                            }}
                            className="px-2 py-1 text-[11px] rounded-lg font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Sondear composición geológica del mundo virgen"
                          >
                            <span>👁️</span>
                            <span>Espiar</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectTarget(pos, false, true, 'expedition');
                            }}
                            className="px-2 py-1 text-[11px] rounded-lg font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Despachar expedición científica a este mundo virgen"
                          >
                            <span>🌌</span>
                            <span>Expedición</span>
                          </button>
                        </>
                      )}

                      {/* Caso 4: Vacío orbital, Cinturón o Anomalía */}
                      {!my && !ai && !virgin && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectTarget(pos, false, false, 'recycle');
                            }}
                            className="px-2 py-1 text-[11px] rounded-lg font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Recolectar detritos espaciales y minerales con recicladores"
                          >
                            <span>♻️</span>
                            <span>Reciclar</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectTarget(pos, false, false, 'expedition');
                            }}
                            className="px-2 py-1 text-[11px] rounded-lg font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Misión de exploración a la anomalía u órbita vacía"
                          >
                            <span>🌌</span>
                            <span>Expedición</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              quickSpy(pos, null);
                            }}
                            className="px-2 py-1 text-[11px] rounded-lg font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            title="Escanear lecturas energéticas en esta coordenada"
                          >
                            <span>👁️</span>
                            <span>Espiar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Enclave y Embajada Imperial en Territorio Extranjero */}
      {embassyAIModal && (
        <ForeignEmbassyModal
          isOpen={Boolean(embassyAIModal)}
          onClose={() => setEmbassyAIModal(null)}
          targetAI={embassyAIModal}
          state={state}
          dispatch={dispatch}
          fmt={fmt}
        />
      )}
    </div>
  );
};

export default GalaxyPage;
