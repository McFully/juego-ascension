import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getDefenseStats } from '../core.jsx';
import { CombatSimulatorModal } from '../components/fleet/CombatSimulatorModal';
import { FleetSelectionList } from '../components/fleet/FleetSelectionList';

const FleetPage = ({ state, dispatch, currentPlanet, selectedTarget, setSelectedTarget, SHIPS, DEFENSES, BUILDINGS, SHIP_CHASSIS, S, ProgressBar, fmt, fmtTime, getEffectiveTech, simulateCombat, getShipStats, calcCustomShipStats }) => {
  const [selectedShips, setSelectedShips] = useState({});
  const [missionType, setMissionType] = useState(() => {
    if (selectedTarget && !selectedTarget.occupied) return 'colonize';
    if (selectedTarget && selectedTarget.occupied && !selectedTarget.isAI) return 'transport';
    return 'attack';
  });
  const [missionSpeed, setMissionSpeed] = useState(10);
  const [transportRes, setTransportRes] = useState({ metal: 0, crystal: 0, deuterium: 0 });
  const [autoRetreat, setAutoRetreat] = useState(false);
  const [formation, setFormation] = useState('standard');
  const [filter, setFilter] = useState('all');
  const [simResult, setSimResult] = useState(null);
  const [newRouteFrom, setNewRouteFrom] = useState(currentPlanet.id);
  const [newRouteResource, setNewRouteResource] = useState('metal');
  const [newRouteRatio, setNewRouteRatio] = useState(0.5);

  const target = selectedTarget;

  React.useEffect(() => {
    if (selectedTarget) {
      if (!selectedTarget.occupied) setMissionType('colonize');
      else if (!selectedTarget.isAI) setMissionType('transport');
      else setMissionType('attack');
    }
  }, [selectedTarget]);

  const toggleShip = (id, delta) => {
    setSelectedShips(prev => {
      const current = prev[id] || 0;
      const maxQty = currentPlanet.fleet[id] || 0;
      const next = Math.max(0, Math.min(maxQty, current + delta));
      if (next <= 0) { const r = { ...prev }; delete r[id]; return r; }
      return { ...prev, [id]: next };
    });
  };

  const sendFleet = () => {
    if (!target) return;
    const fleet = Object.fromEntries(Object.entries(selectedShips).filter(([, v]) => v > 0));
    if (Object.keys(fleet).length === 0) return;

    dispatch({
      type: 'SEND_FLEET',
      fromId: currentPlanet.id,
      to: target,
      fleet,
      missionType,
      missionSpeed,
      resources: missionType === 'transport' ? transportRes : null,
      autoRetreat,
      formation,
    });
    setSelectedShips({});
    setTransportRes({ metal: 0, crystal: 0, deuterium: 0 });
    setSelectedTarget(null);
  };

  const handleSimulate = () => {
    if (!target || Object.keys(selectedShips).length === 0) return;

    let targetPlanet, targetAI;
    if (target.isAI) {
      targetAI = state.aiPlanets.find(p => p.galaxy === target.galaxy && p.system === target.system && p.position === target.position);
    } else {
      targetPlanet = state.planets.find(p => p.galaxy === target.galaxy && p.system === target.system && p.position === target.position);
    }

    const defFleet = targetAI ? targetAI.fleet : (targetPlanet?.fleet || {});
    const defDefenses = targetAI ? targetAI.defenses : (targetPlanet?.defenses || {});
    const defTech = targetAI ? (targetAI.research || {}) : getEffectiveTech(targetPlanet, state.research);

    let result;
    try {
      result = simulateCombat(selectedShips, defFleet, defDefenses, state.research, defTech, 6, state.blueprints, 'human', targetAI ? (targetAI.faction || 'human') : 'human', autoRetreat);
    } catch (e) {
      console.error('[Ascensión] simulateCombat error:', e);
      if (window.electronAPI && window.electronAPI.logError) {
        window.electronAPI.logError(`simulateCombat failed: ${e?.message || e}`, e?.stack || '', `player=${state.playerName} ships=${Object.keys(selectedShips).length}`);
      }
      result = { error: true, message: 'Error en simulación de combate' };
    }
    setSimResult(result);
  };

  const availableShips = Object.entries(currentPlanet.fleet).filter(([id, q]) => {
    if (q <= 0) return false;
    if (filter === 'all') return true;
    const isCombat = ['lightFighter', 'heavyFighter', 'cruiser', 'battleship', 'bomber', 'destroyer', 'deathstar'].includes(id) || id.startsWith('custom_');
    if (filter === 'combat') return isCombat;
    if (filter === 'civilian') return !isCombat;
    return true;
  });
  const shipDisplayName = (id) => {
    if (id.startsWith('custom_')) {
      const bp = state.blueprints.find(b => id === 'custom_' + b.id);
      return bp ? bp.name : 'Nave Personalizada';
    }
    return SHIPS[id]?.name || id;
  };
  const shipDisplayIcon = (id) => {
    if (id.startsWith('custom_')) {
      const bp = state.blueprints.find(b => id === 'custom_' + b.id);
      return bp ? (SHIP_CHASSIS[bp.chassis]?.icon || '🔧') : '🔧';
    }
    return SHIPS[id]?.icon || '🚀';
  };
  const shipStats = (id) => {
    const tech = getEffectiveTech(currentPlanet, state.research);
    if (id.startsWith('custom_')) {
      const bp = state.blueprints.find(b => id === 'custom_' + b.id);
      if (!bp) return null;
      const cs = calcCustomShipStats(bp);
      const hull = cs.hull * (1 + (tech.armour || 0) * 0.08);
      const shd = cs.shd * (1 + (tech.shields || 0) * 0.1);
      const atk = cs.atk * (1 + (tech.weapons || 0) * 0.1);
      return { ...cs, hull, shd, atk, speed: cs.speed };
    }
    return getShipStats(id, tech, state.blueprints, 'human', currentPlanet.buildings) || SHIPS[id];
  };

  const simDefTech = (() => {
    if (!target) return {};
    if (target.isAI) {
      const ai = state.aiPlanets.find(p => p.galaxy === target.galaxy && p.system === target.system && p.position === target.position);
      return ai?.research || {};
    }
    const tp = state.planets.find(p => p.galaxy === target.galaxy && p.system === target.system && p.position === target.position);
    return getEffectiveTech(tp, state.research);
  })();

  const incomingAttacks = state.fleetMissions?.filter(m => m.isAI && m.type === 'attack') || [];

  // Group incoming attacks by destination planet and sort chronologically to simulate decay
  const sortedIncomingAttacks = [...incomingAttacks].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const attacksByPlanet = {};
  sortedIncomingAttacks.forEach(m => {
    const destKey = m.toPlanetId || `${m.to?.galaxy}:${m.to?.system}:${m.to?.position}`;
    if (!attacksByPlanet[destKey]) attacksByPlanet[destKey] = [];
    attacksByPlanet[destKey].push(m);
  });

  const attackPredictions = {};
  Object.entries(attacksByPlanet).forEach(([destKey, list]) => {
    const firstM = list[0];
    const destPlanet = state.planets.find(p => 
      p.id === firstM.toPlanetId || 
      p.name === firstM.to?.name || 
      (p.galaxy === firstM.to?.galaxy && p.system === firstM.to?.system && p.position === firstM.to?.position)
    );

    if (!destPlanet) {
      list.forEach(m => {
        attackPredictions[m.id] = { color: 'text-red-400 border-red-500/30 bg-red-950/20', text: 'Peligro Máximo' };
      });
      return;
    }

    let currentFleet = { ...(destPlanet.fleet || {}) };
    let currentDefenses = { ...(destPlanet.defenses || {}) };
    const defTech = getEffectiveTech(destPlanet, state.research);

    list.forEach(m => {
      const attackerFleet = m.fleet || {};
      const atkTech = state.research || { weapons: 0, shields: 0, armour: 0 };
      
      const sim = simulateCombat(
        attackerFleet,
        currentFleet,
        currentDefenses,
        atkTech,
        defTech,
        6,
        state.blueprints,
        m.faction || 'human',
        destPlanet.faction || 'human'
      );

      currentFleet = sim.defShipSurvivors || {};
      currentDefenses = sim.defDefenseSurvivors || {};

      let colorClass = '';
      let statusText = '';
      if (sim.winner === 'defender') {
        const initialPlanetShips = Object.values(destPlanet.fleet || {}).reduce((a, b) => a + b, 0);
        const initialPlanetDefs = Object.values(destPlanet.defenses || {}).reduce((a, b) => a + b, 0);
        const initialDefTotal = initialPlanetShips + initialPlanetDefs;

        const survivingDefShips = Object.values(currentFleet).reduce((a, b) => a + b, 0);
        const survivingDefDefs = Object.values(currentDefenses).reduce((a, b) => a + b, 0);
        const survivingTotal = survivingDefShips + survivingDefDefs;

        const ratio = survivingTotal / Math.max(initialDefTotal, 1);
        if (ratio > 0.8) {
          colorClass = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
          statusText = 'Victoria Asegurada';
        } else if (ratio > 0.4) {
          colorClass = 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20';
          statusText = 'Victoria Cómoda';
        } else {
          colorClass = 'text-amber-400 border-amber-500/40 bg-amber-950/20';
          statusText = 'Victoria Crítica (Bajas graves)';
        }
      } else if (sim.winner === 'draw') {
        colorClass = 'text-amber-400 border-amber-500/40 bg-amber-950/20';
        statusText = 'Empate Táctico';
      } else {
        colorClass = 'text-red-500 border-red-500/40 bg-red-950/20';
        statusText = 'Derrota Inevitable';
      }

      attackPredictions[m.id] = {
        color: colorClass,
        text: statusText
      };
    });
  });

  return (
    <div className="space-y-4">
      {/* Alertas de Incursiones Enemigas (Solo si no hay un objetivo seleccionado activo desde Galaxia) */}
      {!target && incomingAttacks.length > 0 && (
        <div className="bg-red-950/20 border-2 border-red-500/30 rounded-2xl p-4 space-y-3 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.05)]">
          <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 uppercase tracking-tight">
            <span className="material-symbols-outlined text-red-500 animate-pulse text-xl">emergency_home</span>
            🚨 Invasión Hostil Detectada en el Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incomingAttacks.map(m => {
              const remaining = Math.max(0, (m.arrivalTime - Date.now()) / 1000);
              const total = (m.arrivalTime - m.departure) / 1000;
              const ships = Object.values(m.fleet || {}).reduce((a, b) => a + b, 0);
              const pred = attackPredictions[m.id] || { color: 'text-red-500 border-red-500/40 bg-red-950/20', text: 'Amenaza' };
              const borderClass = pred.color.split(' ').find(c => c.startsWith('border-')) || 'border-red-500/40';
              const bgClass = pred.color.split(' ').find(c => c.startsWith('bg-')) || 'bg-red-950/20';
              
              return (
                <div key={m.id} className={`bg-black/40 border ${borderClass} ${bgClass} rounded-xl p-3 space-y-2`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-red-400 flex flex-wrap items-center gap-1.5">
                        <span>FLOTA ENEMIGA EN RUTA</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${pred.color}`}>
                          {pred.text}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 mt-1 font-mono">
                        Destino: <span className="text-cyan-400 font-bold">{m.to?.name || `[${m.to?.galaxy}:${m.to?.system}:${m.to?.position}]`}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-red-500 font-mono">{ships} naves</span>
                      <div className="text-[9px] text-slate-455 font-mono">{fmtTime(remaining)}</div>
                    </div>
                  </div>
                  <ProgressBar value={total - remaining} max={total} color="from-red-600 to-rose-500" />
                  <div className="text-[9px] text-slate-500 font-mono leading-relaxed truncate">
                    Naves: {Object.entries(m.fleet || {}).map(([id, q]) => `${q} ${SHIPS[id]?.name || id}`).join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={S.cardDeep}>
        <h3 className="text-lg font-semibold mb-3">🎯 Destino</h3>
        {target ? (
          <div className="flex items-center justify-between bg-slate-950/50 rounded-lg p-3">
            <div>
              <div className="font-mono text-cyan-400">[{target.galaxy}:{target.system}:{target.position}]</div>
              <div className="text-sm text-slate-400">
                {target.occupied ? (target.isAI ? 'Planeta IA' : 'Tu planeta') : 'Espacio vacío'}
              </div>
            </div>
            <button onClick={() => setSelectedTarget(null)} className={S.btnGhost + ' ' + S.btn}>✕</button>
          </div>
        ) : (
          <div>
            <p className="text-slate-400 text-sm mb-4">Selecciona un destino en la vista de Galaxia para enviar flotas en misiones tácticas.</p>
            
            {/* Local Fleet Inventory when no target is selected */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">🛸 Inventario de Flota en {currentPlanet.name}</h4>
              {Object.entries(currentPlanet.fleet || {}).filter(([_, q]) => q > 0).length === 0 ? (
                <p className="text-slate-500 text-xs italic font-mono bg-black/20 p-4 rounded-xl border border-white/5">No hay naves estacionadas en este hangar local.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(currentPlanet.fleet || {}).filter(([_, q]) => q > 0).map(([id, maxQty]) => {
                    const icon = shipDisplayIcon(id);
                    const name = shipDisplayName(id);
                    const st = shipStats(id);
                    return (
                      <div key={id} className="p-3 rounded-xl border border-white/5 glass bg-black/20 relative overflow-hidden group hover:border-[var(--ue-accent)]/30 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">{name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Disponibles: <span className="text-cyan-400 font-bold">{maxQty}</span></div>
                          </div>
                        </div>
                        {st && (
                          <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-500 font-mono mt-2 pt-2 border-t border-white/5">
                            <span title="Ataque">⚔️ {st.atk?.toFixed?.(1) || st.atk}</span>
                            <span title="Escudos">🛡️ {st.shd?.toFixed?.(1) || st.shd}</span>
                            <span title="Casco">💪 {fmt(st.hull)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {target && (
        <>
          <FleetSelectionList
            state={state}
            dispatch={dispatch}
            currentPlanet={currentPlanet}
            selectedShips={selectedShips}
            setSelectedShips={setSelectedShips}
            filter={filter}
            setFilter={setFilter}
            availableShips={availableShips}
            shipDisplayIcon={shipDisplayIcon}
            shipDisplayName={shipDisplayName}
            shipStats={shipStats}
            toggleShip={toggleShip}
            fmt={fmt}
            S={S}
          />

          <div className={S.cardDeep}>
            <h3 className="text-lg font-semibold mb-3">📋 Tipo de Misión</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {[
                { id: 'attack', label: '⚔️ Atacar', available: target.occupied && target.isAI },
                { id: 'planet_destruction', label: '🪐 Pulverizar Planeta', available: target.occupied && target.isAI && (currentPlanet.fleet.planetDestroyer || 0) > 0 },
                { id: 'espionage', label: '👁️ Espiar', available: target.occupied && target.isAI && (currentPlanet.fleet.espionageProbe || 0) > 0 },
                { id: 'transport', label: '📦 Transportar', available: target.occupied && !target.isAI },
                { id: 'colonize', label: '🏴 Colonizar', available: !target.occupied && (currentPlanet.fleet.colonizer || 0) > 0 },
                { id: 'recycle', label: '♻️ Reciclar', available: (state.debrisField?.metal || 0) > 0 || (state.debrisField?.crystal || 0) > 0 },
                { id: 'expedition', label: '🌌 Expedición', available: true },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMissionType(m.id)}
                  disabled={!m.available}
                  className={`${S.btn} ${missionType === m.id ? S.btnPrimary : S.btnGhost} ${!m.available ? 'opacity-40' : ''}`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {missionType === 'transport' && (
              <div className="space-y-2 mb-4">
                <label className="text-sm text-slate-400">Recursos a transportar:</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" min="0" placeholder="Metal" value={transportRes.metal || ''} onChange={e => setTransportRes({ ...transportRes, metal: Math.max(0, parseInt(e.target.value) || 0) })} className={S.input} />
                  <input type="number" min="0" placeholder="Cristal" value={transportRes.crystal || ''} onChange={e => setTransportRes({ ...transportRes, crystal: Math.max(0, parseInt(e.target.value) || 0) })} className={S.input} />
                  <input type="number" min="0" placeholder="Deuterio" value={transportRes.deuterium || ''} onChange={e => setTransportRes({ ...transportRes, deuterium: Math.max(0, parseInt(e.target.value) || 0) })} className={S.input} />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm text-slate-400 block mb-2">Velocidad de misión: {missionSpeed}/10</label>
              <input
                type="range" min="1" max="10" value={missionSpeed}
                onChange={e => setMissionSpeed(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {missionType === 'attack' && (
              <div className="mb-4 flex items-center gap-2 glass p-2 rounded-xl border border-white/10">
                <input
                  type="checkbox"
                  id="auto-retreat-chk"
                  checked={autoRetreat}
                  onChange={e => setAutoRetreat(e.target.checked)}
                  className="rounded border-white/20 text-[var(--ue-accent)] focus:ring-[var(--ue-accent)] bg-[#05070f] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="auto-retreat-chk" className="text-xs text-slate-300 cursor-pointer select-none">
                  🛡️ Activar retirada automática (si quedan menos del 30% de naves)
                </label>
              </div>
            )}

            {missionType === 'attack' && (
              <div className="mb-4">
                <label className="text-sm text-[var(--ue-text-dim)] block mb-2">🛡️ Formación de Combate:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'standard', name: 'Estándar', desc: 'Sin modificadores.' },
                    { id: 'vanguard', name: 'Vanguardia', desc: '+20% Vel, +10% Atk, -15% Escudo' },
                    { id: 'artillery', name: 'Artillería', desc: '-15% Vel, +25% Atk, +10% Escudo' },
                    { id: 'escort', name: 'Escolta', desc: '+5% Vel, +15% Escudo, -5% Atk (segura)' },
                    { id: 'raider', name: 'Asaltante', desc: '+10% Vel, +15% Atk, -10% Escudo (+15% escombros, alto riesgo)' },
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormation(f.id)}
                      className={`p-2 rounded-xl border transition-all text-left glass ${formation === f.id ? 'border-[var(--ue-accent)]/50 text-[var(--ue-accent)]' : 'border-white/10 text-slate-400 hover:text-slate-200'}`}
                    >
                      <div className="text-xs font-semibold">{f.name}</div>
                      <div className="text-[9px] text-slate-500 mt-1 leading-tight">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSimulate}
                disabled={Object.values(selectedShips).every(v => !v || v === 0)}
                className={`flex-1 ${S.btn} ${S.btnGhost}`}
              >
                🔮 Simular
              </button>
              <button
                onClick={sendFleet}
                disabled={Object.values(selectedShips).every(v => !v || v === 0)}
                className={`flex-1 ${S.btn} ${Object.values(selectedShips).some(v => v > 0) ? S.btnPrimary : S.btnGhost}`}
              >
                🚀 Enviar Flota
              </button>
            </div>
          </div>
        </>
      )}

      {/* Active Missions */}
      {state.fleetMissions.filter(m => !m.isAI).length > 0 && (
        <div className={S.cardDeep}>
          <h3 className="text-lg font-semibold mb-3">🛸 Flotas en Vuelo</h3>
          <div className="space-y-2">
            {state.fleetMissions.filter(m => !m.isAI).map(m => {
              const isReturning = m.returning;
              const remaining = Math.max(0, (isReturning ? (m.returnTime - Date.now()) : (m.arrivalTime - Date.now())) / 1000);
              const total = (isReturning ? (m.returnTime - (m.returnDeparture || m.departure)) : (m.arrivalTime - m.departure)) / 1000;
              const ships = Object.values(m.fleet).reduce((a, b) => a + b, 0);
              return (
                <div key={m.id} className="bg-slate-950/50 rounded-lg p-3">
                  <div className="flex justify-between mb-2">
                    <div>
                      <span className="font-semibold capitalize">{isReturning ? `🚀 ${m.type} (regreso)` : m.type}</span>
                      <span className="text-xs text-slate-400 ml-2">
                        {isReturning ? `← [${m.from.galaxy}:${m.from.system}:${m.from.position}]` : `→ [${m.to.galaxy}:${m.to.system}:${m.to.position}]`}
                      </span>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">{ships} naves • {fmtTime(remaining)}</span>
                  </div>
                  <ProgressBar value={total - remaining} max={total} color="from-cyan-500 to-blue-500" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trade Routes */}
      <div className={S.cardDeep}>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">🚚 Rutas Comerciales Automáticas</h3>
        {(state.tradeRoutes || []).length === 0 ? (
          <div className="text-xs text-slate-500">
            Sin rutas activas. Crea una ruta para transferir excedentes de recursos entre colonias automáticamente.
          </div>
        ) : (
          <div className="space-y-2 mb-3">
            {(state.tradeRoutes || []).map(route => {
              const from = state.planets.find(p => p.id === route.fromId);
              const resNames = { metal: '⛏️ Metal', crystal: '💎 Cristal', deuterium: '⚗️ Deuterio' };
              return (
                <div key={route.id} className={`glass rounded-xl p-3 border ${route.active ? 'border-emerald-500/30' : 'border-white/10'}`}>
                  <div className="flex justify-between items-center">
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200">{from?.name || 'Origen'}</span>
                      <span className="text-slate-400"> → </span>
                      <span className="text-slate-200">Capital</span>
                      <span className="mx-2 text-slate-500">·</span>
                      <span>{resNames[route.resource] || route.resource}</span>
                      <span className="text-slate-500 ml-2">(ratio: {(route.ratio * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => dispatch({ type: 'TOGGLE_TRADE_ROUTE', routeId: route.id })}
                        className={`text-[10px] px-2 py-1 rounded ${route.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {route.active ? 'Activa' : 'Pausada'}
                      </button>
                      <button onClick={() => dispatch({ type: 'REMOVE_TRADE_ROUTE', routeId: route.id })}
                        className="text-[10px] text-red-400 hover:text-red-300">✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          <select value={newRouteFrom} onChange={e => setNewRouteFrom(e.target.value)}
            className="text-xs bg-slate-800 border border-white/10 rounded p-1.5 text-slate-200">
            {state.planets.filter(p => !p.isHome && !(state.tradeRoutes || []).some(r => r.fromId === p.id && r.active)).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select value={newRouteResource} onChange={e => setNewRouteResource(e.target.value)}
            className="text-xs bg-slate-800 border border-white/10 rounded p-1.5 text-slate-200">
            <option value="metal">⛏️ Metal</option>
            <option value="crystal">💎 Cristal</option>
            <option value="deuterium">⚗️ Deuterio</option>
          </select>
          <select value={newRouteRatio} onChange={e => setNewRouteRatio(parseFloat(e.target.value))}
            className="text-xs bg-slate-800 border border-white/10 rounded p-1.5 text-slate-200">
            <option value="0.25">25% (mínimo excedente)</option>
            <option value="0.5">50%</option>
            <option value="0.75">75% (máximo excedente)</option>
          </select>
          {(state.tradeRoutes || []).length < 5 && (
            <button onClick={() => {
              dispatch({ type: 'ADD_TRADE_ROUTE', fromId: newRouteFrom, toGalaxy: 1, toSystem: 1, toPosition: 1, resource: newRouteResource, ratio: newRouteRatio });
            }} className={`${S.btn} ${S.btnPrimary} text-xs`}>+ Añadir Ruta</button>
          )}
          {(state.tradeRoutes || []).length > 0 && (
            <button onClick={() => dispatch({ type: 'PROCESS_TRADE_ROUTES' })}
              className={`${S.btn} ${S.btnGhost} text-xs`}>⚡ Procesar Ahora</button>
          )}
        </div>
      </div>

      {/* Spy Reports */}
      {state.spyReports?.length > 0 && (
        <div className={S.cardDeep}>
          <h3 className="text-lg font-semibold mb-3">👁️ Informes de Espionaje</h3>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {state.spyReports.slice().reverse().slice(0, 10).map(r => {
              const hasResources = r.resources && (typeof r.resources.metal === 'number' || r.resources.metal === 'parcial' || r.resources.metal === '???');
              const hasBuildings = r.buildings && Object.keys(r.buildings).length > 0;
              const hasFleet = r.fleet && Object.keys(r.fleet).length > 0;
              const hasDefenses = r.defenses && Object.keys(r.defenses).length > 0;
              const hasExtended = r.extendedInfo;

              return (
                <div key={r.id} className="glass rounded-xl p-3.5 border border-white/10 space-y-3 transition-colors hover:border-[var(--ue-accent)]/30">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <div>
                      <span className="font-semibold text-sm text-cyan-300">{r.target?.name || r.targetName}</span>
                      <span className="text-xs text-slate-500 font-mono ml-2">
                        [{r.coords?.galaxy || r.target?.galaxy}:{r.coords?.system || r.target?.system}:{r.coords?.position || r.target?.position}]
                      </span>
                    </div>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider ${
                      r.intelLevel === 'full' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      r.intelLevel === 'high' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      r.intelLevel === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      r.intelLevel === 'low' ? 'bg-slate-800 text-slate-400' :
                      'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      Intel: {r.intelLevel}
                    </span>
                  </div>

                  {/* Resources */}
                  {hasResources && (
                    <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950/80 p-2 rounded border border-slate-900">
                      <div>
                        <span className="text-amber-400 mr-1.5">⛏️</span> 
                        <span className="font-mono text-slate-300">
                          {typeof r.resources.metal === 'number' ? fmt(r.resources.metal) : r.resources.metal}
                        </span>
                      </div>
                      <div>
                        <span className="text-cyan-400 mr-1.5">💎</span> 
                        <span className="font-mono text-slate-300">
                          {typeof r.resources.crystal === 'number' ? fmt(r.resources.crystal) : r.resources.crystal}
                        </span>
                      </div>
                      <div>
                        <span className="text-emerald-400 mr-1.5">⚗️</span> 
                        <span className="font-mono text-slate-300">
                          {typeof r.resources.deuterium === 'number' ? fmt(r.resources.deuterium) : r.resources.deuterium}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tabbed details */}
                  <div className="space-y-1.5 text-xs">
                    {hasBuildings && (
                      <div className="text-slate-400 leading-relaxed">
                        <span className="font-semibold text-slate-300">🏢 Edificios:</span>{' '}
                        {Object.entries(r.buildings).filter(([, v]) => v > 0).map(([k, v]) => `${BUILDINGS[k]?.name || k} (${v})`).join(', ') || 'Ninguno'}
                      </div>
                    )}
                    {hasFleet && (
                      <div className="text-slate-400 leading-relaxed">
                        <span className="font-semibold text-slate-300">🚀 Flota:</span>{' '}
                        {r.fleet.estimated ? (
                          <span className="text-amber-400/90 italic font-medium">Presencia de flota detectada (Sensores insuficientes para recuento)</span>
                        ) : r.fleet.none ? (
                          <span className="text-slate-500 italic">No se detectaron naves en órbita</span>
                        ) : (
                          Object.entries(r.fleet).filter(([, v]) => v > 0).map(([k, v]) => `${SHIPS[k]?.name || k} (${v})`).join(', ') || 'Ninguna'
                        )}
                      </div>
                    )}
                    {hasDefenses && (
                      <div className="text-slate-400 leading-relaxed">
                        <span className="font-semibold text-slate-300">🛡️ Defensas:</span>{' '}
                        {Object.entries(r.defenses).filter(([, v]) => v > 0).map(([k, v]) => `${DEFENSES[k]?.name || k} (${v})`).join(', ') || 'Ninguna'}
                      </div>
                    )}
                    {hasExtended && (
                      <div className="border-t border-slate-900/60 pt-2 mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-400 bg-cyan-950/10 p-2 rounded">
                        <div><span className="font-semibold text-cyan-400/80 mr-1">Estrategia:</span> {r.extendedInfo.strategy}</div>
                        <div><span className="font-semibold text-cyan-400/80 mr-1">Agresión:</span> {(r.extendedInfo.aggression * 100).toFixed(0)}%</div>
                        <div><span className="font-semibold text-cyan-400/80 mr-1">Récord Combate:</span> {r.extendedInfo.totalWins}V / {r.extendedInfo.totalLosses}D</div>
                        <div><span className="font-semibold text-cyan-400/80 mr-1">Predicción:</span> {r.extendedInfo.behaviorPrediction}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <CombatSimulatorModal
        simResult={simResult}
        setSimResult={setSimResult}
        state={state}
        target={target}
        simDefTech={simDefTech}
        SHIPS={SHIPS}
        DEFENSES={DEFENSES}
        ProgressBar={ProgressBar}
        fmt={fmt}
        S={S}
      />
    </div>
  );
};

export default FleetPage;
