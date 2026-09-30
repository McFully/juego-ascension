import React from "react";

/**
 * TradeRouteCreatorForm — Subcomponente modularizado para configurar y dar de alta nuevas rutas comerciales.
 * Extraído de TradeRoutesSection para reducir complejidad y tamaño de archivo.
 */
export const TradeRouteCreatorForm = React.memo(({
  state,
  currentPlanet,
  fromPlanetId,
  setFromPlanetId,
  toPlanetId,
  setToPlanetId,
  resource,
  setResource,
  mode,
  setMode,
  amount,
  setAmount,
  ratio,
  setRatio,
  intervalDays,
  setIntervalDays,
  loop,
  setLoop,
  returnResource,
  setReturnResource,
  returnAmount,
  setReturnAmount,
  smallCargoCount,
  setSmallCargoCount,
  largeCargoCount,
  setLargeCargoCount,
  lightFighterCount,
  setLightFighterCount,
  heavyFighterCount,
  setHeavyFighterCount,
  availSmallCargo,
  availLargeCargo,
  availLightFighter,
  availHeavyFighter,
  smallCargoCap,
  largeCargoCap,
  assignedCargoCapacity,
  targetSendAmount,
  handleAutoAssignCargos,
  handleCreateRoute,
  isButtonDisabled,
  isTargetSameAsFrom,
  hasNoCargoShips,
  activeRoutesCount,
  fmt
}) => {
  return (
    <div className="bg-[#0b1021]/80 border border-white/10 rounded-2xl p-4 md:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-2">
          <span>➕</span>
          <span>Programar Nueva Ruta Comercial Automatizada</span>
        </h4>
        <span className="text-slate-500 font-normal text-xs font-mono">
          Capacidad de red: {activeRoutesCount}/10 activas
        </span>
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

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase font-bold">Frecuencia de Despacho</label>
          <select
            value={intervalDays}
            onChange={e => setIntervalDays(parseInt(e.target.value) || 1)}
            className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            <option value="1">Cada 1 día imperial</option>
            <option value="2">Cada 2 días imperiales</option>
            <option value="3">Cada 3 días imperiales</option>
            <option value="7">Cada 7 días (Semanal)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase font-bold">5. Carga de Retorno (B ➔ A)</label>
          <select
            value={returnResource}
            onChange={e => setReturnResource(e.target.value)}
            className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            <option value="none">🚫 Sin retorno de carga</option>
            <option value="metal">⛏️ Metal</option>
            <option value="crystal">💎 Cristal</option>
            <option value="deuterium">⚗️ Deuterio</option>
          </select>
        </div>

        {returnResource !== "none" ? (
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Cantidad de Retorno</label>
            <input
              type="number"
              min="100"
              step="1000"
              value={returnAmount}
              onChange={e => setReturnAmount(Math.max(100, parseInt(e.target.value) || 0))}
              className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-emerald-300 font-bold text-xs focus:border-cyan-400 focus:outline-none"
            />
          </div>
        ) : (
          <div className="space-y-1 flex flex-col justify-end">
            <label className="flex items-center gap-2 px-3 py-2 bg-[#05070f] border border-white/15 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={loop}
                onChange={e => setLoop(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <span className="text-xs text-slate-300">Ruta Cíclica Infinita</span>
            </label>
          </div>
        )}
      </div>

      {/* SECCIÓN DE ASIGNACIÓN DE FLOTA */}
      <div className="pt-2 border-t border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span>🚀</span>
              <span>Asignación de Cargueros y Escoltas</span>
            </h5>
            <p className="text-[10px] text-slate-400 font-mono">
              Naves atracadas en el hangar de <strong>{selectedFromPlanet?.name}</strong> disponibles para esta ruta.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoAssignCargos}
              className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Calcular y asignar automáticamente los cargueros óptimos"
            >
              <span>⚡</span>
              <span>Auto-asignar Cargueros</span>
            </button>

            <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
              assignedCargoCapacity >= targetSendAmount
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-amber-950/40 border-amber-500/40 text-amber-300"
            }`}>
              <span>Bodega:</span>
              <span>{fmt ? fmt(assignedCargoCapacity) : assignedCargoCapacity}</span>
              <span className="text-[10px] text-slate-400 font-normal">/ {fmt ? fmt(targetSendAmount) : targetSendAmount} req</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Nave de Carga Pequeña */}
          <div className="p-3 bg-[#05070f] border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>📦</span>
                <span>Carga Pequeña</span>
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

          {/* Nave de Carga Grande */}
          <div className="p-3 bg-[#05070f] border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>🚛</span>
                <span>Carga Grande</span>
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

          {/* Cazador Pesado (Escolta Pesada) */}
          <div className="p-3 bg-[#05070f] border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>🛡️</span>
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
  );
});
