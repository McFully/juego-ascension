import React, { useState } from 'react';
import { SafeImg } from '../../assets.jsx';
import { ActionCardTile } from '../ui/ActionCardTile.jsx';
import { calcFuel, calcDistance, calcFlightTime, fleetSpeed } from '../../core.jsx';
import { ActivePatrolCard } from './cards/ActivePatrolCard.jsx';

/**
 * Sección de control y despliegue de Patrullas Orbitales y Policía de Sistema Solar.
 * Soporta despliegue en órbita local o hacia colonias remotas del imperio.
 */
export const PatrolControlSection = ({
  state,
  dispatch,
  currentPlanet,
  SHIPS,
  fmt,
  fmtTime,
  S,
  onBack
}) => {
  const [selectedShipsToDeploy, setSelectedShipsToDeploy] = useState({});
  const [patrolTypeToDeploy, setPatrolTypeToDeploy] = useState('orbital'); // 'orbital' | 'system'
  const [targetColonyId, setTargetColonyId] = useState(currentPlanet?.id || '');
  const [durationHours, setDurationHours] = useState(0); // 0 = permanente

  // Estado para modal de refuerzo
  const [reinforcePatrolId, setReinforcePatrolId] = useState(null);
  const [shipsToReinforce, setShipsToReinforce] = useState({});

  const patrols = state.patrols || [];
  const currentPlanetPatrols = patrols.filter(p => p.planetId === currentPlanet.id);
  const otherPlanetsPatrols = patrols.filter(p => p.planetId !== currentPlanet.id);
  const inTransitPatrols = (state.fleetMissions || []).filter(m => m.type === 'deploy_patrol');

  const availableShips = Object.entries(currentPlanet.fleet || {}).filter(([, q]) => q > 0);

  const targetPlanet = state.planets.find(p => p.id === targetColonyId) || currentPlanet;
  const isRemoteTarget = targetPlanet.id !== currentPlanet.id;

  const toggleDeployShip = (id, delta) => {
    setSelectedShipsToDeploy(prev => {
      const cur = prev[id] || 0;
      const max = currentPlanet.fleet[id] || 0;
      const next = Math.max(0, Math.min(max, cur + delta));
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const setDeployShipMax = (id) => {
    const max = currentPlanet.fleet[id] || 0;
    setSelectedShipsToDeploy(prev => ({ ...prev, [id]: max }));
  };

  const toggleReinforceShip = (id, delta) => {
    setShipsToReinforce(prev => {
      const cur = prev[id] || 0;
      const max = currentPlanet.fleet[id] || 0;
      const next = Math.max(0, Math.min(max, cur + delta));
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const deployCount = Object.values(selectedShipsToDeploy).reduce((a, b) => a + b, 0);

  // Calcular requerimiento de combustible previo y tiempo de viaje si es remoto
  const driveLevel = Math.max(
    state.research?.combustion || 0,
    state.research?.impulse || 0,
    state.research?.hyperspace || 0
  );
  let estHourlyFuel = 0;
  for (const [id, qty] of Object.entries(selectedShipsToDeploy)) {
    if (qty > 0) {
      const baseUnitFuel = calcFuel(patrolTypeToDeploy === 'system' ? 100 : 25, id, 1, driveLevel, state.research || {}, targetPlanet);
      estHourlyFuel += Math.max(1, Math.round(baseUnitFuel * 0.15)) * qty;
    }
  }

  let travelFuel = 0;
  let flightSeconds = 0;
  if (isRemoteTarget && deployCount > 0) {
    const dist = calcDistance(currentPlanet, targetPlanet);
    const spd = fleetSpeed(selectedShipsToDeploy, state.research || {}, currentPlanet.faction || 'human');
    flightSeconds = calcFlightTime(dist, spd, 10, state.research || {});
    for (const [id, qty] of Object.entries(selectedShipsToDeploy)) {
      if (qty > 0) {
        travelFuel += calcFuel(dist, id, qty, driveLevel, state.research || {}, currentPlanet);
      }
    }
  }

  const estInitialFuel = Math.round(estHourlyFuel * 1.5) + travelFuel;
  const currentDeut = currentPlanet.resources?.deuterium || 0;
  const hasEnoughFuel = currentDeut >= estInitialFuel;

  const handleDeploy = () => {
    if (deployCount === 0 || !hasEnoughFuel) return;
    dispatch({
      type: 'DEPLOY_PATROL',
      planetId: currentPlanet.id,
      targetPlanetId: targetPlanet.id,
      fleet: selectedShipsToDeploy,
      patrolType: patrolTypeToDeploy,
      durationHours: Number(durationHours)
    });
    setSelectedShipsToDeploy({});
    if (window.playSfx) window.playSfx('success');
  };

  const handleRecall = (patrolId) => {
    dispatch({
      type: 'RECALL_PATROL',
      patrolId
    });
    if (window.playSfx) window.playSfx('click');
  };

  const handleReinforce = (patrolId) => {
    const reinforceCount = Object.values(shipsToReinforce).reduce((a, b) => a + b, 0);
    if (reinforceCount === 0) return;
    dispatch({
      type: 'REINFORCE_PATROL',
      patrolId,
      shipsToAdd: shipsToReinforce
    });
    setReinforcePatrolId(null);
    setShipsToReinforce({});
    if (window.playSfx) window.playSfx('success');
  };

  return (
    <div className="space-y-6">
      {/* Cabecera de Sección */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-[#0a1428]/80 to-slate-950/80 border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-cyan-400 hover:text-white transition-colors"
            title="Volver al Hangar"
          >
            ←
          </button>
          <div>
            <h2 className="text-lg font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <span>🛡️</span>
              <span>Comando de Patrullas y Seguridad Orbital</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Despliega flotas policiales y escudos defensivos en órbita para interceptar incursiones enemigas en cualquier colonia.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono text-cyan-300">
          <span>{patrols.length} Patrullas Activas en el Imperio</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PANEL IZQUIERDO: DESPLEGAR NUEVA PATRULLA (COL 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-[#080d1a] border border-cyan-500/30 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center justify-between">
              <span>🚀 Nueva Patrulla desde {currentPlanet.name}</span>
              <span className="text-[10px] text-cyan-400 font-normal">[{currentPlanet.galaxy}:{currentPlanet.system}:{currentPlanet.position}]</span>
            </h3>

            {/* Selector de Destino de Protección (Planeta local o colonias remotas) */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>📍 Colonia o Planeta a Proteger:</span>
                {isRemoteTarget && (
                  <span className="text-[10px] text-amber-400 font-mono font-bold animate-pulse">
                    Misión remota (Vuelo en tránsito)
                  </span>
                )}
              </label>
              <select
                value={targetColonyId}
                onChange={(e) => setTargetColonyId(e.target.value)}
                className="w-full bg-[#05070f] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-cyan-300 focus:outline-none"
              >
                <option value={currentPlanet.id}>
                  {currentPlanet.name} [{currentPlanet.galaxy}:{currentPlanet.system}:{currentPlanet.position}] (Este Planeta - Inmediato)
                </option>
                {state.planets
                  .filter(p => p.id !== currentPlanet.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.galaxy}:{p.system}:{p.position}] (Colonia Imperial)
                    </option>
                  ))}
              </select>
            </div>

            {/* Selector de Tipo */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPatrolTypeToDeploy('orbital')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  patrolTypeToDeploy === 'orbital'
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold font-mono uppercase flex items-center gap-1.5">
                  <span>🛡️</span> Órbita Planetaria
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Escudo directo sobre {targetPlanet.name}. Intercepta asaltos y espías.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPatrolTypeToDeploy('system')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  patrolTypeToDeploy === 'system'
                    ? 'bg-blue-950/60 border-blue-400 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold font-mono uppercase flex items-center gap-1.5">
                  <span>🚨</span> Policía de Sistema
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Cubre los 15 sectores del sistema solar [{targetPlanet.galaxy}:{targetPlanet.system}:*].
                </div>
              </button>
            </div>

            {/* Selector de Duración */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5">
                ⏱️ Duración del Despliegue:
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full bg-[#05070f] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value={0}>Ilimitada / Permanente (Mantenimiento continuo)</option>
                <option value={2}>2 Horas de patrulla</option>
                <option value={6}>6 Horas de patrulla</option>
                <option value={12}>12 Horas de patrulla</option>
                <option value={24}>24 Horas de patrulla</option>
                <option value={48}>48 Horas de patrulla</option>
              </select>
            </div>

            {/* Selector de Naves Disponibles */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300">Naves en Dársena ({currentPlanet.name}):</span>
                <span className="text-cyan-400 font-bold">{deployCount} seleccionadas</span>
              </div>

              {availableShips.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500 font-mono">
                  No hay naves militares ni civiles en las dársenas de {currentPlanet.name}.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {availableShips.map(([id, qty]) => {
                    const sel = selectedShipsToDeploy[id] || 0;
                    const shipName = SHIPS[id]?.name || id;
                    return (
                      <div key={id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-white font-semibold truncate">{shipName}</span>
                          <span className="text-slate-400">({qty})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleDeployShip(id, -10)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >-10</button>
                          <button
                            type="button"
                            onClick={() => toggleDeployShip(id, -1)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >-</button>
                          <span className="w-8 text-center font-bold text-cyan-300">{sel}</span>
                          <button
                            type="button"
                            onClick={() => toggleDeployShip(id, 1)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >+</button>
                          <button
                            type="button"
                            onClick={() => toggleDeployShip(id, 10)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >+10</button>
                          <button
                            type="button"
                            onClick={() => setDeployShipMax(id)}
                            className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold hover:bg-cyan-900"
                          >MÁX</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Resumen de Combustible y Botón de Despliegue */}
            {deployCount > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Consumo inicial {isRemoteTarget ? '(Salto + Despliegue)' : ''}:</span>
                  <span className={hasEnoughFuel ? 'text-cyan-300 font-bold' : 'text-rose-400 font-bold'}>
                    {fmt(estInitialFuel)} Deuterio {hasEnoughFuel ? '✓' : `(Faltan ${fmt(estInitialFuel - currentDeut)})`}
                  </span>
                </div>
                {isRemoteTarget && (
                  <div className="flex justify-between items-center text-amber-300 text-[11px]">
                    <span>Tiempo de vuelo a {targetPlanet.name}:</span>
                    <span>{fmtTime(flightSeconds)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Mantenimiento en órbita:</span>
                  <span className="text-slate-300">~{fmt(estHourlyFuel)} D/hora</span>
                </div>
              </div>
            )}

            {/* Botón de Despliegue */}
            <button
              onClick={handleDeploy}
              disabled={deployCount === 0 || !hasEnoughFuel}
              className={`w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                deployCount > 0 && hasEnoughFuel
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer'
                  : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {deployCount === 0
                ? 'Selecciona naves para desplegar'
                : !hasEnoughFuel
                ? `🚫 Falta Deuterio (${fmt(currentDeut)}/${fmt(estInitialFuel)})`
                : isRemoteTarget
                ? `🚀 Enviar Patrulla a ${targetPlanet.name} (${deployCount} Naves)`
                : `🛡️ Desplegar ${deployCount} Naves en Patrulla`}
            </button>
          </div>
        </div>

        {/* PANEL DERECHO: PATRULLAS ACTIVAS EN VIVO (COL 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-[#080d1a] border border-cyan-500/30 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center justify-between">
              <span>🛰️ Escuadrones en Servicio Activo</span>
              <span className="text-xs text-slate-400 font-mono">
                {currentPlanetPatrols.length} en este planeta / {otherPlanetsPatrols.length} en otras colonias
                {inTransitPatrols.length > 0 ? ` (+${inTransitPatrols.length} en tránsito)` : ''}
              </span>
            </h3>

            {/* SECCIÓN DE PATRULLAS EN TRÁNSITO HACIA COLONIAS */}
            {inTransitPatrols.length > 0 && (
              <div className="space-y-2 mb-4 p-3 rounded-xl bg-amber-950/20 border border-amber-500/40">
                <div className="flex items-center justify-between text-xs font-mono text-amber-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Patrullas en Vector de Tránsito ({inTransitPatrols.length})</span>
                  </span>
                  <span className="text-[10px] text-amber-400/80 uppercase">Volando a destino</span>
                </div>
                <div className="space-y-2">
                  {inTransitPatrols.map((mission) => {
                    const remainingSec = Math.max(0, Math.round(((mission.arrivalTime || 0) - Date.now()) / 1000));
                    const shipsCount = Object.values(mission.fleet || {}).reduce((a, b) => a + b, 0);
                    return (
                      <div
                        key={mission.id}
                        className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/80 border border-amber-500/30 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🚀</span>
                          <div>
                            <div className="text-white font-bold flex items-center gap-2">
                              <span>Hacia {mission.to?.name || 'Colonia'}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                                {mission.patrolType === 'orbital' ? 'Orbital' : 'Sistema'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Origen: {mission.from?.name || 'Base'} • {shipsCount} naves asignadas
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-300 font-bold font-mono">
                            ETA: {fmtTime(remainingSec)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Estableciendo custodia
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {patrols.length === 0 && inTransitPatrols.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-900/30 border border-dashed border-slate-800 text-center space-y-2">
                <div className="text-3xl">🌌</div>
                <div className="text-sm font-bold text-slate-300 font-mono">Sin patrullas activas</div>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-mono">
                  No hay flotas asignadas en el espacio exterior custodiando tus planetas. Despliega un escuadrón defensivo para repeler ataques espaciales automáticamente.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {patrols.map((patrol) => {
                  const isCurrent = patrol.planetId === currentPlanet.id;
                  return (
                    <ActivePatrolCard
                      key={patrol.id}
                      patrol={patrol}
                      isCurrent={isCurrent}
                      state={state}
                      currentPlanet={currentPlanet}
                      SHIPS={SHIPS}
                      reinforcePatrolId={reinforcePatrolId}
                      setReinforcePatrolId={setReinforcePatrolId}
                      shipsToReinforce={shipsToReinforce}
                      setShipsToReinforce={setShipsToReinforce}
                      availableShips={availableShips}
                      toggleReinforceShip={toggleReinforceShip}
                      handleReinforce={handleReinforce}
                      handleRecall={handleRecall}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
