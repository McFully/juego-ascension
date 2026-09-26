import React, { useState, useMemo } from "react";

export const TradeRoutesSection = ({ state, currentPlanet, dispatch, SHIPS, S, fmt }) => {
  const [fromPlanetId, setFromPlanetId] = useState(currentPlanet?.id || state.planets[0]?.id);
  const [toPlanetId, setToPlanetId] = useState(() => {
    const other = state.planets.find(p => p.id !== (currentPlanet?.id || state.planets[0]?.id));
    return other ? other.id : (state.planets[1]?.id || state.planets[0]?.id);
  });
  const [resource, setResource] = useState("metal");
  const [mode, setMode] = useState("fixed"); // "fixed" | "surplus"
  const [amount, setAmount] = useState(10000);
  const [ratio, setRatio] = useState(0.5);
  const [intervalDays, setIntervalDays] = useState(1);
  const [loop, setLoop] = useState(true);
  const [returnResource, setReturnResource] = useState("none");
  const [returnAmount, setReturnAmount] = useState(5000);

  // Asignación de naves
  const [smallCargoCount, setSmallCargoCount] = useState(0);
  const [largeCargoCount, setLargeCargoCount] = useState(0);
  const [lightFighterCount, setLightFighterCount] = useState(0);
  const [heavyFighterCount, setHeavyFighterCount] = useState(0);

  const resNames = {
    metal: "⛏️ Metal",
    crystal: "💎 Cristal",
    deuterium: "⚗️ Deuterio",
    none: "🚫 Sin Carga de Retorno"
  };

  // Planeta origen y naves disponibles en su hangar
  const selectedFromPlanet = state.planets.find(p => p.id === fromPlanetId) || currentPlanet;
  const hangar = selectedFromPlanet?.fleet || {};
  const availSmallCargo = hangar.smallCargo || 0;
  const availLargeCargo = hangar.largeCargo || 0;
  const availLightFighter = hangar.lightFighter || 0;
  const availHeavyFighter = hangar.heavyFighter || 0;

  // Capacidades base de carga
  const smallCargoCap = SHIPS?.smallCargo?.cargo || 5000;
  const largeCargoCap = SHIPS?.largeCargo?.cargo || 25000;

  // Capacidad de bodega total con las naves actualmente seleccionadas
  const assignedCargoCapacity = (smallCargoCount * smallCargoCap) + (largeCargoCount * largeCargoCap);

  // Estimación de carga necesaria para la ida
  const targetSendAmount = mode === "fixed" ? Number(amount) || 0 : 5000;

  // Auto-asignar cargueros necesarios con un solo clic
  const handleAutoAssignCargos = () => {
    let needed = Math.max(targetSendAmount, returnResource !== "none" ? Number(returnAmount) || 0 : 0);
    if (needed <= 0) needed = 5000;

    let useLarge = Math.min(availLargeCargo, Math.floor(needed / largeCargoCap));
    let rem = needed - (useLarge * largeCargoCap);
    let useSmall = 0;
    if (rem > 0) {
      useSmall = Math.min(availSmallCargo, Math.ceil(rem / smallCargoCap));
      rem -= useSmall * smallCargoCap;
    }
    // Si aún falta y hay más cargueros grandes disponibles
    if (rem > 0 && useLarge < availLargeCargo) {
      useLarge += 1;
    }

    setLargeCargoCount(useLarge);
    setSmallCargoCount(useSmall);
  };

  // Validación para habilitar el botón
  const activeRoutes = state.tradeRoutes || [];
  const isTargetSameAsFrom = fromPlanetId === toPlanetId;
  const hasNoCargoShips = (smallCargoCount + largeCargoCount) <= 0;
  const exceedsHangar = (
    smallCargoCount > availSmallCargo ||
    largeCargoCount > availLargeCargo ||
    lightFighterCount > availLightFighter ||
    heavyFighterCount > availHeavyFighter
  );
  const isButtonDisabled = activeRoutes.length >= 10 || isTargetSameAsFrom || exceedsHangar;

  const handleCreateRoute = () => {
    if (isButtonDisabled) return;

    const targetPlanet = state.planets.find(p => p.id === toPlanetId);

    dispatch({
      type: "ADD_TRADE_ROUTE",
      fromId: fromPlanetId,
      toId: toPlanetId,
      toGalaxy: targetPlanet?.galaxy || 1,
      toSystem: targetPlanet?.system || 1,
      toPosition: targetPlanet?.position || 1,
      resource,
      mode,
      amount: Number(amount) || 5000,
      ratio: Number(ratio) || 0.5,
      intervalDays: Number(intervalDays) || 1,
      loop,
      returnResource,
      returnAmount: returnResource !== "none" ? Number(returnAmount) || 0 : 0,
      assignedShips: {
        smallCargo: smallCargoCount,
        largeCargo: largeCargoCount,
        lightFighter: lightFighterCount,
        heavyFighter: heavyFighterCount
      }
    });

    if (window.playSfx) window.playSfx("click");
  };

  return (
    <div className="bg-[#090d1f]/90 border border-cyan-500/25 rounded-3xl p-5 md:p-6 shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            🚚
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
              Logística y Rutas Comerciales Automáticas
            </h3>
            <p className="text-xs text-amber-400 font-mono">
              Programación de fletes punto a punto, intercambios recíprocos en bucle, asignación de naves de carga y escoltas tácticas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeRoutes.length > 0 && (
            <button
              onClick={() => {
                dispatch({ type: "PROCESS_TRADE_ROUTES" });
                if (window.playSfx) window.playSfx("click");
              }}
              className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>⚡</span>
              <span>Ejecutar Rutas Ahora</span>
            </button>
          )}
        </div>
      </div>

      {/* Formulario de Programación Avanzada de Ruta */}
      <div className="bg-black/50 border border-white/10 rounded-2xl p-4 md:p-5 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
          <span>🛠️ Programar Nueva Ruta Automatizada</span>
          <span className="text-slate-500 font-normal">Capacidad de red: {activeRoutes.length}/10 activas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Planeta Origen (Planeta A) */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">1. Planeta Origen (A)</label>
            <select
              value={fromPlanetId}
              onChange={e => {
                const newFrom = e.target.value;
                setFromPlanetId(newFrom);
                if (toPlanetId === newFrom) {
                  const other = state.planets.find(p => p.id !== newFrom);
                  if (other) setToPlanetId(other.id);
                }
              }}
              className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              {state.planets.map(p => (
                <option key={p.id} value={p.id}>
                  🪐 {p.name} [{p.galaxy}:{p.system}:{p.position}]
                </option>
              ))}
            </select>
          </div>

          {/* Planeta Destino (Planeta B) */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">2. Planeta Destino (B)</label>
            <select
              value={toPlanetId}
              onChange={e => setToPlanetId(e.target.value)}
              className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              {state.planets.filter(p => p.id !== fromPlanetId).map(p => (
                <option key={p.id} value={p.id}>
                  🎯 {p.name} [{p.galaxy}:{p.system}:{p.position}]
                </option>
              ))}
            </select>
          </div>

          {/* Carga de Ida (A ➔ B) */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">3. Carga Enviada (A ➔ B)</label>
            <select
              value={resource}
              onChange={e => setResource(e.target.value)}
              className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="metal">⛏️ Metal</option>
              <option value="crystal">💎 Cristal</option>
              <option value="deuterium">⚗️ Deuterio</option>
            </select>
          </div>

          {/* Modo de Envío */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">4. Modalidad de Envío</label>
            <select
              value={mode}
              onChange={e => setMode(e.target.value)}
              className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="fixed">📦 Carga Exacta Programada</option>
              <option value="surplus">🌊 Enviar Excedente de Almacén</option>
            </select>
          </div>
        </div>

        {/* Parámetros de Cantidad, Frecuencia y Retorno */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {mode === "fixed" ? (
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Cantidad Fija de Ida</label>
              <input
                type="number"
                min="100"
                step="1000"
                value={amount}
                onChange={e => setAmount(Math.max(100, parseInt(e.target.value) || 0))}
                className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-cyan-300 font-bold text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold">Límite de Excedente</label>
              <select
                value={ratio}
                onChange={e => setRatio(parseFloat(e.target.value))}
                className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-cyan-300 font-bold text-xs focus:border-cyan-400 focus:outline-none"
              >
                <option value="0.25">25% (conservador)</option>
                <option value="0.5">50% (equilibrado)</option>
                <option value="0.75">75% (máximo flete)</option>
              </select>
            </div>
          )}

          {/* Frecuencia / Días */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Frecuencia de Envío</label>
            <select
              value={intervalDays}
              onChange={e => setIntervalDays(parseInt(e.target.value))}
              className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="1">⏱️ Cada 1 Ciclo / Día</option>
              <option value="2">⏱️ Cada 2 Ciclos</option>
              <option value="3">⏱️ Cada 3 Ciclos</option>
              <option value="5">⏱️ Cada 5 Ciclos</option>
            </select>
          </div>

          {/* Carga de Retorno (B ➔ A) */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Carga de Retorno (B ➔ A)</label>
            <select
              value={returnResource}
              onChange={e => setReturnResource(e.target.value)}
              className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="none">🚫 Sin Retorno</option>
              <option value="metal">⛏️ Traer Metal</option>
              <option value="crystal">💎 Traer Cristal</option>
              <option value="deuterium">⚗️ Traer Deuterio</option>
            </select>
          </div>

          {/* Cantidad de Retorno y Modo Loop */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">
              {returnResource !== "none" ? "Cantidad Retorno" : "Régimen de Operación"}
            </label>
            {returnResource !== "none" ? (
              <input
                type="number"
                min="100"
                step="1000"
                value={returnAmount}
                onChange={e => setReturnAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-emerald-300 font-bold text-xs focus:border-cyan-400 focus:outline-none"
              />
            ) : (
              <label className="flex items-center gap-2 h-9 px-3 bg-[#05070f] rounded-xl border border-white/15 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={e => setLoop(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span className="text-[11px]">Bucle Continuo (Loop)</span>
              </label>
            )}
          </div>
        </div>

        {/* SECCIÓN DE ASIGNACIÓN DE NAVES DE CARGA Y ESCOLTAS TÁCTICAS */}
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <span>🚀</span>
              <span>Asignación de Naves de Transporte y Escolta (Hangar: {selectedFromPlanet?.name})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                Bodega Asignada:{" "}
                <strong className={assignedCargoCapacity >= targetSendAmount ? "text-emerald-400" : "text-amber-400"}>
                  {fmt ? fmt(assignedCargoCapacity) : assignedCargoCapacity} uds
                </strong>
                {targetSendAmount > 0 && ` (Requerido: ${fmt ? fmt(targetSendAmount) : targetSendAmount})`}
              </span>
              <button
                type="button"
                onClick={handleAutoAssignCargos}
                className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-[10px] font-bold transition cursor-pointer"
                title="Calcular y asignar cargueros necesarios automáticamente según la carga programada"
              >
                Auto-Asignar Cargueros
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Carguera Pequeña */}
            <div className="p-3 bg-[#05070f] border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span>📦</span>
                  <span>Carguera Pequeña</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  En hangar: <strong className="text-white">{availSmallCargo}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={availSmallCargo}
                  value={smallCargoCount}
                  onChange={e => setSmallCargoCount(Math.min(availSmallCargo, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSmallCargoCount(availSmallCargo)}
                  className="px-2 py-1.5 bg-white/5 hover:bg-white/15 text-slate-300 text-[10px] rounded-lg border border-white/10 cursor-pointer"
                >
                  Máx
                </button>
              </div>
              <div className="text-[9px] text-slate-500">
                Capacidad: {fmt ? fmt(smallCargoCap) : smallCargoCap} uds/nave
              </div>
            </div>

            {/* Carguera Grande */}
            <div className="p-3 bg-[#05070f] border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span>🚚</span>
                  <span>Carguera Grande</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  En hangar: <strong className="text-white">{availLargeCargo}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={availLargeCargo}
                  value={largeCargoCount}
                  onChange={e => setLargeCargoCount(Math.min(availLargeCargo, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setLargeCargoCount(availLargeCargo)}
                  className="px-2 py-1.5 bg-white/5 hover:bg-white/15 text-slate-300 text-[10px] rounded-lg border border-white/10 cursor-pointer"
                >
                  Máx
                </button>
              </div>
              <div className="text-[9px] text-slate-500">
                Capacidad: {fmt ? fmt(largeCargoCap) : largeCargoCap} uds/nave
              </div>
            </div>

            {/* Cazador Ligero (Escolta) */}
            <div className="p-3 bg-[#05070f] border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span>✈️</span>
                  <span>Cazador Ligero</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  En hangar: <strong className="text-white">{availLightFighter}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={availLightFighter}
                  value={lightFighterCount}
                  onChange={e => setLightFighterCount(Math.min(availLightFighter, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setLightFighterCount(availLightFighter)}
                  className="px-2 py-1.5 bg-white/5 hover:bg-white/15 text-slate-300 text-[10px] rounded-lg border border-white/10 cursor-pointer"
                >
                  Máx
                </button>
              </div>
              <div className="text-[9px] text-slate-500">
                Escolta táctica contra incursiones
              </div>
            </div>

            {/* Cazador Pesado (Escolta) */}
            <div className="p-3 bg-[#05070f] border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span>🛩️</span>
                  <span>Cazador Pesado</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  En hangar: <strong className="text-white">{availHeavyFighter}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={availHeavyFighter}
                  value={heavyFighterCount}
                  onChange={e => setHeavyFighterCount(Math.min(availHeavyFighter, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setHeavyFighterCount(availHeavyFighter)}
                  className="px-2 py-1.5 bg-white/5 hover:bg-white/15 text-slate-300 text-[10px] rounded-lg border border-white/10 cursor-pointer"
                >
                  Máx
                </button>
              </div>
              <div className="text-[9px] text-slate-500">
                Blindaje pesado y fuego de cobertura
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-400 font-mono">
            {isTargetSameAsFrom ? (
              <span className="text-amber-400 font-bold">⚠️ El planeta de destino debe ser diferente al de origen.</span>
            ) : hasNoCargoShips ? (
              <span className="text-cyan-400">ℹ️ Puedes asignar naves de carga fijas o el sistema utilizará cargueros disponibles del hangar.</span>
            ) : (
              <span className="text-emerald-400">✓ Naves asignadas: {smallCargoCount} ligeras, {largeCargoCount} pesadas | Escolta: {lightFighterCount + heavyFighterCount} cazas</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCreateRoute}
            disabled={isButtonDisabled}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>➕</span>
            <span>Establecer Ruta Comercial Programada</span>
          </button>
        </div>
      </div>

      {/* Listado de Rutas Activas */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <span>📋</span>
          <span>Red Logística Activa ({activeRoutes.length})</span>
        </h4>

        {activeRoutes.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-black/30 border border-white/5 text-slate-500 text-xs font-mono">
            No hay rutas comerciales programadas. Configura una ruta en el panel superior para automatizar el trasvase de recursos entre tus mundos.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeRoutes.map(route => {
              const fromPlanet = state.planets.find(p => p.id === route.fromId);
              const toPlanet = route.toId ? state.planets.find(p => p.id === route.toId) : null;
              const toName = toPlanet?.name || `[${route.toGalaxy || 1}:${route.toSystem || 1}:${route.toPosition || 1}]`;

              return (
                <div
                  key={route.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    route.active
                      ? "bg-gradient-to-b from-[#131d2e]/90 to-[#090e18] border-cyan-500/40 shadow-md"
                      : "bg-[#090b14]/70 border-white/10 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                      <span>🪐 {fromPlanet?.name || "Colonia"}</span>
                      <span className="text-cyan-400">➔</span>
                      <span>🎯 {toName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dispatch({ type: "TOGGLE_TRADE_ROUTE", routeId: route.id })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition ${
                          route.active
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-slate-800 text-slate-400 border border-white/10"
                        }`}
                      >
                        {route.active ? "Activa" : "Pausada"}
                      </button>
                      <button
                        onClick={() => dispatch({ type: "REMOVE_TRADE_ROUTE", routeId: route.id })}
                        className="px-2 py-1 rounded-lg text-[10px] text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                        title="Eliminar ruta"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Detalles del flete */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                    <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                      <span className="text-slate-500 block text-[9px] uppercase">Envío de Ida:</span>
                      <span className="text-cyan-300 font-bold">
                        {resNames[route.resource] || route.resource}:{" "}
                        {route.mode === "fixed" ? `${fmt ? fmt(route.amount) : route.amount} uds` : `${Math.round((route.ratio || 0.5) * 100)}% excedente`}
                      </span>
                    </div>

                    <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                      <span className="text-slate-500 block text-[9px] uppercase">Carga de Retorno:</span>
                      <span className={route.returnResource && route.returnResource !== "none" ? "text-emerald-300 font-bold" : "text-slate-500 italic"}>
                        {route.returnResource && route.returnResource !== "none"
                          ? `${resNames[route.returnResource]} (${fmt ? fmt(route.returnAmount) : route.returnAmount})`
                          : "Sin retorno"}
                      </span>
                    </div>
                  </div>

                  {/* Naves Asignadas y Escolta */}
                  {route.assignedShips && (route.assignedShips.smallCargo > 0 || route.assignedShips.largeCargo > 0 || route.assignedShips.lightFighter > 0 || route.assignedShips.heavyFighter > 0) && (
                    <div className="mt-2 p-2 bg-[#050814] rounded-xl border border-white/5 flex flex-wrap items-center gap-3 text-[10px] font-mono">
                      <span className="text-amber-300 font-bold">Convoy Asignado:</span>
                      {route.assignedShips.smallCargo > 0 && (
                        <span className="text-slate-300">📦 {route.assignedShips.smallCargo} Pequeñas</span>
                      )}
                      {route.assignedShips.largeCargo > 0 && (
                        <span className="text-slate-300">🚚 {route.assignedShips.largeCargo} Grandes</span>
                      )}
                      {route.assignedShips.lightFighter > 0 && (
                        <span className="text-cyan-300">✈️ {route.assignedShips.lightFighter} Cazas Lig.</span>
                      )}
                      {route.assignedShips.heavyFighter > 0 && (
                        <span className="text-amber-300">🛩️ {route.assignedShips.heavyFighter} Cazas Pes.</span>
                      )}
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>🔁 Frecuencia: Cada {route.intervalDays || 1} ciclo(s)</span>
                    <span>📦 Entregas realizadas: <strong className="text-white">{route.deliveriesCount || 0}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
