import React from 'react';

/**
 * SupplyRouteManifestEditor — Formulario y configurador bilateral de rutas de convoy (Patrician III).
 * Desacoplado de SupplyRoutesView para mantener una arquitectura modular y limpia.
 */
export const SupplyRouteManifestEditor = ({
  planets = [],
  fromId,
  setFromId,
  toId,
  setToId,
  isSameSystem,
  fromPlanet,
  toPlanet,
  outboundRes,
  setOutboundRes,
  outboundAmount,
  setOutboundAmount,
  minReserveOutbound,
  setMinReserveOutbound,
  returnMode,
  setReturnMode,
  returnRes,
  setReturnRes,
  returnAmount,
  setReturnAmount,
  assignedSmallCargo,
  setAssignedSmallCargo,
  assignedLargeCargo,
  setAssignedLargeCargo,
  assignedHeavyFreighter,
  setAssignedHeavyFreighter,
  assignedCargoTitan,
  setAssignedCargoTitan,
  maxSmall,
  maxLarge,
  maxHeavy,
  maxTitan,
  hasInterstellarSmallCargoWarning,
  totalConvoyCapacity,
  canCreateRoute,
  onCreateRoute
}) => {
  return (
    <div className="p-6 rounded-3xl bg-[#060a16]/95 border border-indigo-500/30 space-y-6 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span>🚚</span>
            <span>Ordenanzas de Convoy Comercial (Ida y Vuelta)</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Configura tramos de ida, aprovisionamiento de retorno, reservas de seguridad y asignación naval.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-black/60 border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-mono">
          <span className="text-slate-400">Bodega de Convoy:</span>
          <span className="font-bold text-cyan-300 font-mono">{totalConvoyCapacity.toLocaleString()} u.</span>
        </div>
      </div>

      {/* 1. Selección de Puertos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <label className="text-xs font-bold text-indigo-300 uppercase font-mono block">
            🛫 Puerto de Origen (Base del Convoy)
          </label>
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
          >
            {planets.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.galaxy}:{p.system}:{p.position}] {p.isHome ? '(Capital)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <label className="text-xs font-bold text-cyan-300 uppercase font-mono block">
            🛬 Puerto de Destino
          </label>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="w-full bg-[#05070f] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
          >
            {planets.filter(p => p.id !== fromId).map(p => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.galaxy}:{p.system}:{p.position}] {p.isHome ? '(Capital)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicador de Alcance */}
      <div className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
        isSameSystem
          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
          : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-300'
      }`}>
        <span>
          {isSameSystem
            ? '✅ Enlace Intra-Sistémico (Mismo sol): Válido para cargueros ligeros de combustión.'
            : '🌌 Enlace Interestelar / Galáctico: Requiere naves con propulsión de Impulso o Hiperespacio.'}
        </span>
        <span className="font-bold uppercase tracking-wider">{isSameSystem ? 'Alcance Local' : 'Salto Galáctico'}</span>
      </div>

      {/* 2. Manifiestos de Carga: Tramo de Ida y Tramo de Vuelta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tramo de Ida */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>📦 Tramo 1: Carga de Ida ({fromPlanet?.name} ➔ {toPlanet?.name})</span>
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Recurso a Cargar</label>
              <select
                value={outboundRes}
                onChange={(e) => setOutboundRes(e.target.value)}
                className="w-full bg-black/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="metal">⛏️ Metal</option>
                <option value="crystal">💎 Cristal</option>
                <option value="deuterium">⚗️ Deuterio</option>
                <option value="slag">🌋 Escoria (Slag)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Cantidad a Transportar</label>
              <input
                type="number"
                min="1000"
                step="5000"
                value={outboundAmount}
                onChange={(e) => setOutboundAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-black/70 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              🛡️ Reserva de Seguridad Local (No cargar si el stock baja de):
            </label>
            <input
              type="number"
              min="0"
              step="5000"
              value={minReserveOutbound}
              onChange={(e) => setMinReserveOutbound(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-black/70 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-amber-300"
            />
          </div>
        </div>

        {/* Tramo de Retorno */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>🔄 Tramo 2: Retorno ({toPlanet?.name} ➔ {fromPlanet?.name})</span>
          </h4>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Modo de Retorno</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReturnMode('ballast')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  returnMode === 'ballast'
                    ? 'bg-slate-700 border-white/30 text-white'
                    : 'bg-black/40 border-white/5 text-slate-400'
                }`}
              >
                ⚡ Retorno en Lastre (Vacío)
              </button>
              <button
                type="button"
                onClick={() => setReturnMode('cargo')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  returnMode === 'cargo'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-black/40 border-white/5 text-slate-400'
                }`}
              >
                📦 Retorno Cargado
              </button>
            </div>
          </div>

          {returnMode === 'cargo' && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Recurso de Retorno</label>
                <select
                  value={returnRes}
                  onChange={(e) => setReturnRes(e.target.value)}
                  className="w-full bg-black/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="crystal">💎 Cristal</option>
                  <option value="metal">⛏️ Metal</option>
                  <option value="deuterium">⚗️ Deuterio</option>
                  <option value="slag">🌋 Escoria (Slag)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Cantidad a Traer</label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={returnAmount}
                  onChange={(e) => setReturnAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-black/70 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Asignación de Naves al Convoy */}
      <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            ⚓ Flota Dedicada al Convoy
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            Hangar disponible en {fromPlanet?.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Carguera Pequeña */}
          <div className={`p-3 rounded-xl border ${
            hasInterstellarSmallCargoWarning
              ? 'bg-red-950/30 border-red-500/50'
              : 'bg-black/40 border-white/5'
          }`}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-200">📦 Carguera Pequeña</span>
              <span className="text-[10px] text-slate-400">Disp: {maxSmall}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={maxSmall}
                value={assignedSmallCargo}
                onChange={(e) => setAssignedSmallCargo(Math.min(maxSmall, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full bg-black/70 border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
              />
              <button
                type="button"
                onClick={() => setAssignedSmallCargo(maxSmall)}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[10px] rounded text-slate-300 font-mono"
              >
                Max
              </button>
            </div>
            {hasInterstellarSmallCargoWarning && (
              <p className="text-[10px] text-rose-400 mt-1.5 leading-tight font-mono">
                ⚠️ Motores suborbitales no aptos para salto interestelar.
              </p>
            )}
          </div>

          {/* Gran Carguero */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-200">🚛 Gran Carguero</span>
              <span className="text-[10px] text-slate-400">Disp: {maxLarge}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={maxLarge}
                value={assignedLargeCargo}
                onChange={(e) => setAssignedLargeCargo(Math.min(maxLarge, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full bg-black/70 border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
              />
              <button
                type="button"
                onClick={() => setAssignedLargeCargo(maxLarge)}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[10px] rounded text-slate-300 font-mono"
              >
                Max
              </button>
            </div>
          </div>

          {/* Mega-Carguero Pesado */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-200">🚢 Mega-Carguero Pesado</span>
              <span className="text-[10px] text-slate-400">Disp: {maxHeavy}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={maxHeavy}
                value={assignedHeavyFreighter}
                onChange={(e) => setAssignedHeavyFreighter(Math.min(maxHeavy, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full bg-black/70 border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
              />
              <button
                type="button"
                onClick={() => setAssignedHeavyFreighter(maxHeavy)}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[10px] rounded text-slate-300 font-mono"
              >
                Max
              </button>
            </div>
          </div>

          {/* Titán de Carga Estelar */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-200">🌌 Titán de Carga</span>
              <span className="text-[10px] text-slate-400">Disp: {maxTitan}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={maxTitan}
                value={assignedCargoTitan}
                onChange={(e) => setAssignedCargoTitan(Math.min(maxTitan, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full bg-black/70 border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
              />
              <button
                type="button"
                onClick={() => setAssignedCargoTitan(maxTitan)}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[10px] rounded text-slate-300 font-mono"
              >
                Max
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de Emisión de Ordenanza */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onCreateRoute}
          disabled={!canCreateRoute}
          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            canCreateRoute
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 active:scale-95'
              : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          <span>📜</span>
          <span>Sellar Ordenanza de Convoy Bilateral</span>
        </button>
      </div>
    </div>
  );
};
